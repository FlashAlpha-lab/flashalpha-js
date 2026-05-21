/**
 * FlashAlpha API client.
 *
 * Thin HTTP wrapper around the FlashAlpha options analytics REST API.
 * Base URL: https://lab.flashalpha.com
 *
 * Requires Node.js 18+ (uses built-in fetch).
 */

import {
  AuthenticationError,
  FlashAlphaError,
  NotFoundError,
  RateLimitError,
  ServerError,
  TierRestrictedError,
} from './errors';
import type {
  AccountResponse,
  AdvVolatilityResponse,
  ChexResponse,
  DexResponse,
  ExposureLevelsResponse,
  ExposureSummaryResponse,
  FlowDealerRiskResponse,
  FlowDexResponse,
  FlowGexResponse,
  FlowLevelsResponse,
  FlowLiveResponse,
  FlowOiResponse,
  FlowOptionBlocksResponse,
  FlowOptionCumulativeResponse,
  FlowOptionHistoryResponse,
  FlowOptionLeaderboardResponse,
  FlowOptionOutliersResponse,
  FlowOptionRecentResponse,
  FlowOptionSummaryResponse,
  FlowPinRiskResponse,
  FlowSignalsResponse,
  FlowSignalsSummaryResponse,
  FlowStockBlocksResponse,
  FlowStockCumulativeResponse,
  FlowStockHistoryResponse,
  FlowStockLeaderboardResponse,
  FlowStockOutliersResponse,
  FlowStockRecentResponse,
  FlowStockSummaryResponse,
  FlowSummaryResponse,
  GexResponse,
  HealthResponse,
  MaxPainResponse,
  NarrativeResponse,
  OptionQuoteResponse,
  OptionsMetaResponse,
  PricingGreeksResponse,
  PricingIvResponse,
  PricingKellyResponse,
  ScreenerResponse,
  StockQuoteResponse,
  StockSummaryResponse,
  SurfaceResponse,
  SymbolsResponse,
  TickersResponse,
  VexResponse,
  VolatilityResponse,
  VrpResponse,
  ZeroDteResponse,
} from './types';

const BASE_URL = 'https://lab.flashalpha.com';
const DEFAULT_TIMEOUT = 30_000; // milliseconds

/** URL-escape a single path segment (e.g. a ticker) — escapes / ? % etc. */
const _seg = (s: string): string => encodeURIComponent(s);

// Minimal fetch-compatible type subset used internally
type FetchFn = (url: string, init?: RequestInit) => Promise<Response>;

export interface FlashAlphaOptions {
  /** Override the API base URL (useful for testing). */
  baseUrl?: string;
  /** Request timeout in milliseconds. Default: 30000. */
  timeout?: number;
  /**
   * Override the fetch implementation (useful for testing with undici MockAgent).
   * Defaults to the global fetch (Node 18+).
   */
  fetch?: FetchFn;
}

// ── parameter option shapes ────────────────────────────────────────────────

export interface GexOptions {
  expiration?: string;
  minOi?: number;
}

export interface ExpirationOptions {
  expiration?: string;
}

export interface ZeroDteOptions {
  strikeRange?: number;
}

/** Optional expiration-cycle filter for flow analytics endpoints. */
export interface FlowExpiryOptions {
  /** Slice to one expiration cycle (`YYYY-MM-DD`). */
  expiry?: string;
}

/** Options for the raw option `recent` flow endpoint. */
export interface FlowRecentOptions {
  /** Max trades to return (1–500). */
  limit?: number;
  /** Slice to one expiration cycle (`YYYY-MM-DD`). Options only. */
  expiry?: string;
}

/** Options for the raw `blocks` flow endpoints. */
export interface FlowBlocksOptions {
  /** Minimum trade size that qualifies as a block. */
  minSize?: number;
  /** Slice to one expiration cycle (`YYYY-MM-DD`). Options only. */
  expiry?: string;
}

/** Options for the raw `history` / `cumulative` flow endpoints. */
export interface FlowHistoryOptions {
  /** Lookback window in minutes (1–10080). */
  minutes?: number;
  /** Slice to one expiration cycle (`YYYY-MM-DD`). Options only. */
  expiry?: string;
}

/** Options for the cross-symbol leaderboard flow endpoints. */
export interface FlowLeaderboardOptions {
  /** Number of ranked rows per side (1–50). */
  n?: number;
  /** Aggregation window in minutes (1–10080). */
  windowMinutes?: number;
}

