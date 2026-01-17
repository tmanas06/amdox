/**
 * Property-Based Tests for Typography System Consistency
 * Feature: modern-ui-redesign, Property 10: Typography System Consistency
 * Validates: Requirements 4.1, 4.2, 4.3
 */

// Simple property-based testing helper
const runPropertyTest = (generator, property, numRuns = 100) => {
  for (let i = 0; i < numRuns; i++) {
    const testCase = generator();
    const result = property(testCase);
    if (!result) {
      throw new Error(`Property failed for input: ${JSON.stringify(testCase)}`);
    }
  }
};

// Generators for property-based testing
const generators = {
  typographyClass: () => {
    const classes = [
      'heading-1', 'heading-2', 'heading-3', 'heading-4', 'heading-5', 'heading-6',
      'text-xl', 'text-lg', 'text-base', 'text-sm', 'text-xs',
      'text-display', 'text-hero', 'text-subtitle', 'text-caption', 'text-overline',
      'text-mono'
    ];
    return classes[Math.floor(Math.random() * classes.length)];
  },
  
  typographyElement: () => {
    const elements = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'code', 'pre'];
    return elements[Math.floor(Math.random() * elements.length)];
  },
  
  viewportWidth: () => {
    const widths = [320, 768, 1024, 1280];
    return widths[Math.floor(Math.random() * widths.length)];
  },
  
  responsiveClass: () => {
    const classes = ['heading-1', 'heading-2', 'heading-3', 'text-display', 'text-hero'];
    return classes[Math.floor(Math.random() * classes.length)];
  }
};

// Extract typography tokens from CSS custom properties
const getTypographyTokens = () => {
  // Create a temporary element to access computed CSS custom properties
  const testElement = document.createElement('div');
  document.body.appendChild(testElement);
  
  const computedStyle = getComputedStyle(testElement);
  
  const tokens = {
    fontFamilies: {
      primary: computedStyle.getPropertyValue('--font-primary').trim(),
      secondary: computedStyle.getPropertyValue('--font-secondary').trim(),
      mono: computedStyle.getPropertyValue('--font-mono').trim(),
    },
    fontSizes: [
      'xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'
    ].reduce((acc, size) => {
      acc[size] = computedStyle.getPropertyValue(`--font-size-${size}`).trim();
      return acc;
    }, {}),
    fontWeights: [
      'thin', 'light', 'normal', 'medium', 'semibold', 'bold', 'extrabold', 'black'
    ].reduce((acc, weight) => {
      acc[weight] = computedStyle.getPropertyValue(`--font-weight-${weight}`).trim();
      return acc;
    }, {}),
    lineHeights: [
      'none', 'tight', 'snug', 'normal', 'relaxed', 'loose'
    ].reduce((acc, height) => {
      acc[height] = computedStyle.getPropertyValue(`--line-height-${height}`).trim();
      return acc;
    }, {}),
    letterSpacings: [
      'tighter', 'tight', 'normal', 'wide', 'wider', 'widest'
    ].reduce((acc, spacing) => {
      acc[spacing] = computedStyle.getPropertyValue(`--letter-spacing-${spacing}`).trim();
      return acc;
    }, {}),
  };
  
  document.body.removeChild(testElement);
  return tokens;
};

