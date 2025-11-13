// Header animation constants
export const HEADER_TIMING = {
  TRANSITION_DURATION: 700,
  DELAY: 200,
  GENERAL_DURATION: 300,
} as const;

// Header dimensions
export const HEADER_DIMENSIONS = {
  LARGE_HEIGHT: "h-14 md:h-16",
  SMALL_HEIGHT: "h-10 md:h-12",
  HEADER_SPACE_LARGE: "h-[60px] md:h-[88px]",
  HEADER_SPACE_SMALL: "h-[48px] md:h-[52px]",
  PADDING_LARGE: "py-3",
  PADDING_SMALL: "py-2",
} as const;

// Header styles
export const HEADER_STYLES = {
  FONT_FAMILY: '"MBCorpo Text", sans-serif',
  LOGO_FILTER: "brightness(0) invert(1)",
} as const;

// Common transition classes
export const TRANSITION_CLASSES = {
  BASE: "transition-all duration-700 ease-in-out will-change-transform",
  VISIBLE: "opacity-100 transform translate-y-0",
  HIDDEN_UP: "opacity-0 transform -translate-y-8",
  HIDDEN_DOWN: "opacity-0 transform translate-y-4 pointer-events-none",
  DISABLED: "pointer-events-none",
} as const;
