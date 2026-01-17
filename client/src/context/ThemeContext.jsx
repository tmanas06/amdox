import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

/**
 * ThemeProvider Component
 * Manages theme state with light/dark mode switching and localStorage persistence
 */
export const ThemeProvider = ({ children }) => {
  // Initialize theme from localStorage or system preference
  const [theme, setTheme] = useState(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem('amdox-theme');
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      return savedTheme;
    }
    
    // Fall back to system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  });

  const [isTransitioning, setIsTransitioning] = useState(false);

  /**
   * Apply theme to document and persist to localStorage
   */
  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
    
    // Persist to localStorage
    localStorage.setItem('amdox-theme', theme);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#1a1a1a' : '#ffffff');
    }
  }, [theme]);

  /**
   * Listen for system theme changes
   */
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e) => {
      // Only update if user hasn't manually set a preference
      const savedTheme = localStorage.getItem('amdox-theme');
      if (!savedTheme) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);

  /**
   * Toggle between light and dark themes with smooth transition
   */
  const toggleTheme = () => {
    setIsTransitioning(true);
    
    // Add transition class to document for smooth theme switching
    document.documentElement.classList.add('theme-transitioning');
    
    // Toggle theme
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    
    // Remove transition class after animation completes
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
      setIsTransitioning(false);
    }, 300);
  };

  /**
   * Set specific theme
   */
  const setSpecificTheme = (newTheme) => {
    if (newTheme !== 'light' && newTheme !== 'dark') {
      console.warn('Invalid theme:', newTheme, 'Must be "light" or "dark"');
      return;
    }
    
    if (newTheme === theme) return;
    
    setIsTransitioning(true);
    document.documentElement.classList.add('theme-transitioning');
    
    setTheme(newTheme);
    
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
      setIsTransitioning(false);
    }, 300);
  };

  /**
   * Reset theme to system preference
   */
  const resetToSystemTheme = () => {
    localStorage.removeItem('amdox-theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    setSpecificTheme(systemTheme);
  };

  /**
   * Get current system theme preference
   */
  const getSystemTheme = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  /**
   * Check if current theme matches system preference
   */
  const isSystemTheme = () => {
    return theme === getSystemTheme() && !localStorage.getItem('amdox-theme');
  };

  const value = {
    theme,
    toggleTheme,
    setTheme: setSpecificTheme,
    resetToSystemTheme,
    getSystemTheme,
    isSystemTheme,
    isTransitioning,
    isDark: theme === 'dark',
    isLight: theme === 'light'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * useTheme Hook
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;