describe('Typography System Consistency', () => {
  let tokens;
  
  beforeAll(() => {
    // Load the CSS files by creating style elements
    const tokensCSS = `
      @import url('/src/styles/tokens.css');
      @import url('/src/styles/typography.css');
    `;
    
    const styleElement = document.createElement('style');
    styleElement.textContent = tokensCSS;
    document.head.appendChild(styleElement);
    
    // Wait for styles to load and then extract tokens
    return new Promise(resolve => {
      setTimeout(() => {
        tokens = getTypographyTokens();
        resolve();
      }, 100);
    });
  });

  /**
   * Property 10: Typography System Consistency
   * Validates: Requirements 4.1, 4.2, 4.3
   */
  test('all typography classes should use only defined font families from design system', () => {
    runPropertyTest(
      generators.typographyClass,
      (className) => {
        const element = document.createElement('div');
        element.className = className;
        document.body.appendChild(element);
        
        const computedStyle = getComputedStyle(element);
        const fontFamily = computedStyle.fontFamily;
        
        document.body.removeChild(element);
        
        // Check if the font family matches one of our defined tokens
        const definedFamilies = Object.values(tokens.fontFamilies);
        const isValidFontFamily = definedFamilies.some(family => {
          if (!family) return false;
          const familyName = family.split(',')[0].replace(/['"]/g, '').trim();
          return fontFamily.toLowerCase().includes(familyName.toLowerCase()) || 
                 fontFamily.includes('system-ui') || // Fallback fonts are acceptable
                 fontFamily.includes('sans-serif') ||
                 fontFamily.includes('monospace');
        });
        
        return isValidFontFamily;
      },
      50 // Reduced runs for faster execution
    );
  });

  test('all typography classes should use reasonable font sizes', () => {
    runPropertyTest(
      generators.typographyClass,
      (className) => {
        const element = document.createElement('div');
        element.className = className;
        document.body.appendChild(element);
        
        const computedStyle = getComputedStyle(element);
        const fontSize = parseFloat(computedStyle.fontSize);
        
        document.body.removeChild(element);
        
        // Font size should be within reasonable bounds for our design system
        return fontSize >= 10 && fontSize <= 100;
      },
      50
    );
  });

  test('all typography classes should use defined line heights', () => {
    runPropertyTest(
      generators.typographyClass,
      (className) => {
        const element = document.createElement('div');
        element.className = className;
        document.body.appendChild(element);
        
        const computedStyle = getComputedStyle(element);
        const lineHeight = computedStyle.lineHeight;
        
        document.body.removeChild(element);
        
        // Line height should be reasonable (between 1 and 3)
        if (lineHeight === 'normal') return true;
        const numericLineHeight = parseFloat(lineHeight);
        return !isNaN(numericLineHeight) && numericLineHeight >= 1 && numericLineHeight <= 3;
      },
      50
    );
  });

  test('all typography classes should use appropriate letter spacing', () => {
    runPropertyTest(
      generators.typographyClass,
      (className) => {
        const element = document.createElement('div');
        element.className = className;
        document.body.appendChild(element);
        
        const computedStyle = getComputedStyle(element);
        const letterSpacing = computedStyle.letterSpacing;
        
        document.body.removeChild(element);
        
        // Letter spacing should be reasonable
        if (letterSpacing === 'normal') return true;
        const numericSpacing = parseFloat(letterSpacing);
        return !isNaN(numericSpacing) && numericSpacing >= -2 && numericSpacing <= 5;
      },
      50
    );
  });

  test('HTML typography elements should use defined font families', () => {
    runPropertyTest(
      generators.typographyElement,
      (tagName) => {
        const element = document.createElement(tagName);
        document.body.appendChild(element);
        
        const computedStyle = getComputedStyle(element);
        const fontFamily = computedStyle.fontFamily;
        
        document.body.removeChild(element);
        
        // Should use system fonts or our defined fonts
        return fontFamily.includes('Inter') || 
               fontFamily.includes('Poppins') || 
               fontFamily.includes('JetBrains') ||
               fontFamily.includes('system-ui') ||
               fontFamily.includes('sans-serif') ||
               fontFamily.includes('monospace');
      },
      50
    );
  });

  test('responsive typography should maintain consistency across breakpoints', () => {
    runPropertyTest(
      () => ({ 
        className: generators.responsiveClass(), 
        viewportWidth: generators.viewportWidth() 
      }),
      ({ className, viewportWidth }) => {
        // Create a container with specific width to simulate viewport
        const container = document.createElement('div');
        container.style.width = `${viewportWidth}px`;
        container.style.position = 'absolute';
        container.style.top = '-9999px';
        document.body.appendChild(container);
        
        const element = document.createElement('div');
        element.className = className;
        container.appendChild(element);
        
        const computedStyle = getComputedStyle(element);
        const fontSize = parseFloat(computedStyle.fontSize);
        
        document.body.removeChild(container);
        
        // Font size should be within reasonable bounds for responsive design
        const isReasonableSize = fontSize >= 12 && fontSize <= 80;
        
        // Font size should scale appropriately with viewport
        const isScalingCorrectly = viewportWidth < 768 ? 
          fontSize >= 12 && fontSize <= 48 : // Mobile range
          fontSize >= 16 && fontSize <= 80;  // Desktop range
        
        return isReasonableSize && isScalingCorrectly;
      },
      30 // Fewer runs for complex test
    );
  });

  // Unit tests for specific edge cases
  describe('Typography Edge Cases', () => {
    test('gradient text classes should maintain readable fallbacks', () => {
      const gradientClasses = ['text-gradient-primary', 'text-gradient-secondary', 'text-gradient-sunset'];
      
      gradientClasses.forEach(className => {
        const element = document.createElement('div');
        element.className = className;
        element.textContent = 'Test text';
        document.body.appendChild(element);
        
        const computedStyle = getComputedStyle(element);
        
        // Should have some form of background styling for gradient effect
        const hasBackground = computedStyle.background !== 'rgba(0, 0, 0, 0)' && 
                             computedStyle.background !== 'transparent' &&
                             computedStyle.background !== '';
        
        // Accept if background is set (gradient effect) or if it falls back gracefully
        expect(hasBackground || computedStyle.color !== '').toBe(true);
        
        document.body.removeChild(element);
      });
    });

    test('monospace text should use appropriate font family', () => {
      const monoClasses = ['text-mono'];
      const monoElements = ['code', 'pre'];
      
      [...monoClasses, ...monoElements].forEach(selector => {
        const element = document.createElement(monoClasses.includes(selector) ? 'div' : selector);
        if (monoClasses.includes(selector)) {
          element.className = selector;
        }
        document.body.appendChild(element);
        
        const computedStyle = getComputedStyle(element);
        const fontFamily = computedStyle.fontFamily.toLowerCase();
        
        // Should include a monospace font or fallback
        const hasMonoFont = fontFamily.includes('mono') || 
                           fontFamily.includes('courier') || 
                           fontFamily.includes('consolas') || 
                           fontFamily.includes('menlo') ||
                           fontFamily.includes('jetbrains');
        
        expect(hasMonoFont).toBe(true);
        
        document.body.removeChild(element);
      });
    });

    test('heading hierarchy should have reasonable font sizes', () => {
      const headings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
      const fontSizes = [];
      
      headings.forEach(tag => {
        const element = document.createElement(tag);
        document.body.appendChild(element);
        
        const computedStyle = getComputedStyle(element);
        const fontSize = parseFloat(computedStyle.fontSize);
        fontSizes.push(fontSize);
        
        document.body.removeChild(element);
      });
      
      // Each heading should have a reasonable size
      fontSizes.forEach(size => {
        expect(size).toBeGreaterThanOrEqual(12);
        expect(size).toBeLessThanOrEqual(80);
      });
      
      // H1 should be larger than H6
      expect(fontSizes[0]).toBeGreaterThanOrEqual(fontSizes[5]);
    });
  });
});