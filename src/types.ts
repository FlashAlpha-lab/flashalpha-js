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
