# Ownership card

Six lines that decide whether a tool survives the person who built it.

Fill this in before anyone else depends on the tool, while you still remember how it
works. Planning how a tool ends costs an afternoon. Skipping it is how a working tool
becomes somebody's unpaid second job.

Keep it in the repository as `OWNERSHIP.md` so it travels with the thing it describes.

---

## Card

**Tool:** ________________________________________________

**What it does, in one sentence:** ______________________________________

**Live at:** _____________________________________________

---

### 1. Named owner

A person, by name. Not a team, not a function.

**Name:** ______________________  **Email:** ______________________

Owns the content, the deploys, and the decision to keep or retire it.

---

### 2. Backup owner

The person who handles it when the owner is on holiday, ill, or gone.

**Name:** ______________________  **Email:** ______________________

Two rules. They have to have agreed, and they have to have real access. A backup owner
who cannot reach the dashboard cannot fix anything, and naming someone who never said
yes is worse than leaving this blank.

If nobody will take it, write **"None. Accepted single-owner risk because
[reason]."** That is a legitimate answer when the tool is low-stakes and the fallback
is manual. It has to be the written answer rather than the default one.

---

### 3. Rollback path

How to undo a bad release, written so someone else could do it under pressure.

**To undo the last release:** ____________________________________________

**How long it takes:** ___________________  **Who can do it:** ______________

**What rolling back does NOT undo:** ______________________________________

That last line catches people. Rolling back the code usually does not roll back a
database change, a sent email, or a record written to your CRM. Name what stays.

---

### 4. Known limitations

What it does not do, what it does badly, and what you already know is wrong. Written
down, this is credibility. Discovered by a colleague, it is a defect.

- ______________________________________________________________
- ______________________________________________________________
- ______________________________________________________________

Include the non-goals from your spec. "It does not predict renewal probability" belongs
here permanently, not just until someone asks.

---

### 5. Review date

A date in a calendar, not an intention.

**Next review:** ______________  **In whose calendar:** ______________

Two reviews answer different questions, and both are worth booking:

- **A health check.** Does it still work, is anyone still using it, has anything it
  depends on changed?
- **A keep-or-kill decision.** Is this still worth operating? A tool that proved its
  idea and is no longer used should be retired, and retiring it is a success.

---

### 6. Shutdown path

How this ends, decided now rather than during the week it becomes a problem.

**Who needs to be told:** ________________________________________________

**What data has to be exported first, and to where:** ______________________

**What replaces it, or what people do instead:** ___________________________

**Who turns it off:** ______________________

If the honest answer to "what replaces it" is "the spreadsheet they used before", write
that. It is a real answer, and it tells you what the tool was actually worth.

---

## Signed

**Owner:** ______________________  **Date:** ______________

**Backup owner:** ______________________  **Date:** ______________

A card nobody signed is a draft. Two names and two dates make it an agreement.
