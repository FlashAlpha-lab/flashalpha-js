# flashalpha

Official JavaScript/TypeScript SDK for the [FlashAlpha](https://flashalpha.com) options analytics API.

Get a **live options screener** (filter/rank symbols by GEX, VRP, IV, greeks, harvest scores, and custom formulas), gamma exposure (GEX), delta exposure (DEX), vanna exposure (VEX), charm exposure (CHEX), implied volatility, volatility surface, 0DTE analytics, BSM greeks, Kelly criterion position sizing, and more — all from a single npm package.

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
| `narrative(symbol)` | Verbal narrative analysis of exposure. Requires Growth+ |
| `zeroDte(symbol, opts?)` | Real-time 0DTE analytics. Requires Growth+ |
| `exposureHistory(symbol, opts?)` | Daily exposure snapshots for trend analysis. Requires Growth+ |

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

### Reference Data

| Method | Description |
|--------|-------------|
| `tickers()` | All available stock tickers |
| `options(ticker)` | Option chain metadata (expirations and strikes) |
| `symbols()` | Currently queried symbols with live data |

### Screener

| Method | Description |
|--------|-------------|
| `screener(options)` | **Live options screener** — filter/rank by GEX, VRP, IV, greeks, harvest scores, custom formulas (Growth+) |

### Account and System

| Method | Description |
|--------|-------------|
| `account()` | Account info and quota |
| `health()` | Health check (public) |

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

### exposureHistory

```typescript
await fa.exposureHistory('SPY', {
  days: 30, // number of calendar days of history to return
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
  ExposureHistoryOptions,
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
