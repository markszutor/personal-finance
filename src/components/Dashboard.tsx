import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { useTransactions } from '../hooks/useTransactions'
import { useUserPreferences } from '../hooks/useUserPreferences'
import { formatCurrency, convertCurrency } from '../lib/utils'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Target,
  PieChart as PieChartIcon,
  BarChart3,
  Calendar,
  Eye
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export function Dashboard() {
  const { user } = useAuth()
  const { data: transactions = [], isLoading } = useTransactions(user?.id)
  const { data: preferences } = useUserPreferences(user?.id)

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

  const defaultCurrency = preferences?.default_currency || 'USD'

  // Convert all transactions to default currency and calculate totals
  const convertedTransactions = transactions.map(t => ({
    ...t,
    convertedAmount: convertCurrency(t.amount, t.currency, defaultCurrency, t.exchange_rate)
  }))

  const totalIncome = convertedTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.convertedAmount, 0)

  const totalExpenses = convertedTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.convertedAmount, 0)

  const netWorth = totalIncome - totalExpenses

  // Get recent transactions
  const recentTransactions = convertedTransactions.slice(0, 5)

  // Prepare chart data
  const monthlyData = convertedTransactions.reduce((acc, transaction) => {
    const month = new Date(transaction.created_at).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    const existing = acc.find(item => item.month === month)
    
    if (existing) {
      if (transaction.type === 'income') {
        existing.income += transaction.convertedAmount
      } else {
        existing.expenses += transaction.convertedAmount
      }
    } else {
      acc.push({
        month,
        income: transaction.type === 'income' ? transaction.convertedAmount : 0,
        expenses: transaction.type === 'expense' ? transaction.convertedAmount : 0,
      })
    }
    
    return acc
  }, [] as Array<{ month: string; income: number; expenses: number }>)

  // Category breakdown
  const categoryData = convertedTransactions.reduce((acc, transaction) => {
    const existing = acc.find(item => item.name === transaction.category)
    if (existing) {
      existing.value += transaction.convertedAmount
    } else {
      acc.push({
        name: transaction.category,
        value: transaction.convertedAmount,
      })
    }
    return acc
  }, [] as Array<{ name: string; value: number }>)

  const COLORS = ['#667eea', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316']

  const StatCard = ({ title, value, icon: Icon, gradient, textColor, bgColor }: any) => (
    <div style={{
      background: `linear-gradient(135deg, ${gradient[0]} 0%, ${gradient[1]} 100%)`,
      borderRadius: '24px',
      padding: '32px',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    }}>
      <div style={{
        position: 'absolute',
        top: '-20px',
        right: '-20px',
        width: '100px',
        height: '100px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '50%'
      }} />
      <div style={{
        position: 'relative',
        zIndex: 2
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <p style={{
            margin: 0,
            fontSize: '14px',
            fontWeight: '600',
            color: textColor,
            opacity: 0.9
          }}>
            {title}
          </p>
          <div style={{
            background: bgColor,
            padding: '12px',
            borderRadius: '16px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)'
          }}>
            <Icon size={24} color="white" />
          </div>
        </div>
        <p style={{
          margin: 0,
          fontSize: '32px',
          fontWeight: '700',
          color: textColor,
          lineHeight: '1.2'
        }}>
          {value}
        </p>
      </div>
    </div>
  )

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
            Financial Overview
          </h1>
          <p style={{
            margin: 0,
            color: '#6b7280',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Sparkles size={16} color="#667eea" />
            Welcome back! Here's your financial snapshot in {defaultCurrency}
          </p>
        </div>
        <div style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          padding: '16px 24px',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <p style={{
            margin: '0 0 4px 0',
            fontSize: '12px',
            color: '#6b7280',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Default Currency
          </p>
          <p style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: '700',
            color: '#1a1a1a'
          }}>
            {defaultCurrency}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px'
      }}>
        <StatCard
          title="Total Income"
          value={formatCurrency(totalIncome, defaultCurrency)}
          icon={TrendingUp}
          gradient={['#10b981', '#059669']}
          textColor="#065f46"
          bgColor="rgba(16, 185, 129, 0.2)"
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(totalExpenses, defaultCurrency)}
          icon={TrendingDown}
          gradient={['#ef4444', '#dc2626']}
          textColor="#7f1d1d"
          bgColor="rgba(239, 68, 68, 0.2)"
        />
        <StatCard
          title="Net Worth"
          value={formatCurrency(netWorth, defaultCurrency)}
          icon={Target}
          gradient={netWorth >= 0 ? ['#667eea', '#764ba2'] : ['#f59e0b', '#d97706']}
          textColor={netWorth >= 0 ? '#1e1b4b' : '#78350f'}
          bgColor={netWorth >= 0 ? 'rgba(102, 126, 234, 0.2)' : 'rgba(245, 158, 11, 0.2)'}
        />
        <StatCard
          title="Transactions"
          value={transactions.length.toString()}
          icon={CreditCard}
          gradient={['#8b5cf6', '#7c3aed']}
          textColor="#581c87"
          bgColor="rgba(139, 92, 246, 0.2)"
        />
      </div>

      {/* Charts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: window.innerWidth >= 1024 ? '1fr 1fr' : '1fr',
        gap: '32px'
      }}>
        {/* Monthly Overview */}
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
              <BarChart3 size={20} color="white" />
            </div>
            <h3 style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: '700',
              color: '#1a1a1a'
            }}>
              Monthly Overview
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip 
                formatter={(value) => formatCurrency(Number(value), defaultCurrency)}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="income" fill="#10b981" name="Income" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
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
              <PieChartIcon size={20} color="white" />
            </div>
            <h3 style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: '700',
              color: '#1a1a1a'
            }}>
              Category Breakdown
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => formatCurrency(Number(value), defaultCurrency)}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions */}
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
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px'
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
              <Eye size={20} color="white" />
            </div>
            <h3 style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: '700',
              color: '#1a1a1a'
            }}>
              Recent Transactions
            </h3>
          </div>
          <div style={{
            background: 'rgba(102, 126, 234, 0.1)',
            color: '#667eea',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            Last {recentTransactions.length} transactions
          </div>
        </div>

        {recentTransactions.length === 0 ? (
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
              <CreditCard size={32} color="#9ca3af" />
            </div>
            <h4 style={{
              margin: '0 0 8px 0',
              fontSize: '20px',
              fontWeight: '600',
              color: '#374151'
            }}>
              No transactions yet
            </h4>
            <p style={{
              margin: 0,
              color: '#6b7280',
              fontSize: '16px'
            }}>
              Add your first transaction to get started!
            </p>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px',
                background: 'rgba(255, 255, 255, 0.6)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
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
                  gap: '16px'
                }}>
                  <div style={{
                    background: transaction.type === 'income' 
                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                      : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    padding: '12px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }}>
                    {transaction.type === 'income' ? (
                      <ArrowUpRight size={20} color="white" />
                    ) : (
                      <ArrowDownRight size={20} color="white" />
                    )}
                  </div>
                  <div>
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
                      color: '#6b7280'
                    }}>
                      <span>{transaction.category}</span>
                      {transaction.currency !== defaultCurrency && (
                        <span style={{
                          background: '#f3f4f6',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          {formatCurrency(transaction.amount, transaction.currency)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{
                    margin: '0 0 4px 0',
                    fontSize: '18px',
                    fontWeight: '700',
                    color: transaction.type === 'income' ? '#10b981' : '#ef4444'
                  }}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.convertedAmount, defaultCurrency)}
                  </p>
                  <p style={{
                    margin: 0,
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}