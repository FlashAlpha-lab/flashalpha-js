/**
 * Typed response models for the FlashAlpha SDK.
 *
 * These are pure TypeScript interfaces — they have zero runtime cost and don't
 * change the shape of the JSON returned by the API. Existing code that did
 * `result.field` (after a cast to `any`) keeps working unchanged. New code
 * gets autocomplete, IDE hints, and type-checking on documented fields.
 *
 * Currently typed:
 * - `ZeroDteResponse` (full payload of GET /v1/exposure/zero-dte/{symbol})
 *
 * Numeric fields are typed `| null` because the API returns `null` for any
 * value it can't compute (insufficient data, market closed, etc.). On the
 * weekend / holiday fallback path, only `symbol`, `as_of`, `no_zero_dte`,
 * `message`, and `next_zero_dte_expiry` are populated — every other field is
 * absent. Hence the `?:` modifier on most members.
 */

export interface ZeroDteRegime {
  label?: string;
  description?: string;
  gamma_flip?: number | null;
  spot_vs_flip?: 'above' | 'below';
  spot_to_flip_pct?: number | null;
  distance_to_flip_dollars?: number | null;
  distance_to_flip_sigmas?: number | null;
}

export interface ZeroDteExposures {
  net_gex?: number;
  net_dex?: number;
  net_vex?: number;
  net_chex?: number;
  pct_of_total_gex?: number | null;
  total_chain_net_gex?: number;
}

export interface ZeroDteExpectedMove {
  implied_1sd_dollars?: number | null;
  implied_1sd_pct?: number | null;
  remaining_1sd_dollars?: number | null;
  remaining_1sd_pct?: number | null;
  upper_bound?: number | null;
  lower_bound?: number | null;
  straddle_price?: number | null;
  atm_iv?: number | null;
}

export interface ZeroDtePinComponents {
  oi_score?: number;
  proximity_score?: number;
  time_score?: number;
  gamma_score?: number;
}

export interface ZeroDtePinRisk {
  magnet_strike?: number | null;
  magnet_gex?: number | null;
  distance_to_magnet_pct?: number | null;
  pin_score?: number;
  components?: ZeroDtePinComponents;
  max_pain?: number | null;
  oi_concentration_top3_pct?: number | null;
  description?: string;
}

export interface ZeroDteHedgingBucket {
  dealer_shares_to_trade?: number;
  direction?: 'buy' | 'sell';
  notional_usd?: number;
}

export interface ZeroDteHedging {
  spot_up_10bp?: ZeroDteHedgingBucket;
  spot_down_10bp?: ZeroDteHedgingBucket;
  spot_up_25bp?: ZeroDteHedgingBucket;
  spot_down_25bp?: ZeroDteHedgingBucket;
  spot_up_half_pct?: ZeroDteHedgingBucket;
  spot_down_half_pct?: ZeroDteHedgingBucket;
  spot_up_1pct?: ZeroDteHedgingBucket;
  spot_down_1pct?: ZeroDteHedgingBucket;
  convexity_at_spot?: number | null;
}

export interface ZeroDteDecay {
  net_theta_dollars?: number | null;
  theta_per_hour_remaining?: number | null;
  charm_regime?: string;
  charm_description?: string;
  gamma_acceleration?: number | null;
  description?: string;
}

export interface ZeroDteVolContext {
  zero_dte_atm_iv?: number | null;
  seven_dte_atm_iv?: number | null;
  iv_ratio_0dte_7dte?: number | null;
  vix?: number | null;
  vanna_exposure?: number | null;
  vanna_interpretation?: string;
  description?: string;
}

export interface ZeroDteFlow {
  total_volume?: number;
  call_volume?: number;
  put_volume?: number;
  net_call_minus_put_volume?: number;
  total_oi?: number;
  call_oi?: number;
  put_oi?: number;
  pc_ratio_volume?: number | null;
  pc_ratio_oi?: number | null;
  volume_to_oi_ratio?: number | null;
  atm_volume_share_pct?: number | null;
  top3_strike_volume_pct?: number | null;
}

export interface ZeroDteLevels {
  call_wall?: number | null;
  call_wall_gex?: number | null;
  call_wall_strength?: number | null;
  distance_to_call_wall_pct?: number | null;
  put_wall?: number | null;
  put_wall_gex?: number | null;
  put_wall_strength?: number | null;
  distance_to_put_wall_pct?: number | null;
  distance_to_magnet_dollars?: number | null;
  highest_oi_strike?: number | null;
  highest_oi_total?: number | null;
  max_positive_gamma?: number | null;
  max_negative_gamma?: number | null;
  level_cluster_score?: number | null;
}

