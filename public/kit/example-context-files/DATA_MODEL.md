# DATA_MODEL.md

One table, read-only, held in memory. The app parses the embedded CSV into row objects
on load and never writes anything back. There is no database.

## The source

10,000 deals, 36 columns, extract dated 4 August 2026. Synthetic CRM data, deliberately
uncleaned. `Transaction_ID` is unique across every row and is the key. Closed history
stops 31 December 2025; open deals expect to close between April 2026 and February 2027.

The full column list with types and fill rates ships with the CRM data. What follows is
what the panels depend on, and the rule protecting each one.

| Column | Used by | The rule it carries |
|---|---|---|
| `Deal_Stage` | every panel | Won, lost and open are derived from this string once, at parse time. Nothing re-derives it later. |
| `Final_Amount` | revenue, realization | Post-discount. The only column ever reported as revenue. |
| `Total_Amount` | realization | Pre-discount. Never reported as revenue. |
| `Discount_Percent` | discount leakage | Stored as 0, 5, 10, 15 or 20. The parser decides once, from the observed maximum, whether the column is a percent or a fraction. |
| `Expected_Close_Date` | closing this month | Missing on 8.5% of rows. Those deals cannot appear in any forward-looking window, so they are counted in the health strip rather than dropped quietly. |
| `Last_Activity_Date` | went quiet | Missing on 2% of rows. Days untouched is null for those, never zero. |
| `Sales_Cycle_Days` | cycle length | Closed rows only. Reported as a median, because the range runs 14 to 240 days. |
| `Competitor` | where we lose | Closed rows only. Includes `No competitor`, `No-decision` and `Internal build`, which are outcomes rather than rivals. |
| `Loss_Reason_Main`, `Buyer_Reported_Reason_Main` | rep said vs buyer said | Two separate fields, populated independently. They disagree on a third of the losses that carry a buyer interview. |

## Columns parsed and deliberately unused

`Win_Probability` is a lookup off `Deal_Stage` with zero variance inside any stage.
`Company_Size` arrives as a band and is independent of `Customer_Segment` in this
extract. Both are read; neither drives a number.

## Rules that hold across the whole file

- **Match columns by name, case-insensitively.** Headers are Title_Case and column order
  is not fixed. Matching by position reads the wrong column and reports it confidently.
- **Columns describing how a deal ended are empty on open deals.** Their fill rates are
  the shape of the CRM data, not values waiting to be imputed.
- **Blank is not zero.** A missing date yields null, and the panel says so on screen.
- **Every aggregate prints its row count beside it.** A win rate built on 9 deals reads
  differently from one built on 900.
- **114 rows list the same company as buyer and seller.** Flagged in the health strip
  rather than left for someone to find mid-meeting.
- **Nothing in this app writes.** Any tool that imports this CRM data owns its own copy;
  nothing written downstream reaches the source file.
