/**
 * Unit tests for the FlashAlpha SDK client.
 * Uses a mock fetch implementation — no live API calls.
 */

import { FlashAlpha } from '../src/client';
import {
  AuthenticationError,
  FlashAlphaError,
  NotFoundError,
  RateLimitError,
  ServerError,
  TierRestrictedError,
} from '../src/errors';

const BASE = 'https://lab.flashalpha.com';
const API_KEY = 'test-api-key-123';

// ── Mock fetch helpers ────────────────────────────────────────────────────────

interface MockFetchCall {
  url: string;
  init?: RequestInit;
}

function makeMockFetch(
  status: number,
  body: unknown,
  headers: Record<string, string> = {},
): { fetchFn: jest.MockedFunction<(url: string, init?: RequestInit) => Promise<Response>>; calls: MockFetchCall[] } {
  const calls: MockFetchCall[] = [];
  const fetchFn = jest.fn((url: string, init?: RequestInit): Promise<Response> => {
    calls.push({ url, init });
    const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
    const response = new Response(bodyStr, {
      status,
      headers: { 'Content-Type': 'application/json', ...headers },
    });
    return Promise.resolve(response);
  }) as jest.MockedFunction<(url: string, init?: RequestInit) => Promise<Response>>;
  return { fetchFn, calls };
}

function makeClient(
  fetchFn?: (url: string, init?: RequestInit) => Promise<Response>,
  overrides?: { baseUrl?: string; timeout?: number },
): FlashAlpha {
  return new FlashAlpha(API_KEY, { baseUrl: BASE, fetch: fetchFn, ...overrides });
}

function getCalledUrl(calls: MockFetchCall[]): URL {
  expect(calls.length).toBeGreaterThan(0);
  return new URL(calls[calls.length - 1].url);
}

// ── constructor ──────────────────────────────────────────────────────────────

describe('constructor', () => {
  it('throws when apiKey is empty string', () => {
    expect(() => new FlashAlpha('')).toThrow('apiKey is required');
  });

  it('creates client with valid apiKey', () => {
    expect(() => new FlashAlpha('key')).not.toThrow();
  });

  it('accepts custom baseUrl and timeout', () => {
    const fa = new FlashAlpha('key', { baseUrl: 'http://localhost:8000', timeout: 5000 });
    expect(fa).toBeDefined();
  });
});

// ── API key header ────────────────────────────────────────────────────────────

describe('X-Api-Key header', () => {
  it('sends X-Api-Key header on every request', async () => {
    const { fetchFn, calls } = makeMockFetch(200, { status: 'ok' });
    await makeClient(fetchFn).health();
    const headers = calls[0].init?.headers as Record<string, string>;
    expect(headers['X-Api-Key']).toBe(API_KEY);
  });

  it('sends Accept: application/json header', async () => {
    const { fetchFn, calls } = makeMockFetch(200, { status: 'ok' });
    await makeClient(fetchFn).health();
    const headers = calls[0].init?.headers as Record<string, string>;
    expect(headers['Accept']).toBe('application/json');
  });
});

// ── System ────────────────────────────────────────────────────────────────────

describe('health()', () => {
  it('returns health check data', async () => {
    const { fetchFn } = makeMockFetch(200, { status: 'ok', version: '2.0' });
    expect(await makeClient(fetchFn).health()).toEqual({ status: 'ok', version: '2.0' });
  });

  it('calls GET /health', async () => {
    const { fetchFn, calls } = makeMockFetch(200, {});
    await makeClient(fetchFn).health();
    expect(getCalledUrl(calls).pathname).toBe('/health');
    expect(calls[0].init?.method).toBe('GET');
  });
});

describe('account()', () => {
  it('returns account info', async () => {
    const payload = { plan: 'growth', requests_today: 42 };
    const { fetchFn } = makeMockFetch(200, payload);
    expect(await makeClient(fetchFn).account()).toEqual(payload);
  });

  it('calls GET /v1/account', async () => {
    const { fetchFn, calls } = makeMockFetch(200, {});
    await makeClient(fetchFn).account();
    expect(getCalledUrl(calls).pathname).toBe('/v1/account');
  });
});