export interface ZeroDteLiquidity {
  atm_spread_pct?: number | null;
  weighted_spread_pct?: number | null;
  execution_score?: number | null;
}

export interface ZeroDteMetadata {
  snapshot_age_seconds?: number | null;
  chain_contract_count?: number;
  data_quality_score?: number | null;
  greek_smoothness_score?: number | null;
}

export interface ZeroDteStrike {
  strike: number;
  distance_from_spot_pct?: number;
  call_symbol?: string;
  put_symbol?: string;
  call_gex?: number | null;
  put_gex?: number | null;
  net_gex?: number | null;
  call_dex?: number | null;
  put_dex?: number | null;
  net_dex?: number | null;
  net_vex?: number | null;
  net_chex?: number | null;
  call_oi?: number | null;
  put_oi?: number | null;
  call_volume?: number | null;
  put_volume?: number | null;
  gex_share_pct?: number | null;
  oi_share_pct?: number | null;
  volume_share_pct?: number | null;
  call_iv?: number | null;
  put_iv?: number | null;
  call_delta?: number | null;
  put_delta?: number | null;
  call_gamma?: number | null;
  put_gamma?: number | null;
  call_theta?: number | null;
  put_theta?: number | null;
  call_mid?: number | null;
  put_mid?: number | null;
  call_spread_pct?: number | null;
  put_spread_pct?: number | null;
}

/**
 * Full response for GET /v1/exposure/zero-dte/{symbol}.
 *
 * On weekends/holidays or symbols without 0DTE today, `no_zero_dte` is `true`
 * and most fields are absent — only `symbol`, `as_of`, `message`, and
 * `next_zero_dte_expiry` are populated.
 */
export interface ZeroDteResponse {
  symbol: string;
  underlying_price?: number;
  expiration?: string | null;
  as_of?: string;
  market_open?: boolean;
  time_to_close_hours?: number | null;
  time_to_close_pct?: number | null;
  regime?: ZeroDteRegime;
  exposures?: ZeroDteExposures;
  expected_move?: ZeroDteExpectedMove;
  pin_risk?: ZeroDtePinRisk;
  hedging?: ZeroDteHedging;
  decay?: ZeroDteDecay;
  vol_context?: ZeroDteVolContext;
  flow?: ZeroDteFlow;
  levels?: ZeroDteLevels;
  liquidity?: ZeroDteLiquidity;
  metadata?: ZeroDteMetadata;
  strikes?: ZeroDteStrike[];
  /** Optional — only present near close (<5 min) when greeks may be unstable. */
  warnings?: string[];
  // ── No-0DTE fallback ───────────────────────────────────────────────────
  no_zero_dte?: boolean;
  message?: string;
  next_zero_dte_expiry?: string | null;
}


// ─── ExposureSummary ─────────────────────────────────────────────────────────
//
// Typed model for `GET /v1/exposure/summary/{symbol}`.
//
// Direction casing: /v1/exposure/summary/ and /v1/exposure/zero-dte/ both
// return lowercase "buy" / "sell". Docs and typed models use that casing
// consistently.

export interface ExposureSummaryExposures {
  // Field-level `| null` matches C#/Go/Java (defensive — API may return null
  // under unobserved edge conditions even when the parent block is present).
  net_gex?: number | null;
  net_dex?: number | null;
  net_vex?: number | null;
  net_chex?: number | null;
}

export interface ExposureSummaryInterpretation {
  gamma?: string | null;
  vanna?: string | null;
  charm?: string | null;
}

export interface ExposureSummaryHedgingMove {
  dealer_shares_to_trade?: number | null;
  direction?: 'buy' | 'sell' | null;
  notional_usd?: number | null;
}

export interface ExposureSummaryHedgingEstimate {
  spot_up_1pct?: ExposureSummaryHedgingMove;
  spot_down_1pct?: ExposureSummaryHedgingMove;
}

export interface ExposureSummaryZeroDte {
  net_gex?: number | null;
  pct_of_total_gex?: number | null;
  expiration?: string | null;
}

export interface ExposureSummaryResponse {
  symbol?: string;
  underlying_price?: number | null;
  as_of?: string;
  gamma_flip?: number | null;
  /**
   * Confirmed live values in tests across Py/JS/.NET/Go/Java:
   *   positive_gamma | negative_gamma | neutral
   * Documented fourth value: undetermined (when there's no usable options
   * data). `neutral` appears in edge cases where net_gex straddles zero.
   * Don't conflate with `maxpain.signal` (also bullish/bearish/neutral but
   * a separate field).
   */
  regime?: 'positive_gamma' | 'negative_gamma' | 'neutral' | 'undetermined';
  exposures?: ExposureSummaryExposures;
  interpretation?: ExposureSummaryInterpretation;
  hedging_estimate?: ExposureSummaryHedgingEstimate;
  zero_dte?: ExposureSummaryZeroDte;
}


