/**
 * Motion Utilities - Accessibility Support for Reduced Motion
 * Provides utilities to detect and respect user motion preferences
 */

/**
 * Check if user prefers reduced motion
 * @returns {boolean} True if user prefers reduced motion
 */
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Check if user prefers high contrast
 * @returns {boolean} True if user prefers high contrast
 */
export const prefersHighContrast = () => {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-contrast: high)').matches;
};

/**
 * Check if forced colors mode is active (Windows High Contrast)
 * @returns {boolean} True if forced colors mode is active
 */
export const isForcedColorsActive = () => {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(forced-colors: active)').matches;
};

/**
 * Get safe animation duration based on user preferences
 * @param {number} normalDuration - Normal animation duration in ms
 * @param {number} reducedDuration - Reduced animation duration in ms (default: 0)
 * @returns {number} Safe animation duration
 */
export const getSafeAnimationDuration = (normalDuration, reducedDuration = 0) => {
  return prefersReducedMotion() ? reducedDuration : normalDuration;
};

/**
 * Get safe transition styles based on user preferences
 * @param {string} normalTransition - Normal transition CSS
 * @param {string} reducedTransition - Reduced transition CSS (default: 'none')
 * @returns {string} Safe transition CSS
 */
export const getSafeTransition = (normalTransition, reducedTransition = 'none') => {
  return prefersReducedMotion() ? reducedTransition : normalTransition;
};

/**
 * Apply conditional animation class based on motion preferences
 * @param {string} animationClass - Animation class to apply
 * @param {string} fallbackClass - Fallback class for reduced motion (default: '')
 * @returns {string} Safe class name
 */
export const getSafeAnimationClass = (animationClass, fallbackClass = '') => {
  return prefersReducedMotion() ? fallbackClass : animationClass;
};

/**
 * Create a motion-safe CSS custom property
 * @param {string} property - CSS property name
 * @param {string} normalValue - Normal value
 * @param {string} reducedValue - Reduced motion value
 * @returns {object} CSS custom property object
 */
export const createMotionSafeProperty = (property, normalValue, reducedValue) => {
  return {
    [property]: prefersReducedMotion() ? reducedValue : normalValue
  };
};

/**
 * Hook for React components to listen to motion preference changes
 * @param {function} callback - Callback function to execute when preference changes
 */
export const useMotionPreference = (callback) => {
  if (typeof window === 'undefined') return;
  
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  
  // Initial check
  callback(mediaQuery.matches);
  
  // Listen for changes
  const handleChange = (e) => callback(e.matches);
  
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  } else {
    // Fallback for older browsers
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }
};

/**
 * Animation configuration object with motion-safe defaults
 */
export const animationConfig = {
  // Durations (in ms)
  duration: {
    fast: getSafeAnimationDuration(150, 0),
    normal: getSafeAnimationDuration(300, 0),
    slow: getSafeAnimationDuration(500, 0),
    slower: getSafeAnimationDuration(700, 0)
  },
  
  // Easing functions
  easing: {
    linear: 'linear',
    easeIn: prefersReducedMotion() ? 'linear' : 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: prefersReducedMotion() ? 'linear' : 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: prefersReducedMotion() ? 'linear' : 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: prefersReducedMotion() ? 'linear' : 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  },
  
  // Transform values
  transform: {
    lift: prefersReducedMotion() ? 'none' : 'translateY(-4px)',
    liftSubtle: prefersReducedMotion() ? 'none' : 'translateY(-2px)',
    scale: prefersReducedMotion() ? 'none' : 'scale(1.02)',
    scaleSmall: prefersReducedMotion() ? 'none' : 'scale(1.05)'
  }
};

/**
 * CSS-in-JS helper for motion-safe styles
 * @param {object} normalStyles - Normal styles object
 * @param {object} reducedStyles - Reduced motion styles object
 * @returns {object} Safe styles object
 */
export const motionSafeStyles = (normalStyles, reducedStyles = {}) => {
  if (prefersReducedMotion()) {
    return {
      ...normalStyles,
      ...reducedStyles,
      // Override animations and transitions
      animation: 'none',
      transition: reducedStyles.transition || 'none',
      transform: reducedStyles.transform || 'none'
    };
  }
  
  return normalStyles;
};

/**
 * Generate motion-safe keyframes
 * @param {string} name - Animation name
 * @param {object} keyframes - Keyframes object
 * @returns {string} CSS keyframes string or empty string for reduced motion
 */
export const generateMotionSafeKeyframes = (name, keyframes) => {
  if (prefersReducedMotion()) return '';
  
  let css = `@keyframes ${name} {`;
  
  Object.entries(keyframes).forEach(([key, value]) => {
    css += `${key} { ${Object.entries(value).map(([prop, val]) => `${prop}: ${val}`).join('; ')} }`;
  });
  
  css += '}';
  return css;
};

/**
 * Accessibility announcement helper
 * @param {string} message - Message to announce to screen readers
 */
export const announceToScreenReader = (message) => {
  if (typeof window === 'undefined') return;
  
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.style.position = 'absolute';
  announcement.style.left = '-10000px';
  announcement.style.width = '1px';
  announcement.style.height = '1px';
  announcement.style.overflow = 'hidden';
  
  document.body.appendChild(announcement);
  announcement.textContent = message;
  
  // Clean up after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Default export with all utilities
 */
export default {
  prefersReducedMotion,
  prefersHighContrast,
  isForcedColorsActive,
  getSafeAnimationDuration,
  getSafeTransition,
  getSafeAnimationClass,
  createMotionSafeProperty,
  useMotionPreference,
  animationConfig,
  motionSafeStyles,
  generateMotionSafeKeyframes,
  announceToScreenReader
};