/** Options for the cross-symbol outliers flow endpoints. */
export interface FlowOutliersOptions {
  /** Max rows to return (1–200). */
  limit?: number;
  /** Minimum trades a symbol needs to qualify. */
  minTrades?: number;
  /** Aggregation window in minutes (1–10080). */
  windowMinutes?: number;
}

/** Options for the per-symbol `flow/signals` feed. */
export interface FlowSignalsOptions {
  /** Drop signals below this score (0–100). */
  minScore?: number;
  /** Filter to `bullish` / `bearish` / `neutral`. */
  intent?: 'bullish' | 'bearish' | 'neutral';
  /** Filter to `block` / `sweep`. */
  structure?: 'block' | 'sweep';
  /** Look-back window in minutes (1–10080, default 240). */
  windowMinutes?: number;
  /** Max signals returned (1–500, default 50). */
  limit?: number;
  /** Slice the chain to one expiration cycle (`YYYY-MM-DD`). */
  expiry?: string;
}

/** Options for the per-symbol `flow/signals/{symbol}/summary` roll-up. */
export interface FlowSignalsSummaryOptions {
  /** Look-back window in minutes (1–10080, default 240). */
  windowMinutes?: number;
  /** Slice the chain to one expiration cycle (`YYYY-MM-DD`). */
  expiry?: string;
}

export interface OptionQuoteOptions {
  expiry?: string;
  strike?: number;
  type?: string;
}

export interface HistoricalStockQuoteOptions {
  date: string;
  time?: string;
}

export interface HistoricalOptionQuoteOptions {
  date: string;
  time?: string;
  expiry?: string;
  strike?: number;
  type?: string;
}

export interface GreeksOptions {
  spot: number;
  strike: number;
  dte: number;
  sigma: number;
  type?: string;
  r?: number;
  q?: number;
}

export interface IvOptions {
  spot: number;
  strike: number;
  dte: number;
  price: number;
  type?: string;
  r?: number;
  q?: number;
}

export interface KellyOptions {
  spot: number;
  strike: number;
  dte: number;
  sigma: number;
  premium: number;
  mu: number;
  type?: string;
  r?: number;
  q?: number;
}

// ── Screener types ─────────────────────────────────────────────────────────

export type ScreenerOperator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'between'
  | 'in'
  | 'is_null'
  | 'is_not_null';

export interface ScreenerLeafCondition {
  field?: string;
  formula?: string;
  operator: ScreenerOperator;
  value?: number | string | boolean | Array<number | string>;
}

export interface ScreenerGroupCondition {
  op: 'and' | 'or';
  conditions: Array<ScreenerLeafCondition | ScreenerGroupCondition>;
}

export type ScreenerFilter = ScreenerLeafCondition | ScreenerGroupCondition;

export interface ScreenerSortSpec {
  field?: string;
  formula?: string;
  direction: 'asc' | 'desc';
}

export interface ScreenerFormula {
  alias: string;
  expression: string;
}

export interface ScreenerOptions {
  filters?: ScreenerFilter;
  sort?: ScreenerSortSpec[];
  select?: string[];
  formulas?: ScreenerFormula[];
  limit?: number;
  offset?: number;
}

// ── client ─────────────────────────────────────────────────────────────────

export class FlashAlpha {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly fetchImpl: FetchFn;

  /**
   * Create a new FlashAlpha client.
   *
   * @param apiKey  Your FlashAlpha API key from https://flashalpha.com
   * @param options Optional configuration (baseUrl, timeout, fetch).
   */
  constructor(apiKey: string, options: FlashAlphaOptions = {}) {
    if (!apiKey) {
      throw new Error('apiKey is required');
    }
    this.apiKey = apiKey;
    this.baseUrl = (options.baseUrl ?? BASE_URL).replace(/\/+$/, '');
    this.timeout = options.timeout ?? DEFAULT_TIMEOUT;
    this.fetchImpl = options.fetch ?? (globalThis.fetch as FetchFn);
  }

  // ── internal ─────────────────────────────────────────────────────────────

