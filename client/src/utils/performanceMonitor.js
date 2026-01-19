/**
 * Performance Monitor Utility
 * Monitors animation performance and provides optimization recommendations
 */

class PerformanceMonitor {
  constructor() {
    this.frameRates = [];
    this.animationMetrics = new Map();
    this.isMonitoring = false;
    this.performanceObserver = null;
    this.frameCount = 0;
    this.lastTime = 0;
    this.animationFrame = null;
  }

  /**
   * Start monitoring performance
   */
  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.frameRates = [];
    this.frameCount = 0;
    this.lastTime = performance.now();
    
    // Monitor frame rate
    this.monitorFrameRate();
    
    // Monitor long tasks if supported
    if ('PerformanceObserver' in window) {
      this.monitorLongTasks();
    }
    
    // Monitor paint timing
    this.monitorPaintTiming();
    
    console.log('🎯 Performance monitoring started');
  }

  /**
   * Stop monitoring performance
   */
  stopMonitoring() {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = null;
    }
    
    console.log('🎯 Performance monitoring stopped');
    this.generateReport();
  }

  /**
   * Monitor frame rate using requestAnimationFrame
   */
  monitorFrameRate() {
    const measureFrame = (currentTime) => {
      if (!this.isMonitoring) return;
      
      if (this.lastTime > 0) {
        const delta = currentTime - this.lastTime;
        const fps = 1000 / delta;
        this.frameRates.push(fps);
        
        // Keep only last 60 frames for rolling average
        if (this.frameRates.length > 60) {
          this.frameRates.shift();
        }
      }
      
      this.lastTime = currentTime;
      this.frameCount++;
      
      this.animationFrame = requestAnimationFrame(measureFrame);
    };
    
    this.animationFrame = requestAnimationFrame(measureFrame);
  }

  /**
   * Monitor long tasks that block the main thread
   */
  monitorLongTasks() {
    try {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.duration > 50) { // Tasks longer than 50ms
            console.warn('⚠️ Long task detected:', {
              duration: entry.duration,
              startTime: entry.startTime,
              name: entry.name
            });
          }
        });
      });
      
      this.performanceObserver.observe({ entryTypes: ['longtask'] });
    } catch (error) {
      console.warn('Long task monitoring not supported:', error);
    }
  }

  /**
   * Monitor paint timing
   */
  monitorPaintTiming() {
    try {
      const paintObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          console.log(`🎨 ${entry.name}: ${entry.startTime.toFixed(2)}ms`);
        });
      });
      
      paintObserver.observe({ entryTypes: ['paint'] });
    } catch (error) {
      console.warn('Paint timing monitoring not supported:', error);
    }
  }

  /**
   * Track specific animation performance
   */
  trackAnimation(name, startTime = performance.now()) {
    if (!this.animationMetrics.has(name)) {
      this.animationMetrics.set(name, {
        startTime,
        endTime: null,
        duration: null,
        frameDrops: 0,
        averageFPS: 0
      });
    }
    
    return {
      end: () => this.endAnimationTracking(name)
    };
  }

  /**
   * End animation tracking
   */
  endAnimationTracking(name) {
    const metric = this.animationMetrics.get(name);
    if (!metric) return;
    
    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;
    metric.averageFPS = this.getAverageFPS();
    
    // Count frame drops (FPS below 55)
    metric.frameDrops = this.frameRates.filter(fps => fps < 55).length;
    
    console.log(`🎬 Animation "${name}" completed:`, {
      duration: `${metric.duration.toFixed(2)}ms`,
      averageFPS: `${metric.averageFPS.toFixed(1)} FPS`,
      frameDrops: metric.frameDrops
    });
  }

  /**
   * Get current average FPS
   */
  getAverageFPS() {
    if (this.frameRates.length === 0) return 0;
    const sum = this.frameRates.reduce((a, b) => a + b, 0);
    return sum / this.frameRates.length;
  }

  /**
   * Get current FPS
   */
  getCurrentFPS() {
    return this.frameRates.length > 0 ? this.frameRates[this.frameRates.length - 1] : 0;
  }

  /**
   * Check if performance is good
   */
  isPerformanceGood() {
    const avgFPS = this.getAverageFPS();
    return avgFPS >= 55; // Consider 55+ FPS as good performance
  }

  /**
   * Generate performance report
   */
  generateReport() {
    const avgFPS = this.getAverageFPS();
    const minFPS = Math.min(...this.frameRates);
    const maxFPS = Math.max(...this.frameRates);
    const frameDrops = this.frameRates.filter(fps => fps < 55).length;
    const frameDropPercentage = (frameDrops / this.frameRates.length) * 100;
    
    // Calculate performance metrics
    const performanceMetrics = this.calculatePerformanceMetrics();
    
    const report = {
      totalFrames: this.frameCount,
      averageFPS: avgFPS.toFixed(1),
      minFPS: minFPS.toFixed(1),
      maxFPS: maxFPS.toFixed(1),
      frameDrops,
      frameDropPercentage: frameDropPercentage.toFixed(1),
      performanceGrade: this.getPerformanceGrade(avgFPS, frameDropPercentage),
      animations: Object.fromEntries(this.animationMetrics),
      recommendations: this.getRecommendations(avgFPS, frameDropPercentage),
      metrics: performanceMetrics,
      budgetCheck: this.checkPerformanceBudget(performanceMetrics)
    };
    
    console.group('📊 Performance Report');
    console.table({
      'Average FPS': report.averageFPS,
      'Min FPS': report.minFPS,
      'Max FPS': report.maxFPS,
      'Frame Drops': `${report.frameDrops} (${report.frameDropPercentage}%)`,
      'Grade': report.performanceGrade
    });
    
    if (Object.keys(report.animations).length > 0) {
      console.group('🎬 Animation Performance');
      console.table(report.animations);
      console.groupEnd();
    }
    
    console.group('📈 Performance Metrics');
    console.table(report.metrics);
    console.groupEnd();
    
    if (report.budgetCheck.violations.length > 0) {
      console.group('⚠️ Budget Violations');
      report.budgetCheck.violations.forEach(violation => {
        console.warn(`${violation.severity.toUpperCase()}: ${violation.message}`);
      });
      console.groupEnd();
    }
    
    console.group('💡 Recommendations');
    report.recommendations.forEach(rec => console.log(rec));
    console.groupEnd();
    
    console.groupEnd();
    
    return report;
  }

  /**
   * Calculate detailed performance metrics
   */
  calculatePerformanceMetrics() {
    const avgFPS = this.getAverageFPS();
    const frameDrops = this.frameRates.filter(fps => fps < 55).length;
    const severeDrops = this.frameRates.filter(fps => fps < 30).length;
    
    // Calculate frame time consistency (lower is better)
    const frameTimes = this.frameRates.map(fps => 1000 / fps);
    const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
    const frameTimeVariance = frameTimes.reduce((sum, time) => 
      sum + Math.pow(time - avgFrameTime, 2), 0) / frameTimes.length;
    const frameTimeStdDev = Math.sqrt(frameTimeVariance);
    
    // Calculate jank score (0-100, lower is better)
    const jankScore = Math.min(100, (frameDrops / this.frameRates.length) * 100 + 
                              (severeDrops / this.frameRates.length) * 200);
    
    // Calculate smoothness score (0-100, higher is better)
    const smoothnessScore = Math.max(0, 100 - jankScore - (frameTimeStdDev / 2));
    
    return {
      averageFPS: avgFPS,
      frameDrops,
      severeDrops,
      jankScore: jankScore.toFixed(1),
      smoothnessScore: smoothnessScore.toFixed(1),
      frameTimeConsistency: frameTimeStdDev.toFixed(2),
      performanceScore: this.calculateOverallScore(avgFPS, jankScore, smoothnessScore)
    };
  }

  /**
   * Calculate overall performance score
   */
  calculateOverallScore(avgFPS, jankScore, smoothnessScore) {
    let score = 0;
    
    // FPS contribution (40% of score)
    if (avgFPS >= 58) score += 40;
    else if (avgFPS >= 55) score += 35;
    else if (avgFPS >= 45) score += 25;
    else if (avgFPS >= 30) score += 15;
    else score += 5;
    
    // Jank contribution (30% of score, inverted)
    score += Math.max(0, 30 - (jankScore * 0.3));
    
    // Smoothness contribution (30% of score)
    score += (smoothnessScore * 0.3);
    
    return Math.round(Math.max(0, Math.min(100, score)));
  }

  /**
   * Check performance against budget
   */
  checkPerformanceBudget(metrics) {
    const budget = {
      minAverageFPS: 55,
      maxJankScore: 15,
      minSmoothness: 70,
      maxFrameDropPercentage: 10
    };
    
    const violations = [];
    
    if (metrics.averageFPS < budget.minAverageFPS) {
      violations.push({
        type: 'fps',
        message: `Average FPS (${metrics.averageFPS}) below budget (${budget.minAverageFPS})`,
        severity: 'error'
      });
    }
    
    if (parseFloat(metrics.jankScore) > budget.maxJankScore) {
      violations.push({
        type: 'jank',
        message: `Jank score (${metrics.jankScore}) exceeds budget (${budget.maxJankScore})`,
        severity: 'warning'
      });
    }
    
    if (parseFloat(metrics.smoothnessScore) < budget.minSmoothness) {
      violations.push({
        type: 'smoothness',
        message: `Smoothness score (${metrics.smoothnessScore}) below budget (${budget.minSmoothness})`,
        severity: 'warning'
      });
    }
    
    const frameDropPercentage = (metrics.frameDrops / this.frameRates.length) * 100;
    if (frameDropPercentage > budget.maxFrameDropPercentage) {
      violations.push({
        type: 'framedrops',
        message: `Frame drop percentage (${frameDropPercentage.toFixed(1)}%) exceeds budget (${budget.maxFrameDropPercentage}%)`,
        severity: 'info'
      });
    }
    
    return {
      passed: violations.filter(v => v.severity === 'error').length === 0,
      violations,
      score: violations.length === 0 ? 100 : Math.max(0, 100 - violations.length * 15)
    };
  }

  /**
   * Get performance grade
   */
  getPerformanceGrade(avgFPS, frameDropPercentage) {
    if (avgFPS >= 58 && frameDropPercentage < 5) return 'A';
    if (avgFPS >= 55 && frameDropPercentage < 10) return 'B';
    if (avgFPS >= 45 && frameDropPercentage < 20) return 'C';
    if (avgFPS >= 30 && frameDropPercentage < 30) return 'D';
    return 'F';
  }

  /**
   * Get performance recommendations
   */
  getRecommendations(avgFPS, frameDropPercentage) {
    const recommendations = [];
    
    if (avgFPS < 55) {
      recommendations.push('Consider reducing animation complexity or duration');
      recommendations.push('Use CSS transforms instead of changing layout properties');
      recommendations.push('Enable hardware acceleration with will-change or transform3d');
    }
    
    if (frameDropPercentage > 15) {
      recommendations.push('Reduce the number of simultaneous animations');
      recommendations.push('Use requestAnimationFrame for JavaScript animations');
      recommendations.push('Consider using CSS animations instead of JavaScript');
    }
    
    if (avgFPS < 30) {
      recommendations.push('Disable animations for this device/browser');
      recommendations.push('Implement reduced motion preferences');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Performance is good! No optimizations needed.');
    }
    
    return recommendations;
  }

  /**
   * Measure function execution time
   */
  measureFunction(fn, name = 'Function') {
    const startTime = performance.now();
    const result = fn();
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`⏱️ ${name} execution time: ${duration.toFixed(2)}ms`);
    
    if (duration > 16.67) { // More than one frame at 60fps
      console.warn(`⚠️ ${name} is blocking the main thread for ${duration.toFixed(2)}ms`);
    }
    
    return result;
  }

  /**
   * Measure async function execution time
   */
  async measureAsyncFunction(fn, name = 'Async Function') {
    const startTime = performance.now();
    const result = await fn();
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`⏱️ ${name} execution time: ${duration.toFixed(2)}ms`);
    
    return result;
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// Auto-start monitoring in development
if (process.env.NODE_ENV === 'development') {
  // Start monitoring after a short delay to avoid initial page load noise
  setTimeout(() => {
    performanceMonitor.startMonitoring();
  }, 1000);
  
  // Stop monitoring after 30 seconds in development
  setTimeout(() => {
    performanceMonitor.stopMonitoring();
  }, 31000);
}

export default performanceMonitor;

/**
 * React Hook for performance monitoring
 */
export const usePerformanceMonitor = () => {
  const startMonitoring = () => performanceMonitor.startMonitoring();
  const stopMonitoring = () => performanceMonitor.stopMonitoring();
  const trackAnimation = (name) => performanceMonitor.trackAnimation(name);
  const getCurrentFPS = () => performanceMonitor.getCurrentFPS();
  const isPerformanceGood = () => performanceMonitor.isPerformanceGood();
  
  return {
    startMonitoring,
    stopMonitoring,
    trackAnimation,
    getCurrentFPS,
    isPerformanceGood,
    measureFunction: performanceMonitor.measureFunction.bind(performanceMonitor),
    measureAsyncFunction: performanceMonitor.measureAsyncFunction.bind(performanceMonitor)
  };
};

/**
 * Higher-order component for performance monitoring
 */
export const withPerformanceMonitoring = (WrappedComponent, componentName) => {
  return function PerformanceMonitoredComponent(props) {
    React.useEffect(() => {
      const tracker = performanceMonitor.trackAnimation(`${componentName} Mount`);
      
      return () => {
        tracker.end();
      };
    }, []);
    
    return React.createElement(WrappedComponent, props);
  };
};