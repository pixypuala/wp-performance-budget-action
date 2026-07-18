# Implementation Backlog

This backlog is the minimum decomposition, not a substitute for issue-specific design. Each issue must include owner, dependencies, security/compatibility/docs impact, test plan and evidence link. Split issues that cannot be reviewed safely in one pull request.

| ID | Work item | Acceptance | Initial status |
|---|---|---|---|
| ISSUE-001 | Bootstrap | Initialize license, governance, CODEOWNERS, security and support files. | Not started |
| ISSUE-002 | Architecture | Accept repository topology, support, schema, environment, trust and test ADRs. | Not started |
| ISSUE-003 | Tooling | Create version files, authoritative lockfiles and immutable installation commands. | Not started |
| ISSUE-004 | Doctor | Implement read-only environment diagnostics and remediation output. | Not started |
| ISSUE-005 | Fixture | Create smallest deterministic known-good fixture and cleanup ownership. | Not started |
| ISSUE-006 | Failure fixture | Create first known-bad fixture and prove the intended gate fails. | Not started |
| ISSUE-007 | Static quality | Configure formatting, lint, types/static analysis, schema and generated-file drift checks. | Not started |
| ISSUE-008 | Integration environment | Create disposable WordPress/database/browser lifecycle with cleanup. | Not started |
| ISSUE-009 | Security | Complete threat model and add permission/input/network/filesystem/redaction tests. | Not started |
| ISSUE-010 | Evidence | Define immutable result/evidence directory, manifest and redaction inspection. | Not started |
| ISSUE-011 | CI | Implement PR target cell using only repository-owned commands. | Not started |
| ISSUE-012 | Scheduled CI | Implement sampled matrix, next-beta checks and maintenance health. | Not started |
| ISSUE-013 | Release | Implement protected tag build, artifact inspection/checksum and artifact-install smoke. | Not started |
| ISSUE-014 | Docs | Verify clean-clone tutorial through an uninvolved reviewer. | Not started |
| ISSUE-015 | Compatibility | Publish dated tested/unsupported matrix tied to release SHA. | Not started |
| ISSUE-016 | Upgrade | Create previous-release fixture and candidate upgrade/recovery test. | Not started |
| ISSUE-017 | CLI: implement `wp-perf-budget doctor` | Validate URLs, browser, companion plugin, auth/redaction and baseline access. Includes unit/contract tests, help text, JSON behavior where applicable, and failure cases. | Not started |
| ISSUE-018 | CLI: implement `wp-perf-budget validate <budget.yml>` | Validate schema, metric units, aggregations and supported collectors. Includes unit/contract tests, help text, JSON behavior where applicable, and failure cases. | Not started |
| ISSUE-019 | CLI: implement `wp-perf-budget run <budget.yml> --output=<dir>` | Run warmups/samples and save raw immutable results. Includes unit/contract tests, help text, JSON behavior where applicable, and failure cases. | Not started |
| ISSUE-020 | CLI: implement `wp-perf-budget compare <candidate> <baseline>` | Apply absolute/relative tolerance and generate findings. Includes unit/contract tests, help text, JSON behavior where applicable, and failure cases. | Not started |
| ISSUE-021 | CLI: implement `wp-perf-budget report <result> --format=<json\|markdown\|junit>` | Render result without recollection. Includes unit/contract tests, help text, JSON behavior where applicable, and failure cases. | Not started |
| ISSUE-022 | CLI: implement `wp-perf-budget baseline create <result>` | Create integrity-checked baseline artifact through explicit command. Includes unit/contract tests, help text, JSON behavior where applicable, and failure cases. | Not started |
| ISSUE-023 | CLI: implement `wp wp-perf-diagnostics status` | Verify companion plugin test-only protections and enabled collectors. Includes unit/contract tests, help text, JSON behavior where applicable, and failure cases. | Not started |
| ISSUE-024 | CLI: implement `tool fixture:regress <asset\|query\|lcp\|interaction>` | Enable intentional regression used to prove a budget gate. Includes unit/contract tests, help text, JSON behavior where applicable, and failure cases. | Not started |
| ISSUE-025 | Domain: implement `BudgetPlan` model | BudgetPlan: profile, journeys, collectors, samples, aggregation, thresholds and tolerance. Validate serialization, invariants and backward compatibility. | Not started |
| ISSUE-026 | Domain: implement `MetricSample` model | MetricSample: name/unit/value/collector/provenance/timestamp. Validate serialization, invariants and backward compatibility. | Not started |
| ISSUE-027 | Domain: implement `JourneyResult` model | JourneyResult: raw samples, aggregation, environment and trace references. Validate serialization, invariants and backward compatibility. | Not started |
| ISSUE-028 | Domain: implement `ComparisonFinding` model | ComparisonFinding: baseline/candidate/delta/tolerance/status/explanation. Validate serialization, invariants and backward compatibility. | Not started |
| ISSUE-029 | Domain: implement `BaselineManifest` model | BaselineManifest: source SHA, environment fingerprint, plan hash, result hash and creation policy. Validate serialization, invariants and backward compatibility. | Not started |
| ISSUE-030 | Contract: enforce public API rule | Metric names and units are versioned; collectors cannot silently redefine them. Add a contract test and documentation link. | Not started |
| ISSUE-031 | Contract: enforce public API rule | Action inputs map directly to CLI options/config; GitHub-only hidden behavior is prohibited. Add a contract test and documentation link. | Not started |
| ISSUE-032 | Contract: enforce public API rule | Unavailable required metric fails distinctly from a budget regression. Add a contract test and documentation link. | Not started |
| ISSUE-033 | Contract: enforce public API rule | Raw samples remain accessible so users can inspect aggregation and noise. Add a contract test and documentation link. | Not started |

## Backlog execution rules

- Complete Bootstrap through Failure fixture before parallel feature expansion.
- Public contracts and schemas require ADR/API-owner review.
- Security-sensitive and release-workflow issues require designated owner review.
- A CLI/model issue is not complete until error and negative paths are tested.
- Documentation follows the real command/artifact; never document a command that has not been run from a clean clone.
- Close an issue only with linked PR, tests and evidence; administrative closure states why it is no longer needed.
