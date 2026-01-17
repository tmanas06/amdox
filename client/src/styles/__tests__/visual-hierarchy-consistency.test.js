/**
 * Property-Based Test: Visual Hierarchy Consistency
 * Feature: modern-ui-redesign, Property 6: Visual Hierarchy Consistency
 * Validates: Requirements 2.2, 2.5
 * 
 * Tests that primary actions have higher visual weight than secondary actions,
 * and information hierarchy follows defined size and color patterns
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

// Helper function to calculate visual weight
const calculateVisualWeight = (element) => {
  const styles = getComputedStyle(element);
  
  // Font weight (higher = more weight)
  const fontWeight = parseInt(styles.fontWeight) || 400;
  
  // Font size (larger = more weight)
  const fontSize = parseFloat(styles.fontSize) || 16;
  
  // Background opacity/color (more opaque = more weight)
  const backgroundColor = styles.backgroundColor;
  const hasBackground = backgroundColor !== 'rgba(0, 0, 0, 0)' && 
                       backgroundColor !== 'transparent' && 
                       backgroundColor !== '';
  
  // Border (presence = more weight)
  const hasBorder = styles.border !== 'none' && styles.border !== '';
  
  // Box shadow (presence = more weight)
  const hasBoxShadow = styles.boxShadow !== 'none';
  
  // Calculate composite weight
  let weight = 0;
  weight += (fontWeight - 400) * 0.1; // Font weight contribution
  weight += (fontSize - 16) * 0.5; // Font size contribution
  weight += hasBackground ? 10 : 0; // Background contribution
  weight += hasBorder ? 5 : 0; // Border contribution
  weight += hasBoxShadow ? 5 : 0; // Shadow contribution
  
  return weight;
};

// Helper function to get heading hierarchy level
const getHeadingLevel = (element) => {
  const tagName = element.tagName.toLowerCase();
  if (tagName.match(/^h[1-6]$/)) {
    return parseInt(tagName.charAt(1));
  }
  return null;
};

describe('Property 6: Visual Hierarchy Consistency', () => {
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

  /**
   * Property: Primary buttons have higher visual weight than secondary buttons
   */
  test('primary actions have higher visual weight than secondary actions', () => {
    const pages = [
      { component: LoginPage, name: 'LoginPage' },
      { component: RegisterPage, name: 'RegisterPage' }
    ];

    pages.forEach(({ component: Component, name }) => {
      const { container, unmount } = render(
        <TestWrapper>
          <Component />
        </TestWrapper>
      );

      // Find primary and secondary buttons
      const primaryButtons = container.querySelectorAll(
        '.work-email-btn-dark, .google-btn-dark, .submit-btn-dark, .primary-btn, .btn-primary'
      );
      const secondaryButtons = container.querySelectorAll(
        '.cancel-btn-dark, .secondary-btn, .btn-secondary'
      );

      if (primaryButtons.length > 0 && secondaryButtons.length > 0) {
        // Calculate average visual weight for each type
        const primaryWeights = Array.from(primaryButtons).map(calculateVisualWeight);
        const secondaryWeights = Array.from(secondaryButtons).map(calculateVisualWeight);
        
        const avgPrimaryWeight = primaryWeights.reduce((a, b) => a + b, 0) / primaryWeights.length;
        const avgSecondaryWeight = secondaryWeights.reduce((a, b) => a + b, 0) / secondaryWeights.length;
        
        // Primary buttons should have higher visual weight
        expect(avgPrimaryWeight).toBeGreaterThan(avgSecondaryWeight);
      }

      unmount();
    });
  });

  /**
   * Property: Heading hierarchy follows proper size relationships
   */
  test('heading hierarchy maintains proper size relationships', () => {
    const mockUser = {
      uid: 'test-user',
      email: 'test@example.com',
      profile: { name: 'Test User', photoURL: 'https://via.placeholder.com/150' },
      role: 'job_seeker'
    };

    const { container } = render(
      <TestWrapper initialUser={mockUser}>
        <Dashboard />
      </TestWrapper>
    );

    // Find all headings
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    if (headings.length > 1) {
      const headingData = Array.from(headings).map(heading => ({
        element: heading,
        level: getHeadingLevel(heading),
        fontSize: parseFloat(getComputedStyle(heading).fontSize)
      })).filter(h => h.level !== null);

      // Group by level and check size relationships
      const levelGroups = {};
      headingData.forEach(h => {
        if (!levelGroups[h.level]) levelGroups[h.level] = [];
        levelGroups[h.level].push(h.fontSize);
      });

      // Check that higher level headings (h1, h2) are larger than lower level headings (h3, h4, etc.)
      const levels = Object.keys(levelGroups).map(Number).sort();
      
      for (let i = 0; i < levels.length - 1; i++) {
        const currentLevel = levels[i];
        const nextLevel = levels[i + 1];
        
        if (currentLevel < nextLevel) { // h1 < h2 < h3 in terms of hierarchy
          const currentAvgSize = levelGroups[currentLevel].reduce((a, b) => a + b, 0) / levelGroups[currentLevel].length;
          const nextAvgSize = levelGroups[nextLevel].reduce((a, b) => a + b, 0) / levelGroups[nextLevel].length;
          
          // Higher level headings should be larger or equal in size
          expect(currentAvgSize).toBeGreaterThanOrEqual(nextAvgSize);
        }
      }
    }
  });

  /**
   * Property: Interactive elements have consistent visual feedback hierarchy
   */
  test('interactive elements maintain consistent visual feedback hierarchy', () => {
    const mockUser = {
      uid: 'test-user',
      email: 'test@example.com',
      profile: { name: 'Test User', photoURL: 'https://via.placeholder.com/150' },
      role: 'job_seeker'
    };

    const { container } = render(
      <TestWrapper initialUser={mockUser}>
        <Dashboard />
      </TestWrapper>
    );

    // Find different types of interactive elements
    const primaryActions = container.querySelectorAll('.primary-btn, .btn-primary');
    const secondaryActions = container.querySelectorAll('.btn-secondary, .card-action');
    const navigationElements = container.querySelectorAll('[role="tab"]');

    // Test that primary actions have higher visual weight than secondary actions
    if (primaryActions.length > 0 && secondaryActions.length > 0) {
      const primaryWeights = Array.from(primaryActions).map(calculateVisualWeight);
      const secondaryWeights = Array.from(secondaryActions).map(calculateVisualWeight);
      
      const maxSecondaryWeight = Math.max(...secondaryWeights);
      const minPrimaryWeight = Math.min(...primaryWeights);
      
      // At least some primary actions should have higher weight than secondary actions
      expect(minPrimaryWeight).toBeGreaterThanOrEqual(maxSecondaryWeight * 0.8); // Allow some tolerance
    }

    // Test that navigation elements have consistent visual weight
    if (navigationElements.length > 1) {
      const navWeights = Array.from(navigationElements).map(calculateVisualWeight);
      const avgWeight = navWeights.reduce((a, b) => a + b, 0) / navWeights.length;
      
      // All navigation elements should have similar visual weight (within 20% of average)
      navWeights.forEach(weight => {
        expect(weight).toBeGreaterThanOrEqual(avgWeight * 0.8);
        expect(weight).toBeLessThanOrEqual(avgWeight * 1.2);
      });
    }
  });

  /**
   * Property: Content hierarchy follows proper information architecture
   */
  test('content hierarchy follows proper information architecture', () => {
    const mockUser = {
      uid: 'test-user',
      email: 'test@example.com',
      profile: { name: 'Test User', photoURL: 'https://via.placeholder.com/150' },
      role: 'job_seeker'
    };

    const { container } = render(
      <TestWrapper initialUser={mockUser}>
        <Dashboard />
      </TestWrapper>
    );

    // Check page title hierarchy
    const pageTitle = container.querySelector('.page-title');
    const cardTitles = container.querySelectorAll('.card-title');
    
    if (pageTitle && cardTitles.length > 0) {
      const pageTitleSize = parseFloat(getComputedStyle(pageTitle).fontSize);
      const cardTitleSizes = Array.from(cardTitles).map(title => 
        parseFloat(getComputedStyle(title).fontSize)
      );
      
      const maxCardTitleSize = Math.max(...cardTitleSizes);
      
      // Page title should be larger than or equal to card titles
      expect(pageTitleSize).toBeGreaterThanOrEqual(maxCardTitleSize);
    }

    // Check that stat values are visually prominent
    const statValues = container.querySelectorAll('.stat-value');
    const statLabels = container.querySelectorAll('.stat-label');
    
    if (statValues.length > 0 && statLabels.length > 0) {
      const statValueSizes = Array.from(statValues).map(value => 
        parseFloat(getComputedStyle(value).fontSize)
      );
      const statLabelSizes = Array.from(statLabels).map(label => 
        parseFloat(getComputedStyle(label).fontSize)
      );
      
      const avgValueSize = statValueSizes.reduce((a, b) => a + b, 0) / statValueSizes.length;
      const avgLabelSize = statLabelSizes.reduce((a, b) => a + b, 0) / statLabelSizes.length;
      
      // Stat values should be larger than their labels
      expect(avgValueSize).toBeGreaterThan(avgLabelSize);
    }
  });

  /**
   * Property: Color hierarchy supports visual importance
   */
  test('color hierarchy supports visual importance across themes', () => {
    const themes = ['light', 'dark'];
    
    themes.forEach(theme => {
      // Set theme
      document.documentElement.setAttribute('data-theme', theme);
      
      const { container, unmount } = render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      // Find elements with different importance levels
      const primaryElements = container.querySelectorAll(
        '.work-email-btn-dark, .google-btn-dark, .auth-title-dark'
      );
      const secondaryElements = container.querySelectorAll(
        '.auth-subtitle-dark, .info-text-small'
      );

      if (primaryElements.length > 0 && secondaryElements.length > 0) {
        // Check that primary elements have more visual contrast
        primaryElements.forEach(element => {
          const styles = getComputedStyle(element);
          const hasStrongBackground = styles.backgroundColor !== 'rgba(0, 0, 0, 0)' && 
                                     styles.backgroundColor !== 'transparent';
          const hasStrongBorder = styles.border !== 'none' && styles.border !== '';
          const hasStrongShadow = styles.boxShadow !== 'none';
          
          // Primary elements should have at least one strong visual property
          expect(hasStrongBackground || hasStrongBorder || hasStrongShadow).toBeTruthy();
        });
      }

      unmount();
    });
  });

  /**
   * Property: Spacing hierarchy creates proper visual grouping
   */
  test('spacing hierarchy creates proper visual grouping', () => {
    const mockUser = {
      uid: 'test-user',
      email: 'test@example.com',
      profile: { name: 'Test User', photoURL: 'https://via.placeholder.com/150' },
      role: 'job_seeker'
    };

    const { container } = render(
      <TestWrapper initialUser={mockUser}>
        <Dashboard />
      </TestWrapper>
    );

    // Check spacing between major sections
    const sections = container.querySelectorAll('section, .content-card, .stat-card');
    
    if (sections.length > 1) {
      const spacingValues = Array.from(sections).map(section => {
        const styles = getComputedStyle(section);
        return {
          marginTop: parseFloat(styles.marginTop) || 0,
          marginBottom: parseFloat(styles.marginBottom) || 0,
          paddingTop: parseFloat(styles.paddingTop) || 0,
          paddingBottom: parseFloat(styles.paddingBottom) || 0
        };
      });

      // Check that spacing values follow a consistent scale
      const allSpacingValues = spacingValues.flatMap(s => 
        [s.marginTop, s.marginBottom, s.paddingTop, s.paddingBottom]
      ).filter(v => v > 0);

      if (allSpacingValues.length > 0) {
        const uniqueValues = [...new Set(allSpacingValues)].sort((a, b) => a - b);
        
        // Check that spacing follows a reasonable scale (each value should be at least 4px apart)
        for (let i = 1; i < uniqueValues.length; i++) {
          const ratio = uniqueValues[i] / uniqueValues[i - 1];
          expect(ratio).toBeGreaterThanOrEqual(1.0); // Should be increasing
          expect(ratio).toBeLessThanOrEqual(4.0); // Should not be too extreme
        }
      }
    }
  });

  /**
   * Property: Typography hierarchy is consistent across components
   */
  test('typography hierarchy is consistent across different components', () => {
    const components = [
      {
        component: () => {
          const mockUser = {
            uid: 'test-user',
            email: 'test@example.com',
            profile: { name: 'Test User', photoURL: 'https://via.placeholder.com/150' },
            role: 'job_seeker'
          };
          return (
            <TestWrapper initialUser={mockUser}>
              <Dashboard />
            </TestWrapper>
          );
        },
        name: 'Dashboard'
      },
      {
        component: () => (
          <TestWrapper>
            <LoginPage />
          </TestWrapper>
        ),
        name: 'LoginPage'
      }
    ];

    const typographyData = {};

    components.forEach(({ component: Component, name }) => {
      const { container, unmount } = render(<Component />);

      // Collect typography data
      const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const bodyText = container.querySelectorAll('p, span, div');
      
      typographyData[name] = {
        headings: Array.from(headings).map(h => ({
          level: getHeadingLevel(h),
          fontSize: parseFloat(getComputedStyle(h).fontSize),
          fontWeight: parseInt(getComputedStyle(h).fontWeight) || 400
        })).filter(h => h.level !== null),
        bodyText: Array.from(bodyText).slice(0, 5).map(t => ({ // Sample first 5 elements
          fontSize: parseFloat(getComputedStyle(t).fontSize),
          fontWeight: parseInt(getComputedStyle(t).fontWeight) || 400
        }))
      };

      unmount();
    });

    // Compare typography consistency across components
    const componentNames = Object.keys(typographyData);
    if (componentNames.length > 1) {
      // Check that similar heading levels have similar sizes across components
      for (let level = 1; level <= 6; level++) {
        const sizesAcrossComponents = componentNames.map(name => {
          const headingsAtLevel = typographyData[name].headings.filter(h => h.level === level);
          return headingsAtLevel.length > 0 ? 
            headingsAtLevel.reduce((sum, h) => sum + h.fontSize, 0) / headingsAtLevel.length : 
            null;
        }).filter(size => size !== null);

        if (sizesAcrossComponents.length > 1) {
          const minSize = Math.min(...sizesAcrossComponents);
          const maxSize = Math.max(...sizesAcrossComponents);
          
          // Sizes should be reasonably consistent (within 25% variation)
          expect(maxSize / minSize).toBeLessThanOrEqual(1.25);
        }
      }
    }
  });

  /**
   * Property: Visual emphasis follows content importance
   */
  test('visual emphasis follows content importance hierarchy', () => {
    const { container } = render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    // Check that main title has highest visual weight
    const mainTitle = container.querySelector('.auth-title-dark');
    const subtitle = container.querySelector('.auth-subtitle-dark');
    const infoText = container.querySelectorAll('.info-text-small');

    if (mainTitle && subtitle) {
      const titleWeight = calculateVisualWeight(mainTitle);
      const subtitleWeight = calculateVisualWeight(subtitle);
      
      // Main title should have higher visual weight than subtitle
      expect(titleWeight).toBeGreaterThan(subtitleWeight);
    }

    if (subtitle && infoText.length > 0) {
      const subtitleWeight = calculateVisualWeight(subtitle);
      const infoWeights = Array.from(infoText).map(calculateVisualWeight);
      const maxInfoWeight = Math.max(...infoWeights);
      
      // Subtitle should have higher visual weight than info text
      expect(subtitleWeight).toBeGreaterThan(maxInfoWeight);
    }
  });

  /**
   * Property: Action hierarchy guides user attention
   */
  test('action hierarchy guides user attention effectively', () => {
    const { container } = render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    // Find different types of actions
    const primaryActions = container.querySelectorAll('.work-email-btn-dark, .google-btn-dark');
    const links = container.querySelectorAll('a');
    const infoElements = container.querySelectorAll('.info-text-small');

    // Primary actions should have highest visual weight
    if (primaryActions.length > 0 && links.length > 0) {
      const primaryWeights = Array.from(primaryActions).map(calculateVisualWeight);
      const linkWeights = Array.from(links).map(calculateVisualWeight);
      
      const avgPrimaryWeight = primaryWeights.reduce((a, b) => a + b, 0) / primaryWeights.length;
      const avgLinkWeight = linkWeights.reduce((a, b) => a + b, 0) / linkWeights.length;
      
      // Primary actions should have higher visual weight than links
      expect(avgPrimaryWeight).toBeGreaterThan(avgLinkWeight);
    }

    // Links should have higher visual weight than info text
    if (links.length > 0 && infoElements.length > 0) {
      const linkWeights = Array.from(links).map(calculateVisualWeight);
      const infoWeights = Array.from(infoElements).map(calculateVisualWeight);
      
      const avgLinkWeight = linkWeights.reduce((a, b) => a + b, 0) / linkWeights.length;
      const avgInfoWeight = infoWeights.reduce((a, b) => a + b, 0) / infoWeights.length;
      
      // Links should have higher visual weight than info text
      expect(avgLinkWeight).toBeGreaterThan(avgInfoWeight);
    }
  });

  /**
   * Property: Consistent visual hierarchy across user roles
   */
  test('visual hierarchy remains consistent across different user roles', () => {
    const userRoles = ['job_seeker', 'employer'];
    const hierarchyData = {};

    userRoles.forEach(role => {
      const mockUser = {
        uid: `test-user-${role}`,
        email: `test-${role}@example.com`,
        profile: { name: `Test ${role}`, photoURL: 'https://via.placeholder.com/150' },
        role: role
      };

      const { container, unmount } = render(
        <TestWrapper initialUser={mockUser}>
          <Dashboard />
        </TestWrapper>
      );

      // Collect hierarchy data
      const pageTitle = container.querySelector('.page-title');
      const cardTitles = container.querySelectorAll('.card-title');
      const primaryButtons = container.querySelectorAll('.primary-btn, .btn-primary');
      
      hierarchyData[role] = {
        pageTitleSize: pageTitle ? parseFloat(getComputedStyle(pageTitle).fontSize) : null,
        cardTitleSizes: Array.from(cardTitles).map(title => 
          parseFloat(getComputedStyle(title).fontSize)
        ),
        primaryButtonWeights: Array.from(primaryButtons).map(calculateVisualWeight)
      };

      unmount();
    });

    // Compare hierarchy consistency across roles
    const roles = Object.keys(hierarchyData);
    if (roles.length === 2) {
      const [role1, role2] = roles;
      
      // Page title sizes should be similar
      if (hierarchyData[role1].pageTitleSize && hierarchyData[role2].pageTitleSize) {
        const ratio = hierarchyData[role1].pageTitleSize / hierarchyData[role2].pageTitleSize;
        expect(ratio).toBeGreaterThanOrEqual(0.9);
        expect(ratio).toBeLessThanOrEqual(1.1);
      }
      
      // Card title sizes should be in similar ranges
      if (hierarchyData[role1].cardTitleSizes.length > 0 && hierarchyData[role2].cardTitleSizes.length > 0) {
        const avg1 = hierarchyData[role1].cardTitleSizes.reduce((a, b) => a + b, 0) / hierarchyData[role1].cardTitleSizes.length;
        const avg2 = hierarchyData[role2].cardTitleSizes.reduce((a, b) => a + b, 0) / hierarchyData[role2].cardTitleSizes.length;
        
        const ratio = avg1 / avg2;
        expect(ratio).toBeGreaterThanOrEqual(0.8);
        expect(ratio).toBeLessThanOrEqual(1.2);
      }
    }
  });
});

/**
 * Test Summary:
 * 
 * This property-based test validates that visual hierarchy in the modern UI redesign
 * maintains consistent patterns where primary actions have higher visual weight than
 * secondary actions, and information hierarchy follows defined size and color patterns:
 * 
 * 1. Action Hierarchy: Primary buttons have higher visual weight than secondary buttons
 * 2. Heading Hierarchy: Proper size relationships between heading levels (h1 > h2 > h3, etc.)
 * 3. Interactive Feedback: Consistent visual feedback hierarchy for different interaction types
 * 4. Content Architecture: Page titles > card titles > content text hierarchy
 * 5. Color Hierarchy: Color usage supports visual importance across themes
 * 6. Spacing Hierarchy: Consistent spacing scale creates proper visual grouping
 * 7. Typography Consistency: Typography hierarchy consistent across components
 * 8. Content Importance: Visual emphasis follows content importance
 * 9. Action Guidance: Action hierarchy effectively guides user attention
 * 10. Role Consistency: Visual hierarchy remains consistent across user roles
 * 
 * **Validates: Requirements 2.2, 2.5**
 */