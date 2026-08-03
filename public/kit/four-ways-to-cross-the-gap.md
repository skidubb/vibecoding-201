# Four ways to cross the Gap

*Verified August 2026. This market moves quarterly; check the date before trusting a row.*

The nine checks apply on every path. What changes is who covers each one: the platform, you, or a vendor. Pick the path by who you want doing which work.

## Path 1. Stay in the platform you prototyped in

Replit and Lovable carry a prototype to a multi-user tool without leaving the tab. Hosting, sign-in, a real database, file storage, and publish-time security scanning come with the platform. Replit's agent tests the app in a real browser and fixes what it finds. Lovable Cloud attaches storage and auth to every app by default.

**Problem it solves:** the assembly problem. You get the production plumbing without choosing, wiring, or paying for the pieces separately.

**Still yours:** the authorization rules themselves, because a scanner checks configuration and cannot know which user should see which account. Verification as a user. Watching it run, since error monitoring is thin to absent here. Cost control under usage pricing. The owner.

**Fits:** a first tool, one team, internal data, speed over control. Prototyper crossing into Builder.

## Path 2. Assemble the stack

The class stack: a coding agent, GitHub, Vercel, Supabase, Clerk. Each layer is a product you can see, swap, test, and read the logs of. The repo is yours, the six harness files live in it, and promotion to production is an explicit step a person takes.

**Problem it solves:** the control problem. Every check is visible and inspectable, nothing is bundled out of sight, and the skills transfer when any one layer changes.

**Still yours:** the assembly. More decisions land up front, and every check is explicitly your job until you delegate it to a layer you chose.

**Fits:** a tool a team depends on, real customer data, and anyone building the judgment this class teaches. Builder and Grower.

## Path 3. Use the platform your company already runs

Microsoft, Google, or AWS, whichever one holds your company's identity and data. Copilot Studio and Workspace Studio build agents inside the tools your company already licenses. Kiro and the coding agents serve the engineering team you partner with. Your tool inherits sign-on, permissions, compliance, and data boundaries that someone else already paid to build.

**Problem it solves:** the governance problem. Identity, access, residency, and audit exist before you write a line, which is the expensive part of every other path.

**Still yours:** integration lead time and a partner. The business-user products here are new and several carry preview labels; the strong products assume an engineer in the loop.

**Fits:** regulated data, systems that cross teams, an IT department that acts as a partner. Sweeper and Maintainer territory.

## Path 4. Buy it

A vendor whose whole business is your workflow. Uptime, security, and maintenance are their payroll, and the contract is the enforcement.

**Problem it solves:** the ownership problem, for workflows common enough that owning a custom tool adds risk without adding edge.

**Still yours:** the acceptance test and an internal owner of the vendor relationship.

**Fits:** any workflow that is not your edge. The "worth building?" gate from class already routes here.

## The nine checks, by path

| Check | In-platform | Assembled stack | Company platform | Bought |
|---|---|---|---|---|
| 1. Persistent data | Platform | You wire it | Platform | Vendor |
| 2. Sign-in | Platform | You wire it | Company identity | Vendor |
| 3. Enforced authorization | You write the rules; the scan catches config gaps | You write the rules, in your repo, under test | Company roles help; the mapping is yours | Vendor, and the contract should say so |
| 4. Server-side secrets | Platform vault | Your discipline | Platform | Vendor |
| 5. Tested critical workflow | Agent self-tests; final verification yours | Tests in your repo, run on every change | Thin on the business-user products | Vendor QA; acceptance test yours |
| 6. Visible error states | Partial | You build them | Varies by product | Vendor |
| 7. Logs and analytics | Varies by platform | Platform logs plus what you add | Strong | Vendor dashboards |
| 8. Preview before production | Publish step | Explicit promote step | Change management exists | Vendor releases |
| 9. A named owner | You | You | You | You, holding the contract |

## Five questions that pick the path

1. How sensitive is the data if the wrong person reads it?
2. Where does identity have to live for this tool to be allowed to exist?
3. Who maintains it in month 6, and what tools do they already know?
4. How long should it live?
5. Is this workflow one your company competes on?

Edge plus sensitive data points to Path 2 or 3. Speed plus internal data points to Path 1. A common workflow with no edge points to Path 4.

## The six stages, whatever the path

Every path runs the same lifecycle. What changes is who covers each stage, never whether it happens. On any path, a stage is done when its artifact exists and its exit check passes.

| Stage | Artifact | Exit check | Owner |
|---|---|---|---|
| Spec | Acceptance specification: job, user, checkable Done | Another person can determine whether it is done | You |
| Plan | Reviewed implementation proposal | Assumptions, access, risks, and tests are explicit | You approve; the agent drafts |
| Build | Working preview | The specified workflow exists end to end | The agent, inside your rules |
| Test | Verification evidence | Success and failure cases pass, repeatably | The agent runs; you verify as a user |
| Ship | Promoted release | An accountable person approved it and rollback is ready | You |
| Run | Operated service: logs, alerts, review date, shutdown path | Failures reach someone able to respond | The named owner |
