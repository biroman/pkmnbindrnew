import { useState, useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

// ===== FIREBASE READ TRACKING =====

export const useFirebaseReadTracker = () => {
  const [reads, setReads] = useState(0);
  const [writes, setWrites] = useState(0);
  const [cacheHits, setCacheHits] = useState(0);
  const [networkRequests, setNetworkRequests] = useState(0);
  const startTime = useRef(Date.now());

  const trackRead = useCallback(() => setReads((prev) => prev + 1), []);
  const trackWrite = useCallback(() => setWrites((prev) => prev + 1), []);
  const trackCacheHit = useCallback(() => setCacheHits((prev) => prev + 1), []);
  const trackNetworkRequest = useCallback(
    () => setNetworkRequests((prev) => prev + 1),
    []
  );

  const getStats = useCallback(
    () => ({
      reads,
      writes,
      cacheHits,
      networkRequests,
      sessionDuration: Math.round((Date.now() - startTime.current) / 1000),
      cacheHitRate:
        networkRequests > 0
          ? ((cacheHits / (cacheHits + networkRequests)) * 100).toFixed(1)
          : 0,
    }),
    [reads, writes, cacheHits, networkRequests]
  );

  const reset = useCallback(() => {
    setReads(0);
    setWrites(0);
    setCacheHits(0);
    setNetworkRequests(0);
    startTime.current = Date.now();
  }, []);

  return {
    trackRead,
    trackWrite,
    trackCacheHit,
    trackNetworkRequest,
    getStats,
    reset,
    stats: getStats(),
  };
};

// ===== QUERY PERFORMANCE MONITORING =====

export const useQueryPerformanceMonitor = () => {
  const queryClient = useQueryClient();
  const [queryMetrics, setQueryMetrics] = useState({});

  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      const queryKey = JSON.stringify(event.query.queryKey);
      const now = Date.now();

      setQueryMetrics((prev) => {
        const existing = prev[queryKey] || {
          fetchCount: 0,
          errorCount: 0,
          successCount: 0,
          totalTime: 0,
          avgTime: 0,
          lastFetch: null,
          dataSource: "unknown",
        };

        let updated = { ...existing };

        switch (event.type) {
          case "observerAdded":
            // Query started
            updated.lastFetch = now;
            updated.fetchCount += 1;
            break;

          case "observerResultsUpdated":
            // Query completed
            if (existing.lastFetch) {
              const fetchTime = now - existing.lastFetch;
              updated.totalTime += fetchTime;
              updated.avgTime = updated.totalTime / updated.fetchCount;
            }

            if (event.query.state.status === "success") {
              updated.successCount += 1;
              // Determine data source
              if (
                event.query.state.dataUpdatedAt ===
                event.query.state.dataFetchedAt
              ) {
                updated.dataSource = "network";
              } else {
                updated.dataSource = "cache";
              }
            } else if (event.query.state.status === "error") {
              updated.errorCount += 1;
            }
            break;
        }

        return { ...prev, [queryKey]: updated };
      });
    });

    return unsubscribe;
  }, [queryClient]);

  const getTopQueries = (limit = 5) => {
    return Object.entries(queryMetrics)
      .sort(([, a], [, b]) => b.fetchCount - a.fetchCount)
      .slice(0, limit)
      .map(([key, metrics]) => ({ queryKey: key, ...metrics }));
  };

  const getSlowestQueries = (limit = 5) => {
    return Object.entries(queryMetrics)
      .filter(([, metrics]) => metrics.avgTime > 0)
      .sort(([, a], [, b]) => b.avgTime - a.avgTime)
      .slice(0, limit)
      .map(([key, metrics]) => ({ queryKey: key, ...metrics }));
  };

  return {
    queryMetrics,
    getTopQueries,
    getSlowestQueries,
  };
};

// ===== PAGE LOAD PERFORMANCE =====

export const usePageLoadPerformance = () => {
  const [pageMetrics, setPageMetrics] = useState({
    loadTime: 0,
    timeToFirstByte: 0,
    domContentLoaded: 0,
    firstPaint: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
  });

  useEffect(() => {
    const measurePerformance = () => {
      if (typeof window !== "undefined" && window.performance) {
        const navigation = performance.getEntriesByType("navigation")[0];
        const paint = performance.getEntriesByType("paint");

        const metrics = {
          loadTime: navigation?.loadEventEnd - navigation?.navigationStart || 0,
          timeToFirstByte:
            navigation?.responseStart - navigation?.navigationStart || 0,
          domContentLoaded:
            navigation?.domContentLoadedEventEnd -
              navigation?.navigationStart || 0,
          firstPaint:
            paint.find((p) => p.name === "first-paint")?.startTime || 0,
          firstContentfulPaint:
            paint.find((p) => p.name === "first-contentful-paint")?.startTime ||
            0,
        };

        // Largest Contentful Paint
        if ("PerformanceObserver" in window) {
          try {
            const observer = new PerformanceObserver((list) => {
              const entries = list.getEntries();
              const lastEntry = entries[entries.length - 1];
              metrics.largestContentfulPaint = lastEntry?.startTime || 0;
              setPageMetrics(metrics);
            });
            observer.observe({ entryTypes: ["largest-contentful-paint"] });
          } catch (e) {
            setPageMetrics(metrics);
          }
        } else {
          setPageMetrics(metrics);
        }
      }
    };

    // Measure after page load
    if (document.readyState === "complete") {
      measurePerformance();
    } else {
      window.addEventListener("load", measurePerformance);
      return () => window.removeEventListener("load", measurePerformance);
    }
  }, []);

  const getPerformanceGrade = () => {
    const { loadTime, firstContentfulPaint, largestContentfulPaint } =
      pageMetrics;

    let score = 100;

    // Deduct points for slow metrics
    if (loadTime > 3000) score -= 20;
    else if (loadTime > 2000) score -= 10;

    if (firstContentfulPaint > 2500) score -= 15;
    else if (firstContentfulPaint > 1800) score -= 8;

    if (largestContentfulPaint > 4000) score -= 25;
    else if (largestContentfulPaint > 2500) score -= 15;

    if (score >= 90) return { grade: "A", color: "green" };
    if (score >= 80) return { grade: "B", color: "blue" };
    if (score >= 70) return { grade: "C", color: "yellow" };
    if (score >= 60) return { grade: "D", color: "orange" };
    return { grade: "F", color: "red" };
  };

  return {
    pageMetrics,
    getPerformanceGrade,
  };
};

