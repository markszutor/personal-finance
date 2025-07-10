import React, { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuth } from './hooks/useAuth'
import { Auth } from './components/Auth'
import { Layout } from './components/Layout'
import { Dashboard } from './components/Dashboard'
import { TransactionForm } from './components/TransactionForm'

const queryClient = new QueryClient()

function AppContent() {
  const { user, loading } = useAuth()
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [showTransactionForm, setShowTransactionForm] = useState(false)

  const handlePageChange = (page: string) => {
    if (page === 'add-transaction') {
      setShowTransactionForm(true)
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

  // Temporarily disabled for development
  // if (!user) {
  //   return <Auth />
  // }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'transactions':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
            <p className="text-gray-600">Detailed transaction management coming soon...</p>
          </div>
        )
      case 'investments':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Investments</h1>
            <p className="text-gray-600">Investment tracking and portfolio management coming soon...</p>
          </div>
        )
      case 'settings':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">User preferences and settings coming soon...</p>
          </div>
        )
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