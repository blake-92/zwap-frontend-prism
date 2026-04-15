# CLAUDE.md — Zwap Frontend Prism

Instrucciones para Claude Code al trabajar en este repositorio.

## Stack

- **React 18** + **Vite 5**
- **Tailwind CSS 3** — utilidades inline, sin CSS modules
- **React Router v6** — nested routes con `<Outlet />`
- **Lucide React** — íconos
- **Recharts** — gráficas
- **Framer Motion** — animaciones (spring como paradigma principal)
- **react-day-picker v9** — calendario en `DatePickerModal` (estilos Prism en `globals.css`)

## Alias de paths

El alias `@/` apunta a `src/`. Usar siempre `@/` en imports, nunca rutas relativas con `../../`.

```js
// Correcto
import { Card } from '@/shared/ui'
import { ROUTES } from '@/router/routes'

// Incorrecto
import { Card } from '../../shared/ui'
```

## Arquitectura — Bulletproof React (vertical slices)

Cada feature vive en `src/features/<nombre>/`:

```
features/links/
├── components/
│   ├── LinksView.jsx      # Vista principal (ruta)
│   └── NewLinkModal.jsx   # Modal propio de la feature
└── index.js               # Re-export público
```

### Features actuales

| Feature | Vista principal | Modales / subcomponentes |
|---------|----------------|--------------------------|
| `auth` | LoginView | — |
| `dashboard` | DashboardView | KpiCard, ChartCard, QuickLinkCard (responsive: desktop tabs / mobile swipeable), LiveFeed (desktop: table, mobile: ticker with tap→receipt), PendingCharges (widget de triage — desktop: tabla con columnas Vistas/Tiempo/Recomendación; mobile: ticker compacto con stat chips y tap→TriageDetailModal — ver `docs/pending-links-decision-matrix.md`) |
| `transactions` | TransaccionesView | ReceiptModal (also re-exported for cross-feature use by LiveFeed), RefundModal |
| `links` | LinksView | NewLinkModal, LinkDetailModal |
| `settlements` | LiquidacionesView | — |
| `wallet` | WalletView | WithdrawModal, WithdrawReceiptModal |
| `branches` | SucursalesView | NewBranchModal |
| `users` | UsuariosView | NewUserModal |
| `settings` | SettingsView | — |

### Reglas de features

1. **Las vistas son autónomas** — no reciben callbacks de navegación desde el padre. Usan `useNavigate(ROUTES.X)` internamente.
2. **Los modales son propios** — cada vista gestiona su propio estado de modal con `useState`. `AppShell` no orquesta modales.
3. **No prop-drilling** — si una vista necesita navegar a otra, usa `useNavigate`, no callbacks.
4. **No cross-feature imports** — nunca importar desde `features/X/components/` en otro feature o en `shared/`. Usar el re-export público de `features/X/index.js`. Componentes usados por el layout (Sidebar, Header) viven en `shared/layout/`.

## Rutas

Las constantes de rutas están en `src/router/routes.js`:

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

Al añadir una ruta nueva:

1. Agregar la constante en `routes.js`
2. Agregar el `<Route>` en `src/router/index.jsx` (con `lazy()`)
3. Agregar el ítem en `NAV_ITEMS` de `Sidebar.jsx` si aplica

**Notas:**
- `/app` redirige automáticamente a `/app/dashboard` vía `<Route index>`
- `/legal/:doc` — ruta pública para páginas legales (stub por ahora)
- `ROUTES.SETTINGS` existe y funciona pero no está en `NAV_ITEMS` (acceso directo por URL o desde Header)
- `ROUTES.WALLET` no está en `NAV_ITEMS`; se accede desde el wallet button inlined en `Sidebar.jsx`

**Error & Suspense boundaries:** `AppShell` envuelve el `<Outlet>` con `<ErrorBoundary>` + `<Suspense>`. El `ErrorBoundary` captura errores runtime de vistas lazy; el `Suspense` muestra `<PageLoader />` mientras cargan. Nunca mover estos boundaries por encima de AppShell — causaría que Sidebar y Header remonten en cada cambio de ruta.

## Componentes base (Shared UI)

Importar desde `@/shared/ui`:

```js
import {
  Card, CardHeader, Button, Input, Toggle, Badge, Modal,
  Avatar, AvatarInfo, StatCard, Stepper, SegmentControl,
  DropdownFilter, SearchInput, TableToolbar, Pagination,
  PageHeader, SectionLabel, InfoBanner, Skeleton, Tooltip,
  DatePickerModal, EmptySearchState, ErrorBoundary, PageLoader
} from '@/shared/ui'
```

