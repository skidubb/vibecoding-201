# The TDD prompt

Test-driven development, run by the agent: the test is written first, fails against
the current code, and the implementation exists to turn it green. A test that has
never failed is not known to be testing anything.

```text
Write tests for this workflow covering: the happy path, an unauthorised access
attempt, malformed input, a duplicate submission, an upstream failure, and
persistence after a refresh. Confirm each test fails against the current code
before you make it pass, and show me that failure.

Then implement the smallest change that makes each test pass, one test at a
time, and run the full set after every change. Stop and show me any test you
cannot make fail first.
```

**When.** Alongside the build, not after it. Fire it the moment the plan is
approved, before the feature exists.

**Artifact.** A set of tests, evidence each one failed first, and an implementation
that turned them green one at a time.

**A bad response** writes tests that pass immediately, or skips the
unauthorised-access and duplicate-submission cases. Those two are where real tools
break.

**Your part.** You define the behaviour and you verify the finished work as a user.
The agent writes the test, confirms it fails, implements, and runs it until green.
You own the first step and the last one.

This is the long form of prompt 7 in the [prompt pack](prompt-pack.md), which also
carries the reviews that follow it: security, error handling, and what happens when
something runs twice.
