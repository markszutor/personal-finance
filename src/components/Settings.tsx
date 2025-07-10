import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useUserPreferences, useCreateUserPreferences, useUpdateUserPreferences } from '../hooks/useUserPreferences'
import { Settings as SettingsIcon, Globe, Save, Check, Sparkles, Calendar } from 'lucide-react'

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft' }
]

const DATE_FORMATS = [
  { code: 'MM/dd/yyyy', name: 'US Format', example: '12/31/2024' },
  { code: 'dd/MM/yyyy', name: 'European Format', example: '31/12/2024' },
  { code: 'yyyy-MM-dd', name: 'ISO Format', example: '2024-12-31' },
  { code: 'dd-MM-yyyy', name: 'Alternative European', example: '31-12-2024' }
]

export function Settings() {
  const { user } = useAuth()
  const { data: preferences, isLoading } = useUserPreferences(user?.id)
  const createPreferences = useCreateUserPreferences()
  const updatePreferences = useUpdateUserPreferences()
  
  const [defaultCurrency, setDefaultCurrency] = useState('USD')
  const [dateFormat, setDateFormat] = useState('MM/dd/yyyy')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (preferences) {
      setDefaultCurrency(preferences.default_currency)
      setDateFormat(preferences.date_format || 'MM/dd/yyyy')
    }
  }, [preferences])

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    try {
      if (preferences) {
        await updatePreferences.mutateAsync({
          user_id: user.id,
          default_currency: defaultCurrency,
          date_format: dateFormat
        })
      } else {
        await createPreferences.mutateAsync({
          user_id: user.id,
          default_currency: defaultCurrency,
          date_format: dateFormat
        })
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error('Error saving preferences:', error)
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '400px'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid #e5e7eb',
          borderTop: '4px solid #667eea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div>
        <h1 style={{
          fontSize: '36px',
          fontWeight: '700',
          margin: '0 0 8px 0',
          background: 'linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Settings
        </h1>
        <p style={{
          margin: 0,
          color: '#6b7280',
          fontSize: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <SettingsIcon size={16} color="#667eea" />
          Customize your financial tracking preferences
        </p>
      </div>

      {/* Currency Settings Card */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '32px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '24px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '12px',
            borderRadius: '12px'
          }}>
            <Globe size={20} color="white" />
          </div>
          <div>
            <h3 style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: '700',
              color: '#1a1a1a'
            }}>
              Currency Settings
            </h3>
            <p style={{
              margin: 0,
              fontSize: '14px',
              color: '#6b7280'
            }}>
              Set your default currency for transactions and reporting
            </p>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '16px'
          }}>
            Default Currency
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            {CURRENCIES.map((currency) => (
              <label
                key={currency.code}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '20px',
                  borderRadius: '16px',
                  border: '2px solid',
                  borderColor: defaultCurrency === currency.code ? '#667eea' : 'rgba(0, 0, 0, 0.1)',
                  background: defaultCurrency === currency.code 
                    ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
                    : 'rgba(255, 255, 255, 0.6)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: defaultCurrency === currency.code 
                    ? '0 8px 32px rgba(102, 126, 234, 0.2)' 
                    : '0 4px 16px rgba(0, 0, 0, 0.05)'
                }}
                onMouseEnter={(e) => {
                  if (defaultCurrency !== currency.code) {
                    e.currentTarget.style.borderColor = '#667eea'
                    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.05)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (defaultCurrency !== currency.code) {
                    e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.1)'
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }
                }}
              >
                <input
                  type="radio"
                  name="currency"
                  value={currency.code}
                  checked={defaultCurrency === currency.code}
                  onChange={(e) => setDefaultCurrency(e.target.value)}
                  style={{ display: 'none' }}
                />
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <div style={{
                      fontSize: '24px',
                      marginRight: '12px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      padding: '8px',
                      borderRadius: '8px',
                      color: 'white',
                      minWidth: '40px',
                      textAlign: 'center'
                    }}>
                      {currency.symbol}
                    </div>
                    <div>
                      <p style={{
                        margin: 0,
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#1a1a1a'
                      }}>
                        {currency.code}
                      </p>
                      <p style={{
                        margin: 0,
                        fontSize: '14px',
                        color: '#6b7280'
                      }}>
                        {currency.name}
                      </p>
                    </div>
                  </div>
                  {defaultCurrency === currency.code && (
                    <div style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      padding: '6px',
                      borderRadius: '50%'
                    }}>
                      <Check size={16} color="white" />
                    </div>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Date Format Settings Card */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '32px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '24px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            padding: '12px',
            borderRadius: '12px'
          }}>
            <Calendar size={20} color="white" />
          </div>
          <div>
            <h3 style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: '700',
              color: '#1a1a1a'
            }}>
              Date Format Settings
            </h3>
            <p style={{
              margin: 0,
              fontSize: '14px',
              color: '#6b7280'
            }}>
              Choose how dates are displayed throughout the application
            </p>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '16px'
          }}>
            Date Format
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            {DATE_FORMATS.map((format) => (
              <label
                key={format.code}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '20px',
                  borderRadius: '16px',
                  border: '2px solid',
                  borderColor: dateFormat === format.code ? '#8b5cf6' : 'rgba(0, 0, 0, 0.1)',
                  background: dateFormat === format.code 
                    ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)'
                    : 'rgba(255, 255, 255, 0.6)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: dateFormat === format.code 
                    ? '0 8px 32px rgba(139, 92, 246, 0.2)' 
                    : '0 4px 16px rgba(0, 0, 0, 0.05)'
                }}
                onMouseEnter={(e) => {
                  if (dateFormat !== format.code) {
                    e.currentTarget.style.borderColor = '#8b5cf6'
                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.05)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (dateFormat !== format.code) {
                    e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.1)'
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }
                }}
              >
                <input
                  type="radio"
                  name="dateFormat"
                  value={format.code}
                  checked={dateFormat === format.code}
                  onChange={(e) => setDateFormat(e.target.value)}
                  style={{ display: 'none' }}
                />
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <div style={{
                      fontSize: '20px',
                      marginRight: '12px',
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                      padding: '8px',
                      borderRadius: '8px',
                      color: 'white',
                      minWidth: '40px',
                      textAlign: 'center'
                    }}>
                      📅
                    </div>
                    <div>
                      <p style={{
                        margin: 0,
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#1a1a1a'
                      }}>
                        {format.name}
                      </p>
                      <p style={{
                        margin: 0,
                        fontSize: '14px',
                        color: '#6b7280'
                      }}>
                        {format.example}
                      </p>
                    </div>
                  </div>
                  {dateFormat === format.code && (
                    <div style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      padding: '6px',
                      borderRadius: '50%'
                    }}>
                      <Check size={16} color="white" />
                    </div>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>

        <div style={{
          paddingTop: '24px',
          borderTop: '1px solid rgba(0, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <p style={{
              margin: '0 0 4px 0',
              fontSize: '14px',
              color: '#6b7280'
            }}>
              All transactions and bills will be converted to your default currency for reporting.
            </p>
            <p style={{
              margin: 0,
              fontSize: '12px',
              color: '#9ca3af'
            }}>
              Date format affects how dates are displayed in lists, forms, and reports.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || saved}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '16px 24px',
              borderRadius: '12px',
              border: 'none',
              background: saved 
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: saving || saved ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              opacity: saving ? 0.7 : 1,
              boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)'
            }}
            onMouseEnter={(e) => {
              if (!saving && !saved) {
                e.target.style.transform = 'translateY(-2px)'
                e.target.style.boxShadow = '0 12px 32px rgba(102, 126, 234, 0.4)'
              }
            }}
            onMouseLeave={(e) => {
              if (!saving && !saved) {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.3)'
              }
            }}
          >
            {saved ? (
              <>
                <Check size={16} />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Currency Settings Card - Remove duplicate save section */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '32px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '24px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '12px',
            borderRadius: '12px'
          }}>
            <Globe size={20} color="white" />
          </div>
          <div>
            <h3 style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: '700',
              color: '#1a1a1a'
            }}>
              Currency Settings
            </h3>
            <p style={{
              margin: 0,
              fontSize: '14px',
              color: '#6b7280'
            }}>
              Set your default currency for transactions and reporting
            </p>
          </div>
        </div>

        {/* Currency selection grid - keep existing code */}
      </div>

      {/* Supported Currencies Info Card */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '32px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '24px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            padding: '12px',
            borderRadius: '12px'
          }}>
            <Sparkles size={20} color="white" />
          </div>
          <h3 style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: '700',
            color: '#1a1a1a'
          }}>
            Supported Currencies
          </h3>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '16px'
        }}>
          {CURRENCIES.map((currency) => (
            <div key={currency.code} style={{
              textAlign: 'center',
              padding: '20px',
              background: 'rgba(255, 255, 255, 0.6)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
            >
              <div style={{
                fontSize: '24px',
                marginBottom: '8px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto'
              }}>
                {currency.symbol}
              </div>
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1a1a1a',
                marginBottom: '4px'
              }}>
                {currency.code}
              </div>
              <div style={{
                fontSize: '12px',
                color: '#6b7280'
              }}>
                {currency.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}