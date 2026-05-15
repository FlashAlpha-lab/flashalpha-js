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
   * Confirmed values from server source:
   *   positive_gamma | negative_gamma | unknown
   * `unknown` is returned when there's no usable options data.
   * Don't conflate with `maxpain.signal` (which is bullish/bearish/neutral —
   * a separate field).
   */
  regime?: 'positive_gamma' | 'negative_gamma' | 'unknown';
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
  /** "positive_gamma" | "negative_gamma" | "unknown". */
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


// ─── MaxPain ─────────────────────────────────────────────────────────────────
//
// Typed model for `GET /v1/maxpain/{symbol}` (Basic+).
//
// Max pain is the strike where total option-holder intrinsic value across all
// OI in the chain is minimized. The endpoint also overlays GEX-based dealer
// alignment, a multi-expiry calendar (full chain only), and a 0-100 pin
// probability score.


/** Distance from spot to the max-pain strike. */
export interface MaxPainDistance {
  /** Dollar distance: `|underlying_price - max_pain_strike|`. */
  absolute?: number | null;
  /** Percent of spot: `absolute / underlying_price * 100`. */
  percent?: number | null;
  /** Spot relative to max-pain. */
  direction?: 'above' | 'below' | 'at' | null;
}

/**
 * One row of the strike-by-strike pain curve.
 *
 * Each row is the dollar pain (intrinsic value × OI × 100 contract
 * multiplier) summed across all expirations at that strike. The strike
 * where `total_pain` is minimized is the max-pain strike.
 */
export interface MaxPainCurveRow {
  strike?: number | null;
  /** Dollar intrinsic value of all calls at this strike summed across the chain. */
  call_pain?: number | null;
  /** Dollar intrinsic value of all puts at this strike. */
  put_pain?: number | null;
  /** `call_pain + put_pain`. The pain curve's minimum identifies max pain. */
  total_pain?: number | null;
}

/**
 * One row of the OI-by-strike breakdown.
 *
 * Note: on the Historical API, `call_volume` and `put_volume` are always
 * `0` (placeholder fields — the minute table doesn't carry intraday volume).
 */
export interface MaxPainOiRow {
  strike?: number | null;
  call_oi?: number | null;
  put_oi?: number | null;
  total_oi?: number | null;
  call_volume?: number | null;
  put_volume?: number | null;
}

/**
 * Per-expiry max-pain breakdown when no `expiration` filter is applied.
 *
 * `null` when the request specified an expiration filter — the response
 * is then scoped to that single expiry and the multi-expiry view is
 * suppressed.
 */
export interface MaxPainByExpirationRow {
  expiration?: string | null;
  max_pain_strike?: number | null;
  /** Days to expiry (counting from `as_of`). */
  dte?: number | null;
  total_oi?: number | null;
}

/**
 * GEX-based dealer-alignment overlay on the max-pain view.
 *
 * The headline `alignment` label tells you whether dealer hedging will
 * REINFORCE the max-pain pin or fight it.
 */
export interface MaxPainDealerAlignment {
  /**
   * - `"converging"`: max pain near gamma flip and between walls — strongest pin.
   * - `"moderate"`: between walls but far from flip.
   * - `"diverging"`: max pain outside the wall range.
   * - `"unknown"`: insufficient data.
   */
  alignment?: 'converging' | 'moderate' | 'diverging' | 'unknown' | null;
  /** Plain-English explanation. Safe to surface verbatim. */
  description?: string | null;
  /** Strike where net dealer gamma crosses zero. */
  gamma_flip?: number | null;
  /** Strike with highest absolute call GEX (dealer-side resistance). */
  call_wall?: number | null;
  /** Strike with highest absolute put GEX (dealer-side support). */
  put_wall?: number | null;
}

/** Implied move from the ATM straddle, contextualized vs max pain. */
export interface MaxPainExpectedMove {
  /** ATM straddle mid in dollars. Rough proxy for the 1σ implied move. */
  straddle_price?: number | null;
  /** ATM implied volatility (annualised %, e.g. 18.5 = 18.5%). */
  atm_iv?: number | null;
  /** `true` when `|spot - max_pain_strike| <= straddle_price`. */
  max_pain_within_expected_range?: boolean | null;
}

/**
 * Max pain dashboard from `GET /v1/maxpain/{symbol}` (Basic+).
 *
 * Returns the strike where total option-holder pain is minimized, plus
 * per-strike pain curve, OI breakdown, per-expiry calendar (when no
 * `expiration` filter), GEX-based dealer alignment, expected move from
 * the ATM straddle, and a 0-100 pin probability composite.
 */
export interface MaxPainResponse {
  symbol?: string;
  underlying_price?: number | null;
  as_of?: string;
  /** Strike where total chain pain is minimized. */
  max_pain_strike?: number | null;
  distance?: MaxPainDistance;
  /**
   * - `"bullish"`: spot >= 5% below max_pain (pin attracts upside).
   * - `"bearish"`: spot >= 5% above.
   * - `"neutral"`: within 5%.
   */
  signal?: 'bullish' | 'bearish' | 'neutral' | null;
  /**
   * Expiration this view is scoped to. When the request omits the
   * `expiration` filter, this is the front-month expiry the full-chain
   * max-pain happened to land on.
   */
  expiration?: string | null;
  /** Total put OI / total call OI across the relevant chain. >1.0 = put-heavy. */
  put_call_oi_ratio?: number | null;
  pain_curve?: MaxPainCurveRow[];
  oi_by_strike?: MaxPainOiRow[];
  /** `null` when the request specified an `expiration` filter. */
  max_pain_by_expiration?: MaxPainByExpirationRow[] | null;
  dealer_alignment?: MaxPainDealerAlignment;
  /** Same classifier as `exposure_summary.regime`. */
  regime?: 'positive_gamma' | 'negative_gamma' | 'unknown' | null;
  expected_move?: MaxPainExpectedMove;
  /**
   * 0-100 composite — likelihood of pinning to `max_pain_strike`. Inputs:
   * OI concentration (30%), magnet proximity (25%), time remaining (25%),
   * gamma magnitude (20%). Most meaningful for near-term expiries.
   */
  pin_probability?: number | null;
}


// ─── StockSummary ────────────────────────────────────────────────────────────
//
// Typed model for `GET /v1/stock/{symbol}/summary`.
//
// FlashAlpha's "single best snapshot" endpoint — bundles spot/bid/ask,
// implied + realized vol, VRP, 25-delta skew, IV term structure, options
// flow, the full dealer-exposure block (regime, walls, max pain, hedging
// estimate, 0DTE share, top strikes), and a macro snapshot (VIX complex,
// VVIX, SKEW, SPX, MOVE, fear-and-greed) in one call.
//
// Dual-mode auth: with a valid API key the response is LIVE; without one,
// the API silently falls back to a previous-day cached snapshot — useful
// for unauthenticated marketing/playground usage but always inspect
// `as_of` and `market_open` to be sure you have what you expect.

/** Top-of-book spot quote at `as_of`. */
export interface StockSummaryPrice {
  bid?: number | null;
  ask?: number | null;
  /** `(bid + ask) / 2`. */
  mid?: number | null;
  last?: number | null;
  /** ISO timestamp of the last trade or quote tick. */
  last_update?: string | null;
}

/**
 * One row of the 25-delta skew curve — call/put 25-delta IVs vs the ATM
 * strike for a single expiry.
 */
export interface StockSummarySkew25d {
  /** Expiry date (YYYY-MM-DD). */
  expiry?: string | null;
  /** Calendar days to this expiry. */
  days_to_expiry?: number | null;
  /** 25-delta put IV (annualised %). */
  put_25d_iv?: number | null;
  /** ATM IV (annualised %). */
  atm_iv?: number | null;
  /** 25-delta call IV (annualised %). */
  call_25d_iv?: number | null;
  /** `put_25d_iv - call_25d_iv`. Positive = downside-skewed. */
  skew_25d?: number | null;
  /** `(put_25d_iv + call_25d_iv) / 2 / atm_iv`. */
  smile_ratio?: number | null;
}

/** One node of the ATM IV term structure — `{expiry, iv, days_to_expiry}`. */
export interface StockSummaryIvTermItem {
  expiry?: string | null;
  /** ATM IV at this expiry (annualised %). */
  iv?: number | null;
  days_to_expiry?: number | null;
}

/**
 * Volatility block — implied, realized, VRP, skew, and term structure.
 *
 * `vrp` is a single scalar here (`atm_iv - hv_20`); the full directional
 * VRP dashboard lives at `/v1/vrp/{symbol}` (`VrpResponse`).
 */
export interface StockSummaryVolatility {
  /** ATM implied volatility (annualised %). */
  atm_iv?: number | null;
  /** 20-day historical (close-to-close) volatility, annualised %. */
  hv_20?: number | null;
  /** 60-day historical volatility, annualised %. */
  hv_60?: number | null;
  /** Variance risk premium scalar: `atm_iv - hv_20`. */
  vrp?: number | null;
  /** 25-delta skew at the front expiry. See {@link StockSummarySkew25d}. */
  skew_25d?: StockSummarySkew25d | null;
  /** ATM IV term structure across listed expiries. */
  iv_term_structure?: StockSummaryIvTermItem[];
}

/** Aggregate options-flow stats across the listed expirations. */
export interface StockSummaryOptionsFlow {
  total_call_oi?: number | null;
  total_put_oi?: number | null;
  total_call_volume?: number | null;
  total_put_volume?: number | null;
  /** Total put OI / total call OI. >1.0 = put-heavy. */
  pc_ratio_oi?: number | null;
  /** Total put volume / total call volume. */
  pc_ratio_volume?: number | null;
  /** Number of expirations contributing to the aggregates. */
  active_expirations?: number | null;
}

/** Plain-English interpretation of the dealer-exposure block. Safe verbatim. */
export interface StockSummaryInterpretation {
  gamma?: string | null;
  vanna?: string | null;
  charm?: string | null;
}

/**
 * One bucket of the hedging estimate.
 *
 * IMPORTANT: on `/v1/stock/{symbol}/summary`, `dealer_shares` is the
 * MAGNITUDE (always non-negative) — the sign is carried by `direction`.
 * This differs from `/v1/exposure/zero-dte/`, where `net_chex` / `net_vex`
 * style fields are signed. Always combine `dealer_shares` with
 * `direction` to reconstruct the signed flow.
 */
export interface StockSummaryHedgingMove {
  /** Magnitude of dealer shares to trade (always >= 0). */
  dealer_shares?: number | null;
  /** `'buy'` = dealers must buy; `'sell'` = dealers must sell. */
  direction?: 'buy' | 'sell' | null;
  /** `dealer_shares * spot`, in USD. */
  notional_usd?: number | null;
}

/** Hedging estimate for a 1% spot move up vs down. */
export interface StockSummaryHedgingEstimate {
  spot_up_1pct?: StockSummaryHedgingMove;
  spot_down_1pct?: StockSummaryHedgingMove;
}

/** 0DTE summary line — net GEX and its share of the chain total. */
export interface StockSummaryZeroDte {
  /** Signed net dealer GEX from 0DTE only. */
  net_gex?: number | null;
  /** 0DTE share of total chain absolute GEX (0-100). */
  pct_of_total?: number | null;
  /** 0DTE expiration (YYYY-MM-DD). */
  expiration?: string | null;
}

