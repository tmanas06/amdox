/**
 * MotionSafe Component
 * Wrapper component that respects user motion preferences
 */

import React from 'react';
import { useMotionPreference } from '../hooks/useMotionPreference';

/**
 * MotionSafe wrapper component
 * Conditionally applies animations based on user preferences
 */
const MotionSafe = ({ 
  children, 
  animate = true, 
  animationClass = '', 
  fallbackClass = '',
  style = {},
  reducedMotionStyle = {},
  ...props 
}) => {
  const { prefersReducedMotion, getMotionSafeStyles, getSafeAnimationClass } = useMotionPreference();

  // Determine the appropriate class name
  const className = animate 
    ? getSafeAnimationClass(animationClass, fallbackClass)
    : '';

  // Determine the appropriate styles
  const safeStyles = getMotionSafeStyles(style, reducedMotionStyle);

  return (
    <div 
      className={`${className} ${props.className || ''}`.trim()}
      style={safeStyles}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * MotionSafeButton - Button with motion-safe animations
 */
export const MotionSafeButton = ({ 
  children, 
  onClick, 
  className = '', 
  variant = 'primary',
  disabled = false,
  ...props 
}) => {
  const { prefersReducedMotion, getSafeAnimationClass } = useMotionPreference();

  const baseClasses = `btn btn-${variant}`;
  const animationClasses = getSafeAnimationClass('hover-lift btn-shimmer', '');
  const finalClassName = `${baseClasses} ${animationClasses} ${className}`.trim();

  const handleClick = (e) => {
    // Provide haptic feedback for mobile devices
    if (navigator.vibrate && !prefersReducedMotion) {
      navigator.vibrate(50);
    }
    
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      className={finalClassName}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

/**
 * MotionSafeCard - Card with motion-safe hover effects
 */
export const MotionSafeCard = ({ 
  children, 
  className = '', 
  onClick,
  ...props 
}) => {
  const { getSafeAnimationClass } = useMotionPreference();

  const baseClasses = 'card';
  const animationClasses = getSafeAnimationClass('hover-lift card-entrance', '');
  const finalClassName = `${baseClasses} ${animationClasses} ${className}`.trim();

  return (
    <div
      className={finalClassName}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * MotionSafeInput - Input with motion-safe focus effects
 */
export const MotionSafeInput = ({ 
  className = '', 
  type = 'text',
  ...props 
}) => {
  const { getSafeAnimationClass } = useMotionPreference();

  const baseClasses = 'form-input';
  const animationClasses = getSafeAnimationClass('input-focus', '');
  const finalClassName = `${baseClasses} ${animationClasses} ${className}`.trim();

  return (
    <input
      type={type}
      className={finalClassName}
      {...props}
    />
  );
};

/**
 * MotionSafeSpinner - Loading spinner that respects motion preferences
 */
export const MotionSafeSpinner = ({ 
  size = 'md', 
  className = '',
  ...props 
}) => {
  const { prefersReducedMotion } = useMotionPreference();

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const spinnerClass = prefersReducedMotion 
    ? 'loading-spinner-static' 
    : 'loading-spinner animate-spin';

  return (
    <div
      className={`${spinnerClass} ${sizeClasses[size]} ${className}`.trim()}
      role="status"
      aria-label="Loading"
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

/**
 * MotionSafeTransition - Wrapper for page/section transitions
 */
export const MotionSafeTransition = ({ 
  children, 
  show = true,
  enter = 'animate-fade-in',
  leave = 'animate-fade-out',
  className = '',
  ...props 
}) => {
  const { getSafeAnimationClass } = useMotionPreference();

  if (!show) return null;

  const animationClass = getSafeAnimationClass(enter, '');
  const finalClassName = `${animationClass} ${className}`.trim();

  return (
    <div className={finalClassName} {...props}>
      {children}
    </div>
  );
};

/**
 * MotionSafeList - List with staggered animations
 */
export const MotionSafeList = ({ 
  children, 
  className = '',
  stagger = true,
  ...props 
}) => {
  const { getSafeAnimationClass } = useMotionPreference();

  const baseClasses = className;
  const animationClasses = stagger 
    ? getSafeAnimationClass('stagger-fade-in', '') 
    : '';
  const finalClassName = `${baseClasses} ${animationClasses}`.trim();

  return (
    <div className={finalClassName} {...props}>
      {children}
    </div>
  );
};

/**
 * MotionSafeIcon - Icon with optional hover animations
 */
export const MotionSafeIcon = ({ 
  children, 
  className = '',
  bounce = false,
  ...props 
}) => {
  const { getSafeAnimationClass } = useMotionPreference();

  const animationClass = bounce 
    ? getSafeAnimationClass('icon-bounce', '') 
    : '';
  const finalClassName = `${className} ${animationClass}`.trim();

  return (
    <span className={finalClassName} {...props}>
      {children}
    </span>
  );
};

/**
 * MotionSafeToast - Toast notification with motion-safe entrance
 */
export const MotionSafeToast = ({ 
  children, 
  show = true,
  type = 'info',
  className = '',
  onClose,
  ...props 
}) => {
  const { getSafeAnimationClass, prefersReducedMotion } = useMotionPreference();

  if (!show) return null;

  const baseClasses = `toast toast-${type}`;
  const animationClasses = getSafeAnimationClass('toast-slide-in', '');
  const finalClassName = `${baseClasses} ${animationClasses} ${className}`.trim();

  // Auto-dismiss after delay (longer for reduced motion users)
  React.useEffect(() => {
    if (onClose) {
      const delay = prefersReducedMotion ? 5000 : 3000;
      const timer = setTimeout(onClose, delay);
      return () => clearTimeout(timer);
    }
  }, [onClose, prefersReducedMotion]);

  return (
    <div 
      className={finalClassName}
      role="alert"
      aria-live="polite"
      {...props}
    >
      {children}
    </div>
  );
};

export default MotionSafe;