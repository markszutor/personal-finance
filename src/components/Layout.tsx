import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { 
  Home, 
  TrendingUp, 
  TrendingDown,
  CreditCard, 
  Settings, 
  LogOut,
  PlusCircle,
  Wallet,
  Menu,
  X,
  Plus,
  BarChart3,
  Bitcoin,
  Building2,
  Zap
} from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
  currentPage: string
  onPageChange: (page: string) => void
}

export function Layout({ children, currentPage, onPageChange }: LayoutProps) {
  const { signOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  const navigation = [
    { name: 'Dashboard', id: 'dashboard', icon: Home },
    { name: 'Income', id: 'income', icon: TrendingUp },
    { name: 'Expenses', id: 'expenses', icon: TrendingDown },
    { name: 'Electricity', id: 'electricity', icon: Zap },
    { name: 'Stocks', id: 'stocks', icon: BarChart3 },
    { name: 'Crypto', id: 'crypto', icon: Bitcoin },
    { name: 'P2P Lending', id: 'p2p_lending', icon: Building2 },
    { name: 'Settings', id: 'settings', icon: Settings },
  ]

  const handleSignOut = async () => {
    await signOut()
  }

  const handlePageChange = (page: string) => {
    onPageChange(page)
    setSidebarOpen(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          zIndex: 60,
          display: window.innerWidth >= 1024 ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '48px',
          height: '48px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          cursor: 'pointer'
        }}
      >
        {sidebarOpen ? <X size={24} color="#374151" /> : <Menu size={24} color="#374151" />}
      </button>

      {/* Mobile Overlay */}
      {sidebarOpen && window.innerWidth < 1024 && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 40,
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: '280px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
        zIndex: 50,
        transform: window.innerWidth < 1024 ? (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
        transition: 'transform 0.3s ease-in-out',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Logo */}
        <div style={{
          padding: '32px 24px',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '12px',
              borderRadius: '16px',
              boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)'
            }}>
              <Wallet size={24} color="white" />
            </div>
            <div>
              <h1 style={{
                fontSize: '20px',
                fontWeight: '700',
                margin: 0,
                background: 'linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                FinanceHub
              </h1>
              <p style={{
                margin: 0,
                fontSize: '12px',
                color: '#6b7280',
                fontWeight: '500'
              }}>
                Personal Finance
              </p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav style={{
          flex: 1,
          padding: '24px 16px',
          overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = currentPage === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => handlePageChange(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px 20px',
                    borderRadius: '16px',
                    border: 'none',
                    background: isActive 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                      : 'transparent',
                    color: isActive ? 'white' : '#374151',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    width: '100%',
                    textAlign: 'left',
                    boxShadow: isActive ? '0 8px 24px rgba(102, 126, 234, 0.3)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.target.style.background = 'rgba(102, 126, 234, 0.1)'
                      e.target.style.transform = 'translateX(4px)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.target.style.background = 'transparent'
                      e.target.style.transform = 'translateX(0)'
                    }
                  }}
                >
                  <Icon size={20} style={{
                    transform: isActive ? 'scale(1.1)' : 'scale(1)',
                    transition: 'transform 0.2s ease'
                  }} />
                  {item.name}
                </button>
              )
            })}
          </div>
        </nav>

        {/* Sign Out Button */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid rgba(0, 0, 0, 0.05)'
        }}>
          <button
            onClick={handleSignOut}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 20px',
              borderRadius: '16px',
              border: 'none',
              background: 'transparent',
              color: '#ef4444',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              width: '100%',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(239, 68, 68, 0.1)'
              e.target.style.transform = 'translateX(4px)'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent'
              e.target.style.transform = 'translateX(0)'
            }}
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        marginLeft: window.innerWidth >= 1024 ? '280px' : '0',
        minHeight: '100vh',
        padding: window.innerWidth >= 1024 ? '40px' : '80px 20px 20px 20px'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          {children}
        </div>
      </div>

      {/* Floating Action Button */}
      <div
        style={{
          position: 'fixed',
          bottom: '32px',
          right: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          zIndex: 30
        }}
      >
        {/* Add Investment Button */}
        <button
          onClick={() => onPageChange('add-investment')}
          style={{
            width: '56px',
            height: '56px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            border: 'none',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.1)'
            e.target.style.boxShadow = '0 12px 40px rgba(16, 185, 129, 0.6)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)'
            e.target.style.boxShadow = '0 8px 32px rgba(16, 185, 129, 0.4)'
          }}
        >
          <TrendingUp size={24} color="white" />
        </button>
        
        {/* Add Transaction Button */}
        <button
          onClick={() => onPageChange('add-transaction')}
          style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '20px',
            boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.1) rotate(90deg)'
            e.target.style.boxShadow = '0 16px 50px rgba(102, 126, 234, 0.6)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1) rotate(0deg)'
            e.target.style.boxShadow = '0 12px 40px rgba(102, 126, 234, 0.4)'
          }}
        >
          <PlusCircle size={28} color="white" />
        </button>
      </div>
    </div>
  )
}