| Componente | Props clave | Descripción |
|---|---|---|
| `Card` | `hoverEffect`, `onClick` | Contenedor glass con bordes |
| `CardHeader` | `title`, `description` + right slot | Header de card con slot derecho |
| `Button` | `variant` (default/outline/ghost/action/danger/successExport), `size` (default/sm/lg/icon) | Botón con `whileTap` spring; respeta `disabled` |
| `Input` | `icon` (Lucide) | Input con ícono izquierdo, theme-aware |
| `Toggle` | `active`, `onToggle`, `disabled` | Switch con animación spring en el knob |
| `Badge` | `variant` (default/success/warning/danger/outline), `icon` | Label inline con variantes semánticas |
| `Modal` | `onClose`, `title`, `description`, `icon`, `footer`, `maxWidth` | Modal glass con spring; bottom-sheet en mobile, centered en desktop. Soporta stacking (counter en `dataset.modalCount`) |
| `Avatar` | `initials`, `size` (sm/md), `variant` (purple/neutral), `glow` | Badge circular con iniciales |
| `AvatarInfo` | `initials`, `primary`, `secondary`, `meta`, `glow` | Avatar + nombre + texto secundario + ID |
| `StatCard` | `layout` (kpi/balance), `label`, `value`, `icon`, `variant`, `negative` | Tarjeta de métrica / KPI |
| `Stepper` | `steps[]` (cada step: `label`, `sub`, `icon`, `done`, `active`) | Stepper horizontal con estados done/active/pending |
| `SegmentControl` | `options[]`, `value`, `onChange`, `layoutId?` | Selector de segmentos con pill animado (layoutId) |
| `DropdownFilter` | `label`, `options[]`, `value`, `onChange`, `icon`, `defaultValue`, `sheetMode` | Dropdown select con spring; `sheetMode` renderiza fila full-width para BottomSheet; `displayName` para detección en `cloneElement` |
| `TableToolbar` | `children` (filtros), `actions`, `onReset`, `className` | Desktop: barra glass con filtros + acciones. Mobile: registra callback en ViewSearchContext para que el Header abra un BottomSheet de filtros. `onReset` muestra botón "Limpiar filtros" |
| `Pagination` | `currentPage`, `totalPages`, `onPageChange` | Controles de paginación con elipsis |
| `PageHeader` | `title`, `children` (action slot) | Encabezado de página (h1). Hidden on mobile (`hidden sm:flex`). Vistas con botón de acción usan un bloque `sm:hidden` separado con `Button size="lg" className="w-full"` |
| `SectionLabel` | `children`, `className` | Etiqueta uppercase secundaria |
| `InfoBanner` | `variant` (warning/info/danger), `message` | Banner de alerta con ícono automático |
| `Skeleton` | `width`, `height`, `className` | Loader shimmer animado |
| `Tooltip` | `content`, `position` (top/bottom/left/right) | Tooltip portal con fade |
| `DatePickerModal` | `selectedDate`, `onSelect`, `timeValue`, `onTimeChange`, `onConfirm`, `onClose` | Modal de fecha + hora; desktop: react-day-picker, mobile: inputs nativos del OS |
| `BottomSheet` | `isOpen`, `onClose`, `title?`, `children` | Panel deslizante desde el borde inferior; backdrop + drag-to-dismiss + safe-area; se portaliza al body. Solo usar bajo `lg` |
| `EmptySearchState` | `colSpan`, `term`, `onClear` | Fila vacía para tablas sin resultados |
| `ErrorBoundary` | `children` | Captura errores runtime, muestra UI de fallback con botón reintentar |
| `PageLoader` | — | Spinner de carga para Suspense fallback |

## Sistema de diseño — Prism UI

### Tokens de color

| Token | Valor | Uso |
|---|---|---|
| Primario | `#7C3AED` | Acciones, activos, iconos |
| Primario oscuro | `#561BAF` | Hover, texto activo en light |
| Primario claro | `#A78BFA` | Texto activo en dark |
| Surface dark | `#111113` | Fondo base dark |
| Surface card dark | `#252429` | Cards en dark |
| Text primary dark | `#D8D7D9` | Texto principal dark |
| Text secondary dark | `#888991` | Texto secundario dark |

Semánticos: `emerald` (success), `amber` (warning), `rose` (danger).

### Modo oscuro / claro

Se gestiona con `useTheme()` de `@/shared/context/ThemeContext`:

```jsx
const { isDarkMode } = useTheme()

<div className={isDarkMode ? 'bg-[#252429] text-white' : 'bg-white text-[#111113]'}>
```

Nunca usar clases `dark:` de Tailwind — el modo se controla vía `isDarkMode`.

### Glassmorphism

Patrón estándar para cards y paneles. Los helpers reutilizables están en `src/shared/utils/cardClasses.js`:

```js
import { getCardClasses, getModalGlass, getDropdownGlass } from '@/shared/utils/cardClasses'

getCardClasses(isDarkMode)       // Cards y SwipeableCard
getModalGlass(isDarkMode)        // Modales (Modal, modales custom)
getDropdownGlass(isDarkMode)     // Dropdowns y popovers
```

Para variantes contextuales (search bar, tooltip, toolbar) se usan clases inline porque sus opacidades y blur son específicos.

## Animaciones — Framer Motion

Spring es el paradigma principal. Nunca usar `ease` o `tween` en interacciones de UI.

**Excepción:** animaciones decorativas de loop infinito (ej. shimmer de `Skeleton`) pueden usar `ease`/`tween` porque spring no tiene sentido semántico en repeticiones continuas.

### Constantes spring

