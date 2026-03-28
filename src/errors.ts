/**
 * Error types for the FlashAlpha SDK.
 */

export class FlashAlphaError extends Error {
  public readonly statusCode: number;
  public readonly response: unknown;

  constructor(message: string, statusCode: number, response: unknown) {
    super(message);
    this.name = 'FlashAlphaError';
    this.statusCode = statusCode;
    this.response = response;
    // Restore prototype chain (needed when extending built-in Error in TS)
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class AuthenticationError extends FlashAlphaError {
  constructor(message: string, statusCode: number, response: unknown) {
    super(message, statusCode, response);
    this.name = 'AuthenticationError';
  }
}

export class TierRestrictedError extends FlashAlphaError {
  public readonly currentPlan: string | undefined;
  public readonly requiredPlan: string | undefined;

  constructor(
    message: string,
    statusCode: number,
    response: unknown,
    currentPlan?: string,
    requiredPlan?: string,
  ) {
    super(message, statusCode, response);
    this.name = 'TierRestrictedError';
    this.currentPlan = currentPlan;
    this.requiredPlan = requiredPlan;
  }
}

export class NotFoundError extends FlashAlphaError {
  constructor(message: string, statusCode: number, response: unknown) {
    super(message, statusCode, response);
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends FlashAlphaError {
  public readonly retryAfter: number | undefined;

  constructor(
    message: string,
    statusCode: number,
    response: unknown,
    retryAfter?: number,
  ) {
    super(message, statusCode, response);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

export class ServerError extends FlashAlphaError {
  constructor(message: string, statusCode: number, response: unknown) {
    super(message, statusCode, response);
    this.name = 'ServerError';
  }
}
