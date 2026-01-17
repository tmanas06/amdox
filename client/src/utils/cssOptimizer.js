/**
 * CSS Optimizer Utility
 * Helps identify unused CSS and provides optimization recommendations
 */

class CSSOptimizer {
  constructor() {
    this.usedSelectors = new Set();
    this.unusedSelectors = new Set();
    this.criticalCSS = new Set();
    this.isAnalyzing = false;
  }

  /**
   * Start analyzing CSS usage
   */
  startAnalysis() {
    if (this.isAnalyzing) return;
    
    this.isAnalyzing = true;
    this.usedSelectors.clear();
    this.unusedSelectors.clear();
    
    console.log('🔍 Starting CSS analysis...');
    
    // Analyze all stylesheets
    this.analyzeStylesheets();
    
    // Set up mutation observer to track dynamic class usage
    this.setupMutationObserver();
    
    // Analyze critical CSS
    this.analyzeCriticalCSS();
  }

  /**
   * Stop CSS analysis and generate report
   */
  stopAnalysis() {
    if (!this.isAnalyzing) return;
    
    this.isAnalyzing = false;
    
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
    
    console.log('🔍 CSS analysis completed');
    return this.generateOptimizationReport();
  }

  /**
   * Analyze all stylesheets
   */
  analyzeStylesheets() {
    const stylesheets = Array.from(document.styleSheets);
    
    stylesheets.forEach((stylesheet, index) => {
      try {
        this.analyzeStylesheet(stylesheet, index);
      } catch (error) {
        console.warn(`Cannot analyze stylesheet ${index}:`, error.message);
      }
    });
  }

  /**
   * Analyze individual stylesheet
   */
  analyzeStylesheet(stylesheet, index) {
    if (!stylesheet.cssRules) return;
    
    const rules = Array.from(stylesheet.cssRules);
    
    rules.forEach((rule) => {
      if (rule.type === CSSRule.STYLE_RULE) {
        this.analyzeStyleRule(rule);
      } else if (rule.type === CSSRule.MEDIA_RULE) {
        this.analyzeMediaRule(rule);
      }
    });
  }

  /**
   * Analyze style rule
   */
  analyzeStyleRule(rule) {
    const selector = rule.selectorText;
    
    try {
      // Check if selector matches any elements
      const elements = document.querySelectorAll(selector);
      
      if (elements.length > 0) {
        this.usedSelectors.add(selector);
        
        // Check if it's above the fold (critical CSS)
        const isAboveFold = Array.from(elements).some(el => {
          const rect = el.getBoundingClientRect();
          return rect.top < window.innerHeight && rect.left < window.innerWidth;
        });
        
        if (isAboveFold) {
          this.criticalCSS.add(selector);
        }
      } else {
        this.unusedSelectors.add(selector);
      }
    } catch (error) {
      // Invalid selector or other error
      console.warn(`Cannot analyze selector "${selector}":`, error.message);
    }
  }

  /**
   * Analyze media rule
   */
  analyzeMediaRule(rule) {
    if (!rule.cssRules) return;
    
    const mediaQuery = rule.conditionText || rule.media.mediaText;
    const matches = window.matchMedia(mediaQuery).matches;
    
    if (matches) {
      Array.from(rule.cssRules).forEach((nestedRule) => {
        if (nestedRule.type === CSSRule.STYLE_RULE) {
          this.analyzeStyleRule(nestedRule);
        }
      });
    }
  }