Las constantes spring están centralizadas en `src/shared/utils/springs.js`. Importar desde ahí en vez de definir `SPRING` local:

```js
import { SPRING } from '@/shared/utils/springs'           // UI default (400/30)
import { SPRING_SIDEBAR } from '@/shared/utils/springs'    // Sidebar (380/42, critically damped)
import { SPRING_SOFT } from '@/shared/utils/springs'       // Stagger items (300/24, más suave)
```

Valores:

```js
// SPRING — interacciones de UI, dropdowns, modales, botones
{ type: 'spring', stiffness: 400, damping: 30 }

// SPRING_SIDEBAR — collapse/expand (critically damped, sin rebote)
{ type: 'spring', stiffness: 380, damping: 42 }

// SPRING_SOFT — entradas de lista, stagger items
{ type: 'spring', stiffness: 300, damping: 24 }
```

### Variantes compartidas (motionVariants.js)

Importar desde `@/shared/utils/motionVariants`:

```js
import { listVariants, itemVariants, cardItemVariants, pageVariants } from '@/shared/utils/motionVariants'
```

- `listVariants` — wrapper con `staggerChildren: 0.05`
- `itemVariants` — fila de tabla: slide izquierda→derecha (`x: -10 → 0`)
- `cardItemVariants` — card: slide abajo→arriba (`y: 15 → 0`)
- `pageVariants` — page entry: slide + fade con spring (usado en todas las vistas)

Uso en tablas:
```jsx
<motion.tbody variants={listVariants} initial="hidden" animate="show">
  {rows.map(row => <motion.tr key={row.id} variants={itemVariants}>...</motion.tr>)}
</motion.tbody>
```

Uso en vistas (page entry):
```jsx
<motion.div variants={pageVariants} initial="hidden" animate="show">
  {/* contenido de la vista */}
</motion.div>
```

### Patrón dropdown / popover

```jsx
const panelVariants = {
  hidden:  { opacity: 0, scale: 0.95, y: -6 },
  visible: { opacity: 1, scale: 1,    y: 0, transition: SPRING_FAST },
  exit:    { opacity: 0, scale: 0.95, y: -6, transition: { duration: 0.15 } },
}

<AnimatePresence>
  {isOpen && (
    <motion.div
      variants={panelVariants}
      initial="hidden" animate="visible" exit="exit"
      style={{ transformOrigin: 'top left' }}
    >
      ...
    </motion.div>
  )}
</AnimatePresence>
```

### Patrón sidebar / nav indicator

Usar `LayoutGroup` + `layoutId` para el pill activo. Sin `AnimatePresence` — el spring de layout maneja la transición:

```jsx
<LayoutGroup id="sidebar-nav">
  {NAV_ITEMS.map(item => (
    <button key={item.id} className="relative w-full flex items-center gap-3 py-3 pl-[19px] ...">
      {isActive && (
        <motion.div
          layoutId="sidebar-indicator"
          className="absolute inset-0 rounded-xl ..."
          transition={SPRING}
        />
      )}
      <Icon size={18} />
      <AnimatePresence initial={false}>
        {!isCollapsed && <motion.span variants={LABEL_VARIANTS} ...>{label}</motion.span>}
      </AnimatePresence>
    </button>
  ))}
</LayoutGroup>
```

**Nota:** Los botones usan `pl-[19px]` fijo (no `justify-center`) para que los íconos no salten al colapsar. El ícono queda centrado en 72px y alineado en 256px sin cambio de className.

### Sidebar — variantes de label y contenido

El sidebar define dos sets de variantes locales para las animaciones de reveal/hide al colapsar:

```js
// Liquid label reveal: blur + slide spring con delay
const LABEL_VARIANTS = {
  hidden: { opacity: 0, filter: 'blur(4px)', x: -8 },
  show:   { opacity: 1, filter: 'blur(0px)', x: 0,
            transition: { type: 'spring', stiffness: 400, damping: 30, delay: 0.06 } },
  exit:   { opacity: 0, filter: 'blur(4px)', x: -8,
            transition: { type: 'spring', stiffness: 320, damping: 28 } },
}

// Fade-blur para contenido secundario (user info)
const CONTENT_VARIANTS = {
  hidden: { opacity: 0, filter: 'blur(3px)' },
  show:   { opacity: 1, filter: 'blur(0px)',
            transition: { type: 'spring', stiffness: 380, damping: 30, delay: 0.1 } },
  exit:   { opacity: 0, filter: 'blur(3px)',
            transition: { type: 'spring', stiffness: 320, damping: 28 } },
}
```

- `LABEL_VARIANTS` — usado por los labels de nav, el wordmark del logo, y el wallet info. Incluye desplazamiento `x` para efecto de slide.
- `CONTENT_VARIANTS` — usado por el user row. Solo blur + fade, sin desplazamiento.

### Sidebar — layout anti-inflation

El footer del sidebar (wallet + user row) usa un patrón específico para evitar que los contenedores cambien de tamaño durante las transiciones de collapse/expand:

