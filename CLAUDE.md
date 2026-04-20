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
| `settings` | SettingsView (orquestador ~110 líneas) | `SettingsProfileTab`, `SettingsSecurityTab`, `SettingsBillingTab` + `SettingItem.vue` (shared UI row con icon+title+desc+slot) |

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
import {
  getCardClasses, getModalGlass, getDropdownGlass,
  getTheadClass, getTableRowClass,
} from '~/utils/cardClasses'

getCardClasses(isDarkMode)           // Cards y SwipeableCard
getModalGlass(isDarkMode)            // Modales
getDropdownGlass(isDarkMode)         // Dropdowns y popovers
getTheadClass(isDarkMode, isLite)    // <thead> de tablas — Lite-aware
getTableRowClass(isDarkMode)         // <tr> con hover — compartido 4 vistas (Transacciones/Wallet/Liquidaciones/Usuarios)
```

**Helper de refs motion-v** (`app/utils/motionRef.js`):

```js
import { getEl } from '~/utils/motionRef'

const domEl = getEl(myMotionRef.value)  // devuelve ref.$el ?? ref
```

Usado en `Modal.vue` y `Tooltip.vue` (centralizado desde R3 — antes duplicado inline en ambos).

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
| `performance` | `tier` (`full`/`normal`/`lite`) | `hydrate()`, `setTier(tier)`, `apply()` | `localStorage['zwap-perf']` |
| `toast` | `toasts[]` | `addToast(msg, type?, duration?)`, `removeToast(id)` | — |
| `viewSearch` | `query`, `placeholder`, `hasFilters`, `activeFilterCount` | `setQuery()`, `registerView()`, `unregisterView()`, `setFilterOpener()`, `openFilters()` | — |

**Notas:**
- `viewSearch.filterOpener` se mantiene como `shallowRef` fuera del state (evita reactividad innecesaria).
- Tokens de auth: cookie `zwap_token` (`useCookie(...)`), no localStorage — SSR-safe aunque estemos en SPA mode.
- Sidebar collapse: `localStorage['zwap-sidebar']` (`'collapsed'`/`'expanded'`).
- Performance tier: `localStorage['zwap-perf']` — auto-detected or user override via Settings.

**localStorage — patrón try/catch obligatorio:**

Safari private mode, iframes sin permisos y quota-exceeded lanzan. Todo acceso va envuelto:

```js
let stored = null
try { stored = localStorage.getItem(KEY) } catch {}
try { localStorage.setItem(KEY, value) } catch {}
try { localStorage.removeItem(KEY) } catch {}
```

Aplica en `theme.js`, `performance.js`, `layouts/default.vue` (sidebar collapse).

### Performance Tiers (3 niveles)

Ver doc dedicado: **[docs/performance-tiers.md](docs/performance-tiers.md)**.

El store `usePerformanceStore` expone 3 tiers con detección automática + override manual en Settings:

| Tier | Target device | Identidad | Efectos removidos |
|---|---|---|---|
| **`full` (Prism)** | Desktop, flagships (MacBook, iPhone 13+, S23+) | Liquid glass, neon, morphs, continuous anims | — |
| **`normal`** | Mid-range (iPhone XR-14, Galaxy A5x, Pixel 5-6) | Glass base, morphs, hover-lift, continuous anims | Neon glows, glass elevation, chrome saturate, button shimmer, blob parallax |
| **`lite`** | Low-end (Samsung A15, 4GB RAM) + `prefers-reduced-motion` | Surfaces sólidas, morphs OFF | backdrop-filter, filter:blur, hover-lift, nav morphs, continuous anims |

**Detección** (`detectTier()`):
```
prefers-reduced-motion              → lite
cores < 4 || memory < 4GB           → lite
cores < 8 || memory < 6GB           → normal
isMobile UA || (touch && !memory)   → normal
else                                → full
```

**Getters granulares** (consumir `perfStore.X` en componentes):
- GPU: `useBlur`, `useReducedBlur`, `useNeon`, `useInnerHighlight`, `useWalletGlowBubble`, `useGlassElevation`, `useActiveHalo`, `chromeSaturate`
- Animación: `useSpring`, `useLayoutMorphs`, `useNavMorphs`, `useContinuousAnim`
- Interacción: `useHoverLift`, `useDecorGradients`
- Composite: `modalShadow` (string `'deep'|'medium'|'compact'`), `modalBackdropFilter` (string de Tailwind classes)

**Nuevos helpers clave**:
- `cardClasses.js`: `getCardClasses(isDarkMode, hoverEffect, useBlur, useNeon, useGlassElevation)` — 5to param activa liquid glass.
- `getModalGlass(isDarkMode, useBlur, shadowLevel, useGlassElevation)` — `shadowLevel` es 3-way (`deep`/`medium`/`compact`).
- `getDropdownGlass(...)` — mismo patrón.
- `getTheadClass(isDarkMode, isLite)` — table thead Lite-aware (ver sección 1.6 de prism-ui.md).
- `useDebouncedSearch(getter, { liteDelay, onInput })` — debounce de búsquedas activado solo en Lite.

**Liquid glass Prism — fórmula validada:**
- Opacidad baja en bg (`/20-30` cards, `/65-85` modales según densidad texto)
- `backdrop-blur-2xl` (cards) / `3xl` (modales) + `backdrop-saturate-150`
- Rim borders (`border-t-white/25` + `border-l-white/10`)
- Inset 1px highlight top (catch de luz en edge, NO overlay)
- Dual-source drop shadow
- ❌ NO specular white gradient (`from-white/[X] to-transparent`) — ensucia el vidrio

**Lite wireframe aesthetic — para surfaces en light mode:**
- Bg `#F8F7FB` (off-white tintado lavanda) para inputs, Toolbar, search bars, Button outline/successExport, thead
- Bg `bg-white` para Cards (paper feel) con borde `border-[#DBD3FB]` (brand-light)
- Dark mode Lite: layering `#111113` (app) → `#1A1A1D` (chrome/cards) → `#0F0F11` (inputs)
- Shadows branded: `shadow-[0_1px_2px_rgba(124,58,237,0.05),0_4px_12px_rgba(124,58,237,0.06)]`
- Active state (reemplaza hover-lift): `active:scale-[0.98] active:bg-[#7C3AED]/20` dark / `/10` light
- Radial-gradient bg (sustituye blobs blur): `ellipse_at_top_left, rgba(124,58,237,0.22) 0%, transparent 55%`

