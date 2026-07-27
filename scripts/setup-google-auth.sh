#!/usr/bin/env bash
#
# Turn on Google sign-in, once the OAuth client exists.
#
# Creating that client is the one step in this whole setup that cannot be
# scripted: Google has no API and no gcloud command for creating an OAuth 2.0
# client for a web application. The console is the only path. Everything after
# it is here.
#
#   ./scripts/setup-google-auth.sh <client-id> <client-secret>
#
# The secret is passed as an argument and never written to a file. config.toml
# refers to it by environment variable, so the value lives only in this process
# and in Supabase.

set -euo pipefail

PROJECT_REF="nijlajnppqhqyskhodss"
GCP_PROJECT="ai-gtm-pavilion"
CALLBACK="https://${PROJECT_REF}.supabase.co/auth/v1/callback"

# Credentials come from 1Password by default, which is this repo's existing
# convention for anything secret — see .env.op. Nothing is typed into a shell,
# written to disk, or pasted into a transcript.
# Reference-safe title. An op:// reference rejects characters like "·",
# so the item is named for the reference, not for the eye.
OP_ITEM="op://Dev/google-oauth-vibecoding-201"
CRED_FILE=".google-oauth"

if [ $# -eq 0 ]; then
  # username / credential are the fields 1Password's API Credential category
  # actually shows in its editor, which is where the values end up in practice.
  if op read "$OP_ITEM/credential" >/dev/null 2>&1; then
    set -- "$(op read "$OP_ITEM/username")" "$(op read "$OP_ITEM/credential")"
  elif [ -f "$CRED_FILE" ]; then
    # shellcheck disable=SC1090
    . "$CRED_FILE"
    set -- "${GOOGLE_CLIENT_ID:-}" "${GOOGLE_CLIENT_SECRET:-}"
  fi
fi

# Treat the placeholders 1Password was seeded with as "not filled in yet",
# so the script prints instructions rather than a validation error about a
# value the user never typed.
case "${1:-}" in *"paste the"*) set -- "" "";; esac

if [ $# -ne 2 ] || [ -z "${1:-}" ] || [ -z "${2:-}" ]; then
  cat <<EOF

No credentials yet.

The 1Password item exists and is waiting for them:

  Dev  ->  google-oauth-vibecoding-201

     username    the OAuth client ID (…apps.googleusercontent.com)
     credential  the client secret

Fill those two fields in, then run this again with no arguments. It reads them
straight from 1Password, so the secret never reaches a shell, a file, or a
transcript.

  npm run setup:google

Before running this, create the OAuth client at:

  https://console.cloud.google.com/auth/clients?project=${GCP_PROJECT}

  Application type:            Web application
  Name:                        Vibecoding 201
  Authorised redirect URI:     ${CALLBACK}

That redirect URI must match exactly. It points at Supabase, not at the site —
Google returns to Supabase, and Supabase then returns to whichever page asked
for the sign-in. A URI pointing at the site itself is the usual reason this
fails with redirect_uri_mismatch.

Then set the app to **Production** on the Audience page:

  https://console.cloud.google.com/auth/audience?project=${GCP_PROJECT}
While it is in Testing, Google caps the app at 100 users and shows an
"unverified app" warning. With 150 attendees that cap is a real limit, not a
formality. Publishing takes effect immediately — with only the openid, email
and profile scopes there is no verification review to wait for.

EOF
  exit 1
fi

CLIENT_ID="$1"
CLIENT_SECRET="$2"

case "$CLIENT_ID" in
  *.apps.googleusercontent.com) ;;
  *) echo "That does not look like a Google client id (expected …apps.googleusercontent.com)"; exit 1 ;;
esac

# Flip the provider on for this push only. Committing `enabled = true` would
# mean an unset environment variable publishes the literal placeholder as the
# client id, which fails at Google's consent screen rather than simply leaving
# the button absent.
CONFIG="supabase/config.toml"
BACKUP="$(mktemp)"
cp "$CONFIG" "$BACKUP"
trap 'cp "$BACKUP" "$CONFIG"; rm -f "$BACKUP"' EXIT

perl -0pi -e 's/(\[auth\.external\.google\].*?\n)enabled = false/${1}enabled = true/s' "$CONFIG"

SUPABASE_AUTH_GOOGLE_CLIENT_ID="$CLIENT_ID" \
SUPABASE_AUTH_GOOGLE_SECRET="$CLIENT_SECRET" \
  supabase config push --project-ref "$PROJECT_REF"

echo
echo "Google sign-in is on. Check it end to end:"
echo "  open https://crossing-the-gap-site.vercel.app/signin"
echo
echo "Signing in with scott.e.ewalt@gmail.com also grants the presenter role —"
echo "admin_emails carries that address, and the new-user trigger reads it."

if [ -f "$CRED_FILE" ]; then
  dd if=/dev/urandom of="$CRED_FILE" bs=1024 count=1 conv=notrunc 2>/dev/null || true
  rm -f "$CRED_FILE"
  echo
  echo "Removed $CRED_FILE — the credentials live in Supabase now."
fi
