// =============================================================================
// SPACING - 8px grid system
// =============================================================================
export const spacing = {
  xs: "0.5rem",      // 8px
  sm: "0.75rem",     // 12px
  md: "1rem",        // 16px
  lg: "1.5rem",      // 24px
  xl: "2rem",        // 32px
  "2xl": "3rem",     // 48px
  "3xl": "4rem",     // 64px
} as const;

export const containerPadding = {
  mobile: "1rem",    // 16px
  tablet: "1.5rem",  // 24px
  desktop: "2rem",   // 32px
} as const;

// =============================================================================
// MAX WIDTH - Container constraints
// =============================================================================
export const maxWidth = {
  full: "100%",
  "7xl": "80rem",    // 1280px
  "6xl": "72rem",    // 1152px
  "5xl": "64rem",    // 1024px
  "4xl": "56rem",    // 896px
  "3xl": "48rem",    // 768px
  "2xl": "42rem",    // 672px
  xl: "36rem",       // 576px
  lg: "32rem",       // 512px
  prose: "65ch",     // Prose reading width
} as const;

// =============================================================================
// BORDER RADIUS - Consistent rounding
// =============================================================================
export const borderRadius = {
  xs: "calc(var(--radius) - 4px)",
  sm: "calc(var(--radius) - 2px)",
  md: "var(--radius)",
  lg: "calc(var(--radius) + 4px)",
  xl: "calc(var(--radius) + 8px)",
  "2xl": "calc(var(--radius) + 12px)",
  full: "9999px",
} as const;

// =============================================================================
// SHADOWS - Subtle elevation system
// =============================================================================
export const shadows = {
  xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  sm: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
} as const;

// =============================================================================
// TRANSITIONS - Motion timing
// =============================================================================
export const transitions = {
  fast: "150ms",
  base: "200ms",
  slow: "300ms",
  slower: "400ms",
} as const;

// =============================================================================
// TYPOGRAPHY - Font sizes and line heights
// =============================================================================
export const typography = {
  xs: {
    fontSize: "0.75rem",      // 12px
    lineHeight: "1rem",       // 16px
    letterSpacing: "0.01em",
  },
  sm: {
    fontSize: "0.875rem",      // 14px
    lineHeight: "1.25rem",    // 20px
    letterSpacing: "0.01em",
  },
  base: {
    fontSize: "1rem",         // 16px
    lineHeight: "1.5rem",     // 24px
    letterSpacing: "0em",
  },
  lg: {
    fontSize: "1.125rem",     // 18px
    lineHeight: "1.75rem",    // 28px
    letterSpacing: "-0.01em",
  },
  xl: {
    fontSize: "1.25rem",      // 20px
    lineHeight: "1.75rem",    // 28px
    letterSpacing: "-0.01em",
  },
  "2xl": {
    fontSize: "1.5rem",      // 24px
    lineHeight: "2rem",      // 32px
    letterSpacing: "-0.02em",
  },
  "3xl": {
    fontSize: "1.875rem",    // 30px
    lineHeight: "2.25rem",   // 36px
    letterSpacing: "-0.02em",
  },
  "4xl": {
    fontSize: "2.25rem",     // 36px
    lineHeight: "2.5rem",    // 40px
    letterSpacing: "-0.03em",
  },
  overline: {
    fontSize: "0.6875rem",   // 11px
    lineHeight: "1rem",      // 16px
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
} as const;

// =============================================================================
// Z-INDEX - Layering system
// =============================================================================
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  sidebar: 1080,
} as const;

// =============================================================================
// MOTION - Animation durations and easings
// =============================================================================
export const motion = {
  duration: {
    fast: 0.15,
    base: 0.2,
    slow: 0.35,
    slower: 0.4,
  },
  easing: {
    default: [0, 0, 0.2, 1],
    in: [0.4, 0, 1, 1],
    out: [0, 0, 0.2, 1],
    inOut: [0.4, 0, 0.2, 1],
  },
  spring: {
    stiffness: 400,
    damping: 30,
  },
} as const;

export type Spacing = keyof typeof spacing;
export type MaxWidth = keyof typeof maxWidth;
export type BorderRadius = keyof typeof borderRadius;
export type Shadow = keyof typeof shadows;
export type Typography = keyof typeof typography;
export type ZIndex = keyof typeof zIndex;
