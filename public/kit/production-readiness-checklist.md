# The Bar

A production standard, and how to check each item yourself.

Nine items. If a tool misses one of these, it is not ready for people to depend on it.
Every check below is one you can run without an engineer. Run them against the live
tool, not against a description of it, and not against what the agent told you it
built. A model reporting that all tests pass is a status report. Verification is you
watching it work.

Score it honestly. An eight out of nine you can name is worth more than a nine you
cannot demonstrate.

---

### 1. Persistent data

Real records survive a refresh, a new session, and someone else's browser.

**Your check.** Change something, close the tab, reopen the tool, and confirm the
change is still there. Then have a colleague open it on their machine and confirm they
see the same value.

**Fails when.** The data resets, or your colleague sees different numbers from yours.

---

### 2. Sign-in

There is a way to know who a user is.

**Your check.** Open the tool in a private browsing window. You should be asked to sign
in and should not be able to reach real records without doing so.

**Fails when.** The private window shows you the data.

---

### 3. Enforced authorization

Knowing who someone is and deciding what they may see are different jobs. The second
one is enforced in the database, not in the interface. Hiding records on screen is not
security.

**Your check.** This is the one security test a GTM leader can run alone. Sign in as
one organization or one user, then try to open a record belonging to another. Change
the account ID in the address bar if you have to. **The request must fail.**

**Fails when.** It succeeds. That is not an access-control bug. It is a data breach
with a login screen in front of it.

---

### 4. Server-side secrets

API keys and passwords live on the server, never in the browser and never in the
repository.

**Your check.** Ask the agent: "List every secret this project uses and where each one
is read from. Confirm none of them are readable in browser code or committed to the
repository." Then search the repository for the first six characters of one real key
and confirm nothing comes back.

**Fails when.** A key appears in committed files or in anything the browser downloads.
An exposed secret is not a mistake to hide. It has to be revoked and rotated.

---

### 5. A tested critical workflow

The one path that matters has an automated test, and the test has been seen failing.

**Your check.** Ask the agent to run the tests in front of you, then ask it to
deliberately break the feature and run them again. If they still pass, they were never
testing that feature.

**Fails when.** Nobody can show you the test failing against broken code.

---

### 6. Visible error states

When something goes wrong, the person using the tool can tell. A tool that fails
loudly is safer than one that fails quietly.

**Your check.** Break the upstream on purpose. Disconnect the integration, revoke the
key, or ask the agent to simulate the failure. Then look at the screen as a normal
user. You should see that something is wrong and roughly what.

**Fails when.** The screen looks completely normal and the numbers are simply stale.
Failed refreshes that look successful are the expensive kind.

---

### 7. Logs and analytics

Three different kinds of evidence, and most tools have none of them. Analytics answers
whether the thing is creating value. Logs answer what happened in one specific run.
Alerts answer who needs to intervene, and a log entry on its own is not an alert.

**Your check.** Ask: "Show me the log of the last run, and the last five events users
generated." You should get specific records with timestamps, not a description of what
would be logged.

**Fails when.** The answer is about what could be logged rather than what was.

---

### 8. Preview before production

Changes are proved on a real URL that only you and your reviewer can see, then
promoted deliberately. Promotion is a decision someone makes, never a side effect of
saving a file.

**Your check.** Ask for the preview URL of the most recent change. Open it. Confirm it
is a different address from the live one.

**Fails when.** There is only one URL, and it is the one your colleagues use.

---

### 9. A named owner

A person, by name, who owns the tool. A tool only one person understands does not have
an owner. It has a hostage.

**Your check.** Say the name out loud. Then ask that person what the rollback path is
and when the next review date falls. Use `ownership-card.md`.

**Fails when.** The answer is a team name, or the owner cannot say how to undo a bad
release.

---

## The scorecard

| # | Item | Pass | Evidence you can point to |
| --- | --- | --- | --- |
| 1 | Persistent data | ☐ | |
| 2 | Sign-in | ☐ | |
| 3 | Enforced authorization | ☐ | |
| 4 | Server-side secrets | ☐ | |
| 5 | A tested critical workflow | ☐ | |
| 6 | Visible error states | ☐ | |
| 7 | Logs and analytics | ☐ | |
| 8 | Preview before production | ☐ | |
| 9 | A named owner | ☐ | |

The evidence column is the point. A tick with nothing beside it is an opinion.

## Before anything goes outside the company

Everything above, plus a review by someone who did not build it. External-facing tools
carry your company's name and your customers' data. The proportionate first move for
anything customer-visible is to hold, not to ship and watch.
