/**
 * Pure Lighthouse-report parser.
 *
 * Given a Lighthouse JSON result object, extract exactly the {@link Metrics}
 * shape that {@link evaluate} consumes. This is a pure function of its input —
 * running Lighthouse (which needs a real browser) is a separate, still-deferred
 * concern. Audits that are absent or non-numeric are omitted rather than
 * defaulted, so a partial report yields a partial `Metrics` and `evaluate`'s
 * "only check overlapping metrics" rule stays correct.
 */

import type { Metrics } from './evaluate.js';

/** The subset of a Lighthouse audit entry this parser reads. */
interface LighthouseAudit {
  numericValue?: number;
  details?: { items?: unknown[] };
}

/** The subset of a Lighthouse result object this parser reads. */
export interface LighthouseReport {
  audits?: Record<string, LighthouseAudit | undefined>;
}

/** Read a finite numeric audit value, or `undefined` when unusable. */
function numeric(audit: LighthouseAudit | undefined): number | undefined {
  const value = audit?.numericValue;
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

/** Count the network requests an audit recorded, or `undefined` when absent. */
function requestCount(audit: LighthouseAudit | undefined): number | undefined {
  const items = audit?.details?.items;
  return Array.isArray(items) ? items.length : undefined;
}

/**
 * Extract budget-evaluable metrics from a Lighthouse result object.
 *
 * Mapping (Lighthouse audit id → `Metrics` key):
 * - `largest-contentful-paint` → `lcpMs` (rounded ms)
 * - `cumulative-layout-shift` → `cls`
 * - `interaction-to-next-paint` (or the `experimental-` variant) → `inpMs`
 * - `total-byte-weight` → `totalKb` (bytes ÷ 1024, rounded)
 * - `network-requests` → `requests` (recorded item count)
 *
 * @param report A parsed Lighthouse JSON result object.
 * @returns The metrics present in the report; missing audits are omitted.
 */
export function parseLighthouseReport(report: LighthouseReport): Metrics {
  const audits = report.audits ?? {};
  const metrics: Metrics = {};

  const lcp = numeric(audits['largest-contentful-paint']);
  if (lcp !== undefined) {
    metrics.lcpMs = Math.round(lcp);
  }

  const cls = numeric(audits['cumulative-layout-shift']);
  if (cls !== undefined) {
    metrics.cls = cls;
  }

  const inp =
    numeric(audits['interaction-to-next-paint']) ??
    numeric(audits['experimental-interaction-to-next-paint']);
  if (inp !== undefined) {
    metrics.inpMs = Math.round(inp);
  }

  const bytes = numeric(audits['total-byte-weight']);
  if (bytes !== undefined) {
    metrics.totalKb = Math.round(bytes / 1024);
  }

  const requests = requestCount(audits['network-requests']);
  if (requests !== undefined) {
    metrics.requests = requests;
  }

  return metrics;
}
