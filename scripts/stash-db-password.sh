#!/usr/bin/env bash
#
# Move the Supabase database password into 1Password and delete it from disk.
#
# It was generated locally, written to `.supabase-db-password`, and never
# printed — not to a terminal, not into a transcript. That file is gitignored,
# but "gitignored" is not "safe": it sits in plain text in a directory that gets
# backed up, synced and searched. This moves it somewhere that is actually a
# secret store and removes the copy.
#
#   op signin            # this is interactive; run it first
#   ./scripts/stash-db-password.sh
#
# The value is piped straight from the file into `op` and never echoed.

set -euo pipefail

FILE=".supabase-db-password"
VAULT="${OP_VAULT:-Dev}"
TITLE="Supabase · vibecoding-201 · database password"
PROJECT_REF="nijlajnppqhqyskhodss"

[ -f "$FILE" ] || { echo "No $FILE — already moved, or never created."; exit 0; }

if ! op whoami >/dev/null 2>&1; then
  cat <<'EOF'
1Password is not signed in.

Run this yourself — it needs a prompt this script cannot give it:

  op signin

Then run this script again.
EOF
  exit 1
fi

if op item get "$TITLE" --vault "$VAULT" >/dev/null 2>&1; then
  echo "Already in 1Password: $VAULT / $TITLE"
else
  op item create \
    --category "Database" \
    --vault "$VAULT" \
    --title "$TITLE" \
    "type=postgresql" \
    "server=db.${PROJECT_REF}.supabase.co" \
    "port=5432" \
    "database=postgres" \
    "username=postgres" \
    "password=$(cat "$FILE")" \
    "notes=Generated for the Vibecoding 201 companion site. Used by supabase db push and by the psql smoke checks. The app itself never uses it — it authenticates with the publishable key under row-level security." \
    >/dev/null
  echo "Stored in 1Password: $VAULT / $TITLE"
fi

# Overwrite before unlinking, so the bytes are not merely unreferenced.
dd if=/dev/urandom of="$FILE" bs=1024 count=1 conv=notrunc 2>/dev/null || true
rm -f "$FILE"
echo "Removed $FILE from disk."

echo
echo "Verify it round-trips:"
echo "  op read \"op://$VAULT/$TITLE/password\" | head -c 4"
