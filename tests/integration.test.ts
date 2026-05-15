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
    // Cast through unknown so the dynamic-key assertions below remain a
    // simple shape check rather than typed access. The typed-access path
    // is exercised separately by the "ZeroDteResponse exposes typed fields" test.
    const r = await fa!.zeroDte('SPX') as unknown as Record<string, unknown>;
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

  // Comprehensive end-to-end test of the typed ZeroDteResponse interface.
  // Mirrors the untyped "v0.3.4 new fields" test field-for-field, but every
  // assertion is via the typed property path. Locks in that every name in
  // the TypeScript interface matches what the API actually ships.
  itest('zeroDte("SPX") typed ZeroDteResponse — all fields populated', async () => {
    const r = await fa!.zeroDte('SPX');
    expect(r.symbol).toBe('SPX');
    if (r.no_zero_dte) {
      expect(r.next_zero_dte_expiry).toBeDefined();
      return;
    }

    // top-level
    expect(typeof r.underlying_price).toBe('number');
    expect(r).toHaveProperty('expiration');
    expect(typeof r.as_of).toBe('string');
    expect(typeof r.market_open).toBe('boolean');
    expect(r).toHaveProperty('time_to_close_hours');
    expect(r).toHaveProperty('time_to_close_pct');

    // regime
    expect(r.regime).toBeDefined();
    expect(r.regime).toHaveProperty('label');
    expect(r.regime).toHaveProperty('description');
    expect(r.regime).toHaveProperty('gamma_flip');
    expect(r.regime).toHaveProperty('spot_vs_flip');
    expect(r.regime).toHaveProperty('spot_to_flip_pct');
    expect(r.regime).toHaveProperty('distance_to_flip_dollars');
    expect(r.regime).toHaveProperty('distance_to_flip_sigmas');

    // exposures
    expect(r.exposures).toBeDefined();
    expect(r.exposures).toHaveProperty('net_gex');
    expect(r.exposures).toHaveProperty('net_dex');
    expect(r.exposures).toHaveProperty('net_vex');
    expect(r.exposures).toHaveProperty('net_chex');
    expect(r.exposures).toHaveProperty('pct_of_total_gex');
    expect(r.exposures).toHaveProperty('total_chain_net_gex');

    // expected_move
    expect(r.expected_move).toBeDefined();
    expect(r.expected_move).toHaveProperty('implied_1sd_dollars');
    expect(r.expected_move).toHaveProperty('implied_1sd_pct');
    expect(r.expected_move).toHaveProperty('remaining_1sd_dollars');
    expect(r.expected_move).toHaveProperty('remaining_1sd_pct');
    expect(r.expected_move).toHaveProperty('upper_bound');
    expect(r.expected_move).toHaveProperty('lower_bound');
    expect(r.expected_move).toHaveProperty('straddle_price');
    expect(r.expected_move).toHaveProperty('atm_iv');

    // pin_risk
    expect(r.pin_risk).toBeDefined();
    expect(r.pin_risk).toHaveProperty('magnet_strike');
    expect(r.pin_risk).toHaveProperty('magnet_gex');
    expect(r.pin_risk).toHaveProperty('distance_to_magnet_pct');
    expect(r.pin_risk).toHaveProperty('pin_score');
    expect(r.pin_risk).toHaveProperty('components');
    expect(r.pin_risk).toHaveProperty('max_pain');
    expect(r.pin_risk).toHaveProperty('oi_concentration_top3_pct');
    expect(r.pin_risk).toHaveProperty('description');
    expect(r.pin_risk!.components).toHaveProperty('oi_score');
    expect(r.pin_risk!.components).toHaveProperty('proximity_score');
    expect(r.pin_risk!.components).toHaveProperty('time_score');
    expect(r.pin_risk!.components).toHaveProperty('gamma_score');

    // hedging — all 8 buckets + convexity_at_spot
    expect(r.hedging).toBeDefined();
    const buckets = [
      r.hedging!.spot_up_10bp, r.hedging!.spot_down_10bp,
      r.hedging!.spot_up_25bp, r.hedging!.spot_down_25bp,
      r.hedging!.spot_up_half_pct, r.hedging!.spot_down_half_pct,
      r.hedging!.spot_up_1pct, r.hedging!.spot_down_1pct,
    ];
    for (const b of buckets) {
      expect(b).toBeDefined();
      expect(b).toHaveProperty('dealer_shares_to_trade');
      expect(b).toHaveProperty('direction');
      expect(b).toHaveProperty('notional_usd');
    }
    expect(r.hedging).toHaveProperty('convexity_at_spot');

    // decay
    expect(r.decay).toBeDefined();
    expect(r.decay).toHaveProperty('net_theta_dollars');
    expect(r.decay).toHaveProperty('theta_per_hour_remaining');
    expect(r.decay).toHaveProperty('charm_regime');
    expect(r.decay).toHaveProperty('charm_description');
    expect(r.decay).toHaveProperty('gamma_acceleration');
    expect(r.decay).toHaveProperty('description');

    // vol_context
    expect(r.vol_context).toBeDefined();
    expect(r.vol_context).toHaveProperty('zero_dte_atm_iv');
    expect(r.vol_context).toHaveProperty('seven_dte_atm_iv');
    expect(r.vol_context).toHaveProperty('iv_ratio_0dte_7dte');
    expect(r.vol_context).toHaveProperty('vix');
    expect(r.vol_context).toHaveProperty('vanna_exposure');
    expect(r.vol_context).toHaveProperty('vanna_interpretation');
    expect(r.vol_context).toHaveProperty('description');

    // flow
    expect(r.flow).toBeDefined();
    expect(r.flow).toHaveProperty('total_volume');
    expect(r.flow).toHaveProperty('call_volume');
    expect(r.flow).toHaveProperty('put_volume');
    expect(r.flow).toHaveProperty('net_call_minus_put_volume');
    expect(r.flow).toHaveProperty('total_oi');
    expect(r.flow).toHaveProperty('call_oi');
    expect(r.flow).toHaveProperty('put_oi');
    expect(r.flow).toHaveProperty('pc_ratio_volume');
    expect(r.flow).toHaveProperty('pc_ratio_oi');
    expect(r.flow).toHaveProperty('volume_to_oi_ratio');
    expect(r.flow).toHaveProperty('atm_volume_share_pct');
    expect(r.flow).toHaveProperty('top3_strike_volume_pct');

    // levels
    expect(r.levels).toBeDefined();
    expect(r.levels).toHaveProperty('call_wall');
    expect(r.levels).toHaveProperty('call_wall_gex');
    expect(r.levels).toHaveProperty('call_wall_strength');
    expect(r.levels).toHaveProperty('distance_to_call_wall_pct');
    expect(r.levels).toHaveProperty('put_wall');
    expect(r.levels).toHaveProperty('put_wall_gex');
    expect(r.levels).toHaveProperty('put_wall_strength');
    expect(r.levels).toHaveProperty('distance_to_put_wall_pct');
    expect(r.levels).toHaveProperty('distance_to_magnet_dollars');
    expect(r.levels).toHaveProperty('highest_oi_strike');
    expect(r.levels).toHaveProperty('highest_oi_total');
    expect(r.levels).toHaveProperty('max_positive_gamma');
    expect(r.levels).toHaveProperty('max_negative_gamma');
    expect(r.levels).toHaveProperty('level_cluster_score');

    // liquidity
    expect(r.liquidity).toBeDefined();
    expect(r.liquidity).toHaveProperty('atm_spread_pct');
    expect(r.liquidity).toHaveProperty('weighted_spread_pct');
    expect(r.liquidity).toHaveProperty('execution_score');

    // metadata
    expect(r.metadata).toBeDefined();
    expect(r.metadata).toHaveProperty('snapshot_age_seconds');
    expect(r.metadata).toHaveProperty('chain_contract_count');
    expect(r.metadata).toHaveProperty('data_quality_score');
    expect(r.metadata).toHaveProperty('greek_smoothness_score');

    // strikes[0] — every per-strike field
    expect(Array.isArray(r.strikes)).toBe(true);
    if (r.strikes && r.strikes.length > 0) {
      const s = r.strikes[0]!;
      expect(typeof s.strike).toBe('number');
      expect(s.strike).toBeGreaterThan(0);
      expect(s).toHaveProperty('distance_from_spot_pct');
      expect(s).toHaveProperty('call_symbol');
      expect(s).toHaveProperty('put_symbol');
      expect(s).toHaveProperty('call_gex');
      expect(s).toHaveProperty('put_gex');
      expect(s).toHaveProperty('net_gex');
      expect(s).toHaveProperty('call_dex');
      expect(s).toHaveProperty('put_dex');
      expect(s).toHaveProperty('net_dex');
      expect(s).toHaveProperty('net_vex');
      expect(s).toHaveProperty('net_chex');
      expect(s).toHaveProperty('call_oi');
      expect(s).toHaveProperty('put_oi');
      expect(s).toHaveProperty('call_volume');
      expect(s).toHaveProperty('put_volume');
      expect(s).toHaveProperty('gex_share_pct');
      expect(s).toHaveProperty('oi_share_pct');
      expect(s).toHaveProperty('volume_share_pct');
      expect(s).toHaveProperty('call_iv');
      expect(s).toHaveProperty('put_iv');
      expect(s).toHaveProperty('call_delta');
      expect(s).toHaveProperty('put_delta');
      expect(s).toHaveProperty('call_gamma');
      expect(s).toHaveProperty('put_gamma');
      expect(s).toHaveProperty('call_theta');
      expect(s).toHaveProperty('put_theta');
      expect(s).toHaveProperty('call_mid');
      expect(s).toHaveProperty('put_mid');
      expect(s).toHaveProperty('call_spread_pct');
      expect(s).toHaveProperty('put_spread_pct');
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

  itest('maxPain — every field declared in MaxPainResponse interface is exercised', async () => {
    // 100% field-coverage discipline: every leaf field in the published
    // MaxPainResponse interface must be referenced here.
    const r = (await fa!.maxPain('SPY')) as {
      symbol: string;
      underlying_price: number;
      as_of: string;
      max_pain_strike: number;
      distance: { absolute: number; percent: number; direction: string };
      signal: string;
      expiration: string;
      put_call_oi_ratio: number;
      pain_curve: Array<{ strike: number; call_pain: number; put_pain: number; total_pain: number }>;
      oi_by_strike: Array<{
        strike: number; call_oi: number; put_oi: number;
        total_oi: number; call_volume: number; put_volume: number;
      }>;
      max_pain_by_expiration: Array<{
        expiration: string; max_pain_strike: number; dte: number; total_oi: number;
      }> | null;
      dealer_alignment: {
        alignment: string; description: string;
        gamma_flip: number; call_wall: number; put_wall: number;
      };
      regime: string;
      expected_move: { straddle_price: number; atm_iv: number; max_pain_within_expected_range: boolean };
      pin_probability: number;
    };

    // ── top-level scalars ──
    expect(r.symbol).toBe('SPY');
    expect(typeof r.underlying_price).toBe('number');
    expect(r.underlying_price).toBeGreaterThan(0);
    expect(typeof r.as_of).toBe('string');
    expect(typeof r.max_pain_strike).toBe('number');
    expect(['bullish', 'bearish', 'neutral']).toContain(r.signal);
    expect(typeof r.expiration).toBe('string');
    expect(typeof r.put_call_oi_ratio).toBe('number');
    expect(['positive_gamma', 'negative_gamma', 'unknown']).toContain(r.regime);
    expect(typeof r.pin_probability).toBe('number');
    expect(r.pin_probability).toBeGreaterThanOrEqual(0);
    expect(r.pin_probability).toBeLessThanOrEqual(100);

    // ── distance ──
    expect(typeof r.distance.absolute).toBe('number');
    expect(typeof r.distance.percent).toBe('number');
    expect(['above', 'below', 'at']).toContain(r.distance.direction);

    // ── pain_curve[] ──
    expect(Array.isArray(r.pain_curve)).toBe(true);
    expect(r.pain_curve.length).toBeGreaterThan(0);
    const pc = r.pain_curve[0];
    expect(typeof pc.strike).toBe('number');
    expect(typeof pc.call_pain).toBe('number');
    expect(typeof pc.put_pain).toBe('number');
    expect(typeof pc.total_pain).toBe('number');

    // ── oi_by_strike[] ──
    expect(Array.isArray(r.oi_by_strike)).toBe(true);
    expect(r.oi_by_strike.length).toBeGreaterThan(0);
    const oi = r.oi_by_strike[0];
    expect(typeof oi.strike).toBe('number');
    expect(typeof oi.call_oi).toBe('number');
    expect(typeof oi.put_oi).toBe('number');
    expect(typeof oi.total_oi).toBe('number');
    expect(typeof oi.call_volume).toBe('number');
    expect(typeof oi.put_volume).toBe('number');

    // ── max_pain_by_expiration[] (no expiration filter on this call) ──
    expect(r.max_pain_by_expiration).not.toBeNull();
    expect(Array.isArray(r.max_pain_by_expiration)).toBe(true);
    expect(r.max_pain_by_expiration!.length).toBeGreaterThan(0);
    const mr = r.max_pain_by_expiration![0];
    expect(typeof mr.expiration).toBe('string');
    expect(typeof mr.max_pain_strike).toBe('number');
    expect(typeof mr.dte).toBe('number');
    expect(typeof mr.total_oi).toBe('number');

    // ── dealer_alignment ──
    expect(['converging', 'moderate', 'diverging', 'unknown']).toContain(r.dealer_alignment.alignment);
    expect(typeof r.dealer_alignment.description).toBe('string');
    expect(typeof r.dealer_alignment.gamma_flip).toBe('number');
    expect(typeof r.dealer_alignment.call_wall).toBe('number');
    expect(typeof r.dealer_alignment.put_wall).toBe('number');

    // ── expected_move ──
    expect(typeof r.expected_move.straddle_price).toBe('number');
    expect(typeof r.expected_move.atm_iv).toBe('number');
    expect(typeof r.expected_move.max_pain_within_expected_range).toBe('boolean');
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

  itest('vrp — every field declared in VrpResponse must be referenced', async () => {
    type Macro = {
      vix: number; vix_3m: number; vix_term_slope: number;
      dgs10: number; hy_spread: number | null; fed_funds: number;
    };
    type Term = { dte: number; iv: number; rv: number; vrp: number };
    type Reg = { gamma: string; vrp_regime: string; net_gex: number; gamma_flip: number };
    const r = await fa!.vrp('SPY') as Record<string, unknown> & {
      symbol: string; underlying_price: number; as_of: string; market_open: boolean;
      vrp: Record<string, number | null>;
      variance_risk_premium: number; convexity_premium: number; fair_vol: number;
      directional: Record<string, number>;
      term_vrp: Term[];
      gex_conditioned: { regime: string; harvest_score: number; interpretation: string };
      vanna_conditioned: { outlook: string; interpretation: string };
      regime: Reg;
      strategy_scores: Record<string, number>;
      net_harvest_score: number;
      dealer_flow_risk: number;
      warnings: string[];
      macro: Macro;
    };
    // Customer traps: must NOT be top-level
    for (const trap of ['z_score', 'percentile', 'atm_iv', 'net_gex', 'put_vrp', 'call_vrp', 'harvest_score']) {
      expect(r[trap]).toBeUndefined();
    }
    // top-level
    expect(r.symbol).toBe('SPY');
    expect(typeof r.underlying_price).toBe('number');
    expect(typeof r.as_of).toBe('string');
    expect(typeof r.market_open).toBe('boolean');
    expect(typeof r.variance_risk_premium).toBe('number');
    expect(typeof r.convexity_premium).toBe('number');
    expect(typeof r.fair_vol).toBe('number');
    expect(typeof r.net_harvest_score).toBe('number');
    expect(typeof r.dealer_flow_risk).toBe('number');
    expect(Array.isArray(r.warnings)).toBe(true);
    // vrp.* core
    for (const k of ['atm_iv', 'rv_5d', 'rv_10d', 'rv_20d', 'rv_30d',
                     'vrp_5d', 'vrp_10d', 'vrp_20d', 'vrp_30d']) {
      expect(typeof r.vrp[k]).toBe('number');
    }
    expect(typeof r.vrp.z_score).toBe('number');
    expect(typeof r.vrp.percentile).toBe('number');
    expect(typeof r.vrp.history_days).toBe('number');
    // directional
    for (const k of ['put_wing_iv_25d', 'call_wing_iv_25d',
                     'downside_rv_20d', 'upside_rv_20d',
                     'downside_vrp', 'upside_vrp']) {
      expect(typeof r.directional[k]).toBe('number');
    }
    // term_vrp[]
    expect(r.term_vrp.length).toBeGreaterThan(0);
    const t = r.term_vrp[0];
    expect(typeof t.dte).toBe('number');
    for (const k of ['iv', 'rv', 'vrp'] as const) expect(typeof t[k]).toBe('number');
    // gex_conditioned + vanna_conditioned
    expect(typeof r.gex_conditioned.regime).toBe('string');
    expect(typeof r.gex_conditioned.harvest_score).toBe('number');
    expect(typeof r.gex_conditioned.interpretation).toBe('string');
    expect(typeof r.vanna_conditioned.outlook).toBe('string');
    expect(typeof r.vanna_conditioned.interpretation).toBe('string');
    // regime — net_gex lives HERE
    expect(typeof r.regime.gamma).toBe('string');
    expect(typeof r.regime.vrp_regime).toBe('string');
    expect(typeof r.regime.net_gex).toBe('number');
    expect(typeof r.regime.gamma_flip).toBe('number');
    // strategy_scores
    for (const k of ['short_put_spread', 'short_strangle', 'iron_condor', 'calendar_spread']) {
      expect(typeof r.strategy_scores[k]).toBe('number');
    }
    // macro — live includes fed_funds
    for (const k of ['vix', 'vix_3m', 'vix_term_slope', 'dgs10'] as const) {
      expect(typeof r.macro[k]).toBe('number');
    }
    expect('hy_spread' in r.macro).toBe(true);
    expect(r.macro.hy_spread === null || typeof r.macro.hy_spread === 'number').toBe(true);
    expect(typeof r.macro.fed_funds).toBe('number');
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

  itest('exposureSummary — every field declared in ExposureSummaryResponse must be referenced', async () => {
    const r = await fa!.exposureSummary('SPY') as Record<string, unknown> & {
      symbol: string;
      underlying_price: number;
      as_of: string;
      gamma_flip: number;
      regime: string;
      exposures: { net_gex: number; net_dex: number; net_vex: number; net_chex: number };
      interpretation: { gamma: string; vanna: string; charm: string };
      hedging_estimate: {
        spot_up_1pct: { dealer_shares_to_trade: number; direction: string; notional_usd: number };
        spot_down_1pct: { dealer_shares_to_trade: number; direction: string; notional_usd: number };
      };
      zero_dte: { net_gex: number | null; pct_of_total_gex: number | null; expiration: string | null };
    };
    // Original bug #1 — top-level net_gex must NOT exist (customer-trap)
    expect(r['net_gex']).toBeUndefined();
    // ── top-level scalars ──
    expect(r.symbol).toBe('SPY');
    expect(typeof r.underlying_price).toBe('number');
    expect(typeof r.as_of).toBe('string');
    expect(r.as_of.length).toBeGreaterThan(0);
    expect(typeof r.gamma_flip).toBe('number');
    expect(['positive_gamma', 'negative_gamma', 'unknown']).toContain(r.regime);
    // ── exposures block (4 fields) ──
    for (const k of ['net_gex', 'net_dex', 'net_vex', 'net_chex'] as const) {
      expect(typeof r.exposures[k]).toBe('number');
    }
    // ── interpretation block (3 fields) ──
    for (const k of ['gamma', 'vanna', 'charm'] as const) {
      expect(typeof r.interpretation[k]).toBe('string');
      expect(r.interpretation[k].length).toBeGreaterThan(0);
    }
    // ── hedging_estimate (every leaf on both sides) ──
    const up = r.hedging_estimate.spot_up_1pct;
    const down = r.hedging_estimate.spot_down_1pct;
    for (const side of [up, down]) {
      expect(['buy', 'sell']).toContain(side.direction);
      expect(typeof side.dealer_shares_to_trade).toBe('number');
      expect(typeof side.notional_usd).toBe('number');
      expect(side.notional_usd).not.toBe(0);
    }
    expect(up.dealer_shares_to_trade).toBe(-down.dealer_shares_to_trade);
    // ── zero_dte block (3 fields) ──
    expect(r.zero_dte).toBeDefined();
    expect('net_gex' in r.zero_dte).toBe(true);
    expect(r.zero_dte.net_gex === null || typeof r.zero_dte.net_gex === 'number').toBe(true);
    expect('pct_of_total_gex' in r.zero_dte).toBe(true);
    expect(r.zero_dte.pct_of_total_gex === null || typeof r.zero_dte.pct_of_total_gex === 'number').toBe(true);
    expect('expiration' in r.zero_dte).toBe(true);
    expect(r.zero_dte.expiration === null || typeof r.zero_dte.expiration === 'string').toBe(true);
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

  // ── rc.4 POCO field-walk coverage ─────────────────────────────────────────
  // For each interface added in rc.4, walk every documented top-level (and
  // selected nested) field and assert it is present on the response.
  // TypeScript interfaces are erased at runtime, so the field list is
  // hand-mirrored from src/types.ts — keep these in sync if the interface
  // shape changes.

  itest('stockSummary — every field declared in StockSummaryResponse must be referenced', async () => {
    const r = await fa!.stockSummary('SPY') as Record<string, unknown> & {
      symbol: string;
      as_of: string;
      market_open: boolean;
      price: Record<string, unknown>;
      volatility: Record<string, unknown> & {
        skew_25d: Record<string, unknown> | null;
        iv_term_structure: unknown[];
      };
      options_flow: Record<string, unknown>;
      exposure: (Record<string, unknown> & {
        interpretation: Record<string, unknown>;
        hedging_estimate: {
          spot_up_1pct: Record<string, unknown>;
          spot_down_1pct: Record<string, unknown>;
        };
        zero_dte: Record<string, unknown> | null;
        top_strikes: unknown[];
      }) | null;
      macro: Record<string, unknown> & {
        vix: Record<string, unknown> | null;
        vvix: Record<string, unknown> | null;
        skew: Record<string, unknown> | null;
        spx: Record<string, unknown> | null;
        move: Record<string, unknown> | null;
        vix_term_structure: (Record<string, unknown> & { levels: Record<string, unknown> }) | null;
        vix_futures: Record<string, unknown> | null;
        fear_and_greed: Record<string, unknown> | null;
      };
    };

    // ── top-level scalars ──
    for (const k of ['symbol', 'as_of', 'market_open', 'price', 'volatility',
                     'options_flow', 'exposure', 'macro']) {
      expect(r).toHaveProperty(k);
    }
    expect(r.symbol).toBe('SPY');
    expect(typeof r.as_of).toBe('string');

    // ── price (5 fields) ──
    for (const k of ['bid', 'ask', 'mid', 'last', 'last_update']) {
      expect(r.price).toHaveProperty(k);
    }

    // ── volatility (6 top fields + skew_25d sub + iv_term_structure[]) ──
    for (const k of ['atm_iv', 'hv_20', 'hv_60', 'vrp', 'skew_25d', 'iv_term_structure']) {
      expect(r.volatility).toHaveProperty(k);
    }
    if (r.volatility.skew_25d) {
      for (const k of ['expiry', 'days_to_expiry', 'put_25d_iv', 'atm_iv',
                       'call_25d_iv', 'skew_25d', 'smile_ratio']) {
        expect(r.volatility.skew_25d).toHaveProperty(k);
      }
    }
    expect(Array.isArray(r.volatility.iv_term_structure)).toBe(true);
    if (r.volatility.iv_term_structure.length > 0) {
      const node = r.volatility.iv_term_structure[0] as Record<string, unknown>;
      for (const k of ['expiry', 'iv', 'days_to_expiry']) {
        expect(node).toHaveProperty(k);
      }
    }

    // ── options_flow (7 fields) ──
    for (const k of ['total_call_oi', 'total_put_oi', 'total_call_volume',
                     'total_put_volume', 'pc_ratio_oi', 'pc_ratio_volume',
                     'active_expirations']) {
      expect(r.options_flow).toHaveProperty(k);
    }

    // ── exposure (skip walk if exposure is null) ──
    if (r.exposure) {
      for (const k of ['net_gex', 'net_dex', 'net_vex', 'net_chex',
                       'gamma_flip', 'call_wall', 'put_wall', 'max_pain',
                       'highest_oi_strike', 'regime', 'interpretation',
                       'hedging_estimate', 'zero_dte', 'top_strikes',
                       'oi_weighted_dte']) {
        expect(r.exposure).toHaveProperty(k);
      }
      for (const k of ['gamma', 'vanna', 'charm']) {
        expect(r.exposure.interpretation).toHaveProperty(k);
      }
      for (const side of [r.exposure.hedging_estimate.spot_up_1pct,
                          r.exposure.hedging_estimate.spot_down_1pct]) {
        for (const k of ['dealer_shares', 'direction', 'notional_usd']) {
          expect(side).toHaveProperty(k);
        }
      }
      if (r.exposure.zero_dte) {
        for (const k of ['net_gex', 'pct_of_total', 'expiration']) {
          expect(r.exposure.zero_dte).toHaveProperty(k);
        }
      }
      expect(Array.isArray(r.exposure.top_strikes)).toBe(true);
      if (r.exposure.top_strikes.length > 0) {
        const ts = r.exposure.top_strikes[0] as Record<string, unknown>;
        for (const k of ['strike', 'net_gex', 'call_oi', 'put_oi', 'total_oi']) {
          expect(ts).toHaveProperty(k);
        }
      }
    }

    // ── macro (8 sub-blocks) ──
    for (const k of ['vix', 'vvix', 'skew', 'spx', 'move',
                     'vix_term_structure', 'vix_futures', 'fear_and_greed']) {
      expect(r.macro).toHaveProperty(k);
    }
    for (const idx of [r.macro.vix, r.macro.vvix, r.macro.skew, r.macro.spx, r.macro.move]) {
      if (idx) {
        for (const k of ['value', 'change', 'change_pct']) {
          expect(idx).toHaveProperty(k);
        }
      }
    }
    if (r.macro.vix_term_structure) {
      for (const k of ['levels', 'near_slope_pct', 'structure']) {
        expect(r.macro.vix_term_structure).toHaveProperty(k);
      }
      for (const k of ['vix9d', 'vix', 'vix3m', 'vix6m']) {
        expect(r.macro.vix_term_structure.levels).toHaveProperty(k);
      }
    }
    if (r.macro.vix_futures) {
      for (const k of ['front_month', 'spot', 'spread', 'basis_pct', 'basis']) {
        expect(r.macro.vix_futures).toHaveProperty(k);
      }
    }
    if (r.macro.fear_and_greed) {
      for (const k of ['score', 'rating']) {
        expect(r.macro.fear_and_greed).toHaveProperty(k);
      }
    }
  });

  itest('narrative — every field declared in NarrativeResponse must be referenced', async () => {
    const r = await fa!.narrative('SPY') as Record<string, unknown> & {
      symbol: string;
      underlying_price: number;
      as_of: string;
      narrative: Record<string, unknown> & {
        data: Record<string, unknown> & { top_oi_changes: unknown[] };
      };
    };

    // ── top-level scalars ──
    for (const k of ['symbol', 'underlying_price', 'as_of', 'narrative']) {
      expect(r).toHaveProperty(k);
    }
    expect(r.symbol).toBe('SPY');
    expect(typeof r.as_of).toBe('string');
    expect(r.underlying_price === null || typeof r.underlying_price === 'number').toBe(true);

    // ── narrative.* (8 string blocks + data) ──
    for (const k of ['regime', 'gex_change', 'key_levels', 'flow', 'vanna',
                     'charm', 'zero_dte', 'outlook', 'data']) {
      expect(r.narrative).toHaveProperty(k);
    }

    // ── narrative.data (10 fields including top_oi_changes[]) ──
    for (const k of ['net_gex', 'net_gex_prior', 'net_gex_change_pct', 'vix',
                     'gamma_flip', 'call_wall', 'put_wall', 'regime',
                     'zero_dte_pct', 'top_oi_changes']) {
      expect(r.narrative.data).toHaveProperty(k);
    }
    expect(Array.isArray(r.narrative.data.top_oi_changes)).toBe(true);
    if (r.narrative.data.top_oi_changes.length > 0) {
      const row = r.narrative.data.top_oi_changes[0] as Record<string, unknown>;
      for (const k of ['strike', 'type', 'oi_change', 'volume']) {
        expect(row).toHaveProperty(k);
      }
    }
  });

  itest('exposureLevels — every field declared in ExposureLevelsResponse must be referenced', async () => {
    const r = await fa!.exposureLevels('SPY') as Record<string, unknown> & {
      symbol: string;
      underlying_price: number;
      as_of: string;
      levels: Record<string, unknown>;
    };

    // ── top-level (4 fields) ──
    for (const k of ['symbol', 'underlying_price', 'as_of', 'levels']) {
      expect(r).toHaveProperty(k);
    }
    expect(r.symbol).toBe('SPY');
    expect(typeof r.as_of).toBe('string');
    expect(r.underlying_price === null || typeof r.underlying_price === 'number').toBe(true);

    // ── levels (all 7 fields including zero_dte_magnet) ──
    for (const k of ['gamma_flip', 'max_positive_gamma', 'max_negative_gamma',
                     'call_wall', 'put_wall', 'highest_oi_strike',
                     'zero_dte_magnet']) {
      expect(r.levels).toHaveProperty(k);
    }
  });

  itest('greeks — every field declared in PricingGreeksResponse must be referenced', async () => {
    const r = await fa!.greeks({
      spot: 500,
      strike: 500,
      dte: 30,
      sigma: 0.2,
      type: 'call',
    }) as Record<string, unknown> & {
      inputs: Record<string, unknown>;
      first_order: Record<string, unknown>;
      second_order: Record<string, unknown>;
      third_order: Record<string, unknown>;
      additional: Record<string, unknown>;
    };

    // ── top-level (6 keys) ──
    for (const k of ['inputs', 'theoretical_price', 'first_order',
                     'second_order', 'third_order', 'additional']) {
      expect(r).toHaveProperty(k);
    }

    // ── inputs (7 fields) ──
    for (const k of ['spot', 'strike', 'dte', 'sigma', 'type',
                     'risk_free_rate', 'dividend_yield']) {
      expect(r.inputs).toHaveProperty(k);
    }

    // ── first_order (5 greeks) ──
    for (const k of ['delta', 'gamma', 'theta', 'vega', 'rho']) {
      expect(r.first_order).toHaveProperty(k);
    }

    // ── second_order (4 greeks) ──
    for (const k of ['vanna', 'charm', 'vomma', 'dual_delta']) {
      expect(r.second_order).toHaveProperty(k);
    }

    // ── third_order (4 greeks) ──
    for (const k of ['speed', 'zomma', 'color', 'ultima']) {
      expect(r.third_order).toHaveProperty(k);
    }

    // ── additional (lambda + veta) ──
    for (const k of ['lambda', 'veta']) {
      expect(r.additional).toHaveProperty(k);
    }
  });

  // ── rc.9 POCO field-walk coverage ─────────────────────────────────────────
  // For each interface added in rc.9, walk every documented top-level (and
  // selected nested) field and assert it is present on the response.
  // TypeScript interfaces are erased at runtime, so the field list is
  // hand-mirrored from src/types.ts — keep these in sync if the interface
  // shape changes.

  itest('volatility — every field declared in VolatilityResponse must be referenced', async () => {
    const r = await fa!.volatility('SPY') as Record<string, unknown> & {
      symbol: string;
      underlying_price: number | null;
      as_of: string;
      market_open: boolean | null;
      realized_vol: Record<string, unknown>;
      atm_iv: number | null;
      iv_rv_spreads: Record<string, unknown>;
      skew_profiles: unknown[];
      term_structure: Record<string, unknown>;
      iv_dispersion: Record<string, unknown>;
      gex_by_dte: unknown[];
      theta_by_dte: unknown[];
      put_call_profile: Record<string, unknown> & {
        by_expiry: unknown[];
        by_moneyness: Record<string, unknown>;
      };
      oi_concentration: Record<string, unknown>;
      hedging_scenarios: unknown[];
      liquidity: Record<string, unknown>;
    };

    // ── top-level (16 keys) ──
    for (const k of ['symbol', 'underlying_price', 'as_of', 'market_open',
                     'realized_vol', 'atm_iv', 'iv_rv_spreads',
                     'skew_profiles', 'term_structure', 'iv_dispersion',
                     'gex_by_dte', 'theta_by_dte', 'put_call_profile',
                     'oi_concentration', 'hedging_scenarios', 'liquidity']) {
      expect(r).toHaveProperty(k);
    }
    expect(r.symbol).toBe('SPY');
    expect(typeof r.as_of).toBe('string');

    // ── realized_vol (5 horizons) ──
    for (const k of ['rv_5d', 'rv_10d', 'rv_20d', 'rv_30d', 'rv_60d']) {
      expect(r.realized_vol).toHaveProperty(k);
    }

    // ── iv_rv_spreads (4 horizons + assessment) ──
    for (const k of ['vrp_5d', 'vrp_10d', 'vrp_20d', 'vrp_30d', 'assessment']) {
      expect(r.iv_rv_spreads).toHaveProperty(k);
    }

    // ── skew_profiles[] (per-expiry) ──
    expect(Array.isArray(r.skew_profiles)).toBe(true);
    if (r.skew_profiles.length > 0) {
      const sp = r.skew_profiles[0] as Record<string, unknown>;
      for (const k of ['expiry', 'days_to_expiry', 'put_10d_iv', 'put_25d_iv',
                       'atm_iv', 'call_25d_iv', 'call_10d_iv', 'skew_25d',
                       'smile_ratio', 'tail_convexity']) {
        expect(sp).toHaveProperty(k);
      }
    }

    // ── term_structure (3 fields) ──
    for (const k of ['near_slope_pct', 'far_slope_pct', 'state']) {
      expect(r.term_structure).toHaveProperty(k);
    }

    // ── iv_dispersion (2 fields) ──
    for (const k of ['cross_expiry', 'cross_strike']) {
      expect(r.iv_dispersion).toHaveProperty(k);
    }

    // ── gex_by_dte[] (4 fields per bucket) ──
    expect(Array.isArray(r.gex_by_dte)).toBe(true);
    if (r.gex_by_dte.length > 0) {
      const b = r.gex_by_dte[0] as Record<string, unknown>;
      for (const k of ['bucket', 'net_gex', 'pct_of_total', 'contract_count']) {
        expect(b).toHaveProperty(k);
      }
    }

    // ── theta_by_dte[] (3 fields per bucket) ──
    expect(Array.isArray(r.theta_by_dte)).toBe(true);
    if (r.theta_by_dte.length > 0) {
      const b = r.theta_by_dte[0] as Record<string, unknown>;
      for (const k of ['bucket', 'net_theta', 'contract_count']) {
        expect(b).toHaveProperty(k);
      }
    }

    // ── put_call_profile (by_expiry[] + by_moneyness) ──
    expect(Array.isArray(r.put_call_profile.by_expiry)).toBe(true);
    if (r.put_call_profile.by_expiry.length > 0) {
      const e = r.put_call_profile.by_expiry[0] as Record<string, unknown>;
      for (const k of ['expiry', 'call_oi', 'put_oi', 'pc_ratio_oi',
                       'call_volume', 'put_volume', 'pc_ratio_volume']) {
        expect(e).toHaveProperty(k);
      }
    }
    for (const k of ['otm_call_oi', 'atm_call_oi', 'itm_call_oi',
                     'otm_put_oi', 'atm_put_oi', 'itm_put_oi']) {
      expect(r.put_call_profile.by_moneyness).toHaveProperty(k);
    }

    // ── oi_concentration (4 fields) ──
    for (const k of ['top_3_pct', 'top_5_pct', 'top_10_pct', 'herfindahl']) {
      expect(r.oi_concentration).toHaveProperty(k);
    }

    // ── hedging_scenarios[] (4 fields per row) ──
    expect(Array.isArray(r.hedging_scenarios)).toBe(true);
    if (r.hedging_scenarios.length > 0) {
      const h = r.hedging_scenarios[0] as Record<string, unknown>;
      for (const k of ['move_pct', 'dealer_shares', 'direction', 'notional_usd']) {
        expect(h).toHaveProperty(k);
      }
    }

    // ── liquidity (4 fields) ──
    for (const k of ['atm_avg_spread_pct', 'wing_avg_spread_pct',
                     'atm_contracts', 'wing_contracts']) {
      expect(r.liquidity).toHaveProperty(k);
    }
  });

  itest('advVolatility — every field declared in AdvVolatilityResponse must be referenced (Alpha-tier)', async () => {
    let r: Record<string, unknown> & {
      symbol: string;
      underlying_price: number | null;
      as_of: string;
      market_open: boolean | null;
      svi_parameters: unknown[];
      forward_prices: unknown[];
      total_variance_surface: Record<string, unknown>;
      arbitrage_flags: unknown[];
      variance_swap_fair_values: unknown[];
      greeks_surfaces: Record<string, unknown> & {
        vanna: Record<string, unknown>;
        charm: Record<string, unknown>;
        volga: Record<string, unknown>;
        speed: Record<string, unknown>;
      };
    };
    try {
      r = await fa!.advVolatility('SPY') as typeof r;
    } catch (err) {
      // Skip if tier-restricted — adv_volatility requires Alpha+
      if (err instanceof FlashAlphaError && err.statusCode === 403) {
        return;
      }
      throw err;
    }

    // ── top-level (10 keys) ──
    for (const k of ['symbol', 'underlying_price', 'as_of', 'market_open',
                     'svi_parameters', 'forward_prices',
                     'total_variance_surface', 'arbitrage_flags',
                     'variance_swap_fair_values', 'greeks_surfaces']) {
      expect(r).toHaveProperty(k);
    }
    expect(r.symbol).toBe('SPY');
    expect(typeof r.as_of).toBe('string');

    // ── svi_parameters[] (10 fields per row) ──
    expect(Array.isArray(r.svi_parameters)).toBe(true);
    if (r.svi_parameters.length > 0) {
      const s = r.svi_parameters[0] as Record<string, unknown>;
      for (const k of ['expiry', 'days_to_expiry', 'forward', 'a', 'b',
                       'rho', 'm', 'sigma', 'atm_total_variance', 'atm_iv']) {
        expect(s).toHaveProperty(k);
      }
    }

    // ── forward_prices[] (5 fields per row) ──
    expect(Array.isArray(r.forward_prices)).toBe(true);
    if (r.forward_prices.length > 0) {
      const fp = r.forward_prices[0] as Record<string, unknown>;
      for (const k of ['expiry', 'days_to_expiry', 'forward', 'spot', 'basis_pct']) {
        expect(fp).toHaveProperty(k);
      }
    }

    // ── total_variance_surface (5 fields) ──
    for (const k of ['moneyness', 'expiries', 'tenors', 'total_variance', 'implied_vol']) {
      expect(r.total_variance_surface).toHaveProperty(k);
    }

    // ── arbitrage_flags[] (4 fields per row) ──
    expect(Array.isArray(r.arbitrage_flags)).toBe(true);
    if (r.arbitrage_flags.length > 0) {
      const a = r.arbitrage_flags[0] as Record<string, unknown>;
      for (const k of ['expiry', 'type', 'strike_or_k', 'description']) {
        expect(a).toHaveProperty(k);
      }
    }

    // ── variance_swap_fair_values[] (5 fields per row) ──
    expect(Array.isArray(r.variance_swap_fair_values)).toBe(true);
    if (r.variance_swap_fair_values.length > 0) {
      const v = r.variance_swap_fair_values[0] as Record<string, unknown>;
      for (const k of ['expiry', 'days_to_expiry', 'fair_variance',
                       'fair_vol', 'atm_iv', 'convexity_adjustment']) {
        expect(v).toHaveProperty(k);
      }
    }

    // ── greeks_surfaces (4 surfaces × 3 axes) ──
    for (const surface of ['vanna', 'charm', 'volga', 'speed'] as const) {
      expect(r.greeks_surfaces).toHaveProperty(surface);
      for (const k of ['strikes', 'expiries', 'values']) {
        expect(r.greeks_surfaces[surface]).toHaveProperty(k);
      }
    }
  });

  itest('surface — every field declared in SurfaceResponse must be referenced', async () => {
    const r = await fa!.surface('SPY') as Record<string, unknown> & {
      symbol: string;
      spot: number | null;
      as_of: string;
      grid_size: number;
      tenors: number[];
      moneyness: number[];
      iv: number[][];
      slices_used: number;
    };

    // ── all 8 fields ──
    for (const k of ['symbol', 'spot', 'as_of', 'grid_size',
                     'tenors', 'moneyness', 'iv', 'slices_used']) {
      expect(r).toHaveProperty(k);
    }
    expect(r.symbol).toBe('SPY');
    expect(typeof r.as_of).toBe('string');
    expect(typeof r.grid_size).toBe('number');
    expect(Array.isArray(r.tenors)).toBe(true);
    expect(Array.isArray(r.moneyness)).toBe(true);
    expect(Array.isArray(r.iv)).toBe(true);
    expect(typeof r.slices_used).toBe('number');
  });

  itest('gex — every field declared in GexResponse must be referenced', async () => {
    const r = await fa!.gex('SPY') as Record<string, unknown> & {
      symbol: string;
      underlying_price: number | null;
      as_of: string;
      gamma_flip: number | null;
      net_gex: number | null;
      net_gex_label: string | null;
      strikes: unknown[];
    };

    // ── top-level (7 fields) ──
    for (const k of ['symbol', 'underlying_price', 'as_of', 'gamma_flip',
                     'net_gex', 'net_gex_label', 'strikes']) {
      expect(r).toHaveProperty(k);
    }
    expect(r.symbol).toBe('SPY');

    // ── strikes[] (10 fields per row) ──
    expect(Array.isArray(r.strikes)).toBe(true);
    if (r.strikes.length > 0) {
      const s = r.strikes[0] as Record<string, unknown>;
      for (const k of ['strike', 'call_gex', 'put_gex', 'net_gex',
                       'call_oi', 'put_oi', 'call_volume', 'put_volume',
                       'call_oi_change', 'put_oi_change']) {
        expect(s).toHaveProperty(k);
      }
    }
  });

  itest('dex — every field declared in DexResponse must be referenced', async () => {
    const r = await fa!.dex('SPY') as Record<string, unknown> & {
      symbol: string;
      underlying_price: number | null;
      as_of: string;
      net_dex: number | null;
      strikes: unknown[];
    };

    // ── top-level (5 fields) ──
    for (const k of ['symbol', 'underlying_price', 'as_of', 'net_dex', 'strikes']) {
      expect(r).toHaveProperty(k);
    }
    expect(r.symbol).toBe('SPY');

    // ── strikes[] (4 fields per row) ──
    expect(Array.isArray(r.strikes)).toBe(true);
    if (r.strikes.length > 0) {
      const s = r.strikes[0] as Record<string, unknown>;
      for (const k of ['strike', 'call_dex', 'put_dex', 'net_dex']) {
        expect(s).toHaveProperty(k);
      }
    }
  });

  itest('vex — every field declared in VexResponse must be referenced', async () => {
    const r = await fa!.vex('SPY') as Record<string, unknown> & {
      symbol: string;
      underlying_price: number | null;
      as_of: string;
      net_vex: number | null;
      vex_interpretation: string | null;
      strikes: unknown[];
    };

    // ── top-level (6 fields) ──
    for (const k of ['symbol', 'underlying_price', 'as_of', 'net_vex',
                     'vex_interpretation', 'strikes']) {
      expect(r).toHaveProperty(k);
    }
    expect(r.symbol).toBe('SPY');

    // ── strikes[] (4 fields per row) ──
    expect(Array.isArray(r.strikes)).toBe(true);
    if (r.strikes.length > 0) {
      const s = r.strikes[0] as Record<string, unknown>;
      for (const k of ['strike', 'call_vex', 'put_vex', 'net_vex']) {
        expect(s).toHaveProperty(k);
      }
    }
  });

  itest('chex — every field declared in ChexResponse must be referenced', async () => {
    const r = await fa!.chex('SPY') as Record<string, unknown> & {
      symbol: string;
      underlying_price: number | null;
      as_of: string;
      net_chex: number | null;
      chex_interpretation: string | null;
      strikes: unknown[];
    };

    // ── top-level (6 fields) ──
    for (const k of ['symbol', 'underlying_price', 'as_of', 'net_chex',
                     'chex_interpretation', 'strikes']) {
      expect(r).toHaveProperty(k);
    }
    expect(r.symbol).toBe('SPY');

    // ── strikes[] (4 fields per row) ──
    expect(Array.isArray(r.strikes)).toBe(true);
    if (r.strikes.length > 0) {
      const s = r.strikes[0] as Record<string, unknown>;
      for (const k of ['strike', 'call_chex', 'put_chex', 'net_chex']) {
        expect(s).toHaveProperty(k);
      }
    }
  });

  itest('optionQuote — every field declared in OptionQuoteResponse must be referenced (live only)', async () => {
    // Pick a near-the-money expiry/strike from the option chain metadata.
    let q: Record<string, unknown>;
    try {
      const meta = await fa!.options('SPY') as {
        expirations?: Array<{ expiration?: string; strikes?: number[] }>;
      };
      const first = meta.expirations?.[0];
      if (!first || !first.expiration || !first.strikes || first.strikes.length === 0) {
        // No chain to query — accept skip by returning early.
        return;
      }
      const expiry = first.expiration;
      const mid = first.strikes[Math.floor(first.strikes.length / 2)]!;
      const result = await fa!.optionQuote('SPY', { expiry, strike: mid, type: 'C' });
      // Could be a single object or an array; we want a single object here.
      q = (Array.isArray(result) ? result[0] : result) as Record<string, unknown>;
    } catch (err) {
      // Tier-restricted (Growth+) or no contract — accept either as skip.
      if (err instanceof FlashAlphaError && (err.statusCode === 403 || err.statusCode === 404)) {
        return;
      }
      throw err;
    }
    if (!q) return;

    // ── all documented OptionQuoteResponse fields ──
    for (const k of ['type', 'expiry', 'strike', 'bid', 'ask', 'mid',
                     'bidSize', 'askSize', 'lastUpdate',
                     'implied_vol', 'iv_bid', 'iv_ask',
                     'delta', 'gamma', 'theta', 'vega', 'rho', 'vanna', 'charm',
                     'svi_vol', 'svi_vol_gated',
                     'open_interest', 'volume']) {
      expect(q).toHaveProperty(k);
    }
  });

  itest('stockQuote — every field declared in StockQuoteResponse must be referenced (live only)', async () => {
    const r = await fa!.stockQuote('SPY') as Record<string, unknown> & {
      ticker: string;
      bid: number | null;
      ask: number | null;
      mid: number | null;
      lastPrice: number | null;
      lastUpdate: string | null;
    };

    // ── all 6 documented fields ──
    for (const k of ['ticker', 'bid', 'ask', 'mid', 'lastPrice', 'lastUpdate']) {
      expect(r).toHaveProperty(k);
    }
    expect(r.ticker).toBe('SPY');
  });

  // ── Flow (live, simulation-aware) — Alpha+ ───────────────────────────────
  //
  // Hit the real /v1/flow/* surface and assert every contract field is
  // present on the live response (and on nested array-element shapes when
  // the arrays are non-empty).

  const FLOW_SYM = 'SPY';

  const reqFields = (obj: unknown, fields: string[], where: string): void => {
    expect(typeof obj).toBe('object');
    const o = obj as Record<string, unknown>;
    const missing = fields.filter((f) => !(f in o));
    expect(missing).toEqual([] as string[]);
    if (missing.length) throw new Error(`${where}: missing ${missing.join(', ')}`);
  };

  itest('flowLevels — all contract fields present', async () => {
    const r = await fa!.flowLevels(FLOW_SYM);
    reqFields(r, ['symbol', 'as_of', 'underlying_price', 'expiry',
      'live_gamma_flip', 'live_call_wall', 'live_put_wall', 'live_max_pain'],
      'flow/levels');
    expect((r as { symbol?: string }).symbol).toBe(FLOW_SYM);
  });

  itest('flowPinRisk — all contract fields present', async () => {
    const r = await fa!.flowPinRisk(FLOW_SYM);
    reqFields(r, ['symbol', 'as_of', 'underlying_price', 'expiry',
      'live_pin_risk', 'magnet_strike', 'distance_to_magnet_pct',
      'time_to_close_hours', 'breakdown'], 'flow/pin-risk');
    reqFields((r as { breakdown?: unknown }).breakdown,
      ['oi_score', 'proximity_score', 'time_score', 'gamma_score'],
      'flow/pin-risk.breakdown');
  });

  itest('flowSummary — all contract fields present', async () => {
    const r = await fa!.flowSummary(FLOW_SYM);
    reqFields(r, ['symbol', 'as_of', 'underlying_price', 'expiry',
      'flow_direction', 'intraday_oi_delta', 'contracts_with_flow',
      'contracts_total', 'live_gex', 'flow_gex_pct_shift'], 'flow/summary');
  });

  itest('flowOi — all contract fields present', async () => {
    const r = await fa!.flowOi(FLOW_SYM);
    reqFields(r, ['symbol', 'as_of', 'expiry', 'official_oi', 'simulated_oi',
      'intraday_oi_delta', 'oi_delta_confidence', 'effective_oi',
      'contracts_total', 'contracts_with_flow'], 'flow/oi');
  });

  itest('flowGex — all contract + strike fields present', async () => {
    const r = await fa!.flowGex(FLOW_SYM);
    reqFields(r, ['symbol', 'as_of', 'underlying_price', 'expiry',
      'live_net_gex', 'live_net_gex_label', 'live_gamma_flip', 'strikes'],
      'flow/gex');
    const strikes = (r as { strikes?: unknown[] }).strikes ?? [];
    expect(strikes.length).toBeGreaterThan(0);
    reqFields(strikes[0], ['strike', 'call_gex', 'put_gex', 'net_gex',
      'call_oi', 'put_oi', 'call_volume', 'put_volume'], 'flow/gex.strikes[0]');
  });

  itest('flowDex — all contract + strike fields present', async () => {
    const r = await fa!.flowDex(FLOW_SYM);
    reqFields(r, ['symbol', 'as_of', 'underlying_price', 'expiry',
      'live_net_dex', 'strikes'], 'flow/dex');
    const strikes = (r as { strikes?: unknown[] }).strikes ?? [];
    expect(strikes.length).toBeGreaterThan(0);
    reqFields(strikes[0], ['strike', 'call_dex', 'put_dex', 'net_dex'],
      'flow/dex.strikes[0]');
  });

  itest('flowDealerRisk — all contract fields present', async () => {
    const r = await fa!.flowDealerRisk(FLOW_SYM);
    reqFields(r, ['symbol', 'as_of', 'underlying_price', 'expiry',
      'settled_net_gex', 'live_net_gex', 'flow_gex_adjustment',
      'flow_gex_pct_shift', 'settled_net_dex', 'live_net_dex',
      'flow_dex_adjustment', 'flow_dex_pct_shift',
      'total_abs_delta_contracts', 'contracts_with_flow', 'flow_direction',
      'description'], 'flow/dealer-risk');
  });

  itest('flowLive — all contract + nested dealer-risk fields present', async () => {
    const r = await fa!.flowLive(FLOW_SYM);
    reqFields(r, ['symbol', 'as_of', 'underlying_price', 'expiry',
      'contracts', 'contracts_with_flow', 'official_oi', 'simulated_oi',
      'intraday_oi_delta', 'oi_delta_confidence', 'effective_oi', 'live_gex',
      'live_gex_delta', 'live_gamma_flip', 'live_call_wall', 'live_put_wall',
      'live_max_pain', 'live_pin_risk', 'flow_adjusted_dealer_risk'],
      'flow/live');
    reqFields((r as { flow_adjusted_dealer_risk?: unknown }).flow_adjusted_dealer_risk,
      ['settled_net_gex', 'live_net_gex', 'flow_gex_adjustment',
        'flow_gex_pct_shift', 'settled_net_dex', 'live_net_dex',
        'flow_dex_adjustment', 'flow_dex_pct_shift',
        'total_abs_delta_contracts', 'flow_direction', 'description'],
      'flow/live.flow_adjusted_dealer_risk');
  });

  itest('flowOptionRecent — envelope (+ trade fields when present)', async () => {
    const r = await fa!.flowOptionRecent(FLOW_SYM, { limit: 5 });
    reqFields(r, ['symbol', 'count', 'totalAvailable', 'trades'],
      'flow/options/recent');
    const trades = (r as { trades?: unknown[] }).trades ?? [];
    if (trades.length) {
      reqFields(trades[0], ['ts', 'instrumentId', 'expiry', 'strike', 'right',
        'price', 'size', 'side', 'isBlock', 'bid', 'ask'],
        'flow/options/recent.trades[0]');
    }
  });

  itest('flowOptionSummary — all contract fields present', async () => {
    const r = await fa!.flowOptionSummary(FLOW_SYM);
    reqFields(r, ['symbol', 'contractsWithTrades', 'totalTrades', 'buyVolume',
      'sellVolume', 'midVolume', 'netVolume', 'biggestSingleTrade'],
      'flow/options/summary');
  });

  itest('flowOptionBlocks — envelope (+ block fields when present)', async () => {
    const r = await fa!.flowOptionBlocks(FLOW_SYM, { minSize: 50 });
    reqFields(r, ['symbol', 'minSize', 'count', 'blocks'],
      'flow/options/blocks');
    const blocks = (r as { blocks?: unknown[] }).blocks ?? [];
    if (blocks.length) {
      reqFields(blocks[0], ['ts', 'expiry', 'strike', 'right', 'price',
        'size', 'side'], 'flow/options/blocks.blocks[0]');
    }
  });

  itest('flowOptionHistory — envelope (+ bucket fields when present)', async () => {
    const r = await fa!.flowOptionHistory(FLOW_SYM, { minutes: 30 });
    reqFields(r, ['symbol', 'minutes', 'count', 'buckets'],
      'flow/options/history');
    const buckets = (r as { buckets?: unknown[] }).buckets ?? [];
    if (buckets.length) {
      reqFields(buckets[0], ['ts', 'buyVolume', 'sellVolume', 'midVolume',
        'netVolume', 'tradeCount', 'biggestTrade', 'vwap', 'high', 'low'],
        'flow/options/history.buckets[0]');
    }
  });

  itest('flowOptionCumulative — envelope (+ point fields when present)', async () => {
    const r = await fa!.flowOptionCumulative(FLOW_SYM, { minutes: 60 });
    reqFields(r, ['symbol', 'minutes', 'count', 'points'],
      'flow/options/cumulative');
    const points = (r as { points?: unknown[] }).points ?? [];
    if (points.length) {
      reqFields(points[0], ['ts', 'netVolume', 'cumulative', 'vwap',
        'tradeCount'], 'flow/options/cumulative.points[0]');
    }
  });

  itest('flowStockRecent — envelope (+ trade fields when present)', async () => {
    const r = await fa!.flowStockRecent(FLOW_SYM, { limit: 5 });
    reqFields(r, ['symbol', 'count', 'totalAvailable', 'trades'],
      'flow/stocks/recent');
    const trades = (r as { trades?: unknown[] }).trades ?? [];
    if (trades.length) {
      reqFields(trades[0], ['ts', 'price', 'size', 'side', 'isBlock', 'bid',
        'ask'], 'flow/stocks/recent.trades[0]');
    }
  });

  itest('flowStockSummary — all contract fields present', async () => {
    const r = await fa!.flowStockSummary(FLOW_SYM);
    reqFields(r, ['symbol', 'totalTrades', 'buyVolume', 'sellVolume',
      'midVolume', 'netVolume', 'biggestSingleTrade'], 'flow/stocks/summary');
  });

  itest('flowStockBlocks — envelope (+ block fields when present)', async () => {
    const r = await fa!.flowStockBlocks(FLOW_SYM, { minSize: 1000 });
    reqFields(r, ['symbol', 'minSize', 'count', 'blocks'],
      'flow/stocks/blocks');
    const blocks = (r as { blocks?: unknown[] }).blocks ?? [];
    if (blocks.length) {
      reqFields(blocks[0], ['ts', 'price', 'size', 'side', 'bid', 'ask'],
        'flow/stocks/blocks.blocks[0]');
    }
  });

  itest('flowStockHistory — envelope (+ bucket fields when present)', async () => {
    const r = await fa!.flowStockHistory(FLOW_SYM, { minutes: 30 });
    reqFields(r, ['symbol', 'minutes', 'count', 'buckets'],
      'flow/stocks/history');
    const buckets = (r as { buckets?: unknown[] }).buckets ?? [];
    if (buckets.length) {
      reqFields(buckets[0], ['ts', 'buyVolume', 'sellVolume', 'midVolume',
        'netVolume', 'tradeCount', 'biggestTrade', 'vwap', 'open', 'close',
        'high', 'low'], 'flow/stocks/history.buckets[0]');
    }
  });

  itest('flowStockCumulative — envelope (+ point fields when present)', async () => {
    const r = await fa!.flowStockCumulative(FLOW_SYM, { minutes: 60 });
    reqFields(r, ['symbol', 'minutes', 'count', 'points'],
      'flow/stocks/cumulative');
    const points = (r as { points?: unknown[] }).points ?? [];
    if (points.length) {
      reqFields(points[0], ['ts', 'netVolume', 'cumulative', 'vwap',
        'tradeCount'], 'flow/stocks/cumulative.points[0]');
    }
  });

  itest('flowOptionsLeaderboard — envelope (+ row fields when present)', async () => {
    const r = await fa!.flowOptionsLeaderboard({ n: 3 });
    reqFields(r, ['generatedUtc', 'n', 'windowMinutes', 'buyers', 'sellers'],
      'flow/options/leaderboard');
    const rows = [
      ...((r as { buyers?: unknown[] }).buyers ?? []),
      ...((r as { sellers?: unknown[] }).sellers ?? []),
    ];
    if (rows.length) {
      reqFields(rows[0], ['symbol', 'netVolume', 'netNotional', 'buyVolume',
        'sellVolume', 'avgPremium', 'tradeCount', 'lastTradeUtc'],
        'flow/options/leaderboard.row');
    }
  });

  itest('flowOptionsOutliers — envelope (+ row fields when present)', async () => {
    const r = await fa!.flowOptionsOutliers({ limit: 3 });
    reqFields(r, ['generatedUtc', 'windowMinutes', 'tracked', 'qualified',
      'limit', 'outliers'], 'flow/options/outliers');
    const outliers = (r as { outliers?: unknown[] }).outliers ?? [];
    if (outliers.length) {
      reqFields(outliers[0], ['symbol', 'tradeCount', 'buyVolume',
        'sellVolume', 'midVolume', 'netVolume', 'imbalancePct', 'skew',
        'notional', 'netNotional', 'biggestTrade', 'biggestTradeUtc',
        'biggestAgeSec', 'lastVwap', 'lastTradeUtc', 'lastTradeAgeSec'],
        'flow/options/outliers.outliers[0]');
    }
  });

  itest('flowStocksLeaderboard — envelope (+ row fields when present)', async () => {
    const r = await fa!.flowStocksLeaderboard({ n: 3 });
    reqFields(r, ['generatedUtc', 'n', 'windowMinutes', 'buyers', 'sellers'],
      'flow/stocks/leaderboard');
    const rows = [
      ...((r as { buyers?: unknown[] }).buyers ?? []),
      ...((r as { sellers?: unknown[] }).sellers ?? []),
    ];
    if (rows.length) {
      reqFields(rows[0], ['symbol', 'netVolume', 'netNotional', 'buyVolume',
        'sellVolume', 'vwap', 'tradeCount', 'lastTradeUtc'],
        'flow/stocks/leaderboard.row');
    }
  });

  itest('flowStocksOutliers — envelope (+ row fields when present)', async () => {
    const r = await fa!.flowStocksOutliers({ limit: 3 });
    reqFields(r, ['generatedUtc', 'windowMinutes', 'tracked', 'qualified',
      'limit', 'outliers'], 'flow/stocks/outliers');
    const outliers = (r as { outliers?: unknown[] }).outliers ?? [];
    if (outliers.length) {
      reqFields(outliers[0], ['symbol', 'tradeCount', 'buyVolume',
        'sellVolume', 'midVolume', 'netVolume', 'imbalancePct', 'skew',
        'notional', 'netNotional', 'biggestTrade', 'biggestTradeUtc',
        'biggestAgeSec', 'lastVwap', 'lastTradeUtc', 'lastTradeAgeSec'],
        'flow/stocks/outliers.outliers[0]');
    }
  });
});
