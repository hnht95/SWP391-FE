import React from 'react'
import type { Car } from '../../../../../types/car'
import SearchCheckStatus from './SearchCheckStatus'

interface SearchCarCardProps {
  car: Car
  searchTerm: string
  isSelected: boolean
  index: number
  onClick: (e: React.MouseEvent) => void
  onMouseEnter: () => void
}

const SearchCarCard: React.FC<SearchCarCardProps> = ({
  car,
  searchTerm,
  isSelected,
  onClick,
  onMouseEnter
}) => {
  // Highlight matching text in car name
  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text
    
    const regex = new RegExp(`(${searchTerm})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-white/20 text-white font-semibold px-1 rounded">
          {part}
        </span>
      ) : (
        part
      )
    )
  }

  return (
    <div
      className={`group relative overflow-hidden rounded-xl p-4 cursor-pointer transition-all duration-300 ease-out w-full transform hover:translate-y-[-2px] ${
        isSelected 
          ? 'bg-gradient-to-r from-white/10 to-white/15 border border-white/60 shadow-lg shadow-white/20' 
          : 'bg-black/40 hover:bg-black/50 border border-transparent hover:border-white/40 hover:shadow-xl hover:shadow-white/20'
      }`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-50 transition-opacity duration-300 hover:opacity-70"></div>
      
      <div className="relative flex items-center space-x-4">
        {/* Car Image */}
        <div className="flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden bg-gray-800">
          <img
            src={car.image}
            alt={car.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = '/cars/placeholder.png' // Fallback image
            }}
          />
        </div>

        {/* Car Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <h3 className="text-white font-semibold text-lg truncate transition-all duration-300 group-hover:text-gray-100">
                {highlightText(car.name, searchTerm)}
              </h3>
              <SearchCheckStatus 
                car={car}
                size="sm" 
                variant="pill"
                showPulse={car.status === 'active'}
                className="flex-shrink-0"
              />
            </div>
            <span className="text-white font-bold text-lg transition-all duration-300 group-hover:text-gray-100 flex-shrink-0">
              ${car.price}/day
            </span>
          </div>
          
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
              </svg>
              {car.seats} seats
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
              </svg>
              {car.location}
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
              </svg>
              {car.range}
            </span>
          </div>
          
          {car.station && (
            <div className="mt-2">
              <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded-full">
                {car.station}
              </span>
            </div>
          )}
        </div>

        {/* Arrow indicator */}
        <div className={`flex-shrink-0 transition-all duration-300 ease-out group-hover:translate-x-1 ${
          isSelected ? 'transform translate-x-2' : ''
        }`}>
          <svg className="w-5 h-5 text-gray-400 transition-colors duration-300 group-hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  )
}

export default SearchCarCard