// ── Reference Data ────────────────────────────────────────────────────────────

describe('tickers()', () => {
  it('returns ticker list', async () => {
    const payload = { tickers: ['SPY', 'QQQ'] };
    const { fetchFn } = makeMockFetch(200, payload);
    expect(await makeClient(fetchFn).tickers()).toEqual(payload);
  });
});

describe('symbols()', () => {
  it('returns active symbols', async () => {
    const payload = { symbols: ['SPY'] };
    const { fetchFn } = makeMockFetch(200, payload);
    expect(await makeClient(fetchFn).symbols()).toEqual(payload);
  });
});

describe('options()', () => {
  it('returns option chain metadata for a ticker', async () => {
    const payload = { expirations: ['2024-12-20'], strikes: [500, 505] };
    const { fetchFn, calls } = makeMockFetch(200, payload);
    expect(await makeClient(fetchFn).options('SPY')).toEqual(payload);
    expect(getCalledUrl(calls).pathname).toBe('/v1/options/SPY');
  });
});

// ── Market Data ───────────────────────────────────────────────────────────────

describe('stockQuote()', () => {
  it('returns stock quote', async () => {
    const payload = { bid: 499.5, ask: 499.6, last: 499.55 };
    const { fetchFn, calls } = makeMockFetch(200, payload);
    expect(await makeClient(fetchFn).stockQuote('SPY')).toEqual(payload);
    expect(getCalledUrl(calls).pathname).toBe('/stockquote/SPY');
  });
});

describe('optionQuote()', () => {
  it('returns option quote without params', async () => {
    const payload = [{ strike: 500, type: 'call', iv: 0.2 }];
    const { fetchFn, calls } = makeMockFetch(200, payload);
    expect(await makeClient(fetchFn).optionQuote('SPY')).toEqual(payload);
    expect(getCalledUrl(calls).pathname).toBe('/optionquote/SPY');
    expect(getCalledUrl(calls).search).toBe('');
  });

  it('sends expiry, strike, and type query params', async () => {
    const payload = { strike: 500, type: 'call', iv: 0.2 };
    const { fetchFn, calls } = makeMockFetch(200, payload);
    await makeClient(fetchFn).optionQuote('SPY', { expiry: '2024-12-20', strike: 500, type: 'call' });
    const url = getCalledUrl(calls);
    expect(url.searchParams.get('expiry')).toBe('2024-12-20');
    expect(url.searchParams.get('strike')).toBe('500');
    expect(url.searchParams.get('type')).toBe('call');
  });
});

describe('surface()', () => {
  it('returns volatility surface', async () => {
    const payload = { symbol: 'SPY', grid: [] };
    const { fetchFn, calls } = makeMockFetch(200, payload);
    expect(await makeClient(fetchFn).surface('SPY')).toEqual(payload);
    expect(getCalledUrl(calls).pathname).toBe('/v1/surface/SPY');
  });
});

describe('stockSummary()', () => {
  it('returns stock summary', async () => {
    const payload = { symbol: 'SPY', price: 500, gex: 1e9 };
    const { fetchFn, calls } = makeMockFetch(200, payload);
    expect(await makeClient(fetchFn).stockSummary('SPY')).toEqual(payload);
    expect(getCalledUrl(calls).pathname).toBe('/v1/stock/SPY/summary');
  });
});

// ── Historical ────────────────────────────────────────────────────────────────

