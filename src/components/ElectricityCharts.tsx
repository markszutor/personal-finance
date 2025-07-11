import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { useElectricityConsumptionHistory } from '../hooks/usePropertyAddresses'
import { useUserPreferences } from '../hooks/useUserPreferences'
import { formatCurrency } from '../lib/utils'
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  ComposedChart,
  Area,
  AreaChart
} from 'recharts'
import { TrendingUp, Zap, Target, BarChart3 } from 'lucide-react'

interface ElectricityChartsProps {
  months?: number
}

export function ElectricityCharts({ months = 12 }: ElectricityChartsProps) {
  const { user } = useAuth()
  const { data: consumptionHistory = [], isLoading } = useElectricityConsumptionHistory(user?.id, months)
  const { data: preferences } = useUserPreferences(user?.id)

  const defaultCurrency = preferences?.default_currency || 'USD'

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '300px'
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

  if (consumptionHistory.length === 0) {
    return (
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
          <BarChart3 size={32} color="white" />
        </div>
        <h4 style={{
          margin: '0 0 8px 0',
          fontSize: '20px',
          fontWeight: '600',
          color: '#374151'
        }}>
          No consumption data available
        </h4>
        <p style={{
          margin: 0,
          color: '#6b7280',
          fontSize: '16px'
        }}>
          Add more electricity bills to see consumption trends and forecast accuracy.
        </p>
      </div>
    )
  }

  // Prepare chart data
  const chartData = consumptionHistory.map(item => ({
    date: new Date(item.reading_date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    fullDate: item.reading_date,
    totalUsage: item.total_usage,
    dayUsage: item.day_usage || 0,
    nightUsage: item.night_usage || 0,
    amountPaid: item.amount_paid,
    forecasted: item.forecasted_amount,
    accuracy: item.forecast_accuracy,
    property: item.property_nickname
  })).sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime())

  // Calculate average accuracy
  const accuracyData = chartData.filter(item => item.accuracy !== null)
  const averageAccuracy = accuracyData.length > 0 
    ? accuracyData.reduce((sum, item) => sum + item.accuracy, 0) / accuracyData.length 
    : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Summary Stats */}
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
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px'
            }}>
              <Zap size={16} />
              <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>Avg Monthly Usage</p>
            </div>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>
              {(chartData.reduce((sum, item) => sum + item.totalUsage, 0) / chartData.length).toFixed(1)} kWh
            </p>
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
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
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px'
            }}>
              <Target size={16} />
              <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>Forecast Accuracy</p>
            </div>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>
              {averageAccuracy.toFixed(1)}%
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
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px'
            }}>
              <TrendingUp size={16} />
              <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>Avg Monthly Cost</p>
            </div>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>
              {formatCurrency(chartData.reduce((sum, item) => sum + item.amountPaid, 0) / chartData.length, defaultCurrency)}
            </p>
          </div>
        </div>
      </div>

      {/* Historical Consumption Chart */}
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
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
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
            Historical Electricity Consumption
          </h3>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
            <YAxis yAxisId="usage" orientation="left" stroke="#64748b" fontSize={12} />
            <YAxis yAxisId="cost" orientation="right" stroke="#64748b" fontSize={12} />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'Total Usage') return [`${value} kWh`, name]
                if (name === 'Day Usage') return [`${value} kWh`, name]
                if (name === 'Night Usage') return [`${value} kWh`, name]
                if (name === 'Amount Paid') return [formatCurrency(Number(value), defaultCurrency), name]
                return [value, name]
              }}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend />
            <Bar yAxisId="usage" dataKey="dayUsage" stackId="usage" fill="#f59e0b" name="Day Usage" radius={[0, 0, 0, 0]} />
            <Bar yAxisId="usage" dataKey="nightUsage" stackId="usage" fill="#d97706" name="Night Usage" radius={[4, 4, 0, 0]} />
            <Line yAxisId="cost" type="monotone" dataKey="amountPaid" stroke="#10b981" strokeWidth={3} name="Amount Paid" dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Actual vs Forecast Chart */}
      {accuracyData.length > 0 && (
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
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              padding: '12px',
              borderRadius: '12px'
            }}>
              <Target size={20} color="white" />
            </div>
            <h3 style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: '700',
              color: '#1a1a1a'
            }}>
              Actual vs Forecast Comparison
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={accuracyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'Actual Amount' || name === 'Forecasted Amount') {
                    return [formatCurrency(Number(value), defaultCurrency), name]
                  }
                  return [value, name]
                }}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="amountPaid" 
                stroke="#10b981" 
                strokeWidth={3} 
                name="Actual Amount"
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="forecasted" 
                stroke="#f59e0b" 
                strokeWidth={3} 
                strokeDasharray="5 5"
                name="Forecasted Amount"
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Forecast Accuracy Trend */}
      {accuracyData.length > 0 && (
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
              <TrendingUp size={20} color="white" />
            </div>
            <h3 style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: '700',
              color: '#1a1a1a'
            }}>
              Forecast Accuracy Trend
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={accuracyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
              <YAxis domain={[0, 100]} stroke="#64748b" fontSize={12} />
              <Tooltip 
                formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Accuracy']}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="accuracy" 
                stroke="#8b5cf6" 
                fill="url(#accuracyGradient)" 
                strokeWidth={2}
              />
              <defs>
                <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}