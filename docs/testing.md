# Testing — Zwap Frontend Prism

Stack: **Vitest** (unit/component) + **Playwright** (E2E cross-browser) + **@axe-core/playwright** (a11y) + **@lhci/cli** (Lighthouse) + **MSW** (mocking API). **789 tests verdes** (431 unit + 358 E2E).

## Estructura

```
tests/
├── unit/
│   ├── utils/            # specs de app/utils/*.js
│   ├── composables/      # specs de app/composables/*.js (con happy-dom stubs)
│   ├── stores/           # specs de app/stores/*.js (Pinia)
│   ├── i18n/parity.spec.ts   # shape es↔en + sintaxis vue-i18n
│   └── helpers/
│       ├── setup.ts          # matchMedia/IO/RO stubs + mock motion-v global
│       ├── withSetup.ts      # ejecuta composable dentro de componente Vue
│       ├── mountComponent.ts # mount con Pinia + i18n + Nuxt auto-import stubs
│       └── motionStub.ts     # Proxy que reemplaza <motion.X> con wrappers
│
├── component/
│   └── ui/               # specs de app/components/ui/*.vue (27 componentes)
│
├── e2e/
│   ├── fixtures.ts       # test extendido con setTier/setTheme/mockAuth/consoleErrors
│   ├── smoke.spec.ts
│   ├── interactions.spec.ts
│   ├── console.spec.ts
│   ├── error-states.spec.ts  # auth resilience + MSW route interceptors
│   ├── visual.spec.ts    # 48 baselines en 2 projects selectivos
│   ├── a11y.spec.ts      # axe en 10 rutas × 2 projects
│   ├── cross-engine.spec.ts  # validation en los 7 projects sin screenshot
│   └── visual.spec.ts-snapshots/   # PNGs baseline (commiteados)
│
├── mocks/
│   ├── handlers.ts       # MSW handlers /api/*
│   ├── node.ts           # setup para Vitest
│   └── browser.ts        # setup para Playwright (si usa SW)
│
└── factories/index.ts    # buildTransaction/User/Link/Payout + faker seeded
```

## Convenciones

1. **Unit** (Vitest + happy-dom): `tests/unit/<layer>/<name>.spec.ts`. Lógica pura (utils, composables, stores, funciones). Sin DOM real salvo que el composable lo requiera — en ese caso usar `withSetup(fn)` helper.
2. **Component** (Vitest + @vue/test-utils + `mountComponent`): `tests/component/ui/<Name>.spec.ts`. Props/events/slots + branches por tier. Mock global de motion-v ya aplicado.
3. **E2E** (Playwright): `tests/e2e/<name>.spec.ts`. Usar fixtures (`setTier`, `setTheme`, `mockAuth`, `consoleErrors`, `waitForUIReady`). `reducedMotion: 'reduce'` global anula loops `repeat: Infinity`.

## Matriz Playwright (7 projects)

`desktop-chromium` (1440×900), `desktop-firefox`, `desktop-webkit` (Safari desktop proxy), `tablet-ipad-chromium`, `tablet-ipad-webkit` (Safari iPad), `mobile-pixel7` (Android Chromium), `mobile-iphone14` (Safari mobile).

## Política A11y

`critical` (button-name, aria-valid, label, etc.) → **FAIL**. `serious/moderate/minor` (color-contrast en UX secondary, etc.) → **WARN logueado**. El contraste de texto deshabilitado/secundario es decisión UX documentada en Prism; fallar en cada corrida rompería DX.

## Visual regression selectivo

Solo 2 projects baseline: `desktop-chromium` + `mobile-pixel7`. Los otros 5 projects corren los mismos specs pero sin screenshot compare (validan layout con `expect(locator).toBeVisible()` + `toHaveCSS`). Tolerance 3%. Masked: `.animate-spin, .animate-pulse, .prism-qr-shimmer`.

## Mock motion-v

`tests/unit/helpers/setup.ts` registra `vi.mock('motion-v', () => motionStub)` globalmente. El stub usa Proxy para reemplazar cualquier `<motion.X>` con un wrapper simple que:
- Descarta props motion (`initial`, `animate`, `transition`, `drag`, `whileHover`, `layout-id`, etc.)
- Preserva slots, `$attrs` no-motion (incluido `aria-label`), y event listeners.
- Neutraliza `repeat: Infinity` (evita timers colgados en tests).

`AnimatePresence`, `LayoutGroup`, y `useAnimationControls` también stubbeados.

## Flujo de validación manual

```
cambios locales
  → npm test                (siempre, ~3s)
  → npm run test:e2e        (antes de merge a main, ~5min)
  → análisis de results
  → git commit en rama concepts
  → git push                Cloudflare auto-deploy
```

Ver `README.md#testing` para comandos completos y triggers para escalar a CI automatizado (Phase 6).

## Scripts relevantes

- `npm test` / `npm run test:watch` / `npm run test:coverage`
- `npm run test:e2e` / `npm run test:e2e:ui` (UI Mode, visible via WSLg) / `npm run test:e2e:headed`
- `npm run test:a11y` / `npm run test:lhci`

## Lighthouse CI caveat en WSL

`categories.performance` OFF temporalmente por NaN en runner headless WSL (bug conocido chrome-launcher). Audits individuales (LCP, CLS, TBT) sí reportan correcto. Script `test:lhci` inyecta `CHROME_PATH` resolviendo a `require('playwright').chromium.executablePath()` porque el runner por default buscaba binario en path Windows.
