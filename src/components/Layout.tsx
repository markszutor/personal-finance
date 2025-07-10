import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { 
  Home, 
  TrendingUp, 
  CreditCard, 
  Settings, 
  LogOut,
  PlusCircle,
  Wallet
} from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
  currentPage: string
  onPageChange: (page: string) => void
}

export function Layout({ children, currentPage, onPageChange }: LayoutProps) {
  const { signOut } = useAuth()

  const navigation = [
    { name: 'Dashboard', id: 'dashboard', icon: Home },
    { name: 'Transactions', id: 'transactions', icon: CreditCard },
    { name: 'Investments', id: 'investments', icon: TrendingUp },
    { name: 'Settings', id: 'settings', icon: Settings },
  ]

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-72 bg-white/80 backdrop-blur-xl border-r border-white/20 shadow-2xl">
        <div className="flex h-20 items-center justify-center border-b border-gray-100/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg">
              <Wallet className="h-7 w-7 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                FinanceHub
              </span>
              <p className="text-xs text-gray-500 font-medium">Personal Finance</p>
            </div>
          </div>
        </div>
        
        <nav className="mt-8 px-6">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onPageChange(item.id)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
                      currentPage === item.id
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`mr-3 h-5 w-5 transition-transform duration-200 ${
                      currentPage === item.id ? 'scale-110' : 'group-hover:scale-105'
                    }`} />
                    {item.name}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-600 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
          >
            <LogOut className="mr-3 h-5 w-5 group-hover:scale-105 transition-transform duration-200" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-72">
        <main className="py-8">
          <div className="mx-auto max-w-7xl px-8">
            {children}
          </div>
        </main>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => onPageChange('add-transaction')}
        className="fixed bottom-8 right-8 h-16 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-2xl hover:shadow-blue-500/25 hover:scale-105 transition-all duration-200 flex items-center justify-center group"
      >
        <PlusCircle className="h-7 w-7 group-hover:rotate-90 transition-transform duration-200" />
      </button>
    </div>
  )
}