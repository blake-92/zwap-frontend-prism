# Zwap Frontend — Prism (Nuxt)

> **v0.16.0** · [Changelog](./CHANGELOG.md) · Deploy en Cloudflare Pages

Panel de administración para la plataforma de pagos Zwap. Migrado de React+Vite a **Nuxt 4 + Vue 3**, diseño Glassmorphism, arquitectura por feature slices.

## Stack

| Categoría | Tecnología |
|---|---|
| Framework | Nuxt 4 + Vue 3 |
| Bundler | Vite (integrado en Nuxt) |
| Routing | File-based (`app/pages/`) |
| Render mode | SPA (`ssr: false`) |
| Estilos | Tailwind CSS 4 (@tailwindcss/vite) |
| Estado | Pinia |
| Gráficas | SVG nativo (antes Recharts) |
| Animaciones | motion-v (port de Framer Motion) |
| Íconos | lucide-vue-next |
| Date picker | @vuepic/vue-datepicker |
| i18n | @nuxtjs/i18n v10 (vue-i18n v11) |
| Fonts | @nuxt/fonts (Inter + JetBrains Mono self-hosted) |

## Requisitos

- Node.js 18+
- npm 9+
- Para testing E2E: `npx playwright install chromium webkit firefox` (~200MB primera vez) y `sudo npx playwright install-deps` para libs del sistema. En WSL, WebKit requiere libs adicionales — ver CLAUDE.md sección Testing.

## Configuración inicial

```bash
npm install
cp .env.example .env    # editar si es necesario
npm run dev             # http://localhost:3000
```

## Scripts

### Desarrollo

```bash
npm run dev       # Dev server con HMR en :3000
npm run build     # Build de producción → dist/ (preset Cloudflare Pages)
npm run generate  # Prerender estático
npm run preview   # Preview del build
```

### Testing

```bash
npm test                 # 431 unit tests (Vitest, ~3s)
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage con thresholds (utils/composables ≥80%, stores ≥75%)
npm run test:e2e         # 358 E2E cross-browser (7 projects, ~5min)
npm run test:e2e:ui      # Playwright UI Mode (visible en Windows vía WSLg)
npm run test:e2e:headed  # E2E desktop-chromium con ventana visible
npm run test:a11y        # axe a11y scans (22 tests)
npm run test:ssr         # Placeholder para Phase 7 (SSR híbrido)
npm run test:lhci        # Lighthouse CI (budgets LCP/CLS/TBT)
npm run test:security    # npm audit (production, high+)
npm run test:all         # Unit + E2E completo
```

## Variables de entorno

| Variable | Descripción |
|---|---|
| `NUXT_PUBLIC_API_URL` | URL base de la API de Zwap (default: `http://localhost:3000/api`) |

## Estructura de carpetas

```
app/
├── pages/                          # Rutas (file-based)
│   ├── login.vue
│   ├── app/
│   │   ├── dashboard.vue
│   │   ├── transacciones.vue
│   │   ├── links.vue
│   │   ├── liquidaciones.vue
│   │   ├── wallet.vue
│   │   ├── sucursales.vue
│   │   ├── usuarios.vue
│   │   └── configuracion.vue
│   ├── legal/[doc].vue             # ruta dinámica
│   └── [...slug].vue               # catch-all → /login
│
├── layouts/
│   └── default.vue                 # AppShell (Sidebar + Header + main + BottomNav)
│
├── middleware/
│   └── auth.js                     # cookie zwap_token gate
│
├── components/
│   ├── ui/                         # 28 primitivos (Card, Button, Modal, ...)
│   ├── features/                   # Componentes por feature
│   │   ├── dashboard/
│   │   ├── links/
│   │   ├── transactions/
│   │   ├── settlements/
│   │   ├── wallet/
│   │   ├── branches/
│   │   ├── users/
│   │   └── settings/
│   ├── brand/                      # ZwapIsotipo, ZwapLogo, ZwapWordmark
│   ├── Header.vue                  # layout chrome
│   ├── Sidebar.vue
│   ├── BottomNav.vue
│   ├── GlassBackground.vue
│   └── ToastContainer.vue
│
├── stores/                         # Pinia
│   ├── theme.js                    # isDarkMode
│   ├── toast.js                    # toasts[]
│   └── viewSearch.js               # búsqueda/filtros contextuales
│
├── composables/                    # hooks
│   ├── useMediaQuery.js
│   ├── useScrollLock.js
│   ├── useModalOpen.js
│   ├── useChromeBlur.js
│   ├── useInfiniteScroll.js
│   └── useViewSearch.js
│
├── utils/                          # helpers puros
│   ├── formatCurrency.js
│   ├── cardClasses.js              # glass helpers
│   ├── springs.js                  # constantes spring
│   ├── motionVariants.js           # variantes compartidas
│   ├── routes.js                   # ROUTES
│   ├── api.js                      # HTTP client (Bearer cookie)
│   └── mockData.js                 # datos de prueba
│
├── plugins/
│   └── theme.client.js             # hydrate theme store
│
├── assets/css/
│   └── globals.css                 # Tailwind + scrollbar + keyframes
│
├── app.vue                         # <NuxtLayout><NuxtPage/>
└── error.vue                       # error page custom

i18n/
└── locales/
    ├── es.json                     # español (default)
    └── en.json                     # inglés

public/
├── favicon.svg
└── _headers                        # Cloudflare cache
```