/** Top strike by absolute net GEX, with OI breakdown. */
export interface StockSummaryTopStrike {
  strike?: number | null;
  net_gex?: number | null;
  call_oi?: number | null;
  put_oi?: number | null;
  total_oi?: number | null;
}

/**
 * Dealer-exposure block — the same regime classifier and key levels as
 * `/v1/exposure/summary/`, plus an embedded 0DTE summary, top strikes,
 * and an OI-weighted DTE.
 *
 * `null` on the response when there's no usable options data
 * (illiquid name, weekend cache miss, etc.).
 */
export interface StockSummaryExposure {
  /** Net dealer gamma exposure ($ per 1% spot move). */
  net_gex?: number | null;
  /** Net dealer delta exposure (shares-equivalent). */
  net_dex?: number | null;
  /** Net dealer vanna exposure. */
  net_vex?: number | null;
  /** Net dealer charm exposure. */
  net_chex?: number | null;
  /** Strike where net dealer gamma crosses zero. */
  gamma_flip?: number | null;
  /** Strike with highest absolute call GEX (resistance). */
  call_wall?: number | null;
  /** Strike with highest absolute put GEX (support). */
  put_wall?: number | null;
  /** Max-pain strike across the listed chain. */
  max_pain?: number | null;
  /** Strike with highest total OI (calls + puts). */
  highest_oi_strike?: number | null;
  /**
   * `'positive_gamma'` = dealers long gamma (mean-reverting tape).
   * `'negative_gamma'` = dealers short gamma (trend-amplifying tape).
   * `'unknown'` = insufficient data.
   */
  regime?: 'positive_gamma' | 'negative_gamma' | 'unknown' | null;
  /** Plain-English interpretation. */
  interpretation?: StockSummaryInterpretation;
  /** Hedging estimate for ±1% spot moves. See {@link StockSummaryHedgingEstimate}. */
  hedging_estimate?: StockSummaryHedgingEstimate;
  /** Embedded 0DTE summary (subset of `/v1/exposure/zero-dte/`). */
  zero_dte?: StockSummaryZeroDte | null;
  /** Top strikes by absolute net GEX. */
  top_strikes?: StockSummaryTopStrike[];
  /** OI-weighted average days-to-expiry across the chain. */
  oi_weighted_dte?: number | null;
}

/** Generic macro index row — `{value, change, change_pct}`. */
export interface StockSummaryMacroIndex {
  value?: number | null;
  /** Daily change in raw units. */
  change?: number | null;
  /** Daily percentage change. */
  change_pct?: number | null;
}

/** VIX complex term-structure levels. */
export interface StockSummaryVixTermLevels {
  vix9d?: number | null;
  vix?: number | null;
  vix3m?: number | null;
  vix6m?: number | null;
}

/** VIX term-structure block with shape classification. */
export interface StockSummaryVixTermStructure {
  levels?: StockSummaryVixTermLevels;
  /** Slope from VIX9D → VIX3M, in percent. */
  near_slope_pct?: number | null;
  /** `'contango'` = upward-sloping; `'backwardation'` = inverted (stress). */
  structure?: 'contango' | 'backwardation' | null;
}

/** VIX futures front-month vs spot, basis, and basis classification. */
export interface StockSummaryVixFutures {
  /** Front-month VIX futures price. */
  front_month?: number | null;
  /** VIX spot. */
  spot?: number | null;
  /** `front_month - spot`. */
  spread?: number | null;
  /** `(front_month - spot) / spot * 100`. */
  basis_pct?: number | null;
  /** `'contango'` = future > spot; `'backwardation'` = future < spot (stress). */
  basis?: 'contango' | 'backwardation' | null;
}

/** CNN-style fear and greed composite. */
export interface StockSummaryFearAndGreed {
  /** 0-100 composite score. */
  score?: number | null;
  /** Categorical rating ("Extreme Fear", "Greed", etc.). */
  rating?: string | null;
}

/**
 * Macro snapshot — the major vol/sentiment indices at `as_of`.
 *
 * Each scalar index is wrapped in a `{value, change, change_pct}` shape
 * (or `null` if the API couldn't fetch it).
 */
export interface StockSummaryMacro {
  /** CBOE VIX index. */
  vix?: StockSummaryMacroIndex | null;
  /** CBOE VVIX (vol of vol). */
  vvix?: StockSummaryMacroIndex | null;
  /** CBOE SKEW index. */
  skew?: StockSummaryMacroIndex | null;
  /** S&P 500 cash index. */
  spx?: StockSummaryMacroIndex | null;
  /** ICE BofAML MOVE (Treasury vol). */
  move?: StockSummaryMacroIndex | null;
  /** VIX term structure with shape classification. */
  vix_term_structure?: StockSummaryVixTermStructure | null;
  /** VIX futures front-month vs spot. */
  vix_futures?: StockSummaryVixFutures | null;
  /** Fear and greed composite. */
  fear_and_greed?: StockSummaryFearAndGreed | null;
}

/**
 * FlashAlpha's "single best snapshot" — the most information-dense
 * endpoint in the API. Returned by `GET /v1/stock/{symbol}/summary`.
 *
 * Bundles in one call:
 *   - top-of-book price (bid/ask/mid/last)
 *   - implied vol, 20d/60d realized vol, VRP scalar, 25-delta skew,
 *     and ATM IV term structure
 *   - aggregate options flow (OI, volume, PC ratios)
 *   - the FULL dealer-exposure block (regime, GEX/DEX/VEX/CHEX, walls,
 *     max pain, hedging estimate, 0DTE share, top strikes)
 *   - a macro snapshot (VIX/VVIX/SKEW/SPX/MOVE, term structure, futures
 *     basis, fear-and-greed)
 *
 * Dual-mode auth: with a valid `X-Api-Key` the response is LIVE; without
 * one, the API silently falls back to a previous-day cached snapshot
 * (useful for marketing/playground usage but always inspect `as_of` and
 * `market_open` to confirm you have what you expect).
 *
 * IMPORTANT: `exposure.hedging_estimate.{spot_up_1pct,spot_down_1pct}.dealer_shares`
 * is MAGNITUDE on this endpoint — the sign is carried by `direction`
 * (`'buy'` / `'sell'`). This differs from `/v1/exposure/zero-dte/`, where
 * fields like `net_chex` and `net_vex` are signed scalars. Always combine
 * `dealer_shares` with `direction` here.
 */
export interface StockSummaryResponse {
  /** Echoed from the request path (e.g. "SPY"). */
  symbol?: string;
  /** ET wall-clock timestamp this snapshot was computed for. */
  as_of?: string;
  /** True if NYSE was open at `as_of`. */
  market_open?: boolean | null;
  price?: StockSummaryPrice;
  volatility?: StockSummaryVolatility;
  options_flow?: StockSummaryOptionsFlow;
  /** Full dealer-exposure block. `null` when no usable options data. */
  exposure?: StockSummaryExposure | null;
  macro?: StockSummaryMacro;
}


// ─── Narrative ───────────────────────────────────────────────────────────────
//
// Typed model for `GET /v1/exposure/narrative/{symbol}` (Growth+).
//
// FlashAlpha's "LLM-friendly verbal output" — the same exposure data as
// `/v1/exposure/summary/` rephrased into plain-English narrative strings,
// safe to surface verbatim into a chat UI or LLM context window.

/** One row of the top OI changes table. */
export interface NarrativeOiChange {
  strike?: number | null;
  /** `'call'` or `'put'`. */
  type?: 'call' | 'put' | null;
  /** Day-over-day change in OI. */
  oi_change?: number | null;
  volume?: number | null;
}

/** Quantitative data block backing the narrative strings. */
export interface NarrativeData {
  /** Net dealer gamma exposure ($ per 1% spot move). */
  net_gex?: number | null;
  /** Prior session net GEX. */
  net_gex_prior?: number | null;
  /** `(net_gex - net_gex_prior) / |net_gex_prior| * 100`. */
  net_gex_change_pct?: number | null;
  /** CBOE VIX level at `as_of`. */
  vix?: number | null;
  /** Strike where net dealer gamma crosses zero. */
  gamma_flip?: number | null;
  /** Highest-absolute-call-GEX strike. */
  call_wall?: number | null;
  /** Highest-absolute-put-GEX strike. */
  put_wall?: number | null;
  /**
   * Confirmed values from server source: `positive_gamma | negative_gamma | unknown`.
   * Same classifier as `exposure_summary.regime`.
   */
  regime?: 'positive_gamma' | 'negative_gamma' | 'unknown' | null;
  /** 0DTE share of total chain absolute GEX (0-100). */
  zero_dte_pct?: number | null;
  top_oi_changes?: NarrativeOiChange[];
}

/**
 * Plain-English narrative strings.
 *
 * Each field is human-readable and safe to surface verbatim into a chat
 * UI, LLM context, or alerting message — they're sentence-level
 * descriptions of the underlying numbers in `data`.
 */
export interface Narrative {
  /** Dealer gamma regime narrative. */
  regime?: string | null;
  /** Day-over-day GEX change narrative. */
  gex_change?: string | null;
  /** Walls, gamma flip, max pain narrative. */
  key_levels?: string | null;
  /** Options flow narrative. */
  flow?: string | null;
  /** Net vanna exposure narrative. */
  vanna?: string | null;
  /** Net charm exposure narrative. */
  charm?: string | null;
  /** 0DTE share narrative. */
  zero_dte?: string | null;
  /** Forward-looking outlook synthesis. */
  outlook?: string | null;
  /** Quantitative data block backing the narrative strings. */
  data?: NarrativeData;
}

/**
 * FlashAlpha's "LLM-friendly verbal output" from
 * `GET /v1/exposure/narrative/{symbol}` (Growth+).
 *
 * Same exposure data as `/v1/exposure/summary/` but rephrased into
 * sentence-level narrative strings, safe to surface verbatim into a chat
 * UI, LLM context, or alerting message. Pair the strings in `narrative`
 * with the numbers in `narrative.data` for hybrid quant + verbal output.
 */
export interface NarrativeResponse {
  /** Echoed from the request path (e.g. "SPY"). */
  symbol?: string;
  /** Spot mid at `as_of`. */
  underlying_price?: number | null;
  /** ET wall-clock timestamp this snapshot was computed for. */
  as_of?: string;
  narrative?: Narrative;
}


// ─── ExposureLevels ──────────────────────────────────────────────────────────
//
// Typed model for `GET /v1/exposure/levels/{symbol}`.
//
// Pure key-levels endpoint — extracts only the support/resistance strikes
// from the full exposure block. Use this when you want a chart overlay
// without the full GEX/DEX/VEX/CHEX dashboard payload.

/**
 * Key support/resistance strikes derived from the full options chain.
 *
 * Each level is a strike price (or `null` when uncomputable):
 *   - `gamma_flip`: net dealer gamma crosses zero
 *   - `max_positive_gamma` / `max_negative_gamma`: extrema of the GEX-by-strike curve
 *   - `call_wall` / `put_wall`: highest absolute call/put GEX
 *   - `highest_oi_strike`: highest total OI (calls + puts)
 *   - `zero_dte_magnet`: dominant 0DTE pin strike (null off 0DTE days)
 */
