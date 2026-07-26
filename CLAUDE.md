@AGENTS.md
@README.md

# Working in this repo

The README above is the source of truth for architecture and commands. These are the
operational rules that don't belong in it.

- **`AGENTS.md` is generated.** Never hand-edit between the `BEGIN/END:nextjs-agent-rules`
  markers — a tool regenerates that block and will clobber anything added there. Durable
  rules go in the README, or here.
- **There is no test or lint script.** `npm run build` is the verification gate; it runs
  TypeScript, so a type error fails the build. Never claim a change works without running it.
- **Secrets resolve through 1Password, never inline.** `.env.op` holds `op://` pointers only
  and is intentionally committed. Anything needing a real key goes through
  `op run --env-file=.env.op -- …` (see `npm run gen:media`), which requires `op signin`.
- **Deploy target** is the Vercel project `crossing-the-gap-site`
  (`.vercel/project.json`). Confirm before deploying — do not infer the target from the
  directory name.
- **Raw renders in `../images/` and `scripts/.generated/` stay out of git.** Commit the
  compressed derivatives in `src/assets/` and `public/media/` that the build consumes.
