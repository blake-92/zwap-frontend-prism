# CLAUDE.md — Zwap Frontend Prism (Nuxt)

Instrucciones para Claude Code al trabajar en este repositorio.

## Stack

- **Nuxt 4** + **Vue 3** (Composition API, `<script setup>` siempre)
- **Tailwind CSS 4** — utilidades inline, sin CSS modules; integrado via `@tailwindcss/vite`
- **Render mode:** SPA (`ssr: false` en `nuxt.config.ts`)
- **Pinia** — estado global (theme/toast/viewSearch)
- **motion-v** — port de Framer Motion para Vue (spring como paradigma principal)
- **lucide-vue-next** — íconos
- **@vuepic/vue-datepicker** — calendario en `DatePickerModal`
- **@nuxtjs/i18n v10** — i18n (vue-i18n v11, sintaxis pipe + `{var}`)
- **@nuxt/fonts** — Inter + JetBrains Mono self-hosted
- **SVG nativo** — gráficas en `ChartCard` (antes Recharts, sin port Vue)

## Reglas globales

1. **Siempre `<script setup>`** (nunca Options API)
2. **Imports absolutos con `~/`** (alias a `app/`)
3. **No `dark:` de Tailwind** — usar branching JS con `themeStore.isDarkMode`
4. **No `ease`/`tween`** en animaciones de UI — spring siempre (excepción: loops infinitos como shimmer)
5. **No hardcodear strings visibles** — usar `t('namespace.key')` de `useI18n()`
6. **No hardcodear datos** — usar `mockData.js`
7. **No exports dentro de `<script setup>`** — mover a un `.js` al lado del componente
8. **Acceso a `window`/`document`/`localStorage`/`navigator`:** solo en `onMounted`, `if (typeof window !== 'undefined')`, o plugins `.client.ts`
9. **Nunca usar `{{var}}` en locales** — es `{var}` en vue-i18n
10. **Pluralización vue-i18n**: pipe `"singular | plural"`, no `_one`/`_other`

## Alias de paths

```js
// Correcto — ~/ apunta a app/
import Card from '~/components/ui/Card.vue'
import { ROUTES } from '~/utils/routes'
import { useThemeStore } from '~/stores/theme'

// Incorrecto
import Card from '../../components/ui/Card.vue'
```

## Arquitectura — vertical slices por feature

Cada feature vive en `app/components/features/<nombre>/`:

```
components/features/links/
├── LinksView.vue           # vista principal (renderizada por la page)
├── NewLinkModal.vue        # modal propio de la feature
├── LinkDetailModal.vue
├── CustomLinksTable.vue
├── PermanentCard.vue
└── QuickLinkSwipeable.vue
```

La page correspondiente en `app/pages/app/links.vue` es un wrapper mínimo:

```vue
<script setup>
import LinksView from '~/components/features/links/LinksView.vue'
definePageMeta({ middleware: 'auth' })
</script>
<template>
  <LinksView />
</template>
```

### Features actuales

| Feature | Vista | Modales / subcomponentes |
|---------|------|--------------------------|
| `auth` | — | LoginView vive directo en `pages/login.vue` |
| `dashboard` | DashboardView | KpiCard, ChartCard, QuickLinkCard, LiveFeed, PendingCharges, TriageDetailModal (+ `triage.js`) |
| `transactions` | TransaccionesView | ReceiptModal, RefundModal |
| `links` | LinksView | NewLinkModal, LinkDetailModal, CustomLinksTable, PermanentCard, QuickLinkSwipeable |
| `settlements` | LiquidacionesView | — |
| `wallet` | WalletView | WithdrawModal, WithdrawReceiptModal |
| `branches` | SucursalesView | NewBranchModal |
| `users` | UsuariosView | NewUserModal |
| `settings` | SettingsView | — |

### Reglas de features