export interface ExposureLevels {
  gamma_flip?: number | null;
  max_positive_gamma?: number | null;
  max_negative_gamma?: number | null;
  call_wall?: number | null;
  put_wall?: number | null;
  highest_oi_strike?: number | null;
  zero_dte_magnet?: number | null;
}

/**
 * Key levels from `GET /v1/exposure/levels/{symbol}`.
 *
 * Lean payload — just the support/resistance strikes (gamma flip, walls,
 * max pos/neg gamma, highest OI, 0DTE magnet) without the surrounding
 * dashboard. Ideal for chart overlays and small-context LLM prompts.
 */
export interface ExposureLevelsResponse {
  /** Echoed from the request path (e.g. "SPY"). */
  symbol?: string;
  /** Spot mid at `as_of`. */
  underlying_price?: number | null;
  /** ET wall-clock timestamp this snapshot was computed for. */
  as_of?: string;
  levels?: ExposureLevels;
}


// ─── PricingGreeks ───────────────────────────────────────────────────────────
//
// Typed model for `GET /v1/pricing/greeks` (live SDK only — historical
// API doesn't expose pricing).
//
// Black-Scholes-Merton theoretical price plus first / second / third-order
// greeks for a single (spot, strike, dte, sigma) point. Pure deterministic
// math — no market data required, so this endpoint is great for unit tests
// and parameter sweeps.

/** Inputs echoed back into the response (after server-side validation). */
export interface PricingInputs {
  /** Underlying spot price. */
  spot?: number | null;
  /** Strike price. */
  strike?: number | null;
  /** Days to expiration. */
  dte?: number | null;
  /** Annualised volatility as a decimal (e.g. 0.20 = 20%). */
  sigma?: number | null;
  /** `'call'` or `'put'`. */
  type?: 'call' | 'put' | null;
  /** Risk-free rate as a decimal (e.g. 0.05 = 5%). */
  risk_free_rate?: number | null;
  /** Continuous dividend yield as a decimal. */
  dividend_yield?: number | null;
}

/** First-order greeks. */
export interface PricingFirstOrder {
  /** ∂price/∂spot. */
  delta?: number | null;
  /** ∂²price/∂spot². */
  gamma?: number | null;
  /** ∂price/∂t (per calendar day). */
  theta?: number | null;
  /** ∂price/∂sigma (per 1.00 vol unit, NOT per vol point). */
  vega?: number | null;
  /** ∂price/∂r. */
  rho?: number | null;
}

/** Second-order greeks. */
export interface PricingSecondOrder {
  /** ∂²price/∂spot∂sigma. */
  vanna?: number | null;
  /** ∂²price/∂spot∂t. */
  charm?: number | null;
  /** ∂²price/∂sigma². */
  vomma?: number | null;
  /** ∂²price/∂strike² × discount — pure-strike sensitivity. */
  dual_delta?: number | null;
}

/** Third-order greeks. */
export interface PricingThirdOrder {
  /** ∂³price/∂spot³. */
  speed?: number | null;
  /** ∂³price/∂spot²∂sigma. */
  zomma?: number | null;
  /** ∂³price/∂spot²∂t. */
  color?: number | null;
  /** ∂³price/∂sigma³. */
  ultima?: number | null;
}

/** Additional non-greek pricing scalars. */
export interface PricingAdditional {
  /** Elasticity: `delta * spot / price`. `null` if `theoretical_price <= 0`. */
  lambda?: number | null;
  /** ∂vega/∂t — vega decay rate. */
  veta?: number | null;
}

/**
 * Black-Scholes-Merton pricing + greeks from `GET /v1/pricing/greeks`.
 *
 * Pure-math endpoint — feed `(spot, strike, dte, sigma, type, r, q)` and
 * get back theoretical price plus first / second / third-order greeks.
 * No market-data dependencies, so it's ideal for unit tests, parameter
 * sweeps, and risk-explain attribution.
 *
 * Vega is per 1.00 vol unit (NOT per vol point). Theta is per calendar
 * day (NOT per trading day). `additional.lambda` is `null` whenever
 * `theoretical_price <= 0` to avoid divide-by-zero.
 */
export interface PricingGreeksResponse {
  /** Inputs echoed back into the response. */
  inputs?: PricingInputs;
  /** BSM theoretical option price. */
  theoretical_price?: number | null;
  /** First-order greeks (delta, gamma, theta, vega, rho). */
  first_order?: PricingFirstOrder;
  /** Second-order greeks (vanna, charm, vomma, dual_delta). */
  second_order?: PricingSecondOrder;
  /** Third-order greeks (speed, zomma, color, ultima). */
  third_order?: PricingThirdOrder;
  /** Additional non-greek scalars (lambda, veta). */
  additional?: PricingAdditional;
}


// ─── Volatility ──────────────────────────────────────────────────────────────
//
// Typed model for `GET /v1/volatility/{symbol}` (Growth+).
//
// Comprehensive vol dashboard — realized vol at five horizons, ATM IV, the
// IV-RV spread (variance risk premium), per-expiry skew profiles, term
// structure with regime label, IV dispersion stats, GEX-by-DTE and
// theta-by-DTE buckets, the put/call profile (by-expiry and by-moneyness),
// OI concentration metrics, hedging scenarios, and a liquidity block.

/** Realized volatility at canonical horizons (annualised %). */
export interface VolatilityRealizedVol {
  /** Realized vol over trailing 5 trading days. */
  rv_5d?: number | null;
  /** Realized vol over trailing 10 trading days. */
  rv_10d?: number | null;
  /** Realized vol over trailing 20 trading days. */
  rv_20d?: number | null;
  /** Realized vol over trailing 30 trading days. */
  rv_30d?: number | null;
  /** Realized vol over trailing 60 trading days. */
  rv_60d?: number | null;
}

/**
 * IV-RV spread (variance risk premium) at multiple horizons, plus a verbal
 * `assessment` label. Each `vrp_Nd` is `atm_iv - rv_Nd`.
 */
export interface VolatilityIvRvSpreads {
  vrp_5d?: number | null;
  vrp_10d?: number | null;
  vrp_20d?: number | null;
  vrp_30d?: number | null;
  /** Plain-English assessment ("rich", "fair", "cheap", etc.). */
  assessment?: string | null;
}

/**
 * Per-expiry skew profile — 10/25-delta wing IVs, ATM IV, the 25-delta
 * skew, the smile ratio, and a tail-convexity statistic.
 */
export interface VolatilitySkewProfile {
  /** Expiry date (YYYY-MM-DD). */
  expiry?: string | null;
  /** Calendar days to this expiry. */
  days_to_expiry?: number | null;
  /** 10-delta put IV (annualised %). */
  put_10d_iv?: number | null;
  /** 25-delta put IV (annualised %). */
  put_25d_iv?: number | null;
  /** ATM IV (annualised %). */
  atm_iv?: number | null;
  /** 25-delta call IV (annualised %). */
  call_25d_iv?: number | null;
  /** 10-delta call IV (annualised %). */
  call_10d_iv?: number | null;
  /** `put_25d_iv - call_25d_iv`. Positive = downside-skewed. */
  skew_25d?: number | null;
  /** `(put_25d_iv + call_25d_iv) / 2 / atm_iv`. */
  smile_ratio?: number | null;
  /** Tail-convexity statistic from the 10d wings. */
  tail_convexity?: number | null;
}

/**
 * IV term structure summary — slope of the near and far portions of the
 * ATM-IV curve, plus a regime classification.
 */
export interface VolatilityTermStructure {
  /** Slope of the near (front) portion of the ATM-IV curve, in percent. */
  near_slope_pct?: number | null;
  /** Slope of the far (back) portion of the ATM-IV curve, in percent. */
  far_slope_pct?: number | null;
  /** `'contango'` | `'backwardation'` | `'flat'` | `'mixed'` | etc. */
  state?: string | null;
}

/** Cross-sectional IV dispersion across expiries and strikes. */
export interface VolatilityIvDispersion {
  /** Standard deviation of ATM-IV across listed expiries. */
  cross_expiry?: number | null;
  /** Standard deviation of IV across strikes (typically front expiry). */
  cross_strike?: number | null;
}

/** One bucket of the GEX-by-DTE curve. */
export interface VolatilityGexBucket {
  /** Bucket label (e.g. "0-7d", "8-30d"). */
  bucket?: string | null;
  /** Net dealer GEX in this DTE bucket. */
  net_gex?: number | null;
  /** Share of total absolute chain GEX (0-100). */
  pct_of_total?: number | null;
  /** Number of contracts contributing to this bucket. */
  contract_count?: number | null;
}

/** One bucket of the theta-by-DTE curve. */
export interface VolatilityThetaBucket {
  bucket?: string | null;
  /** Net dealer theta in this DTE bucket. */
  net_theta?: number | null;
  contract_count?: number | null;
}

/** Per-expiry put/call OI and volume breakdown. */
export interface VolatilityPutCallByExpiry {
  expiry?: string | null;
  call_oi?: number | null;
  put_oi?: number | null;
  /** `put_oi / call_oi`. */
  pc_ratio_oi?: number | null;
  call_volume?: number | null;
  put_volume?: number | null;
  /** `put_volume / call_volume`. */
  pc_ratio_volume?: number | null;
}

/**
 * Put/call OI grouped by moneyness bucket (OTM / ATM / ITM × call / put).
 * Useful for spotting skewed positioning at a glance.
 */
export interface VolatilityPutCallByMoneyness {
  otm_call_oi?: number | null;
  atm_call_oi?: number | null;
  itm_call_oi?: number | null;
  otm_put_oi?: number | null;
  atm_put_oi?: number | null;
  itm_put_oi?: number | null;
}

/** Put/call profile container — by-expiry array plus by-moneyness object. */
export interface VolatilityPutCallProfile {
  by_expiry?: VolatilityPutCallByExpiry[];
  by_moneyness?: VolatilityPutCallByMoneyness;
}

/** OI concentration metrics — top-N share and the Herfindahl index. */
export interface VolatilityOiConcentration {
  /** Top-3-strike share of total OI (0-100). */
  top_3_pct?: number | null;
  /** Top-5-strike share of total OI. */
  top_5_pct?: number | null;
  /** Top-10-strike share of total OI. */
  top_10_pct?: number | null;
  /** Herfindahl-Hirschman index (sum of squared shares). */
  herfindahl?: number | null;
}

/**
 * Per-scenario hedging estimate row.
 *
 * `dealer_shares` is the MAGNITUDE — combine with `direction` (`'buy'` or
 * `'sell'`) to reconstruct the signed flow. `notional_usd = dealer_shares *
 * spot`.
 */
export interface VolatilityHedgingScenario {
  /** Hypothetical spot move as a fraction (e.g. 0.01 = +1%). */
  move_pct?: number | null;
  /** Magnitude of dealer shares to trade (always >= 0). */
  dealer_shares?: number | null;
  /** `'buy'` = dealers must buy; `'sell'` = dealers must sell. */
  direction?: 'buy' | 'sell' | null;
  /** `dealer_shares * spot`, in USD. */
  notional_usd?: number | null;
}

/** Liquidity stats — ATM vs wing average bid-ask spreads and contract counts. */
export interface VolatilityLiquidity {
  /** Average ATM bid-ask spread as a percentage of mid. */
  atm_avg_spread_pct?: number | null;
  /** Average wing bid-ask spread as a percentage of mid. */
  wing_avg_spread_pct?: number | null;
  /** Count of contracts classified ATM. */
  atm_contracts?: number | null;
  /** Count of contracts classified wing. */
  wing_contracts?: number | null;
}

