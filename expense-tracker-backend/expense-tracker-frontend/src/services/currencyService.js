// src/services/currencyService.js

const EXCHANGE_RATES = {
  INR: 1.0,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0095,
};

const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

export function convertAmount(amountInINR, targetCurrency) {
  const rate = EXCHANGE_RATES[targetCurrency] || 1.0;
  return (amountInINR * rate).toFixed(2);
}

export function getCurrencySymbol(currency) {
  return CURRENCY_SYMBOLS[currency] || '₹';
}

export const AVAILABLE_CURRENCIES = ['INR', 'USD', 'EUR', 'GBP'];