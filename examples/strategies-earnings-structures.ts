/**
 * Strategy signals + earnings + structures — v1.1 endpoints.
 *
 * Exercises one strategy signal, one earnings analytic, and the pure-math
 * structure P&L endpoint against the live FlashAlpha API.
 *
 * Run:
 *   FLASHALPHA_API_KEY=your-key npx ts-node examples/strategies-earnings-structures.ts
 *
 * Get a free API key at https://flashalpha.com.
 */

import { FlashAlpha } from '../src';

async function main(): Promise<void> {
  const apiKey = process.env.FLASHALPHA_API_KEY;
  if (!apiKey) {
    throw new Error('Set FLASHALPHA_API_KEY in your environment first.');
  }

  const fa = new FlashAlpha(apiKey);

  // ── 1. Strategy signal — vol-carry / VRP-harvest (Alpha+) ────────────────
  // Returns the shared StrategyDecisionResponse envelope: action,
  // conviction, and the best matching multi-leg structure (with legs).
  const volCarry = await fa.strategyVolCarry('SPY', { targetShortDelta: 0.2 });
  console.log('strategyVolCarry(SPY):', JSON.stringify(volCarry, null, 2));

  // ── 2. Earnings — implied expected-move decomposition (Growth+) ──────────
  const move = await fa.earningsExpectedMove('AAPL');
  console.log('earningsExpectedMove(AAPL):', JSON.stringify(move, null, 2));

  // Forward calendar with implied moves (Growth+).
  const calendar = await fa.earningsCalendar({ days: 14 });
  console.log(`earningsCalendar: ${calendar.count ?? 0} events in next 14 days`);

  // ── 3. Structures — at-expiry P&L curve (POST, pure-math, Basic+) ────────
  // A SPY 540/560 bull call spread: buy the 540 call, sell the 560 call.
  const pnl = await fa.structurePnl({
    legs: [
      { action: 'buy', type: 'call', strike: 540, premium: 8.5 },
      { action: 'sell', type: 'call', strike: 560, premium: 2.1 },
    ],
    points: 41,
  });
  console.log('structurePnl breakevens:', pnl.breakevens);
  console.log('structurePnl max profit / loss:', pnl.max_profit, '/', pnl.max_loss);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