// ─── VRP (Variance Risk Premium) ─────────────────────────────────────────────
//
// Typed model for `GET /v1/vrp/{symbol}` (Alpha+).
//
// This is THE classic nested-trap endpoint in the FlashAlpha API. Every
// customer who has tripped on this response has hit at least one of these
// silent-null patterns — the typed shape makes them impossible at the SDK
// boundary:
//
//   - `response.z_score`  ✗  → use `response.vrp?.z_score`
//   - `response.percentile` ✗ → use `response.vrp?.percentile`
//   - `response.put_vrp` ✗ → use `response.directional?.downside_vrp`
//   - `response.net_gex` ✗ → use `response.regime?.net_gex`

/**
 * Core VRP metrics block — the heart of the response.
 *
 * The variance risk premium is the spread between IMPLIED volatility
 * (forward-looking, priced into options) and REALIZED volatility
 * (backward-looking, observed from spot returns). Positive VRP = options
 * are pricing more vol than the underlying actually moved → premium for
 * selling vol. Negative VRP = options too cheap relative to realized →
 * premium for buying vol.
 *
 * Nested under `response.vrp` — NOT top-level. `response.z_score` is
 * undefined; use `response.vrp.z_score`.
 */
export interface VrpCore {
  /** At-the-money implied volatility (annualised, e.g. 18.5 = 18.5%). */
  atm_iv?: number | null;
  /** Realized vol over trailing 5 trading days (annualised %). */
  rv_5d?: number | null;
  rv_10d?: number | null;
  rv_20d?: number | null;
  rv_30d?: number | null;
  /** Variance risk premium at this horizon: `atm_iv - rv_Nd`. */
  vrp_5d?: number | null;
  vrp_10d?: number | null;
  vrp_20d?: number | null;
  vrp_30d?: number | null;
  /**
   * Z-score of the current 20-day VRP vs its trailing `history_days`
   * window. `+2.0` = unusually rich (often a fade signal). `null` when
   * warm-up is insufficient.
   */
  z_score?: number | null;
  /** Percentile rank (0-100) within the trailing window. `null` when warmup is short. */
  percentile?: number | null;
  /** Trading days in the trailing percentile/z-score window. */
  history_days?: number | null;
}

/**
 * Directional VRP skew — separates upside-tail vs downside-tail premia.
 *
 * Splits the VRP by direction: DOWNSIDE (puts) vs UPSIDE (calls). A large
 * `downside_vrp` with small `upside_vrp` is the classic "expensive crash
 * insurance" pattern.
 *
 * The canonical names are `downside_vrp` / `upside_vrp`. Customers from
 * other vendors type `put_vrp` / `call_vrp` — those don't exist here.
 */
export interface VrpDirectional {
  put_wing_iv_25d?: number | null;
  call_wing_iv_25d?: number | null;
  downside_rv_20d?: number | null;
  upside_rv_20d?: number | null;
  /** `put_wing_iv_25d - downside_rv_20d`. Positive = crash insurance rich. */
  downside_vrp?: number | null;
  /** `call_wing_iv_25d - upside_rv_20d`. Positive = upside calls rich. */
  upside_vrp?: number | null;
}

/** One row of the VRP term structure — `{dte, iv, rv, vrp}`. */
export interface VrpTermItem {
  dte?: number | null;
  iv?: number | null;
  rv?: number | null;
  vrp?: number | null;
}

/** VRP harvest score conditioned on the prevailing dealer-gamma regime. */
export interface VrpGexConditioned {
  regime?: string | null;
  /** 0-100 composite. >70 = strong harvest; <30 = avoid. */
  harvest_score?: number | null;
  /** Plain-English explanation; safe to surface verbatim. */
  interpretation?: string | null;
}

/** VRP outlook conditioned on net dealer vanna exposure. */
export interface VrpVannaConditioned {
  /** Forward-looking outlook label. */
  outlook?: string | null;
  interpretation?: string | null;
}

/**
 * Regime snapshot block.
 *
 * `net_gex` lives HERE, not at the top level. `response.net_gex` is
 * undefined; use `response.regime.net_gex`.
 */
