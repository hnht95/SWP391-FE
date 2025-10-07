// Search scoring constants
export const SEARCH_SCORES = {
  EXACT_MATCH: 100,
  STARTS_WITH: 90,
  WORD_BOUNDARY: 80,
  CONTAINS: 70,
  LOCATION_STARTS_WITH: 60,
  LOCATION_CONTAINS: 50,
  STATION_TYPE_MATCH: 40,
} as const;

// Search timing constants
export const SEARCH_TIMING = {
  DEBOUNCE_DELAY: 300,
  SEARCH_DELAY: 200,
  TYPING_SPEED: 100,
  ERASING_SPEED: 50,
  PAUSE_BEFORE_ERASE: 2000,
  FOCUS_DELAY: 100,
  BLUR_DELAY: 200,
} as const;

// Search UI constants
export const SEARCH_UI = {
  MAX_RESULTS: 5,
  FIXED_SUGGESTIONS_COUNT: 2,
  ANIMATION_DELAY_STEP: 50,
} as const;

// Default texts
export const SEARCH_TEXTS = {
  DEFAULT_PLACEHOLDER: 'Tìm kiếm các mẫu xe điện, địa điểm, dịch vụ...',
  SEARCHING: 'Searching...',
  NO_RESULTS: 'No matching results found',
  SEARCH_BUTTON: 'Search',
  CLOSE_SEARCH: 'Close Search',
} as const;
