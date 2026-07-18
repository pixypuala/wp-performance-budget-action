import { describe, it, expect } from 'vitest';
import {
  postOrUpdateComment,
  COMMENT_MARKER,
  type HttpClient,
  type HttpResponse,
  type HttpRequestInit,
} from '../src/index.js';

interface Call {
  url: string;
  init: HttpRequestInit;
}

/** Build a mock client from a scripted list of responses, recording each call. */
function mockClient(responses: HttpResponse[]): { client: HttpClient; calls: Call[] } {
  const calls: Call[] = [];
  const queue = [...responses];
  const client: HttpClient = (url, init) => {
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

const options = {
  token: 'fake-test-token',
  repo: 'pixypuala/site',
  prNumber: 7,
  body: '## Performance Budget: PASS',
};

describe('postOrUpdateComment', () => {
  it('creates a new comment when none exists, hitting the correct endpoint', async () => {
    const { client, calls } = mockClient([
      ok([]),
      ok({ id: 555, body: 'x', html_url: 'https://github.com/pixypuala/site/pull/7#c555' }),
    ]);

    const result = await postOrUpdateComment(client, options);

    expect(result).toEqual({
      action: 'created',
      commentId: 555,
      url: 'https://github.com/pixypuala/site/pull/7#c555',
    });
    expect(calls[0]!.init.method).toBe('GET');
    expect(calls[0]!.url).toContain('/repos/pixypuala/site/issues/7/comments');
    expect(calls[1]!.init.method).toBe('POST');
    expect(calls[1]!.url).toBe('https://api.github.com/repos/pixypuala/site/issues/7/comments');
    // The posted body carries the marker and the caller's Markdown.
    const posted = JSON.parse(calls[1]!.init.body!) as { body: string };
    expect(posted.body).toContain(COMMENT_MARKER);
    expect(posted.body).toContain('## Performance Budget: PASS');
    expect(calls[1]!.init.headers['Authorization']).toBe('Bearer fake-test-token');
  });

  it('updates the existing marked comment instead of creating a duplicate', async () => {
    const { client, calls } = mockClient([
      ok([
        { id: 1, body: 'unrelated human comment', html_url: 'u1' },
        { id: 42, body: `${COMMENT_MARKER}\nold report`, html_url: 'u42' },
      ]),
      ok({ id: 42, body: 'new', html_url: 'u42' }),
    ]);

    const result = await postOrUpdateComment(client, options);

    expect(result.action).toBe('updated');
    expect(result.commentId).toBe(42);
    expect(calls[1]!.init.method).toBe('PATCH');
    expect(calls[1]!.url).toBe('https://api.github.com/repos/pixypuala/site/issues/comments/42');
  });

  it('does not duplicate the marker when the body already carries it', async () => {
    const { client, calls } = mockClient([
      ok([]),
      ok({ id: 9, body: 'x', html_url: 'u9' }),
    ]);

    await postOrUpdateComment(client, { ...options, body: `${COMMENT_MARKER}\nalready marked` });

    const posted = JSON.parse(calls[1]!.init.body!) as { body: string };
    expect(posted.body.match(new RegExp(COMMENT_MARKER, 'g'))).toHaveLength(1);
  });

  it('honours a custom API base URL for GitHub Enterprise', async () => {
    const { client, calls } = mockClient([ok([]), ok({ id: 3, body: 'x', html_url: 'u3' })]);

    await postOrUpdateComment(client, { ...options, apiBaseUrl: 'https://ghe.corp/api/v3' });

    expect(calls[0]!.url).toContain('https://ghe.corp/api/v3/repos/pixypuala/site/issues/7/comments');
  });

  it('throws loudly when the list request fails', async () => {
    const { client } = mockClient([{ ok: false, status: 401, json: () => Promise.resolve({}) }]);
    await expect(postOrUpdateComment(client, options)).rejects.toThrow('status 401');
  });

  it('rejects a malformed repo slug', async () => {
    const { client } = mockClient([]);
    await expect(
      postOrUpdateComment(client, { ...options, repo: 'not-a-slug' }),
    ).rejects.toThrow('Invalid repo');
  });
});
