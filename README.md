# flashalpha

Official JavaScript/TypeScript SDK for the [FlashAlpha](https://flashalpha.com) options analytics API.

Get gamma exposure (GEX), delta exposure (DEX), vanna exposure (VEX), charm exposure (CHEX), implied volatility, volatility surface, 0DTE analytics, BSM greeks, Kelly criterion position sizing, and more — all from a single npm package.

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

## Related

- [FlashAlpha Python SDK](https://github.com/FlashAlpha-lab/flashalpha-python) — Python equivalent of this SDK
- [FlashAlpha API Documentation](https://flashalpha.com/docs) — Full API reference
- [FlashAlpha](https://flashalpha.com) — Options analytics platform

## License

MIT. See [LICENSE](LICENSE).
