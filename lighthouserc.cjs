/**
 * Lighthouse CI — performance budgets + a11y/best-practices scores.
 *
 * Corre contra `nuxt preview` (build prod) en rutas públicas. Las rutas privadas
 * requieren auth cookie — se agregan via puppeteerScript en iteración futura.
 *
 * Primera iteración: budgets relajados para establecer baseline. Subir thresholds
 * progresivamente conforme el equipo optimice.
 */
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run preview',
      startServerReadyPattern: 'Listening on|Local:|3000',
      startServerReadyTimeout: 60_000,
      url: [
        'http://localhost:3000/login',
        'http://localhost:3000/legal/terminos',
      ],
      numberOfRuns: 3,
      settings: {
        // Lighthouse en headless Chrome usando el binario que Playwright ya descargó.
        chromePath: require('playwright').chromium.executablePath(),
        chromeFlags: '--no-sandbox --headless=new --disable-dev-shm-usage',
        // Desktop form factor por default — mobile puede añadirse con un config adicional.
        preset: 'desktop',
      },
    },
    assert: {
      assertions: {
        // NOTA: `categories:performance` produce NaN en headless WSL (bug conocido
        // del Lighthouse runner con Chromium de Playwright). Mantenemos `off`
        // hasta que se investigue alternativa. Los audits individuales (LCP, CLS,
        // TBT) SÍ reportan valores correctos y son los que realmente importan.
        'categories:performance': 'off',
        'categories:accessibility': ['error', { minScore: 0.85 }],
        'categories:best-practices': ['warn', { minScore: 0.85 }],
        'categories:seo': ['warn', { minScore: 0.85 }],

        // Core Web Vitals — baseline relajado; ajustar conforme se optimice el bundle
        'largest-contentful-paint': ['warn', { maxNumericValue: 10_000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 1_500 }],
      },
    },
    upload: {
      // Modo temporary-public-storage: upload a Lighthouse CI servers públicos
      // (sin auth, retención corta). Para CI dedicado, cambiar a server propio.
      target: 'temporary-public-storage',
    },
  },
}
