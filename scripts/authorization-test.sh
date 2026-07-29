#!/usr/bin/env bash
#
# Runs supabase/tests/authorization.sql against a throwaway Postgres.
#
# CI and a developer at a laptop run the same script. The steps previously existed
# only as a block to copy from supabase/tests/README.md, which is how that block
# came to reference a `supabase/seed.sql` that does not exist: documentation can
# drift from the schema without anything failing. A script cannot.
#
# The security-test slide states that these policies are covered by a test that runs
# on every pull request. That was inaccurate until this script was added to
# .github/workflows/ci.yml, which previously ran Playwright only.
#
#   ./scripts/authorization-test.sh                  # spins up its own container
#   PGURL=postgres://… ./scripts/authorization-test.sh   # use a Postgres you have
set -euo pipefail

cd "$(dirname "$0")/.."

CONTAINER=vb201pg-authz
IMAGE=public.ecr.aws/supabase/postgres:15.8.1.060

if [[ -n "${PGURL:-}" ]]; then
  psql() { command psql "$PGURL" "$@"; }
else
  command -v docker >/dev/null || { echo "docker not found, and no PGURL set" >&2; exit 1; }

  cleanup() { docker rm -f "$CONTAINER" >/dev/null 2>&1 || true; }
  trap cleanup EXIT
  cleanup

  # The full Supabase stack needs Docker file sharing for this directory, which is
  # often not granted. These tests need only Postgres, so they skip it.
  docker run -d --name "$CONTAINER" -e POSTGRES_PASSWORD=pg -p 55432:5432 "$IMAGE" >/dev/null

  # Requires three consecutive successful queries, not one. This image runs initdb
  # and its bootstrap SQL, then restarts Postgres. `pg_isready` succeeds during that
  # first phase, so a single check allowed the migrations to start against a server
  # that was about to shut down. The run then failed part way through init.sql with
  # "terminating connection due to administrator command", which looks like a broken
  # migration.
  echo "waiting for postgres…"
  ok=0
  for _ in $(seq 1 90); do
    if docker exec "$CONTAINER" psql -U postgres -tAc 'select 1' >/dev/null 2>&1; then
      ok=$((ok + 1))
      [[ "$ok" -ge 3 ]] && break
    else
      ok=0
    fi
    sleep 2
  done
  [[ "$ok" -ge 3 ]] || { echo "postgres never came up" >&2; exit 1; }

  psql() { docker exec -i "$CONTAINER" psql -U postgres "$@"; }
fi

# Stand-ins for what Supabase supplies at runtime. auth.uid() reads a session
# setting here instead of a JWT, which is what lets one script act as two
# different attendees.
psql -v ON_ERROR_STOP=1 <<'SQL'
create schema if not exists extensions;
create schema if not exists auth;
do $$ begin
  if not exists (select 1 from pg_roles where rolname='anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname='authenticated') then create role authenticated nologin; end if;
end $$;
create table if not exists auth.users (id uuid primary key, email text);
create or replace function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('test.uid', true), '')::uuid;
$$;
SQL

# Every migration, in order. Applying only init.sql would test a schema that has
# not existed since the day it was written.
for m in supabase/migrations/*.sql; do
  echo "applying $m"
  psql -v ON_ERROR_STOP=1 < "$m"
done

# No ON_ERROR_STOP here. Check 6 passes by raising "permission denied for table
# polls": that error is the correct answer being withheld while the poll is open.
echo "--- authorization.sql ---"
OUT="$(psql < supabase/tests/authorization.sql 2>&1)"
echo "$OUT"

FAILED="$(grep -c '^ *FAIL' <<<"$OUT" || true)"
PASSED="$(grep -c '^ *PASS' <<<"$OUT" || true)"

echo
echo "PASS: $PASSED   FAIL: $FAILED"

if [[ "$FAILED" != "0" ]]; then
  echo "authorization tests failed" >&2
  exit 1
fi

# A run with no passing checks means the script never reached its assertions.
# Without this, that would be reported as success.
if [[ "$PASSED" -lt 13 ]]; then
  echo "expected at least 13 passing checks, saw $PASSED — did the script run at all?" >&2
  exit 1
fi

echo "authorization tests passed"
