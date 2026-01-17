import React from 'react';
import { useTheme } from '../context/ThemeContext';
import './ThemeToggle.css';

/**
 * ThemeToggle Component
 * Provides a button to toggle between light and dark themes
 */
const ThemeToggle = ({ 
  size = 'md', 
  variant = 'default',
  showLabel = false,
  className = '' 
}) => {
  const { theme, toggleTheme, isTransitioning } = useTheme();

  const sizeClasses = {
    sm: 'theme-toggle--sm',
    md: 'theme-toggle--md',
    lg: 'theme-toggle--lg'
  };

  const variantClasses = {
    default: 'theme-toggle--default',
    minimal: 'theme-toggle--minimal',
    outlined: 'theme-toggle--outlined'
  };

  return (
    <button
      onClick={toggleTheme}
      disabled={isTransitioning}
      className={`
        theme-toggle
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${isTransitioning ? 'theme-toggle--transitioning' : ''}
        ${className}
      `.trim()}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      <div className="theme-toggle__icon-container">
        {/* Sun Icon */}
        <svg
          className={`theme-toggle__icon theme-toggle__sun ${theme === 'light' ? 'theme-toggle__icon--active' : ''}`}
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="5"/>
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>

        {/* Moon Icon */}
        <svg
          className={`theme-toggle__icon theme-toggle__moon ${theme === 'dark' ? 'theme-toggle__icon--active' : ''}`}
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>

        {/* Loading Spinner */}
        {isTransitioning && (
          <div className="theme-toggle__spinner">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12a9 9 0 11-6.219-8.56"/>
            </svg>
          </div>
        )}
      </div>

      {showLabel && (
        <span className="theme-toggle__label">
          {theme === 'light' ? 'Dark' : 'Light'} Mode
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;