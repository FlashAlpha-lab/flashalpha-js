/**
 * FlashAlpha JavaScript/TypeScript SDK
 *
 * Official SDK for the FlashAlpha options analytics API.
 * https://flashalpha.com
 *
 * @example
 * import { FlashAlpha } from 'flashalpha';
 *
 * const fa = new FlashAlpha('your-api-key');
 * const data = await fa.gex('SPY');
 */

export { FlashAlpha } from './client';
export type {
  ExpirationOptions,
  ExposureHistoryOptions,
  FlashAlphaOptions,
  GexOptions,
  GreeksOptions,
  HistoricalOptionQuoteOptions,
  HistoricalStockQuoteOptions,
  IvOptions,
  KellyOptions,
  OptionQuoteOptions,
  ZeroDteOptions,
} from './client';
export {
  AuthenticationError,
  FlashAlphaError,
  NotFoundError,
  RateLimitError,
  ServerError,
  TierRestrictedError,
} from './errors';