  /**
   * Setup mutation observer to track dynamic class changes
   */
  setupMutationObserver() {
    this.mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const element = mutation.target;
          const classes = element.className.split(' ').filter(Boolean);
          
          classes.forEach((className) => {
            this.usedSelectors.add(`.${className}`);
          });
        }
        
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.analyzeNewElement(node);
            }
          });
        }
      });
    });
    
    this.mutationObserver.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ['class', 'id']
    });
  }

  /**
   * Analyze newly added elements
   */
  analyzeNewElement(element) {
    // Analyze the element itself
    if (element.className) {
      const classes = element.className.split(' ').filter(Boolean);
      classes.forEach((className) => {
        this.usedSelectors.add(`.${className}`);
      });
    }
    
    if (element.id) {
      this.usedSelectors.add(`#${element.id}`);
    }
    
    // Analyze child elements
    const childElements = element.querySelectorAll('*');
    childElements.forEach((child) => {
      if (child.className) {
        const classes = child.className.split(' ').filter(Boolean);
        classes.forEach((className) => {
          this.usedSelectors.add(`.${className}`);
        });
      }
      
      if (child.id) {
        this.usedSelectors.add(`#${child.id}`);
      }
    });
  }

  /**
   * Analyze critical CSS (above the fold)
   */
  analyzeCriticalCSS() {
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    const visibleElements = Array.from(document.querySelectorAll('*')).filter(el => {
      const rect = el.getBoundingClientRect();
      return rect.top < viewportHeight && 
             rect.left < viewportWidth && 
             rect.bottom > 0 && 
             rect.right > 0;
    });
    
    visibleElements.forEach(element => {
      if (element.className) {
        const classes = element.className.split(' ').filter(Boolean);
        classes.forEach(className => {
          this.criticalCSS.add(`.${className}`);
        });
      }
      
      if (element.id) {
        this.criticalCSS.add(`#${element.id}`);
      }
    });
  }

  /**
   * Generate optimization report
   */
  generateOptimizationReport() {
    const totalSelectors = this.usedSelectors.size + this.unusedSelectors.size;
    const usagePercentage = totalSelectors > 0 ? (this.usedSelectors.size / totalSelectors) * 100 : 0;
    const unusedPercentage = totalSelectors > 0 ? (this.unusedSelectors.size / totalSelectors) * 100 : 0;
    
    const report = {
      totalSelectors,
      usedSelectors: this.usedSelectors.size,
      unusedSelectors: this.unusedSelectors.size,
      criticalSelectors: this.criticalCSS.size,
      usagePercentage: usagePercentage.toFixed(1),
      unusedPercentage: unusedPercentage.toFixed(1),
      criticalPercentage: totalSelectors > 0 ? ((this.criticalCSS.size / totalSelectors) * 100).toFixed(1) : 0,
      recommendations: this.getOptimizationRecommendations(unusedPercentage),
      unusedSelectorsList: Array.from(this.unusedSelectors).slice(0, 20), // Show first 20
      criticalSelectorsList: Array.from(this.criticalCSS).slice(0, 20) // Show first 20
    };
    
    console.group('📊 CSS Optimization Report');
    console.table({
      'Total Selectors': report.totalSelectors,
      'Used Selectors': `${report.usedSelectors} (${report.usagePercentage}%)`,
      'Unused Selectors': `${report.unusedSelectors} (${report.unusedPercentage}%)`,
      'Critical Selectors': `${report.criticalSelectors} (${report.criticalPercentage}%)`
    });
    
    if (report.unusedSelectors > 0) {
      console.group('🗑️ Sample Unused Selectors');
      report.unusedSelectorsList.forEach(selector => console.log(selector));
      console.groupEnd();
    }
    
    if (report.criticalSelectors > 0) {
      console.group('⚡ Sample Critical Selectors');
      report.criticalSelectorsList.forEach(selector => console.log(selector));
      console.groupEnd();
    }
    
    console.group('💡 Recommendations');
    report.recommendations.forEach(rec => console.log(rec));
    console.groupEnd();
    
    console.groupEnd();
    
    return report;
  }

  /**
   * Get optimization recommendations
   */
  getOptimizationRecommendations(unusedPercentage) {
    const recommendations = [];
    
    if (unusedPercentage > 30) {
      recommendations.push('Consider removing unused CSS selectors to reduce bundle size');
      recommendations.push('Use CSS purging tools like PurgeCSS in your build process');
      recommendations.push('Implement code splitting for component-specific styles');
    }
    
    if (unusedPercentage > 50) {
      recommendations.push('High amount of unused CSS detected - significant optimization opportunity');
      recommendations.push('Consider using CSS-in-JS or CSS modules for better tree shaking');
    }
    
    if (this.criticalCSS.size > 0) {
      recommendations.push('Extract critical CSS for above-the-fold content');
      recommendations.push('Inline critical CSS in HTML head for faster initial render');
      recommendations.push('Load non-critical CSS asynchronously');
    }
    
    recommendations.push('Use CSS custom properties (variables) to reduce duplication');
    recommendations.push('Minimize CSS specificity to improve performance');
    recommendations.push('Consider using utility-first CSS frameworks for better optimization');
    
    if (recommendations.length === 0) {
      recommendations.push('CSS usage is well optimized!');
    }
    
    return recommendations;
  }

  /**
   * Get critical CSS as string
   */
  getCriticalCSS() {
    const criticalRules = [];
    const stylesheets = Array.from(document.styleSheets);
    
    stylesheets.forEach(stylesheet => {
      try {
        if (!stylesheet.cssRules) return;
        
        Array.from(stylesheet.cssRules).forEach(rule => {
          if (rule.type === CSSRule.STYLE_RULE) {
            if (this.criticalCSS.has(rule.selectorText)) {
              criticalRules.push(rule.cssText);
            }
          }
        });
      } catch (error) {
        console.warn('Cannot extract critical CSS from stylesheet:', error);
      }
    });
    
    return criticalRules.join('\n');
  }

  /**
   * Measure CSS file sizes and analyze bundle composition
   */
  measureCSSFileSizes() {
    const stylesheets = Array.from(document.styleSheets);
    const fileSizes = [];
    let totalRules = 0;
    let totalSize = 0;
    
    stylesheets.forEach((stylesheet, index) => {
      if (stylesheet.href) {
        // For external stylesheets, estimate size based on rules
        const ruleCount = stylesheet.cssRules ? stylesheet.cssRules.length : 0;
        const estimatedSize = this.estimateStylesheetSize(stylesheet);
        
        fileSizes.push({
          href: stylesheet.href,
          ruleCount,
          estimatedSize,
          type: 'external',
          filename: this.extractFilename(stylesheet.href)
        });
        
        totalRules += ruleCount;
        totalSize += estimatedSize;
      } else {
        // For inline styles
        const ruleCount = stylesheet.cssRules ? stylesheet.cssRules.length : 0;
        const estimatedSize = this.estimateStylesheetSize(stylesheet);
        
        fileSizes.push({
          href: 'inline',
          ruleCount,
          estimatedSize,
          type: 'inline'
        });
        
        totalRules += ruleCount;
        totalSize += estimatedSize;
      }
    });
    
    return {
      files: fileSizes,
      summary: {
        totalFiles: fileSizes.length,
        totalRules,
        estimatedTotalSize: totalSize,
        largestFile: fileSizes.reduce((largest, file) => 
          file.estimatedSize > (largest?.estimatedSize || 0) ? file : largest, null
        )
      }
    };
  }

  /**
   * Estimate stylesheet size based on rules
   */
  estimateStylesheetSize(stylesheet) {
    if (!stylesheet.cssRules) return 0;
    
    let estimatedSize = 0;
    
    try {
      Array.from(stylesheet.cssRules).forEach(rule => {
        // Estimate size based on rule type and content
        if (rule.type === CSSRule.STYLE_RULE) {
          estimatedSize += rule.selectorText.length;
          estimatedSize += rule.style.cssText.length;
          estimatedSize += 10; // Overhead for brackets, spaces, etc.
        } else if (rule.type === CSSRule.MEDIA_RULE) {
          estimatedSize += rule.conditionText?.length || 0;
          estimatedSize += 20; // Media query overhead
          if (rule.cssRules) {
            Array.from(rule.cssRules).forEach(nestedRule => {
              if (nestedRule.selectorText) {
                estimatedSize += nestedRule.selectorText.length;
              }
              if (nestedRule.style) {
                estimatedSize += nestedRule.style.cssText.length;
              }
            });
          }
        } else if (rule.type === CSSRule.KEYFRAMES_RULE) {
          estimatedSize += rule.name.length;
          estimatedSize += 50; // Keyframes overhead
        }
      });
    } catch (error) {
      // Fallback estimation
      estimatedSize = stylesheet.cssRules.length * 50;
    }
    
    return estimatedSize;
  }

  /**
   * Extract filename from URL
   */
  extractFilename(url) {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      return pathname.split('/').pop() || 'unknown';
    } catch {
      return url.split('/').pop() || 'unknown';
    }
  }

  /**
   * Analyze CSS bundle composition and suggest optimizations
   */
  analyzeBundleComposition() {
    const sizeData = this.measureCSSFileSizes();
    const report = this.generateOptimizationReport();
    
    const bundleAnalysis = {
      ...sizeData,
      optimization: {
        unusedPercentage: report.unusedPercentage,
        criticalPercentage: report.criticalPercentage,
        recommendations: this.getBundleOptimizationRecommendations(sizeData, report)
      }
    };
    
    console.group('📦 CSS Bundle Analysis');
    console.table(sizeData.summary);
    console.group('📁 File Breakdown');
    sizeData.files.forEach(file => {
      console.log(`${file.filename || file.href}: ${file.estimatedSize} bytes (${file.ruleCount} rules)`);
    });
    console.groupEnd();
    console.group('🎯 Optimization Opportunities');
    bundleAnalysis.optimization.recommendations.forEach(rec => console.log(rec));
    console.groupEnd();
    console.groupEnd();
    
    return bundleAnalysis;
  }

  /**
   * Get bundle-specific optimization recommendations
   */
  getBundleOptimizationRecommendations(sizeData, report) {
    const recommendations = [];
    const { summary } = sizeData;
    
    if (summary.estimatedTotalSize > 100000) { // > 100KB
      recommendations.push('CSS bundle is large (>100KB) - consider code splitting');
      recommendations.push('Implement critical CSS extraction for above-the-fold content');
    }
    
    if (summary.totalFiles > 10) {
      recommendations.push('Many CSS files detected - consider bundling for production');
    }
    
    if (summary.largestFile && summary.largestFile.estimatedSize > 50000) {
      recommendations.push(`Largest file (${summary.largestFile.filename}) is >50KB - consider splitting`);
    }
    
    if (parseFloat(report.unusedPercentage) > 25) {
      recommendations.push('High unused CSS detected - implement CSS purging');
      recommendations.push('Use tools like PurgeCSS or UnCSS to remove unused styles');
    }
    
    if (parseFloat(report.criticalPercentage) < 20) {
      recommendations.push('Low critical CSS percentage - optimize above-the-fold styles');
    }
    
    // Check for duplicate rules
    const duplicateCheck = this.findDuplicateRules();
    if (duplicateCheck.duplicates > 0) {
      recommendations.push(`Found ${duplicateCheck.duplicates} duplicate CSS rules - consolidate styles`);
    }
    
    return recommendations;
  }

  /**
   * Find duplicate CSS rules
   */
  findDuplicateRules() {
    const ruleMap = new Map();
    let duplicates = 0;
    
    const stylesheets = Array.from(document.styleSheets);
    
    stylesheets.forEach(stylesheet => {
      try {
        if (!stylesheet.cssRules) return;
        
        Array.from(stylesheet.cssRules).forEach(rule => {
          if (rule.type === CSSRule.STYLE_RULE) {
            const key = `${rule.selectorText}:${rule.style.cssText}`;
            if (ruleMap.has(key)) {
              duplicates++;
            } else {
              ruleMap.set(key, true);
            }
          }
        });
      } catch (error) {
        // Skip inaccessible stylesheets
      }
    });
    
    return { duplicates, totalRules: ruleMap.size };
  }
}

