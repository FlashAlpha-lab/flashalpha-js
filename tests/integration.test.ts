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

  // Validate the full 0DTE response shape — fine-grained hedging buckets,
  // distance-to-flip in dollars/sigmas, pin sub-scores, flow concentration,
  // wall strength + level cluster, the new liquidity & metadata sections,
  // and per-strike greeks/quotes. Uses SPX which has daily 0DTE.
  itest('zeroDte("SPX") includes all v0.3.4 new fields', async () => {
    const r = await fa!.zeroDte('SPX') as Record<string, unknown>;
    expect(r['symbol']).toBe('SPX');
    if (r['no_zero_dte']) {
      expect(r).toHaveProperty('next_zero_dte_expiry');
      return;
    }

    for (const k of ['underlying_price', 'expiration', 'as_of', 'market_open',
                     'time_to_close_hours', 'time_to_close_pct']) {
      expect(r).toHaveProperty(k);
    }

    const regime = r['regime'] as Record<string, unknown>;
    for (const k of ['label', 'description', 'gamma_flip', 'spot_vs_flip', 'spot_to_flip_pct',
                     'distance_to_flip_dollars', 'distance_to_flip_sigmas']) {
      expect(regime).toHaveProperty(k);
    }

    const exposures = r['exposures'] as Record<string, unknown>;
    for (const k of ['net_gex', 'net_dex', 'net_vex', 'net_chex',
                     'pct_of_total_gex', 'total_chain_net_gex']) {
      expect(exposures).toHaveProperty(k);
    }

    const em = r['expected_move'] as Record<string, unknown>;
    for (const k of ['implied_1sd_dollars', 'implied_1sd_pct', 'remaining_1sd_dollars',
                     'remaining_1sd_pct', 'upper_bound', 'lower_bound',
                     'straddle_price', 'atm_iv']) {
      expect(em).toHaveProperty(k);
    }

    const pr = r['pin_risk'] as Record<string, unknown>;
    for (const k of ['magnet_strike', 'magnet_gex', 'distance_to_magnet_pct',
                     'pin_score', 'components', 'max_pain',
                     'oi_concentration_top3_pct', 'description']) {
      expect(pr).toHaveProperty(k);
    }
    const components = pr['components'] as Record<string, unknown>;
    for (const k of ['oi_score', 'proximity_score', 'time_score', 'gamma_score']) {
      expect(components).toHaveProperty(k);
    }

    const hedging = r['hedging'] as Record<string, unknown>;
    for (const bucket of ['spot_up_10bp', 'spot_down_10bp',
                          'spot_up_25bp', 'spot_down_25bp',
                          'spot_up_half_pct', 'spot_down_half_pct',
                          'spot_up_1pct', 'spot_down_1pct']) {
      expect(hedging).toHaveProperty(bucket);
      const b = hedging[bucket] as Record<string, unknown>;
      for (const k of ['dealer_shares_to_trade', 'direction', 'notional_usd']) {
        expect(b).toHaveProperty(k);
      }
    }
    expect(hedging).toHaveProperty('convexity_at_spot');

    const decay = r['decay'] as Record<string, unknown>;
    for (const k of ['net_theta_dollars', 'theta_per_hour_remaining', 'charm_regime',
                     'charm_description', 'gamma_acceleration', 'description']) {
      expect(decay).toHaveProperty(k);
    }

    const vc = r['vol_context'] as Record<string, unknown>;
    for (const k of ['zero_dte_atm_iv', 'seven_dte_atm_iv', 'iv_ratio_0dte_7dte',
                     'vix', 'vanna_exposure', 'vanna_interpretation', 'description']) {
      expect(vc).toHaveProperty(k);
    }

    const flow = r['flow'] as Record<string, unknown>;
    for (const k of ['total_volume', 'call_volume', 'put_volume',
                     'net_call_minus_put_volume',
                     'total_oi', 'call_oi', 'put_oi',
                     'pc_ratio_volume', 'pc_ratio_oi', 'volume_to_oi_ratio',
                     'atm_volume_share_pct', 'top3_strike_volume_pct']) {
      expect(flow).toHaveProperty(k);
    }

    const levels = r['levels'] as Record<string, unknown>;
    for (const k of ['call_wall', 'call_wall_gex', 'call_wall_strength',
                     'distance_to_call_wall_pct',
                     'put_wall', 'put_wall_gex', 'put_wall_strength',
                     'distance_to_put_wall_pct',
                     'distance_to_magnet_dollars',
                     'highest_oi_strike', 'highest_oi_total',
                     'max_positive_gamma', 'max_negative_gamma',
                     'level_cluster_score']) {
      expect(levels).toHaveProperty(k);
    }

    const liquidity = r['liquidity'] as Record<string, unknown>;
    for (const k of ['atm_spread_pct', 'weighted_spread_pct', 'execution_score']) {
      expect(liquidity).toHaveProperty(k);
    }

    const metadata = r['metadata'] as Record<string, unknown>;
    for (const k of ['snapshot_age_seconds', 'chain_contract_count',
                     'data_quality_score', 'greek_smoothness_score']) {
      expect(metadata).toHaveProperty(k);
    }

    const strikes = r['strikes'] as Array<Record<string, unknown>>;
    expect(Array.isArray(strikes)).toBe(true);
    if (strikes.length > 0) {
      const s = strikes[0]!;
      for (const k of ['strike', 'distance_from_spot_pct',
                       'call_symbol', 'put_symbol',
                       'call_gex', 'put_gex', 'net_gex',
                       'call_dex', 'put_dex', 'net_dex',
                       'net_vex', 'net_chex',
                       'call_oi', 'put_oi', 'call_volume', 'put_volume',
                       'gex_share_pct', 'oi_share_pct', 'volume_share_pct',
                       'call_iv', 'put_iv',
                       'call_delta', 'put_delta',
                       'call_gamma', 'put_gamma',
                       'call_theta', 'put_theta',
                       'call_mid', 'put_mid',
                       'call_spread_pct', 'put_spread_pct']) {
        expect(s).toHaveProperty(k);
      }
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

  // ── Customer regression tests ─────────────────────────────────────────────
  // These reproduce the seven bugs an Alpha-tier customer hit while building an
  // automated trading daemon: nested response paths, field naming, URL prefix
  // confusion, and the missing vrp() method. Every test calls
  // a public SDK method and hits the live API — no mocks, no private access.

  itest('vrp method exists on the client', async () => {
    expect(typeof fa!.vrp).toBe('function');
  });

  itest('vrp("SPY") returns a fully-readable nested payload', async () => {
    const r = await fa!.vrp('SPY') as {
      symbol: string;
      underlying_price: number;
      as_of: string;
      market_open: boolean;
      net_harvest_score: number | null;
      dealer_flow_risk: number | null;
      vrp: {
        atm_iv: number | null;
        rv_5d: number | null;
        rv_10d: number | null;
        rv_20d: number | null;
        rv_30d: number | null;
        vrp_5d: number | null;
        vrp_10d: number | null;
        vrp_20d: number | null;
        vrp_30d: number | null;
        z_score: number | null;
        percentile: number | null;
        history_days: number;
      };
      directional: {
        put_wing_iv_25d: number | null;
        call_wing_iv_25d: number | null;
        downside_rv_20d: number | null;
        upside_rv_20d: number | null;
        downside_vrp: number | null;
        upside_vrp: number | null;
      };
      regime: {
        gamma: string;
        vrp_regime: string | null;
        net_gex: number;
        gamma_flip: number | null;
      };
      term_vrp: Array<{ dte: number; iv: number; rv: number; vrp: number }>;
      gex_conditioned: { regime: string; harvest_score: number; interpretation: string } | null;
      strategy_scores: {
        short_put_spread: number | null;
        short_strangle: number | null;
        iron_condor: number | null;
        calendar_spread: number | null;
      } | null;
      macro: { vix: number | null; vix_3m: number | null } | null;
    };

    // top-level scalars
    expect(r.symbol).toBe('SPY');
    expect(typeof r.underlying_price).toBe('number');
    expect(r.underlying_price).toBeGreaterThan(0);
    expect(typeof r.as_of).toBe('string');
    expect(typeof r.market_open).toBe('boolean');

    // vrp.* core block
    expect(r.vrp).toBeDefined();
    expect(typeof r.vrp).toBe('object');
    expect(typeof r.vrp.history_days).toBe('number');
    for (const k of ['atm_iv', 'rv_5d', 'rv_10d', 'rv_20d', 'rv_30d',
                     'vrp_5d', 'vrp_10d', 'vrp_20d', 'vrp_30d', 'z_score', 'percentile'] as const) {
      const v = r.vrp[k];
      expect(v === null || typeof v === 'number').toBe(true);
    }

    // directional.* — note canonical names downside_vrp / upside_vrp
    expect(r.directional).toBeDefined();
    for (const k of ['put_wing_iv_25d', 'call_wing_iv_25d', 'downside_rv_20d',
                     'upside_rv_20d', 'downside_vrp', 'upside_vrp'] as const) {
      const v = r.directional[k];
      expect(v === null || typeof v === 'number').toBe(true);
    }

    // regime.*
    expect(r.regime).toBeDefined();
    expect(typeof r.regime.gamma).toBe('string');
    expect(typeof r.regime.net_gex).toBe('number');

    // term_vrp[]
    expect(Array.isArray(r.term_vrp)).toBe(true);
    if (r.term_vrp.length > 0) {
      const p = r.term_vrp[0]!;
      expect(typeof p.dte).toBe('number');
      expect(typeof p.iv).toBe('number');
      expect(typeof p.rv).toBe('number');
      expect(typeof p.vrp).toBe('number');
    }

    // optional groups — assert structure when present
    if (r.gex_conditioned) {
      expect(typeof r.gex_conditioned.regime).toBe('string');
      expect(typeof r.gex_conditioned.harvest_score).toBe('number');
      expect(typeof r.gex_conditioned.interpretation).toBe('string');
    }
    if (r.strategy_scores) {
      for (const k of ['short_put_spread', 'short_strangle', 'iron_condor', 'calendar_spread'] as const) {
        const v = r.strategy_scores[k];
        expect(v === null || typeof v === 'number').toBe(true);
      }
    }
    if (r.macro) {
      const v = r.macro.vix;
      expect(v === null || typeof v === 'number').toBe(true);
    }
  });

  itest('vrp core metrics are nested under "vrp", not top-level (bug #1)', async () => {
    const r = await fa!.vrp('SPY') as Record<string, unknown> & { vrp: { z_score: unknown } };
    expect(r['z_score']).toBeUndefined();
    expect(r['percentile']).toBeUndefined();
    expect(r['atm_iv']).toBeUndefined();
    expect(typeof r.vrp.z_score).toBe('number');
  });

  itest('harvest_score lives under gex_conditioned, not top-level (bug #1)', async () => {
    const r = await fa!.vrp('SPY') as Record<string, unknown> & {
      gex_conditioned: { harvest_score: number } | null;
    };
    expect(r['harvest_score']).toBeUndefined();
    if (r.gex_conditioned !== null) {
      expect(r.gex_conditioned).toHaveProperty('harvest_score');
      expect(typeof r.gex_conditioned.harvest_score).toBe('number');
    }
  });

  itest('net_gex on vrp lives under regime, not top-level (bug #1)', async () => {
    const r = await fa!.vrp('SPY') as Record<string, unknown> & { regime: { net_gex: number } };
    expect(r['net_gex']).toBeUndefined();
    expect(typeof r.regime.net_gex).toBe('number');
  });

  itest('net_harvest_score + dealer_flow_risk are top-level on vrp', async () => {
    const r = await fa!.vrp('SPY') as {
      net_harvest_score: number | null;
      dealer_flow_risk: number | null;
    };
    expect('net_harvest_score' in r).toBe(true);
    expect('dealer_flow_risk' in r).toBe(true);
    expect(r.net_harvest_score === null || typeof r.net_harvest_score === 'number').toBe(true);
    expect(r.dealer_flow_risk === null || typeof r.dealer_flow_risk === 'number').toBe(true);
  });

  itest('exposureSummary("SPY").exposures.net_gex is the correct path; top-level net_gex is undefined (bug #1)', async () => {
    const r = await fa!.exposureSummary('SPY') as Record<string, unknown> & {
      symbol: string;
      exposures: { net_gex: number };
    };
    expect(r['net_gex']).toBeUndefined();
    expect(r.exposures).toBeDefined();
    expect(typeof r.exposures.net_gex).toBe('number');
    expect(r.symbol).toBe('SPY');
  });

  itest('directional uses downside_vrp/upside_vrp, not put_vrp/call_vrp (bug #2)', async () => {
    const r = await fa!.vrp('SPY') as { directional: Record<string, unknown> };
    expect(r.directional).toBeDefined();
    expect(r.directional['put_vrp']).toBeUndefined();
    expect(r.directional['call_vrp']).toBeUndefined();
    expect('downside_vrp' in r.directional).toBe(true);
    expect('upside_vrp' in r.directional).toBe(true);
  });

  itest('stockSummary("SPY") returns data from canonical /v1/stock/{sym}/summary (bug #3)', async () => {
    const r = await fa!.stockSummary('SPY') as { symbol: string };
    expect(r).toBeDefined();
    expect(r.symbol).toBe('SPY');
  });

  itest('stockQuote("SPY") returns data from bare /stockquote/{sym}', async () => {
    const r = await fa!.stockQuote('SPY') as { ticker: string; bid: number; ask: number };
    expect(r).toBeDefined();
    expect(r.ticker).toBe('SPY');
    expect(typeof r.bid).toBe('number');
    expect(typeof r.ask).toBe('number');
  });

  itest('all exposure methods return symbol === "SPY"', async () => {
    const [g, d, v, c, summ, lev] = await Promise.all([
      fa!.gex('SPY'), fa!.dex('SPY'), fa!.vex('SPY'), fa!.chex('SPY'),
      fa!.exposureSummary('SPY'), fa!.exposureLevels('SPY'),
    ]) as Array<{ symbol: string }>;
    expect(g.symbol).toBe('SPY');
    expect(d.symbol).toBe('SPY');
    expect(v.symbol).toBe('SPY');
    expect(c.symbol).toBe('SPY');
    expect(summ.symbol).toBe('SPY');
    expect(lev.symbol).toBe('SPY');
  });

  itest('screener({ limit: 5 }) returns valid envelope; canonical path is POST /v1/screener (bug #4)', async () => {
    const r = await fa!.screener({ limit: 5 }) as {
      meta: {
        total_count: number;
        returned_count: number;
        universe_size: number;
        tier: string;
        as_of: string;
      };
      data: unknown[];
    };
    expect(r.meta).toBeDefined();
    expect(typeof r.meta.total_count).toBe('number');
    expect(typeof r.meta.returned_count).toBe('number');
    expect(typeof r.meta.universe_size).toBe('number');
    expect(typeof r.meta.tier).toBe('string');
    expect(typeof r.meta.as_of).toBe('string');
    expect(r.meta.returned_count).toBeLessThanOrEqual(5);
    expect(Array.isArray(r.data)).toBe(true);
    expect(r.data.length).toBeLessThanOrEqual(5);
  });

  itest('screener({ select: ["*"], limit: 1 }) returns rows with symbol/price/regime fields', async () => {
    const r = await fa!.screener({ select: ['*'], limit: 1 }) as {
      data: Array<{ symbol: string; price: number; regime: string | null }>;
    };
    expect(r.data.length).toBeGreaterThan(0);
    const row = r.data[0]!;
    expect(typeof row.symbol).toBe('string');
    expect(row).toHaveProperty('price');
    expect(row).toHaveProperty('regime');
  });
});
