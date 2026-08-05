# Free APIs for GTM tools

Endpoints that cost nothing to start against, each with what a GTM team would build on
it and the limit that matters. Every entry was verified with a live call on
**5 August 2026**. Free tiers in this category change monthly; if a call fails, check
the linked docs before assuming you did something wrong.

## No key required

| API | Build with it | The line to respect |
| --- | --- | --- |
| [SEC EDGAR](https://www.sec.gov/search-filings/edgar-application-programming-interfaces) | Diff 10-K risk-factor language year over year across every public account in a territory — budget-cycle and vendor-consolidation signals | A descriptive `User-Agent` header (your org + contact email) is mandatory — without it every call returns 403. 10 requests/second total |
| [USAspending.gov](https://api.usaspending.gov/) | Pull every federal award in your ICP's NAICS codes and rank agencies by spend — a public-sector target list with real budget attached | No published cap |
| [Hacker News search](https://hn.algolia.com/api) | Monitor Show HN and comment threads for category and competitor mentions before they reach review sites | No published cap |
| [Google News RSS](https://news.google.com/rss/search?q=example) | Funding-round and leadership-change triggers, production-safe: `news.google.com/rss/search?q=<query>` returns plain RSS | None stated — it is an RSS feed, not an API contract |
| [GitHub REST](https://docs.github.com/en/rest) | Repo activity and release cadence as a technographic buying signal | 60 requests/hour anonymous; 5,000/hour with a free personal token |
| [Nominatim](https://operations.osmfoundation.org/policies/nominatim/) | Geocode messy CRM addresses for territory mapping and dedupe | One request per second, absolute, with a custom `User-Agent` — the usage policy is explicit and enforced |
| [Frankfurter](https://frankfurter.dev) | Normalize a multi-currency pipeline to one currency before the forecast rollup | No caps. The old frankfurter.app host redirects; use frankfurter.dev |

## Free key required

| API | Build with it | The free tier |
| --- | --- | --- |
| [Apify](https://docs.apify.com/api/v2) | Run the Google Maps or LinkedIn actor nightly over a target-account list and read the results as a dataset | $5 of platform usage per month; credits do not roll over |
| [Hunter.io](https://hunter.io/api-documentation) | Domain search for the email pattern and named contacts before sequencing | 50 credits per month; a verification costs half a credit |
| [Logo.dev](https://www.logo.dev/docs) | Company logo by domain in a pipeline dashboard — one image tag | 500,000 images per month with attribution. This is the replacement for Clearbit's logo API, which is dead |
| [Companies House UK](https://developer.company-information.service.gov.uk/) | Verify a UK legal entity, registered address, and officers against CRM records | 600 requests per rolling five minutes |
| [Census Data API](https://www.census.gov/data/developers/) | Territory sizing from County Business Patterns establishment counts by NAICS | A key is now required for every query — the old keyless allowance is gone. 50 variables per query |
| [FRED](https://fred.stlouisfed.org/docs/api/fred/) | Overlay macro series on pipeline conversion, so macro drag and rep performance stop being one number | 120 requests per minute |
| [People Data Labs](https://docs.peopledatalabs.com/) | Enrich inbound leads with title and seniority to auto-route them | 100 records per month, core fields only — no email or phone |
| [Google Sheets API](https://developers.google.com/workspace/sheets/api/limits) | Push a nightly scored account list into the sheet sales already lives in — a UI you did not have to build | 300 reads per minute per project. Google has said over-quota use will start billing later in 2026 |
| [NewsAPI](https://newsapi.org/docs) | News triggers during development | 100 requests per day, articles delayed 24 hours, and the free plan is contractually development-only — ship with Google News RSS instead |

## Gone, or no longer free

- **Clearbit Logo API is dead.** Sunset December 2025; the hostname no longer resolves
  at all. Any tool still pointing at `logo.clearbit.com` is showing broken images.
  Logo.dev is the replacement its own shutdown notice names.
- **Crunchbase** no longer offers its free Basic API to new keys.
- **OpenCorporates** has no free tier; the cheapest self-serve plan is hundreds of
  pounds a month.
- **exchangerate.host** now requires a paid access key. Frankfurter covers the same
  job with no key.

## The habit these share

Start read-only, put the rate limit in your code before the first run, and keep the
identifying `User-Agent` honest. An API that costs nothing still has an owner, and the
tools that keep working are the ones that respect the line printed next to the URL.
