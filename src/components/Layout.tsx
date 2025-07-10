import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { 
  Home, 
  TrendingUp, 
  CreditCard, 
  Settings, 
  LogOut,
  PlusCircle,
  DollarSign
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
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex h-16 items-center justify-center border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">FinanceTracker</span>
          </div>
        </div>
        
        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onPageChange(item.id)}
                    className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      currentPage === item.id
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => onPageChange('add-transaction')}
        className="fixed bottom-6 right-6 h-14 w-14 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-colors flex items-center justify-center"
      >
        <PlusCircle className="h-6 w-6" />
      </button>
    </div>
  )
}