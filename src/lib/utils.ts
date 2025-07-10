import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

// Exchange rates (in a real app, these would come from an API)
const EXCHANGE_RATES: Record<string, Record<string, number>> = {
  USD: { EUR: 0.85, GBP: 0.73, HUF: 350.0, USD: 1.0 },
  EUR: { USD: 1.18, GBP: 0.86, HUF: 410.0, EUR: 1.0 },
  GBP: { USD: 1.37, EUR: 1.16, HUF: 475.0, GBP: 1.0 },
  HUF: { USD: 0.0029, EUR: 0.0024, GBP: 0.0021, HUF: 1.0 }
}

export async function getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number> {
  // In a real application, you would fetch this from a live API like:
  // - https://api.exchangerate-api.com/
  // - https://openexchangerates.org/
  // - https://fixer.io/
  
  if (fromCurrency === toCurrency) return 1.0
  
  const rate = EXCHANGE_RATES[fromCurrency]?.[toCurrency]
  if (!rate) {
    console.warn(`Exchange rate not found for ${fromCurrency} to ${toCurrency}, using 1.0`)
    return 1.0
  }
  
  return rate
}

export function convertCurrency(
  amount: number, 
  fromCurrency: string, 
  toCurrency: string, 
  exchangeRate?: number | null
): number {
  if (fromCurrency === toCurrency) return amount
  
  // Use stored exchange rate if available, otherwise get current rate
  const rate = exchangeRate || EXCHANGE_RATES[fromCurrency]?.[toCurrency] || 1.0
  return amount * rate
}

export function calculateNextOccurrence(startDate: string, frequency: string): string {
  const date = new Date(startDate)
  
  switch (frequency) {
    case 'daily':
      date.setDate(date.getDate() + 1)
      break
    case 'weekly':
      date.setDate(date.getDate() + 7)
      break
    case 'monthly':
      date.setMonth(date.getMonth() + 1)
      break
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1)
      break
    default:
      date.setMonth(date.getMonth() + 1) // Default to monthly
  }
  
  return date.toISOString().split('T')[0]
}