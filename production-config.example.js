/**
 * PRODUCTION DEPLOYMENT CONFIGURATION
 *
 * This file contains all the configuration settings you should implement
 * before making your app public. Copy these settings to your actual
 * environment variables or config files.
 */

export const PRODUCTION_CONFIG = {
  // ===== FIREBASE CONFIGURATION =====
  firebase: {
    // Your Firebase project configuration
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
  },

  // ===== COST PROTECTION =====
  costProtection: {
    enabled: true,

    // Budget limits (USD)
    budgetLimits: {
      daily: 10,
      weekly: 50,
      monthly: 200,
    },

    // Emergency shutdown thresholds
    emergencyThresholds: {
      costPerHour: 5, // $5/hour = $120/day
      readsPerHour: 50000, // 50K reads/hour
      writesPerHour: 5000, // 5K writes/hour
    },

    // Alert thresholds (percentages)
    alertThresholds: [25, 50, 75, 90, 100],
  },

  // ===== SECURITY SETTINGS =====
  security: {
    // Rate limiting
    rateLimiting: {
      enabled: true,
      guestMultiplier: 0.5, // Guests get 50% of registered limits
      limits: {
        readsPerMinute: 1000,
        writesPerMinute: 100,
        deletesPerMinute: 50,
        functionsPerMinute: 200,
      },
    },

    // Data validation
    validation: {
      strict: true,
      maxStringLengths: {
        binderName: 100,
        description: 500,
        displayName: 50,
        email: 100,
        cardName: 100,
      },
      maxNumericValues: {
        pageCount: 200,
        cardValue: 999999,
        binderCount: 50,
        cardsPerBinder: 500,
      },
    },

    // Session management
    session: {
      timeoutMinutes: 30,
      extendOnActivity: true,
      maxConcurrentSessions: 3,
    },

    // File upload restrictions
    uploads: {
      maxFileSizeMB: 5,
      allowedTypes: ["image/jpeg", "image/png", "image/webp"],
      scanForMalware: true,
    },
  },

  // ===== USER LIMITS =====
  userLimits: {
    guest: {
      maxBinders: 3,
      maxCardsPerBinder: 50,
      maxPages: 10,
      restrictedFeatures: [
        "sharing",
        "export",
        "bulkOperations",
        "advancedSearch",
        "statistics",
        "backup",
      ],
    },
    registered: {
      maxBinders: 25,
      maxCardsPerBinder: 400,
      maxPages: 50,
      fullFeatureAccess: true,
    },
  },

  // ===== MONITORING & ALERTING =====
  monitoring: {
    // Error tracking
    errorReporting: {
      enabled: true,
      level: "warn", // 'debug', 'info', 'warn', 'error'
      includePII: false,
    },

    // Performance monitoring
    performance: {
      enabled: true,
      sampleRate: 0.1, // Monitor 10% of sessions
      trackUserInteractions: true,
      trackNetworkRequests: true,
    },

    // Usage analytics
    analytics: {
      enabled: true,
      trackPageViews: true,
      trackUserActions: true,
      respectDoNotTrack: true,
    },

    // Health checks
    healthChecks: {
      interval: 300000, // 5 minutes
      endpoints: ["/api/health", "/api/firebase-status", "/api/cost-status"],
    },
  },

  // ===== NOTIFICATION SETTINGS =====
  notifications: {
    // Email alerts
    email: {
      budgetAlerts: ["admin@yourapp.com"],
      errorAlerts: ["dev@yourapp.com"],
      securityAlerts: ["security@yourapp.com"],
    },

    // Slack integration (optional)
    slack: {
      enabled: false,
      webhookUrl: process.env.SLACK_WEBHOOK_URL,
      channels: {
        alerts: "#alerts",
        errors: "#errors",
        budget: "#budget",
      },
    },

    // SMS alerts for critical issues
    sms: {
      enabled: false,
      provider: "twilio", // or 'aws-sns'
      emergencyNumbers: ["+1234567890"],
    },
  },

  // ===== BACKUP & RECOVERY =====
  backup: {
    // Automated backups
    enabled: true,
    frequency: "daily",
    retention: {
      daily: 7, // Keep 7 daily backups
      weekly: 4, // Keep 4 weekly backups
      monthly: 12, // Keep 12 monthly backups
    },

    // Backup locations
    destinations: [
      "firebase-storage",
      "aws-s3", // Optional secondary backup
    ],
  },

  // ===== FEATURE FLAGS =====
  features: {
    guestAccess: true,
    socialLogin: true,
    emailVerification: true,
    exportFeatures: true,
    sharingFeatures: true,
    advancedSearch: true,
    statistics: true,
    adminDashboard: true,
  },

  // ===== CACHING STRATEGY =====
  caching: {
    // Client-side cache
    client: {
      duration: 600000, // 10 minutes
      maxSize: 50, // Max 50MB
      compression: true,
    },

    // CDN caching
    cdn: {
      enabled: true,
      staticAssetsTTL: 31536000, // 1 year
      dynamicContentTTL: 3600, // 1 hour
    },
  },

  // ===== LEGAL & COMPLIANCE =====
  compliance: {
    // GDPR compliance
    gdpr: {
      enabled: true,
      cookieConsent: true,
      dataExport: true,
      dataDelection: true,
    },

    // Privacy settings
    privacy: {
      anonymizeIPs: true,
      dataDeletionPolicy: 365, // Delete after 1 year
      termsVersion: "1.0",
      privacyPolicyVersion: "1.0",
    },
  },
};

// ===== PRODUCTION CHECKLIST =====
export const PRODUCTION_CHECKLIST = {
  "🔥 Firebase Setup": [
    "✅ Blaze plan activated for cost control",
    "✅ Budget alerts configured (1%, 50%, 100%, 150%)",
    "✅ Security rules deployed",
    "✅ Firestore indexes optimized",
    "⚠️ Consider Flame Shield for kill switch",
  ],

  "🛡️ Security": [
    "✅ Rate limiting implemented",
    "✅ Input validation on all forms",
    "✅ Server-side validation enforced",
    "✅ Authentication required for all operations",
    "✅ Role-based access control",
    "⚠️ Regular security audits scheduled",
  ],

  "💰 Cost Protection": [
    "⚠️ Daily budget alerts configured",
    "⚠️ Emergency shutdown mechanism",
    "⚠️ Usage monitoring dashboard",
    "⚠️ Cost estimation for operations",
    "⚠️ Rate limiting to prevent abuse",
  ],

  "📊 Monitoring": [
    "⚠️ Error tracking (Sentry/LogRocket)",
    "⚠️ Performance monitoring",
    "⚠️ Usage analytics",
    "⚠️ Health check endpoints",
    "⚠️ Alert notification channels",
  ],

  "🔄 Backup & Recovery": [
    "⚠️ Automated daily backups",
    "⚠️ Backup verification process",
    "⚠️ Recovery procedures documented",
    "⚠️ Data retention policies",
  ],

  "⚖️ Legal & Compliance": [
    "⚠️ Terms of Service",
    "⚠️ Privacy Policy",
    "⚠️ GDPR compliance (if applicable)",
    "⚠️ Cookie consent",
    "⚠️ Data export/deletion features",
  ],

  "🚀 Performance": [
    "✅ Code splitting and lazy loading",
    "✅ Image optimization",
    "✅ CDN configuration",
    "⚠️ Load testing completed",
    "⚠️ Performance budgets set",
  ],
};

// Usage: Review and implement all items marked with ⚠️ before going public
