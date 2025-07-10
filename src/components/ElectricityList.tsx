import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useTransactions, useDeleteTransaction } from '../hooks/useTransactions'
import { useUserPreferences } from '../hooks/useUserPreferences'
import { DateFilter } from './DateFilter'
import { formatCurrency, convertCurrency } from '../lib/utils'
import { 
  Zap, 
  Edit3, 
  Trash2, 
  Search,
  AlertTriangle,
  TrendingDown,
  Calendar,
  DollarSign
} from 'lucide-react'

export function ElectricityList() {
  const { user } = useAuth()
  const [dateRange, setDateRange] = useState<{ from?: string; to?: string }>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  
  const { data: allTransactions = [], isLoading } = useTransactions(user?.id, dateRange)
  const { data: preferences } = useUserPreferences(user?.id)
  const deleteTransaction = useDeleteTransaction()

  const defaultCurrency = preferences?.default_currency || 'USD'

  // Filter only electricity-related transactions
  const electricityTransactions = allTransactions.filter(t => 
    t.category.toLowerCase().includes('electricity') || 
    t.category.toLowerCase().includes('electric') ||
    t.category.toLowerCase().includes('power') ||
    t.category.toLowerCase().includes('utility') ||
    t.title.toLowerCase().includes('electricity') ||
    t.title.toLowerCase().includes('electric') ||
    t.title.toLowerCase().includes('power')
  )

  // Filter transactions based on search
  const filteredTransactions = electricityTransactions.filter(transaction => {
    const matchesSearch = transaction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  // Calculate total electricity costs
  const totalElectricityCosts = filteredTransactions.reduce((sum, t) => {
    const convertedAmount = convertCurrency(t.amount, t.currency, defaultCurrency, t.exchange_rate)
    return sum + convertedAmount
  }, 0)

  // Calculate monthly average
  const monthlyAverage = filteredTransactions.length > 0 
    ? totalElectricityCosts / Math.max(1, new Set(filteredTransactions.map(t => 
        new Date(t.transaction_date || t.created_at).toISOString().slice(0, 7)
      )).size)
    : 0

  const handleDelete = async (id: string) => {
    try {
      await deleteTransaction.mutateAsync(id)
      setShowDeleteConfirm(null)
    } catch (error) {
      console.error('Error deleting transaction:', error)
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
          borderTop: '4px solid #f59e0b',
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
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Electricity Bills
          </h1>
          <p style={{
            margin: 0,
            color: '#6b7280',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Zap size={16} color="#f59e0b" />
            Track your electricity and power expenses
          </p>
        </div>
        <DateFilter 
          onDateRangeChange={setDateRange}
          currentRange={dateRange}
        />
      </div>

      {/* Electricity Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '24px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
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
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', opacity: 0.9 }}>Total Electricity Costs</p>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>
              {formatCurrency(totalElectricityCosts, defaultCurrency)}
            </p>
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
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
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', opacity: 0.9 }}>Monthly Average</p>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>
              {formatCurrency(monthlyAverage, defaultCurrency)}
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
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', opacity: 0.9 }}>Total Bills</p>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>
              {filteredTransactions.length}
            </p>
          </div>
        </div>
      </div>

      {/* Search Filter */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '24px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
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
            placeholder="Search electricity bills..."
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
              e.target.style.borderColor = '#f59e0b'
              e.target.style.backgroundColor = '#ffffff'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb'
              e.target.style.backgroundColor = '#fafafa'
            }}
          />
        </div>

        {searchTerm && (
          <div style={{ marginTop: '16px' }}>
            <button
              onClick={() => setSearchTerm('')}
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
              Clear Search
            </button>
          </div>
        )}
      </div>

      {/* Electricity Bills List */}
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
            Electricity Bills
          </h3>
          <div style={{
            background: 'rgba(245, 158, 11, 0.1)',
            color: '#f59e0b',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            {filteredTransactions.length} bills
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px auto'
            }}>
              <Zap size={32} color="white" />
            </div>
            <h4 style={{
              margin: '0 0 8px 0',
              fontSize: '20px',
              fontWeight: '600',
              color: '#374151'
            }}>
              No electricity bills found
            </h4>
            <p style={{
              margin: 0,
              color: '#6b7280',
              fontSize: '16px'
            }}>
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Add your first electricity bill to start tracking your power expenses!'
              }
            </p>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {filteredTransactions.map((transaction) => {
              const convertedAmount = convertCurrency(
                transaction.amount, 
                transaction.currency, 
                defaultCurrency, 
                transaction.exchange_rate
              )

              return (
                <div key={transaction.id} style={{
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
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      padding: '12px',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }}>
                      <Zap size={20} color="white" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{
                        margin: '0 0 4px 0',
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#1a1a1a'
                      }}>
                        {transaction.title}
                      </h4>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        fontSize: '14px',
                        color: '#6b7280',
                        flexWrap: 'wrap'
                      }}>
                        <span>{transaction.category}</span>
                        <span>•</span>
                        <span>{new Date(transaction.transaction_date || transaction.created_at).toLocaleDateString()}</span>
                        {transaction.currency !== defaultCurrency && (
                          <>
                            <span>•</span>
                            <span style={{
                              background: '#f3f4f6',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '500'
                            }}>
                              {formatCurrency(transaction.amount, transaction.currency)}
                            </span>
                          </>
                        )}
                      </div>
                      {transaction.description && (
                        <p style={{
                          margin: '8px 0 0 0',
                          fontSize: '14px',
                          color: '#9ca3af',
                          fontStyle: 'italic'
                        }}>
                          {transaction.description}
                        </p>
                      )}
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
                        color: '#f59e0b'
                      }}>
                        {formatCurrency(convertedAmount, defaultCurrency)}
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
                          background: 'rgba(245, 158, 11, 0.1)',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'rgba(245, 158, 11, 0.2)'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'rgba(245, 158, 11, 0.1)'
                        }}
                      >
                        <Edit3 size={16} color="#f59e0b" />
                      </button>
                      
                      <button
                        onClick={() => setShowDeleteConfirm(transaction.id)}
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
              Delete Electricity Bill
            </h3>
            
            <p style={{
              margin: '0 0 24px 0',
              color: '#6b7280',
              fontSize: '16px',
              lineHeight: '1.5'
            }}>
              Are you sure you want to delete this electricity bill? This action cannot be undone.
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
                disabled={deleteTransaction.isPending}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  border: 'none',
                  background: deleteTransaction.isPending 
                    ? '#9ca3af'
                    : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: deleteTransaction.isPending ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!deleteTransaction.isPending) {
                    e.target.style.transform = 'translateY(-1px)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!deleteTransaction.isPending) {
                    e.target.style.transform = 'translateY(0)'
                  }
                }}
              >
                {deleteTransaction.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}