1. **Alturas fijas** en cada fila: nav `h-11`, wallet `h-14`, user `h-[52px]`
2. **Contenido absolutamente posicionado** — el texto revelado usa `absolute inset-y-0 left-[Xpx] right-Y` en vez de estar en el flow del flex. Esto garantiza que `AnimatePresence` no afecte las dimensiones del contenedor durante exit/enter.
3. **Ícono/avatar fijo en flow** — solo el elemento ancla (ícono Wallet, Avatar) permanece en el flujo flex del contenedor, determinando su altura natural.

```jsx
// Wallet: ícono en flow + contenido absoluto
<motion.button className="relative w-full h-14 flex items-center pl-[19px] ... overflow-hidden">
  <Wallet size={18} className="flex-shrink-0" />
  <AnimatePresence initial={false}>
    {!isCollapsed && (
      <motion.div variants={LABEL_VARIANTS}
        className="absolute inset-y-0 left-[49px] right-3 flex items-center justify-between overflow-hidden">
        ...
      </motion.div>
    )}
  </AnimatePresence>
</motion.button>

// User: avatar en flow + contenido absoluto
<div className="relative h-[52px] flex items-center pl-[10px] overflow-hidden">
  <Avatar size="sm" />
  <AnimatePresence initial={false}>
    {!isCollapsed && (
      <motion.div variants={CONTENT_VARIANTS}
        className="absolute inset-y-0 left-[58px] right-2 flex items-center justify-between overflow-hidden">
        ...
      </motion.div>
    )}
  </AnimatePresence>
</div>
```

### Brand components

Los assets de marca viven en `src/shared/brand/`:

| Componente | Props | Descripción |
|---|---|---|
| `ZwapIsotipo` | `isDarkMode`, `className` | Isotipo SVG (solo el símbolo) |
| `ZwapWordmark` | `isDarkMode`, `className` | Texto "ZWAP" SVG |
| `ZwapLogo` | `isDarkMode`, `className` | Logo completo (isotipo + wordmark en un solo SVG) |

El sidebar usa `ZwapIsotipo` + `ZwapWordmark` por separado para poder animar la aparición del wordmark con `LABEL_VARIANTS` al expandir. `ZwapLogo` existe como referencia pero no se usa activamente.

### Modal

```jsx
// Root — solo posiciona, sin initial/animate opacity (conserva exit para AnimatePresence)
<motion.div exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center">

  // Backdrop — opacity independiente
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    transition={{ duration: 0.15 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

  // Panel — opacity + scale/y con per-property transitions
  <motion.div
    initial={{ opacity: 0, scale: 0.95, y: 10 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95, y: 10 }}
    transition={{
      opacity: { duration: 0.15 },
      scale: SPRING, y: SPRING,
    }} />
</motion.div>
```

**Nota:** El root `motion.div` NO anima opacity en initial/animate — solo en exit. Cada hijo (backdrop y panel) controla su propia opacity. Esto evita desincronización donde el backdrop-blur era imperceptible a baja opacidad del root.

### Patrón QR lightbox (layoutId morph)

QR codes usan `layoutId` para animar un morph fluido entre la miniatura in-card y el lightbox fullscreen:

```jsx
// 1. Miniatura en el card
<motion.div
  layoutId="qr-code"
  onClick={() => setIsQrOpen(true)}
  className="bg-white p-3 rounded-2xl shadow-lg cursor-pointer group"
>
  <QrCode size={84} className="text-black" strokeWidth={1.5} />
  {/* Hover hint con Maximize icon */}
</motion.div>

// 2. Lightbox fullscreen — mismo layoutId → Framer anima el morph
<AnimatePresence>
  {isQrOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div /* backdrop */ initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsQrOpen(false)} />
      <motion.div layoutId="qr-code"
        className="relative bg-white p-8 rounded-[32px] shadow-2xl flex flex-col items-center">
        <QrCode size={260} className="text-black mb-5" strokeWidth={1.5} />
        <p className="font-bold text-xl">{name}</p>
        <p className="font-mono text-sm">{url}</p>
      </motion.div>
    </div>
  )}
</AnimatePresence>
```

**Nota:** Cada instancia usa un `layoutId` único (`"qr-code"` en dashboard, `"ql-qr-mini"` en links). ESC cierra + scroll lock vía `useEffect`. Usado por `QuickLinkCard` (dashboard) y `QuickLinkSwipeable` (links).

### Patrón swipeable card (drag-to-switch)

Para navegar entre N items con swipe horizontal. Usa `drag="x"` de Framer Motion con snap-back elástico:

```jsx
const [index, setIndex] = useState(0)
const goNext = () => setIndex(i => (i + 1) % items.length)
const goPrev = () => setIndex(i => (i - 1 + items.length) % items.length)

<motion.div
  drag="x"
  dragConstraints={{ left: 0, right: 0 }}
  dragElastic={0.12}
  style={{ touchAction: 'pan-y' }}
  onDragEnd={(_, info) => {
    if (info.velocity.x < -200 || info.offset.x < -50) goNext()
    else if (info.velocity.x > 200 || info.offset.x > 50) goPrev()
  }}
  className="cursor-grab active:cursor-grabbing select-none"
>
  {/* Contenido del item actual */}
  <AnimatePresence mode="wait">
    <motion.div key={item.id}
      initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.13 }}>
      ...
    </motion.div>
  </AnimatePresence>

  {/* Pill dots — activo se expande a pill */}
  <div className="flex gap-1.5">
    {items.map((_, i) => (
      <motion.div key={i}
        animate={{ width: i === index ? 16 : 6, backgroundColor: i === index ? '#7C3AED' : '#D1D0D6' }}
        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
        className="h-1.5 rounded-full" />
    ))}
  </div>
</motion.div>
```

