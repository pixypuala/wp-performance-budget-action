# Technical Contracts, Commands and Schemas

This chapter removes ambiguity before code. Names may change only through an ADR; the implemented README and CLI help must remain synchronized with the accepted contract.

## Required command surface

| Command | Required behavior |
|---|---|
| wp-perf-budget doctor | Validate URLs, browser, companion plugin, auth/redaction and baseline access. |
| wp-perf-budget validate <budget.yml> | Validate schema, metric units, aggregations and supported collectors. |
| wp-perf-budget run <budget.yml> --output=<dir> | Run warmups/samples and save raw immutable results. |
| wp-perf-budget compare <candidate> <baseline> | Apply absolute/relative tolerance and generate findings. |
| wp-perf-budget report <result> --format=<json\|markdown\|junit> | Render result without recollection. |
| wp-perf-budget baseline create <result> | Create integrity-checked baseline artifact through explicit command. |
| wp wp-perf-diagnostics status | Verify companion plugin test-only protections and enabled collectors. |
| tool fixture:regress <asset\|query\|lcp\|interaction> | Enable intentional regression used to prove a budget gate. |

## Configuration example

```yaml
schemaVersion: 1
baseUrl: http://wp.test
profile: mobile
runs:
  warmup: 1
  samples: 5
  aggregation: median
journeys:
  - id: article-load
    path: /sample/
    budgets:
      lcp_ms: {max: 2500, tolerancePercent: 10}
      js_transfer_bytes: {max: 180000}
      db_queries: {max: 35}
artifacts: [trace, summary]
```

The final implementation must publish a machine-readable JSON Schema, reject unknown/unsafe fields according to policy, report source locations for invalid input, and support `--format=json` for automation where appropriate. Environment variables may provide secrets or CI overrides but cannot silently replace committed project behavior.

## Core data models

- BudgetPlan: profile, journeys, collectors, samples, aggregation, thresholds and tolerance.
- MetricSample: name/unit/value/collector/provenance/timestamp.
- JourneyResult: raw samples, aggregation, environment and trace references.
- ComparisonFinding: baseline/candidate/delta/tolerance/status/explanation.
- BaselineManifest: source SHA, environment fingerprint, plan hash, result hash and creation policy.

## API and stability rules

- Metric names and units are versioned; collectors cannot silently redefine them.
- Action inputs map directly to CLI options/config; GitHub-only hidden behavior is prohibited.
- Unavailable required metric fails distinctly from a budget regression.
- Raw samples remain accessible so users can inspect aggregation and noise.

## Common exit-code contract

| Code | Meaning | Retry guidance |
|---|---|---|
| 0 | All requested operations completed and required assertions passed | No retry needed |
| 1 | Valid execution found a contract/budget/audit/test failure | Fix product/configuration; blind retry prohibited |
| 2 | Invalid command or configuration | Correct input |
| 3 | Unsupported or missing environment/dependency | Change environment or support policy |
| 4 | Permission or safety policy denied the operation | Do not bypass; obtain correct authorization/environment |
| 5 | Setup, migration or fixture preparation failed | Inspect diagnostics; clean owned state before retry |
| 6 | Timeout, cancellation or external/network failure | Retry only under documented bounded policy |
| 7 | Infrastructure failure unrelated to evaluated product behavior | Retry after environment repair; preserve original evidence |
| 8 | Internal defect/invariant violation | File a bug with redacted diagnostic bundle |

Commands that do not need all codes may use the applicable subset, but meanings cannot conflict.

## Output and logging contract

- Human output goes to stdout; diagnostics/progress to stderr where CLI conventions require machine-readable stdout.
- `--format=json` emits one valid documented schema, no decorative prose.
- Every run prints or records run ID, tool version, source SHA, platform versions, config hash and safety mode.
- Errors contain stable code, path/subject, remediation and redacted context.
- Verbose/debug mode is opt-in and still redacts secrets and personal data.
- Cancellation returns a distinct status and runs ownership-based cleanup.

## Schema evolution

Schemas include `schemaVersion`. Additive optional fields may be backward compatible; required fields, changed meaning/type, renamed IDs and removed enum values are breaking. Readers must reject unsupported major versions clearly. Golden fixtures for every supported schema version remain in tests through the deprecation window.
