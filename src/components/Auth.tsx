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
  Zap,
  CheckCircle
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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
          radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%)
        `,
        pointerEvents: 'none'
      }} />

      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '1200px',
        display: 'grid',
        gridTemplateColumns: window.innerWidth >= 1024 ? '1fr 1fr' : '1fr',
        gap: '60px',
        alignItems: 'center'
      }}>
        {/* Left Panel - Branding */}
        {window.innerWidth >= 1024 && (
          <div style={{
            padding: '60px 40px',
            color: 'white'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '40px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '16px',
                borderRadius: '20px',
                marginRight: '16px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
              }}>
                <Wallet size={32} color="white" />
              </div>
              <div>
                <h1 style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  margin: 0,
                  background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  FinanceHub
                </h1>
                <p style={{
                  margin: 0,
                  opacity: 0.8,
                  fontSize: '14px'
                }}>
                  Personal Finance Tracker
                </p>
              </div>
            </div>

            <h2 style={{
              fontSize: '48px',
              fontWeight: '700',
              lineHeight: '1.2',
              marginBottom: '24px',
              background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Take control of your financial future
            </h2>

            <p style={{
              fontSize: '20px',
              lineHeight: '1.6',
              marginBottom: '40px',
              opacity: 0.9
            }}>
              Track expenses, manage investments, and achieve your financial goals with our intelligent platform.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[
                { icon: TrendingUp, text: 'Real-time financial insights' },
                { icon: Shield, text: 'Bank-level security' },
                { icon: Zap, text: 'Multi-currency support' }
              ].map((feature, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  <div style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: '12px',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <feature.icon size={20} color="white" />
                  </div>
                  <span style={{ fontSize: '16px', opacity: 0.9 }}>
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Right Panel - Auth Form */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '440px'
          }}>
            {/* Mobile Header */}
            {window.innerWidth < 1024 && (
              <div style={{
                textAlign: 'center',
                marginBottom: '40px',
                color: 'white'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    padding: '16px',
                    borderRadius: '20px',
                    marginRight: '16px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                  }}>
                    <Wallet size={32} color="white" />
                  </div>
                  <div>
                    <h1 style={{
                      fontSize: '28px',
                      fontWeight: '700',
                      margin: 0
                    }}>
                      FinanceHub
                    </h1>
                    <p style={{
                      margin: 0,
                      opacity: 0.8,
                      fontSize: '14px'
                    }}>
                      Personal Finance Tracker
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              padding: '40px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{
                textAlign: 'center',
                marginBottom: '32px'
              }}>
                <h2 style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  margin: '0 0 8px 0',
                  color: '#1a1a1a'
                }}>
                  {isSignUp ? 'Create Account' : 'Welcome Back'}
                </h2>
                <p style={{
                  margin: 0,
                  color: '#666',
                  fontSize: '16px'
                }}>
                  {isSignUp 
                    ? 'Start your financial journey today' 
                    : 'Sign in to continue to your dashboard'
                  }
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail 
                      size={20} 
                      color="#9CA3AF" 
                      style={{
                        position: 'absolute',
                        left: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)'
                      }}
                    />
                    <input
                      type="email"
                      required
                      style={{
                        width: '100%',
                        paddingLeft: '48px',
                        paddingRight: '16px',
                        paddingTop: '16px',
                        paddingBottom: '16px',
                        border: '2px solid #E5E7EB',
                        borderRadius: '12px',
                        fontSize: '16px',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                        backgroundColor: '#FAFAFA'
                      }}
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#667eea'
                        e.target.style.backgroundColor = '#ffffff'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#E5E7EB'
                        e.target.style.backgroundColor = '#FAFAFA'
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock 
                      size={20} 
                      color="#9CA3AF" 
                      style={{
                        position: 'absolute',
                        left: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)'
                      }}
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      style={{
                        width: '100%',
                        paddingLeft: '48px',
                        paddingRight: '48px',
                        paddingTop: '16px',
                        paddingBottom: '16px',
                        border: '2px solid #E5E7EB',
                        borderRadius: '12px',
                        fontSize: '16px',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                        backgroundColor: '#FAFAFA'
                      }}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#667eea'
                        e.target.style.backgroundColor = '#ffffff'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#E5E7EB'
                        e.target.style.backgroundColor = '#FAFAFA'
                      }}
                    />
                    <button
                      type="button"
                      style={{
                        position: 'absolute',
                        right: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? 
                        <EyeOff size={20} color="#9CA3AF" /> : 
                        <Eye size={20} color="#9CA3AF" />
                      }
                    </button>
                  </div>
                </div>

                {error && (
                  <div style={{
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    color: '#DC2626',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    marginBottom: '24px',
                    fontSize: '14px'
                  }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    background: loading ? '#9CA3AF' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '16px 24px',
                    borderRadius: '12px',
                    border: 'none',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.target.style.transform = 'translateY(-2px)'
                      e.target.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.6)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.target.style.transform = 'translateY(0)'
                      e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)'
                    }
                  }}
                >
                  {loading ? (
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid #ffffff',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                  ) : (
                    <>
                      <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>

                <div style={{
                  textAlign: 'center',
                  marginTop: '24px'
                }}>
                  <button
                    type="button"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#667eea',
                      fontSize: '14px',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
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
                <div style={{
                  marginTop: '24px',
                  padding: '16px',
                  background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
                  borderRadius: '12px',
                  border: '1px solid #C7D2FE'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#4338CA',
                    fontSize: '14px'
                  }}>
                    <Sparkles size={16} />
                    <span>Join thousands of users managing their finances smarter</span>
                  </div>
                </div>
              )}
            </div>

            <div style={{
              textAlign: 'center',
              marginTop: '24px'
            }}>
              <p style={{
                color: window.innerWidth >= 1024 ? 'rgba(255,255,255,0.7)' : '#666',
                fontSize: '14px',
                margin: 0
              }}>
                🔒 Secure • 🔐 Private • 🛡️ Encrypted
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}