# flashalpha

Official JavaScript/TypeScript SDK for the [FlashAlpha](https://flashalpha.com) options analytics API.

Get a **live options screener** (filter/rank symbols by GEX, VRP, IV, greeks, harvest scores, and custom formulas), gamma exposure (GEX), delta exposure (DEX), vanna exposure (VEX), charm exposure (CHEX), implied volatility, volatility surface, 0DTE analytics, BSM greeks, Kelly criterion position sizing, and more — all from a single npm package.

> 🔑 **[Get a free API key at flashalpha.com →](https://flashalpha.com)** · 📚 [API documentation](https://flashalpha.com/docs) · 💹 [FlashAlpha options analytics API](https://flashalpha.com)

Requires Node.js 18+ (uses the built-in `fetch` API — zero dependencies).

## Installation

```bash
npm install flashalpha
```

## Quick Start

```typescript
import { FlashAlpha } from 'flashalpha';

const fa = new FlashAlpha('your-api-key');

// Gamma exposure for SPY
const gex = await fa.gex('SPY');
console.log(gex);

// Filter by expiration and minimum open interest
const gexFiltered = await fa.gex('SPY', { expiration: '2024-12-20', minOi: 100 });

// BSM greeks
const greeks = await fa.greeks({ spot: 500, strike: 500, dte: 30, sigma: 0.20 });
console.log(greeks);

// Implied volatility from a market price
const iv = await fa.iv({ spot: 500, strike: 500, dte: 30, price: 10.5 });
console.log(iv);

// Live stock quote
const quote = await fa.stockQuote('SPY');
console.log(quote);

// Live options screener — harvestable VRP setups
const result = await fa.screener({
  filters: {
    op: 'and',
    conditions: [
      { field: 'regime', operator: 'eq', value: 'positive_gamma' },
      { field: 'vrp_regime', operator: 'eq', value: 'harvestable' },
      { field: 'harvest_score', operator: 'gte', value: 65 },
    ],
  },
  sort: [{ field: 'harvest_score', direction: 'desc' }],
  select: ['symbol', 'price', 'harvest_score', 'dealer_flow_risk'],
});
```

Get your API key at [flashalpha.com](https://flashalpha.com).

## All Methods

### Market Data

| Method | Description |
|--------|-------------|
| `stockQuote(ticker)` | Live stock quote (bid/ask/mid/last) |
| `optionQuote(ticker, opts?)` | Option quotes with greeks. Requires Growth+ |
| `surface(symbol)` | Volatility surface grid (public) |
| `surfaceSvi(symbol)` | Live SVI-fitted volatility surface parameters per expiry. Requires Alpha+ |
| `expectedMove(symbol, opts?)` | Straddle-implied expected move per expiry. Requires Basic+ |
| `stockSummary(symbol)` | Comprehensive stock summary (price, vol, exposure, macro) |

### Historical Data

| Method | Description |
|--------|-------------|
| `historicalStockQuote(ticker, { date, time? })` | Historical stock quotes (minute-by-minute) |
| `historicalOptionQuote(ticker, { date, time?, expiry?, strike?, type? })` | Historical option quotes |

### Exposure Analytics

| Method | Description |
|--------|-------------|
| `gex(symbol, opts?)` | Gamma exposure by strike |
| `dex(symbol, opts?)` | Delta exposure by strike |
| `vex(symbol, opts?)` | Vanna exposure by strike |
| `chex(symbol, opts?)` | Charm exposure by strike |
| `exposureSummary(symbol)` | Full exposure summary (GEX/DEX/VEX/CHEX + hedging). Requires Growth+ |
| `exposureLevels(symbol)` | Key support/resistance levels from options exposure |
| `exposureSheet(symbol, opts?)` | Unified per-strike exposure sheet (GEX/DEX/VEX/CHEX + DAG + OI). Requires Growth+ |
| `exposureTermStructure(symbol)` | Per-greek exposure by DTE bucket and expiry. Requires Growth+ |
| `exposureBasket({ symbols, weights? })` | Weighted cross-symbol exposure aggregate (basket GEX/DEX/VEX/CHEX). Requires Growth+ |
| `exposureOiDiff(symbol, opts?)` | Day-over-day open-interest deltas (top-N changed strikes). Requires Growth+ |
| `narrative(symbol)` | Verbal narrative analysis of exposure. Requires Growth+ |
| `zeroDte(symbol, opts?)` | Real-time 0DTE analytics (`{ strikeRange?, expiry? }`). Requires Growth+ |

### Flow (live, simulation-aware) — Growth+ (raw tape, unusual-flow signals, OI simulator state & the full live bundle are Alpha)

| Method | Description |
|--------|-------------|
| `flowLevels(symbol, opts?)` | Live gamma flip / call & put walls / max pain |
| `flowPinRisk(symbol, opts?)` | 0DTE pin-risk score + component breakdown |
| `flowSummary(symbol, opts?)` | At-a-glance flow direction + headline GEX shift |
| `flowOi(symbol, opts?)` | Open-interest simulator state (official vs intraday) |
| `flowGex(symbol, opts?)` | Live (flow-adjusted) GEX + per-strike profile |
| `flowDex(symbol, opts?)` | Live (flow-adjusted) DEX + per-strike profile |
| `flowDealerRisk(symbol, opts?)` | Settled-vs-live dealer GEX/DEX + flow adjustment |
| `flowLive(symbol, opts?)` | Everything-at-once live flow bundle |
| `flowSignals(symbol, opts?)` | Scored, classified unusual-flow feed (block/sweep, intent, 0-100 score) |
| `flowSignalsSummary(symbol, opts?)` | Net bullish/bearish + opening/closing premium roll-up + top 10 signals |
| `flowOptionRecent(symbol, opts?)` | Recent option trades, newest-first |
| `flowOptionSummary(symbol, opts?)` | Per-underlying option-flow aggregates |
| `flowOptionBlocks(symbol, opts?)` | Large option prints (`size >= minSize`) |
| `flowOptionHistory(symbol, opts?)` | Per-minute option-flow buckets |
| `flowOptionCumulative(symbol, opts?)` | Cumulative option net-flow series |
| `flowStockRecent(symbol, opts?)` | Recent stock trades, newest-first |
| `flowStockSummary(symbol)` | Per-symbol stock-flow aggregates |
| `flowStockBlocks(symbol, opts?)` | Large stock prints (`size >= minSize`) |
| `flowStockHistory(symbol, opts?)` | Per-minute stock-flow buckets w/ OHLC |
| `flowStockCumulative(symbol, opts?)` | Cumulative stock net-flow series |
| `flowOptionsLeaderboard(opts?)` | Cross-symbol option-flow leaderboard |
| `flowOptionsOutliers(opts?)` | Cross-symbol option-flow outliers |
| `flowStocksLeaderboard(opts?)` | Cross-symbol stock-flow leaderboard |
| `flowStocksOutliers(opts?)` | Cross-symbol stock-flow outliers |
| `flowDealerPremium(symbol, opts?)` | Full-tape Net Dealer Premium (dealer buy vs write) |
| `flowStockBars(symbol, { resolution, minutes? })` | Multi-resolution OHLCV+flow bars (1s/1m/5m/15m/30m/1h/4h) |

### Zero-DTE Flow

| Method | Description |
|--------|-------------|
| `flowZeroDteSnapshot(symbol, opts?)` | Live 0DTE snapshot (flow-adjusted) + flow-direction read (`opts.expiry`). Requires Growth+ |
| `flowZeroDteSeries(symbol, opts?)` | Intraday 0DTE flow series (levels, regime, hedge flow over time). Requires Growth+ |
| `flowZeroDteHedgeFlow(symbol, opts?)` | Dealer hedge-flow series for the 0DTE expiry. Requires Growth+ |
| `flowZeroDteHeatmap(symbol, opts?)` | Strike × time 0DTE heatmap (gex/dex/vex/chex/oi/signed_flow). Requires Alpha+ |
| `flowZeroDteStrikeFlow(symbol, opts?)` | Per-strike signed 0DTE flow (delta/gamma dollars, contracts). Requires Alpha+ |
| `flowZeroDteLeaderboard(opts?)` | Cross-symbol 0DTE leaderboard ranked by metric (heat/pin_risk/abs_flow/charm_intensity). Requires Alpha+ |

### Strategy Signals

Each GETs `/v1/strategies/{kind}/{symbol}` and returns a shared
`StrategyDecisionResponse` (action, conviction, best matching multi-leg
structure with legs, risk flags, data quality).

| Method | Description |
|--------|-------------|
| `strategyFlowAnomaly(symbol, opts?)` | Directional options-flow imbalance + matching short vertical. Requires Growth+ |
| `strategyExpiryPositioning(symbol, opts?)` | OPEX pin-risk / expiry-positioning (iron fly when pin likely). Requires Basic+ |
| `strategyZeroDte(symbol, opts?)` | Same-day 0DTE range-compression signal. Requires Growth+ |
| `strategyDealerRegime(symbol, opts?)` | Dealer gamma-regime (long/short gamma positioning). Requires Growth+ |
| `strategyVolCarry(symbol, opts?)` | Vol-carry / VRP-harvest (short vol structures). Requires Alpha+ |
| `strategyYieldEnhancement(symbol, opts?)` | Covered call / cash-secured put yield enhancement. Requires Growth+ |
| `strategySurfaceAnomaly(symbol, opts?)` | Vol-surface anomaly (mispriced wings / kinks). Requires Alpha+ |
| `strategySkew(symbol, opts?)` | Skew read (25d / 10d). Requires Growth+ |
| `strategyTermStructure(symbol)` | Term-structure (contango / backwardation) read. Requires Growth+ |
| `strategyTailPricing(symbol, opts?)` | Tail-pricing (wing richness / convexity). Requires Growth+ |

### Earnings

| Method | Description |
|--------|-------------|
| `earningsCalendar(opts?)` | Upcoming earnings calendar with implied moves. Requires Growth+ |
| `earningsExpectedMove(symbol)` | Earnings-implied expected-move decomposition. Requires Growth+ |
| `earningsHistory(symbol, opts?)` | Past earnings events (implied vs actual move, IV crush). Requires Growth+ |
| `earningsIvCrush(symbol)` | Expected + historical IV crush around earnings. Requires Growth+ |
| `earningsVrp(symbol)` | Earnings variance-risk-premium (implied vs realized move). Requires Alpha+ |
| `earningsDealerPositioning(symbol)` | Dealer positioning into earnings (levels, GEX by bucket). Requires Alpha+ |
| `earningsStrategies(symbol)` | Strategy-suitability scores (straddle/strangle/condor). Requires Alpha+ |
| `earningsScreener(opts?)` | Cross-sectional earnings screener (rank by VRP, crush, move). Requires Alpha+ |

### Structures (POST, pure-math)

| Method | Description |
|--------|-------------|
| `structurePnl({ legs, ... })` | At-expiry P&L curve, breakevens, max profit/loss for a multi-leg structure. Requires Basic+ |
| `structureGreeks({ legs, spot, ... })` | Aggregate position Greeks for a multi-leg structure (BSM). Requires Basic+ |

### Pricing and Sizing

| Method | Description |
|--------|-------------|
| `greeks(opts)` | Full BSM greeks (delta, gamma, theta, vega, vanna, charm, ...) |
| `iv(opts)` | Implied volatility from a market price |
| `kelly(opts)` | Kelly criterion optimal position sizing. Requires Growth+ |

### Volatility Analytics

| Method | Description |
|--------|-------------|
| `volatility(symbol)` | Comprehensive volatility analysis. Requires Growth+ |
| `advVolatility(symbol)` | Advanced analytics: SVI, variance surface, arbitrage detection. Requires Alpha+ |
| `liquidity(symbol)` | Per-expiry execution/liquidity scores. Requires Growth+ |
| `skewTerm(symbol)` | Skew term structure with vol-desk conventions (risk reversal, butterfly). Requires Growth+ |
| `spotVolCorrelation(symbol)` | Rolling spot/vol correlation (20d & 60d). Requires Growth+ |
| `dispersion({ index, symbols, ... })` | Implied vs realized correlation / dispersion for an index basket. Requires Alpha+ |
| `realizedVolatility(symbol)` | Range-based realized vol estimators (close-to-close, Parkinson, Garman-Klass, Rogers-Satchell, Yang-Zhang) over 10/20/30-day windows. Requires Alpha+ |
| `volatilityForecast(symbol, opts?)` | Conditional vol forecasts (EWMA, HAR-RV, GARCH(1,1) MLE). Requires Alpha+ |

### VRP (Variance Risk Premium)

| Method | Description |
|--------|-------------|
| `vrp(symbol, opts?)` | VRP dashboard — IV-vs-RV spread, directional skew, term structure, GEX-conditioning, harvest score. Pass `{ date }` for a historical snapshot. Requires Alpha+ |
| `vrpHistory(symbol, opts?)` | Daily VRP time series (ATM IV vs realized, straddle, expected move). Requires Alpha+ |

### Macro / Universe

| Method | Description |
|--------|-------------|
| `vixState()` | VIX overvixing / undervixing regime (VIX vs SPX realized vol). Requires Growth+ |
| `universe(opts?)` | Curated symbol directory (the queryable universe). Public |

### Reference Data

| Method | Description |
|--------|-------------|
| `tickers()` | All available stock tickers |
| `options(ticker)` | Option chain metadata (expirations and strikes) |
| `symbols()` | Currently queried symbols with live data |

### Max Pain

| Method | Description |
|--------|-------------|
| `maxPain(symbol, options?)` | Max pain analysis with dealer alignment, pain curve, OI breakdown, pin probability, multi-expiry calendar (Basic+) |

### Screener

| Method | Description |
|--------|-------------|
| `screener(options)` | **Live options screener** — filter/rank by GEX, VRP, IV, greeks, harvest scores, custom formulas (Growth+) |

### Account and System

| Method | Description |
|--------|-------------|
| `screenerFields()` | List the queryable screener fields and their types (any authenticated tier) |
| `account()` | Account info and quota |
| `health()` | Health check (public) |

## Futures (CME equity-index)

FlashAlpha serves the full options-analytics stack for **CME equity-index futures** — **`ES=F`** (E-mini S&P 500) and **`NQ=F`** (E-mini Nasdaq-100). Options-on-futures are priced with **Black-76** (forward-priced) using the correct CME contract multipliers. Everything that works for an equity works for futures: gamma exposure (GEX), DEX, VEX, CHEX, key levels, max pain, the IV surface, exposure summary, narrative, and live flow.

```typescript
// Gamma exposure for the E-mini S&P 500 future
const gex = await fa.gex('ES=F');
console.log(gex);
```

Use the `=F` suffix — bare `ES`/`NQ` are equities, not futures. In raw REST paths URL-encode the `=` as `%3D` (e.g. `GET /v1/exposure/gex/ES%3DF`); SDK methods take the plain string `"ES=F"`. Historical replay for futures is coming; live analytics are available now.

## Method Options

### gex / dex / vex / chex

```typescript
await fa.gex('SPY', {
  expiration: '2024-12-20', // filter by expiration date (YYYY-MM-DD)
  minOi: 100,               // minimum open interest filter (gex only)
});
```

### zeroDte

```typescript
await fa.zeroDte('SPY', {
  strikeRange: 10, // number of strikes around ATM to include
});
```

### greeks

```typescript
await fa.greeks({
  spot: 500,       // underlying price
  strike: 500,     // option strike price
  dte: 30,         // days to expiration
  sigma: 0.20,     // implied volatility (annualized, e.g. 0.20 = 20%)
  type: 'call',    // 'call' or 'put' (default: 'call')
  r: 0.05,         // risk-free rate (optional)
  q: 0.01,         // dividend yield (optional)
});
```

### iv

```typescript
await fa.iv({
  spot: 500,
  strike: 500,
  dte: 30,
  price: 10.5,   // market price of the option
  type: 'call',
  r: 0.05,       // optional
  q: 0.01,       // optional
});
```

### kelly

```typescript
await fa.kelly({
  spot: 500,
  strike: 500,
  dte: 30,
  sigma: 0.20,
  premium: 5.0,  // option premium paid
  mu: 0.10,      // expected drift of the underlying (annualized)
  type: 'call',
  r: 0.05,
  q: 0.01,
});
```

## Error Handling

All SDK methods throw typed errors. Catch them individually or catch the base `FlashAlphaError`.

```typescript
import {
  FlashAlpha,
  AuthenticationError,
  TierRestrictedError,
  NotFoundError,
  RateLimitError,
  ServerError,
  FlashAlphaError,
} from 'flashalpha';

const fa = new FlashAlpha('your-api-key');

try {
  const data = await fa.gex('SPY');
} catch (err) {
  if (err instanceof AuthenticationError) {
    console.error('Invalid API key — check your credentials.');
  } else if (err instanceof TierRestrictedError) {
    console.error(`Upgrade required. Current: ${err.currentPlan}, Need: ${err.requiredPlan}`);
  } else if (err instanceof NotFoundError) {
    console.error('Symbol not found or no data available.');
  } else if (err instanceof RateLimitError) {
    const wait = err.retryAfter ?? 60;
    console.error(`Rate limited. Retry after ${wait}s.`);
  } else if (err instanceof ServerError) {
    console.error(`Server error (${err.statusCode}): ${err.message}`);
  } else if (err instanceof FlashAlphaError) {
    console.error(`API error (${err.statusCode}): ${err.message}`);
  } else {
    throw err; // unexpected — rethrow
  }
}
```

## Configuration

```typescript
const fa = new FlashAlpha('your-api-key', {
  baseUrl: 'https://lab.flashalpha.com', // default; override for testing
  timeout: 30000,                        // milliseconds (default: 30000)
});
```

## TypeScript

The SDK is written in TypeScript and ships with full type declarations.

```typescript
import type {
  GexOptions,
  GreeksOptions,
  IvOptions,
  KellyOptions,
  ZeroDteOptions,
  VrpOptions,
  StrategyDecisionResponse,
  EarningsCalendarResponse,
  StructurePnlRequest,
  DispersionOptions,
} from 'flashalpha';
```

## Other SDKs

| Language | Package | Repository |
|----------|---------|------------|
| Python | `pip install flashalpha` | [flashalpha-python](https://github.com/FlashAlpha-lab/flashalpha-python) |
| .NET | `dotnet add package FlashAlpha` | [flashalpha-dotnet](https://github.com/FlashAlpha-lab/flashalpha-dotnet) |
| Java | Maven Central | [flashalpha-java](https://github.com/FlashAlpha-lab/flashalpha-java) |
| Go | `go get github.com/FlashAlpha-lab/flashalpha-go` | [flashalpha-go](https://github.com/FlashAlpha-lab/flashalpha-go) |
| MCP | Claude / LLM tool server | [flashalpha-mcp](https://github.com/FlashAlpha-lab/flashalpha-mcp) |

## Links

- [FlashAlpha](https://flashalpha.com) — API keys, docs, pricing
- [API Documentation](https://flashalpha.com/docs)
- [Examples](https://github.com/FlashAlpha-lab/flashalpha-examples) — runnable tutorials
- [GEX Explained](https://github.com/FlashAlpha-lab/gex-explained) — gamma exposure theory and code
- [0DTE Options Analytics](https://github.com/FlashAlpha-lab/0dte-options-analytics) — 0DTE pin risk, expected move, dealer hedging
- [Volatility Surface Python](https://github.com/FlashAlpha-lab/volatility-surface-python) — SVI calibration, variance swap, skew analysis
- [Awesome Options Analytics](https://github.com/FlashAlpha-lab/awesome-options-analytics) — curated resource list

## License

MIT. See [LICENSE](LICENSE).

## What the paid tiers unlock

The free tier covers single-expiry GEX on equities, key levels, the BSM Greeks/IV
calculator and stock quotes. Paid tiers add:

- **DEX, VEX (vanna) and CHEX (charm) exposure, plus max pain** — from the **Basic tier**
  ($79/mo), with ETF and index symbols.
- **Full-chain GEX, 0DTE and flow analytics** — from the **Growth tier** ($299/mo).
- **Point-in-time replay since 2018, SVI vol surfaces, VRP analytics, higher-order Greeks**,
  uncached and unlimited — the **Alpha tier** ($1,499/mo). FlashAlpha is one of the only
  public APIs publishing aggregate vanna and charm exposure across the full universe, with
  no look-ahead and no training-serving skew.

Built for quants, prop desks, and vol funds. See the full picture and get a key:
**[flashalpha.com/for-quant-teams](https://flashalpha.com/for-quant-teams?utm_source=github&utm_medium=readme&utm_campaign=repo-flashalpha-js)**