1. **Vistas autónomas** — no reciben callbacks. Usan `navigateTo(ROUTES.X)` y `ref` para modal state.
2. **Modales propios** — cada vista gestiona su modal con `ref(false)`. Layout no orquesta.
3. **Cross-feature imports permitidos solo en casos específicos:**
   - `DashboardView` importa `NewLinkModal` desde `~/components/features/links/`
   - `LiveFeed` importa `ReceiptModal` desde `~/components/features/transactions/`
   - Reutilización directa, sin barrel exports.

## Rutas

File-based en `app/pages/`. Constantes en `app/utils/routes.js`:

```js
ROUTES = {
  LOGIN:        '/login',
  APP:          '/app',
  DASHBOARD:    '/app/dashboard',
  TRANSACTIONS: '/app/transacciones',
  LINKS:        '/app/links',
  SETTLEMENTS:  '/app/liquidaciones',
  WALLET:       '/app/wallet',
  BRANCHES:     '/app/sucursales',
  USERS:        '/app/usuarios',
  SETTINGS:     '/app/configuracion',
}
```

Al añadir una ruta:
1. Crear `app/pages/<path>.vue` (file-based auto-router)
2. Agregar la constante en `routes.js`
3. Agregar al `NAV_ITEMS` de `Sidebar.vue` si aplica
4. Incluir `definePageMeta({ middleware: 'auth' })` si es privada

**Notas:**
- `/app` → redirect a `/app/dashboard` via `app/pages/app/index.vue`
- `/legal/[doc].vue` — ruta dinámica pública
- `[...slug].vue` — catch-all → redirect a `/login`
- `ROUTES.SETTINGS` accesible desde Header (gear icon) + BottomNav "Más", no en Sidebar
- `ROUTES.WALLET` accesible desde botón wallet del Sidebar + BottomNav "Más"

**Middleware:** `app/middleware/auth.js` chequea `useCookie('zwap_token').value` y redirige a `/login` si falta.

## Componentes base (shared UI)

Viven en `app/components/ui/`. Con Nuxt auto-imports se pueden usar directamente en templates, pero el patrón actual es importar explícito:

```js
import Card from '~/components/ui/Card.vue'
import Button from '~/components/ui/Button.vue'
// ...
```

| Componente | Props clave | Descripción |
|---|---|---|
| `Card` | `hoverEffect` + listener `@click` opcional | Contenedor glass con bordes; detecta `$attrs.onClick` para rol/tabindex |
| `CardHeader` | `title`, `description`, `wrapperClass` + slots `title`/default | Header de card con slot derecho |
| `Button` | `variant` (default/outline/ghost/action/danger/successExport), `size` (default/sm/lg/icon), `disabled` | Botón con `whileTap` spring |
| `Input` | `modelValue`, `icon`, `prefix`, `error` | v-model + icono izquierdo; `defineExpose({ el })` para focus imperativo |
| `Toggle` | `active` + emit `@toggle` | Switch spring |
| `Badge` | `variant`, `icon` | Label inline con variantes semánticas |
| `Modal` | `title`, `description`, `icon`, `maxWidth`, `wrapperClass` + emit `@close` + slot `footer` | Modal glass teleportado a body; spring; bottom-sheet en mobile |
| `Avatar` | `initials`, `size`, `variant`, `glow` | Círculo con iniciales |
| `AvatarInfo` | `initials`, `primary`, `secondary`, `meta`, `glow` | Avatar + texto |
| `StatCard` | `layout` (kpi/balance), `label`, `value`, `icon`, `iconVariant`, `badge`, `badgeVariant`, `badgeSuffix`, `negative` | Tarjeta KPI |
| `Stepper` | `steps[]` | Stepper horizontal |
| `SegmentControl` | `modelValue`, `options[]`, `layoutId?` + emit `@update:modelValue` | Pill animado con motion-v layoutId |
| `DropdownFilter` | `label`, `options[]`, `modelValue`, `icon`, `defaultValue`, `sheetMode` | Dropdown con sheet mobile (provide/inject en TableToolbar) |
| `TableToolbar` | `hasActions` + emit `@reset` + slots default/`actions` | Desktop: barra glass. Mobile: registra `setFilterOpener` en viewSearch store, abre BottomSheet |
| `Pagination` | `currentPage`, `totalPages` + emit `@pageChange` | Controles con elipsis |
| `PageHeader` | `title`, `description`, `wrapperClass` + slot default | Header de página (hidden en mobile) |
| `SectionLabel` | — + slot | Label uppercase |
| `InfoBanner` | `variant` (warning/info/danger) + slot | Banner con ícono |
| `Skeleton` | `width`, `height`, `rounded` | Loader shimmer |
| `Tooltip` | `content`, `position` + slot trigger | Portal teleport con fade |
| `DatePickerModal` | `selectedDate`, `timeValue` + emits `select`/`timeChange`/`confirm`/`close` | Desktop: vue-datepicker; mobile: inputs nativos |
| `BottomSheet` | `isOpen`, `title` + emit `@close` + slot default | Panel deslizante portal + drag-to-dismiss |
| `SwipeableCard` | `actions[]` + slot default | Card con drag-to-reveal actions |
| `QrLightbox` | `isOpen`, `layoutId`, `name`, `url`, `qrSize` + emit `@close` | Lightbox con layoutId morph |
| `EmptySearchState` | `colSpan`, `term` + emit `@clear` | Fila vacía para tablas |
| `ErrorBoundary` | + slot | Wrapper de `<NuxtErrorBoundary>` |
| `PageLoader` | — | Spinner para Suspense |

