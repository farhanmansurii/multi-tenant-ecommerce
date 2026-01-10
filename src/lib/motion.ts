import { Variants, Transition } from "framer-motion";

// =============================================================================
// TRANSITION PRESETS
// =============================================================================

export const transitions = {
  // Fast micro-interactions (hover, focus)
  fast: {
    duration: 0.15,
    ease: [0.25, 0.1, 0.25, 1],
  } as Transition,

  // Standard transitions (most UI elements)
  base: {
    duration: 0.2,
    ease: [0, 0, 0.2, 1],
  } as Transition,

  // Slower, more deliberate (page transitions, large reveals)
  slow: {
    duration: 0.35,
    ease: [0, 0, 0.2, 1],
  } as Transition,

  // Spring for playful elements
  spring: {
    type: "spring",
    stiffness: 400,
    damping: 30,
  } as Transition,

  // Gentle spring for larger movements
  springGentle: {
    type: "spring",
    stiffness: 300,
    damping: 25,
  } as Transition,
};

// =============================================================================
// VARIANT PRESETS
// =============================================================================

// Fade in from bottom (most common page transition)
export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 16,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.slow,
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: transitions.base,
  },
};

// Fade in from left (sidebar items, lists)
export const fadeInLeft: Variants = {
  hidden: {
    opacity: 0,
    x: -12,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitions.base,
  },
  exit: {
    opacity: 0,
    x: 12,
    transition: transitions.fast,
  },
};

// Scale in (modals, cards)
export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.96,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transitions.base,
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: transitions.fast,
  },
};

// Stagger container (for lists)
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
};

// Stagger item (use with staggerContainer)
export const staggerItem: Variants = {
  hidden: {
    opacity: 0,
    y: 8,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.base,
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: transitions.fast,
  },
};

// Collapse/expand (accordions, collapsible sections)
export const collapse: Variants = {
  hidden: {
    height: 0,
    opacity: 0,
    overflow: "hidden",
  },
  visible: {
    height: "auto",
    opacity: 1,
    overflow: "visible",
    transition: {
      height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
      opacity: { duration: 0.2, delay: 0.05 },
    },
  },
  exit: {
    height: 0,
    opacity: 0,
    overflow: "hidden",
    transition: {
      height: { duration: 0.25, ease: [0.4, 0, 1, 1] },
      opacity: { duration: 0.15 },
    },
  },
};

// =============================================================================
// INTERACTION VARIANTS
// =============================================================================

// Subtle hover lift (cards, buttons)
export const hoverLift = {
  rest: { y: 0, scale: 1 },
  hover: {
    y: -2,
    scale: 1.01,
    transition: transitions.fast,
  },
  tap: {
    y: 0,
    scale: 0.99,
    transition: { duration: 0.1 },
  },
};

// Icon hover (sidebar icons, action buttons)
export const iconHover = {
  rest: { scale: 1, rotate: 0 },
  hover: {
    scale: 1.1,
    transition: transitions.fast,
  },
  tap: {
    scale: 0.95,
    transition: { duration: 0.1 },
  },
};

// Button press effect
export const buttonPress = {
  rest: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};

// =============================================================================
// PAGE TRANSITION VARIANTS
// =============================================================================

export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.25,
      ease: [0.4, 0, 1, 1],
    },
  },
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Generate stagger delay for list items
 * @param index - Item index
 * @param baseDelay - Base delay in seconds
 * @param increment - Delay increment per item
 */
export function getStaggerDelay(
  index: number,
  baseDelay = 0.05,
  increment = 0.05
): number {
  return baseDelay + index * increment;
}

/**
 * Create a custom stagger container with specific timing
 */
export function createStaggerContainer(
  staggerChildren = 0.06,
  delayChildren = 0.04
): Variants {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren,
        delayChildren,
      },
    },
  };
}
