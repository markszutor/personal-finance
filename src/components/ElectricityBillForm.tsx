import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useCreateElectricityBill, useElectricityBills } from '../hooks/useElectricityBills'
import { useUserPreferences } from '../hooks/useUserPreferences'
import { getExchangeRate } from '../lib/utils'
import { X, Zap, DollarSign, Calendar, Hash, FileText, Globe, Calculator } from 'lucide-react'

interface ElectricityBillFormProps {
  onClose: () => void
}

const CURRENCIES = ['USD', 'EUR', 'GBP', 'HUF']

export function ElectricityBillForm({ onClose }: ElectricityBillFormProps) {
  const { user } = useAuth()
  const createBill = useCreateElectricityBill()
  const { data: preferences } = useUserPreferences(user?.id)
  const { data: existingBills = [] } = useElectricityBills(user?.id)
  
  const defaultCurrency = preferences?.default_currency || 'USD'
  
  // Get the most recent bill for auto-filling previous readings
  const lastBill = existingBills[0]
  
  const [formData, setFormData] = useState({
    bill_date: new Date().toISOString().split('T')[0],
    reading_date: new Date().toISOString().split('T')[0],
    day_reading: '',
    night_reading: '',
    previous_day_reading: lastBill?.day_reading?.toString() || '',
    previous_night_reading: lastBill?.night_reading?.toString() || '',
    amount_paid: '',
    currency: defaultCurrency,
    day_rate: '',
    night_rate: '',
    standing_charge: '',
    notes: ''
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

      await createBill.mutateAsync({
        user_id: user.id,
        bill_date: formData.bill_date,
        reading_date: formData.reading_date,
        day_reading: parseFloat(formData.day_reading),
        night_reading: parseFloat(formData.night_reading),
        previous_day_reading: formData.previous_day_reading ? parseFloat(formData.previous_day_reading) : undefined,
        previous_night_reading: formData.previous_night_reading ? parseFloat(formData.previous_night_reading) : undefined,
        amount_paid: parseFloat(formData.amount_paid),
        currency: formData.currency,
        exchange_rate: exchangeRate,
        day_rate: formData.day_rate ? parseFloat(formData.day_rate) : undefined,
        night_rate: formData.night_rate ? parseFloat(formData.night_rate) : undefined,
        standing_charge: formData.standing_charge ? parseFloat(formData.standing_charge) : undefined,
        notes: formData.notes || undefined
      })
      onClose()
    } catch (error) {
      console.error('Error creating electricity bill:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate usage if we have all readings
  const dayUsage = formData.day_reading && formData.previous_day_reading 
    ? parseFloat(formData.day_reading) - parseFloat(formData.previous_day_reading)
    : null

  const nightUsage = formData.night_reading && formData.previous_night_reading 
    ? parseFloat(formData.night_reading) - parseFloat(formData.previous_night_reading)
    : null

  const totalUsage = dayUsage !== null && nightUsage !== null 
    ? dayUsage + nightUsage 
    : null

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
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              padding: '12px',
              borderRadius: '12px'
            }}>
              <Zap size={24} color="white" />
            </div>
            <div>
              <h2 style={{
                margin: 0,
                fontSize: '24px',
                fontWeight: '700',
                color: '#1a1a1a'
              }}>
                Add Electricity Bill
              </h2>
              <p style={{
                margin: 0,
                fontSize: '14px',
                color: '#6b7280'
              }}>
                Log your meter readings and bill amount
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
          {/* Bill and Reading Dates */}
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
                Bill Date *
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
                  value={formData.bill_date}
                  onChange={(e) => setFormData({ ...formData, bill_date: e.target.value })}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#f59e0b'
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
                Reading Date *
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
                  value={formData.reading_date}
                  onChange={(e) => setFormData({ ...formData, reading_date: e.target.value })}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#f59e0b'
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

          {/* Current Meter Readings */}
          <div>
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: '18px',
              fontWeight: '600',
              color: '#1a1a1a'
            }}>
              Current Meter Readings
            </h3>
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
                  Day Reading (kWh) *
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
                    step="0.1"
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
                    value={formData.day_reading}
                    onChange={(e) => setFormData({ ...formData, day_reading: e.target.value })}
                    placeholder="12345.6"
                    onFocus={(e) => {
                      e.target.style.borderColor = '#f59e0b'
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
                  Night Reading (kWh) *
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
                    step="0.1"
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
                    value={formData.night_reading}
                    onChange={(e) => setFormData({ ...formData, night_reading: e.target.value })}
                    placeholder="6789.2"
                    onFocus={(e) => {
                      e.target.style.borderColor = '#f59e0b'
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
          </div>

          {/* Previous Meter Readings */}
          <div>
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: '18px',
              fontWeight: '600',
              color: '#1a1a1a'
            }}>
              Previous Meter Readings
            </h3>
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
                  Previous Day Reading (kWh)
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
                    step="0.1"
                    min="0"
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
                    value={formData.previous_day_reading}
                    onChange={(e) => setFormData({ ...formData, previous_day_reading: e.target.value })}
                    placeholder="12000.0"
                    onFocus={(e) => {
                      e.target.style.borderColor = '#f59e0b'
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
                  Previous Night Reading (kWh)
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
                    step="0.1"
                    min="0"
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
                    value={formData.previous_night_reading}
                    onChange={(e) => setFormData({ ...formData, previous_night_reading: e.target.value })}
                    placeholder="6500.0"
                    onFocus={(e) => {
                      e.target.style.borderColor = '#f59e0b'
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
          </div>

          {/* Usage Calculation Display */}
          {totalUsage !== null && (
            <div style={{
              padding: '20px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%)',
              borderRadius: '12px',
              border: '1px solid rgba(245, 158, 11, 0.2)'
            }}>
              <h4 style={{
                margin: '0 0 12px 0',
                fontSize: '16px',
                fontWeight: '600',
                color: '#1a1a1a',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Calculator size={16} color="#f59e0b" />
                Calculated Usage
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '12px',
                fontSize: '14px'
              }}>
                <div>
                  <p style={{ margin: '0 0 4px 0', color: '#6b7280' }}>Day Usage</p>
                  <p style={{ margin: 0, fontWeight: '600', color: '#1a1a1a' }}>
                    {dayUsage?.toFixed(1)} kWh
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', color: '#6b7280' }}>Night Usage</p>
                  <p style={{ margin: 0, fontWeight: '600', color: '#1a1a1a' }}>
                    {nightUsage?.toFixed(1)} kWh
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', color: '#6b7280' }}>Total Usage</p>
                  <p style={{ margin: 0, fontWeight: '600', color: '#f59e0b' }}>
                    {totalUsage.toFixed(1)} kWh
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Bill Amount and Currency */}
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
                Amount Paid *
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
                  value={formData.amount_paid}
                  onChange={(e) => setFormData({ ...formData, amount_paid: e.target.value })}
                  placeholder="125.50"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#f59e0b'
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
                    e.target.style.borderColor = '#f59e0b'
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

          {/* Optional Rate Information */}
          <div>
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: '18px',
              fontWeight: '600',
              color: '#1a1a1a'
            }}>
              Rate Information (Optional)
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
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
                  Day Rate (per kWh)
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  style={{
                    width: 'calc(100% - 32px)',
                    boxSizing: 'border-box',
                    padding: '16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    backgroundColor: '#fafafa'
                  }}
                  value={formData.day_rate}
                  onChange={(e) => setFormData({ ...formData, day_rate: e.target.value })}
                  placeholder="0.25"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#f59e0b'
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
                  Night Rate (per kWh)
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  style={{
                    width: 'calc(100% - 32px)',
                    boxSizing: 'border-box',
                    padding: '16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    backgroundColor: '#fafafa'
                  }}
                  value={formData.night_rate}
                  onChange={(e) => setFormData({ ...formData, night_rate: e.target.value })}
                  placeholder="0.15"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#f59e0b'
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
                  Standing Charge
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  style={{
                    width: 'calc(100% - 32px)',
                    boxSizing: 'border-box',
                    padding: '16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    backgroundColor: '#fafafa'
                  }}
                  value={formData.standing_charge}
                  onChange={(e) => setFormData({ ...formData, standing_charge: e.target.value })}
                  placeholder="25.00"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#f59e0b'
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

          {/* Notes */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Notes (Optional)
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
                minHeight: '80px',
                resize: 'none',
                fontFamily: 'inherit'
              }}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes about this bill..."
              onFocus={(e) => {
                e.target.style.borderColor = '#f59e0b'
                e.target.style.backgroundColor = '#ffffff'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb'
                e.target.style.backgroundColor = '#fafafa'
              }}
            />
          </div>

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
                <strong>Note:</strong> This bill will be automatically converted from {formData.currency} to {defaultCurrency} using the current exchange rate.
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
                  : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: 'white',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: loading ? 'none' : '0 8px 24px rgba(245, 158, 11, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 12px 32px rgba(245, 158, 11, 0.4)'
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 8px 24px rgba(245, 158, 11, 0.3)'
                }
              }}
            >
              {loading ? 'Adding Bill...' : 'Add Electricity Bill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}