/**
 * Comprehensive volatility dashboard from `GET /v1/volatility/{symbol}` (Growth+).
 *
 * Bundles realized-vol at five horizons, ATM IV, the IV-RV spread (VRP),
 * per-expiry skew profiles, term-structure slope/state, IV dispersion,
 * GEX/theta-by-DTE buckets, the put/call profile (by-expiry and
 * by-moneyness), OI concentration, hedging scenarios, and a liquidity
 * block.
 */
export interface VolatilityResponse {
  /** Echoed from the request path (e.g. "SPY"). */
  symbol?: string;
  /** Spot mid at `as_of`. */
  underlying_price?: number | null;
  /** ET wall-clock timestamp this snapshot was computed for. */
  as_of?: string;
  /** True if NYSE was open at `as_of`. */
  market_open?: boolean | null;
  /** Realized volatility at canonical horizons. */
  realized_vol?: VolatilityRealizedVol;
  /** ATM implied volatility (annualised %). */
  atm_iv?: number | null;
  /** IV-RV spread (variance risk premium) at multiple horizons. */
  iv_rv_spreads?: VolatilityIvRvSpreads;
  /** Per-expiry skew profiles. */
  skew_profiles?: VolatilitySkewProfile[];
  /** IV term structure summary. */
  term_structure?: VolatilityTermStructure;
  /** Cross-sectional IV dispersion. */
  iv_dispersion?: VolatilityIvDispersion;
  /** GEX-by-DTE buckets. */
  gex_by_dte?: VolatilityGexBucket[];
  /** Theta-by-DTE buckets. */
  theta_by_dte?: VolatilityThetaBucket[];
  /** Put/call profile (by-expiry + by-moneyness). */
  put_call_profile?: VolatilityPutCallProfile;
  /** OI concentration metrics. */
  oi_concentration?: VolatilityOiConcentration;
  /** Hedging scenarios across hypothetical spot moves. */
  hedging_scenarios?: VolatilityHedgingScenario[];
  /** Liquidity stats — ATM vs wing spreads and contract counts. */
  liquidity?: VolatilityLiquidity;
}


// ─── AdvVolatility ───────────────────────────────────────────────────────────
//
// Typed model for `GET /v1/adv_volatility/{symbol}` (Alpha+).
//
// Advanced vol analytics — calibrated SVI parameters per expiry, forward
// prices with basis, the full 2D total-variance surface (and its IV
// transform), surface-level arbitrage flags, variance-swap fair values,
// and the 2D vanna/charm/volga/speed greek surfaces.

/**
 * SVI (Stochastic Volatility Inspired) parameter set for a single expiry.
 *
 * Standard parametrization: `total_variance(k) = a + b * (rho * (k - m) +
 * sqrt((k - m)^2 + sigma^2))`, where `k = log(strike / forward)`.
 */
export interface AdvVolatilitySviParameters {
  /** Expiry date (YYYY-MM-DD). */
  expiry?: string | null;
  /** Calendar days to this expiry. */
  days_to_expiry?: number | null;
  /** Forward price for this expiry. */
  forward?: number | null;
  /** SVI level parameter. */
  a?: number | null;
  /** SVI angle parameter (overall slope). */
  b?: number | null;
  /** SVI rotation parameter (skew direction, in [-1, 1]). */
  rho?: number | null;
  /** SVI translation parameter (smile shift along log-moneyness). */
  m?: number | null;
  /** SVI smoothing parameter (smile curvature). */
  sigma?: number | null;
  /** Total variance at the money for this expiry. */
  atm_total_variance?: number | null;
  /** ATM IV (annualised %) implied by the calibrated SVI fit. */
  atm_iv?: number | null;
}

/** Forward / spot / basis at a single expiry. */
export interface AdvVolatilityForwardPrice {
  expiry?: string | null;
  days_to_expiry?: number | null;
  /** Forward price for this expiry. */
  forward?: number | null;
  /** Spot at `as_of` (echoed for convenience). */
  spot?: number | null;
  /** `(forward - spot) / spot * 100`. */
  basis_pct?: number | null;
}

/**
 * 2D total-variance surface (and its IV transform).
 *
 * `total_variance` and `implied_vol` are row-major 2D arrays indexed
 * `[expiry_index][moneyness_index]`. Use `expiries` (or `tenors`) and
 * `moneyness` to label the axes.
 */
export interface AdvVolatilityTotalVarianceSurface {
  /** Log-moneyness grid (axis values). */
  moneyness?: number[];
  /** Expiry-date axis (YYYY-MM-DD), row-aligned with `tenors`. */
  expiries?: string[];
  /** Tenor in years (axis values), row-aligned with `expiries`. */
  tenors?: number[];
  /** Total variance grid `[expiry][moneyness]`. */
  total_variance?: number[][];
  /** Implied vol grid `[expiry][moneyness]` (annualised %). */
  implied_vol?: number[][];
}

/**
 * Surface-level arbitrage flag — calendar arb, butterfly arb, or related
 * shape violations of the calibrated surface.
 */
export interface AdvVolatilityArbitrageFlag {
  /** Expiry the violation lands on. */
  expiry?: string | null;
  /** Violation type (e.g. "calendar_arb", "butterfly_arb"). */
  type?: string | null;
  /** Strike or log-moneyness coordinate where the violation was detected. */
  strike_or_k?: number | null;
  /** Plain-English description. Safe to surface verbatim. */
  description?: string | null;
}

/**
 * Variance-swap fair-value row.
 *
 * `fair_variance` is the model-fair forward variance; `fair_vol` is its
 * vol-equivalent (annualised %). `convexity_adjustment` is the gap between
 * `fair_vol` and `atm_iv`.
 */
export interface AdvVolatilityVarianceSwapFairValue {
  expiry?: string | null;
  days_to_expiry?: number | null;
  /** Variance-swap fair variance. */
  fair_variance?: number | null;
  /** Variance-swap fair vol (annualised %). */
  fair_vol?: number | null;
  /** ATM IV at this expiry (annualised %). */
  atm_iv?: number | null;
  /** `fair_vol - atm_iv`. */
  convexity_adjustment?: number | null;
}

/**
 * 2D greek surface — vanna, charm, volga, or speed.
 *
 * `values` is a row-major 2D array indexed `[expiry_index][strike_index]`.
 * Use `strikes` and `expiries` to label the axes.
 */
export interface AdvVolatilityGreekSurface {
  strikes?: number[];
  expiries?: string[];
  /** Greek values `[expiry][strike]`. */
  values?: number[][];
}

/** Container for the four 2D greek surfaces returned by adv_volatility. */
export interface AdvVolatilityGreeksSurfaces {
  vanna?: AdvVolatilityGreekSurface;
  charm?: AdvVolatilityGreekSurface;
  volga?: AdvVolatilityGreekSurface;
  speed?: AdvVolatilityGreekSurface;
}

/**
 * Advanced volatility analytics from `GET /v1/adv_volatility/{symbol}` (Alpha+).
 *
 * Returns calibrated SVI parameters per expiry, forward prices with basis,
 * the full 2D total-variance surface and its IV transform, surface-level
 * arbitrage flags, variance-swap fair values, and the 2D vanna / charm /
 * volga / speed greek surfaces.
 */
export interface AdvVolatilityResponse {
  /** Echoed from the request path (e.g. "SPY"). */
  symbol?: string;
  /** Spot mid at `as_of`. */
  underlying_price?: number | null;
  /** ET wall-clock timestamp this snapshot was computed for. */
  as_of?: string;
  /** True if NYSE was open at `as_of`. */
  market_open?: boolean | null;
  /** Calibrated SVI parameter set per listed expiry. */
  svi_parameters?: AdvVolatilitySviParameters[];
  /** Forward / spot / basis per listed expiry. */
  forward_prices?: AdvVolatilityForwardPrice[];
  /** 2D total-variance surface and its IV transform. */
  total_variance_surface?: AdvVolatilityTotalVarianceSurface;
  /** Surface-level arbitrage flags (calendar, butterfly, etc.). */
  arbitrage_flags?: AdvVolatilityArbitrageFlag[];
  /** Variance-swap fair-value rows per expiry. */
  variance_swap_fair_values?: AdvVolatilityVarianceSwapFairValue[];
  /** 2D vanna / charm / volga / speed greek surfaces. */
  greeks_surfaces?: AdvVolatilityGreeksSurfaces;
}


// ─── Surface ─────────────────────────────────────────────────────────────────
//
// Typed model for `GET /v1/surface/{symbol}` (public, no auth required on
// the live API).
//
// 2D implied-volatility grid — `iv` is row-major `[tenor_index][moneyness_index]`
// with axes labelled by `tenors` (years) and `moneyness` (log-moneyness).
// `slices_used` is the count of option-chain expiry slices that fed the fit.

/**
 * Implied-volatility surface from `GET /v1/surface/{symbol}` (public).
 *
 * `iv` is row-major `[tenor][moneyness]` with axes labelled by `tenors`
 * (years) and `moneyness` (log-moneyness). `grid_size` is the per-axis
 * resolution (typically 50). `slices_used` is the number of option-chain
 * expiry slices that contributed to the calibration.
 */
export interface SurfaceResponse {
  /** Echoed from the request path (e.g. "SPY"). */
  symbol?: string;
  /** Spot at `as_of`. */
  spot?: number | null;
  /** ET wall-clock timestamp this snapshot was computed for. */
  as_of?: string;
  /** Per-axis resolution (typically 50). */
  grid_size?: number;
  /** Tenor axis in years. */
  tenors?: number[];
  /** Log-moneyness axis. */
  moneyness?: number[];
  /** Implied vol grid `[tenor][moneyness]` (annualised %). */
  iv?: number[][];
  /** Count of option-chain expiry slices that contributed to the calibration. */
  slices_used?: number;
}


// ─── Exposure (GEX/DEX/VEX/CHEX) ─────────────────────────────────────────────
//
// Typed models for `GET /v1/exposure/{gex,dex,vex,chex}/{symbol}`.
//
// Per-strike dealer-greek exposure. Each endpoint returns a top-level summary
// (signed net exposure plus, for vex/chex, an `*_interpretation` label) and a
// `strikes` array with the per-strike call/put/net split. GEX additionally
// returns OI, volume, and OI-change columns.

/** One row of the GEX-by-strike table. */
export interface GexStrike {
  /** Strike price. */
  strike?: number | null;
  /** Call-side gamma exposure at this strike. */
  call_gex?: number | null;
  /** Put-side gamma exposure at this strike. */
  put_gex?: number | null;
  /** `call_gex + put_gex`. */
  net_gex?: number | null;
  call_oi?: number | null;
  put_oi?: number | null;
  call_volume?: number | null;
  put_volume?: number | null;
  /** Day-over-day change in call OI. */
  call_oi_change?: number | null;
  /** Day-over-day change in put OI. */
  put_oi_change?: number | null;
}

/**
 * Gamma-exposure-by-strike from `GET /v1/exposure/gex/{symbol}`.
 *
 * `gamma_flip` is the strike where net dealer gamma crosses zero.
 * `net_gex_label` is a verbal classifier ("positive_gamma" /
 * "negative_gamma" / etc.) consistent with `exposure_summary.regime`.
 */