describe('historicalStockQuote()', () => {
  it('sends required date param', async () => {
    const { fetchFn, calls } = makeMockFetch(200, { data: [] });
    await makeClient(fetchFn).historicalStockQuote('SPY', { date: '2024-01-15' });
    const url = getCalledUrl(calls);
    expect(url.pathname).toBe('/historical/stockquote/SPY');
    expect(url.searchParams.get('date')).toBe('2024-01-15');
    expect(url.searchParams.has('time')).toBe(false);
  });

  it('sends date and optional time param', async () => {
    const { fetchFn, calls } = makeMockFetch(200, { data: [] });
    await makeClient(fetchFn).historicalStockQuote('SPY', { date: '2024-01-15', time: '10:30' });
    const url = getCalledUrl(calls);
    expect(url.searchParams.get('date')).toBe('2024-01-15');
    expect(url.searchParams.get('time')).toBe('10:30');
  });
});

describe('historicalOptionQuote()', () => {
  it('sends all optional params', async () => {
    const { fetchFn, calls } = makeMockFetch(200, { data: [] });
    await makeClient(fetchFn).historicalOptionQuote('SPY', {
      date: '2024-01-15',
      expiry: '2024-01-19',
      strike: 500,
      type: 'put',
    });
    const url = getCalledUrl(calls);
    expect(url.pathname).toBe('/historical/optionquote/SPY');
    expect(url.searchParams.get('date')).toBe('2024-01-15');
    expect(url.searchParams.get('expiry')).toBe('2024-01-19');
    expect(url.searchParams.get('strike')).toBe('500');
    expect(url.searchParams.get('type')).toBe('put');
  });
});

// ── Exposure Analytics ────────────────────────────────────────────────────────

describe('gex()', () => {
  it('returns GEX data without params', async () => {
    const payload = { symbol: 'SPY', strikes: [] };
    const { fetchFn, calls } = makeMockFetch(200, payload);
    expect(await makeClient(fetchFn).gex('SPY')).toEqual(payload);
    expect(getCalledUrl(calls).pathname).toBe('/v1/exposure/gex/SPY');
    expect(getCalledUrl(calls).search).toBe('');
  });

  it('sends expiration param', async () => {
    const { fetchFn, calls } = makeMockFetch(200, {});
    await makeClient(fetchFn).gex('SPY', { expiration: '2024-12-20' });
    expect(getCalledUrl(calls).searchParams.get('expiration')).toBe('2024-12-20');
  });

  it('sends min_oi param (mapped from minOi)', async () => {
    const { fetchFn, calls } = makeMockFetch(200, {});
    await makeClient(fetchFn).gex('SPY', { minOi: 100 });
    expect(getCalledUrl(calls).searchParams.get('min_oi')).toBe('100');
  });

  it('sends both expiration and min_oi', async () => {
    const { fetchFn, calls } = makeMockFetch(200, {});
    await makeClient(fetchFn).gex('SPY', { expiration: '2024-12-20', minOi: 50 });
    const url = getCalledUrl(calls);
    expect(url.searchParams.get('expiration')).toBe('2024-12-20');
    expect(url.searchParams.get('min_oi')).toBe('50');
  });
});

describe('dex()', () => {
  it('returns DEX data', async () => {
    const payload = { symbol: 'SPY', delta_exposure: 0 };
    const { fetchFn, calls } = makeMockFetch(200, payload);
    expect(await makeClient(fetchFn).dex('SPY')).toEqual(payload);
    expect(getCalledUrl(calls).pathname).toBe('/v1/exposure/dex/SPY');
  });

  it('sends expiration param', async () => {
    const { fetchFn, calls } = makeMockFetch(200, {});
    await makeClient(fetchFn).dex('SPY', { expiration: '2024-12-20' });
    expect(getCalledUrl(calls).searchParams.get('expiration')).toBe('2024-12-20');
  });
});

describe('vex()', () => {
  it('returns VEX data', async () => {
    const { fetchFn, calls } = makeMockFetch(200, { symbol: 'QQQ' });
    expect(await makeClient(fetchFn).vex('QQQ')).toEqual({ symbol: 'QQQ' });
    expect(getCalledUrl(calls).pathname).toBe('/v1/exposure/vex/QQQ');
  });
});

