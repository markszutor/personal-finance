import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { 
  Wallet, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  ArrowRight,
  Sparkles,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react'

export function Auth() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password)

      if (error) {
        setError(error.message)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* Left side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-16">
          <div className="max-w-md">
            <div className="flex items-center space-x-3 mb-8">
              <div className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-2xl">
                <Wallet className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">FinanceHub</h1>
                <p className="text-purple-200 text-sm">Personal Finance Tracker</p>
              </div>
            </div>
            
            <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
              Take control of your
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> financial future</span>
            </h2>
            
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Track expenses, manage investments, and achieve your financial goals with our intelligent platform.
            </p>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-gray-300">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-400" />
                </div>
                <span>Real-time financial insights</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Shield className="h-5 w-5 text-blue-400" />
                </div>
                <span>Bank-level security</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                  <Zap className="h-5 w-5 text-indigo-400" />
                </div>
                <span>Multi-currency support</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Auth form */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-8">
          <div className="w-full max-w-md">
            {/* Mobile branding */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-2xl">
                  <Wallet className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">FinanceHub</h1>
                  <p className="text-purple-200 text-sm">Personal Finance Tracker</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">
                  {isSignUp ? 'Create Account' : 'Welcome Back'}
                </h2>
                <p className="text-gray-300">
                  {isSignUp 
                    ? 'Start your financial journey today' 
                    : 'Sign in to continue to your dashboard'
                  }
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      required
                      className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all backdrop-blur-sm"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all backdrop-blur-sm"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-2xl backdrop-blur-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-2xl font-semibold hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 shadow-xl"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <>
                      <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                    onClick={() => setIsSignUp(!isSignUp)}
                  >
                    {isSignUp 
                      ? 'Already have an account? Sign in' 
                      : "Don't have an account? Create one"
                    }
                  </button>
                </div>
              </form>

              {isSignUp && (
                <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl">
                  <div className="flex items-center space-x-2 text-purple-200 text-sm">
                    <Sparkles className="h-4 w-4" />
                    <span>Join thousands of users managing their finances smarter</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-400 text-sm">
                Secure • Private • Encrypted
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}