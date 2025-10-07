import type { Car, VehicleStatus } from '../types/car'

/**
 * Utility functions for vehicle status management
 * Extracted for reusability across the application
 */

export const isActiveVehicle = (car: Car): boolean => {
  return car.status === 'active'
}

export const isAvailableForRent = (car: Car): boolean => {
  return car.status === 'active'
}

export const getStatusColor = (status: VehicleStatus): string => {
  const colorMap: Record<VehicleStatus, string> = {
    active: 'text-green-400 bg-green-500/20 border-green-500/30',
    maintenance: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
    rented: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
    inactive: 'text-red-400 bg-red-500/20 border-red-500/30'
  }
  return colorMap[status] || colorMap.inactive
}

export const getStatusText = (status: VehicleStatus): string => {
  const textMap: Record<VehicleStatus, string> = {
    active: 'Active',
    maintenance: 'Maintenance',
    rented: 'Rented', 
    inactive: 'Inactive'
  }
  return textMap[status] || textMap.inactive
}

export const filterActiveVehicles = (cars: Car[]): Car[] => {
  return cars.filter(isActiveVehicle)
}

export const getStatusPriority = (status: VehicleStatus): number => {
  const priorityMap: Record<VehicleStatus, number> = {
    active: 1,     // Highest priority - show first
    rented: 2,
    maintenance: 3,
    inactive: 4    // Lowest priority
  }
  return priorityMap[status] || 4
}

export const sortByStatusPriority = (cars: Car[]): Car[] => {
  return [...cars].sort((a, b) => {
    const priorityA = getStatusPriority(a.status)
    const priorityB = getStatusPriority(b.status)
    
    if (priorityA !== priorityB) {
      return priorityA - priorityB
    }
    
    // If same priority, sort by name
    return a.name.localeCompare(b.name)
  })
}

/**
 * Check if user is searching for a specific car that exists but is not available
 * @param searchTerm - The search term to check
 * @param allCars - All cars in the system
 * @returns Object with unavailable car info or null
 */
export const checkUnavailableCarSearch = (searchTerm: string, allCars: Car[]): {
  car: Car
  message: string
  brandSuggestions: Car[]
} | null => {
  if (!searchTerm.trim()) return null
  
  const normalizedSearch = searchTerm.toLowerCase().trim()
  
  // Find exact or very close matches
  const exactMatch = allCars.find(car => 
    car.name.toLowerCase() === normalizedSearch ||
    car.name.toLowerCase().includes(normalizedSearch) && normalizedSearch.length > 2
  )
  
  // If found a car but it's not active
  if (exactMatch && exactMatch.status !== 'active') {
    const brand = exactMatch.name.split(' ')[0] // Get brand name (e.g., "VinFast")
    
    // Find other active cars from same brand
    const brandSuggestions = allCars.filter(car => 
      car.name.toLowerCase().startsWith(brand.toLowerCase()) && 
      car.status === 'active'
    ).slice(0, 3) // Limit to 3 suggestions
    
    const statusMessages = {
      maintenance: 'under maintenance',
      rented: 'currently rented',
      inactive: 'temporarily unavailable'
    }
    
    const statusMessage = statusMessages[exactMatch.status] || 'not available'
    
    return {
      car: exactMatch,
      message: `${exactMatch.name} is currently ${statusMessage} for booking. Please consider other ${brand} models. We apologize for any inconvenience.`,
      brandSuggestions
    }
  }
  
  return null
}