**Nota:** `touchAction: 'pan-y'` permite scroll vertical normal mientras captura swipe horizontal. Threshold dual: velocidad (`200px/s`) o distancia (`50px`). Usado por `QuickLinkCard` mobile y `QuickLinkSwipeable`.

### Patrón widget responsive (useMediaQuery branching)

Para componentes con layouts radicalmente diferentes entre mobile y desktop, usar `useMediaQuery` con render condicional en vez de CSS `hidden/block`:

```jsx
const isDesktop = useMediaQuery('(min-width: 1024px)')

return isDesktop ? (
  <Card>{/* Desktop: layout completo */}</Card>
) : (
  <Card>{/* Mobile: layout compacto */}</Card>
)
```

**Cuándo usar:** Cuando desktop y mobile tienen estructura DOM tan distinta que CSS no basta (ej. QuickLinkCard: tabs+QR vertical en desktop → swipeable horizontal en mobile). Para diferencias menores (ocultar/mostrar), preferir `hidden lg:block`.

## Contextos

| Hook | Provider | Retorna | localStorage key |
|------|----------|---------|-----------------|
| `useTheme()` | `ThemeProvider` | `{ isDarkMode, toggleTheme }` | `zwap-theme` (`'dark'`/`'light'`) |
| `useToast()` | `ToastProvider` | `{ addToast(message, type?, duration?) }` | — |
| `useViewSearch(placeholder?)` | `ViewSearchProvider` | `{ query, setQuery, setActiveFilterCount }` | — |
| `useHeaderSearch()` | `ViewSearchProvider` | `{ query, setQuery, placeholder, hasFilters, activeFilterCount, openFilters, setFilterOpener, ... }` | — |

- `useTheme` — si no hay valor guardado, usa `prefers-color-scheme` del OS como default
- `useToast` tipos: `'success'` (emerald) · `'error'` (rose) · `'info'` (purple). Default: `'success'`, duración: 3000ms
- `useViewSearch` — hook para vistas. Registra placeholder de búsqueda al montar. Retorna `{ query, setQuery, setActiveFilterCount }`. Vistas sin búsqueda llaman `useViewSearch()` sin args para limpiar contexto
- `useHeaderSearch` — hook para Header. Retorna el contexto completo incluyendo `openFilters()` y `activeFilterCount`
- Token de auth: `localStorage.getItem('zwap_token')` — usado por `AuthGuard` y `api.js`
- Sidebar state: `localStorage.getItem('zwap-sidebar')` — `'collapsed'`/`'expanded'`, usado por `AppShell`
- Todos los providers están en `App.jsx` envolviendo el router

### Flujo de búsqueda contextual

```
Vista monta → useViewSearch(placeholder) registra config
  ↓
Header lee query/placeholder via useHeaderSearch()
  ↓
Desktop: search bar siempre visible con placeholder contextual
Mobile: ícono de búsqueda → se expande a barra inline con spring
  ↓
Usuario escribe → query se actualiza → vista filtra sus datos
```

### Flujo de filtros (mobile)

```
TableToolbar monta → setFilterOpener(openSheet) registra callback
  ↓
Header muestra ícono SlidersHorizontal (si hasFilters)
  + dot púrpura si activeFilterCount > 0
  ↓
Usuario toca filtros → openFilters() → TableToolbar abre BottomSheet
  ↓
DropdownFilter renderiza en sheetMode (fila full-width, drill-down)
  ↓
onReset disponible para limpiar todos los filtros
```

## Internacionalización (i18n)

Se usa `react-i18next` + `i18next`. Configurado en `src/i18n/index.js`, importado en `App.jsx`.

### Uso

```jsx
import { useTranslation } from 'react-i18next'

const { t } = useTranslation()

// Texto simple
t('nav.dashboard')

// Con interpolación
t('links.linkCopied', { name: 'Alice' })

// Pluralización
t('dashboard.charges', { count: 5 })  // → "5 cobros"

// En class components (no hooks)
import i18n from '@/i18n'
i18n.t('errors.somethingWrong')
```

### Locales

- Archivos: `src/i18n/locales/es.json` (español) y `src/i18n/locales/en.json` (inglés)
- Idioma por defecto: `es`
- Selector de idioma: disponible en SettingsView (pestaña "Mi Perfil"), persiste en `localStorage` key `zwap-language`
- Namespaces: `common`, `nav`, `header`, `auth`, `dashboard`, `transactions`, `refund`, `links`, `settlements`, `wallet`, `branches`, `users`, `settings`, `filters`, `errors`, `calendar`, `pagination`, `search`, `workflow`