### Patrones importantes

**`<motion.div ref="x">`** — el ref apunta a la instancia del componente motion-v, NO al DOM element. Para acceder al DOM usar fallback:

```js
const getEl = (r) => r?.$el ?? r
const el = getEl(myRef.value)
el?.getBoundingClientRect?.()
```

Tooltip y Modal usan este patrón.

**Iconos dinámicos** — siempre `<component :is="IconComponent" />`, nunca `<IconComponent />` literal sobre variables:

```vue
<!-- Correcto -->
<component :is="trx.ChannelIcon" :size="14" />

<!-- Incorrecto: Vue no evalúa -->
<trx.ChannelIcon size="14" />
```

**Estilos inline con unidades** — Vue requiere unidad explícita:

```vue
<!-- Correcto -->
:style="{ width: maxDrag + 'px' }"

<!-- Incorrecto: React lo aceptaría, Vue lo ignora -->
:style="{ width: maxDrag }"
```

**Spread attrs**: para componentes que re-propagan atributos HTML (como `Input`), usar:

```vue
<script setup>
defineOptions({ inheritAttrs: false })
</script>
<template>
  <div>
    <input v-bind="$attrs" />
  </div>
</template>
```

## Sistema de diseño — Prism UI

### Tokens de color

| Token | Valor | Uso |
|---|---|---|
| Primario | `#7C3AED` | Acciones, activos, íconos |
| Primario oscuro | `#561BAF` | Hover, texto activo en light |
| Primario claro | `#A78BFA` | Texto activo en dark |
| Surface dark | `#111113` | Fondo base dark |
| Surface card dark | `#252429` | Cards en dark |
| Text primary dark | `#D8D7D9` | Texto principal dark |
| Text secondary dark | `#888991` | Texto secundario dark |

Semánticos: `emerald` (success), `amber` (warning), `rose` (danger).

### Modo oscuro / claro

Gestionado con `useThemeStore()` de `~/stores/theme`:

```vue
<script setup>
import { useThemeStore } from '~/stores/theme'
const themeStore = useThemeStore()
</script>
<template>
  <div :class="themeStore.isDarkMode ? 'bg-[#252429] text-white' : 'bg-white text-[#111113]'">
```

**Nunca usar clases `dark:` de Tailwind** — el modo se controla vía `themeStore.isDarkMode`.

El store aplica `dark` al `<html>` via `document.documentElement.classList` y persiste en `localStorage['zwap-theme']`. Hidratado en `app/plugins/theme.client.js`.

### Glassmorphism

Helpers en `app/utils/cardClasses.js`:

