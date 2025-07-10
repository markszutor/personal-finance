import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useCreateInvestment } from '../hooks/useInvestments'
import { useUserPreferences } from '../hooks/useUserPreferences'
import { getExchangeRate } from '../lib/utils'
import { X, TrendingUp, DollarSign, Calendar, Hash, Building, Globe } from 'lucide-react'

interface InvestmentFormProps {
  onClose: () => void
}

const INVESTMENT_TYPES = [
  { value: 'stock', label: 'Stock', icon: '📈' },
  { value: 'bond', label: 'Bond', icon: '🏛️' },
  { value: 'crypto', label: 'Cryptocurrency', icon: '₿' },
  { value: 'etf', label: 'ETF', icon: '📊' },
  { value: 'mutual_fund', label: 'Mutual Fund', icon: '🏦' },
  { value: 'real_estate', label: 'Real Estate', icon: '🏠' },
  { value: 'commodity', label: 'Commodity', icon: '🥇' },
  { value: 'other', label: 'Other', icon: '💼' }
]

const CURRENCIES = ['USD', 'EUR', 'GBP', 'HUF']

export function InvestmentForm({ onClose }: InvestmentFormProps) {
  const { user } = useAuth()
  const createInvestment = useCreateInvestment()
  const { data: preferences } = useUserPreferences(user?.id)
  
  const defaultCurrency = preferences?.default_currency || 'USD'
  
  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    type: 'stock' as any,
    quantity: '',
    purchase_price: '',
    current_price: '',
    currency: defaultCurrency,
    purchase_date: new Date().toISOString().split('T')[0]
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

      await createInvestment.mutateAsync({
        user_id: user.id,
        symbol: formData.symbol.toUpperCase(),
        name: formData.name,
        type: formData.type,
        quantity: parseFloat(formData.quantity),
        purchase_price: parseFloat(formData.purchase_price),
        current_price: parseFloat(formData.current_price),
        currency: formData.currency,
        exchange_rate: exchangeRate,
        purchase_date: formData.purchase_date
      })
      onClose()
    } catch (error) {
      console.error('Error creating investment:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalValue = formData.quantity && formData.current_price 
    ? parseFloat(formData.quantity) * parseFloat(formData.current_price)
    : 0

  const totalCost = formData.quantity && formData.purchase_price 
    ? parseFloat(formData.quantity) * parseFloat(formData.purchase_price)
    : 0

  const gainLoss = totalValue - totalCost
  const gainLossPercent = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0

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
        maxWidth: '700px',
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
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              padding: '12px',
              borderRadius: '12px'
            }}>
              <TrendingUp size={24} color="white" />
            </div>
            <div>
              <h2 style={{
                margin: 0,
                fontSize: '24px',
                fontWeight: '700',
                color: '#1a1a1a'
              }}>
                Add Investment
              </h2>
              <p style={{
                margin: 0,
                fontSize: '14px',
                color: '#6b7280'
              }}>
                Track your investment portfolio
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
          {/* Investment Type */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '12px'
            }}>
              Investment Type *
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '8px'
            }}>
              {INVESTMENT_TYPES.map((type) => (
                <label key={type.value} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '12px 8px',
                  borderRadius: '12px',
                  border: '2px solid',
                  borderColor: formData.type === type.value ? '#10b981' : 'rgba(0, 0, 0, 0.1)',
                  background: formData.type === type.value 
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)'
                    : 'rgba(255, 255, 255, 0.6)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: formData.type === type.value ? '#065f46' : '#6b7280',
                  textAlign: 'center'
                }}>
                  <input
                    type="radio"
                    name="type"
                    value={type.value}
                    checked={formData.type === type.value}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    style={{ display: 'none' }}
                  />
                  <span style={{ fontSize: '20px', marginBottom: '4px' }}>{type.icon}</span>
                  {type.label}
                </label>
              ))}
            </div>
          </div>

          {/* Symbol and Name */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 2fr',
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
                Symbol *
              </label>
              <input
                type="text"
                required
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
                  textTransform: 'uppercase'
                }}
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                placeholder="AAPL"
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

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Investment Name *
              </label>
              <div style={{ position: 'relative' }}>
                <Building 
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
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Apple Inc."
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
          </div>

          {/* Quantity and Purchase Price */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 120px',
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
                Quantity *
              </label>
              <div style={{ position: 'relative' }}>
                <Hash 
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
                  step="0.000001"
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
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="10"
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
                Purchase Price *
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
                  value={formData.purchase_price}
                  onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                  placeholder="150.00"
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

          {/* Current Price and Purchase Date */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
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
                Current Price *
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
                  value={formData.current_price}
                  onChange={(e) => setFormData({ ...formData, current_price: e.target.value })}
                  placeholder="175.00"
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
                Purchase Date *
              </label>
              <div style={{ position: 'relative' }}>
                <Calendar 
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
                  type="date"
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
                  value={formData.purchase_date}
                  onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
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
          </div>

          {/* Investment Summary */}
          {totalValue > 0 && (
            <div style={{
              padding: '20px',
              background: gainLoss >= 0 
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)'
                : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)',
              borderRadius: '12px',
              border: `1px solid ${gainLoss >= 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
            }}>
              <h4 style={{
                margin: '0 0 12px 0',
                fontSize: '16px',
                fontWeight: '600',
                color: '#1a1a1a'
              }}>
                Investment Summary
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '12px',
                fontSize: '14px'
              }}>
                <div>
                  <p style={{ margin: '0 0 4px 0', color: '#6b7280' }}>Total Cost</p>
                  <p style={{ margin: 0, fontWeight: '600', color: '#1a1a1a' }}>
                    {totalCost.toFixed(2)} {formData.currency}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', color: '#6b7280' }}>Current Value</p>
                  <p style={{ margin: 0, fontWeight: '600', color: '#1a1a1a' }}>
                    {totalValue.toFixed(2)} {formData.currency}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', color: '#6b7280' }}>Gain/Loss</p>
                  <p style={{ 
                    margin: 0, 
                    fontWeight: '600', 
                    color: gainLoss >= 0 ? '#10b981' : '#ef4444' 
                  }}>
                    {gainLoss >= 0 ? '+' : ''}{gainLoss.toFixed(2)} {formData.currency}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', color: '#6b7280' }}>Return</p>
                  <p style={{ 
                    margin: 0, 
                    fontWeight: '600', 
                    color: gainLoss >= 0 ? '#10b981' : '#ef4444' 
                  }}>
                    {gainLoss >= 0 ? '+' : ''}{gainLossPercent.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Currency Conversion Notice */}
          {formData.currency !== defaultCurrency && (
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
                <strong>Note:</strong> This investment will be automatically converted from {formData.currency} to {defaultCurrency} using the current exchange rate.
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
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: loading ? 'none' : '0 8px 24px rgba(16, 185, 129, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 12px 32px rgba(16, 185, 129, 0.4)'
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.3)'
                }
              }}
            >
              {loading ? 'Adding...' : 'Add Investment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}