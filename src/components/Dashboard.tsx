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
  PieChart as PieChartIcon
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'

export function Dashboard() {
  const { user } = useAuth()
  const { data: transactions = [], isLoading } = useTransactions(user?.id)
  const { data: preferences } = useUserPreferences(user?.id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200"></div>
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent absolute top-0"></div>
        </div>
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
  const recentTransactions = convertedTransactions.slice(0, 6)

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

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316']

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Financial Overview
          </h1>
          <p className="mt-2 text-gray-600 flex items-center">
            <Sparkles className="h-4 w-4 mr-2 text-blue-500" />
            Welcome back! Here's your financial snapshot in {defaultCurrency}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Default Currency</p>
          <p className="text-lg font-semibold text-gray-900">{defaultCurrency}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 border border-green-200/50 shadow-lg shadow-green-500/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Total Income</p>
              <p className="text-3xl font-bold text-green-900 mt-1">
                {formatCurrency(totalIncome, defaultCurrency)}
              </p>
            </div>
            <div className="p-3 bg-green-500 rounded-xl shadow-lg">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-green-200/30 rounded-full"></div>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-red-50 to-rose-100 rounded-2xl p-6 border border-red-200/50 shadow-lg shadow-red-500/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700">Total Expenses</p>
              <p className="text-3xl font-bold text-red-900 mt-1">
                {formatCurrency(totalExpenses, defaultCurrency)}
              </p>
            </div>
            <div className="p-3 bg-red-500 rounded-xl shadow-lg">
              <TrendingDown className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-red-200/30 rounded-full"></div>
        </div>

        <div className={`relative overflow-hidden rounded-2xl p-6 border shadow-lg ${
          netWorth >= 0 
            ? 'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200/50 shadow-blue-500/10' 
            : 'bg-gradient-to-br from-orange-50 to-amber-100 border-orange-200/50 shadow-orange-500/10'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${netWorth >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                Net Worth
              </p>
              <p className={`text-3xl font-bold mt-1 ${netWorth >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>
                {formatCurrency(netWorth, defaultCurrency)}
              </p>
            </div>
            <div className={`p-3 rounded-xl shadow-lg ${netWorth >= 0 ? 'bg-blue-500' : 'bg-orange-500'}`}>
              <Target className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className={`absolute -bottom-2 -right-2 w-20 h-20 rounded-full ${
            netWorth >= 0 ? 'bg-blue-200/30' : 'bg-orange-200/30'
          }`}></div>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-violet-100 rounded-2xl p-6 border border-purple-200/50 shadow-lg shadow-purple-500/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700">Transactions</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">
                {transactions.length}
              </p>
            </div>
            <div className="p-3 bg-purple-500 rounded-xl shadow-lg">
              <CreditCard className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-purple-200/30 rounded-full"></div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Overview */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
          <div className="flex items-center mb-6">
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <BarChart className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Monthly Overview</h3>
          </div>
          <ResponsiveContainer width="100%" height={320}>
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
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
          <div className="flex items-center mb-6">
            <div className="p-2 bg-purple-100 rounded-lg mr-3">
              <PieChartIcon className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Category Breakdown</h3>
          </div>
          <ResponsiveContainer width="100%" height={320}>
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
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg mr-3">
              <CreditCard className="h-5 w-5 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Recent Transactions</h3>
          </div>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            Last {recentTransactions.length} transactions
          </span>
        </div>
        {recentTransactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <CreditCard className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg">No transactions yet</p>
            <p className="text-gray-400 text-sm mt-1">Add your first transaction to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-white/30 hover:bg-white/70 transition-all duration-200">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl ${
                    transaction.type === 'income' 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {transaction.type === 'income' ? (
                      <ArrowUpRight className="h-5 w-5" />
                    ) : (
                      <ArrowDownRight className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{transaction.title}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>{transaction.category}</span>
                      {transaction.currency !== defaultCurrency && (
                        <span className="bg-gray-200 px-2 py-0.5 rounded text-xs">
                          {formatCurrency(transaction.amount, transaction.currency)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-lg ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.convertedAmount, defaultCurrency)}
                  </p>
                  <p className="text-sm text-gray-500">
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