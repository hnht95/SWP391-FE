import React from 'react'
import type { Car } from '../../../../../types/car'

interface UnavailableCarNotificationProps {
  car: Car
  message: string
  brandSuggestions: Car[]
  onSuggestionClick: (car: Car) => void
}

/**
 * UnavailableCarNotification - Hiển thị thông báo khi xe không available
 * Design: Clean, professional với suggestion alternatives
 */
const UnavailableCarNotification: React.FC<UnavailableCarNotificationProps> = ({
  car,
  message,
  brandSuggestions,
  onSuggestionClick
}) => {
  const getStatusIcon = () => {
    const iconMap = {
      maintenance: (
        <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
        </svg>
      ),
      rented: (
        <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
        </svg>
      ),
      inactive: (
        <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
        </svg>
      )
    }
    return iconMap[car.status] || iconMap.inactive
  }

  return (
    <div className="w-full mt-3 animate-in slide-in-from-top-2 duration-300">
      {/* Main notification card */}
      <div className="bg-gradient-to-r from-slate-800/90 to-slate-700/90 backdrop-blur-sm border border-slate-600/50 rounded-xl p-4 shadow-lg">
        {/* Header with icon and car name */}
        <div className="flex items-center space-x-3 mb-3">
          <div className="flex-shrink-0">
            {getStatusIcon()}
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold text-lg">{car.name}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                Not Available
              </span>
              <span className="text-slate-400 text-sm">
                {car.status === 'maintenance' && '🔧 Under Maintenance'}
                {car.status === 'rented' && '🚗 Currently Rented'}
                {car.status === 'inactive' && '⚠️ Temporarily Unavailable'}
              </span>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-600/30">
          <p className="text-slate-200 text-sm leading-relaxed">
            {message}
          </p>
        </div>

        {/* Suggestions */}
        {brandSuggestions.length > 0 && (
          <div className="mt-4">
            <p className="text-slate-300 text-sm font-medium mb-2">
              ✨ Available alternatives:
            </p>
            <div className="grid grid-cols-1 gap-2">
              {brandSuggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => onSuggestionClick(suggestion)}
                  className="flex items-center justify-between p-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg border border-slate-600/30 hover:border-slate-500/50 transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-6 bg-slate-700 rounded flex items-center justify-center">
                      <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                        <path d="M3 4a1 1 0 00-1 1v1a1 1 0 001 1h1a1 1 0 001-1V5a1 1 0 00-1-1H3zM6 7a1 1 0 011-1h7a1 1 0 011 1v7a1 1 0 01-1 1H7a1 1 0 01-1-1V7z"/>
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="text-white text-sm font-medium group-hover:text-gray-100">
                        {suggestion.name}
                      </div>
                      <div className="text-slate-400 text-xs">
                        {suggestion.location} • {suggestion.range} • {suggestion.seats} seats
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-300 text-xs font-medium bg-green-500/20 px-2 py-1 rounded-full">
                      Available
                    </span>
                    <span className="text-white font-semibold">${suggestion.price}/day</span>
                    <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Close hint */}
        <div className="mt-3 text-center">
          <p className="text-slate-500 text-xs">
            Continue typing to search for other vehicles
          </p>
        </div>
      </div>
    </div>
  )
}

export default UnavailableCarNotification

