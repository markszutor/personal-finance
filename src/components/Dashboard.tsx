import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { useTransactions } from '../hooks/useTransactions'
import { formatCurrency } from '../lib/utils'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export function Dashboard() {
  const { user } = useAuth()
  const { data: transactions = [], isLoading } = useTransactions(user?.id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const netWorth = totalIncome - totalExpenses

  // Get recent transactions
  const recentTransactions = transactions.slice(0, 5)

  // Prepare chart data
  const monthlyData = transactions.reduce((acc, transaction) => {
    const month = new Date(transaction.created_at).toLocaleDateString('en-US', { month: 'short' })
    const existing = acc.find(item => item.month === month)
    
    if (existing) {
      if (transaction.type === 'income') {
        existing.income += transaction.amount
      } else {
        existing.expenses += transaction.amount
      }
    } else {
      acc.push({
        month,
        income: transaction.type === 'income' ? transaction.amount : 0,
        expenses: transaction.type === 'expense' ? transaction.amount : 0,
      })
    }
    
    return acc
  }, [] as Array<{ month: string; income: number; expenses: number }>)

  // Category breakdown
  const categoryData = transactions.reduce((acc, transaction) => {
    const existing = acc.find(item => item.name === transaction.category)
    if (existing) {
      existing.value += transaction.amount
    } else {
      acc.push({
        name: transaction.category,
        value: transaction.amount,
      })
    }
    return acc
  }, [] as Array<{ name: string; value: number }>)

  const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome back! Here's your financial overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Income</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(totalIncome)}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingDown className="h-8 w-8 text-danger-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Expenses</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(totalExpenses)}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className={`h-8 w-8 ${netWorth >= 0 ? 'text-success-600' : 'text-danger-600'}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Net Worth</p>
              <p className={`text-2xl font-semibold ${netWorth >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                {formatCurrency(netWorth)}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CreditCard className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Transactions</p>
              <p className="text-2xl font-semibold text-gray-900">
                {transactions.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Overview */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="income" fill="#22c55e" name="Income" />
              <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
        {recentTransactions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No transactions yet. Add your first transaction to get started!</p>
        ) : (
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    transaction.type === 'income' ? 'bg-success-100' : 'bg-danger-100'
                  }`}>
                    {transaction.type === 'income' ? (
                      <ArrowUpRight className="h-4 w-4 text-success-600" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-danger-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transaction.title}</p>
                    <p className="text-sm text-gray-500">{transaction.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    transaction.type === 'income' ? 'text-success-600' : 'text-danger-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount, transaction.currency)}
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