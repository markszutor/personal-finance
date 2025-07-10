import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useUserPreferences, useCreateUserPreferences, useUpdateUserPreferences } from '../hooks/useUserPreferences'
import { Settings as SettingsIcon, Globe, Save, Check } from 'lucide-react'

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft' }
]

export function Settings() {
  const { user } = useAuth()
  const { data: preferences, isLoading } = useUserPreferences(user?.id)
  const createPreferences = useCreateUserPreferences()
  const updatePreferences = useUpdateUserPreferences()
  
  const [defaultCurrency, setDefaultCurrency] = useState('USD')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (preferences) {
      setDefaultCurrency(preferences.default_currency)
    }
  }, [preferences])

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    try {
      if (preferences) {
        await updatePreferences.mutateAsync({
          user_id: user.id,
          default_currency: defaultCurrency
        })
      } else {
        await createPreferences.mutateAsync({
          user_id: user.id,
          default_currency: defaultCurrency
        })
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error('Error saving preferences:', error)
    } finally {
      setSaving(false)
    }
  }

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="mt-2 text-gray-600 flex items-center">
          <SettingsIcon className="h-4 w-4 mr-2 text-blue-500" />
          Customize your financial tracking preferences
        </p>
      </div>

      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
        <div className="flex items-center mb-6">
          <div className="p-2 bg-blue-100 rounded-lg mr-3">
            <Globe className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Currency Settings</h3>
            <p className="text-sm text-gray-600">Set your default currency for transactions and reporting</p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-semibold text-gray-700">
            Default Currency
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CURRENCIES.map((currency) => (
              <label
                key={currency.code}
                className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  defaultCurrency === currency.code
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="currency"
                  value={currency.code}
                  checked={defaultCurrency === currency.code}
                  onChange={(e) => setDefaultCurrency(e.target.value)}
                  className="sr-only"
                />
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{currency.symbol}</span>
                    <div>
                      <p className="font-semibold">{currency.code}</p>
                      <p className="text-sm text-gray-500">{currency.name}</p>
                    </div>
                  </div>
                  {defaultCurrency === currency.code && (
                    <Check className="h-5 w-5 text-blue-600" />
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                All transactions will be converted to your default currency for reporting and analytics.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Exchange rates are updated automatically when adding transactions.
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving || saved}
              className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all ${
                saved
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50'
              }`}
            >
              {saved ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Supported Currencies</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CURRENCIES.map((currency) => (
            <div key={currency.code} className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-2xl mb-2">{currency.symbol}</div>
              <div className="font-semibold text-gray-900">{currency.code}</div>
              <div className="text-xs text-gray-500">{currency.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}