describe('chex()', () => {
  it('returns CHEX data', async () => {
    const { fetchFn, calls } = makeMockFetch(200, { symbol: 'SPY' });
    await makeClient(fetchFn).chex('SPY');
    expect(getCalledUrl(calls).pathname).toBe('/v1/exposure/chex/SPY');
  });
});

describe('exposureSummary()', () => {
  it('returns exposure summary', async () => {
    const payload = { symbol: 'SPY', net_gex: 1e9 };
    const { fetchFn, calls } = makeMockFetch(200, payload);
    expect(await makeClient(fetchFn).exposureSummary('SPY')).toEqual(payload);
    expect(getCalledUrl(calls).pathname).toBe('/v1/exposure/summary/SPY');
  });
});

describe('exposureLevels()', () => {
  it('returns exposure levels', async () => {
    const payload = { symbol: 'SPY', support: 490, resistance: 510 };
    const { fetchFn, calls } = makeMockFetch(200, payload);
    expect(await makeClient(fetchFn).exposureLevels('SPY')).toEqual(payload);
    expect(getCalledUrl(calls).pathname).toBe('/v1/exposure/levels/SPY');
  });
});

describe('narrative()', () => {
  it('returns narrative text', async () => {
    const payload = { symbol: 'SPY', narrative: 'Dealers are long gamma.' };
    const { fetchFn, calls } = makeMockFetch(200, payload);
    expect(await makeClient(fetchFn).narrative('SPY')).toEqual(payload);
    expect(getCalledUrl(calls).pathname).toBe('/v1/exposure/narrative/SPY');
  });
});

describe('zeroDte()', () => {
  it('returns 0DTE data without params', async () => {
    const payload = { symbol: 'SPY', regime: 'long_gamma' };
    const { fetchFn, calls } = makeMockFetch(200, payload);
    expect(await makeClient(fetchFn).zeroDte('SPY')).toEqual(payload);
    expect(getCalledUrl(calls).pathname).toBe('/v1/exposure/zero-dte/SPY');
    expect(getCalledUrl(calls).search).toBe('');
  });

  it('sends strike_range param (mapped from strikeRange)', async () => {
    const { fetchFn, calls } = makeMockFetch(200, {});
    await makeClient(fetchFn).zeroDte('SPY', { strikeRange: 10 });
    expect(getCalledUrl(calls).searchParams.get('strike_range')).toBe('10');
  });
});

describe('exposureHistory()', () => {
  it('returns history without params', async () => {
    const { fetchFn, calls } = makeMockFetch(200, { symbol: 'SPY', history: [] });
    await makeClient(fetchFn).exposureHistory('SPY');
    expect(getCalledUrl(calls).pathname).toBe('/v1/exposure/history/SPY');
    expect(getCalledUrl(calls).search).toBe('');
  });

  it('sends days param', async () => {
    const { fetchFn, calls } = makeMockFetch(200, {});
    await makeClient(fetchFn).exposureHistory('SPY', { days: 30 });
    expect(getCalledUrl(calls).searchParams.get('days')).toBe('30');
  });
});

// ── Pricing & Sizing ──────────────────────────────────────────────────────────

describe('greeks()', () => {
  it('returns BSM greeks with required params', async () => {
    const payload = { delta: 0.5, gamma: 0.02, theta: -0.05, vega: 0.2 };
    const { fetchFn, calls } = makeMockFetch(200, payload);
    expect(await makeClient(fetchFn).greeks({ spot: 500, strike: 500, dte: 30, sigma: 0.2 })).toEqual(payload);
    const url = getCalledUrl(calls);
    expect(url.pathname).toBe('/v1/pricing/greeks');
    expect(url.searchParams.get('spot')).toBe('500');
    expect(url.searchParams.get('strike')).toBe('500');
    expect(url.searchParams.get('dte')).toBe('30');
    expect(url.searchParams.get('sigma')).toBe('0.2');
    expect(url.searchParams.get('type')).toBe('call');
  });

  it('sends optional r and q params', async () => {
    const { fetchFn, calls } = makeMockFetch(200, { delta: 0.5 });
    await makeClient(fetchFn).greeks({ spot: 500, strike: 500, dte: 30, sigma: 0.2, type: 'put', r: 0.05, q: 0.01 });
    const url = getCalledUrl(calls);
    expect(url.searchParams.get('type')).toBe('put');
    expect(url.searchParams.get('r')).toBe('0.05');
    expect(url.searchParams.get('q')).toBe('0.01');
  });
});

