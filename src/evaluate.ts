/**
 * The pure budget-evaluation core.
 *
 * Given measured metrics and a declared budget, decide which metrics are over
 * budget. Everything here is a pure function of its inputs, so the whole
 * pass/fail policy is unit-tested without a browser, a network, or GitHub.
 */

/** A metric direction: for all supported metrics, lower is better. */
export interface Budget {
  /** Largest Contentful Paint, milliseconds. */
  lcpMs?: number;
  /** Cumulative Layout Shift, unitless score. */
  cls?: number;
  /** Interaction to Next Paint, milliseconds. */
  inpMs?: number;
  /** Total transfer size, kilobytes. */
  totalKb?: number;
  /** Total request count. */
  requests?: number;
}

/** Measured values for the same set of metrics. */
export type Metrics = Budget;

export interface Violation {
  metric: keyof Budget;
  budget: number;
  actual: number;
  /** How far over budget, as a ratio (actual / budget). */
  overBy: number;
}

export interface EvaluationResult {
  passed: boolean;
  violations: Violation[];
  /** Metrics that were checked (present in both budget and metrics). */
  checked: (keyof Budget)[];
}

const METRIC_KEYS: (keyof Budget)[] = ['lcpMs', 'cls', 'inpMs', 'totalKb', 'requests'];

/**
 * Evaluate measured metrics against a budget.
 *
 * Only metrics present in *both* the budget and the metrics are checked, so a
 * partial budget is valid. A metric is a violation when it exceeds its budget
 * (all supported metrics are "lower is better").
 *
 * @param metrics Measured values.
 * @param budget  Declared limits.
 * @returns The pass/fail result with per-metric violations.
 */
export function evaluate(metrics: Metrics, budget: Budget): EvaluationResult {
  const violations: Violation[] = [];
  const checked: (keyof Budget)[] = [];

  for (const key of METRIC_KEYS) {
    const limit = budget[key];
    const actual = metrics[key];
    if (limit === undefined || actual === undefined) {
      continue;
    }
    checked.push(key);
    if (actual > limit) {
      violations.push({
        metric: key,
        budget: limit,
        actual,
        overBy: round(actual / limit, 3),
      });
    }
  }

  return { passed: violations.length === 0, violations, checked };
}

/** Round to a fixed number of decimals without floating-point noise. */
function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/**
 * Render a human-readable summary of an evaluation.
 *
 * @param result The evaluation result.
 * @returns A multi-line report suitable for CI logs or a PR comment.
 */
export function summarize(result: EvaluationResult): string {
  if (result.checked.length === 0) {
    return 'No overlapping metrics between budget and measurement — nothing checked.';
  }
  if (result.passed) {
    return `✅ Within budget (${result.checked.length} metric(s) checked).`;
  }
  const lines = result.violations.map(
    (v) => `  ✗ ${v.metric}: ${v.actual} > ${v.budget} (×${v.overBy})`,
  );
  return [`❌ ${result.violations.length} metric(s) over budget:`, ...lines].join('\n');
}
