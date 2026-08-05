# SECURITY.md

## What this app enforces

Nothing. There is no sign-in, no session, no server and no permission check anywhere in
the file. Anyone who can open it can read every row in it.

That is a deliberate choice for a one-screen tool running on synthetic CRM data. It
stops being defensible the moment either of those conditions changes.

## What the file contains

The whole 10,000-row extract, in plain text, inside the document. Anyone holding the
file holds the CRM data whether or not they open it in a browser. Emailing the file
publishes that data to the recipient. Hosting it at a public URL publishes it to
everyone who finds the URL.

There are no credentials in the file. It calls no API and needs no key. `env.example`
exists to show the form and currently lists nothing the app reads.

## Safe today

Opening it locally with the network off. Screen-sharing it. Sending it to people already
cleared for the underlying CRM data.

## Not safe

Hosting it at a public URL with real customer records baked in. Swapping the embedded
extract for a production export and leaving everything else the same.

## What would have to change first

Putting real records in this tool makes it a different tool with a different risk
profile, and the single file stops being a workable architecture:

- **The data moves behind a server.** A browser cannot keep a secret, so rows a user may
  not see cannot be shipped to their browser and hidden there.
- **Permissions are enforced in the database.** A rep sees their own territory because
  the database refuses every other row. Hiding a record on screen is not security.
- **A test proves a cross-territory read fails.** A policy that has never been tried
  against a request it should refuse has not been shown to work.
- **Someone's name is on it.** Fill in `ownership-card.md` from the kit.

Until then, handle this file the way you would handle the spreadsheet it came from.