## Arquitectura

El proyecto sigue **Bulletproof React** adaptado a Vue (vertical slices por feature):

- Cada `components/features/<nombre>/` es autónomo: vista, modales y estado local.
- Las vistas no reciben callbacks desde el padre — usan `navigateTo(...)` para rutas y `ref` para modales propios.
- `layouts/default.vue` solo provee layout (Sidebar/BottomNav + Header + `<NuxtPage />`), sin orquestar estado de features.
- Code splitting automático: Nuxt carga cada ruta lazy.
- Responsive: Sidebar en desktop (≥1024px), BottomNav en mobile/tablet.

## Autenticación (mock)

El login guarda `zwap_token` como cookie (`useCookie('zwap_token')`). El middleware `auth` en `/app/*` redirige a `/login` si la cookie no existe.

## Diseño

**Prism UI**: glassmorphism con backdrop-blur, paleta púrpura (`#7C3AED` / `#561BAF`), soporte dark/light mode mediante `useThemeStore`. Animaciones spring-first con motion-v. Ver [prism-ui.md](./prism-ui.md).

## Internacionalización

Soporte bilingüe español/inglés con `@nuxtjs/i18n` (vue-i18n v9). Idioma por defecto: español. Selector en Settings > Mi Perfil. Persistencia en cookie `zwap-language`. Locales en `i18n/locales/`.

**Convenciones vue-i18n** (distinto de react-i18next):
- Interpolación: `{var}` (llaves simples, NO `{{var}}`)
- Pluralización: pipe `"singular | plural"` (NO `_one`/`_other`)
- `@` en strings requiere escape `{'@'}` o `\u0040` (reservado para linked-message syntax)

## Features principales

| Módulo | Descripción |
|---|---|
| **Dashboard** | KPIs, gráficas SVG custom, live feed, triage de pending links, QR swipeable mobile, header fusionado |
| **Transactions** | Historial con filtros, recibos, reembolsos, SwipeableCard en mobile |
| **Payment Links** | Permanentes (cards/swipeable) + custom CRUD, fee split configurable, DatePicker |
| **Settlements** | Cierres diarios, KPIs, filtros, CSV export |
| **Wallet** | Balance, retiros, stepper, filtros |
| **Branches** | Grid de cards + modal |
| **Users** | Tabla + filtros por rol/estado |
| **Settings** | Perfil, seguridad, facturación con búsqueda tipo WhatsApp |

## Búsqueda y filtros

La barra del Header se conecta a la vista activa via `useViewSearchStore` (Pinia). Cada vista registra su placeholder mediante `useViewSearch(t('key'))`. En mobile, la barra se expande inline con spring. Las vistas con filtros muestran indicador en el Header, y ofrecen reset via `TableToolbar`.

## Experiencia nativa

- **Touch feedback:** variants `active:` en botones y cards interactivos.
- **Sin selección de texto:** `user-select: none` global, excepciones para inputs/tablas/código.
- **Toasts responsivos:** centrados abajo en mobile, esquina inferior derecha en desktop; versiones cortas para mobile.
- **PageHeader oculto en mobile:** BottomNav provee contexto; botón de acción full-width separado.

## Testing

Stack de QA automatizado: **Vitest** (unit/component) + **Playwright** (E2E cross-browser) + **@axe-core/playwright** (a11y) + **@lhci/cli** (Lighthouse) + **MSW** (API mocking).