### Reglas

1. **No hardcodear strings visibles al usuario** — usar siempre `t('namespace.key')`
2. Agregar claves nuevas en **ambos** archivos de locale (`es.json` y `en.json`) bajo el namespace correcto
3. Interpolar datos dinámicos con `{{ variable }}`, no template literals
4. Para arrays (meses, días), usar `t('key', { returnObjects: true })`
5. Los valores de datos mock (roles, estados) están en español — usar mapas de traducción para display (ej. `ROLE_LABEL` en UsuariosView)

## Responsive Design

### Estrategia general

- **Desktop-first** — diseñar para 1920x1080, luego adaptar hacia abajo
- **Breakpoint principal:** `lg: 1024px` — switch entre Sidebar (desktop) y BottomNav (mobile/tablet)
- **Max-width de contenido:** `max-w-[1400px] 2xl:max-w-[1600px]` en el contenedor principal (`AppShell`)
- **Viewport meta:** `viewport-fit=cover` habilitado para safe areas en iOS

### Hook de breakpoints

```js
import useMediaQuery from '@/shared/hooks/useMediaQuery'

const isDesktop = useMediaQuery('(min-width: 1024px)')
```

Usado en `AppShell` para condicionar Sidebar vs BottomNav, en `Header` para search bar vs search icon, y en `QuickLinkCard` para widget completo (desktop) vs swipeable compacto (mobile).

### Navegación responsive

| Viewport | Navegación | Componente |
|---|---|---|
| ≥ 1024px (lg) | Sidebar colapsable | `shared/layout/Sidebar.jsx` |
| < 1024px | Bottom navigation | `shared/layout/BottomNav.jsx` |

**BottomNav** — 4 tabs fijos (Dashboard, Transacciones, Links, Liquidaciones) + botón "Más" que abre un sheet con opciones secundarias (Sucursales, Usuarios, Wallet, Configuración) y acciones rápidas (Tema, Alertas) separadas por divider. Safe area padding via `pb-[env(safe-area-inset-bottom)]`. Scroll lock cuando el sheet está abierto. El sheet de "Más" **no usa `<BottomSheet>`** — usa implementación inline con z-index inferior al nav (`z-30` backdrop, `z-[35]` panel vs `z-40` nav) para que la barra permanezca visible encima del sheet.

**Header** — en desktop muestra search bar inline conectado a `ViewSearchContext`, botones de tema/settings/notificaciones, y selector de sucursal (dropdown). En mobile muestra ZwapIsotipo + ZwapWordmark a la izquierda; al expandir búsqueda, el wordmark desaparece con animación blur+slide (`WORDMARK_VARIANTS`) y la barra de búsqueda ocupa su lugar. Los iconos de búsqueda y filtros desaparecen al expandir. El selector de sucursal en mobile es solo una pill con la inicial que abre un bottom sheet (`createPortal` al body para escapar stacking contexts). Tema y notificaciones no están en el Header mobile — viven en el sheet de "Más" del BottomNav.

### Componentes de layout responsive

| Componente | Archivo | Descripción |
|---|---|---|
| `BottomNav` | `shared/layout/BottomNav.jsx` | Bottom navigation con 4+1 tabs, sheet de "Más" con nav + tema/alertas |
| `useMediaQuery` | `shared/hooks/useMediaQuery.js` | Hook para detectar breakpoints via `matchMedia` |

### Patrón tabla → cards (mobile)

Para tablas de datos, usar **CSS visibility** (no renderizado condicional JS):

```jsx
{/* Tabla desktop — oculta en mobile */}
<Card className="hidden lg:block">
  <table>...</table>
</Card>

{/* Cards mobile — ocultas en desktop */}
<div className="lg:hidden space-y-3">
  {items.map(item => (
    <Card className="p-4">
      {/* Layout de card */}
    </Card>
  ))}
</div>
```

**Vistas con tabla→cards implementado:** TransaccionesView, LinksView (CustomLinksTable), LiquidacionesView, UsuariosView, WalletView (withdrawals), LiveFeed.

**Reglas para cards mobile:**
1. Usar `min-w-0` en flex children que contienen texto (evita overflow)
2. Usar `truncate` en textos que podrían desbordar (emails, IDs, nombres largos)
3. Usar `flex-shrink-0` en elementos de ancho fijo (amounts, badges, avatars)
4. Usar `flex-wrap` en filas con múltiples badges/tags

### Modal responsive

El componente `Modal` cambia de comportamiento según viewport:

| Viewport | Posición | Esquinas | Padding |
|---|---|---|---|
| < sm (640px) | Bottom-sheet (`items-end`) | `rounded-t-[24px]` | `px-5 py-5` |
| ≥ sm | Centered (`items-center`) | `rounded-[24px]` | `px-8 py-6` |

- Safe area: `pb-[env(safe-area-inset-bottom)]` en mobile, `sm:pb-0` en desktop
- Max height: `max-h-[95vh]` mobile, `max-h-[90vh]` desktop
- Body padding en modales de formulario: `p-5 sm:p-8`
- Grids de formulario: `grid-cols-1 sm:grid-cols-2`