```js
import { getCardClasses, getModalGlass, getDropdownGlass } from '~/utils/cardClasses'

getCardClasses(isDarkMode)       // Cards y SwipeableCard
getModalGlass(isDarkMode)        // Modales
getDropdownGlass(isDarkMode)     // Dropdowns y popovers
```

## Animaciones — motion-v

Port Vue de framer-motion. **Spring es el paradigma principal.**

### Constantes spring

En `app/utils/springs.js`:

```js
import { SPRING, SPRING_SIDEBAR, SPRING_SOFT, SPRING_DOTS } from '~/utils/springs'
```

- `SPRING` — UI default (stiffness 400, damping 30)
- `SPRING_SIDEBAR` — collapse/expand (380/42, critically damped)
- `SPRING_SOFT` — stagger items, lista (300/24)
- `SPRING_DOTS` — pill dots swipeable (420/32)

### Variantes compartidas

En `app/utils/motionVariants.js`:

```js
import { listVariants, itemVariants, cardItemVariants, pageVariants } from '~/utils/motionVariants'
```

- `listVariants` — wrapper con `staggerChildren: 0.05`
- `itemVariants` — fila de tabla: slide izq→der (`x: -10 → 0`)
- `cardItemVariants` — card: slide abajo→arriba (`y: 15 → 0`)
- `pageVariants` — entry de vista con exit

### Gotchas motion-v (diferencias con framer-motion)

1. **Spring no admite keyframe arrays.** `rotate: [0, -18, 14, ...]` con `type: 'spring'` tira error — usar `{ duration: 0.6, ease: 'easeInOut' }` para wiggles.
2. **`ref` sobre `<motion.div>`** devuelve la instancia motion-v, no el DOM — usar `.$el` fallback.
3. **`layoutId`** funciona con IDs globalmente únicos; `<LayoutGroup>` ayuda a componer scopes.
4. **Drag gestures:** `@drag-end="(event, info) => ..."` — `info.offset`/`info.velocity` con mismo shape que framer-motion.

### Patrón dropdown / popover

```vue
<AnimatePresence>
  <motion.div
    v-if="isOpen"
    :variants="panelVariants"
    initial="hidden"
    animate="visible"
    exit="exit"
    :style="{ transformOrigin: 'top left' }"
  >
    ...
  </motion.div>
</AnimatePresence>
```

### Patrón sidebar / nav indicator

`<LayoutGroup>` + `layoutId` para el pill activo:

```vue
<LayoutGroup id="sidebar-nav">
  <button v-for="item in NAV_ITEMS" :key="item.id" class="relative...">
    <motion.div
      v-if="isActive(item)"
      layout-id="sidebar-indicator"
      class="absolute inset-0 rounded-xl ..."
      :transition="SPRING"
    />
    <component :is="item.icon" :size="18" />
  </button>
</LayoutGroup>
```

### Patrón page transitions

Configurado en `nuxt.config.ts`:

```ts
app: {
  pageTransition: { name: 'page', mode: 'out-in' },
  layoutTransition: { name: 'layout', mode: 'out-in' },
}
```

CSS en `globals.css`: `.page-enter-active`, `.layout-enter-active`, etc. (fade + slide 8px).

## Stores Pinia

En `app/stores/`:

```js
import { useThemeStore } from '~/stores/theme'
import { usePerformanceStore } from '~/stores/performance'
import { useToastStore } from '~/stores/toast'
import { useViewSearchStore } from '~/stores/viewSearch'
```

| Store | State | Actions | Persistencia |
|---|---|---|---|
| `theme` | `isDarkMode` | `toggleTheme()`, `hydrate()`, `apply()` | `localStorage['zwap-theme']` |
| `performance` | `tier` (`full`/`lite`/`minimal`) | `hydrate()`, `setTier(tier)`, `apply()` | `localStorage['zwap-perf']` |
| `toast` | `toasts[]` | `addToast(msg, type?, duration?)`, `removeToast(id)` | — |
| `viewSearch` | `query`, `placeholder`, `hasFilters`, `activeFilterCount` | `setQuery()`, `registerView()`, `unregisterView()`, `setFilterOpener()`, `openFilters()` | — |

