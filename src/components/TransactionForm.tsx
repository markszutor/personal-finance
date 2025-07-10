import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useCreateTransaction } from '../hooks/useTransactions'
import { useUserPreferences } from '../hooks/useUserPreferences'
import { getExchangeRate } from '../lib/utils'
import { X, DollarSign, TrendingUp, TrendingDown, Tag, FileText, Globe } from 'lucide-react'

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
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      zIndex: 50,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '32px',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              background: formData.type === 'income' 
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              padding: '12px',
              borderRadius: '12px'
            }}>
              {formData.type === 'income' ? (
                <TrendingUp size={24} color="white" />
              ) : (
                <TrendingDown size={24} color="white" />
              )}
            </div>
            <div>
              <h2 style={{
                margin: 0,
                fontSize: '24px',
                fontWeight: '700',
                color: '#1a1a1a'
              }}>
                Add Transaction
              </h2>
              <p style={{
                margin: 0,
                fontSize: '14px',
                color: '#6b7280'
              }}>
                Track your {formData.type}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '8px',
              background: 'rgba(0, 0, 0, 0.05)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(0, 0, 0, 0.1)'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(0, 0, 0, 0.05)'
            }}
          >
            <X size={20} color="#6b7280" />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          {/* Transaction Type */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '12px'
            }}>
              Transaction Type
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px'
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                borderRadius: '12px',
                border: '2px solid',
                borderColor: formData.type === 'income' ? '#10b981' : 'rgba(0, 0, 0, 0.1)',
                background: formData.type === 'income' 
                  ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)'
                  : 'rgba(255, 255, 255, 0.6)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: formData.type === 'income' ? '#065f46' : '#6b7280'
              }}>
                <input
                  type="radio"
                  name="type"
                  value="income"
                  checked={formData.type === 'income'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense', category: '' })}
                  style={{ display: 'none' }}
                />
                <TrendingUp size={16} />
                Income
              </label>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                borderRadius: '12px',
                border: '2px solid',
                borderColor: formData.type === 'expense' ? '#ef4444' : 'rgba(0, 0, 0, 0.1)',
                background: formData.type === 'expense' 
                  ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)'
                  : 'rgba(255, 255, 255, 0.6)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: formData.type === 'expense' ? '#7f1d1d' : '#6b7280'
              }}>
                <input
                  type="radio"
                  name="type"
                  value="expense"
                  checked={formData.type === 'expense'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense', category: '' })}
                  style={{ display: 'none' }}
                />
                <TrendingDown size={16} />
                Expense
              </label>
            </div>
          </div>

          {/* Title */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Title *
            </label>
            <div style={{ position: 'relative' }}>
              <FileText 
                size={16} 
                color="#9ca3af" 
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)'
                }}
              />
              <input
                type="text"
                required
                style={{
                  width: 'calc(100% - 32px)',
                  boxSizing: 'border-box',
                  paddingLeft: '44px',
                  paddingRight: '16px',
                  paddingTop: '16px',
                  paddingBottom: '16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  backgroundColor: '#fafafa'
                }}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter transaction title"
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea'
                  e.target.style.backgroundColor = '#ffffff'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb'
                  e.target.style.backgroundColor = '#fafafa'
                }}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Description
            </label>
            <textarea
              style={{
                width: 'calc(100% - 32px)',
                boxSizing: 'border-box',
                padding: '16px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '16px',
                outline: 'none',
                transition: 'all 0.2s ease',
                backgroundColor: '#fafafa',
                minHeight: '100px',
                resize: 'none',
                fontFamily: 'inherit'
              }}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description"
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea'
                e.target.style.backgroundColor = '#ffffff'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb'
                e.target.style.backgroundColor = '#fafafa'
              }}
            />
          </div>

          {/* Amount and Currency */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 120px',
            gap: '16px'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Amount *
              </label>
              <div style={{ position: 'relative' }}>
                <DollarSign 
                  size={16} 
                  color="#9ca3af" 
                  style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)'
                  }}
                />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  style={{
                    width: 'calc(100% - 32px)',
                    boxSizing: 'border-box',
                    paddingLeft: '44px',
                    paddingRight: '16px',
                    paddingTop: '16px',
                    paddingBottom: '16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    backgroundColor: '#fafafa'
                  }}
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea'
                    e.target.style.backgroundColor = '#ffffff'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb'
                    e.target.style.backgroundColor = '#fafafa'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Currency
              </label>
              <div style={{ position: 'relative' }}>
                <Globe 
                  size={16} 
                  color="#9ca3af" 
                  style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 1
                  }}
                />
                <select
                  style={{
                    width: '100%',
                    paddingLeft: '44px',
                    paddingRight: '16px',
                    paddingTop: '16px',
                    paddingBottom: '16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    backgroundColor: '#fafafa',
                    appearance: 'none',
                    cursor: 'pointer'
                  }}
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea'
                    e.target.style.backgroundColor = '#ffffff'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb'
                    e.target.style.backgroundColor = '#fafafa'
                  }}
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
          </div>

          {/* Category */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Category *
            </label>
            <div style={{ position: 'relative' }}>
              <Tag 
                size={16} 
                color="#9ca3af" 
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 1
                }}
              />
              <select
                required
                style={{
                  width: '100%',
                  paddingLeft: '44px',
                  paddingRight: '16px',
                  paddingTop: '16px',
                  paddingBottom: '16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  backgroundColor: '#fafafa',
                  appearance: 'none',
                  cursor: 'pointer'
                }}
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea'
                  e.target.style.backgroundColor = '#ffffff'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb'
                  e.target.style.backgroundColor = '#fafafa'
                }}
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Currency Conversion Notice */}
          {formData.currency !== defaultCurrency && formData.amount && (
            <div style={{
              padding: '16px',
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              borderRadius: '12px',
              border: '1px solid rgba(102, 126, 234, 0.2)'
            }}>
              <p style={{
                margin: 0,
                fontSize: '14px',
                color: '#4338ca',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Globe size={16} />
                <strong>Note:</strong> This transaction will be automatically converted from {formData.currency} to {defaultCurrency} using the current exchange rate.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '16px',
            paddingTop: '16px'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '16px 24px',
                border: '2px solid #e5e7eb',
                background: 'rgba(255, 255, 255, 0.8)',
                color: '#374151',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#9ca3af'
                e.target.style.background = 'rgba(249, 250, 251, 1)'
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#e5e7eb'
                e.target.style.background = 'rgba(255, 255, 255, 0.8)'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '16px 24px',
                border: 'none',
                background: loading 
                  ? '#9ca3af'
                  : formData.type === 'income'
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: loading ? 'none' : '0 8px 24px rgba(102, 126, 234, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 12px 32px rgba(102, 126, 234, 0.4)'
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.3)'
                }
              }}
            >
              {loading ? 'Adding...' : `Add ${formData.type === 'income' ? 'Income' : 'Expense'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}