export interface VrpRegime {
  /** "positive_gamma" | "negative_gamma" | "neutral" | "undetermined". */
  gamma?: string | null;
  /** "harvestable" | "selling_too_cheap" | etc. `null` when warmup is short. */
  vrp_regime?: string | null;
  /** Net dealer gamma exposure in dollars per 1% spot move. */
  net_gex?: number | null;
  gamma_flip?: number | null;
}

/**
 * 0-100 suitability scores for canonical short-vol strategies. Higher =
 * better fit. Each field can be null when inputs are not computable.
 */
export interface VrpStrategyScores {
  short_put_spread?: number | null;
  short_strangle?: number | null;
  iron_condor?: number | null;
  calendar_spread?: number | null;
}

/**
 * Macro-context snapshot used to condition the VRP outlook.
 *
 * Note diffs across live vs historical:
 *   - `hy_spread`: live = null; historical = float.
 *   - `fed_funds`: live = float; historical = field absent.
 */
export interface VrpMacro {
  /** CBOE VIX index level. */
  vix?: number | null;
  /** CBOE VIX3M (3-month VIX). */
  vix_3m?: number | null;
  /** `(vix_3m - vix) / vix * 100` — positive = contango. */
  vix_term_slope?: number | null;
  /** 10-year US Treasury yield (%, FRED DGS10). */
  dgs10?: number | null;
  /** ICE BofA US HY OAS. Live currently null; historical populated. */
  hy_spread?: number | null;
  /** Fed Funds effective rate (%, FRED DFF). Live-only — absent on historical. */
  fed_funds?: number | null;
}

/**
 * Variance Risk Premium dashboard from `GET /v1/vrp/{symbol}`.
 *
 * The single most-misread response shape in the FlashAlpha API. Every
 * nested block exists for a reason — core metrics, directional skew,
 * gamma conditioning, vanna conditioning, regime, strategy scores, and
 * macro context are deliberately separated.
 *
 * Common silent-null traps (now type-checked at the SDK boundary):
 *   - `response.z_score` → use `response.vrp.z_score`
 *   - `response.percentile` → use `response.vrp.percentile`
 *   - `response.atm_iv` → use `response.vrp.atm_iv`
 *   - `response.vrp_20d` → use `response.vrp.vrp_20d`
 *   - `response.put_vrp` → use `response.directional.downside_vrp`
 *   - `response.call_vrp` → use `response.directional.upside_vrp`
 *   - `response.net_gex` → use `response.regime.net_gex`
 *   - `response.harvest_score` (top-level) → use
 *     `response.gex_conditioned.harvest_score`;
 *     `response.net_harvest_score` is a SEPARATE composite.
 *
 * Returns 403 `tier_restricted` for anything below Alpha plan.
 */
export interface VrpResponse {
  /** Echoed from the request path (e.g. "SPY"). */
  symbol?: string;
  /** Spot mid at `as_of`. */
  underlying_price?: number | null;
  /** ET wall-clock timestamp this snapshot was computed for. */
  as_of?: string;
  /** True if NYSE was open at `as_of`. */
  market_open?: boolean | null;
  /** Core VRP metrics block. See {@link VrpCore}. */
  vrp?: VrpCore;
  /** `vrp_20d / 100` as a decimal. Same as `vrp.vrp_20d / 100`. */
  variance_risk_premium?: number | null;
  /** `fair_vol - atm_iv`. Curvature premium between IV smile and var-swap fair vol. */
  convexity_premium?: number | null;
  /** Variance-swap fair vol (annualised %). */
  fair_vol?: number | null;
  /** Directional VRP skew (downside vs upside). See {@link VrpDirectional}. */
  directional?: VrpDirectional;
  /** Term structure — array of {dte, iv, rv, vrp}. Empty when surface fitting fails. */
  term_vrp?: VrpTermItem[];
  /** GEX-conditioned harvest score. See {@link VrpGexConditioned}. */
  gex_conditioned?: VrpGexConditioned;
  /** Vanna-conditioned outlook. See {@link VrpVannaConditioned}. */
  vanna_conditioned?: VrpVannaConditioned;
  /** Regime snapshot block. `net_gex` lives HERE, not top-level. */
  regime?: VrpRegime;
  /** 0-100 strategy suitability scores. Null on historical when warmup is short. */
  strategy_scores?: VrpStrategyScores | null;
  /** 0-100 composite harvest signal. Null on historical when warmup is short. */
  net_harvest_score?: number | null;
  /** 0-100 — risk that dealer hedging flow disrupts a short-vol harvest. */
  dealer_flow_risk?: number | null;
  /** Server-side warnings about data quality. Always present (possibly empty). */
  warnings?: string[];
  /** Macro context. See {@link VrpMacro}. */
  macro?: VrpMacro;
}