**Notas:**
- `viewSearch.filterOpener` se mantiene como `shallowRef` fuera del state (evita reactividad innecesaria).
- Tokens de auth: cookie `zwap_token` (`useCookie(...)`), no localStorage — SSR-safe aunque estemos en SPA mode.
- Sidebar collapse: `localStorage['zwap-sidebar']` (`'collapsed'`/`'expanded'`).
- Performance tier: `localStorage['zwap-perf']` — auto-detected or user override via Settings.

### Performance Tiers

El store `usePerformanceStore` detecta la capacidad del hardware y degrada la UI gracefully:

| Tier | Detección | Backdrop-blur | Shadows | Animaciones |
|---|---|---|---|---|
| `full` | >= 4 cores, >= 4GB RAM | Glass real (blur 2xl/3xl) | Custom rgba | Spring completas |
| `lite` | < 4 cores o < 4GB RAM | **Ninguno** (cards sólidas) | Simplificadas | Spring completas |
| `minimal` | < 2 cores o `prefers-reduced-motion` | Ninguno | Simplificadas | **Instantáneas** |

- `cardClasses.js`: las 3 funciones (`getCardClasses`, `getModalGlass`, `getDropdownGlass`) aceptan `useBlur` como tercer parámetro. Con `false` devuelven fondos sólidos con opacidad alta.
- `motionVariants.js`: variantes `*Instant` con `duration: 0` para tier minimal.
- `useMotionVariants()` composable: selecciona automáticamente entre variante spring o instant según `perfStore.useSpring`.
- CSS global: `html.perf-lite` desactiva `backdrop-filter`, `html.perf-minimal` desactiva también animaciones/transiciones.
- `@media (prefers-reduced-motion: reduce)` desactiva animaciones a nivel OS (WCAG 2.1).
- Settings: toggle "Modo Ligero" en pestaña Mi Perfil permite override manual.

### Composable `useViewSearch(placeholder)`

```js
import { useViewSearch } from '~/composables/useViewSearch'

// En una vista con búsqueda:
const viewSearch = useViewSearch(computed(() => t('users.searchPlaceholder')))
// viewSearch.query, viewSearch.setQuery, viewSearch.setActiveFilterCount

// Vista sin búsqueda:
useViewSearch('')
```

El composable registra el placeholder con `watch({ immediate: true })` y limpia en `onUnmounted`.

### Flujo de búsqueda contextual

```
Vista monta → useViewSearch(placeholder) registra config en Pinia
  ↓
Header lee query/placeholder del store
  ↓
Desktop: search bar siempre visible con placeholder contextual
Mobile: ícono de búsqueda → expande inline con spring
  ↓
Usuario escribe → query actualiza → vista filtra sus datos via computed
```

### Flujo de filtros (mobile)

```
TableToolbar monta → viewSearch.setFilterOpener(openSheet) registra callback
  ↓
Header muestra ícono SlidersHorizontal (si hasFilters)
  + dot púrpura si activeFilterCount > 0
  ↓
Usuario toca filtros → viewSearch.openFilters() → TableToolbar abre BottomSheet
  ↓
DropdownFilter detecta sheetMode via inject('tableToolbarSheetMode')
  renderiza fila full-width
  ↓
@reset en TableToolbar limpia todos los filtros
```

## Composables

En `app/composables/` (auto-import por Nuxt):

| Composable | Firma | Descripción |
|---|---|---|
| `useMediaQuery(query)` | `Ref<boolean>` | matchMedia reactivo (e.g. `(min-width: 1024px)`) |
| `useScrollLock(active)` | void | Bloquea `<main>` con counter (`has-overlay` class en `<html>`) |
| `useModalOpen()` | `Ref<boolean>` | Observa `data-modal-open` del body via MutationObserver |
| `useChromeBlur(active?)` | void | Setea `data-modal-open` con counter — blur al chrome |
| `useInfiniteScroll(data, opts)` | `{ visibleData, hasMore, sentinelRef }` | IntersectionObserver sentinel |
| `useViewSearch(placeholder)` | store | Registra búsqueda contextual |
| `useMotionVariants()` | `{ list, item, cardItem, page }` (computed refs) | Selecciona variante spring o instant según performance tier |

