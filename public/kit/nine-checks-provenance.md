# Where the nine checks come from

Provenance for the production-readiness list used in Vibecoding 201. Every link below was
opened and read on 6 August 2026. Anything I could not verify is marked.

**What this list is.** The grouping of nine is Scott Ewalt's, assembled for a GTM audience.
It is not published by any standards body and no external document contains these nine items
as a set. Eight of the nine trace to established frameworks, which are cited per row below.

**Why it is a composite.** No single framework covers the ground. OWASP covers security and
says nothing about data, logs, deploys, or ownership. The Twelve-Factor App covers deployment
hygiene for SaaS and says nothing about security, testing, or ownership. Google's SRE launch
checklist assumes an engineering org with an on-call rotation already exists. None of the
three was written for someone shipping a tool that a team depends on with no engineers behind
them. That gap is what the nine fills.

**How strong each citation is.** Rows are marked below. A *direct* citation means the source
states the requirement. A *supporting* citation means the source establishes the underlying
principle and the row is an application of it.

---

## The nine, with sources

### 1. Persistent data

**Source:** The Twelve-Factor App, factors 6 and 4. *Supporting.*
**Link:** https://12factor.net/

Factor 6 says "execute the app as one or more stateless processes" and that apps should not
rely on stored session state. Factor 4 says "treat backing services as attached resources,"
meaning the database is a resource the app connects to rather than something living inside
it. A dashboard reading a CSV that ships with the code violates both.

### 2. Sign-in

**Source:** OWASP Application Security Verification Standard, version 5.0.0. *Direct.*
**Link:** https://owasp.org/www-project-application-security-verification-standard/

ASVS is "a framework of security requirements that focus on defining the security controls
required when designing, developing and testing modern web applications and web services."
Authentication is one of its core requirement families. ASVS is an OWASP Flagship Project,
used by CREST for accrediting application security testing services and by the App Defense
Alliance for its Web App Profile. Version 5.0.0 was released 30 May 2025.

### 3. Enforced authorization

**Source:** OWASP Top 10, category A01, Broken Access Control. *Direct.*
**Link:** https://owasp.org/Top10/2025/A01_2025-Broken_Access_Control/

Broken Access Control ranks first in both the 2021 and the 2025 edition of the OWASP Top 10.
This is the strongest single citation on your list, and it is also the row that separates
sign-in from authorization, which is the distinction most vibe-coded tools get wrong.

The full 2025 list: https://owasp.org/Top10/2025/

### 4. Server-side secrets

**Source:** The Twelve-Factor App, factor 3. *Direct.*
**Link:** https://12factor.net/config

Factor 3 is "store config in the environment," keeping credentials and settings out of the
codebase. This is the origin of the `.env` convention you taught in the harness section, and
it is one of only two rows where Twelve-Factor is the actual source rather than the
underlying principle.

Broader coverage sits in NIST SP 800-218, the Secure Software Development Framework, a US
government framework for secure development practices. I confirmed it exists and its scope,
and did not map individual practices to your rows.
**Link:** https://www.cisa.gov/resources-tools/resources/nist-sp-800-218-secure-software-development-framework-v11-recommendations-mitigating-risk-software

### 5. Tested critical workflow

**Source:** DORA, test automation capability. *Direct.*
**Link:** https://dora.dev/capabilities/test-automation/

DORA is Google Cloud's DevOps Research and Assessment program. Its test automation page
says "the key to building quality into software is getting fast feedback on the impact of
changes throughout the software delivery lifecycle," and links automated testing to improved
software stability, reduced burnout, and lower deployment pain. It puts responsibility for
the automated test suite on the developers who wrote the code.

This row has no single canonical document the way rows 3 and 4 do. DORA is the best
available citation because it is research-backed rather than opinion.

### 6. Visible error states

**Source:** Google's SRE launch checklist, backend resilience and dependencies. *Supporting.*
**Link:** https://sre.google/sre-book/launch-checklist/

The checklist covers "detection and handling when dependent services fail" and graceful
degradation strategies for third-party systems. Your phrasing is the user-facing half of
that: what the person looking at the screen sees when an upstream breaks.

This row is your framing of an established concept rather than a named standard. Say so if
asked.

### 7. Logs and analytics

**Source:** The Twelve-Factor App factor 11, plus Google's SRE launch checklist, monitoring.
*Direct.*
**Links:** https://12factor.net/logs and https://sre.google/sre-book/launch-checklist/

Factor 11 is "treat logs as event streams," meaning the app writes to standard output and
something else aggregates. The SRE checklist's monitoring section covers "monitoring internal
state, monitoring end-to-end behavior, managing alerts," which is the analytics half.

Caveat worth knowing: factor 11 predates the now-standard framing of observability as logs,
metrics, and traces together. It names only the first of the three. Lead with the SRE
checklist if someone technical is in the room.

### 8. Preview before production

**Source:** Google's SRE launch checklist, deployment. *Direct.* Twelve-Factor 10 and 5 are
*supporting.*
**Links:** https://sre.google/sre-book/launch-checklist/ and https://12factor.net/dev-prod-parity

Factor 10 is dev/prod parity, keeping development, staging, and production as similar as
possible. Factor 5 requires strict separation of build, release, and run. The SRE checklist's
deployment section covers "release process, repeatable builds, canaries under live traffic,
staged rollouts." Your Vercel preview deployment is the modern implementation of all three.

### 9. Named owner

