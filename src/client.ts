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

const BASE_URL = 'https://lab.flashalpha.com';
const DEFAULT_TIMEOUT = 30_000; // milliseconds

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

export interface ExposureHistoryOptions {
  days?: number;
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
  async stockQuote(ticker: string): Promise<unknown> {
    return this._get(`/stockquote/${ticker}`);
  }

  /** Option quotes with greeks. Requires Growth+. */
  async optionQuote(ticker: string, options: OptionQuoteOptions = {}): Promise<unknown> {
    const params: Record<string, string | number | undefined> = {};
    if (options.expiry) params['expiry'] = options.expiry;
    if (options.strike !== undefined) params['strike'] = options.strike;
    if (options.type) params['type'] = options.type;
    return this._get(`/optionquote/${ticker}`, Object.keys(params).length ? params : undefined);
  }

  /** Volatility surface grid (public, no auth required). */
  async surface(symbol: string): Promise<unknown> {
    return this._get(`/v1/surface/${symbol}`);
  }

  /** Comprehensive stock summary (price, vol, exposure, macro). */
  async stockSummary(symbol: string): Promise<unknown> {
    return this._get(`/v1/stock/${symbol}/summary`);
  }

  // ── Historical ────────────────────────────────────────────────────────────

  /** Historical stock quotes (minute-by-minute). */
  async historicalStockQuote(ticker: string, options: HistoricalStockQuoteOptions): Promise<unknown> {
    const params: Record<string, string | number | undefined> = { date: options.date };
    if (options.time) params['time'] = options.time;
    return this._get(`/historical/stockquote/${ticker}`, params);
  }

  /** Historical option quotes (minute-by-minute). */
  async historicalOptionQuote(ticker: string, options: HistoricalOptionQuoteOptions): Promise<unknown> {
    const params: Record<string, string | number | undefined> = { date: options.date };
    if (options.time) params['time'] = options.time;
    if (options.expiry) params['expiry'] = options.expiry;
    if (options.strike !== undefined) params['strike'] = options.strike;
    if (options.type) params['type'] = options.type;
    return this._get(`/historical/optionquote/${ticker}`, params);
  }

  // ── Exposure Analytics ────────────────────────────────────────────────────

  /** Gamma exposure by strike. */
  async gex(symbol: string, options: GexOptions = {}): Promise<unknown> {
    const params: Record<string, string | number | undefined> = {};
    if (options.expiration) params['expiration'] = options.expiration;
    if (options.minOi !== undefined) params['min_oi'] = options.minOi;
    return this._get(`/v1/exposure/gex/${symbol}`, Object.keys(params).length ? params : undefined);
  }

  /** Delta exposure by strike. */
  async dex(symbol: string, options: ExpirationOptions = {}): Promise<unknown> {
    const params: Record<string, string | number | undefined> = {};
    if (options.expiration) params['expiration'] = options.expiration;
    return this._get(`/v1/exposure/dex/${symbol}`, Object.keys(params).length ? params : undefined);
  }

  /** Vanna exposure by strike. */
  async vex(symbol: string, options: ExpirationOptions = {}): Promise<unknown> {
    const params: Record<string, string | number | undefined> = {};
    if (options.expiration) params['expiration'] = options.expiration;
    return this._get(`/v1/exposure/vex/${symbol}`, Object.keys(params).length ? params : undefined);
  }

  /** Charm exposure by strike. */
  async chex(symbol: string, options: ExpirationOptions = {}): Promise<unknown> {
    const params: Record<string, string | number | undefined> = {};
    if (options.expiration) params['expiration'] = options.expiration;
    return this._get(`/v1/exposure/chex/${symbol}`, Object.keys(params).length ? params : undefined);
  }

  /** Full exposure summary (GEX/DEX/VEX/CHEX + hedging). Requires Growth+. */
  async exposureSummary(symbol: string): Promise<unknown> {
    return this._get(`/v1/exposure/summary/${symbol}`);
  }