### Convenciones responsive

1. **Padding responsive en AppShell:** desktop `px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pt-8 xl:px-10 xl:pt-10 2xl:px-12 2xl:pt-12 lg:pb-10 xl:pb-12 2xl:pb-16`; mobile `px-4 sm:px-6 pt-20` + `style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))' }}`
2. **Bottom padding para BottomNav:** mobile usa `calc(5rem + env(safe-area-inset-bottom))` via style prop (80px + safe area del dispositivo); el shorthand `p-*` de Tailwind sobreescribe `pb-*` base, por eso se usa style prop
3. **Header height:** `h-16 lg:h-20`. En mobile el header es `position: fixed inset-x-0 top-0` con animación scroll-aware (se oculta al scrollear hacia abajo, reaparece al scrollear hacia arriba). En desktop es `position: relative` (flex child normal)
4. **Safe areas:** usar `env(safe-area-inset-bottom)` en elementos fijos al fondo (BottomNav, Modal bottom-sheet)
5. **Touch targets:** mínimo 40px (idealmente 44px) para botones interactivos en mobile
6. **Scroll locking:** `document.body.style.overflow = 'hidden'` en modales y sheets abiertos. AppShell también bloquea `html` y `body` globalmente para garantizar que `main` sea siempre el scroll container (previene body scroll en iOS Safari / Chrome Android)

## Mock data

Los datos de prueba están en `src/services/mocks/mockData.js`.

Exports disponibles:

| Export | Contenido |
|---|---|
| `BRANCHES` | `string[]` — nombres de sucursales |
| `WALLET_BALANCE` | `{ raw, display, short }` — saldo de billetera centralizado |
| `WALLET_STEPS` | Steps del stepper de retiro en progreso |
| `ALERTS` | Alertas del dashboard (icon, title, body, action) |
| `CHART_DATA` | Datos de gráfica semanal (pos, links por día) |
| `CONVERSION_DATA` | Datos de conversión por día para gráfica |
| `PAYMENT_METHODS` | Distribución Visa/MC/Amex para gráfica |
| `KPIS` | KPIs del dashboard (label, value, change, icon, variant) |
| `TRANSACTIONS` | Historial de transacciones |
| `PERMANENT_LINKS` | Links de pago permanentes |
| `WITHDRAWALS` | Retiros/withdrawals |
| `PAYOUTS` | Liquidaciones programadas |
| `SETTLEMENT_SUMMARY` | KPIs de liquidaciones |
| `USERS` | Usuarios del sistema |
| `CURRENT_USER` | `{ displayName, role, email }` — usuario logueado actual |
| `BUSINESS_NAME` | `string` — nombre del negocio (usado en ReceiptModal y similares) |
| `BRANCH_LIST` | Sucursales con detalle (address, users, isMain) |
| `CUSTOM_LINKS` | Links de pago customizados por cliente |
| `PLAN_INFO` | Detalles del plan de suscripción |
| `SESSIONS` | Lista de sesiones activas (settings) |
| `PAYMENT_CARD` | Datos de tarjeta guardada |
| `BANK_ACCOUNT` | Datos de cuenta bancaria |

Importar desde ahí, no hardcodear datos en las vistas.

## Native App Feel

La app busca sentirse como una app nativa tanto en desktop como en mobile. Desktop = app de escritorio (hover states correctos, tablas, toast abajo-derecha). Mobile = app táctil (active states, sin selección de texto, toast centrado abajo).

### Global touch optimizations (`globals.css`)

```css
body {
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
}

/* Excepciones — contenido que sí debe ser seleccionable */
input, textarea, [contenteditable="true"], td, th,
pre, code, .selectable {
  user-select: text;
  -webkit-user-select: text;
}
```

### Active states (touch feedback)

Todos los variants de `Button` incluyen un `active:` state más intenso que el hover. Ejemplo:

| Variant | Hover | Active |
|---|---|---|
| default | `hover:bg-[#6D28D9]` | `active:bg-[#4C1599]` |
| outline (dark) | `hover:bg-white/10` | `active:bg-white/15` |
| ghost (dark) | `hover:bg-white/10` | `active:bg-white/15` |

Cards con `hoverEffect` también incluyen `active:translate-y-0 active:bg-...` para feedback de press-down en mobile.

### Toast responsive

El contenedor de toasts se posiciona de forma responsive:

- **Mobile (< 640px):** Centrado abajo, sobre el BottomNav (`bottom-20 left-1/2 -translate-x-1/2`)
- **Desktop (≥ 640px):** Abajo-derecha (`sm:bottom-6 sm:right-6 sm:left-auto sm:translate-x-0`)

### Mensajes de toast responsivos

Para toasts con contenido largo, usar claves i18n cortas en mobile:

```jsx
const key = window.innerWidth < 640 ? 'links.linkCopiedShort' : 'links.linkCopied'
addToast(t(key, { name: link.client }), 'success')
```

Patrón: clave base `namespace.key` para desktop, `namespace.keyShort` para mobile. Claves existentes: `dashboard.linkCopied/Short`, `dashboard.lastLinkCopied/Short`, `links.linkCopied/Short`.