**Sources:** GitLab's Production Readiness Review; the Backstage software catalog. *Direct.*
**Links:** https://handbook.gitlab.com/handbook/engineering/infrastructure/production/readiness
and https://backstage.io/docs/features/software-catalog/descriptor-format/

GitLab's public readiness review names Service Owners as a required stakeholder alongside
Security and Infrastructure, and gates services on "enough documentation, observability, and
reliability" to run at production scale. Backstage, Spotify's open-source developer portal,
carries an owner on catalog entities. I could not confirm from the Backstage docs whether
`spec.owner` is strictly required for a Component, so do not claim that it is.

The phrase "you build it, you run it" comes from Werner Vogels in a 2006 ACM Queue
interview. ACM blocked automated access, so I could not verify the exact wording. Attribute
the idea, not a quote, unless you pull the original yourself.

**This is the row worth talking about.** Google's launch checklist covers architecture,
infrastructure, capacity planning, failure modes, backend resilience, monitoring, security,
deployment, and dependencies, and says nothing about who owns the service. Ownership is
assumed inside an engineering org. It is exactly what is missing when a RevOps analyst ships
a dashboard their team starts depending on. That is the argument for the ninth row, and it
is stronger than a citation.

---

## How much weight Twelve-Factor can hold

It has no standards body, no governance, no versioning, and no committee. It is a document
published by Heroku engineers in 2011 describing what their platform required of an app. It
became the default vocabulary because Heroku won, and then Docker and Kubernetes assumed the
same properties. That is adoption, not authority.

It has aged in specific places. Factor 2's guidance on dependencies predates containers.
Factor 7, port binding, does not apply to event-driven systems such as AWS Lambda. Factor 11
names logs without metrics or traces, which is one of the three pillars of observability
rather than all three. A thoughtful thirteen-year retrospective is at
https://dev.to/tbeijen/12-factor-13-years-later-4k3o

It also has nothing to say about security, testing, data, or ownership. It is a deployment
hygiene document for SaaS running on a platform. It was never a production-readiness bar.

**Use it for two rows and no more.** Factor 3 for secrets and factor 11 for logs, where it
is the literal origin of the conventions your audience already uses. On rows 1 and 8 it
supports the principle while the SRE checklist carries the citation.

## The precedent for building your own list

**12-Factor Agents**, by Dex Horthy at HumanLayer, over 24,000 stars on GitHub. Twelve
principles for building reliable LLM applications: own your prompts, own your context window,
tools are just structured outputs, small focused agents, make your agent a stateless reducer,
and so on. The repo says it is written "in the spirit of 12 Factor Apps."
**Link:** https://github.com/humanlayer/12-factor-agents

It has no standards body either. It borrowed a naming convention, applied it to a new domain,
and the community adopted it on the merits. Nobody asks Horthy for his provenance. This is
the same move you made, and it is a legitimate one.

The difference is labeling. He calls them factors and says whose they are. Calling yours
"standards" claims a body behind it that does not exist, which is exactly what prompted the
question in class.

This repo is also worth reading on its own for a 201 audience, and it may be a better
citation for the class than the original Twelve-Factor App.

---

## The frameworks, in one line each

| Framework | What it is | Link |
|---|---|---|
| The Twelve-Factor App | Twelve rules for deploying SaaS cleanly, published by Heroku engineers in 2011. Widely adopted, no governing body, dated in places. Carries two of your rows | https://12factor.net/ |
| 12-Factor Agents | Twelve principles for reliable LLM applications, by Dex Horthy at HumanLayer. Precedent for naming and owning your own list | https://github.com/humanlayer/12-factor-agents |
| OWASP ASVS 5.0.0 | Security requirements for designing, developing, and testing web applications. OWASP Flagship Project, used by CREST and the App Defense Alliance | https://owasp.org/www-project-application-security-verification-standard/ |
| OWASP Top 10 (2025) | The ten most critical web application security risks, refreshed roughly every four years. Broken Access Control has held first place since 2021 | https://owasp.org/Top10/2025/ |
| Google SRE launch checklist | Google's Launch Coordination Engineering checklist, covering nine areas from architecture through dependencies | https://sre.google/sre-book/launch-checklist/ |
| DORA | Google Cloud's DevOps Research and Assessment program, a research-backed catalog of delivery capabilities | https://dora.dev/capabilities/ |
| GitLab Production Readiness Review | A real company's public gate for shipping a service, useful because the process is documented in the open | https://handbook.gitlab.com/handbook/engineering/infrastructure/production/readiness |
| Backstage software catalog | Spotify's open-source developer portal, where every service entity carries an owner | https://backstage.io/docs/features/software-catalog/descriptor-format/ |
| NIST SP 800-218 (SSDF) | US government framework of secure software development practices | https://www.cisa.gov/resources-tools/resources/nist-sp-800-218-secure-software-development-framework-v11-recommendations-mitigating-risk-software |

---

## Draft reply to Walter Pape

> Walter, good question and I owe you a straight answer. The nine as a list is mine. I built
> it for this audience. Every item on it traces to something established: rows on data,
> secrets, logs, and preview come from the Twelve-Factor App; sign-in and authorization come
> from OWASP, where broken access control has ranked as the number one web application risk
> since 2021; testing maps to DORA; error states map to graceful degradation in Google's SRE
> launch checklist.
>
> The ninth row, named owner, is the interesting one. Google's launch checklist covers nine
> technical areas and never mentions who owns the service, because inside an engineering org
> that is assumed. It is exactly what is missing when someone in RevOps ships a dashboard
> their team starts depending on. So I added it.
>
> Sources are in the kit if you want to go further.
