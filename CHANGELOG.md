# Changelog

## 1.1.0 - 2026-06-08

Full API parity — adds typed client methods, response interfaces, and
LLM-discoverable docs for every endpoint shipped since 1.0, plus two new
optional parameters on existing endpoints.

### Added

- **Strategy signals (×10)** — `strategyFlowAnomaly`,
  `strategyExpiryPositioning`, `strategyZeroDte`, `strategyDealerRegime`,
  `strategyVolCarry`, `strategyYieldEnhancement`, `strategySurfaceAnomaly`,
  `strategySkew`, `strategyTermStructure`, `strategyTailPricing`. Each
  GETs `/v1/strategies/{kind}/{symbol}` and returns the shared
  `StrategyDecisionResponse` envelope (action, conviction, best structure
  with legs, risk flags, data quality). New option types
  `StrategyExpiryOptions`, `StrategyExpiryPositioningOptions`,
  `StrategyZeroDteOptions`, `StrategyVolCarryOptions`,
  `StrategyYieldEnhancementOptions`. Tiers vary (Basic+ / Growth+ / Alpha+).
- **Earnings (×8)** — `earningsCalendar` (`/v1/earnings/calendar`),
  `earningsExpectedMove`, `earningsHistory`, `earningsIvCrush`,
  `earningsVrp`, `earningsDealerPositioning`, `earningsStrategies`,
  `earningsScreener` (`/v1/earnings/screener`). Implied-vs-actual move,
  IV crush, earnings VRP, dealer positioning into the print, strategy
  suitability scores, and a cross-sectional screener. Growth+ / Alpha+.
- **Structures (×2, POST, pure-math)** — `structurePnl`
  (`POST /v1/structures/pnl`): at-expiry P&L curve, breakevens, max
  profit/loss for a multi-leg structure; `structureGreeks`
  (`POST /v1/structures/greeks`): aggregate BSM position Greeks. Basic+.
  New request/response types `StructureLeg`, `StructurePnlRequest`,
  `StructurePnlResponse`, `StructureGreeksLeg`, `StructureGreeksRequest`,
  `StructureGreeksResponse`.
- **Zero-DTE flow (×5)** — `flowZeroDteSnapshot`, `flowZeroDteSeries`,
  `flowZeroDteHedgeFlow`, `flowZeroDteHeatmap`, `flowZeroDteStrikeFlow`
  under `/v1/flow/zero-dte/*`. Live 0DTE snapshot with flow-direction
  read, intraday series, dealer hedge-flow series, strike × time heatmap
  (gex/dex/vex/chex/oi/signed_flow), and per-strike signed flow. Growth+ /
  Alpha+.
- **`dispersion`** (`/v1/dispersion`) — implied vs realized correlation /
  dispersion for an index basket. Alpha+.
- **`liquidity`** (`/v1/liquidity/{symbol}`) — per-expiry
  execution/liquidity scores. Growth+.
- **`skewTerm`** (`/v1/volatility/skew-term/{symbol}`) — skew term
  structure with vol-desk conventions (risk reversal, butterfly). Growth+.
- **`spotVolCorrelation`** (`/v1/volatility/spot-vol-correlation/{symbol}`)
  — rolling 20d / 60d spot/vol correlation. Growth+.
- **`vixState`** (`/v1/macro/vix-state`) — VIX overvixing / undervixing
  regime (VIX vs SPX realized vol). Growth+.
- **`universe`** (`/v1/universe`) — curated queryable symbol directory.
  Public.
- **`surfaceSvi`** (`/v1/surface/svi/{symbol}`) — live SVI-fitted
  volatility surface parameters per expiry. Alpha+.
- **`expectedMove`** (`/v1/expected-move/{symbol}`) — straddle-implied
  expected move per expiry. Basic+.
- **`vrpHistory`** (`/v1/vrp/{symbol}/history`) — daily VRP time series
  (ATM IV vs realized, straddle, expected move). Alpha+.
- **Exposure (additional)** — `exposureSheet`
  (`/v1/exposure/sheet/{symbol}`, unified per-strike GEX/DEX/VEX/CHEX + DAG
  + OI), `exposureTermStructure` (`/v1/exposure/term-structure/{symbol}`,
  per-greek by DTE bucket and expiry), `exposureBasket`
  (`/v1/exposure/basket`, weighted cross-symbol aggregate), `exposureOiDiff`
  (`/v1/exposure/oi-diff/{symbol}`, day-over-day OI deltas). Growth+.
- **`flowDealerPremium`** (`/v1/flow/options/{symbol}/dealer-premium`) —
  full-tape Net Dealer Premium (dealer buy vs write). Alpha+.
- **`flowStockBars`** (`/v1/flow/stocks/{symbol}/bars`) — multi-resolution
  OHLCV+flow bars (1s / 1m / 5m / 15m / 30m / 1h / 4h). Alpha+.
- **`screenerFields`** (`/v1/screener/fields`) — list the queryable
  screener fields and their types. Any authenticated tier.
- Full TypeScript interfaces for every new response, plus all new option
  types, re-exported from the package root.

### Changed

- `vrp(symbol, options?)` now accepts `{ date }` (`YYYY-MM-DD`), wired to
  `?date=`, returning the persisted historical snapshot for that session.
  Omit it for the live read. New `VrpOptions` type.
- `zeroDte(symbol, options?)` now accepts `{ expiry }` (`YYYY-MM-DD`),
  wired to `?expiry=`, to slice the analytics to a single expiration cycle.
