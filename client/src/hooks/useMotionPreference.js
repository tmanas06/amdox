/**
 * React Hook for Motion Preferences
 * Provides React components with motion preference state and utilities
 */

import { useState, useEffect } from 'react';

/**
 * Custom hook to detect and respond to user motion preferences
 * @returns {object} Motion preference state and utilities
 */
export const useMotionPreference = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);
  const [isForcedColors, setIsForcedColors] = useState(false);

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return;

    // Media queries for accessibility preferences
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    const forcedColorsQuery = window.matchMedia('(forced-colors: active)');

    // Set initial states
    setPrefersReducedMotion(reducedMotionQuery.matches);
    setPrefersHighContrast(highContrastQuery.matches);
    setIsForcedColors(forcedColorsQuery.matches);

    // Event handlers for preference changes
    const handleReducedMotionChange = (e) => setPrefersReducedMotion(e.matches);
    const handleHighContrastChange = (e) => setPrefersHighContrast(e.matches);
    const handleForcedColorsChange = (e) => setIsForcedColors(e.matches);

    // Add event listeners
    if (reducedMotionQuery.addEventListener) {
      reducedMotionQuery.addEventListener('change', handleReducedMotionChange);
      highContrastQuery.addEventListener('change', handleHighContrastChange);
      forcedColorsQuery.addEventListener('change', handleForcedColorsChange);
    } else {
      // Fallback for older browsers
      reducedMotionQuery.addListener(handleReducedMotionChange);
      highContrastQuery.addListener(handleHighContrastChange);
      forcedColorsQuery.addListener(handleForcedColorsChange);
    }

    // Cleanup function
    return () => {
      if (reducedMotionQuery.removeEventListener) {
        reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
        highContrastQuery.removeEventListener('change', handleHighContrastChange);
        forcedColorsQuery.removeEventListener('change', handleForcedColorsChange);
      } else {
        // Fallback for older browsers
        reducedMotionQuery.removeListener(handleReducedMotionChange);
        highContrastQuery.removeListener(handleHighContrastChange);
        forcedColorsQuery.removeListener(handleForcedColorsChange);
      }
    };
  }, []);

  // Utility functions
  const getSafeAnimationDuration = (normalDuration, reducedDuration = 0) => {
    return prefersReducedMotion ? reducedDuration : normalDuration;
  };

  const getSafeTransition = (normalTransition, reducedTransition = 'none') => {
    return prefersReducedMotion ? reducedTransition : normalTransition;
  };

  const getSafeAnimationClass = (animationClass, fallbackClass = '') => {
    return prefersReducedMotion ? fallbackClass : animationClass;
  };

  const getSafeTransform = (normalTransform, reducedTransform = 'none') => {
    return prefersReducedMotion ? reducedTransform : normalTransform;
  };

  const getMotionSafeStyles = (normalStyles, reducedStyles = {}) => {
    if (prefersReducedMotion) {
      return {
        ...normalStyles,
        ...reducedStyles,
        animation: 'none',
        transition: reducedStyles.transition || 'none',
        transform: reducedStyles.transform || 'none'
      };
    }
    return normalStyles;
  };

  // Animation configuration based on preferences
  const animationConfig = {
    duration: {
      fast: getSafeAnimationDuration(150),
      normal: getSafeAnimationDuration(300),
      slow: getSafeAnimationDuration(500),
      slower: getSafeAnimationDuration(700)
    },
    easing: {
      linear: 'linear',
      easeIn: prefersReducedMotion ? 'linear' : 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: prefersReducedMotion ? 'linear' : 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: prefersReducedMotion ? 'linear' : 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: prefersReducedMotion ? 'linear' : 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    },
    transform: {
      lift: getSafeTransform('translateY(-4px)'),
      liftSubtle: getSafeTransform('translateY(-2px)'),
      scale: getSafeTransform('scale(1.02)'),
      scaleSmall: getSafeTransform('scale(1.05)')
    }
  };

  return {
    // State
    prefersReducedMotion,
    prefersHighContrast,
    isForcedColors,
    
    // Utility functions
    getSafeAnimationDuration,
    getSafeTransition,
    getSafeAnimationClass,
    getSafeTransform,
    getMotionSafeStyles,
    
    // Configuration
    animationConfig
  };
};

/**
 * Higher-order component to provide motion preferences to any component
 * @param {React.Component} WrappedComponent - Component to wrap
 * @returns {React.Component} Enhanced component with motion preferences
 */
export const withMotionPreference = (WrappedComponent) => {
  return function MotionPreferenceWrapper(props) {
    const motionPrefs = useMotionPreference();
    
    return <WrappedComponent {...props} motionPrefs={motionPrefs} />;
  };
};

/**
 * Context for motion preferences (optional, for complex apps)
 */
import { createContext, useContext } from 'react';

export const MotionPreferenceContext = createContext(null);

export const MotionPreferenceProvider = ({ children }) => {
  const motionPrefs = useMotionPreference();
  
  return (
    <MotionPreferenceContext.Provider value={motionPrefs}>
      {children}
    </MotionPreferenceContext.Provider>
  );
};

export const useMotionPreferenceContext = () => {
  const context = useContext(MotionPreferenceContext);
  if (!context) {
    throw new Error('useMotionPreferenceContext must be used within a MotionPreferenceProvider');
  }
  return context;
};

export default useMotionPreference;