/**
 * Report Web Vitals
 * Measures and reports Core Web Vitals metrics for performance monitoring
 * 
 * Core Web Vitals measured:
 * - CLS (Cumulative Layout Shift) - Visual stability
 * - FID (First Input Delay) - Interactivity
 * - LCP (Largest Contentful Paint) - Loading performance
 * - FCP (First Contentful Paint) - First content loading
 * - TTFB (Time to First Byte) - Server response time
 * - INP (Interaction to Next Paint) - Overall responsiveness
 */

const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({
      getCLS,
      getFID,
      getFCP,
      getLCP,
      getTTFB,
      getINP,
    }) => {
      // Cumulative Layout Shift - measures visual stability
      getCLS(onPerfEntry);
      
      // First Input Delay - measures interactivity
      getFID(onPerfEntry);
      
      // First Contentful Paint - measures when content first appears
      getFCP(onPerfEntry);
      
      // Largest Contentful Paint - measures loading performance
      getLCP(onPerfEntry);
      
      // Time to First Byte - measures server response time
      getTTFB(onPerfEntry);
      
      // Interaction to Next Paint - measures overall responsiveness
      getINP(onPerfEntry);
    });
  }
};

// Function to send metrics to analytics endpoint
export const sendToAnalytics = (metric) => {
  // Send to your analytics service
  const body = {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
    url: window.location.href,
    timestamp: new Date().toISOString(),
  };

  // Example: Send metrics to an analytics service
  if (window.gtag) {
    window.gtag('event', 'web_vitals', {
      event_category: 'Web Vitals',
      event_label: metric.name,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      non_interaction: true,
    });
  }

  // Example: Send to custom analytics endpoint
  if (process.env.REACT_APP_ANALYTICS_ENDPOINT) {
    navigator.sendBeacon(
      `${process.env.REACT_APP_ANALYTICS_ENDPOINT}/api/metrics/web-vitals`,
      JSON.stringify(body)
    );
  }

  // Console logging for development
  if (process.env.NODE_ENV === 'development') {
    console.log(`📊 Web Vitals - ${metric.name}: ${metric.value} (${metric.rating})`);
  }
};

// Function to check if metrics are passing
export const checkWebVitalsScore = (metric) => {
  const thresholds = {
    CLS: { good: 0.1, needsImprovement: 0.25 },
    FID: { good: 100, needsImprovement: 300 },
    LCP: { good: 2500, needsImprovement: 4000 },
    FCP: { good: 1800, needsImprovement: 3000 },
    TTFB: { good: 800, needsImprovement: 1800 },
    INP: { good: 200, needsImprovement: 500 },
  };

  const threshold = thresholds[metric.name];
  if (!threshold) return 'unknown';

  if (metric.value <= threshold.good) return 'good';
  if (metric.value <= threshold.needsImprovement) return 'needs-improvement';
  return 'poor';
};

// Function to get performance summary
export const getPerformanceSummary = (metrics) => {
  const summary = {
    good: 0,
    needsImprovement: 0,
    poor: 0,
    total: 0,
  };

  Object.values(metrics).forEach(metric => {
    const rating = checkWebVitalsScore(metric);
    summary[rating]++;
    summary.total++;
  });

  return summary;
};

export default reportWebVitals;