**CSS global**:
- `html.perf-normal .backdrop-blur-*` → radios reducidos a ~50%
- `html.perf-lite *` → `backdrop-filter: none`, `filter: none` en `.blur-*`, sin hover-lift
- `@media (prefers-reduced-motion: reduce)` → overrides globales WCAG 2.1

**Navigation morphs vs Action morphs**:
- `useNavMorphs` (pill Sidebar/BottomNav/SegmentControl/dropdown) — OFF en Lite (instant toggle)
- `useLayoutMorphs` (QR expand, etc.) — siempre ON (moment de identidad one-shot)

**Settings UI** (`SettingsView.vue` → pestaña Mi Perfil → sección Performance):
- SegmentControl con 3 opciones: `Prism` / `Normal` / `Lite`
- Descripción dinámica por tier seleccionado
- Override manual persiste en `localStorage['zwap-perf']`

**Lite atmósfera pintada** (radial gradients sin blur):

Para reintroducir carácter Prism en Lite sin `backdrop-filter`/`filter:blur`:
- **Sidebar halo top-left** (`Sidebar.vue`): `radial-gradient(ellipse 120% 70% at 15% 0%, rgba(124,58,237,0.16), transparent 62%)` dark / `0.09` light. Div `absolute z-[-1]` dentro del aside.
- **Header halo top-right** (`Header.vue`): `radial-gradient(ellipse 60% 180% at 95% 50%, rgba(124,58,237,0.10), transparent 60%)` dark / `0.06` light. Header necesita `position: relative` para stacking context (ya aplicado en desktop; mobile usa `fixed` que también crea context).
- **Sidebar divider rim** (`layouts/default.vue`): gradient vertical `rgba(124,58,237,X)` con decay (0.5→0.2→white/black) que reemplaza el `bg-white/10` plano.
- **Page transitions**: desactivadas globalmente vía `html.perf-lite .page-enter-active { transition: none }` en `globals.css`.

Todo consumido via `v-if="perfStore.isLite"` + inline `:style` computed. Cero GPU cost (solo paint).

⚠️ **Inline `background` (shorthand) domina sobre utilities `bg-*`** — no combinar `:style="{ background: gradient }"` con `group-hover:bg-*` (el hover no se aplicará).

⚠️ **Mobile header position** (`Header.vue`): `fixed inset-x-0 top-0` (mobile) y `relative` (desktop) son exclusivos. Nunca emitir `relative` como clase permanente junto con `fixed` condicional — reserva espacio en flow y duplica offset con el `pt-20` de main.

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
| `useDebouncedSearch(sourceGetter, opts?)` | `Ref<string>` | Debounce solo en Lite (250ms default); Prism/Normal instant. `onInput` callback corre cada keystroke (útil para reset de página) |
| `useViewSearch(placeholder)` | store | Registra búsqueda contextual |
| `useMotionVariants()` | `{ list, item, cardItem, page }` (computed refs) | Selecciona variante spring o instant según performance tier |
| `useFilterSlot(defaultValueSource)` | `{ current, defaultValue, isDirty, reset }` | Encapsula patrón filtro: ref + watch(immediate) + dirty check + reset. Destructurable con nombres propios para usar en template sin `.value.value` |
| `useDateRangeMatcher(t)` | `{ match(iso, filterValue, defaultValue) }` | Matcher compartido para filtros fecha: today / last7 / thisWeek / thisMonth. Usado en 3 vistas con tablas |