// ===== MEMORY USAGE MONITORING =====

export const useMemoryMonitoring = () => {
  const [memoryInfo, setMemoryInfo] = useState(null);

  useEffect(() => {
    const updateMemoryInfo = () => {
      if (performance.memory) {
        setMemoryInfo({
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
          usedPercentage: (
            (performance.memory.usedJSHeapSize /
              performance.memory.jsHeapSizeLimit) *
            100
          ).toFixed(1),
        });
      }
    };

    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return {
    memoryInfo,
    formatBytes,
  };
};

// ===== BUNDLE SIZE & OPTIMIZATION TRACKING =====

export const useBundleOptimization = () => {
  const [bundleMetrics, setBundleMetrics] = useState({
    totalScripts: 0,
    totalStylesheets: 0,
    totalSize: 0,
    lazyLoadedModules: 0,
  });

  useEffect(() => {
    const calculateBundleMetrics = () => {
      const scripts = document.querySelectorAll("script[src]");
      const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');

      setBundleMetrics({
        totalScripts: scripts.length,
        totalStylesheets: stylesheets.length,
        totalSize: 0, // Would need webpack-bundle-analyzer for actual size
        lazyLoadedModules: 0, // Track via dynamic imports
      });
    };

    calculateBundleMetrics();
  }, []);

  return bundleMetrics;
};

// ===== COMPREHENSIVE PERFORMANCE DASHBOARD =====

export const usePerformanceDashboard = () => {
  const firebaseTracker = useFirebaseReadTracker();
  const queryMonitor = useQueryPerformanceMonitor();
  const pageLoad = usePageLoadPerformance();
  const memory = useMemoryMonitoring();
  const bundle = useBundleOptimization();

  const getOverallScore = () => {
    const pageGrade = pageLoad.getPerformanceGrade();
    const cacheHitRate = parseFloat(firebaseTracker.stats.cacheHitRate);

    let score = 0;

    // Page performance (40% weight)
    const gradeValues = { A: 100, B: 85, C: 70, D: 60, F: 40 };
    score += (gradeValues[pageGrade.grade] || 40) * 0.4;

    // Cache efficiency (35% weight)
    score += cacheHitRate * 0.35;

    // Memory usage (25% weight)
    if (memory.memoryInfo) {
      const memoryScore = Math.max(
        0,
        100 - parseFloat(memory.memoryInfo.usedPercentage)
      );
      score += memoryScore * 0.25;
    } else {
      score += 85 * 0.25; // Default score if memory info unavailable
    }

    return Math.round(score);
  };

  const getOptimizationSuggestions = () => {
    const suggestions = [];
    const cacheHitRate = parseFloat(firebaseTracker.stats.cacheHitRate);
    const pageGrade = pageLoad.getPerformanceGrade();

    if (cacheHitRate < 80) {
      suggestions.push(
        "Improve cache hit rate by implementing better caching strategies"
      );
    }

    if (
      pageGrade.grade === "C" ||
      pageGrade.grade === "D" ||
      pageGrade.grade === "F"
    ) {
      suggestions.push(
        "Optimize page load times by reducing bundle size or lazy loading"
      );
    }

    if (
      memory.memoryInfo &&
      parseFloat(memory.memoryInfo.usedPercentage) > 80
    ) {
      suggestions.push(
        "High memory usage detected - consider implementing memory optimization"
      );
    }

    if (firebaseTracker.stats.reads > 50 && cacheHitRate < 60) {
      suggestions.push(
        "High Firebase read count with low cache efficiency - review query patterns"
      );
    }

    return suggestions;
  };

  return {
    firebaseStats: firebaseTracker.stats,
    queryMetrics: queryMonitor.queryMetrics,
    pageMetrics: pageLoad.pageMetrics,
    memoryInfo: memory.memoryInfo,
    bundleMetrics: bundle,
    overallScore: getOverallScore(),
    pageGrade: pageLoad.getPerformanceGrade(),
    topQueries: queryMonitor.getTopQueries(),
    slowestQueries: queryMonitor.getSlowestQueries(),
    suggestions: getOptimizationSuggestions(),
    resetTracking: firebaseTracker.reset,
    formatBytes: memory.formatBytes,
  };
};
