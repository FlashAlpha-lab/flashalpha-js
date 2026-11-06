/**
 * Should you sell options today? Print the sell-window answer for one symbol.
 *
 * Run:  FLASHALPHA_API_KEY=... npx ts-node examples/sell-window.ts SPY
 * Docs: https://flashalpha.com/docs/lab-api-strategies-sell-window
 */

import { FlashAlpha } from '../src';

async function main(): Promise<void> {
  const fa = new FlashAlpha(process.env.FLASHALPHA_API_KEY ?? '');
  const answer = await fa.sellWindow(process.argv[2] ?? 'SPY');

  console.log(`${answer.symbol} session ${answer.session}`);
  if (answer.legs_indicative) {
    console.log('Quotes are from before the 09:35 ET entry. Call again at or after 09:35 ET for the strikes to trade.');
  }

  for (const window of answer.windows ?? []) {
    console.log(`${window.expiry ?? 'no listed expiry'}: ${window.action}`);
    for (const trade of window.candidates ?? []) {
      const legs = (trade.legs ?? []).map((l) => `${l.side} ${l.quantity} ${l.strike} ${l.type}`).join(', ');
      const credit = trade.mid_credit === undefined ? 'no quote' : `$${(trade.mid_credit * 100).toFixed(2)} credit at mid`;
      console.log(`  ${trade.structure} (${legs}), ${credit}, exit: ${trade.exit}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
