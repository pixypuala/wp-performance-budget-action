import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import { parseLighthouseReport, type LighthouseReport } from '../src/index.js';

const fixture = JSON.parse(
  readFileSync(fileURLToPath(new URL('../fixtures/lighthouse-report.json', import.meta.url)), 'utf8'),
) as LighthouseReport;

describe('parseLighthouseReport', () => {
  it('extracts the full metrics shape from a valid report', () => {
    const metrics = parseLighthouseReport(fixture);
    expect(metrics).toEqual({
      lcpMs: 3187,
      cls: 0.0213,
      inpMs: 177,
      totalKb: 950,
      requests: 3,
    });
  });

  it('rounds LCP/INP to whole ms and converts bytes to whole KB', () => {
    const metrics = parseLighthouseReport({
      audits: {
        'largest-contentful-paint': { numericValue: 2500.9 },
        'interaction-to-next-paint': { numericValue: 199.4 },
        'total-byte-weight': { numericValue: 2048 },
      },
    });
    expect(metrics.lcpMs).toBe(2501);
    expect(metrics.inpMs).toBe(199);
    expect(metrics.totalKb).toBe(2);
  });

  it('omits metrics whose audits are missing', () => {
    const metrics = parseLighthouseReport({
      audits: {
        'largest-contentful-paint': { numericValue: 1800 },
      },
    });
    expect(metrics).toEqual({ lcpMs: 1800 });
    expect('cls' in metrics).toBe(false);
    expect('requests' in metrics).toBe(false);
  });

  it('omits metrics whose numericValue is absent or non-finite', () => {
    const metrics = parseLighthouseReport({
      audits: {
        'largest-contentful-paint': {},
        'cumulative-layout-shift': { numericValue: Number.NaN },
      },
    });
    expect(metrics).toEqual({});
  });

  it('falls back to the experimental INP audit id', () => {
    const metrics = parseLighthouseReport({
      audits: { 'experimental-interaction-to-next-paint': { numericValue: 210 } },
    });
    expect(metrics.inpMs).toBe(210);
  });

  it('treats a report with no audits object as no metrics', () => {
    expect(parseLighthouseReport({})).toEqual({});
  });
});