## Dashboard — Fused Header

DashboardView no usa `PageHeader`. En su lugar tiene un header fusionado: título + SegmentControl + botón de acción en una sola fila flex:

```jsx
<div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
  <h1 className="... hidden sm:block">{t('nav.dashboard')}</h1>
  <div className="flex-1 sm:max-w-xs">
    <SegmentControl options={[...]} value={activeTab} onChange={setActiveTab} layoutId="dashboardTab" />
  </div>
  <Button onClick={...} className="hidden sm:flex sm:ml-auto">...</Button>
</div>
```

En mobile: solo el SegmentControl (full-width), sin título ni botón (BottomNav provee contexto).

## LiveFeed — Ticker Mobile

En mobile, LiveFeed usa un patrón de ticker de una línea por transacción con status ring + tap-to-receipt:

- **Status ring:** Gradient ring alrededor del avatar de marca de tarjeta indica el estado sin texto (emerald=success, rose=danger, amber=warning). Inspirado en stories de Instagram.
- **Layout por fila:** `Avatar con ring · Nombre · tiempo · ChannelIcon · $amount` — todo en una línea flex.
- **Tap-to-receipt:** `onClick={() => setReceiptTrx(trx)}` abre `ReceiptModal` (importado cross-feature desde `@/features/transactions`).
- **Touch feedback:** `active:opacity-70 transition-opacity cursor-pointer`.
- **Máximo 4 transacciones** — `TRANSACTIONS.slice(0, 4)`.

## Versionamiento

Semantic Versioning (`MAJOR.MINOR.PATCH`):

| Segmento | Cuándo incrementar |
|---|---|
| **MAJOR** | Release a producción, cambio que rompe compatibilidad |
| **MINOR** | Feature nueva, vista nueva, integración de API |
| **PATCH** | Bug fix, ajuste visual, refactor, parche de seguridad |

- La versión actual está en `package.json` → campo `version`
- El historial de cambios está en `CHANGELOG.md` (formato [Keep a Changelog](https://keepachangelog.com/))
- Los parches de seguridad se documentan bajo la sección `### Security` en el CHANGELOG
- Mientras `MAJOR` sea `0`, el proyecto está en pre-release (alpha/beta)

Al hacer un release:
1. Actualizar `version` en `package.json`
2. Agregar entrada en `CHANGELOG.md` con fecha y secciones (Added/Changed/Fixed/Security/Removed)
3. Commit: `chore: bump version to X.Y.Z`
4. Tag: `git tag vX.Y.Z`

## Full-attention overlays — patrón estándar

Cualquier elemento que requiera atención total del usuario (modales, recibos, lightboxes, bottom sheets) **debe** cumplir dos cosas para que el chrome de la app (Sidebar, BottomNav) se difumine correctamente y el overlay escape los stacking contexts del layout:

1. **Portalizar a `document.body`** — evita que el contenedor quede atrapado en el `z-10` del main content wrapper de `AppShell`. Sin esto, `BottomNav` (`fixed z-40` en el root) aparece por encima del overlay.

2. **Señalizar con `useChromeBlur()`** — setea `data-modal-open` en el body con un contador para overlays apilados. Sidebar y BottomNav observan este atributo y aplican `blur-sm saturate-50 pointer-events-none`.

```jsx
import { createPortal } from 'react-dom'
import useChromeBlur from '@/shared/hooks/useChromeBlur'

export default function MyOverlay({ onClose }) {
  useChromeBlur()  // si está dentro de AnimatePresence — usa useIsPresent

  if (typeof document === 'undefined') return null

  return createPortal(
    <motion.div exit={{ opacity: 0 }} className="fixed inset-0 z-50 ...">
      ...
    </motion.div>,
    document.body
  )
}
```

- Para componentes que controlan su propia visibilidad vía prop `isOpen` (ej. `BottomSheet`), pasar el flag: `useChromeBlur(isOpen)`. El cleanup se dispara cuando `isOpen` pasa a `false`, sincronizado con el inicio de la animación de exit.
- El hook usa `useIsPresent` de Framer Motion cuando no se le pasa arg, así que limpia el flag al **inicio** del exit (no al unmount) — el sidebar/bottomnav se des-difuminan al mismo tiempo que el backdrop.
- Componentes que ya cumplen el patrón: `Modal`, `QrLightbox`, `BottomSheet`, `ReceiptModal`, `WithdrawReceiptModal`, `NewBranchModal`. Cualquier modal nuevo que use `<Modal>` lo hereda gratis.

## No hacer

- No crear CSS modules ni archivos `.css` — Tailwind inline únicamente
- No usar clases `dark:` de Tailwind
- No pasar callbacks de modales como props desde `AppShell`
- No añadir dependencias sin consultarlo primero
- No crear helpers o abstracciones especulativos — solo lo que el task requiere
- No mover el `<Suspense>` por encima de `AppShell` — causa parpadeo de toda la UI
- No usar `ease`/`tween` en animaciones de UI — usar spring siempre
- No hardcodear datos en las vistas — usar `mockData.js`