  /** Key support/resistance levels from options exposure. */
  async exposureLevels(symbol: string): Promise<unknown> {
    return this._get(`/v1/exposure/levels/${symbol}`);
  }

  /** Verbal narrative analysis of exposure. Requires Growth+. */
  async narrative(symbol: string): Promise<unknown> {
    return this._get(`/v1/exposure/narrative/${symbol}`);
  }

  /** Real-time 0DTE analytics: regime, expected move, pin risk, hedging, decay. Requires Growth+. */
  async zeroDte(symbol: string, options: ZeroDteOptions = {}): Promise<unknown> {
    const params: Record<string, string | number | undefined> = {};
    if (options.strikeRange !== undefined) params['strike_range'] = options.strikeRange;
    return this._get(`/v1/exposure/zero-dte/${symbol}`, Object.keys(params).length ? params : undefined);
  }

  /** Daily exposure snapshots for trend analysis. Requires Growth+. */
  async exposureHistory(symbol: string, options: ExposureHistoryOptions = {}): Promise<unknown> {
    const params: Record<string, string | number | undefined> = {};
    if (options.days !== undefined) params['days'] = options.days;
    return this._get(`/v1/exposure/history/${symbol}`, Object.keys(params).length ? params : undefined);
  }

  // ── Pricing & Sizing ──────────────────────────────────────────────────────

  /** Full BSM greeks (first, second, third order). */
  async greeks(options: GreeksOptions): Promise<unknown> {
    const params: Record<string, string | number | undefined> = {
      spot: options.spot,
      strike: options.strike,
      dte: options.dte,
      sigma: options.sigma,
      type: options.type ?? 'call',
    };
    if (options.r !== undefined) params['r'] = options.r;
    if (options.q !== undefined) params['q'] = options.q;
    return this._get('/v1/pricing/greeks', params);
  }

  /** Implied volatility from market price. */
  async iv(options: IvOptions): Promise<unknown> {
    const params: Record<string, string | number | undefined> = {
      spot: options.spot,
      strike: options.strike,
      dte: options.dte,
      price: options.price,
      type: options.type ?? 'call',
    };
    if (options.r !== undefined) params['r'] = options.r;
    if (options.q !== undefined) params['q'] = options.q;
    return this._get('/v1/pricing/iv', params);
  }

  /** Kelly criterion optimal position sizing. Requires Growth+. */
  async kelly(options: KellyOptions): Promise<unknown> {
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
    return this._get('/v1/pricing/kelly', params);
  }

  // ── Volatility Analytics ──────────────────────────────────────────────────

  /** Comprehensive volatility analysis. Requires Growth+. */
  async volatility(symbol: string): Promise<unknown> {
    return this._get(`/v1/volatility/${symbol}`);
  }

  /** Advanced volatility analytics: SVI parameters, variance surface, arbitrage detection. Requires Alpha+. */
  async advVolatility(symbol: string): Promise<unknown> {
    return this._get(`/v1/adv_volatility/${symbol}`);
  }

  // ── Reference Data ────────────────────────────────────────────────────────

  /** All available stock tickers. */
  async tickers(): Promise<unknown> {
    return this._get('/v1/tickers');
  }

  /** Option chain metadata (expirations + strikes). */
  async options(ticker: string): Promise<unknown> {
    return this._get(`/v1/options/${ticker}`);
  }

  /** Currently queried symbols with live data. */
  async symbols(): Promise<unknown> {
    return this._get('/v1/symbols');
  }

  // ── Account & System ──────────────────────────────────────────────────────

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
  async screener(options: ScreenerOptions = {}): Promise<unknown> {
    return this._post('/v1/screener', options);
  }

  /** Account info and quota. */
  async account(): Promise<unknown> {
    return this._get('/v1/account');
  }

  /** Health check (public, no auth required). */
  async health(): Promise<unknown> {
    return this._get('/health');
  }
}