export interface GexResponse {
  /** Echoed from the request path (e.g. "SPY"). */
  symbol?: string;
  /** Spot mid at `as_of`. */
  underlying_price?: number | null;
  /** ET wall-clock timestamp this snapshot was computed for. */
  as_of?: string;
  /** Strike where net dealer gamma crosses zero. */
  gamma_flip?: number | null;
  /** Net dealer gamma exposure summed across the chain. */
  net_gex?: number | null;
  /** Verbal classifier (e.g. `'positive_gamma'`, `'negative_gamma'`). */
  net_gex_label?: string | null;
  /** Per-strike GEX breakdown. */
  strikes?: GexStrike[];
}

/** One row of the DEX-by-strike table. */
export interface DexStrike {
  strike?: number | null;
  call_dex?: number | null;
  put_dex?: number | null;
  /** `call_dex + put_dex`. */
  net_dex?: number | null;
}

/** Delta-exposure-by-strike from `GET /v1/exposure/dex/{symbol}`. */
export interface DexResponse {
  symbol?: string;
  underlying_price?: number | null;
  as_of?: string;
  /** Net dealer delta exposure summed across the chain. */
  net_dex?: number | null;
  strikes?: DexStrike[];
}

/** One row of the VEX-by-strike table. */
export interface VexStrike {
  strike?: number | null;
  call_vex?: number | null;
  put_vex?: number | null;
  /** `call_vex + put_vex`. */
  net_vex?: number | null;
}

/** Vanna-exposure-by-strike from `GET /v1/exposure/vex/{symbol}`. */
export interface VexResponse {
  symbol?: string;
  underlying_price?: number | null;
  as_of?: string;
  /** Net dealer vanna exposure summed across the chain. */
  net_vex?: number | null;
  /** Plain-English interpretation of the net vanna regime. */
  vex_interpretation?: string | null;
  strikes?: VexStrike[];
}

/** One row of the CHEX-by-strike table. */
export interface ChexStrike {
  strike?: number | null;
  call_chex?: number | null;
  put_chex?: number | null;
  /** `call_chex + put_chex`. */
  net_chex?: number | null;
}

/** Charm-exposure-by-strike from `GET /v1/exposure/chex/{symbol}`. */
export interface ChexResponse {
  symbol?: string;
  underlying_price?: number | null;
  as_of?: string;
  /** Net dealer charm exposure summed across the chain. */
  net_chex?: number | null;
  /** Plain-English interpretation of the net charm regime. */
  chex_interpretation?: string | null;
  strikes?: ChexStrike[];
}


// ─── OptionQuote (live only) ─────────────────────────────────────────────────
//
// Typed model for `GET /optionquote/{ticker}` (Growth+, live only — the
// historical API exposes a different shape under `/v1/optionquote/`).
//
// Single-contract live quote with greeks, IV, and SVI vol overlay. Note the
// camelCase fields (`bidSize`, `askSize`, `lastUpdate`) — these are
// preserved from the upstream feed and don't follow the snake_case convention
// of the analytics endpoints.

/**
 * Live option quote from `GET /optionquote/{ticker}` (Growth+, live only).
 *
 * Returns top-of-book bid/ask/mid plus first / second-order greeks (delta,
 * gamma, theta, vega, rho, vanna, charm), implied vol (mid + bid/ask), the
 * SVI-fitted vol overlay (`svi_vol` — `null` when ungated), open interest,
 * and volume.
 *
 * camelCase field names (`bidSize`, `askSize`, `lastUpdate`) are preserved
 * from the upstream feed and don't follow the snake_case convention of the
 * analytics endpoints.
 */
export interface OptionQuoteResponse {
  /** `'call'` or `'put'`. */
  type?: 'call' | 'put' | string;
  /** Expiry date (YYYY-MM-DD). */
  expiry?: string;
  /** Strike price. */
  strike?: number;
  bid?: number | null;
  ask?: number | null;
  /** `(bid + ask) / 2`. */
  mid?: number | null;
  /** Top-of-book bid size. */
  bidSize?: number | null;
  /** Top-of-book ask size. */
  askSize?: number | null;
  /** ISO timestamp of the last quote tick. */
  lastUpdate?: string | null;
  /** Implied vol from the mid (annualised %). */
  implied_vol?: number | null;
  /** Implied vol from the bid (annualised %). */
  iv_bid?: number | null;
  /** Implied vol from the ask (annualised %). */
  iv_ask?: number | null;
  delta?: number | null;
  gamma?: number | null;
  theta?: number | null;
  vega?: number | null;
  rho?: number | null;
  vanna?: number | null;
  charm?: number | null;
  /** SVI-fitted vol; `null` when the gate isn't satisfied. */
  svi_vol?: number | null;
  /** Plain-English reason `svi_vol` is or isn't gated. */
  svi_vol_gated?: string | null;
  open_interest?: number | null;
  volume?: number | null;
  /** Underlying ticker, present on some response shapes. */
  underlying?: string;
}


// ─── StockQuote (live only) ──────────────────────────────────────────────────
//
// Typed model for `GET /stockquote/{ticker}` (Free+, live only — the
// historical API exposes a different shape under `/v1/stockquote/`).
//
// Top-of-book live spot quote. camelCase `lastPrice` and `lastUpdate` are
// preserved from the upstream feed.

/**
 * Live stock quote from `GET /stockquote/{ticker}` (Free+, live only).
 *
 * Top-of-book bid/ask/mid plus the most recent traded price. camelCase
 * field names (`lastPrice`, `lastUpdate`) are preserved from the upstream
 * feed and don't follow the snake_case convention of the analytics
 * endpoints.
 */
export interface StockQuoteResponse {
  /** Echoed from the request path (e.g. "SPY"). */
  ticker?: string;
  bid?: number | null;
  ask?: number | null;
  /** `(bid + ask) / 2`. */
  mid?: number | null;
  /** Most recent traded price. */
  lastPrice?: number | null;
  /** ISO timestamp of the last quote tick. */
  lastUpdate?: string | null;
}


// ─── PricingIv (live only) ───────────────────────────────────────────────────
//
// Typed model for `GET /v1/pricing/iv` (Free+, live only).
//
// Inverts the BSM pricer to back out the implied volatility that reproduces a
// given option mid. Pure deterministic math — no market data required, so
// it's ideal for unit tests, parameter sweeps, and IV recalibration.

/** Inputs echoed back into the response (after server-side validation). */
export interface PricingIvInputs {
  /** Underlying spot price. */
  spot?: number | null;
  /** Strike price. */
  strike?: number | null;
  /** Days to expiration. */
  dte?: number | null;
  /** Market option price the inversion is solving for. */
  price?: number | null;
  /** `'call'` or `'put'`. */
  type?: 'call' | 'put' | string | null;
  /** Risk-free rate as a decimal (e.g. 0.05 = 5%). */
  risk_free_rate?: number | null;
  /** Continuous dividend yield as a decimal. */
  dividend_yield?: number | null;
}

/**
 * Implied volatility from `GET /v1/pricing/iv` (Free+, live only).
 *
 * Solves the BSM pricer for the volatility that reproduces `inputs.price`.
 * `implied_volatility` is the decimal form (e.g. 0.20 = 20%);
 * `implied_volatility_pct` is the same value in percent (e.g. 20.0).
 */
export interface PricingIvResponse {
  /** Inputs echoed back into the response. */
  inputs?: PricingIvInputs;
  /** Implied volatility as a decimal (e.g. 0.20 = 20%). */
  implied_volatility?: number;
  /** Implied volatility in percent (e.g. 20.0). */
  implied_volatility_pct?: number;
}


// ─── PricingKelly (live only) ────────────────────────────────────────────────
//
// Typed model for `GET /v1/pricing/kelly` (Growth+, live only).
//
// Optimal-bet-fraction sizing for a single option position, given a forward
// drift (`mu`), realised vol estimate (`sigma`), and the current premium.
// Returns the full Kelly fraction plus half- and quarter-Kelly variants for
// risk-managed sizing, and a synthesis block with expected ROI, payoff,
// probability of profit / ITM, max loss, breakeven, and expected growth rate.

/** Inputs echoed back into the response (after server-side validation). */
export interface PricingKellyInputs {
  /** Underlying spot price. */
  spot?: number | null;
  /** Strike price. */
  strike?: number | null;
  /** Days to expiration. */
  dte?: number | null;
  /** Annualised volatility as a decimal (e.g. 0.20 = 20%). */
  sigma?: number | null;
  /** Premium paid for the option. */
  premium?: number | null;
  /** Forward drift as a decimal. */
  mu?: number | null;
  /** `'call'` or `'put'`. */
  type?: 'call' | 'put' | string | null;
  /** Risk-free rate as a decimal. */
  risk_free_rate?: number | null;
  /** Continuous dividend yield as a decimal. */
  dividend_yield?: number | null;
}

/**
 * Kelly sizing block — full Kelly fraction plus half- and quarter-Kelly
 * variants for risk-managed sizing.
 */
export interface PricingKellySizing {
  /** Optimal Kelly fraction as a decimal (e.g. 0.25 = bet 25% of bankroll). */
  kelly_fraction?: number;
  /** `kelly_fraction / 2`. */
  half_kelly?: number;
  /** `kelly_fraction / 4`. */
  quarter_kelly?: number;
  /** Kelly fraction in percent (e.g. 25.0). */
  kelly_pct?: number;
  /** Half Kelly in percent. */
  half_kelly_pct?: number;
}

/**
 * Kelly analysis block — expected ROI, payoff, win probabilities, max loss,
 * breakeven, and expected growth rate at the optimal bet fraction.
 */
export interface PricingKellyAnalysis {
  /** Expected return on investment as a decimal. */
  expected_roi?: number;
  /** Expected ROI in percent. */
  expected_roi_pct?: number;
  /** Expected payoff in dollars per contract. */
  expected_payoff?: number;
  /** Probability of finishing the trade profitable (decimal). */
  probability_of_profit?: number;
  /** Probability of profit in percent. */
  probability_of_profit_pct?: number;
  /** Probability of finishing in-the-money (decimal). */
  probability_itm?: number;
  /** Probability ITM in percent. */
  probability_itm_pct?: number;
  /** Max loss in dollars per contract. */
  max_loss?: number;
  /** Breakeven price of the underlying at expiry. */
  breakeven?: number;
  /** Expected log-growth rate at the optimal bet fraction. */
  expected_growth_rate?: number;
}

/**
 * Kelly criterion sizing from `GET /v1/pricing/kelly` (Growth+, live only).
 *
 * Returns the optimal bet fraction (with half- and quarter-Kelly variants),
 * the analytical block (expected ROI, payoff, win probabilities, max loss,
 * breakeven, expected growth rate), and a plain-English `recommendation`.
 */
export interface PricingKellyResponse {
  /** Inputs echoed back into the response. */
  inputs?: PricingKellyInputs;
  /** Kelly sizing block. */
  sizing?: PricingKellySizing;
  /** Analysis block. */
  analysis?: PricingKellyAnalysis;
  /** Plain-English sizing recommendation. Safe to surface verbatim. */
  recommendation?: string;
}


// ─── Account / Tickers / Symbols / OptionsMeta / Health / Screener ───────────
//
// Typed models for the small remaining endpoints — quota lookup, reference
// data (tickers / symbols / options metadata), the health probe, and the
// screener envelope.