describe('iv()', () => {
  it('returns implied volatility', async () => {
    const payload = { iv: 0.215 };
    const { fetchFn, calls } = makeMockFetch(200, payload);
    expect(await makeClient(fetchFn).iv({ spot: 500, strike: 500, dte: 30, price: 5.5 })).toEqual(payload);
    const url = getCalledUrl(calls);
    expect(url.pathname).toBe('/v1/pricing/iv');
    expect(url.searchParams.get('price')).toBe('5.5');
    expect(url.searchParams.get('type')).toBe('call');
  });
});

describe('kelly()', () => {
  it('returns Kelly sizing with all params', async () => {
    const payload = { kelly_fraction: 0.05 };
    const { fetchFn, calls } = makeMockFetch(200, payload);
    expect(
      await makeClient(fetchFn).kelly({ spot: 500, strike: 500, dte: 30, sigma: 0.2, premium: 5, mu: 0.1 }),
    ).toEqual(payload);
    const url = getCalledUrl(calls);
    expect(url.pathname).toBe('/v1/pricing/kelly');
    expect(url.searchParams.get('premium')).toBe('5');
    expect(url.searchParams.get('mu')).toBe('0.1');
    expect(url.searchParams.get('type')).toBe('call');
  });
});

// ── Volatility Analytics ──────────────────────────────────────────────────────

describe('volatility()', () => {
  it('returns volatility analysis', async () => {
    const payload = { symbol: 'SPY', iv_rank: 45 };
    const { fetchFn, calls } = makeMockFetch(200, payload);
    expect(await makeClient(fetchFn).volatility('SPY')).toEqual(payload);
    expect(getCalledUrl(calls).pathname).toBe('/v1/volatility/SPY');
  });
});

describe('advVolatility()', () => {
  it('returns advanced volatility analytics', async () => {
    const payload = { symbol: 'SPY', svi: {} };
    const { fetchFn, calls } = makeMockFetch(200, payload);
    expect(await makeClient(fetchFn).advVolatility('SPY')).toEqual(payload);
    expect(getCalledUrl(calls).pathname).toBe('/v1/adv_volatility/SPY');
  });
});

// ── Error Handling ────────────────────────────────────────────────────────────

