import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import { run, type MainDeps } from '../src/main.js';
import { COMMENT_MARKER, type HttpResponse, type HttpRequestInit } from '../src/index.js';

const reportJson = readFileSync(
  fileURLToPath(new URL('../fixtures/lighthouse-report.json', import.meta.url)),
  'utf8',
);
const budgetJson = readFileSync(
  fileURLToPath(new URL('../fixtures/budget.json', import.meta.url)),
  'utf8',
);

interface Call {
  url: string;
  init: HttpRequestInit;
}

/** A file reader backed by an in-memory path→contents map. */
function fakeReader(files: Record<string, string>): (path: string) => string {
  return (path) => {
    const contents = files[path];
    if (contents === undefined) {
      throw new Error(`ENOENT: no such file "${path}"`);
    }
    return contents;
  };
}

/** A recording HTTP client that replays a scripted list of responses. */
function mockClient(responses: HttpResponse[]): {
  client: MainDeps['client'];
  calls: Call[];
} {
  const calls: Call[] = [];
  const queue = [...responses];
  const client: MainDeps['client'] = (url, init) => {
    calls.push({ url, init });
    const next = queue.shift();
    if (!next) {
      throw new Error(`Unexpected extra request to ${url}`);
    }
    return Promise.resolve(next);
  };
  return { client, calls };
}

function ok(payload: unknown): HttpResponse {
  return { ok: true, status: 200, json: () => Promise.resolve(payload) };
}

/** Collect log lines and outputs so assertions can inspect the whole run. */
function recordingDeps(client: MainDeps['client']): {
  deps: MainDeps;
  logs: string[];
  outputs: Record<string, string>;
} {
  const logs: string[] = [];
  const outputs: Record<string, string> = {};
  const deps: MainDeps = {
    client,
    readFile: fakeReader({ 'report.json': reportJson, 'budget.json': budgetJson }),
    log: (message) => logs.push(message),
    setOutput: (name, value) => {
      outputs[name] = value;
    },
  };
  return { deps, logs, outputs };
}

const baseEnv = {
  INPUT_LIGHTHOUSE_REPORT: 'report.json',
  INPUT_BUDGET: 'budget.json',
  INPUT_GITHUB_TOKEN: 'fake-test-token',
  INPUT_REPO: 'pixypuala/site',
  INPUT_PR_NUMBER: '7',
} satisfies NodeJS.ProcessEnv;

describe('run (action orchestration)', () => {
  it('runs the whole pipeline offline: parse → evaluate → format → comment', async () => {
    const { client, calls } = mockClient([
      ok([]),
      ok({ id: 88, body: 'x', html_url: 'https://github.com/pixypuala/site/pull/7#c88' }),
    ]);
    const { deps, logs, outputs } = recordingDeps(client);

    const result = await run(baseEnv, deps);

    // Fixture metrics (LCP 3187, Total 950KB) breach the budget (2500, 800).
    expect(result.passed).toBe(false);
    expect(result.comment).toEqual({
      action: 'created',
      commentId: 88,
      url: 'https://github.com/pixypuala/site/pull/7#c88',
    });

    // Outputs the action exposes to downstream steps.
    expect(outputs['passed']).toBe('false');
    expect(outputs['violations']).toBe('2');
    expect(outputs['comment-url']).toBe('https://github.com/pixypuala/site/pull/7#c88');

    // The rendered comment (logged and posted) carries the FAIL verdict.
    expect(logs.some((line) => line.includes('Performance Budget: FAIL'))).toBe(true);
    const posted = JSON.parse(calls[1]!.init.body!) as { body: string };
    expect(posted.body).toContain(COMMENT_MARKER);
    expect(posted.body).toContain('Performance Budget: FAIL');
    expect(calls[1]!.init.headers['Authorization']).toBe('Bearer fake-test-token');
  });

  it('skips the live GitHub call when commenting is disabled', async () => {
    const { client, calls } = mockClient([]);
    const { deps, outputs } = recordingDeps(client);

    const result = await run({ ...baseEnv, INPUT_COMMENT: 'false' }, deps);

    expect(result.passed).toBe(false);
    expect(result.comment).toBeUndefined();
    expect(calls).toHaveLength(0);
    expect(outputs['comment-url']).toBeUndefined();
    expect(outputs['passed']).toBe('false');
  });

  it('fails loudly when a required input is missing', async () => {
    const { client } = mockClient([]);
    const { deps } = recordingDeps(client);

    await expect(
      run({ ...baseEnv, INPUT_LIGHTHOUSE_REPORT: '' }, deps),
    ).rejects.toThrow('Missing required input: INPUT_LIGHTHOUSE_REPORT');
  });
});
