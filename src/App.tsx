import React, { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuth } from './hooks/useAuth'
import { Auth } from './components/Auth'
import { Layout } from './components/Layout'
import { Dashboard } from './components/Dashboard'
import { TransactionForm } from './components/TransactionForm'
import { InvestmentForm } from './components/InvestmentForm'
import { IncomeList } from './components/IncomeList'
import { ExpensesList } from './components/ExpensesList'
import { StocksList } from './components/StocksList'
import { CryptoList } from './components/CryptoList'
import { P2PLendingList } from './components/P2PLendingList'
import { Settings } from './components/Settings'
import { CreditCard, TrendingUp } from 'lucide-react'

const queryClient = new QueryClient()

function AppContent() {
  const { user, loading } = useAuth()
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [showInvestmentForm, setShowInvestmentForm] = useState(false)

  const handlePageChange = (page: string) => {
    if (page === 'add-transaction') {
      setShowTransactionForm(true)
    } else if (page === 'add-investment') {
      setShowInvestmentForm(true)
    } else {
      setCurrentPage(page)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Auth />
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'income':
        return <IncomeList />
      case 'expenses':
        return <ExpensesList />
      case 'stocks':
        return <StocksList />
      case 'crypto':
        return <CryptoList />
      case 'p2p_lending':
        return <P2PLendingList />
      case 'electricity':
        return <ElectricityList />
      case 'settings':
        return <Settings />
      default:
        return <Dashboard />
    }
  }

  return (
    <Layout currentPage={currentPage} onPageChange={handlePageChange}>
      {renderPage()}
      {showTransactionForm && (
        <TransactionForm onClose={() => setShowTransactionForm(false)} />
      )}
      {showInvestmentForm && (
        <InvestmentForm onClose={() => setShowInvestmentForm(false)} />
      )}
    </Layout>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  )
}

export default App