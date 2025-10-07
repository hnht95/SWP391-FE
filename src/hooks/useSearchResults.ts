import { useMemo } from 'react';
import { carData } from '../data/carData';
import { SEARCH_SCORES } from '../constants/searchConstants';
import type { Car } from '../types/car';

export type { Car };

interface ScoredResult {
  car: Car;
  score: number;
}

/**
 * Custom hook for searching and scoring car results
 * @param searchTerm - The search term to filter cars
 * @returns Sorted array of cars based on relevance score
 */
export const useSearchResults = (searchTerm: string): Car[] => {
  return useMemo(() => {
    if (!searchTerm.trim()) return [];
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    // Filter only active vehicles first, then score and filter results
    const scoredResults: ScoredResult[] = carData
      .filter(car => car.status === 'active') // Only show active vehicles
      .map((car) => ({
        car,
        score: calculateSearchScore(car, lowerSearchTerm)
      }))
      .filter(result => result.score > 0)
      .sort((a, b) => {
        // Sort by score first, then by name length for ties
        if (a.score !== b.score) return b.score - a.score;
        return a.car.name.length - b.car.name.length;
      });
    
    return scoredResults.map(result => result.car);
  }, [searchTerm]);
};

/**
 * Calculate search relevance score for a car with enhanced fuzzy matching
 * @param car - Car object to score
 * @param searchTerm - Lowercase search term
 * @returns Score number (higher = more relevant)
 */
function calculateSearchScore(car: Car, searchTerm: string): number {
  const name = car.name.toLowerCase();
  const location = car.location.toLowerCase();
  const station = car.station?.toLowerCase() || '';
  const type = car.type.toLowerCase();
  const brand = car.name.split(' ')[0].toLowerCase();
  
  // Exact match gets highest score
  if (name === searchTerm) return SEARCH_SCORES.EXACT_MATCH;
  
  // Brand exact match (e.g., "bmw" matches "BMW")
  if (brand === searchTerm) return SEARCH_SCORES.STARTS_WITH;
  
  // Starts with search term gets high score
  if (name.startsWith(searchTerm)) return SEARCH_SCORES.STARTS_WITH;
  
  // Brand partial match (e.g., "bm" matches "BMW")
  if (brand.includes(searchTerm) || searchTerm.includes(brand)) {
    return SEARCH_SCORES.WORD_BOUNDARY;
  }
  
  // Word boundary match gets medium-high score
  if (name.includes(` ${searchTerm}`)) return SEARCH_SCORES.WORD_BOUNDARY;
  
  // Contains search term gets medium score
  if (name.includes(searchTerm)) return SEARCH_SCORES.CONTAINS;
  
  // Fuzzy word matching
  const searchWords = searchTerm.split(' ').filter(word => word.length > 1);
  const nameWords = name.split(' ').filter(word => word.length > 1);
  
  let fuzzyScore = 0;
  for (const searchWord of searchWords) {
    for (const nameWord of nameWords) {
      if (nameWord.includes(searchWord) || searchWord.includes(nameWord)) {
        fuzzyScore = Math.max(fuzzyScore, SEARCH_SCORES.CONTAINS - 10);
      }
    }
  }
  
  if (fuzzyScore > 0) return fuzzyScore;
  
  // Location matches get lower score
  if (location.startsWith(searchTerm)) return SEARCH_SCORES.LOCATION_STARTS_WITH;
  if (location.includes(searchTerm)) return SEARCH_SCORES.LOCATION_CONTAINS;
  
  // Station and type matches get lowest score
  if (station.includes(searchTerm) || type.includes(searchTerm)) {
    return SEARCH_SCORES.STATION_TYPE_MATCH;
  }
  
  return 0; // No match
}