describe('error handling', () => {
  it('throws AuthenticationError on 401', async () => {
    const { fetchFn } = makeMockFetch(401, { detail: 'Invalid API key' });
    await expect(makeClient(fetchFn).health()).rejects.toThrow(AuthenticationError);
    await expect(makeClient(fetchFn).health()).rejects.toMatchObject({ statusCode: 401 });
  });

  it('throws TierRestrictedError on 403 with plan info', async () => {
    const { fetchFn } = makeMockFetch(403, {
      detail: 'Upgrade required',
      current_plan: 'free',
      required_plan: 'growth',
    });
    try {
      await makeClient(fetchFn).narrative('SPY');
      fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(TierRestrictedError);
      const e = err as TierRestrictedError;
      expect(e.statusCode).toBe(403);
      expect(e.currentPlan).toBe('free');
      expect(e.requiredPlan).toBe('growth');
    }
  });

  it('throws NotFoundError on 404', async () => {
    const { fetchFn } = makeMockFetch(404, { detail: 'Symbol not found' });
    await expect(makeClient(fetchFn).gex('UNKNOWN')).rejects.toThrow(NotFoundError);
    await expect(makeClient(fetchFn).gex('UNKNOWN')).rejects.toMatchObject({ statusCode: 404 });
  });

  it('throws RateLimitError on 429 with retryAfter', async () => {
    const { fetchFn } = makeMockFetch(429, { detail: 'Too many requests' }, { 'Retry-After': '60' });
    try {
      await makeClient(fetchFn).health();
      fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(RateLimitError);
      const e = err as RateLimitError;
      expect(e.statusCode).toBe(429);
      expect(e.retryAfter).toBe(60);
    }
  });

  it('throws RateLimitError on 429 without Retry-After header', async () => {
    const { fetchFn } = makeMockFetch(429, { detail: 'Too many requests' });
    await expect(makeClient(fetchFn).health()).rejects.toThrow(RateLimitError);
  });

  it('throws ServerError on 500', async () => {
    const { fetchFn } = makeMockFetch(500, { detail: 'Internal server error' });
    await expect(makeClient(fetchFn).health()).rejects.toThrow(ServerError);
    await expect(makeClient(fetchFn).health()).rejects.toMatchObject({ statusCode: 500 });
  });

  it('throws ServerError on 503', async () => {
    const { fetchFn } = makeMockFetch(503, { detail: 'Service unavailable' });
    await expect(makeClient(fetchFn).health()).rejects.toThrow(ServerError);
    await expect(makeClient(fetchFn).health()).rejects.toMatchObject({ statusCode: 503 });
  });

  it('throws FlashAlphaError on unexpected 4xx status', async () => {
    const { fetchFn } = makeMockFetch(418, { detail: "I'm a teapot" });
    await expect(makeClient(fetchFn).health()).rejects.toThrow(FlashAlphaError);
    await expect(makeClient(fetchFn).health()).rejects.toMatchObject({ statusCode: 418 });
  });

  it('extracts message from "message" field in error body', async () => {
    const { fetchFn } = makeMockFetch(401, { message: 'Bad key supplied' });
    await expect(makeClient(fetchFn).health()).rejects.toThrow('Bad key supplied');
  });

  it('handles non-JSON error body gracefully', async () => {
    const { fetchFn } = makeMockFetch(500, 'plain text error');
    await expect(makeClient(fetchFn).health()).rejects.toThrow(ServerError);
  });

  it('error has response body attached', async () => {
    const { fetchFn } = makeMockFetch(401, { detail: 'No key', code: 'UNAUTHORIZED' });
    try {
      await makeClient(fetchFn).health();
    } catch (err) {
      expect(err).toBeInstanceOf(AuthenticationError);
      const e = err as AuthenticationError;
      expect((e.response as Record<string, unknown>)['code']).toBe('UNAUTHORIZED');
    }
  });
});

// ── Custom base URL ───────────────────────────────────────────────────────────

describe('custom baseUrl', () => {
  it('uses custom baseUrl for requests', async () => {
    const { fetchFn, calls } = makeMockFetch(200, { status: 'ok' });
    const fa = new FlashAlpha('key', { baseUrl: 'http://localhost:9000', fetch: fetchFn });
    await fa.health();
    expect(calls[0].url.startsWith('http://localhost:9000')).toBe(true);
  });

  it('strips trailing slash from baseUrl', async () => {
    const { fetchFn, calls } = makeMockFetch(200, { status: 'ok' });
    const fa = new FlashAlpha('key', { baseUrl: 'http://localhost:9000/', fetch: fetchFn });
    await fa.health();
    expect(calls[0].url).toBe('http://localhost:9000/health');
  });
});

// ── Timeout ───────────────────────────────────────────────────────────────────

describe('timeout', () => {
  it('passes an AbortSignal to fetch', async () => {
    const { fetchFn, calls } = makeMockFetch(200, {});
    const fa = new FlashAlpha('key', { baseUrl: BASE, timeout: 5000, fetch: fetchFn });
    await fa.health();
    const init = calls[0].init;
    expect(init?.signal).toBeDefined();
    expect(init?.signal).toBeInstanceOf(AbortSignal);
  });
});