- **431 unit tests** (`tests/unit/`) — utils puros, composables (incluidos DOM-dependent con happy-dom stubs), stores Pinia, y 27 componentes UI con `@vue/test-utils`. Coverage global: 94.45% statements / 98.36% lines.
- **358 E2E tests** (`tests/e2e/`) — 7 projects en matriz: `desktop-chromium`, `desktop-firefox`, `desktop-webkit`, `tablet-ipad-chromium`, `tablet-ipad-webkit`, `mobile-pixel7`, `mobile-iphone14`. Smoke, interacciones, error states, visual regression, a11y, cross-engine parity.
- **48 visual baselines** — selectivos en `desktop-chromium` + `mobile-pixel7` (4 vistas × 3 tiers × 2 themes × 2 projects). Tolerance 3%. Otros projects validan layout sin screenshots.
- **59 i18n parity tests** — shape es↔en, sintaxis vue-i18n v11, coverage de keys críticas.
- **22 a11y scans** — axe en 10 rutas × 2 projects con política `critical` → FAIL, `serious` → WARN.

### Flujo de validación manual (etapa actual, solo-dev)

Cloudflare Pages está conectado al repo y despliega automáticamente cada push a `main` (y preview en `concepts`). El flujo recomendado:

1. **Cambios locales** en rama `concepts`.
2. **`npm test`** (siempre, ~3s) — bloquea regresiones unit.
3. **`npm run test:e2e`** (antes de merge a `main`, ~5min) — cross-browser smoke + interactions.
4. **Análisis** de resultados — logs, screenshots de failure en `test-results/`, trace viewer (`npx playwright show-trace <zip>`).
5. **`git commit`** — si todo verde.
6. **`git push origin concepts`** — Cloudflare genera preview deploy.
7. **Merge a `main`** → Cloudflare promueve a producción.

> **Opcional** — `npm run test:coverage` antes de merges grandes, `npm run test:a11y` si tocaste markup/componentes, `npm run test:lhci` si el bundle cambió significativamente.

### Cuándo escalar a CI automatizado

El flujo manual es suficiente mientras:
- Seas el único dev (no hay disciplina compartida que falle)
- La app esté en desarrollo temprano (bugs en producción son tolerables)
- Tengas <5 deploys/semana

**Disparadores para activar GitHub Actions** (Phase 6 del [Roadmap QA](#roadmap-qa)):
- Sumás un segundo dev (pair / freelancer)
- La app tiene usuarios reales con expectativa de uptime
- Frecuencia de deploys ≥5/semana
- Querés reports públicos de coverage/a11y/perf en cada PR

## Deploy

Build configurado para **Cloudflare Pages** via `nitro.preset: 'cloudflare-pages'`. Output en `dist/`:

```bash
npm run build
npx wrangler pages deploy dist --project-name=zwap-prism
```

Si alguna lib requiere Node compat, agregar en `wrangler.toml`:
```toml
compatibility_flags = ["nodejs_compat"]
```

## Roadmap QA

Fases diferidas — se activan cuando los [triggers](#cuándo-escalar-a-ci-automatizado) aparezcan.

### Phase 6 — GitHub Actions CI + deploy automatizado

Matrix paralelo: lint → typecheck → unit → E2E (× 5 projects sharded) → a11y → Lighthouse → build → security (`npm audit` + Snyk + gitleaks). Si todo verde, deploy automático a Cloudflare Pages via `cloudflare/wrangler-action`. Gate de calidad real: PR con test rojo no mergea. ~8min por PR con sharding + cache.

### Phase 7 — SSR híbrido

`nuxt.config.ts` → `ssr: true` + `routeRules`:
- `/login` → SSR runtime (HTML server-rendered, mejor FCP/SEO)
- `/legal/**` → prerender estático (CDN, zero server cost)
- `/app/**` → SPA (actual, hidratación client)

Requiere auditoría de guards SSR (mayoría ya en place: stores con `typeof window`, plugins `.client`).

### Phase 8 — Observability + incident response

**Sentry** (`@sentry/vue` + `@sentry/nuxt`) para runtime errors en prod con filtro de fields sensibles. **Post-deploy smoke** (curl /login, /legal/terminos, /app/dashboard redirect → login) tras `wrangler pages deploy`. **Rollback script** (`scripts/rollback.sh` usando `wrangler pages deployment rollback`). **Testing playbook** en CLAUDE.md con convenciones + templates por capa.

## Versionamiento

[SemVer](https://semver.org/lang/es/). `0.x.x` = pre-release. Parches de seguridad bajo `### Security` en el CHANGELOG.
