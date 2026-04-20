# Changelog

Todas las versiones notables del proyecto se documentan aquí.

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).
Versionamiento según [Semantic Versioning](https://semver.org/lang/es/).

---

## [0.16.0] — 2026-04-19

### Infraestructura de testing profesional

Nueva capa QA automatizada: Vitest + Playwright + axe + Lighthouse CI + MSW. Red de seguridad para los 3 performance tiers × 2 themes × responsive desktop/tablet/mobile. **789 tests verdes** (431 unit + 358 E2E cross-browser).

### Added

- **Vitest** unit/component runner con `happy-dom` — 431 tests en ~3s, coverage v8 con thresholds por capa (`utils` ≥80%, `composables` ≥80%, `stores` ≥75%).
- **Playwright E2E cross-browser** — 358 tests en 7 projects (Chromium + Firefox + WebKit × desktop + tablet iPad + mobile Pixel7/iPhone14). Neutraliza motion loops con `reducedMotion: 'reduce'` global.
- **Visual regression selectivo** — 48 baselines en `desktop-chromium` + `mobile-pixel7` (4 vistas × 3 tiers × 2 themes × 2 projects). Mask de animaciones continuas (`.animate-spin`, `.animate-pulse`, `.prism-qr-shimmer`). Tolerance 3%. Otros 5 projects validan layout sin screenshots (evita flakiness cross-engine).
- **A11y con `@axe-core/playwright`** — 22 scans (10 rutas × 2 baseline projects) con política: `critical` → FAIL, `serious/moderate/minor` → WARN. Cubre rutas públicas, privadas con `mockAuth`, y estado con modal abierto.
- **Lighthouse CI** — `lighthouserc.cjs` con budgets: `accessibility ≥0.85` (error), `best-practices/seo ≥0.85` (warn), `LCP ≤10s`, `CLS ≤0.1` (error), `TBT ≤1.5s`. Corre contra `npm run preview` (build prod).
- **MSW (Mock Service Worker)** + factories con `@faker-js/faker` — handlers de `/api/*` listos para swap cuando backend esté conectado. Error handlers (500/401/timeout/network) preparados.
- **i18n parity spec** — 59 tests: shape es↔en, no `{{var}}` (react-i18next inválido), no `@` suelto (reservado vue-i18n), no sufijos `_one`/`_other`, coverage de 24 keys críticas (incluido `calendar.monthsShort` del R3 #9).
- **Cross-engine interactions spec** — validation en los 7 projects: breakpoint lg:1024 (Sidebar↔BottomNav), iPad 834px (BottomNav), DatePickerModal `tm()`, ToastContainer teleport, `useChromeBlur` lifecycle, tier switcher html class.
- **Testing helpers** (nuevos):
  - `tests/unit/helpers/setup.ts` — stubs globales (matchMedia, IntersectionObserver, ResizeObserver), mock global de `motion-v` con Proxy para neutralizar `repeat: Infinity`.
  - `tests/unit/helpers/withSetup.ts` — corre composables dentro de componente Vue (lifecycle hooks + Pinia fresh por call).
  - `tests/unit/helpers/mountComponent.ts` — mount base con Pinia + vue-i18n + stubs de auto-imports Nuxt (`useI18n`, `useRoute`, `useCookie`, `navigateTo`, `useId`). `setup` callback entre `setActivePinia` y mount para setear store state antes del render.
  - `tests/unit/helpers/motionStub.ts` — stub Proxy que reemplaza `<motion.X>` con wrappers simples, filtra props motion (animate, transition, drag, whileHover, layout-id, etc.) y preserva slots/attrs.
- **Fixtures Playwright** en `tests/e2e/fixtures.ts`:
  - `setTier(tier)` / `setTheme(mode)` — `localStorage` via `addInitScript` pre-navigate.
  - `mockAuth()` — inyecta cookie `zwap_token` dummy para saltar middleware auth.
  - `consoleErrors` — array acumulado de `console.error` + `pageerror`.
  - `waitForUIReady(page)` — `networkidle` + `document.fonts.ready` para estabilidad visual.
- **Factories** (`tests/factories/index.ts`) — `buildTransaction`, `buildUser`, `buildLink`, `buildPayout` con faker + `seedFaker(42)` para reproducibilidad.
- **Scripts npm nuevos** (11): `test`, `test:watch`, `test:coverage`, `test:e2e`, `test:e2e:ui`, `test:e2e:headed`, `test:a11y`, `test:ssr`, `test:lhci`, `test:security`, `test:all`.
- **Dev dependencies** (13): `@playwright/test`, `vitest`, `@vitest/coverage-v8`, `@vue/test-utils`, `@nuxt/test-utils`, `happy-dom`, `@vitejs/plugin-vue`, `@axe-core/playwright`, `@lhci/cli`, `msw`, `@mswjs/data`, `@faker-js/faker`.

### Fixed

- **aria-labels regression masivo** — axe detectó 15 archivos con botones icon-only sin accessible name. Fixeado en: Pagination prev/next (+ keys `pagination.previous`/`next`), Toggle en 7 consumers (con `common.toggleFor: "Activar o desactivar {name}"`), action buttons en tablas (transactions receipt/refund, links edit/copy/qr/send, dashboard PendingCharges, wallet viewReceipt, settlements inspectBatch, users edit/delete, LinkDetailModal copy, NewLinkModal Trash disabled, QuickLinkCard Maximize, QuickLinkSwipeable copy/open).

### Notes

- **Lighthouse `categories.performance`** temporalmente desactivado (`'off'`) por NaN en runner headless WSL (bug conocido del chrome-launcher). Audits individuales (LCP, CLS, TBT) sí reportan valores correctos.
- **Baseline LCP /login**: ~10.3s en preview — apenas sobre threshold. Candidatos optimización: `@vuepic/vue-datepicker` lazy-load, `motion-v` code-split, icons tree-shake.
- **WebKit en WSL**: requiere libs adicionales del sistema (`libnspr4`, `libnss3`, `libasound2t64`, `libcups2`, `libxss1`, + WebKit-specific libs). Documentado en helpers; `sudo npx playwright install-deps` una vez.
- **Visual regression** solo en 2 projects baseline para evitar flakiness cross-engine por font rendering. Firefox/WebKit corren los mismos specs con layout assertions (no screenshot compare).
- **Copy-link toast test** Chromium-only — `grantPermissions(['clipboard-*'])` es API solo-Chromium en Playwright.

---

## [0.15.0] — 2026-04-19

### QA hardening en 3 rondas (R1 critical fixes · R2 refactors · R3 safety/a11y)

Auditoría exhaustiva en 2 fases + 3 rondas de ejecución validadas round-trip. **-100 líneas netas** a pesar de crear 9 archivos nuevos (encapsulación > repetición). 15 bugs críticos corregidos, 12 medios, 5 nits. 4 falsos positivos descartados con análisis explícito.

### Added

- **`useFilterSlot(defaultValueSource)`** (`app/composables/useFilterSlot.js`) — encapsula el patrón duplicado `ref + watch(immediate) + isDirty + reset` en vistas con filtros. Retorna `{ current, defaultValue, isDirty, reset }` destructurable (patrón idiomático Vue: los refs destructurados mantienen auto-unwrap en templates).
- **`useDateRangeMatcher(t)`** (`app/composables/useDateRangeMatcher.js`) — matcher compartido `today`/`last7`/`thisWeek`/`thisMonth` para las 3 vistas con filtros de fecha (TransaccionesView, WalletView, LiquidacionesView).
- **`getTableRowClass(isDarkMode)`** en `app/utils/cardClasses.js` — helper para filas de tabla compartido entre 4 vistas (Transacciones/Wallet/Liquidaciones/Usuarios).
- **`getEl(ref)`** en `app/utils/motionRef.js` — helper centralizado para resolver `ref.$el ?? ref` (antes duplicado inline en Tooltip y Modal).
- **Sub-componentes Settings** — `SettingItem.vue` (shared UI para filas config), `SettingsProfileTab.vue`, `SettingsSecurityTab.vue`, `SettingsBillingTab.vue`. SettingsView pasa de 360 líneas a 112 (orquestador: tabs + search + `showSection`).
- **Keys i18n nuevas**: `common.toggleFor` (Toggle aria-label dinámico), `pagination.previous`/`pagination.next` (Pagination aria-labels), `errors.sessionExpired` (toast 401 desde `api.js`).

### Changed

- **SettingsView refactor** — 360 → 112 líneas. Split en 3 tabs + `SettingItem` shared. Cada tab es self-contained (estado local, renders sus secciones condicionalmente vía prop `show-section`).
- **Button `size="icon"`** — `w-9 h-9` (36px) → `w-10 h-10` (40px). WCAG mínimo 40px documentado en CLAUDE.md (touch targets).
- **Modal drag-to-dismiss threshold** — `offset.y > 100` → `> 150` (35% del modal típico), velocity `500` → `800`. Reduce dismiss accidental por scroll/fling corto sin sacrificar fling rápido.
- **DatePickerModal** — `t('calendar.monthsShort', [], { returnObjects: true })` (sintaxis react-i18next inválida, retornaba la key literal) → `tm('calendar.monthsShort')` (vue-i18n v11 correcto). El bug rompía silenciosamente `monthsShort.indexOf(...)` en `selectedDay` computed.
- **4 vistas con tablas refactorizadas** (Transacciones, Wallet, Liquidaciones, Usuarios) — filter boilerplate de 70-111 líneas c/u → ~15 líneas con `useFilterSlot` + `useDateRangeMatcher`.
- **`isDirty` pattern** en filtros — reemplaza la comparación inline `filter.value !== default.value` en `filtersActive` computeds.

### Fixed

- **NewLinkModal reactividad de props** (R1 #1) — `const items = ref(buildInitialItems())` no se resincronizaba cuando `props.link` cambiaba (reusar modal para editar link A → B dejaba datos de A). Agregado `watch(() => props.link, () => { items.value = buildInitialItems(); nextItemId.value = ... })`.
- **10 neon glows sin `perfStore.useNeon` guard** (R1 #2) — rompían la promesa de Lite (A15) de no tener box-shadows caros. Fixeado en: `Header.vue` (notification dot ×2 + mobile filter dot), `BottomNav.vue` (notification badge), `ui/Input.vue` (focus:shadow dark), `ui/DropdownFilter.vue` (active option), `features/branches/SucursalesView.vue` (icon bubble hover), `features/settings/SettingsView.vue` (avatar hover — irónicamente rompía Lite), `features/wallet/WalletView.vue` (amber status dot), `features/transactions/ReceiptModal.vue` (icon bubble), `features/wallet/WithdrawReceiptModal.vue` (icon bubble emerald).
- **`animate-spin` sin `useContinuousAnim` guard** (R1 #3) — `PageLoader.vue` + 3 sentinels de infinite-scroll (TransaccionesView/LiquidacionesView/WalletView). En Lite ahora fallback a círculo estático con borde `/60`.
- **NewUserModal `setTimeout` sin cleanup** (R1 #7) — si modal se desmonta antes de 1500ms, mutaba `isSubmitting.value` en instancia muerta. Guardado en variable `submitTimer` + `clearTimeout` en `onUnmounted`.
- **Logout sin llamada al backend** (R3 #11) — `api.js` export `logout()` helper que intenta `POST /auth/logout` best-effort (3s timeout) y SIEMPRE limpia cookie local (resiliente a backend caído). Sidebar migrado a usar el helper.
- **401 silencioso sin feedback** (R3 #12) — `api.js` ahora dispara toast `errors.sessionExpired` via `useNuxtApp().$i18n.t` antes del redirect a `/login`.
- **`/legal/[doc].vue` sin whitelist** (R3 #13) — renderizaba `route.params.doc` directamente como título. Agregada whitelist `{ terminos: 'Términos y Condiciones', privacidad: 'Aviso de Privacidad' }` con redirect a `/login` si param inválido.
- **Focus-race en Header search** (R3 #16) — `setTimeout(80)` + `nextTick` podía disparar `focus()` en input ya desmontado si usuario colapsaba rápido. Agregado guard `if (searchExpanded.value)` post-nextTick.
- **`getEl` duplicado** (R3 #22) — función inline en `Tooltip.vue` y `Modal.vue` centralizada en `utils/motionRef.js`.
- **`SwipeableCard` sin `touch-action`** (R3 #21) — scroll vertical nativo podía conflictuar con drag gesture motion-v. Agregado `style="touch-action: pan-y"` al foreground card cuando hay actions.

### Refactor

- **Patrón filter + pagination consolidado** — las 4 vistas que repetían `defaultStatus` / `statusFilter` / `watch(immediate)` / `filtersActive` / `resetFilters` / `debouncedQuery` ahora usan `useFilterSlot` + `useDateRangeMatcher`. Cambio en un lugar se propaga automáticamente.
- **Helpers `getTableRowClass` + `getEl`** — código duplicado en 4-5 lugares centralizado.

### Skipped con justificación (documentado)

- **Migración de Receipt modals a `<Modal>` base** — son receipt cards (action buttons externos, gradiente decorativo top, sin title/footer), no dialogs estándar. Ya tienen `role="dialog"` + `aria-modal` + `useScrollLock` + `useChromeBlur` + Escape handler. Migrar requería slots custom que romperían el API sin ganancia real.
- **Icon sizes enum global** — `size="10/11/12/13/14/15/16/18/20/22"` diseminados. 100+ sites con beneficio marginal vs churn. Mejor oportunísticamente al tocar cada componente.

### Falsos positivos descartados en la auditoría

- `Stepper.vue:25` reportado como neon sin guard → línea 24 tiene `neon ?` ternario. OK.
- `useMediaQuery()` en `computed` → está al top-level del setup. OK.
- Destructuración de `defineProps` sin `toRefs` / stores sin `storeToRefs` → 0 ocurrencias. OK.
- `animate-spin-slow` en submit buttons reportado como "no loading feedback" → `NewUserModal:182` y `NewLinkModal:284` ya tienen `Loader2` + texto "Creating.../Generating...". OK.

---

## [0.14.0] — 2026-04-17

### Auditoría profunda + sistema de performance tiers refinado

Pass exhaustivo de QA/frontend/UX sobre toda la app. Fixes críticos de bugs, refactor de datos hacia códigos canónicos, rediseño del sistema de performance tiers a 3 niveles, y elevación de identidad para Prism (tier high-end).

### Critical bug fixes

- **Blank screen en primera carga** (`pages/index.vue`, `[...slug].vue`, `app/index.vue`) — top-level `await navigateTo()` causaba race con `pageTransition: out-in`. Migrado a `definePageMeta({ middleware: () => navigateTo(...) })`.
- **Modal drag suspended** (`Modal.vue`, `BottomSheet.vue`, `BottomNav.vue` sheet) — agregado `:drag-snap-to-origin="true"` para retornar a origen cuando drag no supera threshold.
- **Dashboard mobile: botón duplicado** — envuelto botón desktop en `<div class="hidden sm:block">` por conflicto entre `inline-flex` interno de `Button.vue` y `hidden` pasado desde padre.
- **`useMediaQuery` memory leak** (`Modal.vue`) — se llamaba dentro de `computed` creando nuevos listeners por evaluación. Movido a setup top-level.
- **Cookie flags** (`login.vue`, `middleware/auth.js`, `Sidebar.vue`, `api.js`) — agregado `sameSite: 'lax'`, `secure: !import.meta.dev`, `path: '/'`. Logout migrado a `useCookie` (no más `document.cookie` directo inconsistente).
- **Filtro last-7-days** (`TransaccionesView.vue`) — hardcodeaba `'29 Mar', '28 Mar', '27 Mar'`, roto fuera de marzo. Reemplazado con parseo ISO + rango dinámico.
- **Clipboard sin error handling** — creado `utils/clipboard.js` helper `copyToClipboard()` que retorna boolean. Aplicado en 6 puntos (QuickLinkCard, PendingCharges, PermanentCard, LinkDetailModal, QuickLinkSwipeable, CustomLinksTable). Toast de error si falla.

### Perf + UX fixes

- **FOUC desktop** (`composables/useMediaQuery.js`) — `matches` ahora se inicializa sincrónicamente con `window.matchMedia` para evitar flash mobile→desktop en primera pintura.
- **Sidebar flicker** (`layouts/default.vue`) — `isCollapsed` hidratado desde `localStorage` en el `ref` directamente, no en `onMounted`.
- **`app.vue` dark: classes** — reemplazadas por binding JS con `themeStore.isDarkMode` (Tailwind v4 requiere `@custom-variant dark` que no estaba configurado).
- **`layoutTransition` deshabilitado** — evita cascada de 360ms+ entre login y app.
- **`setTimeout` sin cleanup** (Header search focus) — guardado en `focusTid` con clear en `onUnmounted`.
- **Perf detection Firefox/Safari** — agregado fallback `pointer:coarse + hover:none` y `userAgentData.mobile` para navegadores sin `deviceMemory`.
- **`useInfiniteScroll` reset no destructivo** — solo resetea cuando dataset se reduce (filtro), no al crecer (paginación).
- **Auth middleware con redirect query** — preserva ruta solicitada al login, restaura tras autenticar.
- **`api.js` robusto** — `AbortController` con timeout 15s default, manejo automático de 401 → limpia cookie + redirect, soporte 204.
- **Toast timer cancellation** — `Map` de timers fuera del state, `removeToast` cancela `setTimeout` pendiente.
- **`useScrollLock`/`useChromeBlur` counter defensivo** — `Math.max(0, ...)` para evitar contadores negativos si composable se desmonta en mal orden.
- **Modal focus initial** — prefiere primer `input/textarea/select` sobre botón cerrar.
- **`ChartCard` rAF cleanup** — `cancelAnimationFrame` en `onBeforeUnmount`.
- **ARIA roles en dropdowns** (`DropdownFilter.vue`, `Header.vue`) — `role="listbox"`/`"option"` + `aria-selected`.
- **`Tooltip` IDs con `useId()`** en vez de `Math.random()`.

### i18n + data refactor

- **Status/channel/type codes** — `mockData.js` migrado a códigos canónicos (`'success'`, `'refunded'`, `'pending'`, `'pos'`, `'link'`, `'settlement'`, etc.). Display usa `t(\`status.${code}\`)` en templates. Filtros comparan códigos, no strings visibles.
- **Dates ISO** — todas las fechas en mockData son `YYYY-MM-DD`. Display via `Intl.DateTimeFormat` con locale awareness (`utils/formatDate.js`).
- **i18n namespaces nuevos**: `status.*`, `channel.*`, `type.*` (agregados a es.json + en.json).
- **Filtros de fecha locale-aware** — `TransaccionesView`, `WalletView`, `LiquidacionesView` ahora parsean ISO en lugar de strings en español.

### Performance tier system (rediseñado a 3 niveles)

Ver `docs/performance-tiers.md` para matriz completa.

- Tiers: **`full` (Prism)**, **`normal`**, **`lite`** (colapsado `minimal` en `lite`).
- `prefers-reduced-motion` detecta a `lite` + CSS media query anula animaciones globalmente.
- Detección refinada: bias mobile hacia `normal` aun con 8 cores (`pointer:coarse + !deviceMemory`).
- Settings UI: SegmentControl con 3 opciones + descripción dinámica (`settings.perfFullDesc|perfNormalDesc|perfLiteDesc`).

**Getters granulares** en `perfStore`:
- GPU: `useBlur`, `useReducedBlur`, `useNeon`, `useInnerHighlight`, `useWalletGlowBubble`, `useGlassElevation`, `useActiveHalo`, `chromeSaturate`
- Shadows: `modalShadow` (3-way: `'deep'|'medium'|'compact'`), `modalBackdropFilter` (Tailwind class string)
- Motion: `useSpring`, `useLayoutMorphs`, `useNavMorphs`, `useContinuousAnim`
- Interaction: `useHoverLift`, `useDecorGradients`

**Diferenciación Prism vs Normal vs Lite:**
- Prism: liquid glass (opacidad /20-30 + saturate), neon glows, ambient halos, button sheen, parallax blobs, typography features, cinematic shadows
- Normal: glass base semi-opaco, morphs, hover-lift, continuous anims — SIN neon/elevation/chrome saturate
- Lite: surfaces sólidas, nav morphs OFF (instant), continuous anims OFF, hover-lift OFF, typography default

### Prism premium elevations (Paquete A/B/C)

**A — Glass liquid (validado UX):**
- `getCardClasses/getModalGlass/getDropdownGlass` aceptan `useGlassElevation`
- En Prism: opacidad reducida + `backdrop-saturate-150` + rim (`border-t-white/25 + border-l-white/10`) + inset 1px top highlight + dual-source drop shadow
- **NO** specular white overlay (rechazado como "glass milky")
- Ambient halo púrpura detrás de pills activos (Sidebar/BottomNav/SegmentControl) con `layout-id` propio

**B — Kinetic premium:**
- Button variant=default: sheen lavanda (`#B9A4F8` 14% alpha) cada 8s vía `.prism-button-shimmer::before`
- GlassBackground blobs: parallax drift sinusoidal 22s/18s asimétrico
- QR lightbox: landing shimmer one-shot 900ms con 400ms delay tras morph

**C — Typography details:**
- Inter: `cv11` (single-storey a) + `cv05` (straight l) + `ss01` (open digits)
- JetBrains Mono: `calt` (ligatures) + `zero` (slashed zero para IDs/amounts)
- Aplicado vía CSS `html.perf-full body`

### Chrome fixes (UX)

- **Sidebar/Header/BottomNav sólidos en Lite** — cuando se desactiva backdrop-blur, los bg con `/X%` opacity se volvían transparentes. Promocionados a `bg-[#1A1A1D]` sólido cuando `useBlur === false`.
- **Double-blur en chrome al abrir modal** — removido `blur-xs saturate-50` del Sidebar/BottomNav. El `backdrop-blur-md` del modal backdrop ya cubre esos elementos en z-stack. Solo queda `saturate-50 pointer-events-none`.
- **Modal backdrop filter tiered** — `modalBackdropFilter` getter retorna Tailwind string: `blur-md saturate-200` (Prism) / `blur-sm saturate-150` (Normal) / `''` (Lite via CSS strip).
- **Blobs dark mode balanceados** — `#300C67/40` (off-brand navy) reemplazado por `#561BAF/30` (primary-darker), TL alpha boosted 15→22 para no desaturarse con 140px blur.

### Dashboard/Links features

- **QR expand en Links desktop** — `PermanentCard.vue` cableado con `QrLightbox` + `layout-id` propio por link. Antes el botón QR no hacía nada.
- **QR morph más dramático en desktop Dashboard** — `qr-size=340` en desktop vs 280 default.

### Archivos nuevos

- `app/utils/clipboard.js`
- `app/utils/formatDate.js`
- `docs/performance-tiers.md`

### A11y

- ARIA roles en dropdowns completos
- Touch target Header branch pill `w-9 h-9 → w-11 h-11` (44px, cumple regla CLAUDE.md)
- Modal focus prioriza inputs sobre botón cerrar
- `prefers-reduced-motion` mapea a tier Lite + CSS global

### Archivos modificados clave

- `app/stores/performance.js` — 3 tiers + 15+ getters granulares
- `app/utils/cardClasses.js` — 3 helpers con glass elevation
- `app/utils/mockData.js` — migración a códigos canónicos
- `app/assets/css/globals.css` — overrides por tier + keyframes Prism
- `app/components/GlassBackground.vue` — blobs tier-aware + parallax
- `app/components/features/settings/SettingsView.vue` — UI 3 tiers con descripciones
- `app/middleware/auth.js` — redirect query preservado
- `app/utils/api.js` — timeout/abort/401 handling

---

## [0.13.0] — 2026-04-15

### Migration: React+Vite → Nuxt 4 + Vue 3

Migración completa del proyecto desde React 18 + Vite a Nuxt 4 + Vue 3. Paridad funcional y visual 1:1 con la versión 0.12.0.

### Stack

- **Framework:** React 18 + Vite 5 → **Nuxt 4 + Vue 3**
- **Render mode:** SPA (`ssr: false`), deploy con preset `cloudflare-pages`
- **Routing:** React Router v6 (`<Outlet />`) → File-based routing en `app/pages/`
- **Estado:** Context API (3 providers) → **Pinia** (theme/toast/viewSearch stores)
- **Animaciones:** framer-motion → **motion-v** (port Vue oficial)
- **Gráficas:** Recharts → **SVG nativo** (sin port Vue disponible)
- **Date picker:** react-day-picker v9 → **@vuepic/vue-datepicker**
- **i18n:** react-i18next → **@nuxtjs/i18n** (vue-i18n v9)
- **Íconos:** lucide-react → **lucide-vue-next**
- **Fonts:** Google Fonts inline → **@nuxt/fonts** (self-hosted)
- **Auth storage:** localStorage token → cookie `zwap_token` (`useCookie`)

### Estructura

- `src/features/X/components/` → `app/components/features/X/`
- `src/shared/ui/` → `app/components/ui/` (28 primitivos)
- `src/shared/context/` → `app/stores/` (Pinia)
- `src/shared/hooks/` → `app/composables/`
- `src/shared/utils/` → `app/utils/`
- `src/shared/layout/` → `app/layouts/default.vue` + `app/components/{Header,Sidebar,BottomNav,GlassBackground}.vue`
- `src/router/` → `app/pages/` file-based + `app/utils/routes.js` (constantes)
- `src/i18n/locales/` → `i18n/locales/`
- `src/shared/brand/` → `app/components/brand/`

### Conversiones clave (React → Vue)

- `useState` + `useEffect` → `ref` + `watch`/`onMounted`
- `useContext` + `Provider` → `useXStore()` (Pinia) o `provide`/`inject`
- `forwardRef` → `defineExpose({ el })`
- `createPortal` → `<ClientOnly><Teleport to="body">`
- `<Suspense>` + `lazy()` → Nuxt auto-lazy en routes
- `useNavigate()` → `navigateTo()`
- `useLocation()` → `useRoute()`
- `<Outlet />` → `<NuxtPage />`
- `className` → `class` / `:class`
- JSX `{cond && <X/>}` → `<X v-if="cond" />`
- Render props / cloneElement → `provide`/`inject` (TableToolbar → DropdownFilter vía `tableToolbarSheetMode`)
- React.memo / useCallback / useMemo → `computed` (solo donde hay dependencia real)

### i18n

- Sintaxis de interpolación: `{{var}}` → `{var}` (script de conversión automática)
- Pluralización: `_one` / `_other` → pipe `"singular | plural"`
- `@` en strings (emails) → escape o hardcode en componente (reservado por vue-i18n para linked-messages)

### ChartCard

Reescrito con SVG nativo (Recharts no tiene port Vue):
- Path bezier (curveMonotone) para smoothing
- `<linearGradient>` SVG para fill con opacidad
- Hover cursor + tooltip custom siguiendo el mouse
- Tabs `conversion` y `metodos` siguen siendo divs/gradients como el original

### Diseño y animaciones

- `prism-ui.md` y `docs/pending-links-decision-matrix.md` migrados con actualizaciones de paths
- Todas las constantes spring (`SPRING`, `SPRING_SIDEBAR`, `SPRING_SOFT`, `SPRING_DOTS`) preservadas
- Todas las variantes motion (`listVariants`, `itemVariants`, `cardItemVariants`, `pageVariants`) preservadas
- `layoutId` morph (SegmentControl, Sidebar nav indicator, BottomNav pill, QrLightbox) funcional con motion-v
- Glassmorphism + tokens de color + modo dark/light sin cambios visuales

### Fixes durante migración

- **Tooltip `getBoundingClientRect is not a function`** — `ref` sobre `<motion.div>` devuelve la instancia del componente, no el DOM. Fix: `getEl(r) => r?.$el ?? r` fallback. Aplica también a `Modal` focus trap.
- **Bell animation spring error** — motion-v spring solo admite 2 keyframes. El wiggle `[0, -18, 14, ...]` requiere `{ duration: 0.6, ease: 'easeInOut' }` en vez de spring.
- **`@vuepic/vue-datepicker` default export** — v12 exporta `VueDatePicker` como **named export**, no default. Fix: `import { VueDatePicker } from '...'`.
- **`Card` click detection** — `defineEmits(['click'])` removía el listener de `$attrs`. Fix: `useAttrs().onClick` directo sin emits declarados.
- **Vue i18n compile errors** — caracteres especiales `@`/`|`/`{` requieren escape; 2 email placeholders se hardcodearon en el componente.

### Polish

- `app/error.vue` custom con ZwapLogo y `clearError()`
- `nuxt.config.ts`: `pageTransition`/`layoutTransition`, `titleTemplate`, theme-color meta
- `vite.optimizeDeps.include: ['@vuepic/vue-datepicker']` para pre-bundling estable
- CSS keyframes para `.page-*`/`.layout-*` transitions
- `nitro.preset: 'cloudflare-pages'` — output en `dist/` con `_worker.js`, `_headers`, `_routes.json`, `_redirects`

### Build verificado

```
✔ Client built in 8.3s
✔ Server built (cloudflare-pages preset) — 268 kB total, 79.6 kB gzip
✔ Fonts self-hosted (Inter + JetBrains Mono)
```

## [0.12.0] — 2026-04-15

### Added
- **Patrón full-attention overlay estandarizado:** hook `useChromeBlur()` en `src/shared/hooks/` que setea `data-modal-open` con counter para overlays apilados y usa `useIsPresent` de Framer Motion para limpiar el flag al **inicio** del exit (no al unmount) — sidebar y BottomNav des-difuminan en sync con el backdrop. Acepta `active` opcional para componentes que controlan visibilidad vía prop `isOpen` (ej. `BottomSheet`).
- **`<QrLightbox>`:** componente compartido en `src/shared/ui/` que extrae el lightbox de QR usado por `QuickLinkCard` y `QuickLinkSwipeable`. Portalea al body, maneja ESC, `useScrollLock` y `useChromeBlur()`. Acepta `qrSize` (default 280).
- **`useModalOpen()` hook:** observa `data-modal-open` del body vía `MutationObserver`. Usado por `AppShell` y `BottomNav` para aplicar blur al chrome cuando hay overlay activo.
- **`Input` extendido:** props `error` (boolean — estilos rose en border/bg/focus/shadow) y `prefix` (string — prefijo inline con `pl-8`, ej. `$`). Reemplaza `<input>` raw en `NewUserModal` (email con error state) y `WithdrawModal` (amount con `$`).
- **Page exit animations:** `pageVariants.exit` + `AnimatePresence mode="wait"` en `AppShell` con `key={location.pathname}`. Todas las vistas (`DashboardView`, `TransaccionesView`, `LinksView`, `LiquidacionesView`, `WalletView`, `SucursalesView`, `UsuariosView`, `SettingsView`) con `exit="exit"` en su root.
- **i18n `settings.activeAgo*`:** keys `activeAgoMinutes`/`activeAgoHours` con pluralización i18next. Reemplaza el string hardcoded `'Activo hace 2 horas'` en `SESSIONS` mock por `lastActive: 120` (minutos) + helper `formatLastActive()` en `SettingsView`.

### Changed
- **`Modal` portalea a `document.body`** con `createPortal`. Antes quedaba dentro del stacking context `z-10` del main content, causando que `BottomNav` (`fixed z-40` root) apareciera por encima del modal. Ahora escape total de stacking contexts.
- **`Modal` confirm sub-modal en `NewLinkModal`:** reemplazado `motion.div` custom con z-[60] por `<Modal>` reutilizable. Se renderiza después del parent Modal en JSX — mismo z-50, DOM order garantiza stacking correcto.
- **`ReceiptModal`, `WithdrawReceiptModal`, `NewBranchModal`:** refactorizados para portalear + llamar `useChromeBlur()`. Ahora siguen el patrón estándar.
- **`BottomSheet`:** ahora llama `useChromeBlur(isOpen)` — antes las bottom sheets no difuminaban el chrome.
- **`BottomNav` + `Sidebar` wrapper:** aplican `blur-sm saturate-50 pointer-events-none` cuando `modalOpen === true` (del hook `useModalOpen`). `BottomNav` ya no hace slide-hide — ahora usa blur consistente con el sidebar (mismo filtro, timing y transición).
- **`ReceiptModal` status:** comparaciones `=== 'Exitoso'` / `=== 'Reembolsado'` migradas a `statusVariant === 'success'` / `=== 'danger'` (el campo ya existía en `TRANSACTIONS`). Resiliente a i18n y refactor del display string.
- **LoginView Framer Motion:** clases CSS `animate-fade-in` y `animate-slide-up` eliminadas. Root usa `pageVariants`. El toggle entre Google methods y email form usa `AnimatePresence mode="wait"` con spring `y: 8 → 0`.
- **QR lightboxes:** ambos (`QuickLinkCard`, `QuickLinkSwipeable`) migrados a `<QrLightbox>` compartido. ~20 líneas de JSX + effects eliminadas en cada uno.

### Fixed
- **Chrome no difuminaba cuando se abría modal:** sidebar (desktop) y BottomNav (mobile) quedaban visibles sin blur por encontrarse en stacking contexts distintos al backdrop del modal. Resuelto con `useModalOpen` hook + filtros Tailwind en los wrappers.
- **Desync entre backdrop fade y chrome unblur:** el flag `data-modal-open` se limpiaba en el cleanup del `useEffect` (unmount), 150ms después que el backdrop empezaba a desvanecer. Ahora `useChromeBlur` usa `useIsPresent` — el cleanup del effect se dispara cuando empieza el exit, perfectamente sincronizado.
- **BottomNav sobre modal en mobile:** causa raíz era que `Modal` vivía en el stacking context `z-10` del main content, mientras BottomNav (`fixed z-40`) estaba en el root. Resuelto portaleando Modal al body.
- **QR lightbox sobre BottomNav y sin chrome blur:** QR lightboxes custom tenían el mismo problema de stacking + no seteaban flag. Al extraer a `<QrLightbox>` + portal + hook, quedaron alineados al patrón.
- **Drag snap-back incompleto en `Modal`/`BottomSheet`:** cuando el usuario arrastraba el modal/sheet pero soltaba antes del threshold de dismiss, no volvía a posición. Ahora usan `useAnimation()` imperativo para snap-back con spring.

### Security / A11y
- **Focus restoration en `Modal`:** `useEffect` captura `document.activeElement` antes de montar el focus trap, restaura el foco al trigger element en cleanup.
- **ARIA radio pattern en `NewUserModal`:** selector de rol con `role="radiogroup"`, `role="radio"`, `aria-checked`, `tabIndex={0}`, handler `Enter`/`Space`.
- **Labels `htmlFor`/`id`:** agregados a LoginView, NewUserModal, NewLinkModal, SettingsView, WithdrawModal. Inputs ahora asociados correctamente a sus labels.
- **`autoComplete` en LoginView:** `"email"` y `"current-password"` para autofill + password managers.
- **`aria-hidden="true"` en íconos decorativos:** `Input` icon wrapper.
- **Toast z-index:** subido de `z-[60]` a `z-[70]` para garantizar aparición sobre modales.
- **`hoverOnlyWhenSupported: true`** en `tailwind.config.js`: envuelve clases `hover:` en `@media (hover: hover)`, evitando sticky hover en touch devices y correcto behavior en emulación mobile de DevTools.

### Documentation
- **`CLAUDE.md`:** nueva sección "Full-attention overlays — patrón estándar" con ejemplo de código, reglas (portal + `useChromeBlur`), y lista de componentes que ya cumplen el patrón.

## [0.11.1] — 2026-04-14

### Fixed
- **iOS Safari BFCache stale chunks:** handler `pageshow` en `main.jsx` detecta restauración desde BFCache (`e.persisted`) y fuerza un reload para que Safari re-evalúe los chunks con los hashes actuales
- **AppShell scroll lock:** restaurado `overflow: hidden` en `document.documentElement` — iOS Safari requiere ambos (`html` + `body`) para contener el scroll en `main`; sin el lock en `html`, el `paddingBottom` de `main` no era respetado en iOS

## [0.11.0] — 2026-04-14

### Added
- **Header scroll-aware (mobile):** el header se desliza hacia arriba al scrollear hacia abajo y reaparece al scrollear hacia arriba, usando `motion.header` con spring `SPRING_SIDEBAR`. Siempre visible cuando `scrollTop ≤ 4px`
- **`public/_headers`:** configuración de cache para Cloudflare Pages — HTML con `no-cache`, assets con hash con `immutable` (max-age 1 año)

### Fixed
- **Body scroll lock:** `useEffect` en AppShell bloquea `overflow` en `html` y `body` mientras la app está montada, garantizando que `main` sea siempre el scroll container. Prevenía que iOS Safari y Chrome Android propagaran el scroll al documento (header desaparecía, Chrome entraba en fullscreen)
- **Overscroll chaining:** `overscroll-y-contain` en `main` evita que el rebote al llegar al límite del scroll se propague al documento
- **Header fijo en mobile:** `position: fixed inset-x-0 top-0` en mobile para que el header nunca sea arrastrado por scroll del documento; `pt-20` en `main` para compensar (header 64px + respiro 16px)
- **Blank screen en iOS Safari al recargar:** meta tags `Cache-Control: no-cache` en `index.html` como segunda capa de defensa contra HTML stale cacheado que apunta a chunk URLs viejos

## [0.10.1] — 2026-04-14

### Fixed
- **AppShell:** eliminado `h-full` del div contenedor interior — el contenido desbordaba visualmente sobre el padding inferior de `main` en lugar de activar el scroll, haciendo que los últimos ítems de cualquier vista invadieran la zona de holgura del layout
- **AppShell mobile:** padding inferior reemplazado por `calc(5rem + env(safe-area-inset-bottom))` via style prop — compensa correctamente el BottomNav (~56px) más el safe area del dispositivo (34px en iPhone), eliminando el exceso de espacio muerto anterior (`pb-28` = 112px)
- **AppShell desktop:** padding inferior separado del shorthand `p-*` para evitar que clases responsivas (`lg:p-8` etc.) lo sobreescribieran; ahora `lg:pb-10 xl:pb-12 2xl:pb-16` aplica correctamente
- **Header mobile:** botón X en barra de búsqueda ahora limpia el query si hay texto, y colapsa la barra solo si el query ya está vacío (antes solo colapsaba sin limpiar)
- **main.jsx:** handler `vite:preloadError` para recargar automáticamente cuando Cloudflare Pages despliega una nueva versión y los chunks cacheados quedan stale (pantalla en blanco)

## [0.10.0] — 2026-04-14

### Added
- Widget PendingCharges rediseñado como **tablero de triage** para Dashboard
  - Motor de decisión 2D: `views × lifeElapsedPct` → 5 acciones (esperar / interés / reenviar / ayudar / llamar)
  - Ordenamiento por prioridad operativa (llamar primero), tiebreaker por `expiresInMinutes`
  - Desktop: tabla con columnas consecutivas Vistas / Tiempo / Recomendación
  - Mobile: ticker denso de 5 items con stat chips tintados por acción
  - Modal `TriageDetailModal` (tap mobile) con recomendación + razón + inputs del triage, alineado a Prism UI (glass tintado)
- Nuevos campos en `CUSTOM_LINKS`: `createdMinutesAgo`, `expiresInMinutes`
- Documentación completa en `docs/pending-links-decision-matrix.md`
- i18n ES/EN: claves `dashboard.views`, `dashboard.recommendation`, `dashboard.expiresIn`, `dashboard.action{Esperar,Reenviar,Llamar,Interes,Ayudar}`, `dashboard.reason{Esperar,Reenviar,Llamar,Interes,Ayudar}`

### Removed
- Widgets obsoletos del Dashboard: `AlertsPanel.jsx`, `QuickActions.jsx`, `ShiftSummary.jsx`

### Docs
- CLAUDE.md: detalle del widget de triage en feature `dashboard`
- prism-ui.md: sincronizada sección 7.3 (grid dashboard) con el layout actual (tabs operations/metrics)

## [0.9.1] — 2026-04-13

### Changed
- Centralizar constantes spring en `src/shared/utils/springs.js` (SPRING, SPRING_SIDEBAR, SPRING_SOFT) — 8 archivos migrados
- Centralizar clases glass en `src/shared/utils/cardClasses.js` (getModalGlass, getDropdownGlass) — 3 archivos migrados
- Agregar re-exports faltantes en `features/transactions/index.js` (RefundModal) y `features/wallet/index.js` (WithdrawModal, WithdrawReceiptModal)

### Removed
- Eliminar `SearchOverlay.jsx` (código muerto, reemplazado por búsqueda inline en Header)

### Docs
- Actualizar CLAUDE.md con secciones de spring, glass, Header mobile y BottomNav
- Sincronizar prism-ui.md con helpers centralizados, layout responsive y breakpoints

## [0.9.0] — 2026-04-13

### Added
- Rediseño completo del Header mobile: isotipo + wordmark con animación blur reveal
- Selector de sucursales mobile: pill circular + bottom sheet vía `createPortal`
- Búsqueda contextual por vista con `ViewSearchContext` (placeholder dinámico, filtros en BottomSheet)
- Toggle de tema y alertas en el sheet "Más" del BottomNav
- Búsqueda expandida cubre espacio de filtros en mobile

### Fixed
- Z-index del bottom sheet de sucursales (backdrop-blur creaba containing block, stacking context de z-10 en AppShell)
- Spacing entre isotipo y wordmark en Sidebar y Header

## [0.8.1] — 2026-04-12

### Added
- Internacionalización completa: español + inglés con `react-i18next`
- Selector de idioma en Settings > Mi Perfil (persiste en localStorage)
- Locales en `src/i18n/locales/` con 18 namespaces

### Fixed
- Traducir todas las strings hardcodeadas restantes

## [0.8.0] — 2026-04-11

### Added
- Búsqueda contextual en Header conectada a `ViewSearchContext`
- Filtros por vista con `TableToolbar` + `DropdownFilter` (estado, fecha, rol)
- Indicador de filtros activos en Header mobile
- Búsqueda de configuración tipo WhatsApp en SettingsView
- `SearchInput`, `TableToolbar`, `Pagination`, `EmptySearchState` como componentes base

### Changed
- Rediseño de `NewLinkModal` con split 60/40, fee split configurable, `DatePickerModal`
- Mejora de UX mobile en modales de formulario

## [0.7.0] — 2026-04-10

### Added
- Dashboard: KPIs, gráficas Recharts, live feed (desktop: tabla, mobile: ticker), acciones rápidas
- Transacciones: historial con filtros, ReceiptModal, RefundModal
- Links de pago: permanentes (grid/swipeable) + custom (CRUD tabla)
- Liquidaciones: tabla con filtros y exportación CSV
- Wallet: balance, retiros, stepper de progreso, WithdrawModal + receipt
- Sucursales: grid de cards + NewBranchModal
- Usuarios: tabla con filtros por rol/estado + NewUserModal
- Settings: perfil, seguridad, facturación con tabs
- Experiencia nativa: touch feedback, sin selección de texto, toasts responsivos
- Responsive completo: Sidebar (desktop) / BottomNav (mobile), tabla→cards

## [0.6.0] — 2026-04-08

### Added
- Design system Prism UI: glassmorphism, tokens de color, tipografía Inter + JetBrains Mono
- Componentes base: Card, Button, Input, Toggle, Badge, Modal, Avatar, StatCard, Stepper, SegmentControl
- AppShell con Sidebar colapsable + Header
- Dark/light mode con ThemeContext (persiste en localStorage)
- Animaciones spring-first con Framer Motion
- GlassBackground con auras decorativas
- Sistema de rutas con React Router v6 + lazy loading + AuthGuard
- Login mock con localStorage token