/**
 * Account info and quota from `GET /v1/account`.
 *
 * Returns user identity, plan tier, and current daily quota state.
 */
export interface AccountResponse {
  /** Stable internal user identifier. */
  user_id?: string;
  /** Account email. */
  email?: string;
  /** Plan tier ("free", "growth", "alpha", etc.). */
  plan?: string;
  /**
   * Daily request limit on the current plan. **String, not number** —
   * numeric (e.g. `"1000"`) on bounded plans, literal `"unlimited"` on
   * Alpha / Enterprise tiers.
   */
  daily_limit?: string;
  /** Requests used so far today (true integer). */
  usage_today?: number;
  /**
   * Requests remaining today. Numeric string on bounded plans;
   * `"unlimited"` on uncapped tiers — same semantics as `daily_limit`.
   */
  remaining?: string;
  /** ISO timestamp at which `usage_today` resets. */
  resets_at?: string;
}

/**
 * Tickers list from `GET /v1/tickers`.
 *
 * `tickers` is the alphabetically-sorted list of all available symbols;
 * `count` is `tickers.length`.
 */
export interface TickersResponse {
  tickers?: string[];
  count?: number;
}

/**
 * Currently-queried symbols from `GET /v1/symbols`.
 *
 * `symbols` is the list of symbols with live data updating in the
 * in-memory store; `note` is a server-side annotation; `last_updated`
 * is the ISO timestamp of the most recent refresh.
 */
export interface SymbolsResponse {
  symbols?: string[];
  count?: number;
  note?: string;
  last_updated?: string;
}

/** One row of the `expirations` array on `OptionsMetaResponse`. */
export interface OptionsMetaExpiration {
  /** Expiry date (YYYY-MM-DD). */
  expiration?: string;
  /** Strikes listed at this expiry, ascending. */
  strikes?: number[];
}

/**
 * Option chain metadata from `GET /v1/options/{ticker}`.
 *
 * Lean metadata payload — just the expirations and the strikes listed at
 * each. Use this to build expiration / strike pickers without fetching
 * the full option chain.
 */
export interface OptionsMetaResponse {
  /** Echoed from the request path (e.g. "SPY"). */
  symbol?: string;
  /** Per-expiry strike lists. */
  expirations?: OptionsMetaExpiration[];
  /** Number of expirations returned. */
  expiration_count?: number;
  /** Total contract count across all expirations and strikes. */
  total_contracts?: number;
}

/**
 * Health-check response from `GET /health` (public).
 *
 * Tiny payload — just a `status` string. Useful for readiness probes
 * and end-to-end smoke tests.
 */
export interface HealthResponse {
  status?: string;
}

/**
 * Meta block on the screener response. Identifies the universe size,
 * tier the request was served under, the as-of timestamp, and the
 * pagination state.
 */
export interface ScreenerMeta {
  /** Total rows matching the filter, before pagination. */
  total_count?: number;
  /** Rows actually returned in this response (after `limit`/`offset`). */
  returned_count?: number;
  /** Total symbols in the underlying universe at the current tier. */
  universe_size?: number;
  /** Pagination offset that was applied. */
  offset?: number;
  /** Pagination limit that was applied. */
  limit?: number;
  /** Plan tier the request was served under ("growth", "alpha", etc.). */
  tier?: string;
  /** ET wall-clock timestamp of the screener snapshot. */
  as_of?: string;
}

/**
 * Screener response from `POST /v1/screener` (Growth+).
 *
 * `meta` carries the universe size, tier, as-of, and pagination state.
 * `data` is an array of plain rows whose shape depends entirely on the
 * `select` field of the request — leave it untyped (`Record<string, unknown>[]`)
 * and cast at the call site.
 */
export interface ScreenerResponse {
  meta?: ScreenerMeta;
  data?: Record<string, unknown>[];
}

// ── Flow (live, simulation-aware) ───────────────────────────────────────────
//
// Typed models for the `/v1/flow/*` surface (Alpha+). Two families:
//
//  * **Analytics** (`/v1/flow/{levels,pin-risk,summary,oi,gex,dex,
//    dealer-risk,live}/{symbol}`) — simulation-aware exposure that folds
//    today's intraday trade tape onto the settled book, so gamma flip /
//    walls / GEX reflect *today's* flow. snake_case wire shape. Optional
//    `expiry=YYYY-MM-DD` slices to one expiration cycle.
//
//  * **Raw flow data** (`/v1/flow/options/*`, `/v1/flow/stocks/*`) — the
//    underlying trade tape: prints, blocks, per-minute history, cumulative
//    net-flow series, cross-symbol leaderboards / outliers. Proxied verbatim
//    so wire keys are **camelCase** and timestamps are ISO-8601 UTC strings.
//
// Flow gex/dex per-strike rows are the same wire shape as the settled
// `/v1/exposure/gex|dex` endpoints, so they reuse `GexStrike` / `DexStrike`.

/**
 * Live key levels from `GET /v1/flow/levels/{symbol}`.
 *
 * Gamma flip, call/put walls and max-pain recomputed against the live
 * (intraday-flow-adjusted) book. Each level is `null` when it can't be
 * located (e.g. no sign change in net gamma). Requires the Alpha plan.
 */
export interface FlowLevelsResponse {
  /** Underlying ticker echoed from the request path. */
  symbol?: string;
  /** Timestamp this snapshot was computed for (ISO-8601 UTC). */
  as_of?: string;
  /** Spot mid at `as_of`. */
  underlying_price?: number | null;
  /** Expiration filter echoed back (`YYYY-MM-DD`), or `null`/absent for the whole chain. */
  expiry?: string | null;
  /** Spot where live net dealer gamma crosses zero. `null` if no flip. */
  live_gamma_flip?: number | null;
  /** Strike of the largest live call-gamma concentration (upside magnet). */
  live_call_wall?: number | null;
  /** Strike of the largest live put-gamma concentration (downside magnet). */
  live_put_wall?: number | null;
  /** Live max-pain strike (most option value expires worthless). */
  live_max_pain?: number | null;
}

/** Component scores (0–100) behind the `live_pin_risk` headline. */
export interface FlowPinRiskBreakdown {
  /** Open-interest concentration around the magnet strike. */
  oi_score?: number;
  /** How close spot is to the magnet strike. */
  proximity_score?: number;
  /** Time-to-close weighting (pin pressure rises into the cash close). */
  time_score?: number;
  /** Dealer-gamma intensity at the magnet strike. */
  gamma_score?: number;
}

/**
 * 0DTE pin-risk score from `GET /v1/flow/pin-risk/{symbol}`.
 *
 * `live_pin_risk` is a 0–100 composite of the four `breakdown`
 * components. `magnet_strike` is the strike spot is most likely pinned
 * toward into the close. Requires the Alpha plan.
 */
export interface FlowPinRiskResponse {
  /** Underlying ticker echoed from the request path. */
  symbol?: string;
  /** Timestamp this snapshot was computed for (ISO-8601 UTC). */
  as_of?: string;
  /** Spot mid at the snapshot time. */
  underlying_price?: number | null;
  /** Expiration filter echoed back, or `null`. */
  expiry?: string | null;
  /** Composite 0–100 pin-risk score (higher = stronger pin pull). */
  live_pin_risk?: number;
  /** Pin magnet strike (`argmax|net gamma|`). `null` if no dominant strike. */
  magnet_strike?: number | null;
  /** Signed % distance from spot to the magnet strike. */
  distance_to_magnet_pct?: number | null;
  /** Hours remaining until the regular-session cash close. */
  time_to_close_hours?: number | null;
  /** Component scores behind `live_pin_risk`. */
  breakdown?: FlowPinRiskBreakdown;
}

/**
 * At-a-glance flow direction from `GET /v1/flow/summary/{symbol}`.
 * Headline read on whether today's tape has shifted the dealer book.
 * Requires the Alpha plan.
 */
export interface FlowSummaryResponse {
  /** Underlying ticker echoed from the request path. */
  symbol?: string;
  /** Timestamp this snapshot was computed for (ISO-8601 UTC). */
  as_of?: string;
  /** Spot mid at the snapshot time. */
  underlying_price?: number | null;
  /** Expiration filter echoed back, or `null`. */
  expiry?: string | null;
  /** Net classified direction of intraday flow (e.g. `'bullish'`, `'bearish'`, `'neutral'`). */
  flow_direction?: string;
  /** Net change in simulated open interest since the open (contracts). */
  intraday_oi_delta?: number;
  /** Contracts that have printed at least one trade today. */
  contracts_with_flow?: number;
  /** Total contracts tracked for the underlying. */
  contracts_total?: number;
  /** Live (flow-adjusted) net GEX (dollars per 1% spot move). */
  live_gex?: number | null;
  /** % shift in net GEX caused by today's flow vs the settled book. `null` when the settled baseline is zero. */
  flow_gex_pct_shift?: number | null;
}

/**
 * Open-interest simulator state from `GET /v1/flow/oi/{symbol}`.
 * Settled (official) OI vs the intraday simulated OI. Requires the Alpha
 * plan. Note: this endpoint does NOT return `underlying_price`.
 */
export interface FlowOiResponse {
  /** Underlying ticker echoed from the request path. */
  symbol?: string;
  /** Timestamp this snapshot was computed for (ISO-8601 UTC). */
  as_of?: string;
  /** Expiration filter echoed back, or `null`. */
  expiry?: string | null;
  /** Official exchange OI from the settled snapshot (sum across the chain). */
  official_oi?: number;
  /** Intraday simulated OI (official + estimated open/close from tape). */
  simulated_oi?: number;
  /** `simulated_oi - official_oi` (signed). */
  intraday_oi_delta?: number;
  /** Confidence 0–1 in the intraday OI estimate (trade-tape coverage). */
  oi_delta_confidence?: number | null;
  /** OI actually used by the live analytics (blended). */
  effective_oi?: number;
  /** Total contracts tracked for the underlying. */
  contracts_total?: number;
  /** Contracts that have printed at least one trade today. */
  contracts_with_flow?: number;
}

/**
 * Live per-strike GEX from `GET /v1/flow/gex/{symbol}`.
 * Same per-strike shape as settled `/v1/exposure/gex` (reuses
 * `GexStrike`) computed against the live book. Requires the Alpha plan.
 */
export interface FlowGexResponse {
  /** Underlying ticker echoed from the request path. */
  symbol?: string;
  /** Timestamp this snapshot was computed for (ISO-8601 UTC). */
  as_of?: string;
  /** Spot mid at the snapshot time. */
  underlying_price?: number | null;
  /** Expiration filter echoed back, or `null`. */
  expiry?: string | null;
  /** Live net GEX across the chain (dollars per 1% spot move). */
  live_net_gex?: number | null;
  /** Categorical regime label (e.g. `'positive'`, `'negative'`). */
  live_net_gex_label?: string;
  /** Live gamma-flip spot. `null` if no sign change. */
  live_gamma_flip?: number | null;
  /** Per-strike rows (identical schema to settled GEX). */
  strikes?: GexStrike[];
}

/**
 * Live per-strike DEX from `GET /v1/flow/dex/{symbol}`.
 * Same per-strike shape as settled `/v1/exposure/dex` (reuses
 * `DexStrike`) computed against the live book. Requires the Alpha plan.
 */
