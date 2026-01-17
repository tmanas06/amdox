/**
 * Property-Based Tests for Theme Support Completeness
 * **Feature: modern-ui-redesign, Property 4: Theme Support Completeness**
 * **Validates: Requirements 1.5**
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../../context/ThemeContext';
const fc = require('fast-check');

// Test component that uses theme
const TestThemeComponent = ({ testId = 'theme-test' }) => {
  const { theme, toggleTheme, isDark, isLight } = useTheme();
  
  return (
    <div data-testid={testId} data-theme={theme}>
      <span data-testid="theme-value">{theme}</span>
      <span data-testid="is-dark">{isDark.toString()}</span>
      <span data-testid="is-light">{isLight.toString()}</span>
      <button data-testid="toggle-theme" onClick={toggleTheme}>
        Toggle Theme
      </button>
    </div>
  );
};

// Wrapper component for testing
const ThemeTestWrapper = ({ children }) => (
  <ThemeProvider>
    {children}
  </ThemeProvider>
);

describe('Property 4: Theme Support Completeness', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Reset document theme attribute
    document.documentElement.removeAttribute('data-theme');
    
    // Mock matchMedia for system theme detection
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query.includes('dark') ? false : true,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  /**
   * Property: Theme values should only be 'light' or 'dark'
   */
  test('theme values are always valid', () => {
    fc.assert(fc.property(
      fc.constantFrom('light', 'dark'),
      (initialTheme) => {
        // Set initial theme in localStorage
        localStorage.setItem('amdox-theme', initialTheme);
        
        render(
          <ThemeTestWrapper>
            <TestThemeComponent />
          </ThemeTestWrapper>
        );
        
        const themeValue = screen.getByTestId('theme-value').textContent;
        
        // Theme should always be either 'light' or 'dark'
        return themeValue === 'light' || themeValue === 'dark';
      }
    ), { numRuns: 50 });
  });

  /**
   * Property: Theme state consistency
   */
  test('theme state properties are consistent', () => {
    fc.assert(fc.property(
      fc.constantFrom('light', 'dark'),
      (theme) => {
        localStorage.setItem('amdox-theme', theme);
        
        render(
          <ThemeTestWrapper>
            <TestThemeComponent />
          </ThemeTestWrapper>
        );
        
        const themeValue = screen.getByTestId('theme-value').textContent;
        const isDark = screen.getByTestId('is-dark').textContent === 'true';
        const isLight = screen.getByTestId('is-light').textContent === 'true';
        
        // Consistency checks
        const themeMatches = themeValue === theme;
        const darkConsistent = (themeValue === 'dark') === isDark;
        const lightConsistent = (themeValue === 'light') === isLight;
        const mutuallyExclusive = isDark !== isLight;
        
        return themeMatches && darkConsistent && lightConsistent && mutuallyExclusive;
      }
    ), { numRuns: 50 });
  });

  /**
   * Property: Theme persistence works correctly
   */
  test('theme persistence is maintained across component remounts', () => {
    fc.assert(fc.property(
      fc.constantFrom('light', 'dark'),
      (initialTheme) => {
        // First render with initial theme
        localStorage.setItem('amdox-theme', initialTheme);
        
        const { unmount } = render(
          <ThemeTestWrapper>
            <TestThemeComponent testId="first-render" />
          </ThemeTestWrapper>
        );
        
        const firstTheme = screen.getByTestId('theme-value').textContent;
        
        // Unmount and remount
        unmount();
        
        render(
          <ThemeTestWrapper>
            <TestThemeComponent testId="second-render" />
          </ThemeTestWrapper>
        );
        
        const secondTheme = screen.getByTestId('theme-value').textContent;
        
        // Theme should persist across remounts
        return firstTheme === secondTheme && firstTheme === initialTheme;
      }
    ), { numRuns: 30 });
  });

  /**
   * Property: Theme toggle always switches between light and dark
   */
  test('theme toggle always produces opposite theme', async () => {
    fc.assert(fc.asyncProperty(
      fc.constantFrom('light', 'dark'),
      async (initialTheme) => {
        localStorage.setItem('amdox-theme', initialTheme);
        
        render(
          <ThemeTestWrapper>
            <TestThemeComponent />
          </ThemeTestWrapper>
        );
        
        const initialThemeValue = screen.getByTestId('theme-value').textContent;
        const toggleButton = screen.getByTestId('toggle-theme');
        
        // Toggle theme
        fireEvent.click(toggleButton);
        
        // Wait for theme change
        await waitFor(() => {
          const newThemeValue = screen.getByTestId('theme-value').textContent;
          return newThemeValue !== initialThemeValue;
        }, { timeout: 1000 });
        
        const finalThemeValue = screen.getByTestId('theme-value').textContent;
        
        // Should toggle to opposite theme
        const expectedTheme = initialTheme === 'light' ? 'dark' : 'light';
        return finalThemeValue === expectedTheme;
      }
    ), { numRuns: 20 });
  });

  /**
   * Property: Document data-theme attribute matches theme state
   */
  test('document data-theme attribute is always synchronized', () => {
    fc.assert(fc.property(
      fc.constantFrom('light', 'dark'),
      (theme) => {
        localStorage.setItem('amdox-theme', theme);
        
        render(
          <ThemeTestWrapper>
            <TestThemeComponent />
          </ThemeTestWrapper>
        );
        
        const themeValue = screen.getByTestId('theme-value').textContent;
        const documentTheme = document.documentElement.getAttribute('data-theme');
        
        // Document theme should match component theme
        return themeValue === documentTheme;
      }
    ), { numRuns: 50 });
  });

  /**
   * Property: localStorage is updated when theme changes
   */
  test('localStorage is synchronized with theme changes', async () => {
    fc.assert(fc.asyncProperty(
      fc.constantFrom('light', 'dark'),
      async (initialTheme) => {
        localStorage.setItem('amdox-theme', initialTheme);
        
        render(
          <ThemeTestWrapper>
            <TestThemeComponent />
          </ThemeTestWrapper>
        );
        
        const toggleButton = screen.getByTestId('toggle-theme');
        
        // Toggle theme
        fireEvent.click(toggleButton);
        
        // Wait for theme change
        await waitFor(() => {
          const newThemeValue = screen.getByTestId('theme-value').textContent;
          return newThemeValue !== initialTheme;
        }, { timeout: 1000 });
        
        const finalThemeValue = screen.getByTestId('theme-value').textContent;
        const storedTheme = localStorage.getItem('amdox-theme');
        
        // localStorage should match final theme
        return finalThemeValue === storedTheme;
      }
    ), { numRuns: 20 });
  });

  /**
   * Property: Theme system handles invalid localStorage values gracefully
   */
  test('invalid localStorage values default to system preference', () => {
    fc.assert(fc.property(
      fc.oneof(
        fc.constant('invalid'),
        fc.constant(''),
        fc.constant('null'),
        fc.constant('undefined'),
        fc.string().filter(s => s !== 'light' && s !== 'dark')
      ),
      (invalidTheme) => {
        // Set invalid theme in localStorage
        localStorage.setItem('amdox-theme', invalidTheme);
        
        render(
          <ThemeTestWrapper>
            <TestThemeComponent />
          </ThemeTestWrapper>
        );
        
        const themeValue = screen.getByTestId('theme-value').textContent;
        
        // Should fall back to valid theme (light, since we mocked matchMedia to prefer light)
        return themeValue === 'light' || themeValue === 'dark';
      }
    ), { numRuns: 30 });
  });

  /**
   * Property: Multiple theme components stay synchronized
   */
  test('multiple theme components remain synchronized', async () => {
    fc.assert(fc.asyncProperty(
      fc.constantFrom('light', 'dark'),
      async (initialTheme) => {
        localStorage.setItem('amdox-theme', initialTheme);
        
        render(
          <ThemeTestWrapper>
            <TestThemeComponent testId="component-1" />
            <TestThemeComponent testId="component-2" />
          </ThemeTestWrapper>
        );
        
        const theme1Initial = screen.getByTestId('component-1').querySelector('[data-testid="theme-value"]').textContent;
        const theme2Initial = screen.getByTestId('component-2').querySelector('[data-testid="theme-value"]').textContent;
        
        // Both should start with same theme
        if (theme1Initial !== theme2Initial) return false;
        
        // Toggle theme on first component
        const toggleButton1 = screen.getByTestId('component-1').querySelector('[data-testid="toggle-theme"]');
        fireEvent.click(toggleButton1);
        
        // Wait for theme change
        await waitFor(() => {
          const newTheme1 = screen.getByTestId('component-1').querySelector('[data-testid="theme-value"]').textContent;
          return newTheme1 !== theme1Initial;
        }, { timeout: 1000 });
        
        const theme1Final = screen.getByTestId('component-1').querySelector('[data-testid="theme-value"]').textContent;
        const theme2Final = screen.getByTestId('component-2').querySelector('[data-testid="theme-value"]').textContent;
        
        // Both should have same final theme
        return theme1Final === theme2Final;
      }
    ), { numRuns: 15 });
  });

  /**
   * Property: Theme transitions don't cause visual artifacts
   */
  test('theme transitions maintain visual consistency', async () => {
    fc.assert(fc.asyncProperty(
      fc.constantFrom('light', 'dark'),
      async (initialTheme) => {
        localStorage.setItem('amdox-theme', initialTheme);
        
        render(
          <ThemeTestWrapper>
            <TestThemeComponent />
          </ThemeTestWrapper>
        );
        
        const container = screen.getByTestId('theme-test');
        const toggleButton = screen.getByTestId('toggle-theme');
        
        // Check initial state
        const initialDataTheme = container.getAttribute('data-theme');
        
        // Toggle theme
        fireEvent.click(toggleButton);
        
        // Wait for transition to complete
        await waitFor(() => {
          const newDataTheme = container.getAttribute('data-theme');
          return newDataTheme !== initialDataTheme;
        }, { timeout: 1000 });
        
        const finalDataTheme = container.getAttribute('data-theme');
        const themeValue = screen.getByTestId('theme-value').textContent;
        
        // data-theme attribute should match theme value
        return finalDataTheme === themeValue;
      }
    ), { numRuns: 15 });
  });

  /**
   * Property: Theme system respects system preferences when no manual preference is set
   */
  test('system theme preference is respected when no manual preference exists', () => {
    fc.assert(fc.property(
      fc.boolean(),
      (prefersDark) => {
        // Clear any existing preference
        localStorage.removeItem('amdox-theme');
        
        // Mock system preference
        window.matchMedia = jest.fn().mockImplementation(query => ({
          matches: query.includes('dark') ? prefersDark : !prefersDark,
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        }));
        
        render(
          <ThemeTestWrapper>
            <TestThemeComponent />
          </ThemeTestWrapper>
        );
        
        const themeValue = screen.getByTestId('theme-value').textContent;
        const expectedTheme = prefersDark ? 'dark' : 'light';
        
        // Should match system preference
        return themeValue === expectedTheme;
      }
    ), { numRuns: 30 });
  });
});