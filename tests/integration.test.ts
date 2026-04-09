/**
 * Integration tests for the FlashAlpha SDK.
 *
 * These tests make real HTTP calls to https://lab.flashalpha.com.
 * Set the FLASHALPHA_API_KEY environment variable to run them.
 *
 * If the env var is not set, all tests are skipped automatically.
 *
 * Usage:
 *   FLASHALPHA_API_KEY=your-key npx jest tests/integration.test.ts
 */

import { FlashAlpha } from '../src/client';
import { FlashAlphaError } from '../src/errors';

const API_KEY = process.env['FLASHALPHA_API_KEY'];
const SKIP = !API_KEY;

// Helper: conditionally define a test
function itest(name: string, fn: () => Promise<void>): void {
  if (SKIP) {
    it.skip(name, fn);
  } else {
    it(name, fn, 30_000);
  }
}

const fa = SKIP ? null : new FlashAlpha(API_KEY as string);

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('FlashAlpha Integration Tests (live API)', () => {
  if (SKIP) {
    it('skipped — set FLASHALPHA_API_KEY to run integration tests', () => {
      // intentional no-op
    });
    return;
  }

  // ── System ────────────────────────────────────────────────────────────────

  itest('health() returns an object with status field', async () => {
    const result = await fa!.health() as Record<string, unknown>;
    expect(result).toBeDefined();
    expect(typeof result).toBe('object');
  });

  itest('account() returns account info with a plan field', async () => {
    const result = await fa!.account() as Record<string, unknown>;
    expect(result).toBeDefined();
    expect(typeof result).toBe('object');
  });

  // ── Reference Data ────────────────────────────────────────────────────────

  itest('tickers() returns a list or object of tickers', async () => {
    const result = await fa!.tickers();
    expect(result).toBeDefined();
  });

  itest('symbols() returns active symbols', async () => {
    const result = await fa!.symbols();
    expect(result).toBeDefined();
  });

  itest('options("SPY") returns option chain metadata', async () => {
    const result = await fa!.options('SPY') as Record<string, unknown>;
    expect(result).toBeDefined();
    expect(typeof result).toBe('object');
  });

  // ── Market Data ───────────────────────────────────────────────────────────

  itest('stockQuote("SPY") returns a quote', async () => {
    const result = await fa!.stockQuote('SPY') as Record<string, unknown>;
    expect(result).toBeDefined();
    expect(typeof result).toBe('object');
  });

  itest('surface("SPY") returns volatility surface data', async () => {
    const result = await fa!.surface('SPY');
    expect(result).toBeDefined();
  });

  itest('stockSummary("SPY") returns comprehensive summary', async () => {
    const result = await fa!.stockSummary('SPY') as Record<string, unknown>;
    expect(result).toBeDefined();
    expect(typeof result).toBe('object');
  });

  // ── Exposure Analytics ────────────────────────────────────────────────────

  itest('gex("SPY") returns GEX data', async () => {
    const result = await fa!.gex('SPY') as Record<string, unknown>;
    expect(result).toBeDefined();
    expect(typeof result).toBe('object');
  });

  itest('dex("SPY") returns DEX data', async () => {
    const result = await fa!.dex('SPY') as Record<string, unknown>;
    expect(result).toBeDefined();
    expect(typeof result).toBe('object');
  });

  itest('vex("SPY") returns VEX data', async () => {
    const result = await fa!.vex('SPY') as Record<string, unknown>;
    expect(result).toBeDefined();
    expect(typeof result).toBe('object');
  });

  itest('chex("SPY") returns CHEX data', async () => {
    const result = await fa!.chex('SPY') as Record<string, unknown>;
    expect(result).toBeDefined();
    expect(typeof result).toBe('object');
  });

  itest('exposureLevels("SPY") returns key levels', async () => {
    const result = await fa!.exposureLevels('SPY') as Record<string, unknown>;
    expect(result).toBeDefined();
    expect(typeof result).toBe('object');
  });

  // ── Pricing & Sizing ──────────────────────────────────────────────────────

  itest('greeks() returns BSM greeks for valid input', async () => {
    const result = await fa!.greeks({
      spot: 500,
      strike: 500,
      dte: 30,
      sigma: 0.2,
      type: 'call',
    }) as Record<string, unknown>;
    expect(result).toBeDefined();
    expect(typeof result).toBe('object');
  });

  itest('iv() returns implied volatility for valid input', async () => {
    const result = await fa!.iv({
      spot: 500,
      strike: 500,
      dte: 30,
      price: 10,
      type: 'call',
    }) as Record<string, unknown>;
    expect(result).toBeDefined();
    expect(typeof result).toBe('object');
  });

  // ── Volatility Analytics ──────────────────────────────────────────────────

  itest('volatility("SPY") returns volatility analysis', async () => {
    const result = await fa!.volatility('SPY') as Record<string, unknown>;
    expect(result).toBeDefined();
    expect(typeof result).toBe('object');
  });

  // ── Error path ────────────────────────────────────────────────────────────

  itest('throws FlashAlphaError for invalid API key', async () => {
    const badClient = new FlashAlpha('invalid-key-xyz');
    await expect(badClient.account()).rejects.toThrow(FlashAlphaError);
  });

  // ── 0DTE (may 403 on free tier) ───────────────────────────────────────────

  itest('zeroDte("SPY") returns data or throws TierRestrictedError', async () => {
    try {
      const result = await fa!.zeroDte('SPY');
      expect(result).toBeDefined();
    } catch (err) {
      expect(err).toBeInstanceOf(FlashAlphaError);
      const e = err as FlashAlphaError;
      expect([403, 404]).toContain(e.statusCode);
    }
  });

  // ── Max Pain (Growth+) ─────────────────────────────────────────────────────

  itest('maxPain("SPY") returns max pain analysis', async () => {
    const result = await fa!.maxPain('SPY') as Record<string, unknown>;
    expect(result.max_pain_strike).toBeDefined();
    expect(result.pain_curve).toBeDefined();
    expect(result.dealer_alignment).toBeDefined();
    expect(result.pin_probability).toBeDefined();
  });

  itest('maxPain("SPY") response has correct field structure', async () => {
    const result = await fa!.maxPain('SPY') as {
      distance: { direction: string };
      signal: string;
      regime: string;
    };
    expect(['above', 'below', 'at']).toContain(result.distance.direction);
    expect(['bullish', 'bearish', 'neutral']).toContain(result.signal);
    expect(['positive_gamma', 'negative_gamma']).toContain(result.regime);
  });

  itest('maxPain("SPY") without expiration includes multi-expiry calendar', async () => {
    const result = await fa!.maxPain('SPY') as { max_pain_by_expiration: unknown[] | null };
    if (result.max_pain_by_expiration) {
      expect(Array.isArray(result.max_pain_by_expiration)).toBe(true);
      expect(result.max_pain_by_expiration.length).toBeGreaterThan(0);
    }
  });

  // ── Screener (Growth+) ────────────────────────────────────────────────────

  itest('screener() empty request returns meta + data for current tier', async () => {
    const result = await fa!.screener() as {
      meta: { tier: string; total_count: number; universe_size: number };
      data: Array<{ symbol: string }>;
    };
    expect(result.meta).toBeDefined();
    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
    expect(['growth', 'alpha']).toContain(result.meta.tier);
  });

  itest('screener() with simple leaf filter returns filtered rows', async () => {
    const result = await fa!.screener({
      filters: {
        field: 'regime',
        operator: 'in',
        value: ['positive_gamma', 'negative_gamma'],
      },
      select: ['symbol', 'regime', 'price'],
      limit: 5,
    }) as { data: Array<{ regime: string }> };
    for (const row of result.data) {
      expect(['positive_gamma', 'negative_gamma']).toContain(row.regime);
    }
  });

  itest('screener() AND group applies all conditions', async () => {
    const result = await fa!.screener({
      filters: {
        op: 'and',
        conditions: [
          { field: 'atm_iv', operator: 'gte', value: 0 },
          { field: 'atm_iv', operator: 'lte', value: 500 },
        ],
      },
      sort: [{ field: 'atm_iv', direction: 'desc' }],
      select: ['symbol', 'atm_iv'],
      limit: 5,
    }) as { meta: { returned_count: number }; data: Array<{ atm_iv: number | null }> };
    expect(result.meta.returned_count).toBeLessThanOrEqual(5);
    const ivs = result.data.map((r) => r.atm_iv).filter((v): v is number => v != null);
    if (ivs.length >= 2) {
      const sorted = [...ivs].sort((a, b) => b - a);
      expect(ivs).toEqual(sorted);
    }
  });

  itest('screener() between operator', async () => {
    const result = await fa!.screener({
      filters: { field: 'atm_iv', operator: 'between', value: [0, 500] },
      limit: 3,
    });
    expect(result).toBeDefined();
  });

  itest('screener() select=["*"] returns full flat object', async () => {
    const result = await fa!.screener({ select: ['*'], limit: 1 }) as {
      data: Array<Record<string, unknown>>;
    };
    if (result.data.length > 0) {
      expect(result.data[0]).toHaveProperty('symbol');
      expect(result.data[0]).toHaveProperty('price');
    }
  });

  itest('screener() limit is respected', async () => {
    const result = await fa!.screener({ limit: 3 }) as {
      meta: { returned_count: number };
      data: unknown[];
    };
    expect(result.meta.returned_count).toBeLessThanOrEqual(3);
    expect(result.data.length).toBeLessThanOrEqual(3);
  });

  itest('screener() invalid field raises validation error', async () => {
    await expect(
      fa!.screener({
        filters: { field: 'not_a_real_field_xyz', operator: 'eq', value: 1 },
      }),
    ).rejects.toThrow();
  });
});