**Patrón de filtro tabla** (R2): en vistas con filtros status/fecha/otros, usar `useFilterSlot` + `useDateRangeMatcher` en vez de duplicar el boilerplate. Ejemplo canónico en `TransaccionesView.vue`:

```js
const {
  current: statusFilter, defaultValue: defaultStatus,
  isDirty: statusDirty, reset: resetStatus,
} = useFilterSlot(() => t('filters.all'))
const {
  current: dateFilter, defaultValue: defaultDate,
  isDirty: dateDirty, reset: resetDate,
} = useFilterSlot(() => t('filters.anyDate'))
const { match: matchDate } = useDateRangeMatcher(t)

const filtersActive = computed(() =>
  (statusDirty.value ? 1 : 0) + (dateDirty.value ? 1 : 0),
)
const resetFilters = () => { resetStatus(); resetDate(); currentPage.value = 1 }
```

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

### Modal stacking — `z` prop + `modalStack`

Sub-modales (ej. `DatePickerModal` dentro de `NewLinkModal`):

- Default `z: 50`. Sub-modales usan `z: 60+` en saltos de 10.
- Cada `<Modal>` se registra en `~/utils/modalStack.js` (Symbol único por instancia). **Solo el modal TOP responde a Escape/Tab** — los padres quedan inertes mientras el hijo esté abierto.
- El sub-modal debe:
  - aceptar `:is-open="flag"` + `@close` en su API,
  - envolver su `<Modal v-if="isOpen">` en `<AnimatePresence>` para conservar el exit animation,
  - teleport propio (via Modal interno), NO anidar en un `<div class="relative z-[X]">` del caller.
- NO reutilizar el mismo `z` entre modales simultáneos — el focus trap es por stack, pero el paint order sigue la z-index.

### Redirect validation (open-redirect prevention)

Toda URL tomada de `route.query` o `to.fullPath` que se use en `navigateTo()` debe pasar por `isSafeInternalPath` (en `~/utils/routes`):

```js
import { isSafeInternalPath } from '~/utils/routes'
const redirect = isSafeInternalPath(route.query.redirect) ? route.query.redirect : ROUTES.DASHBOARD
navigateTo(redirect)
```

Rechaza `//host`, `/\path`, URLs absolutas, non-strings. Aplicado en `middleware/auth.js` y `pages/login.vue`.

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

## Protocolo de cambios significativos

Para migraciones, refactors, optimizaciones, o cualquier cambio que toque más de 5 archivos:

### Fase de análisis (NO tocar código)

1. **Investigar** — documentación oficial, breaking changes, evaluar consejos externos contra nuestro stack. Descartar lo que no aplica con justificación.
2. **Auditar impacto** — búsqueda exhaustiva en el codebase: qué archivos, qué líneas, cuántas ocurrencias. Generar tabla de impacto con conteos exactos.
3. **Anticipar efectos** — para cada cambio planificado, responder:
   - ¿Qué valor/comportamiento tiene HOY?
   - ¿Qué valor/comportamiento tendrá DESPUÉS?
   - ¿Son idénticos? Si no, ¿qué se rompe visualmente o funcionalmente?
   - ¿Hay efectos colaterales en otros componentes que consumen esto?
4. **Verificar con prueba aislada** — si hay duda sobre un valor (CSS, API, output), crear un componente/archivo temporal de prueba para confirmar ANTES de modificar el código real.

### Fase de planificación (NO tocar código)

5. **Planificar por fases** — ordenar de menor a mayor riesgo. Cada fase incluye:
   - Archivos a modificar con cambios concretos
   - Efecto esperado (qué cambia, qué se mantiene igual)
   - Criterio de verificación (cómo confirmar que funcionó)
   - Rollback: qué revertir si falla
6. **Presentar plan para aprobación** — el usuario revisa y aprueba antes de ejecutar.

### Fase de ejecución (ahora sí tocar código)

7. **Ejecutar fase por fase** — entre cada fase verificar:
   - Servidor arranca sin errores (HTTP 200)
   - El cambio específico se refleja (CSS generado, HTML, runtime)
   - Sin regresiones en funcionalidad existente
