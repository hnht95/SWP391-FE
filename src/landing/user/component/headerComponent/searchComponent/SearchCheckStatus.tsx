import React from 'react'
import type { Car, VehicleStatus } from '../../../../../types/car'
import * as StatusUtils from '../../../../../utils/vehicleStatusUtils'
import '../../../../../styles/diamondAnimations.css'

interface SearchCheckStatusProps {
  car: Car
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'pill' | 'minimal'
  showIcon?: boolean
  showPulse?: boolean
  className?: string
}

/**
 * SearchCheckStatus - Component tích hợp cho search functionality
 * Hiển thị trạng thái xe trong kết quả tìm kiếm với thiết kế hiện đại
 * 
 * Features:
 * - Diamond shimmer background effect cho xe Active (clean, no extra icons)
 * - Multi-language support (English status text)
 * - Luxury glassmorphism design  
 * - Future-ready cho thêm trạng thái mới
 * 
 * Tối ưu cho search use case với clean code architecture
 */
const SearchCheckStatus: React.FC<SearchCheckStatusProps> = ({
  car,
  size = 'sm',
  variant = 'pill',
  showIcon = true,
  showPulse = true,
  className = ''
}) => {
  const getSizeClasses = () => {
    const sizeMap = {
      sm: 'text-xs px-2 py-1',
      md: 'text-sm px-3 py-1.5',
      lg: 'text-base px-4 py-2'
    }
    return sizeMap[size]
  }

  const getVariantClasses = () => {
    const variantMap = {
      default: 'rounded-full border backdrop-blur-sm',
      pill: 'rounded-full',
      minimal: 'rounded border-l-4 border-t-0 border-r-0 border-b-0 pl-3'
    }
    return variantMap[variant]
  }

  const getStatusIcon = (status: VehicleStatus): React.ReactNode => {
    const iconMap: Record<VehicleStatus, React.ReactNode> = {
      active: (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
        </svg>
      ),
      maintenance: (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
        </svg>
      ),
      rented: (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
        </svg>
      ),
      inactive: (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
        </svg>
      )
    }
    return iconMap[status] || iconMap.inactive
  }

  const shouldShowShimmer = car.status === 'active' && showPulse
  const statusColor = StatusUtils.getStatusColor(car.status)
  const statusText = StatusUtils.getStatusText(car.status)

  return (
    <div
      className={`
        inline-flex items-center space-x-1.5 font-medium transition-all duration-300
        hover:scale-105 hover:shadow-lg hover-enhance
        ${getSizeClasses()}
        ${getVariantClasses()}
        ${statusColor}
        ${shouldShowShimmer ? 'relative overflow-hidden status-active-glow active-luxury' : ''}
        ${className}
      `}
    >
      {/* Status Icon */}
      {showIcon && (
        <span className="flex-shrink-0 transition-transform duration-200 hover:rotate-12">
          {getStatusIcon(car.status)}
        </span>
      )}
      
      {/* Status Text */}
      <span className="font-medium tracking-wide relative z-10">
        {statusText}
      </span>
      
      {/* Diamond Shimmer Effect for Active Status */}
      {shouldShowShimmer && (
        <>
          {/* Diamond surface reflection */}
          <div className="absolute inset-0 diamond-surface rounded-full"></div>
          
          {/* Shimmer overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent 
                         transform -skew-x-12 animate-shimmer opacity-70"></div>
        </>
      )}
      
      {/* Active Indicator Dot for default variant */}
      {car.status === 'active' && variant === 'default' && (
        <span className="relative">
          <span className="flex h-2 w-2">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400 shadow-sm shadow-green-400/50"></span>
          </span>
        </span>
      )}
    </div>
  )
}

// Export utility functions cho search functionality
export const SearchStatusUtils = {
  isActiveVehicle: StatusUtils.isActiveVehicle,
  isAvailableForRent: StatusUtils.isAvailableForRent,
  filterActiveVehicles: StatusUtils.filterActiveVehicles,
  getStatusPriority: StatusUtils.getStatusPriority,
  sortByStatusPriority: StatusUtils.sortByStatusPriority
}

export default SearchCheckStatus
