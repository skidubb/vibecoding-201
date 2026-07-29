# Authorization tests

`authorization.sql` runs the deck's own security argument against this schema.
The security-test slide hands the room a test they can perform without an
engineer — sign in as one tenant, ask for another tenant's record, require the
request to fail — and this is that test, against the votes the room itself casts.

## Running it

```bash
./scripts/authorization-test.sh
```

That is also what CI runs on every pull request, which is what makes the
security-test slide's claim about this file true. Use `PGURL=postgres://…` to run
against a Postgres you already have.

The script does what the block below used to ask you to paste. It is kept here
because knowing the steps matters, but the script is the copy that is executed —
this prose had already drifted, and referred to a `supabase/seed.sql` that does
not exist. The full Supabase stack needs Docker file sharing for this directory,
which is often not granted; these tests need only Postgres, so they skip it:

```bash
docker run -d --name vb201pg -e POSTGRES_PASSWORD=pg -p 55432:5432 \
  public.ecr.aws/supabase/postgres:15.8.1.060

# Stand-ins for what Supabase supplies at runtime. auth.uid() reads a session
# setting here instead of a JWT, which is what lets one script act as two
# different attendees.
docker exec -i vb201pg psql -U postgres <<'SQL'
create schema if not exists extensions;
do $$ begin
  if not exists (select 1 from pg_roles where rolname='anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname='authenticated') then create role authenticated nologin; end if;
end $$;
create table if not exists auth.users (id uuid primary key, email text);
create or replace function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('test.uid', true), '')::uuid;
$$;
SQL

for m in supabase/migrations/*.sql; do
  docker exec -i vb201pg psql -U postgres -v ON_ERROR_STOP=1 < "$m"
done
docker exec -i vb201pg psql -U postgres < supabase/tests/authorization.sql
```

Every line should read `PASS`. Check 6 is the exception: it prints
`ERROR: permission denied for table polls`, and that error **is** the passing
result — it is the correct answer refusing to be read while the poll is open.

## What running it found

Both of these looked correct on the page and in review, and only failed when
executed:

**The presenter could not surface any submission.** Postgres applies `SELECT`
policies to the rows an `UPDATE` reads, and no select policy matched a
submission that had not yet been surfaced. The update silently affected zero
rows — no error, no effect, which is precisely the quiet failure the class
exists to argue against. The fix pairs a select policy with the update policy,
and both require the author to have shared the work first. A private submission
is now not merely un-publishable by the presenter; it is invisible to them.

**The migration depended on privileges it never granted.** Supabase grants new
public tables to `anon` and `authenticated` by default, so the schema appeared
to work inside the project it was written in. Rebuilt anywhere else, every
policy returned "permission denied" for reasons no policy explained. Grants are
now explicit in the migration.