8. **Build de producción** — `npm run build` exitoso antes de commitear.
9. **Documentar** — actualizar CLAUDE.md si cambia stack, APIs, o patrones.

## Testing

Stack: **Vitest** (unit/component) + **Playwright** (E2E cross-browser) + **@axe-core/playwright** (a11y) + **@lhci/cli** (Lighthouse) + **MSW** (mocking API). **789 tests verdes** (431 unit + 358 E2E).

### Estructura

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

### Convenciones

1. **Unit** (Vitest + happy-dom): `tests/unit/<layer>/<name>.spec.ts`. Lógica pura (utils, composables, stores, funciones). Sin DOM real salvo que el composable lo requiera — en ese caso usar `withSetup(fn)` helper.
2. **Component** (Vitest + @vue/test-utils + `mountComponent`): `tests/component/ui/<Name>.spec.ts`. Props/events/slots + branches por tier. Mock global de motion-v ya aplicado.
3. **E2E** (Playwright): `tests/e2e/<name>.spec.ts`. Usar fixtures (`setTier`, `setTheme`, `mockAuth`, `consoleErrors`, `waitForUIReady`). `reducedMotion: 'reduce'` global anula loops `repeat: Infinity`.

### Matriz Playwright (7 projects)

`desktop-chromium` (1440×900), `desktop-firefox`, `desktop-webkit` (Safari desktop proxy), `tablet-ipad-chromium`, `tablet-ipad-webkit` (Safari iPad), `mobile-pixel7` (Android Chromium), `mobile-iphone14` (Safari mobile).

### Política A11y

`critical` (button-name, aria-valid, label, etc.) → **FAIL**. `serious/moderate/minor` (color-contrast en UX secondary, etc.) → **WARN logueado**. El contraste de texto deshabilitado/secundario es decisión UX documentada en Prism; fallar en cada corrida rompería DX.

### Visual regression selectivo

Solo 2 projects baseline: `desktop-chromium` + `mobile-pixel7`. Los otros 5 projects corren los mismos specs pero sin screenshot compare (validan layout con `expect(locator).toBeVisible()` + `toHaveCSS`). Tolerance 3%. Masked: `.animate-spin, .animate-pulse, .prism-qr-shimmer`.

### Mock motion-v

`tests/unit/helpers/setup.ts` registra `vi.mock('motion-v', () => motionStub)` globalmente. El stub usa Proxy para reemplazar cualquier `<motion.X>` con un wrapper simple que:
- Descarta props motion (`initial`, `animate`, `transition`, `drag`, `whileHover`, `layout-id`, etc.)
- Preserva slots, `$attrs` no-motion (incluido `aria-label`), y event listeners.
- Neutraliza `repeat: Infinity` (evita timers colgados en tests).

`AnimatePresence`, `LayoutGroup`, y `useAnimationControls` también stubbeados.

### Flujo de validación manual

```
cambios locales
  → npm test                (siempre, ~3s)
  → npm run test:e2e        (antes de merge a main, ~5min)
  → análisis de results
  → git commit en rama concepts
  → git push                Cloudflare auto-deploy
```

Ver `README.md#testing` para comandos completos y triggers para escalar a CI automatizado (Phase 6).

### Scripts relevantes

- `npm test` / `npm run test:watch` / `npm run test:coverage`
- `npm run test:e2e` / `npm run test:e2e:ui` (UI Mode, visible via WSLg) / `npm run test:e2e:headed`
- `npm run test:a11y` / `npm run test:lhci`

### Lighthouse CI caveat en WSL

`categories.performance` OFF temporalmente por NaN en runner headless WSL (bug conocido chrome-launcher). Audits individuales (LCP, CLS, TBT) sí reportan correcto. Script `test:lhci` inyecta `CHROME_PATH` resolviendo a `require('playwright').chromium.executablePath()` porque el runner por default buscaba binario en path Windows.

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
- No acceso directo a `localStorage` sin `try/catch` (Safari private mode lanza)
- No `navigateTo(query.redirect)` sin pasar por `isSafeInternalPath`
- No emitir `backdrop-blur-*` incondicionalmente — guardar con `perfStore.useBlur` para inspector honesto
- No sub-modal sin `<AnimatePresence>` wrapper — pierde exit animation
- No mezclar `:style="{ background: ... }"` con utility `bg-*` hover — inline shorthand domina, hover nunca aplica
- No `useMediaQuery()` dentro de un `computed` — usa lifecycle hooks (`onMounted`/`watch`), debe invocarse a top-level del setup
- No `import { VueDatePicker } from '@vuepic/vue-datepicker'` pasando `locale: string` — v12 espera `Locale` de date-fns; omitir el prop si no se importa el objeto correcto
