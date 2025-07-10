import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useInvestments, useDeleteInvestment } from '../hooks/useInvestments'
import { useUserPreferences } from '../hooks/useUserPreferences'
import { DateFilter } from './DateFilter'
import { formatCurrency, convertCurrency } from '../lib/utils'
import { 
  TrendingUp, 
  TrendingDown, 
  Edit3, 
  Trash2, 
  Search,
  Filter,
  Building,
  Hash,
  AlertTriangle,
  Target
} from 'lucide-react'

const INVESTMENT_TYPE_ICONS: Record<string, string> = {
  stock: '📈',
  bond: '🏛️',
  crypto: '₿',
  etf: '📊',
  mutual_fund: '🏦',
  real_estate: '🏠',
  commodity: '🥇',
  other: '💼'
}

export function InvestmentsList() {
  const { user } = useAuth()
  const [dateRange, setDateRange] = useState<{ from?: string; to?: string }>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  
  const { data: investments = [], isLoading } = useInvestments(user?.id, dateRange)
  const { data: preferences } = useUserPreferences(user?.id)
  const deleteInvestment = useDeleteInvestment()

  const defaultCurrency = preferences?.default_currency || 'USD'

  // Filter investments based on search and filters
  const filteredInvestments = investments.filter(investment => {
    const matchesSearch = investment.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         investment.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = !selectedType || investment.type === selectedType
    
    return matchesSearch && matchesType
  })

  // Get unique types for filters
  const types = [...new Set(investments.map(i => i.type))].sort()

  const handleDelete = async (id: string) => {
    try {
      await deleteInvestment.mutateAsync(id)
      setShowDeleteConfirm(null)
    } catch (error) {
      console.error('Error deleting investment:', error)
    }
  }

  // Calculate totals
  const totalValue = filteredInvestments.reduce((sum, inv) => {
    const convertedValue = convertCurrency(
      inv.quantity * inv.current_price,
      inv.currency,
      defaultCurrency,
      inv.exchange_rate
    )
    return sum + convertedValue
  }, 0)

  const totalCost = filteredInvestments.reduce((sum, inv) => {
    const convertedCost = convertCurrency(
      inv.quantity * inv.purchase_price,
      inv.currency,
      defaultCurrency,
      inv.exchange_rate
    )
    return sum + convertedCost
  }, 0)

  const totalGainLoss = totalValue - totalCost
  const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0

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
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{
            fontSize: '36px',
            fontWeight: '700',
            margin: '0 0 8px 0',
            background: 'linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Investments
          </h1>
          <p style={{
            margin: 0,
            color: '#6b7280',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <TrendingUp size={16} color="#667eea" />
            Track your investment portfolio
          </p>
        </div>
        <DateFilter 
          onDateRangeChange={setDateRange}
          currentRange={dateRange}
        />
      </div>

      {/* Portfolio Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '24px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '24px',
          padding: '24px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '80px',
            height: '80px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%'
          }} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', opacity: 0.9 }}>Total Value</p>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>
              {formatCurrency(totalValue, defaultCurrency)}
            </p>
          </div>
        </div>

        <div style={{
          background: totalGainLoss >= 0 
            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
            : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          borderRadius: '24px',
          padding: '24px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '80px',
            height: '80px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%'
          }} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', opacity: 0.9 }}>Total Gain/Loss</p>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>
              {totalGainLoss >= 0 ? '+' : ''}{formatCurrency(totalGainLoss, defaultCurrency)}
            </p>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
              {totalGainLoss >= 0 ? '+' : ''}{totalGainLossPercent.toFixed(2)}%
            </p>
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          borderRadius: '24px',
          padding: '24px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '80px',
            height: '80px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%'
          }} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', opacity: 0.9 }}>Holdings</p>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>
              {filteredInvestments.length}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '24px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search 
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
              placeholder="Search investments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: 'calc(100% - 32px)',
                paddingLeft: '44px',
                paddingRight: '16px',
                paddingTop: '12px',
                paddingBottom: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.2s ease',
                backgroundColor: '#fafafa'
              }}
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

          {/* Type Filter */}
          <div style={{ position: 'relative' }}>
            <Filter 
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
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '44px',
                paddingRight: '16px',
                paddingTop: '12px',
                paddingBottom: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.2s ease',
                backgroundColor: '#fafafa',
                appearance: 'none',
                cursor: 'pointer'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea'
                e.target.style.backgroundColor = '#ffffff'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb'
                e.target.style.backgroundColor = '#fafafa'
              }}
            >
              <option value="">All Types</option>
              {types.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        {(searchTerm || selectedType) && (
          <div style={{ marginTop: '16px' }}>
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedType('')
              }}
              style={{
                padding: '8px 16px',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#dc2626',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(239, 68, 68, 0.15)'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(239, 68, 68, 0.1)'
              }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Investments List */}
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
          justifyContent: 'space-between',
          marginBottom: '24px'
        }}>
          <h3 style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: '700',
            color: '#1a1a1a'
          }}>
            Portfolio Holdings
          </h3>
          <div style={{
            background: 'rgba(102, 126, 234, 0.1)',
            color: '#667eea',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            {filteredInvestments.length} holdings
          </div>
        </div>

        {filteredInvestments.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px auto'
            }}>
              <Target size={32} color="#9ca3af" />
            </div>
            <h4 style={{
              margin: '0 0 8px 0',
              fontSize: '20px',
              fontWeight: '600',
              color: '#374151'
            }}>
              No investments found
            </h4>
            <p style={{
              margin: 0,
              color: '#6b7280',
              fontSize: '16px'
            }}>
              {searchTerm || selectedType 
                ? 'Try adjusting your filters or search terms'
                : 'Add your first investment to start building your portfolio!'
              }
            </p>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {filteredInvestments.map((investment) => {
              const currentValue = convertCurrency(
                investment.quantity * investment.current_price,
                investment.currency,
                defaultCurrency,
                investment.exchange_rate
              )
              
              const costBasis = convertCurrency(
                investment.quantity * investment.purchase_price,
                investment.currency,
                defaultCurrency,
                investment.exchange_rate
              )
              
              const gainLoss = currentValue - costBasis
              const gainLossPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0

              return (
                <div key={investment.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '20px',
                  background: 'rgba(255, 255, 255, 0.6)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    flex: 1
                  }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      padding: '12px',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      fontSize: '20px',
                      minWidth: '48px',
                      textAlign: 'center'
                    }}>
                      {INVESTMENT_TYPE_ICONS[investment.type] || '💼'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '4px'
                      }}>
                        <h4 style={{
                          margin: 0,
                          fontSize: '16px',
                          fontWeight: '700',
                          color: '#1a1a1a'
                        }}>
                          {investment.symbol}
                        </h4>
                        <span style={{
                          background: '#f3f4f6',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '500',
                          color: '#6b7280'
                        }}>
                          {investment.type.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <p style={{
                        margin: '0 0 8px 0',
                        fontSize: '14px',
                        color: '#6b7280'
                      }}>
                        {investment.name}
                      </p>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        fontSize: '14px',
                        color: '#9ca3af',
                        flexWrap: 'wrap'
                      }}>
                        <span>{investment.quantity} shares</span>
                        <span>•</span>
                        <span>{new Date(investment.purchase_date).toLocaleDateString()}</span>
                        {investment.currency !== defaultCurrency && (
                          <>
                            <span>•</span>
                            <span style={{
                              background: '#f3f4f6',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '500'
                            }}>
                              {investment.currency}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                  }}>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{
                        margin: '0 0 4px 0',
                        fontSize: '18px',
                        fontWeight: '700',
                        color: '#1a1a1a'
                      }}>
                        {formatCurrency(currentValue, defaultCurrency)}
                      </p>
                      <p style={{
                        margin: 0,
                        fontSize: '14px',
                        fontWeight: '600',
                        color: gainLoss >= 0 ? '#10b981' : '#ef4444'
                      }}>
                        {gainLoss >= 0 ? '+' : ''}{formatCurrency(gainLoss, defaultCurrency)}
                        <span style={{ marginLeft: '4px' }}>
                          ({gainLoss >= 0 ? '+' : ''}{gainLossPercent.toFixed(2)}%)
                        </span>
                      </p>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <button
                        style={{
                          padding: '8px',
                          background: 'rgba(102, 126, 234, 0.1)',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'rgba(102, 126, 234, 0.2)'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'rgba(102, 126, 234, 0.1)'
                        }}
                      >
                        <Edit3 size={16} color="#667eea" />
                      </button>
                      
                      <button
                        onClick={() => setShowDeleteConfirm(investment.id)}
                        style={{
                          padding: '8px',
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'rgba(239, 68, 68, 0.2)'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'rgba(239, 68, 68, 0.1)'
                        }}
                      >
                        <Trash2 size={16} color="#ef4444" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 50
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '400px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            textAlign: 'center'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px auto'
            }}>
              <AlertTriangle size={28} color="white" />
            </div>
            
            <h3 style={{
              margin: '0 0 12px 0',
              fontSize: '20px',
              fontWeight: '700',
              color: '#1a1a1a'
            }}>
              Delete Investment
            </h3>
            
            <p style={{
              margin: '0 0 24px 0',
              color: '#6b7280',
              fontSize: '16px',
              lineHeight: '1.5'
            }}>
              Are you sure you want to delete this investment? This action cannot be undone.
            </p>
            
            <div style={{
              display: 'flex',
              gap: '12px'
            }}>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  border: '2px solid #e5e7eb',
                  background: 'rgba(255, 255, 255, 0.8)',
                  color: '#374151',
                  borderRadius: '12px',
                  fontSize: '14px',
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
                onClick={() => handleDelete(showDeleteConfirm)}
                disabled={deleteInvestment.isPending}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  border: 'none',
                  background: deleteInvestment.isPending 
                    ? '#9ca3af'
                    : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: deleteInvestment.isPending ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!deleteInvestment.isPending) {
                    e.target.style.transform = 'translateY(-1px)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!deleteInvestment.isPending) {
                    e.target.style.transform = 'translateY(0)'
                  }
                }}
              >
                {deleteInvestment.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}