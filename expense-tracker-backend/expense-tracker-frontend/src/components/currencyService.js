// src/services/currencyService.js

// Mock live baseline exchange rates relative to USD
const CONVERSION_RATES = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.25, // Default base home currency
  CAD: 1.35
};

/**
 * Converts any amount from a source currency to a target currency
 */
export function convertCurrency(amount, fromCurrency = 'USD', toCurrency = 'INR') {
  const upperFrom = fromCurrency.toUpperCase();
  const upperTo = toCurrency.toUpperCase();

  if (!CONVERSION_RATES[upperFrom] || !CONVERSION_RATES[upperTo]) {
    return Number(amount); // Fallback if currency is unknown
  }

  // Convert to USD first, then convert to target currency
  const amountInUSD = Number(amount) / CONVERSION_RATES[upperFrom];
  const convertedAmount = amountInUSD * CONVERSION_RATES[upperTo];

  return Number(convertedAmount.toFixed(2));
}

export function formatCurrencySymbol(currency = 'INR') {
  const symbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹', CAD: 'CA$' };
  return symbols[currency.toUpperCase()] || '₹';
}