**Nota SSR:** todos usan guards `typeof document === 'undefined'` y/o `onMounted` para evitar crashes (aunque estamos en SPA mode, los guards se mantienen por si se migra a SSR/SSG).

## Internacionalización (i18n)

`@nuxtjs/i18n` v10 con vue-i18n v11. Configurado en `nuxt.config.ts`:

```ts
i18n: {
  defaultLocale: 'es',
  strategy: 'no_prefix',              // URLs sin /es/ o /en/
  locales: [
    { code: 'es', name: 'Español', file: 'es.json' },
    { code: 'en', name: 'English', file: 'en.json' },
  ],
  detectBrowserLanguage: {
    useCookie: true,
    cookieKey: 'zwap-language',
    redirectOn: 'root',
  },
  compilation: { strictMessage: false },
}
```

### Uso

```vue
<script setup>
const { t, locale, setLocale } = useI18n()
</script>

<template>
  <p>{{ t('nav.dashboard') }}</p>
  <p>{{ t('links.linkCopied', { name: 'Alice' }) }}</p>
</template>
```

### Sintaxis vue-i18n (distinto de react-i18next)

| Caso | react-i18next | vue-i18n |
|---|---|---|
| Interpolación | `{{var}}` | `{var}` |
| Plural | `key_one` / `key_other` | `"singular | plural"` |
| Arrays | `t(key, { returnObjects: true })` | `tm(key)` |
| `@` en strings | libre | reservado (escape con `{'@'}` o evitar) |
| Plural con named | `t(key, { count })` | `t(key, { count }, count)` — tercer arg |

### Locales

- Archivos: `i18n/locales/es.json` (español), `i18n/locales/en.json` (inglés)
- Idioma por defecto: `es`
- Cookie: `zwap-language`
- Selector: `SettingsView` (pestaña "Mi Perfil")
- Namespaces: `common`, `nav`, `header`, `auth`, `dashboard`, `transactions`, `refund`, `links`, `settlements`, `wallet`, `branches`, `users`, `settings`, `filters`, `errors`, `calendar`, `pagination`, `search`, `workflow`

### Reglas

1. **No hardcodear strings visibles al usuario** — usar `t('namespace.key')`
2. Agregar claves en **ambos** archivos de locale
3. Interpolar con `{var}` (NO template literals)
4. Para arrays (meses, días): `tm(key)` → devuelve el array, no el string
5. Los valores de datos mock (roles, estados) siguen en español — usar mapas de traducción para display

### Email placeholders

⚠️ **El `@` es sintaxis reservada de vue-i18n (linked-message).** Los 2 placeholders de email en el código NO incluyen `@` — se hardcodean en el componente:

```vue
<!-- NewUserModal.vue -->
<Input type="email" placeholder="admin@hotel.com" />

<!-- NewLinkModal.vue -->
<Input type="email" placeholder="alice@example.com" />
```

En `es.json`/`en.json` los keys relacionados son "Email del administrador" / "Admin email" sin `@`.

## Responsive Design

### Estrategia general

- **Desktop-first** — diseñar para 1920x1080, adaptar hacia abajo
- **Breakpoint principal:** `lg: 1024px` — switch entre Sidebar (desktop) y BottomNav (mobile/tablet)
- **Max-width:** `max-w-[1400px] 2xl:max-w-[1600px]` en contenedor principal del layout
- **Viewport:** `viewport-fit=cover` para safe areas en iOS

### Hook de breakpoints

```js
import { useMediaQuery } from '~/composables/useMediaQuery'

const isDesktop = useMediaQuery('(min-width: 1024px)')
// isDesktop.value es reactivo
```

### Navegación responsive

