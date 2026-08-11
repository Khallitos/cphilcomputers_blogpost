/**
 * Lighthouse CI config — budget checks for the blog.
 * Runs `lhci autorun` in CI after `npm run build`: boots the production
 * server via `next start` and audits / and /blog against hard budgets.
 */
module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      startServerCommand: "npm run start",
      startServerReadyPattern: "Ready in",
      startServerReadyTimeout: 60000,
      url: ["http://localhost:3000/", "http://localhost:3000/blog"],
      settings: {
        preset: "desktop",
        chromeFlags: ["--no-sandbox", "--headless"],
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.95 }],
        "categories:accessibility": ["error", { minScore: 0.95 }],
        "categories:best-practices": ["error", { minScore: 0.95 }],
        "categories:seo": ["error", { minScore: 0.95 }],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: "lhci_reports",
    },
  },
};
