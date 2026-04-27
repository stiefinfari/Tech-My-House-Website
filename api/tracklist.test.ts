import { afterEach, describe, expect, it, vi } from 'vitest';
import handler from './tracklist';

function createRes() {
  type HandlerRes = Parameters<typeof handler>[1];

  let lastStatus: number | null = null;

  const setHeader = vi.fn<(name: string, value: string) => void>();
  const json = vi.fn<(body: unknown) => unknown>();

  const resObj: HandlerRes = {
    status: (code: number) => {
      lastStatus = code;
      return resObj;
    },
    json: (body: unknown) => json(body),
    setHeader: (name: string, value: string) => setHeader(name, value),
  };

  return { res: resObj, json, setHeader, getLastStatus: () => lastStatus };
}

describe('api/tracklist', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('returns 403 for non-allowed host', async () => {
    const { res, getLastStatus } = createRes();
    await handler({ method: 'GET', query: { url: 'https://evil.example/track' } }, res);
    expect(getLastStatus()).toBe(403);
  });

  it('fetches upstream with redirect follow', async () => {
    type FetchResponse = {
      ok: boolean;
      status: number;
      url: string;
      headers: Headers;
      text: () => Promise<string>;
    };

    const fetchMock = vi.fn<(input: string, init?: RequestInit) => Promise<FetchResponse>>(async () => {
      return {
        ok: true,
        status: 200,
        url: 'https://www.1001tracklists.com/tracklist/abc.html',
        headers: new Headers({ 'content-type': 'text/html; charset=utf-8' }),
        text: async () => '<html></html>',
      } satisfies FetchResponse;
    });
    vi.stubGlobal('fetch', fetchMock);

    const { res } = createRes();
    await handler({ method: 'GET', query: { url: 'https://www.1001tracklists.com/tracklist/abc.html' } }, res);

    expect(fetchMock).toHaveBeenCalled();
    const init = fetchMock.mock.calls[0]?.[1];
    expect(init?.redirect).toBe('follow');
  });
});