export interface FlowDexResponse {
  /** Underlying ticker echoed from the request path. */
  symbol?: string;
  /** Timestamp this snapshot was computed for (ISO-8601 UTC). */
  as_of?: string;
  /** Spot mid at the snapshot time. */
  underlying_price?: number | null;
  /** Expiration filter echoed back, or `null`. */
  expiry?: string | null;
  /** Live net DEX across the chain (dollars). */
  live_net_dex?: number | null;
  /** Per-strike DEX breakdown. */
  strikes?: DexStrike[];
}

/**
 * Settled-vs-live dealer risk from `GET /v1/flow/dealer-risk/{symbol}`.
 * Side-by-side of the settled snapshot and the live flow-adjusted book,
 * with the dollar adjustment and % shift today's tape produced.
 * Requires the Alpha plan.
 */
export interface FlowDealerRiskResponse {
  /** Underlying ticker echoed from the request path. */
  symbol?: string;
  /** Timestamp this snapshot was computed for (ISO-8601 UTC). */
  as_of?: string;
  /** Spot mid at the snapshot time. */
  underlying_price?: number | null;
  /** Expiration filter echoed back, or `null`. */
  expiry?: string | null;
  /** Net GEX from the settled (prior close) snapshot. */
  settled_net_gex?: number | null;
  /** Net GEX from the live flow-adjusted book. */
  live_net_gex?: number | null;
  /** `live_net_gex - settled_net_gex` (dollars). */
  flow_gex_adjustment?: number | null;
  /** % GEX shift from flow. `null` when settled baseline is zero. */
  flow_gex_pct_shift?: number | null;
  /** Net DEX from the settled snapshot. */
  settled_net_dex?: number | null;
  /** Net DEX from the live flow-adjusted book. */
  live_net_dex?: number | null;
  /** `live_net_dex - settled_net_dex` (dollars). */
  flow_dex_adjustment?: number | null;
  /** % DEX shift from flow. `null` when settled baseline is zero. */
  flow_dex_pct_shift?: number | null;
  /** Absolute delta-weighted contracts traded today (flow magnitude). */
  total_abs_delta_contracts?: number;
  /** Contracts that have printed at least one trade today. */
  contracts_with_flow?: number;
  /** Net classified flow direction. */
  flow_direction?: string;
  /** Plain-English summary of whether flow has moved the book — safe to surface verbatim. */
  description?: string;
}

/**
 * Nested dealer-risk block inside `FlowLiveResponse`. Identical to
 * `FlowDealerRiskResponse` minus `contracts_with_flow` (carried on the
 * parent `live` envelope instead).
 */
export interface FlowAdjustedDealerRisk {
  /** Net GEX from the settled (prior close) snapshot. */
  settled_net_gex?: number | null;
  /** Net GEX from the live flow-adjusted book. */
  live_net_gex?: number | null;
  /** `live_net_gex - settled_net_gex` (dollars). */
  flow_gex_adjustment?: number | null;
  /** % GEX shift from flow. `null` when settled baseline is zero. */
  flow_gex_pct_shift?: number | null;
  /** Net DEX from the settled snapshot. */
  settled_net_dex?: number | null;
  /** Net DEX from the live flow-adjusted book. */
  live_net_dex?: number | null;
  /** `live_net_dex - settled_net_dex` (dollars). */
  flow_dex_adjustment?: number | null;
  /** % DEX shift from flow. `null` when settled baseline is zero. */
  flow_dex_pct_shift?: number | null;
  /** Absolute delta-weighted contracts traded today (flow magnitude). */
  total_abs_delta_contracts?: number;
  /** Net classified flow direction. */
  flow_direction?: string;
  /** Plain-English summary of the shift — safe to surface verbatim. */
  description?: string;
}

/**
 * Everything-at-once bundle from `GET /v1/flow/live/{symbol}`.
 * OI simulator state + live exposure + live levels + pin risk + nested
 * dealer-risk block, in one call. Requires the Alpha plan.
 */
export interface FlowLiveResponse {
  /** Underlying ticker echoed from the request path. */
  symbol?: string;
  /** Timestamp this snapshot was computed for (ISO-8601 UTC). */
  as_of?: string;
  /** Spot mid at the snapshot time. */
  underlying_price?: number | null;
  /** Expiration filter echoed back, or `null`. */
  expiry?: string | null;
  /** Total contracts tracked for the underlying. */
  contracts?: number;
  /** Contracts that have printed at least one trade today. */
  contracts_with_flow?: number;
  /** Official exchange OI from the settled snapshot. */
  official_oi?: number;
  /** Intraday simulated OI (official + estimated open/close from tape). */
  simulated_oi?: number;
  /** `simulated_oi - official_oi` (signed). */
  intraday_oi_delta?: number;
  /** Confidence 0–1 in the intraday OI estimate (trade-tape coverage). */
  oi_delta_confidence?: number | null;
  /** OI actually used by the live analytics (blended). */
  effective_oi?: number;
  /** Live net GEX (dollars per 1% spot move). */
  live_gex?: number | null;
  /** Live net DEX (dollars). Named `live_gex_delta` on the wire. */
  live_gex_delta?: number | null;
  /** Live gamma-flip spot. `null` if no sign change. */
  live_gamma_flip?: number | null;
  /** Largest live call-gamma concentration strike (upside magnet). */
  live_call_wall?: number | null;
  /** Largest live put-gamma concentration strike (downside magnet). */
  live_put_wall?: number | null;
  /** Live max-pain strike (most option value expires worthless). */
  live_max_pain?: number | null;
  /** Composite 0–100 pin-risk score (higher = stronger pin pull). */
  live_pin_risk?: number;
  /** Nested settled-vs-live dealer-risk block. */
  flow_adjusted_dealer_risk?: FlowAdjustedDealerRisk;
}

// ── Raw flow data (camelCase wire keys, proxied from the ingest tier) ────────

/** A single option trade print (`trades[]` element). */
export interface FlowOptionTrade {
  /** Trade timestamp (ISO-8601 UTC). */
  ts?: string;
  /** OPRA instrument id of the contract. */
  instrumentId?: number;
  /** Contract expiration (`YYYY-MM-DD`). */
  expiry?: string;
  /** Contract strike price. */
  strike?: number;
  /** `'C'` (call) or `'P'` (put). */
  right?: string;
  /** Trade price. */
  price?: number;
  /** Trade size in contracts. */
  size?: number;
  /** Trade-side classification vs the NBBO at print (`'buy'`/`'sell'`/`'mid'`). */
  side?: string;
  /** True when the print is at/above the block-size threshold. */
  isBlock?: boolean;
  /** NBBO bid at the moment of the trade. */
  bid?: number;
  /** NBBO ask at the moment of the trade. */
  ask?: number;
}

/**
 * Recent option trades from `GET /v1/flow/options/{symbol}/recent`.
 * Newest-first tape across the chain (or one `expiry`). `count` is the
 * number returned (capped by `limit`); `totalAvailable` is the unclamped
 * total. `expiry` is echoed only when the filter is supplied. Requires Alpha.
 */
export interface FlowOptionRecentResponse {
  /** Underlying ticker echoed from the request path. */
  symbol?: string;
  /** Expiration filter echoed back when supplied, else absent. */
  expiry?: string | null;
  /** Number of trades returned (capped by `limit`). */
  count?: number;
  /** Unclamped total trade count available. */
  totalAvailable?: number;
  /** Newest-first list of trade prints. */
  trades?: FlowOptionTrade[];
}

/**
 * Per-underlying option-flow aggregates from
 * `GET /v1/flow/options/{symbol}/summary`. Requires the Alpha plan.
 */
export interface FlowOptionSummaryResponse {
  /** Underlying ticker echoed from the request path. */
  symbol?: string;
  /** Expiration filter echoed back when supplied, else absent. */
  expiry?: string | null;
  /** Distinct contracts that printed at least one trade. */
  contractsWithTrades?: number;
  /** Total number of trade prints. */
  totalTrades?: number;
  /** Buy-classified contract volume. */
  buyVolume?: number;
  /** Sell-classified contract volume. */
  sellVolume?: number;
  /** Volume classified at the mid (uninformed). */
  midVolume?: number;
  /** `buyVolume - sellVolume`. */
  netVolume?: number;
  /** Largest single trade size. */
  biggestSingleTrade?: number;
  /** Timestamp of the most recent print; absent when no trades. */
  lastTradeUtc?: string | null;
}

/** A single large option print (`blocks[]` element). */
export interface FlowOptionBlock {
  /** Trade timestamp (ISO-8601 UTC). */
  ts?: string;
  /** Contract expiration (`YYYY-MM-DD`). */
  expiry?: string;
  /** Contract strike price. */
  strike?: number;
  /** `'C'` (call) or `'P'` (put). */
  right?: string;
  /** Trade price. */
  price?: number;
  /** Trade size in contracts. */
  size?: number;
  /** Trade-side classification (`'buy'`/`'sell'`/`'mid'`). */
  side?: string;
}

/**
 * Large option prints from `GET /v1/flow/options/{symbol}/blocks`.
 * All trades with `size >= minSize`, newest-first. Requires the Alpha plan.
 */
export interface FlowOptionBlocksResponse {
  /** Underlying ticker echoed from the request path. */
  symbol?: string;
  /** Expiration filter echoed back when supplied, else absent. */
  expiry?: string | null;
  /** Minimum trade size that qualified as a block (echoed back). */
  minSize?: number;
  /** Number of blocks returned. */
  count?: number;
  /** Newest-first list of large prints. */
  blocks?: FlowOptionBlock[];
}

/** One per-minute option-flow bucket (`buckets[]` element). */
export interface FlowOptionHistoryBucket {
  /** Bucket start (ISO-8601 UTC, minute-aligned). */
  ts?: string;
  /** Buy-classified volume in the bucket. */
  buyVolume?: number;
  /** Sell-classified volume in the bucket. */
  sellVolume?: number;
  /** Mid-classified volume in the bucket. */
  midVolume?: number;
  /** `buyVolume - sellVolume`. */
  netVolume?: number;
  /** Number of trades in the bucket. */
  tradeCount?: number;
  /** Largest single trade size in the bucket. */
  biggestTrade?: number;
  /** Volume-weighted average trade price across the bucket. */
  vwap?: number;
  /** Highest trade price in the bucket. */
  high?: number;
  /** Lowest trade price in the bucket. */
  low?: number;
}

/**
 * Per-minute option-flow history from
 * `GET /v1/flow/options/{symbol}/history`. Newest-first, capped to the
 * `minutes` window. Requires the Alpha plan.
 */
export interface FlowOptionHistoryResponse {
  /** Underlying ticker echoed from the request path. */
  symbol?: string;
  /** Expiration filter echoed back when supplied, else absent. */
  expiry?: string | null;
  /** Lookback window in minutes (echoed back). */
  minutes?: number;
  /** Number of buckets returned. */
  count?: number;
  /** Newest-first list of per-minute aggregates. */
  buckets?: FlowOptionHistoryBucket[];
}

/**
 * One point of a cumulative net-flow series (`points[]` element).
 * Shared by the option and stock `/cumulative` endpoints.
 */
export interface FlowCumulativePoint {
  /** Bucket start (ISO-8601 UTC, minute-aligned). */
  ts?: string;
  /** Net volume in this minute bucket. */
  netVolume?: number;
  /** Running sum of `netVolume` from the start of the window (HIRO-style line). */
  cumulative?: number;
  /** Volume-weighted average price in the bucket. */
  vwap?: number;
  /** Number of trades in the bucket. */
  tradeCount?: number;
}

