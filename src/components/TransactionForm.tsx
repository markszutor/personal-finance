import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useCreateTransaction } from '../hooks/useTransactions'
import { useUserPreferences } from '../hooks/useUserPreferences'
import { getExchangeRate } from '../lib/utils'
import { X, DollarSign, TrendingUp, TrendingDown } from 'lucide-react'

interface TransactionFormProps {
  onClose: () => void
}

const CATEGORIES = {
  income: [
    'Salary',
    'Freelance',
    'Investment Returns',
    'Business Income',
    'Rental Income',
    'Other Income'
  ],
  expense: [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Healthcare',
    'Education',
    'Travel',
    'Insurance',
    'Other Expenses'
  ]
}

const CURRENCIES = ['USD', 'EUR', 'GBP', 'HUF']

export function TransactionForm({ onClose }: TransactionFormProps) {
  const { user } = useAuth()
  const createTransaction = useCreateTransaction()
  const { data: preferences } = useUserPreferences(user?.id)
  
  const defaultCurrency = preferences?.default_currency || 'USD'
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    category: '',
    type: 'expense' as 'income' | 'expense',
    currency: defaultCurrency
  })

  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      // Get exchange rate if currency is different from default
      let exchangeRate = 1.0
      if (formData.currency !== defaultCurrency) {
        exchangeRate = await getExchangeRate(formData.currency, defaultCurrency)
      }

      await createTransaction.mutateAsync({
        user_id: user.id,
        title: formData.title,
        description: formData.description || null,
        amount: parseFloat(formData.amount),
        category: formData.category,
        type: formData.type,
        currency: formData.currency,
        exchange_rate: exchangeRate
      })
      onClose()
    } catch (error) {
      console.error('Error creating transaction:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = CATEGORIES[formData.type]

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
        <div className="flex items-center justify-between p-8 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl ${
              formData.type === 'income' 
                ? 'bg-green-100 text-green-600' 
                : 'bg-red-100 text-red-600'
            }`}>
              {formData.type === 'income' ? (
                <TrendingUp className="h-6 w-6" />
              ) : (
                <TrendingDown className="h-6 w-6" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Add Transaction</h2>
              <p className="text-sm text-gray-500">Track your {formData.type}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                formData.type === 'income'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="type"
                  value="income"
                  checked={formData.type === 'income'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense', category: '' })}
                  className="sr-only"
                />
                <TrendingUp className="h-5 w-5 mr-2" />
                Income
              </label>
              <label className={`flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                formData.type === 'expense'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="type"
                  value="expense"
                  checked={formData.type === 'expense'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense', category: '' })}
                  className="sr-only"
                />
                <TrendingDown className="h-5 w-5 mr-2" />
                Expense
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter transaction title"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-h-[100px] resize-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Amount *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Currency
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              >
                {CURRENCIES.map(currency => (
                  <option key={currency} value={currency}>
                    {currency}
                    {currency === defaultCurrency && ' (Default)'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category *
            </label>
            <select
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {formData.currency !== defaultCurrency && formData.amount && (
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> This transaction will be automatically converted from {formData.currency} to {defaultCurrency} using the current exchange rate.
              </p>
            </div>
          )}

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-6 py-3 rounded-xl font-medium text-white transition-all disabled:opacity-50 ${
                formData.type === 'income'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {loading ? 'Adding...' : `Add ${formData.type === 'income' ? 'Income' : 'Expense'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}