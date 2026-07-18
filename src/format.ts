/**
 * Pure PR-comment rendering.
 *
 * Turn an {@link EvaluationResult} plus the metrics/budget it was derived from
 * into a deterministic Markdown table for a pull-request comment. No network,
 * no GitHub API — posting the returned string is a separate, still-deferred
 * concern. The pass/fail signal is the text `PASS`/`FAIL`, never colour alone,
 * so it survives plain text, screen readers, and monochrome rendering.
 */

import type { Budget, EvaluationResult, Metrics } from './evaluate.js';

/** Human-readable column label (with unit) for each metric key. */
const METRIC_LABELS: Record<keyof Budget, string> = {
  lcpMs: 'LCP (ms)',
  cls: 'CLS',
  inpMs: 'INP (ms)',
  totalKb: 'Total (KB)',
  requests: 'Requests',
};

/**
 * Render an evaluation as a Markdown PR comment.
 *
 * The output is a pure function of its inputs: metric rows follow the fixed
 * order in {@link EvaluationResult.checked}, so identical inputs always produce
 * byte-identical output.
 *
 * @param result  The evaluation to render.
 * @param metrics The measured values it was evaluated against.
 * @param budget  The declared limits it was evaluated against.
 * @returns A Markdown string suitable for posting as a PR comment.
 */
export function formatComment(
  result: EvaluationResult,
  metrics: Metrics,
  budget: Budget,
): string {
  if (result.checked.length === 0) {
    return [
      '## Performance Budget',
      '',
      'No overlapping metrics between budget and measurement — nothing checked.',
      '',
    ].join('\n');
  }

  const overBudget = new Set(result.violations.map((v) => v.metric));

  // `checked` guarantees both budget[key] and metrics[key] are present, so the
  // non-null assertions below hold by construction of `evaluate`.
  const rows = result.checked.map((key) => {
    const status = overBudget.has(key) ? 'FAIL' : 'PASS';
    return `| ${METRIC_LABELS[key]} | ${budget[key]!} | ${metrics[key]!} | ${status} |`;
  });

  const heading = result.passed
    ? '## Performance Budget: PASS'
    : '## Performance Budget: FAIL';
  const summary = result.passed
    ? `All ${result.checked.length} checked metric(s) are within budget.`
    : `${result.violations.length} of ${result.checked.length} checked metric(s) are over budget.`;

  return [
    heading,
    '',
    summary,
    '',
    '| Metric | Budget | Actual | Status |',
    '| --- | --- | --- | --- |',
    ...rows,
    '',
  ].join('\n');
}
