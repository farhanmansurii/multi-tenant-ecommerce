function parseNumber(name: string, fallback: number): number {
  const value = process.env[name];
  if (value === undefined || value === "") {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid ${name} value "${value}". Expected a numeric value.`);
  }
  return parsed;
}

function parseInteger(name: string, fallback: number): number {
  const parsed = parseNumber(name, fallback);
  if (!Number.isInteger(parsed)) {
    throw new Error(`Invalid ${name} value "${parsed}". Expected an integer value.`);
  }
  return parsed;
}

export interface BusinessRules {
  taxRate: number;
  maxCheckoutItems: number;
  discountThreshold: number;
  cacheTtlSeconds: number;
  mockPaymentSuccessRate: number;
  mockPaymentDelayMs: number;
}

export const businessRules: BusinessRules = {
  taxRate: parseNumber("TAX_RATE", 0.18),
  maxCheckoutItems: parseInteger("MAX_CHECKOUT_ITEMS", 50),
  discountThreshold: parseNumber("DISCOUNT_THRESHOLD", 0),
  cacheTtlSeconds: parseInteger("CACHE_TTL_SECONDS", 60),
  mockPaymentSuccessRate: parseNumber("MOCK_PAYMENT_SUCCESS_RATE", 0.95),
  mockPaymentDelayMs: parseInteger("MOCK_PAYMENT_DELAY_MS", 100),
};
