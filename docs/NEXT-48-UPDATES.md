# Next 48 Updates — wp-performance-budget-action

## Why this file exists

This is a sequenced, honest backlog of at least 48 planned updates that keeps the repository genuinely active over time. Each item is a real unit of work (one issue or pull request) that advances capability, testing, security, documentation, or maintenance — not artificial busywork. Items are ordered so that early work unblocks later work, and grouped into six release milestones. Nothing here is claimed as already done: this is the forward plan.

## How to use it

Convert each checkbox into a tracked issue, attach it to the matching milestone, and close it with the pull request that satisfies it. Aim for a steady cadence (for example one to three items per week) so commit history, releases, and changelog entries reflect continuous, verifiable progress. Re-open or add items whenever revalidation, upstream releases, or user reports surface new work.

Total planned updates: **48** across **6** milestones.

## M1 — v0.1 Foundations & scaffolding

- [ ] **#01** Scaffold the CLI and GitHub Action with a shared core
- [ ] **#02** Define the journey-budget schema (metrics, thresholds, environments)
- [ ] **#03** Set up a dev environment with a sample WordPress site and journeys
- [ ] **#04** Add coding standards, static analysis, and pre-commit hooks
- [ ] **#05** Create ADRs: separate lab, server, and field measurements
- [ ] **#06** Add CI running the CLI against a sample journey
- [ ] **#07** Implement the lab-measurement runner (Lighthouse-style metrics)
- [ ] **#08** Add structured JSON output and clear exit codes

## M2 — v0.2 Core capability

- [ ] **#09** Implement budget evaluation with pass/fail per metric
- [ ] **#10** Add server-diagnostics collection (TTFB, query counts) kept separate from lab
- [ ] **#11** Add optional field-data (CrUX-style) ingestion clearly labeled
- [ ] **#12** Implement multi-journey configuration and reporting
- [ ] **#13** Add a Markdown summary and a PR comment reporter
- [ ] **#14** Add regression detection against a stored baseline
- [ ] **#15** Build the GitHub Action wrapper with caching
- [ ] **#16** Add a local watch mode for developer feedback

## M3 — v0.3 Testing, evidence & negative proof

- [ ] **#17** Add self-tests: within-budget passes, over-budget fails
- [ ] **#18** Add a known-bad fixture proving a regression is caught
- [ ] **#19** Add integration tests running full journeys on the sample site
- [ ] **#20** Add golden-file tests for report formats
- [ ] **#21** Add tests for exit codes and CI failure semantics
- [ ] **#22** Create an evidence index mapping claims to self-tests
- [ ] **#23** Add a coverage gate for the core and reporters
- [ ] **#24** Add flake-control with repeat runs and variance reporting

## M4 — v0.4 Security, compatibility & performance

- [ ] **#25** Ensure no secrets or URLs with tokens leak into reports
- [ ] **#26** Validate untrusted config and remote journey definitions
- [ ] **#27** Add a Node/WordPress/PHP support matrix and test the floor
- [ ] **#28** Add supply-chain scanning
- [ ] **#29** Add observability for run duration and measurement stability
- [ ] **#30** Document how lab numbers must not be presented as field data
- [ ] **#31** Document rollback for a bad Action release
- [ ] **#32** Add signed artifacts and checksums

## M5 — v0.5 Documentation, DX & adoption

- [ ] **#33** Write a case study catching a real performance regression in CI
- [ ] **#34** Record a demo and reproducible Playground blueprint
- [ ] **#35** Publish the budget-authoring guide
- [ ] **#36** Document the CLI reference and exit-code table
- [ ] **#37** Add architecture docs for the lab/server/field separation
- [ ] **#38** Write a CI-integration guide for the Action
- [ ] **#39** Document how to interpret and not overclaim results
- [ ] **#40** Add a troubleshooting guide for flaky measurements

## M6 — v1.0+ Community, release cadence & maintenance

- [ ] **#41** Adopt semantic versioning and a maintained changelog
- [ ] **#42** Add protected-tag release automation with evidence
- [ ] **#43** Set a cadence to revalidate against new Lighthouse/WordPress releases
- [ ] **#44** Add a quarterly metric-definition review to the roadmap
- [ ] **#45** Publish a deprecation policy for budget-schema changes
- [ ] **#46** Triage issues with documented labels and SLAs
- [ ] **#47** Add 'good first issue' journey and reporter tasks
- [ ] **#48** Schedule recurring dependency and metric refresh reviews

## Honesty note

These updates are planned, not completed. They do not assert the software is already built, adopted, certified, bug-free, or secure in every environment. They describe the intended, testable path of work and the cadence for keeping the repository maintained.
