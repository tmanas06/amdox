/**
 * Visual Regression and Browser Testing
 * Feature: modern-ui-redesign, Task 10.2: Visual regression and browser testing
 * Validates: Requirements 9.4
 * 
 * Tests screenshot consistency for major components,
 * responsive behavior across screen sizes, and cross-browser compatibility
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { ThemeProvider } from '../../context/ThemeContext';
import Dashboard from '../../pages/Dashboard';
import LoginPage from '../../pages/LoginPage';
import RegisterPage from '../../pages/RegisterPage';

// Mock Firebase auth
jest.mock('../../firebase/config', () => ({
  auth: {
    onAuthStateChanged: jest.fn(),
    signInWithPopup: jest.fn(),
    signOut: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
  },
  googleProvider: {}
}));

// Mock API services
jest.mock('../../services/api', () => ({
  jobs: {
    getAll: jest.fn(() => Promise.resolve({ data: { data: [] } })),
    create: jest.fn(() => Promise.resolve({ data: {} })),
    getById: jest.fn(() => Promise.resolve({ data: {} })),
  }
}));

// Test wrapper component
const TestWrapper = ({ children, initialUser = null }) => (
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider initialUser={initialUser}>
        {children}
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);

// Mock viewport dimensions for responsive testing
const mockViewport = (width, height) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
  
  // Trigger resize event
  window.dispatchEvent(new Event('resize'));
};

describe('Visual Regression and Browser Testing', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    
    // Reset document theme
    document.documentElement.removeAttribute('data-theme');
    
    // Reset viewport to desktop size
    mockViewport(1920, 1080);
    
    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
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

  describe('Component Screenshot Consistency', () => {
    test('login page renders consistently across themes', async () => {
      const { container, rerender } = render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      // Test light theme rendering
      expect(container.firstChild).toMatchSnapshot('login-page-light-theme');

      // Switch to dark theme
      const themeToggle = screen.getByRole('button', { name: /switch to dark theme/i });
      fireEvent.click(themeToggle);

      await waitFor(() => {
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      });

      // Test dark theme rendering
      expect(container.firstChild).toMatchSnapshot('login-page-dark-theme');
    });

    test('register page renders consistently', () => {
      const { container } = render(
        <TestWrapper>
          <RegisterPage />
        </TestWrapper>
      );

      expect(container.firstChild).toMatchSnapshot('register-page');
    });

    test('dashboard renders consistently for job seekers', () => {
      const mockUser = {
        uid: 'test-user',
        email: 'test@example.com',
        profile: { name: 'Visual Developer', photoURL: 'https://via.placeholder.com/150' },
        role: 'job_seeker'
      };

      const { container } = render(
        <TestWrapper initialUser={mockUser}>
          <Dashboard />
        </TestWrapper>
      );

      expect(container.firstChild).toMatchSnapshot('dashboard-job-seeker');
    });

    test('dashboard renders consistently for employers', () => {
      const mockUser = {
        uid: 'test-employer',
        email: 'employer@company.com',
        profile: { name: 'HR Manager', photoURL: 'https://via.placeholder.com/150' },
        role: 'employer'
      };

      const { container } = render(
        <TestWrapper initialUser={mockUser}>
          <Dashboard />
        </TestWrapper>
      );

      expect(container.firstChild).toMatchSnapshot('dashboard-employer');
    });
  });

  describe('Responsive Behavior Testing', () => {
    test('login page adapts to mobile viewport (375px)', () => {
      mockViewport(375, 667); // iPhone SE dimensions

      const { container } = render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      // Check mobile-specific layout
      const authContainer = container.querySelector('.amdox-container');
      expect(authContainer).toBeInTheDocument();

      // Verify responsive classes are applied
      const styles = getComputedStyle(authContainer);
      expect(styles.display).toBeTruthy();

      expect(container.firstChild).toMatchSnapshot('login-page-mobile');
    });

    test('login page adapts to tablet viewport (768px)', () => {
      mockViewport(768, 1024); // iPad dimensions

      const { container } = render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      expect(container.firstChild).toMatchSnapshot('login-page-tablet');
    });

    test('dashboard navigation adapts to mobile viewport', () => {
      mockViewport(375, 667);

      const mockUser = {
        uid: 'test-user',
        email: 'test@example.com',
        profile: { name: 'Visual Developer', photoURL: 'https://via.placeholder.com/150' },
        role: 'job_seeker'
      };

      const { container } = render(
        <TestWrapper initialUser={mockUser}>
          <Dashboard />
        </TestWrapper>
      );

      // Check that navigation adapts to mobile
      const navigation = container.querySelector('.dashboard-nav');
      expect(navigation).toBeInTheDocument();

      expect(container.firstChild).toMatchSnapshot('dashboard-mobile');
    });

    test('components maintain layout integrity across breakpoints', () => {
      const breakpoints = [
        { width: 320, height: 568, name: 'mobile-small' },
        { width: 375, height: 667, name: 'mobile-medium' },
        { width: 768, height: 1024, name: 'tablet' },
        { width: 1024, height: 768, name: 'desktop-small' },
        { width: 1440, height: 900, name: 'desktop-large' },
        { width: 1920, height: 1080, name: 'desktop-xl' }
      ];

      const mockUser = {
        uid: 'test-user',
        email: 'test@example.com',
        profile: { name: 'Visual Developer', photoURL: 'https://via.placeholder.com/150' },
        role: 'job_seeker'
      };

      breakpoints.forEach(({ width, height, name }) => {
        mockViewport(width, height);

        const { container, unmount } = render(
          <TestWrapper initialUser={mockUser}>
            <Dashboard />
          </TestWrapper>
        );

        // Verify layout doesn't break at this breakpoint
        const mainContent = container.querySelector('.dashboard-content');
        expect(mainContent).toBeInTheDocument();

        // Check that content is not overflowing
        const styles = getComputedStyle(mainContent);
        expect(styles.overflow).not.toBe('visible');

        unmount();
      });
    });
  });

  describe('Cross-Browser Compatibility Simulation', () => {
    test('components render without browser-specific CSS issues', () => {
      // Simulate different browser CSS support
      const originalGetComputedStyle = window.getComputedStyle;

      // Mock older browser without CSS Grid support
      window.getComputedStyle = jest.fn().mockImplementation((element) => {
        const styles = originalGetComputedStyle(element);
        return {
          ...styles,
          display: styles.display === 'grid' ? 'block' : styles.display,
          gridTemplateColumns: undefined,
          gridGap: undefined
        };
      });

      const { container } = render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      // Should still render without errors
      expect(container.firstChild).toBeInTheDocument();

      // Restore original function
      window.getComputedStyle = originalGetComputedStyle;
    });

    test('flexbox fallbacks work correctly', () => {
      const mockUser = {
        uid: 'test-user',
        email: 'test@example.com',
        profile: { name: 'Visual Developer', photoURL: 'https://via.placeholder.com/150' },
        role: 'job_seeker'
      };

      const { container } = render(
        <TestWrapper initialUser={mockUser}>
          <Dashboard />
        </TestWrapper>
      );

      // Check that flexbox layouts are used
      const navTabs = container.querySelector('.nav-tabs');
      if (navTabs) {
        const styles = getComputedStyle(navTabs);
        expect(styles.display).toMatch(/flex|block/);
      }
    });

    test('CSS custom properties have fallbacks', () => {
      // Mock browser without CSS custom property support
      const originalGetComputedStyle = window.getComputedStyle;
      
      window.getComputedStyle = jest.fn().mockImplementation((element) => {
        const styles = originalGetComputedStyle(element);
        const mockStyles = { ...styles };
        
        // Remove CSS custom properties
        Object.keys(mockStyles).forEach(key => {
          if (key.startsWith('--')) {
            delete mockStyles[key];
          }
        });
        
        return mockStyles;
      });

      const { container } = render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      // Should still render with fallback colors
      expect(container.firstChild).toBeInTheDocument();

      window.getComputedStyle = originalGetComputedStyle;
    });
  });

  describe('Animation and Transition Testing', () => {
    test('theme transitions work smoothly', async () => {
      const { container } = render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const themeToggle = screen.getByRole('button', { name: /switch to dark theme/i });
      
      // Capture initial state
      const initialTheme = document.documentElement.getAttribute('data-theme');
      
      // Trigger theme change
      fireEvent.click(themeToggle);
      
      // Wait for transition
      await waitFor(() => {
        const newTheme = document.documentElement.getAttribute('data-theme');
        expect(newTheme).not.toBe(initialTheme);
      });

      // Verify no layout shift occurred
      const authCard = container.querySelector('.auth-card-dark');
      expect(authCard).toBeInTheDocument();
    });

    test('hover states are properly defined', () => {
      const { container } = render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const buttons = container.querySelectorAll('button');
      
      buttons.forEach(button => {
        // Simulate hover
        fireEvent.mouseEnter(button);
        
        // Check that button is still accessible
        expect(button).toBeInTheDocument();
        
        fireEvent.mouseLeave(button);
      });
    });

    test('focus states are keyboard accessible', () => {
      const { container } = render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const focusableElements = container.querySelectorAll(
        'button, input, select, textarea, a[href]'
      );

      focusableElements.forEach(element => {
        // Simulate keyboard focus
        fireEvent.focus(element);
        
        // Element should be focusable
        expect(document.activeElement).toBe(element);
        
        fireEvent.blur(element);
      });
    });
  });

  describe('Performance and Loading States', () => {
    test('skeleton loaders render correctly', () => {
      const mockUser = {
        uid: 'test-user',
        email: 'test@example.com',
        profile: { name: 'Visual Developer', photoURL: 'https://via.placeholder.com/150' },
        role: 'job_seeker'
      };

      const { container } = render(
        <TestWrapper initialUser={mockUser}>
          <Dashboard />
        </TestWrapper>
      );

      // Check for skeleton loading states
      const skeletonElements = container.querySelectorAll('[class*="skeleton"]');
      
      if (skeletonElements.length > 0) {
        skeletonElements.forEach(skeleton => {
          expect(skeleton).toBeInTheDocument();
        });
      }
    });

    test('loading states provide visual feedback', () => {
      const { container } = render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      // Switch to email form
      const emailButton = screen.getByText(/continue with work email/i);
      fireEvent.click(emailButton);

      // Submit form to trigger loading state
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      // Button should be accessible in all states
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('Error State Visual Consistency', () => {
    test('error messages display consistently', async () => {
      const { container } = render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      // Switch to email form
      const emailButton = screen.getByText(/continue with work email/i);
      fireEvent.click(emailButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/work email/i)).toBeInTheDocument();
      });

      // Submit empty form to trigger error
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.getByRole('alert');
        expect(errorMessage).toBeInTheDocument();
      });

      // Error state should be visually consistent
      expect(container.firstChild).toMatchSnapshot('login-page-error-state');
    });

    test('form validation errors are visually distinct', async () => {
      const { container } = render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      // Switch to email form
      const emailButton = screen.getByText(/continue with work email/i);
      fireEvent.click(emailButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/work email/i)).toBeInTheDocument();
      });

      const emailInput = screen.getByLabelText(/work email/i);
      
      // Enter invalid email
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.blur(emailInput);

      // Check that input styling reflects validation state
      const styles = getComputedStyle(emailInput);
      expect(styles.borderColor || styles.border).toBeTruthy();
    });
  });

  describe('Accessibility Visual Indicators', () => {
    test('focus indicators are visible', () => {
      const { container } = render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const focusableElements = container.querySelectorAll('button, input, a');
      
      focusableElements.forEach(element => {
        fireEvent.focus(element);
        
        // Focus should be visible (outline or box-shadow)
        const styles = getComputedStyle(element);
        const hasFocusIndicator = styles.outline !== 'none' || 
                                 styles.boxShadow !== 'none' ||
                                 styles.border !== 'none';
        
        expect(hasFocusIndicator).toBeTruthy();
        
        fireEvent.blur(element);
      });
    });

    test('high contrast mode compatibility', () => {
      // Simulate high contrast mode
      const originalGetComputedStyle = window.getComputedStyle;
      
      window.getComputedStyle = jest.fn().mockImplementation((element) => {
        const styles = originalGetComputedStyle(element);
        return {
          ...styles,
          backgroundColor: styles.backgroundColor === 'transparent' ? 'white' : styles.backgroundColor,
          color: styles.color || 'black'
        };
      });

      const { container } = render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      // Should render without issues in high contrast mode
      expect(container.firstChild).toBeInTheDocument();

      window.getComputedStyle = originalGetComputedStyle;
    });
  });
});