# Scope, Requirements and Acceptance

## V1 users and jobs

- WordPress plugin/theme teams: install, evaluate, integrate or contribute without private setup knowledge.
- agencies: install, evaluate, integrate or contribute without private setup knowledge.
- performance engineers: install, evaluate, integrate or contribute without private setup knowledge.
- maintainers wanting regression gates: install, evaluate, integrate or contribute without private setup knowledge.

## V1 functional requirements

| ID | Requirement | Acceptance evidence | Priority |
|---|---|---|---|
| FR-01 | YAML/JSON budget format for journeys, pages, actions, metrics, tolerance, samples and environment. | Automated test plus documented evidence | Must |
| FR-02 | Browser collector for navigation and interaction timings, CWV-compatible lab metrics, request/asset counts and traces. | Automated test plus documented evidence | Must |
| FR-03 | WordPress diagnostic companion plugin exposing opt-in Server-Timing and query/cache diagnostics in test environments. | Automated test plus documented evidence | Must |
| FR-04 | Baseline and pull-request comparison with absolute and relative thresholds. | Automated test plus documented evidence | Must |
| FR-05 | Noise policy: warmup, sample count, median/p75, retries, outlier visibility and no silent cherry-picking. | Automated test plus documented evidence | Must |
| FR-06 | GitHub Action summary, annotations and artifact upload plus identical local CLI. | Automated test plus documented evidence | Must |
| FR-07 | Intentional asset/query/interaction regression fixtures. | Automated test plus documented evidence | Must |

## Cross-cutting requirements

| ID | Requirement | Acceptance |
|---|---|---|
| QR-01 | Clean installation | Fresh clone/install succeeds using documented supported tooling and no globally hidden dependency. |
| QR-02 | Determinism | Lockfiles, fixture versions, schemas and generated artifacts are committed or reproducibly created. |
| QR-03 | Security | Threat model completed; privileged and network boundaries have tests; no known critical/high unresolved finding. |
| QR-04 | Accessibility | Documentation and UIs meet the project accessibility policy; manual checks are recorded where automation is insufficient. |
| QR-05 | Performance | Budgets are defined before optimization and enforced on representative journeys or package size. |
| QR-06 | Compatibility | Published matrix is executed; unsupported combinations fail clearly rather than silently degrading. |
| QR-07 | Observability | Errors use stable codes/categories, useful context and redaction; debug mode is documented. |
| QR-08 | Recoverability | Setup and migrations are idempotent or have documented recovery/rollback paths. |
| QR-09 | Supply chain | Dependencies are locked, reviewed, licensed and scanned; release provenance is documented. |
| QR-10 | Maintainability | Public APIs, ownership, ADRs, test commands, support policy and deprecation path are documented. |

## First useful release

- YAML/JSON budget format for journeys, pages, actions, metrics, tolerance, samples and environment.
- Browser collector for navigation and interaction timings, CWV-compatible lab metrics, request/asset counts and traces.
- WordPress diagnostic companion plugin exposing opt-in Server-Timing and query/cache diagnostics in test environments.
- Baseline and pull-request comparison with absolute and relative thresholds.
- Noise policy: warmup, sample count, median/p75, retries, outlier visibility and no silent cherry-picking.
- GitHub Action summary, annotations and artifact upload plus identical local CLI.
- Intentional asset/query/interaction regression fixtures.

## Explicit non-goals

- replacing real-user monitoring
- guaranteeing SEO ranking
- using a single score as quality truth
- profiling arbitrary production sites without consent
- hiding unstable results by unlimited retries

## Acceptance scenarios

1. **Clean-clone scenario:** a contributor follows only the README and reaches a known-good result.
2. **Known-bad scenario:** an intentional regression fails the correct gate with a useful, stable error.
3. **Unsupported scenario:** an unsupported platform/version is rejected with remediation guidance.
4. **Least-privilege scenario:** unauthorized or lower-privilege actors cannot execute or view privileged behavior/data.
5. **Upgrade scenario:** previous released state upgrades to the new version without data loss or undocumented manual repair.
6. **Downgrade/recovery scenario:** rollback limits are explicit and a backup/recovery route is tested where downgrade is unsafe.
7. **Failure-cleanup scenario:** interrupted setup/test/release leaves no unowned processes, corrupted fixture state or exposed secret.
8. **Documentation scenario:** API, user, contributor, security and release docs match the released artifact.

## Scope change control

Any new v1 feature must name the user/job, define acceptance, identify security/data/network implications, add test cost, state maintenance owner and remove or defer equivalent effort. “Nice to have” is not accepted without an owner and measurable value.