| Viewport | Navegación | Componente |
|---|---|---|
| ≥ 1024px (lg) | Sidebar colapsable | `app/components/Sidebar.vue` |
| < 1024px | Bottom navigation | `app/components/BottomNav.vue` |

**BottomNav** — 4 tabs fijos (Dashboard/Transacciones/Links/Liquidaciones) + botón "Más" que abre un sheet con Sucursales/Usuarios/Wallet/Configuración + quick actions (Tema, Notificaciones). Safe area via `pb-[env(safe-area-inset-bottom)]`. El sheet de "Más" es inline (no `<BottomSheet>`) con z-30 backdrop, z-[35] panel, z-40 nav para que la barra quede encima.

**Header** — desktop: search bar inline + botones tema/settings/notifs + selector de sucursal (dropdown). Mobile: ZwapIsotipo + ZwapWordmark; al expandir búsqueda el wordmark desaparece con `WORDMARK_VARIANTS` (blur+slide). El selector de sucursal mobile es pill con inicial → bottom sheet. Tema/notifs viven en "Más" del BottomNav.

### Patrón tabla → cards (mobile)

CSS visibility, no renderizado condicional:

```vue
<Card class="pb-2 hidden lg:block">
  <!-- tabla desktop -->
</Card>

<div class="lg:hidden space-y-3">
  <!-- cards mobile -->
</div>
```

Vistas con este patrón: TransaccionesView, CustomLinksTable, LiquidacionesView, UsuariosView, WalletView, LiveFeed.

**Reglas para cards mobile:**
1. `min-w-0` en flex children con texto (evita overflow)
2. `truncate` en textos largos (emails, IDs, nombres)
3. `shrink-0` en elementos de ancho fijo (amounts, badges)
4. `flex-wrap` en filas con múltiples badges

### Modal responsive

| Viewport | Posición | Esquinas | Padding |
|---|---|---|---|
| < sm (640px) | Bottom-sheet (`items-end`) | `rounded-t-[24px]` | `px-5 py-5` |
| ≥ sm | Centered (`items-center`) | `rounded-[24px]` | `px-8 py-6` |

### Convenciones

1. **Padding AppShell:** desktop `px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pt-8 xl:px-10 xl:pt-10 2xl:px-12 2xl:pt-12 lg:pb-10 xl:pb-12 2xl:pb-16`; mobile `px-4 sm:px-6 pt-20` + `style="paddingBottom: calc(5rem + env(safe-area-inset-bottom))"` (el shorthand Tailwind sobreescribe pb-*, por eso style prop)
2. **Header height:** `h-16 lg:h-20`. Mobile: `fixed inset-x-0 top-0` con scroll-aware (se oculta al scrollear abajo). Desktop: `relative`.
3. **Safe areas:** `env(safe-area-inset-bottom)` en fixed bottom (BottomNav, Modal sheet)
4. **Touch targets:** mínimo 40px (ideal 44px)
5. **Scroll locking:** `layouts/default.vue` bloquea `overflow` en `html` + `body` (iOS Safari requiere ambos para contener scroll en main)

## Mock data

En `app/utils/mockData.js`. Imports en ES module con `lucide-vue-next` (los íconos son referencias de componentes Vue).

Exports:

| Export | Contenido |
|---|---|
| `BRANCHES` | `string[]` |
| `BRANCH_LIST` | Sucursales con detalle |
| `WALLET_BALANCE` | `{ raw, display, short }` |
| `WALLET_STEPS` | Steps del stepper |
| `BANK_ACCOUNT` | Cuenta bancaria |
| `CHART_DATA`, `CONVERSION_DATA`, `PAYMENT_METHODS` | Datos de gráficas |
| `KPIS` | KPIs dashboard |
| `TRANSACTIONS` | Historial |
| `PERMANENT_LINKS`, `CUSTOM_LINKS` | Links de pago |
| `WITHDRAWALS` | Retiros |
| `PAYOUTS`, `SETTLEMENT_SUMMARY` | Liquidaciones |
| `USERS`, `CURRENT_USER` | Usuarios |
| `BUSINESS_NAME` | Nombre del negocio |
| `PLAN_INFO`, `SESSIONS`, `PAYMENT_CARD` | Settings |

