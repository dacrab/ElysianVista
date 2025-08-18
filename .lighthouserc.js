module.exports = {
  ci: {
    collect: {
      // Number of runs to perform
      numberOfRuns: 3,

      // Configure Chrome settings for consistent results
      settings: {
        // Disable device emulation for more accurate results
        emulatedFormFactor: 'desktop',

        // Set throttling for consistent network conditions
        throttling: {
          rttMs: 40,
          throughputKbps: 10 * 1024,
          cpuSlowdownMultiplier: 1,
          requestLatencyMs: 0,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0,
        },

        // Chrome launch options
        chromeFlags: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--headless'],
      },
    },

    assert: {
      // Performance thresholds
      assertions: {
        'categories:performance': ['warn', { minScore: 0.7 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.8 }],

        // Specific metrics
        'first-contentful-paint': ['warn', { maxNumericValue: 3000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 4000 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],

        // Progressive Web App basics
        'installable-manifest': 'off',
        'splash-screen': 'off',
        'themed-omnibox': 'off',

        // Resource efficiency
        'unused-javascript': ['warn', { maxLength: 3 }],
        'unused-css-rules': ['warn', { maxLength: 3 }],
        'render-blocking-resources': ['warn', { maxLength: 1 }],

        // Image optimization
        'uses-optimized-images': ['warn', { maxLength: 0 }],
        'uses-webp-images': ['warn', { maxLength: 0 }],
        'uses-responsive-images': ['warn', { maxLength: 0 }],

        // Modern practices
        'uses-http2': ['warn', { maxLength: 0 }],
        'uses-text-compression': ['warn', { maxLength: 0 }],

        // Security
        'is-on-https': ['error', { maxLength: 0 }],
        'external-anchors-use-rel-noopener': ['error', { maxLength: 0 }],
      },

      // Preset configurations
      preset: 'lighthouse:no-pwa',
    },

    upload: {
      // Upload to temporary public storage for GitHub Actions
      target: 'temporary-public-storage',
    },

    server: {
      // Server configuration for local testing
      command: 'bun run preview',
      port: 4173,

      // Wait for server to be ready
      timeoutMs: 60000,
    },
  },
};