// Create singleton instance
const cssOptimizer = new CSSOptimizer();

// Auto-analyze in development mode
if (process.env.NODE_ENV === 'development') {
  // Start analysis after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      cssOptimizer.startAnalysis();
      
      // Stop analysis after 10 seconds
      setTimeout(() => {
        cssOptimizer.stopAnalysis();
      }, 10000);
    }, 2000);
  });
}

export default cssOptimizer;

/**
 * React Hook for CSS optimization
 */
export const useCSSOptimizer = () => {
  const startAnalysis = () => cssOptimizer.startAnalysis();
  const stopAnalysis = () => cssOptimizer.stopAnalysis();
  const getCriticalCSS = () => cssOptimizer.getCriticalCSS();
  const measureFileSizes = () => cssOptimizer.measureCSSFileSizes();
  const analyzeBundleComposition = () => cssOptimizer.analyzeBundleComposition();
  
  return {
    startAnalysis,
    stopAnalysis,
    getCriticalCSS,
    measureFileSizes,
    analyzeBundleComposition
  };
};

/**
 * CSS Minification Utility
 */
export class CSSMinifier {
  static minifyCSS(cssText) {
    return cssText
      // Remove comments
      .replace(/\/\*[\s\S]*?\*\//g, '')
      // Remove unnecessary whitespace
      .replace(/\s+/g, ' ')
      // Remove whitespace around specific characters
      .replace(/\s*([{}:;,>+~])\s*/g, '$1')
      // Remove trailing semicolons
      .replace(/;}/g, '}')
      // Remove leading/trailing whitespace
      .trim();
  }
  
