# ARCHITECTURE.md

One file: `monday-gtm-dashboard-standalone.html`, 2.7 MB, no dependencies, no build.
Double-click it and it runs. Every decision below serves that.

## The decisions

**One HTML file.** Markup, styles, CRM data and logic live in a single document. It can
be handed to a GTM leader over email or Slack and opened. Nothing to install, nothing
that expires, nothing that needs their laptop configured.

**The data is inside the file.** The extract sits in a
`<script type="text/plain" id="inlinedata">` block, which the browser never executes and
never fetches. The app reads that block on load and only falls through to fetching a CSV
over the network when the block is absent. It has been verified running with all network
traffic blocked. The cost is stated plainly: the file is 2.7 MB because the CRM data
rides inside it.

**No server.** No backend means no host to pay for, no credentials to rotate, and no
endpoint that can be down at 8:55am. It also means no accounts and no writes. See
`SECURITY.md`.

**No build step.** No bundler, no transpiler, no package manager. The file that is
edited is the file that opens, so the diff under review is the artifact that ships.

**No framework.** Plain DOM and hand-written SVG. A screen this size does not need a
render loop, and a file with no dependencies still opens years from now.

**Filters live in the URL.** Copying the address bar copies the view, which is how one
slice gets pasted into a thread mid-meeting.

## How the file is laid out

The script is a numbered sequence: config, CSV parser, column resolution, value
coercion, metric definitions, formatters, state, load, verification queries, filtering,
then one render function per panel. Read in order, nothing is used before it is defined.

**Metric definitions live in one module (`const M`).** Win rate, revenue, realization,
days untouched and cycle length are written once and every panel calls them. Redefining
one at a call site is what makes two panels disagree in front of a room.

**Verification runs on every load.** The checks that prove the numbers run against all
10,000 rows when the page opens, and their results sit permanently on screen in the
health strip at the bottom.

**Columns resolve by name, case-insensitively, never by position.** The CRM file's
headers are Title_Case and its column order is not guaranteed. Matching case-sensitively
finds nothing and produces zero rows on a screen that otherwise looks finished.