  private buildUrl(path: string, params?: Record<string, string | number | undefined>): string {
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      }
    }
    return url.toString();
  }

  private async _get(path: string, params?: Record<string, string | number | undefined>): Promise<unknown> {
    const url = this.buildUrl(path, params);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    let response: Response;
    try {
      response = await this.fetchImpl(url, {
        method: 'GET',
        headers: {
          'X-Api-Key': this.apiKey,
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }

    return this._handle(response);
  }

  private async _post(path: string, body?: unknown): Promise<unknown> {
    const url = this.buildUrl(path);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    let response: Response;
    try {
      response = await this.fetchImpl(url, {
        method: 'POST',
        headers: {
          'X-Api-Key': this.apiKey,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }

    return this._handle(response);
  }

  private async _handle(response: Response): Promise<unknown> {
    const status = response.status;

    if (status === 200) {
      return response.json();
    }

    // Read body once as text, then try to parse as JSON
    const rawText = await response.text();
    let body: Record<string, unknown>;
    try {
      body = JSON.parse(rawText) as Record<string, unknown>;
    } catch {
      body = { detail: rawText };
    }

    const msg = String(
      body['message'] ?? body['detail'] ?? `HTTP ${status}`,
    );

    if (status === 401) {
      throw new AuthenticationError(msg, 401, body);
    }
    if (status === 403) {
      throw new TierRestrictedError(
        msg,
        403,
        body,
        body['current_plan'] as string | undefined,
        body['required_plan'] as string | undefined,
      );
    }
    if (status === 404) {
      throw new NotFoundError(msg, 404, body);
    }
    if (status === 429) {
      const retryAfterHeader = response.headers.get('Retry-After');
      const retryAfter = retryAfterHeader ? parseInt(retryAfterHeader, 10) || undefined : undefined;
      throw new RateLimitError(msg, 429, body, retryAfter);
    }
    if (status >= 500) {
      throw new ServerError(msg, status, body);
    }

    throw new FlashAlphaError(msg, status, body);
  }

  // ── Market Data ───────────────────────────────────────────────────────────

  /** Live stock quote (bid/ask/mid/last). */
  async stockQuote(ticker: string): Promise<StockQuoteResponse> {
    return this._get(`/stockquote/${_seg(ticker)}`) as Promise<StockQuoteResponse>;
  }

  /**
   * Option quotes with greeks. Requires Growth+.
   *
   * Returns a single `OptionQuoteResponse` when `expiry`, `strike`, and `type`
   * are all specified; otherwise returns an array. Note the camelCase fields
   * (`bidSize`, `askSize`, `lastUpdate`) — preserved from the upstream feed.
   */
  async optionQuote(
    ticker: string,
    options: OptionQuoteOptions = {},
  ): Promise<OptionQuoteResponse | OptionQuoteResponse[]> {
    const params: Record<string, string | number | undefined> = {};
    if (options.expiry) params['expiry'] = options.expiry;
    if (options.strike !== undefined) params['strike'] = options.strike;
    if (options.type) params['type'] = options.type;
    return this._get(
      `/optionquote/${_seg(ticker)}`,
      Object.keys(params).length ? params : undefined,
    ) as Promise<OptionQuoteResponse | OptionQuoteResponse[]>;
  }

  /** Volatility surface grid (public, no auth required). */
  async surface(symbol: string): Promise<SurfaceResponse> {
    return this._get(`/v1/surface/${_seg(symbol)}`) as Promise<SurfaceResponse>;
  }

  /** Comprehensive stock summary (price, vol, exposure, macro). */
  async stockSummary(symbol: string): Promise<StockSummaryResponse> {
    return this._get(`/v1/stock/${_seg(symbol)}/summary`) as Promise<StockSummaryResponse>;
  }

  // ── Historical ────────────────────────────────────────────────────────────

  /** Historical stock quotes (minute-by-minute). */
  async historicalStockQuote(ticker: string, options: HistoricalStockQuoteOptions): Promise<unknown> {
    const params: Record<string, string | number | undefined> = { date: options.date };
    if (options.time) params['time'] = options.time;
    return this._get(`/historical/stockquote/${_seg(ticker)}`, params);
  }

  /** Historical option quotes (minute-by-minute). */
  async historicalOptionQuote(ticker: string, options: HistoricalOptionQuoteOptions): Promise<unknown> {
    const params: Record<string, string | number | undefined> = { date: options.date };
    if (options.time) params['time'] = options.time;
    if (options.expiry) params['expiry'] = options.expiry;
    if (options.strike !== undefined) params['strike'] = options.strike;
    if (options.type) params['type'] = options.type;
    return this._get(`/historical/optionquote/${_seg(ticker)}`, params);
  }

  // ── Exposure Analytics ────────────────────────────────────────────────────

  /** Gamma exposure by strike. */
  async gex(symbol: string, options: GexOptions = {}): Promise<GexResponse> {
    const params: Record<string, string | number | undefined> = {};
    if (options.expiration) params['expiration'] = options.expiration;
    if (options.minOi !== undefined) params['min_oi'] = options.minOi;
    return this._get(
      `/v1/exposure/gex/${_seg(symbol)}`,
      Object.keys(params).length ? params : undefined,
    ) as Promise<GexResponse>;
  }

  /** Delta exposure by strike. */
  async dex(symbol: string, options: ExpirationOptions = {}): Promise<DexResponse> {
    const params: Record<string, string | number | undefined> = {};
    if (options.expiration) params['expiration'] = options.expiration;
    return this._get(
      `/v1/exposure/dex/${_seg(symbol)}`,
      Object.keys(params).length ? params : undefined,
    ) as Promise<DexResponse>;
  }

  /** Vanna exposure by strike. */
  async vex(symbol: string, options: ExpirationOptions = {}): Promise<VexResponse> {
    const params: Record<string, string | number | undefined> = {};
    if (options.expiration) params['expiration'] = options.expiration;
    return this._get(
      `/v1/exposure/vex/${_seg(symbol)}`,
      Object.keys(params).length ? params : undefined,
    ) as Promise<VexResponse>;
  }

  /** Charm exposure by strike. */
  async chex(symbol: string, options: ExpirationOptions = {}): Promise<ChexResponse> {
    const params: Record<string, string | number | undefined> = {};
    if (options.expiration) params['expiration'] = options.expiration;
    return this._get(
      `/v1/exposure/chex/${_seg(symbol)}`,
      Object.keys(params).length ? params : undefined,
    ) as Promise<ChexResponse>;
  }

  /** Full exposure summary (GEX/DEX/VEX/CHEX + hedging). Requires Growth+. */
  async exposureSummary(symbol: string): Promise<ExposureSummaryResponse> {
    return this._get(`/v1/exposure/summary/${_seg(symbol)}`) as Promise<ExposureSummaryResponse>;
  }

  /** Key support/resistance levels from options exposure. */
  async exposureLevels(symbol: string): Promise<ExposureLevelsResponse> {
    return this._get(`/v1/exposure/levels/${_seg(symbol)}`) as Promise<ExposureLevelsResponse>;
  }

  /** Verbal narrative analysis of exposure. Requires Growth+. */
  async narrative(symbol: string): Promise<NarrativeResponse> {
    return this._get(`/v1/exposure/narrative/${_seg(symbol)}`) as Promise<NarrativeResponse>;
  }

  /**
   * Real-time 0DTE analytics: regime, expected move, pin risk, hedging, decay.
   * Requires Growth+.
   *
   * Returns a typed `ZeroDteResponse` — the runtime payload is identical to
   * what the API ships. Existing callers that did `as any` keep working;
   * new callers get autocomplete and type-checking on documented fields.
   */
  async zeroDte(symbol: string, options: ZeroDteOptions = {}): Promise<ZeroDteResponse> {
    const params: Record<string, string | number | undefined> = {};
    if (options.strikeRange !== undefined) params['strike_range'] = options.strikeRange;
    return this._get(`/v1/exposure/zero-dte/${_seg(symbol)}`, Object.keys(params).length ? params : undefined) as Promise<ZeroDteResponse>;
  }

  // ── Flow (live, simulation-aware) — requires the Alpha plan ───────────────
  //
  // Analytics endpoints (snake_case) fold today's intraday trade tape into
  // the settled book. All accept an optional `expiry` ("YYYY-MM-DD") to
  // slice to a single expiration cycle.

  /** Live gamma flip / call & put walls / max pain. Requires Alpha. */
  async flowLevels(symbol: string, options: FlowExpiryOptions = {}): Promise<FlowLevelsResponse> {
    const params: Record<string, string | number | undefined> = {};
    if (options.expiry) params['expiry'] = options.expiry;
    return this._get(`/v1/flow/levels/${_seg(symbol)}`, Object.keys(params).length ? params : undefined) as Promise<FlowLevelsResponse>;
  }

  /** 0DTE pin-risk score + component breakdown. Requires Alpha. */
  async flowPinRisk(symbol: string, options: FlowExpiryOptions = {}): Promise<FlowPinRiskResponse> {
    const params: Record<string, string | number | undefined> = {};
    if (options.expiry) params['expiry'] = options.expiry;
    return this._get(`/v1/flow/pin-risk/${_seg(symbol)}`, Object.keys(params).length ? params : undefined) as Promise<FlowPinRiskResponse>;
  }

  /** At-a-glance flow direction + headline GEX shift. Requires Alpha. */
  async flowSummary(symbol: string, options: FlowExpiryOptions = {}): Promise<FlowSummaryResponse> {
    const params: Record<string, string | number | undefined> = {};
    if (options.expiry) params['expiry'] = options.expiry;
    return this._get(`/v1/flow/summary/${_seg(symbol)}`, Object.keys(params).length ? params : undefined) as Promise<FlowSummaryResponse>;
  }

  /** Open-interest simulator state (official vs intraday). Requires Alpha. */
  async flowOi(symbol: string, options: FlowExpiryOptions = {}): Promise<FlowOiResponse> {
    const params: Record<string, string | number | undefined> = {};
    if (options.expiry) params['expiry'] = options.expiry;
    return this._get(`/v1/flow/oi/${_seg(symbol)}`, Object.keys(params).length ? params : undefined) as Promise<FlowOiResponse>;
  }

  /** Live (flow-adjusted) GEX + per-strike profile. Requires Alpha. */
  async flowGex(symbol: string, options: FlowExpiryOptions = {}): Promise<FlowGexResponse> {
    const params: Record<string, string | number | undefined> = {};
    if (options.expiry) params['expiry'] = options.expiry;
    return this._get(`/v1/flow/gex/${_seg(symbol)}`, Object.keys(params).length ? params : undefined) as Promise<FlowGexResponse>;
  }

  /** Live (flow-adjusted) DEX + per-strike profile. Requires Alpha. */
  async flowDex(symbol: string, options: FlowExpiryOptions = {}): Promise<FlowDexResponse> {
    const params: Record<string, string | number | undefined> = {};
    if (options.expiry) params['expiry'] = options.expiry;
    return this._get(`/v1/flow/dex/${_seg(symbol)}`, Object.keys(params).length ? params : undefined) as Promise<FlowDexResponse>;
  }

  /** Settled-vs-live dealer GEX/DEX + flow adjustment. Requires Alpha. */
  async flowDealerRisk(symbol: string, options: FlowExpiryOptions = {}): Promise<FlowDealerRiskResponse> {
    const params: Record<string, string | number | undefined> = {};
    if (options.expiry) params['expiry'] = options.expiry;
    return this._get(`/v1/flow/dealer-risk/${_seg(symbol)}`, Object.keys(params).length ? params : undefined) as Promise<FlowDealerRiskResponse>;
  }

  /** Everything-at-once live flow bundle (convenience). Requires Alpha. */
  async flowLive(symbol: string, options: FlowExpiryOptions = {}): Promise<FlowLiveResponse> {
    const params: Record<string, string | number | undefined> = {};
    if (options.expiry) params['expiry'] = options.expiry;
    return this._get(`/v1/flow/live/${_seg(symbol)}`, Object.keys(params).length ? params : undefined) as Promise<FlowLiveResponse>;
  }

  // Raw flow data (camelCase) — proxied trade tape.

  /** Recent option trades, newest-first (`limit` 1–500). Requires Alpha. */
  async flowOptionRecent(symbol: string, options: FlowRecentOptions = {}): Promise<FlowOptionRecentResponse> {
    const params: Record<string, string | number | undefined> = {};
    if (options.limit !== undefined) params['limit'] = options.limit;
    if (options.expiry) params['expiry'] = options.expiry;
    return this._get(`/v1/flow/options/${_seg(symbol)}/recent`, Object.keys(params).length ? params : undefined) as Promise<FlowOptionRecentResponse>;
  }

  /** Per-underlying option-flow aggregates. Requires Alpha. */
  async flowOptionSummary(symbol: string, options: FlowExpiryOptions = {}): Promise<FlowOptionSummaryResponse> {
    const params: Record<string, string | number | undefined> = {};
    if (options.expiry) params['expiry'] = options.expiry;
    return this._get(`/v1/flow/options/${_seg(symbol)}/summary`, Object.keys(params).length ? params : undefined) as Promise<FlowOptionSummaryResponse>;
  }

  /** Large option prints (`size >= minSize`). Requires Alpha. */
  async flowOptionBlocks(symbol: string, options: FlowBlocksOptions = {}): Promise<FlowOptionBlocksResponse> {
    const params: Record<string, string | number | undefined> = {};
    if (options.minSize !== undefined) params['minSize'] = options.minSize;
    if (options.expiry) params['expiry'] = options.expiry;
    return this._get(`/v1/flow/options/${_seg(symbol)}/blocks`, Object.keys(params).length ? params : undefined) as Promise<FlowOptionBlocksResponse>;
  }

  /** Per-minute option-flow buckets (`minutes` 1–10080). Requires Alpha. */
  async flowOptionHistory(symbol: string, options: FlowHistoryOptions = {}): Promise<FlowOptionHistoryResponse> {
    const params: Record<string, string | number | undefined> = {};
    if (options.minutes !== undefined) params['minutes'] = options.minutes;
    if (options.expiry) params['expiry'] = options.expiry;
    return this._get(`/v1/flow/options/${_seg(symbol)}/history`, Object.keys(params).length ? params : undefined) as Promise<FlowOptionHistoryResponse>;
  }

  /** Cumulative option net-flow series. Requires Alpha. */
  async flowOptionCumulative(symbol: string, options: FlowHistoryOptions = {}): Promise<FlowOptionCumulativeResponse> {
    const params: Record<string, string | number | undefined> = {};
    if (options.minutes !== undefined) params['minutes'] = options.minutes;
    if (options.expiry) params['expiry'] = options.expiry;
    return this._get(`/v1/flow/options/${_seg(symbol)}/cumulative`, Object.keys(params).length ? params : undefined) as Promise<FlowOptionCumulativeResponse>;
  }

  /** Recent stock trades, newest-first (`limit` 1–500). Requires Alpha. */
  async flowStockRecent(symbol: string, options: { limit?: number } = {}): Promise<FlowStockRecentResponse> {
    const params: Record<string, string | number | undefined> = {};
    if (options.limit !== undefined) params['limit'] = options.limit;
    return this._get(`/v1/flow/stocks/${_seg(symbol)}/recent`, Object.keys(params).length ? params : undefined) as Promise<FlowStockRecentResponse>;
  }

  /** Per-symbol stock-flow aggregates. Requires Alpha. */
  async flowStockSummary(symbol: string): Promise<FlowStockSummaryResponse> {
    return this._get(`/v1/flow/stocks/${_seg(symbol)}/summary`) as Promise<FlowStockSummaryResponse>;
  }

  /** Large stock prints (`size >= minSize`). Requires Alpha. */
  async flowStockBlocks(symbol: string, options: { minSize?: number } = {}): Promise<FlowStockBlocksResponse> {
    const params: Record<string, string | number | undefined> = {};
    if (options.minSize !== undefined) params['minSize'] = options.minSize;
    return this._get(`/v1/flow/stocks/${_seg(symbol)}/blocks`, Object.keys(params).length ? params : undefined) as Promise<FlowStockBlocksResponse>;
  }

  /** Per-minute stock-flow buckets w/ OHLC (`minutes` 1–10080). Requires Alpha. */
  async flowStockHistory(symbol: string, options: { minutes?: number } = {}): Promise<FlowStockHistoryResponse> {
    const params: Record<string, string | number | undefined> = {};
    if (options.minutes !== undefined) params['minutes'] = options.minutes;
    return this._get(`/v1/flow/stocks/${_seg(symbol)}/history`, Object.keys(params).length ? params : undefined) as Promise<FlowStockHistoryResponse>;
  }

  /** Cumulative stock net-flow series. Requires Alpha. */
  async flowStockCumulative(symbol: string, options: { minutes?: number } = {}): Promise<FlowStockCumulativeResponse> {
    const params: Record<string, string | number | undefined> = {};
    if (options.minutes !== undefined) params['minutes'] = options.minutes;
    return this._get(`/v1/flow/stocks/${_seg(symbol)}/cumulative`, Object.keys(params).length ? params : undefined) as Promise<FlowStockCumulativeResponse>;
  }

  /** Cross-symbol option-flow leaderboard (top `n` by net $). Requires Alpha. */
  async flowOptionsLeaderboard(options: FlowLeaderboardOptions = {}): Promise<FlowOptionLeaderboardResponse> {
    const params: Record<string, string | number | undefined> = {};
    if (options.n !== undefined) params['n'] = options.n;
    if (options.windowMinutes !== undefined) params['windowMinutes'] = options.windowMinutes;
    return this._get('/v1/flow/options/leaderboard', Object.keys(params).length ? params : undefined) as Promise<FlowOptionLeaderboardResponse>;
  }

  /** Cross-symbol option-flow outliers (imbalance-ranked). Requires Alpha. */
  async flowOptionsOutliers(options: FlowOutliersOptions = {}): Promise<FlowOptionOutliersResponse> {
    const params: Record<string, string | number | undefined> = {};
    if (options.limit !== undefined) params['limit'] = options.limit;
    if (options.minTrades !== undefined) params['minTrades'] = options.minTrades;
    if (options.windowMinutes !== undefined) params['windowMinutes'] = options.windowMinutes;
    return this._get('/v1/flow/options/outliers', Object.keys(params).length ? params : undefined) as Promise<FlowOptionOutliersResponse>;
  }

  /** Cross-symbol stock-flow leaderboard (top `n` by net $). Requires Alpha. */
  async flowStocksLeaderboard(options: FlowLeaderboardOptions = {}): Promise<FlowStockLeaderboardResponse> {
    const params: Record<string, string | number | undefined> = {};
    if (options.n !== undefined) params['n'] = options.n;
    if (options.windowMinutes !== undefined) params['windowMinutes'] = options.windowMinutes;
    return this._get('/v1/flow/stocks/leaderboard', Object.keys(params).length ? params : undefined) as Promise<FlowStockLeaderboardResponse>;
  }

  /** Cross-symbol stock-flow outliers (imbalance-ranked). Requires Alpha. */
  async flowStocksOutliers(options: FlowOutliersOptions = {}): Promise<FlowStockOutliersResponse> {
    const params: Record<string, string | number | undefined> = {};
    if (options.limit !== undefined) params['limit'] = options.limit;
    if (options.minTrades !== undefined) params['minTrades'] = options.minTrades;
    if (options.windowMinutes !== undefined) params['windowMinutes'] = options.windowMinutes;
    return this._get('/v1/flow/stocks/outliers', Object.keys(params).length ? params : undefined) as Promise<FlowStockOutliersResponse>;
  }

  // Flow signals (unusual-flow feed, Alpha+).

  /**
   * Scored unusual-flow feed for one underlying. Requires Alpha.
   *
   * Each notable print is coalesced into a signal, classified
   * (block/sweep, NBBO aggressor, opening/closing bias, intent), and
   * scored 0–100 with a transparent component breakdown. Ranked
   * highest score first.
   */
  async flowSignals(symbol: string, options: FlowSignalsOptions = {}): Promise<FlowSignalsResponse> {
    const params: Record<string, string | number | undefined> = {};
    if (options.minScore !== undefined) params['minScore'] = options.minScore;
    if (options.intent) params['intent'] = options.intent;
    if (options.structure) params['structure'] = options.structure;
    if (options.windowMinutes !== undefined) params['windowMinutes'] = options.windowMinutes;
    if (options.limit !== undefined) params['limit'] = options.limit;
    if (options.expiry) params['expiry'] = options.expiry;
    return this._get(`/v1/flow/signals/${_seg(symbol)}`, Object.keys(params).length ? params : undefined) as Promise<FlowSignalsResponse>;
  }

  /**
   * Net bullish/bearish + opening/closing premium roll-up plus the top
   * 10 signals. Cheap "smart-money tilt" read. Requires Alpha.
   */
  async flowSignalsSummary(symbol: string, options: FlowSignalsSummaryOptions = {}): Promise<FlowSignalsSummaryResponse> {
    const params: Record<string, string | number | undefined> = {};
    if (options.windowMinutes !== undefined) params['windowMinutes'] = options.windowMinutes;
    if (options.expiry) params['expiry'] = options.expiry;
    return this._get(`/v1/flow/signals/${_seg(symbol)}/summary`, Object.keys(params).length ? params : undefined) as Promise<FlowSignalsSummaryResponse>;
  }

  // ── Pricing & Sizing ──────────────────────────────────────────────────────

  /** Full BSM greeks (first, second, third order). */
  async greeks(options: GreeksOptions): Promise<PricingGreeksResponse> {
    const params: Record<string, string | number | undefined> = {
      spot: options.spot,
      strike: options.strike,
      dte: options.dte,
      sigma: options.sigma,
      type: options.type ?? 'call',
    };
    if (options.r !== undefined) params['r'] = options.r;
    if (options.q !== undefined) params['q'] = options.q;
    return this._get('/v1/pricing/greeks', params) as Promise<PricingGreeksResponse>;
  }

  /** Implied volatility from market price. */
  async iv(options: IvOptions): Promise<PricingIvResponse> {
    const params: Record<string, string | number | undefined> = {
      spot: options.spot,
      strike: options.strike,
      dte: options.dte,
      price: options.price,
      type: options.type ?? 'call',
    };
    if (options.r !== undefined) params['r'] = options.r;
    if (options.q !== undefined) params['q'] = options.q;
    return this._get('/v1/pricing/iv', params) as Promise<PricingIvResponse>;
  }

  /** Kelly criterion optimal position sizing. Requires Growth+. */
  async kelly(options: KellyOptions): Promise<PricingKellyResponse> {
    const params: Record<string, string | number | undefined> = {
      spot: options.spot,
      strike: options.strike,
      dte: options.dte,
      sigma: options.sigma,
      premium: options.premium,
      mu: options.mu,
      type: options.type ?? 'call',
    };
    if (options.r !== undefined) params['r'] = options.r;
    if (options.q !== undefined) params['q'] = options.q;
    return this._get('/v1/pricing/kelly', params) as Promise<PricingKellyResponse>;
  }

  // ── Volatility Analytics ──────────────────────────────────────────────────

  /** Comprehensive volatility analysis. Requires Growth+. */
  async volatility(symbol: string): Promise<VolatilityResponse> {
    return this._get(`/v1/volatility/${_seg(symbol)}`) as Promise<VolatilityResponse>;
  }

  /** Advanced volatility analytics: SVI parameters, variance surface, arbitrage detection. Requires Alpha+. */
  async advVolatility(symbol: string): Promise<AdvVolatilityResponse> {
    return this._get(`/v1/adv_volatility/${_seg(symbol)}`) as Promise<AdvVolatilityResponse>;
  }

  // ── Reference Data ────────────────────────────────────────────────────────

  /** All available stock tickers. */
  async tickers(): Promise<TickersResponse> {
    return this._get('/v1/tickers') as Promise<TickersResponse>;
  }

  /** Option chain metadata (expirations + strikes). */
  async options(ticker: string): Promise<OptionsMetaResponse> {
    return this._get(`/v1/options/${_seg(ticker)}`) as Promise<OptionsMetaResponse>;
  }

  /** Currently queried symbols with live data. */
  async symbols(): Promise<SymbolsResponse> {
    return this._get('/v1/symbols') as Promise<SymbolsResponse>;
  }

  // ── VRP (Variance Risk Premium) ───────────────────────────────────────────

  /**
   * Variance risk premium analytics — the implied-vs-realized vol spread,
   * conditioned on dealer gamma and vanna regime, with strategy scores for
   * harvesting. Requires Alpha+.
   *
   * Returns a nested payload. Key access paths:
   *
   * - `response.symbol`, `response.underlying_price` — top-level
   * - `response.vrp.z_score`, `.percentile`, `.atm_iv`, `.rv_20d`,
   *   `.vrp_20d` — core VRP metrics (NOT top-level)
   * - `response.directional.downside_vrp`, `.upside_vrp` — directional skew
   *   (NOT `put_vrp` / `call_vrp`)
   * - `response.gex_conditioned.harvest_score`, `.regime` — gamma-regime
   *   conditioning (nullable when there isn't enough data)
   * - `response.regime.net_gex`, `.gamma`, `.vrp_regime` — regime snapshot
   * - `response.strategy_scores` — short_put_spread, short_strangle,
   *   iron_condor, calendar_spread (each 0–100, nullable)
   * - `response.net_harvest_score`, `response.dealer_flow_risk` — top-level
   *   composite scores
   *
   * @example
   * const r = await fa.vrp('SPY');
   * console.log(r.vrp.z_score, r.directional.downside_vrp);
   */
  async vrp(symbol: string): Promise<VrpResponse> {
    return this._get(`/v1/vrp/${_seg(symbol)}`) as Promise<VrpResponse>;
  }

  // ── Account & System ──────────────────────────────────────────────────────

  /** Max pain analysis with dealer alignment, pain curve, OI breakdown,
   * expected move, pin probability, multi-expiry calendar. Growth+. */
  async maxPain(symbol: string, options: ExpirationOptions = {}): Promise<MaxPainResponse> {
    return this._get(`/v1/maxpain/${_seg(symbol)}`, options.expiration !== undefined
      ? { expiration: options.expiration } : undefined) as Promise<MaxPainResponse>;
  }

  /**
   * Live options screener — filter and rank symbols by gamma exposure, VRP,
   * volatility, greeks, and more. Powered by an in-memory store updated every
   * 5-10s from live market data.
   *
   * Growth: 10-symbol universe, up to 10 rows. Alpha: ~250 symbols, up to 50
   * rows, formulas, and harvest/dealer-flow-risk scores.
   *
   * @example
   * // Harvestable VRP screen
   * fa.screener({
   *   filters: {
   *     op: 'and',
   *     conditions: [
   *       { field: 'regime', operator: 'eq', value: 'positive_gamma' },
   *       { field: 'harvest_score', operator: 'gte', value: 65 },
   *     ],
   *   },
   *   sort: [{ field: 'harvest_score', direction: 'desc' }],
   *   select: ['symbol', 'price', 'harvest_score', 'dealer_flow_risk'],
   * });
   */
  async screener(options: ScreenerOptions = {}): Promise<ScreenerResponse> {
    return this._post('/v1/screener', options) as Promise<ScreenerResponse>;
  }

  /** Account info and quota. */
  async account(): Promise<AccountResponse> {
    return this._get('/v1/account') as Promise<AccountResponse>;
  }

  /** Health check (public, no auth required). */
  async health(): Promise<HealthResponse> {
    return this._get('/health') as Promise<HealthResponse>;
  }
}