Importar desde ahí, no hardcodear.

## Native App Feel

La app busca sentirse nativa en desktop (hover states, tablas, toast abajo-derecha) y mobile (active states, sin selección de texto, toast centrado abajo).

### Global touch optimizations (`globals.css`)

```css
body {
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
}

input, textarea, [contenteditable], td, th, pre, code, .selectable {
  user-select: text;
  -webkit-user-select: text;
}
```

### Active states

Todos los variants de `Button` tienen `active:` más intenso que `hover:`. Cards con `hover-effect` incluyen `active:translate-y-0 active:bg-*`.

### Toast responsive

- **Mobile (< 640px):** Centrado abajo, sobre BottomNav (`bottom-20 left-1/2 -translate-x-1/2`)
- **Desktop (≥ 640px):** Abajo-derecha (`sm:bottom-6 sm:right-6 sm:left-auto sm:translate-x-0`)

Claves i18n cortas para mobile: patrón `namespace.keyShort` (ej. `links.linkCopiedShort`) vs `namespace.key`.

## Full-attention overlays — patrón estándar

Cualquier elemento que requiera atención total del usuario (modales, recibos, lightboxes, bottom sheets) **debe** cumplir:

1. **Teleport a `body`** — `<ClientOnly><Teleport to="body">...</Teleport></ClientOnly>` para escapar stacking contexts del layout (evita que BottomNav `z-40` tape el overlay).

2. **Señalizar con `useChromeBlur(activeRef)`** — setea `data-modal-open` en body con counter. Sidebar/BottomNav aplican `blur-xs saturate-50 pointer-events-none` cuando observan el flag (via `useModalOpen`).

Componentes que ya cumplen el patrón: `Modal`, `BottomSheet`, `QrLightbox`, `ReceiptModal`, `WithdrawReceiptModal`. Cualquier modal nuevo que use `<Modal>` lo hereda gratis.

## Dashboard — Fused Header

DashboardView no usa `<PageHeader>`. En su lugar header fusionado: título + SegmentControl + botón de acción en flex row:

```vue
<div class="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
  <h1 class="text-xl sm:text-2xl font-bold tracking-tight hidden sm:block">
    {{ t('nav.dashboard') }}
  </h1>
  <div class="flex-1 sm:max-w-xs">
    <SegmentControl v-model="activeTab" :options="..." layout-id="dashboardTab" />
  </div>
  <Button class="hidden sm:flex sm:ml-auto" @click="newLinkOpen = true">...</Button>
</div>
```

En mobile: solo SegmentControl (full-width), sin título ni botón.

## ChartCard — SVG nativo (sin Recharts)

Recharts no tiene port Vue. `ChartCard.vue` implementa el area chart con SVG nativo inline:
- Path bezier (curveMonotone) para smoothing
- Gradients `<linearGradient>` SVG
- Hover cursor + tooltip custom siguiendo el cursor
- Otras tabs (conversion, métodos) usan divs/gradients como el original

## Versionamiento

Semantic Versioning. Historial en `CHANGELOG.md` (formato [Keep a Changelog](https://keepachangelog.com/)).

## No hacer

- No usar Options API — solo `<script setup>`
- No crear CSS modules ni archivos `.css` separados — Tailwind inline
- No usar clases `dark:` de Tailwind — branch JS con `themeStore.isDarkMode`
- No pasar callbacks de modales desde el layout a features
- No añadir dependencias sin consultar
- No crear helpers o abstracciones especulativos
- No usar `ease`/`tween` en animaciones de UI — spring siempre
- No hardcodear datos — usar `mockData.js`
- No hardcodear strings — usar `t('key')`
- No usar `{{var}}` en locales — vue-i18n usa `{var}`
- No exports en `<script setup>` — mover a `.js` externo
- No acceso directo a `window`/`document` sin guard o `onMounted`
- No `ref` de motion-v components sin `.$el` fallback