  static compressSelectors(cssText) {
    // Combine duplicate selectors
    const rules = new Map();
    const lines = cssText.split('}').filter(line => line.trim());
    
    lines.forEach(line => {
      const [selector, ...declarations] = line.split('{');
      if (selector && declarations.length > 0) {
        const cleanSelector = selector.trim();
        const cleanDeclarations = declarations.join('{').trim();
        
        if (rules.has(cleanSelector)) {
          rules.set(cleanSelector, rules.get(cleanSelector) + ';' + cleanDeclarations);
        } else {
          rules.set(cleanSelector, cleanDeclarations);
        }
      }
    });
    
    return Array.from(rules.entries())
      .map(([selector, declarations]) => `${selector}{${declarations}}`)
      .join('');
  }
  
  static removeUnusedCSS(cssText, usedSelectors) {
    const lines = cssText.split('}').filter(line => line.trim());
    const usedRules = [];
    
    lines.forEach(line => {
      const [selector] = line.split('{');
      if (selector && usedSelectors.has(selector.trim())) {
        usedRules.push(line + '}');
      }
    });
    
    return usedRules.join('');
  }
}

/**
 * Performance Budget Checker
 */
export class PerformanceBudget {
  constructor(budgets = {}) {
    this.budgets = {
      maxCSSSize: 150000, // 150KB
      maxUnusedPercentage: 20, // 20%
      maxFiles: 15,
      maxRules: 5000,
      ...budgets
    };
  }
  