/**
 * Cumulative option net-flow series from
 * `GET /v1/flow/options/{symbol}/cumulative`. Requires the Alpha plan.
 */
export interface FlowOptionCumulativeResponse {
  /** Underlying ticker echoed from the request path. */
  symbol?: string;
  /** Expiration filter echoed back when supplied, else absent. */
  expiry?: string | null;
  /** Lookback window in minutes (echoed back). */
  minutes?: number;
  /** Number of points returned. */
  count?: number;
  /** Chronological cumulative net-flow series. */
  points?: FlowCumulativePoint[];
}

/** A single stock trade print (`trades[]` element). */
export interface FlowStockTrade {
  /** Trade timestamp (ISO-8601 UTC). */
  ts?: string;
  /** Trade price. */
  price?: number;
  /** Trade size in shares. */
  size?: number;
  /** Trade-side classification (`'buy'`/`'sell'`/`'mid'`). */
  side?: string;
  /** True when the print is at/above the block-size threshold. */
  isBlock?: boolean;
  /** NBBO bid at the moment of the trade. */
  bid?: number;
  /** NBBO ask at the moment of the trade. */
  ask?: number;
}

/**
 * Recent stock trades from `GET /v1/flow/stocks/{symbol}/recent`.
 * Newest-first stock tape. Requires the Alpha plan.
 */
export interface FlowStockRecentResponse {
  /** Underlying ticker echoed from the request path. */
  symbol?: string;
  /** Number of trades returned (capped by `limit`). */
  count?: number;
  /** Unclamped total trade count available. */
  totalAvailable?: number;
  /** Newest-first list of trade prints. */
  trades?: FlowStockTrade[];
}

/**
 * Per-symbol stock-flow aggregates from
 * `GET /v1/flow/stocks/{symbol}/summary`. Requires the Alpha plan.
 */
export interface FlowStockSummaryResponse {
  /** Underlying ticker echoed from the request path. */
  symbol?: string;
  /** Total number of trade prints. */
  totalTrades?: number;
  /** Buy-classified share volume. */
  buyVolume?: number;
  /** Sell-classified share volume. */
  sellVolume?: number;
  /** Volume classified at the mid (uninformed). */
  midVolume?: number;
  /** `buyVolume - sellVolume`. */
  netVolume?: number;
  /** Largest single trade size. */
  biggestSingleTrade?: number;
  /** Absent when the symbol has no trades. */
  lastTradeUtc?: string | null;
}

/** A single large stock print (`blocks[]` element). */
export interface FlowStockBlock {
  /** Trade timestamp (ISO-8601 UTC). */
  ts?: string;
  /** Trade price. */
  price?: number;
  /** Trade size in shares. */
  size?: number;
  /** Trade-side classification (`'buy'`/`'sell'`/`'mid'`). */
  side?: string;
  /** NBBO bid at the moment of the trade. */
  bid?: number;
  /** NBBO ask at the moment of the trade. */
  ask?: number;
}

/**
 * Large stock prints from `GET /v1/flow/stocks/{symbol}/blocks`.
 * All trades with `size >= minSize`, newest-first. Requires the Alpha plan.
 */
export interface FlowStockBlocksResponse {
  /** Underlying ticker echoed from the request path. */
  symbol?: string;
  /** Minimum trade size that qualified as a block (echoed back). */
  minSize?: number;
  /** Number of blocks returned. */
  count?: number;
  /** Newest-first list of large prints. */
  blocks?: FlowStockBlock[];
}

/**
 * One per-minute stock-flow bucket (`buckets[]` element). Like
 * `FlowOptionHistoryBucket` but also carries OHLC of the print price.
 */
export interface FlowStockHistoryBucket {
  /** Bucket start (ISO-8601 UTC, minute-aligned). */
  ts?: string;
  /** Buy-classified volume in the bucket. */
  buyVolume?: number;
  /** Sell-classified volume in the bucket. */
  sellVolume?: number;
  /** Mid-classified volume in the bucket. */
  midVolume?: number;
  /** `buyVolume - sellVolume`. */
  netVolume?: number;
  /** Number of trades in the bucket. */
  tradeCount?: number;
  /** Largest single trade size in the bucket. */
  biggestTrade?: number;
  /** Volume-weighted average trade price across the bucket. */
  vwap?: number;
  /** First trade price in the bucket. */
  open?: number;
  /** Last trade price in the bucket. */
  close?: number;
  /** Highest trade price in the bucket. */
  high?: number;
  /** Lowest trade price in the bucket. */
  low?: number;
}

/**
 * Per-minute stock-flow history from
 * `GET /v1/flow/stocks/{symbol}/history`. Newest-first, capped to the
 * `minutes` window. Requires the Alpha plan.
 */
export interface FlowStockHistoryResponse {
  /** Underlying ticker echoed from the request path. */
  symbol?: string;
  /** Lookback window in minutes (echoed back). */
  minutes?: number;
  /** Number of buckets returned. */
  count?: number;
  /** Newest-first list of per-minute aggregates. */
  buckets?: FlowStockHistoryBucket[];
}

/**
 * Cumulative stock net-flow series from
 * `GET /v1/flow/stocks/{symbol}/cumulative`. Requires the Alpha plan.
 */
export interface FlowStockCumulativeResponse {
  /** Underlying ticker echoed from the request path. */
  symbol?: string;
  /** Lookback window in minutes (echoed back). */
  minutes?: number;
  /** Number of points returned. */
  count?: number;
  /** Chronological cumulative net-flow series. */
  points?: FlowCumulativePoint[];
}

/**
 * One ranked underlying in the option-flow leaderboard. Option rows
 * carry `avgPremium`; the stock leaderboard uses `vwap` instead.
 */
export interface FlowOptionLeaderRow {
  /** Ranked underlying. */
  symbol?: string;
  /** Net contracts (`buyVolume - sellVolume`). */
  netVolume?: number;
  /** Net dollar option flow (≈ net contracts × avg premium × 100). */
  netNotional?: number;
  /** Buy-classified contract volume. */
  buyVolume?: number;
  /** Sell-classified contract volume. */
  sellVolume?: number;
  /** Volume-weighted average option premium over the window. */
  avgPremium?: number;
  /** Number of trades over the window. */
  tradeCount?: number;
  /** Timestamp of the most recent print (ISO-8601 UTC). */
  lastTradeUtc?: string;
}

/**
 * Cross-symbol option-flow leaderboard from
 * `GET /v1/flow/options/leaderboard`. Top `n` net-dollar buyers and
 * sellers over the window. Cached ~30s. Requires the Alpha plan.
 */
export interface FlowOptionLeaderboardResponse {
  /** When the snapshot was generated (ISO-8601 UTC). */
  generatedUtc?: string;
  /** Number of ranked rows requested per side. */
  n?: number;
  /** Aggregation window in minutes. */
  windowMinutes?: number;
  /** Top net-dollar buyers. */
  buyers?: FlowOptionLeaderRow[];
  /** Top net-dollar sellers. */
  sellers?: FlowOptionLeaderRow[];
}

/** One flagged underlying in an outliers table (option or stock). */
export interface FlowOutlierRow {
  /** Flagged underlying. */
  symbol?: string;
  /** Number of trades over the window. */
  tradeCount?: number;
  /** Buy-classified volume. */
  buyVolume?: number;
  /** Sell-classified volume. */
  sellVolume?: number;
  /** Mid-classified volume. */
  midVolume?: number;
  /** `buyVolume - sellVolume`. */
  netVolume?: number;
  /** `|buy-sell| / (buy+sell)` × 100: 0 = balanced, 100 = one-sided. */
  imbalancePct?: number;
  /** Tiered skew label (`FLAT`/`MILD_BUY`/`BUY`/`STRONG_BUY`/…). */
  skew?: string;
  /** Gross traded notional over the window (dollars). */
  notional?: number;
  /** Net (signed) traded notional over the window (dollars). */
  netNotional?: number;
  /** Largest single trade size. */
  biggestTrade?: number;
  /** Timestamp of the biggest print; `null` if none in window. */
  biggestTradeUtc?: string | null;
  /** Age of the biggest print in seconds; `-1` if none. */
  biggestAgeSec?: number;
  /** VWAP of the most recent activity. */
  lastVwap?: number;
  /** Timestamp of the last print; `null` if none. */
  lastTradeUtc?: string | null;
  /** Age of the last print in seconds; `-1` if none. */
  lastTradeAgeSec?: number;
}

/**
 * Cross-symbol option-flow outliers from
 * `GET /v1/flow/options/outliers`. Cached ~30s. Requires the Alpha plan.
 */
export interface FlowOptionOutliersResponse {
  /** When the snapshot was generated (ISO-8601 UTC). */
  generatedUtc?: string;
  /** Aggregation window in minutes. */
  windowMinutes?: number;
  /** Symbols evaluated. */
  tracked?: number;
  /** Symbols that met `minTrades` and had non-zero volume. */
  qualified?: number;
  /** Max rows requested. */
  limit?: number;
  /** Imbalance-ranked flagged underlyings. */
  outliers?: FlowOutlierRow[];
}

/**
 * One ranked symbol in the stock-flow leaderboard. Stock rows carry
 * `vwap`; the option leaderboard uses `avgPremium` instead.
 */
export interface FlowStockLeaderRow {
  /** Ranked symbol. */
  symbol?: string;
  /** Net shares (`buyVolume - sellVolume`). */
  netVolume?: number;
  /** Net dollar flow (net shares × VWAP). */
  netNotional?: number;
  /** Buy-classified share volume. */
  buyVolume?: number;
  /** Sell-classified share volume. */
  sellVolume?: number;
  /** Volume-weighted average trade price over the window. */
  vwap?: number;
  /** Number of trades over the window. */
  tradeCount?: number;
  /** Timestamp of the most recent print (ISO-8601 UTC). */
  lastTradeUtc?: string;
}

/**
 * Cross-symbol stock-flow leaderboard from
 * `GET /v1/flow/stocks/leaderboard`. Cached ~30s. Requires the Alpha plan.
 */
export interface FlowStockLeaderboardResponse {
  /** When the snapshot was generated (ISO-8601 UTC). */
  generatedUtc?: string;
  /** Number of ranked rows requested per side. */
  n?: number;
  /** Aggregation window in minutes. */
  windowMinutes?: number;
  /** Top net-dollar buyers. */
  buyers?: FlowStockLeaderRow[];
  /** Top net-dollar sellers. */
  sellers?: FlowStockLeaderRow[];
}

/**
 * Cross-symbol stock-flow outliers from
 * `GET /v1/flow/stocks/outliers`. Cached ~30s. Requires the Alpha plan.
 */
export interface FlowStockOutliersResponse {
  /** When the snapshot was generated (ISO-8601 UTC). */
  generatedUtc?: string;
  /** Aggregation window in minutes. */
  windowMinutes?: number;
  /** Symbols evaluated. */
  tracked?: number;
  /** Symbols that met `minTrades` and had non-zero volume. */
  qualified?: number;
  /** Max rows requested. */
  limit?: number;
  /** Imbalance-ranked flagged symbols. */
  outliers?: FlowOutlierRow[];
}
