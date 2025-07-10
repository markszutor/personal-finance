import React, { useState } from 'react'
import { Calendar, Filter, X } from 'lucide-react'

interface DateFilterProps {
  onDateRangeChange: (range: { from?: string; to?: string }) => void
  currentRange?: { from?: string; to?: string }
}

export function DateFilter({ onDateRangeChange, currentRange }: DateFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [tempRange, setTempRange] = useState(currentRange || {})

  const handleApply = () => {
    onDateRangeChange(tempRange)
    setIsOpen(false)
  }

  const handleClear = () => {
    setTempRange({})
    onDateRangeChange({})
    setIsOpen(false)
  }

  const hasActiveFilter = currentRange?.from || currentRange?.to

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 16px',
          background: hasActiveFilter 
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            : 'rgba(255, 255, 255, 0.8)',
          color: hasActiveFilter ? 'white' : '#374151',
          border: hasActiveFilter ? 'none' : '2px solid #e5e7eb',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: hasActiveFilter ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none'
        }}
        onMouseEnter={(e) => {
          if (!hasActiveFilter) {
            e.target.style.borderColor = '#667eea'
            e.target.style.background = 'rgba(102, 126, 234, 0.05)'
          }
        }}
        onMouseLeave={(e) => {
          if (!hasActiveFilter) {
            e.target.style.borderColor = '#e5e7eb'
            e.target.style.background = 'rgba(255, 255, 255, 0.8)'
          }
        }}
      >
        <Calendar size={16} />
        <span>Date Filter</span>
        {hasActiveFilter && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            width: '6px',
            height: '6px'
          }} />
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 40
            }}
            onClick={() => setIsOpen(false)}
          />
          
          {/* Filter Panel */}
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
            zIndex: 50,
            minWidth: '300px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Filter size={16} color="#667eea" />
                <h3 style={{
                  margin: 0,
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1a1a1a'
                }}>
                  Filter by Date Range
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  padding: '4px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '4px'
                }}
              >
                <X size={16} color="#6b7280" />
              </button>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  From Date
                </label>
                <input
                  type="date"
                  value={tempRange.from || ''}
                  onChange={(e) => setTempRange({ ...tempRange, from: e.target.value || undefined })}
                  style={{
                    width: 'calc(100% - 32px)',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  To Date
                </label>
                <input
                  type="date"
                  value={tempRange.to || ''}
                  onChange={(e) => setTempRange({ ...tempRange, to: e.target.value || undefined })}
                  style={{
                    width: 'calc(100% - 32px)',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb'
                  }}
                />
              </div>

              <div style={{
                display: 'flex',
                gap: '8px',
                paddingTop: '8px'
              }}>
                <button
                  onClick={handleClear}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#dc2626',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(239, 68, 68, 0.15)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(239, 68, 68, 0.1)'
                  }}
                >
                  Clear
                </button>
                <button
                  onClick={handleApply}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)'
                  }}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}