  checkBudget(analysisResult) {
    const violations = [];
    const { summary, optimization } = analysisResult;
    
    if (summary.estimatedTotalSize > this.budgets.maxCSSSize) {
      violations.push({
        type: 'size',
        message: `CSS bundle size (${summary.estimatedTotalSize} bytes) exceeds budget (${this.budgets.maxCSSSize} bytes)`,
        severity: 'error'
      });
    }
    
    if (parseFloat(optimization.unusedPercentage) > this.budgets.maxUnusedPercentage) {
      violations.push({
        type: 'unused',
        message: `Unused CSS (${optimization.unusedPercentage}%) exceeds budget (${this.budgets.maxUnusedPercentage}%)`,
        severity: 'warning'
      });
    }
    
    if (summary.totalFiles > this.budgets.maxFiles) {
      violations.push({
        type: 'files',
        message: `CSS file count (${summary.totalFiles}) exceeds budget (${this.budgets.maxFiles})`,
        severity: 'warning'
      });
    }
    
    if (summary.totalRules > this.budgets.maxRules) {
      violations.push({
        type: 'rules',
        message: `CSS rule count (${summary.totalRules}) exceeds budget (${this.budgets.maxRules})`,
        severity: 'info'
      });
    }
    
    return {
      passed: violations.filter(v => v.severity === 'error').length === 0,
      violations,
      score: this.calculateScore(violations)
    };
  }
  
  calculateScore(violations) {
    let score = 100;
    
    violations.forEach(violation => {
      switch (violation.severity) {
        case 'error':
          score -= 30;
          break;
        case 'warning':
          score -= 15;
          break;
        case 'info':
          score -= 5;
          break;
      }
    });
    
    return Math.max(0, score);
  }
}