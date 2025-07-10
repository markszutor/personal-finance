import React, { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuth } from './hooks/useAuth'
import { Auth } from './components/Auth'
import { Layout } from './components/Layout'
import { Dashboard } from './components/Dashboard'
import { TransactionForm } from './components/TransactionForm'
import { Settings } from './components/Settings'
import { CreditCard, TrendingUp } from 'lucide-react'

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

  if (!user) {
    return <Auth />
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'transactions':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div>
              <h1 style={{
                fontSize: '36px',
                fontWeight: '700',
                margin: '0 0 8px 0',
                background: 'linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Transactions
              </h1>
              <p style={{
                margin: 0,
                color: '#6b7280',
                fontSize: '16px'
              }}>
                Detailed transaction management coming soon...
              </p>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              padding: '60px 32px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
              textAlign: 'center'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                width: '80px',
                height: '80px',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px auto'
              }}>
                <CreditCard size={32} color="white" />
              </div>
              <h3 style={{
                margin: '0 0 12px 0',
                fontSize: '24px',
                fontWeight: '700',
                color: '#1a1a1a'
              }}>
                Advanced Transaction Management
              </h3>
              <p style={{
                margin: 0,
                color: '#6b7280',
                fontSize: '16px',
                maxWidth: '400px',
                margin: '0 auto'
              }}>
                Detailed filtering, search, bulk operations, and advanced analytics are coming soon to help you manage your transactions more effectively.
              </p>
            </div>
          </div>
        )
      case 'investments':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
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
                fontSize: '16px'
              }}>
                Investment tracking and portfolio management coming soon...
              </p>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              padding: '60px 32px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
              textAlign: 'center'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                width: '80px',
                height: '80px',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px auto'
              }}>
                <TrendingUp size={32} color="white" />
              </div>
              <h3 style={{
                margin: '0 0 12px 0',
                fontSize: '24px',
                fontWeight: '700',
                color: '#1a1a1a'
              }}>
                Investment Portfolio Tracking
              </h3>
              <p style={{
                margin: 0,
                color: '#6b7280',
                fontSize: '16px',
                maxWidth: '400px',
                margin: '0 auto'
              }}>
                Track your stocks, bonds, crypto, and other investments with real-time portfolio performance, allocation analysis, and growth insights.
              </p>
            </div>
          </div>
        )
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