/**
 * Cross-Component Integration Tests
 * Feature: modern-ui-redesign, Task 10.1: Cross-component integration testing
 * Validates: Requirements 7.4
 * 
 * Tests consistent styling across all pages and components,
 * navigation flows with new visual design, and interactive elements
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { ThemeProvider } from '../../context/ThemeContext';
import App from '../../App';
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

describe('Cross-Component Integration Tests', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    
    // Reset document theme
    document.documentElement.removeAttribute('data-theme');
    
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

  describe('Design System Consistency Across Components', () => {
    test('all pages use consistent color palette from design tokens', () => {
      const pages = [
        { component: LoginPage, name: 'LoginPage' },
        { component: RegisterPage, name: 'RegisterPage' }
      ];

      pages.forEach(({ component: Component, name }) => {
        const { container } = render(
          <TestWrapper>
            <Component />
          </TestWrapper>
        );

        // Check for design system CSS custom properties usage
        const styles = getComputedStyle(container.firstChild);
        
        // Verify no legacy blue gradients are present
        const allElements = container.querySelectorAll('*');
        allElements.forEach(element => {
          const elementStyles = getComputedStyle(element);
          const backgroundImage = elementStyles.backgroundImage;
          
          // Should not contain legacy blue gradient colors
          expect(backgroundImage).not.toMatch(/#667eea/i);
          expect(backgroundImage).not.toMatch(/#764ba2/i);
          expect(backgroundImage).not.toMatch(/#3b82f6/i);
        });
      });
    });

    test('theme toggle component works consistently across all pages', async () => {
      const mockUser = {
        uid: 'test-user',
        email: 'test@example.com',
        profile: { name: 'Visual Developer', photoURL: 'https://via.placeholder.com/150' },
        role: 'job_seeker'
      };

      // Test theme toggle on Dashboard
      render(
        <TestWrapper initialUser={mockUser}>
          <Dashboard />
        </TestWrapper>
      );

      const themeToggle = screen.getByRole('button', { name: /switch to dark theme/i });
      expect(themeToggle).toBeInTheDocument();

      // Initial theme should be light
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');

      // Toggle to dark theme
      fireEvent.click(themeToggle);
      
      await waitFor(() => {
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      });

      // Toggle back to light theme
      fireEvent.click(themeToggle);
      
      await waitFor(() => {
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      });
    });

    test('interactive elements maintain consistent hover and focus states', () => {
      const { container } = render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      // Find all interactive elements (buttons, links, inputs)
      const buttons = container.querySelectorAll('button');
      const links = container.querySelectorAll('a');
      const inputs = container.querySelectorAll('input');

      // Test buttons have consistent styling
      buttons.forEach(button => {
        const styles = getComputedStyle(button);
        
        // Should have transition for smooth interactions
        expect(styles.transition).toBeTruthy();
        
        // Should have border-radius for modern styling
        const borderRadius = parseFloat(styles.borderRadius);
        expect(borderRadius).toBeGreaterThan(0);
      });

      // Test inputs have consistent styling
      inputs.forEach(input => {
        const styles = getComputedStyle(input);
        
        // Should have transition for focus states
        expect(styles.transition).toBeTruthy();
        
        // Should have border-radius for modern styling
        const borderRadius = parseFloat(styles.borderRadius);
        expect(borderRadius).toBeGreaterThan(0);
      });
    });
  });

  describe('Navigation Flow Integration', () => {
    test('navigation between pages maintains visual consistency', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Should start on login page (unauthenticated)
      expect(screen.getByText(/welcome back/i)).toBeInTheDocument();

      // Navigate to register page
      const registerLink = screen.getByRole('link', { name: /sign up/i });
      fireEvent.click(registerLink);

      await waitFor(() => {
        expect(screen.getByText(/create account/i)).toBeInTheDocument();
      });

      // Navigate back to login
      const loginLink = screen.getByRole('link', { name: /sign in/i });
      fireEvent.click(loginLink);

      await waitFor(() => {
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
      });

      // Verify consistent header across pages
      const headers = screen.getAllByText(/amdox jobs/i);
      expect(headers.length).toBeGreaterThan(0);
    });

    test('dashboard navigation tabs work correctly with visual feedback', async () => {
      const mockUser = {
        uid: 'test-user',
        email: 'test@example.com',
        profile: { name: 'Visual Developer', photoURL: 'https://via.placeholder.com/150' },
        role: 'job_seeker'
      };

      render(
        <TestWrapper initialUser={mockUser}>
          <Dashboard />
        </TestWrapper>
      );

      // Should start on overview tab
      expect(screen.getByText(/dashboard overview/i)).toBeInTheDocument();

      // Navigate to jobs tab
      const jobsTab = screen.getByRole('tab', { name: /browse jobs/i });
      fireEvent.click(jobsTab);

      await waitFor(() => {
        expect(jobsTab).toHaveAttribute('aria-selected', 'true');
      });

      // Navigate to profile tab
      const profileTab = screen.getByRole('tab', { name: /profile/i });
      fireEvent.click(profileTab);

      await waitFor(() => {
        expect(profileTab).toHaveAttribute('aria-selected', 'true');
        expect(jobsTab).toHaveAttribute('aria-selected', 'false');
      });
    });
  });

  describe('Interactive Elements Consistency', () => {
    test('all buttons follow consistent design patterns', () => {
      const { container } = render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const primaryButtons = container.querySelectorAll('.work-email-btn-dark, .google-btn-dark, .submit-btn-dark');
      const secondaryButtons = container.querySelectorAll('.cancel-btn-dark');

      // Primary buttons should have consistent styling
      primaryButtons.forEach(button => {
        const styles = getComputedStyle(button);
        
        // Should have background (gradient or solid color)
        expect(styles.backgroundColor || styles.backgroundImage).toBeTruthy();
        
        // Should have consistent padding
        expect(styles.padding).toBeTruthy();
        
        // Should have consistent border-radius
        const borderRadius = parseFloat(styles.borderRadius);
        expect(borderRadius).toBeGreaterThan(0);
      });

      // Secondary buttons should have consistent styling
      secondaryButtons.forEach(button => {
        const styles = getComputedStyle(button);
        
        // Should have consistent styling patterns
        expect(styles.padding).toBeTruthy();
        expect(parseFloat(styles.borderRadius)).toBeGreaterThan(0);
      });
    });

    test('form inputs maintain consistent validation styling', async () => {
      render(
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
      const passwordInput = screen.getByLabelText(/password/i);

      // Test input styling consistency
      [emailInput, passwordInput].forEach(input => {
        const styles = getComputedStyle(input);
        
        // Should have consistent border styling
        expect(styles.border).toBeTruthy();
        
        // Should have consistent padding
        expect(styles.padding).toBeTruthy();
        
        // Should have border-radius for modern styling
        const borderRadius = parseFloat(styles.borderRadius);
        expect(borderRadius).toBeGreaterThan(0);
      });
    });

    test('loading states provide consistent visual feedback', async () => {
      const mockUser = {
        uid: 'test-user',
        email: 'test@example.com',
        profile: { name: 'Visual Developer', photoURL: 'https://via.placeholder.com/150' },
        role: 'job_seeker'
      };

      render(
        <TestWrapper initialUser={mockUser}>
          <Dashboard />
        </TestWrapper>
      );

      // Check for loading states in dashboard
      const loadingElements = screen.queryAllByText(/loading/i);
      
      // Should have loading indicators where appropriate
      if (loadingElements.length > 0) {
        loadingElements.forEach(element => {
          expect(element).toHaveAttribute('role', 'status');
        });
      }
    });
  });

  describe('Accessibility Integration', () => {
    test('all pages maintain consistent ARIA labeling', () => {
      const pages = [
        { component: LoginPage, name: 'LoginPage' },
        { component: RegisterPage, name: 'RegisterPage' }
      ];

      pages.forEach(({ component: Component, name }) => {
        const { container } = render(
          <TestWrapper>
            <Component />
          </TestWrapper>
        );

        // Check for proper heading hierarchy
        const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
        expect(headings.length).toBeGreaterThan(0);

        // Check for proper form labeling
        const inputs = container.querySelectorAll('input');
        inputs.forEach(input => {
          const label = container.querySelector(`label[for="${input.id}"]`);
          const ariaLabel = input.getAttribute('aria-label');
          const ariaLabelledBy = input.getAttribute('aria-labelledby');
          
          // Each input should have proper labeling
          expect(label || ariaLabel || ariaLabelledBy).toBeTruthy();
        });

        // Check for proper button labeling
        const buttons = container.querySelectorAll('button');
        buttons.forEach(button => {
          const hasText = button.textContent.trim().length > 0;
          const hasAriaLabel = button.getAttribute('aria-label');
          
          // Each button should have accessible text
          expect(hasText || hasAriaLabel).toBeTruthy();
        });
      });
    });

    test('keyboard navigation works consistently across components', async () => {
      const mockUser = {
        uid: 'test-user',
        email: 'test@example.com',
        profile: { name: 'Visual Developer', photoURL: 'https://via.placeholder.com/150' },
        role: 'job_seeker'
      };

      render(
        <TestWrapper initialUser={mockUser}>
          <Dashboard />
        </TestWrapper>
      );

      // Test tab navigation through dashboard tabs
      const tabs = screen.getAllByRole('tab');
      
      // First tab should be focusable
      expect(tabs[0]).toHaveAttribute('tabIndex', '0');
      
      // Other tabs should not be in tab order initially
      for (let i = 1; i < tabs.length; i++) {
        expect(tabs[i]).toHaveAttribute('tabIndex', '-1');
      }

      // Simulate keyboard navigation
      fireEvent.keyDown(tabs[0], { key: 'ArrowRight' });
      
      // Should move focus to next tab
      await waitFor(() => {
        expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
      });
    });
  });

  describe('Performance Integration', () => {
    test('components render without performance warnings', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      // Should not have React performance warnings
      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringMatching(/Warning.*performance/i)
      );

      consoleSpy.mockRestore();
    });

    test('theme switching does not cause layout shifts', async () => {
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

      // Measure initial layout
      const initialHeight = container.firstChild.offsetHeight;
      const initialWidth = container.firstChild.offsetWidth;

      // Toggle theme
      const themeToggle = screen.getByRole('button', { name: /switch to dark theme/i });
      fireEvent.click(themeToggle);

      await waitFor(() => {
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      });

      // Layout should remain stable
      expect(container.firstChild.offsetHeight).toBe(initialHeight);
      expect(container.firstChild.offsetWidth).toBe(initialWidth);
    });
  });

  describe('Error State Integration', () => {
    test('error states maintain consistent styling across components', async () => {
      render(
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

      // Submit form without filling fields to trigger error
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.getByRole('alert');
        expect(errorMessage).toBeInTheDocument();
        
        // Error message should have consistent styling
        const styles = getComputedStyle(errorMessage);
        expect(styles.color).toBeTruthy();
        expect(styles.padding).toBeTruthy();
      });
    });
  });
});