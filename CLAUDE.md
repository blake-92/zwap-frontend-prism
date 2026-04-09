# CLAUDE.md — Zwap Frontend Prism

Instrucciones para Claude Code al trabajar en este repositorio.

## Stack

- **React 18** + **Vite 5**
- **Tailwind CSS 3** — utilidades inline, sin CSS modules
- **React Router v6** — nested routes con `<Outlet />`
- **Lucide React** — íconos
- **Recharts** — gráficas
- **Framer Motion** — animaciones (spring como paradigma principal)

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
| `dashboard` | DashboardView | KpiCard, ChartCard, QuickLinkCard, AlertsPanel, LiveFeed |
| `transactions` | TransaccionesView | ReceiptModal, RefundModal |
| `links` | LinksView | NewLinkModal |
| `settlements` | LiquidacionesView | — |
| `wallet` | WalletView | WithdrawModal, WithdrawReceiptModal, WalletSidebarCard |
| `branches` | SucursalesView | NewBranchModal |
| `users` | UsuariosView | NewUserModal |
| `settings` | SettingsView | — |

### Reglas de features

1. **Las vistas son autónomas** — no reciben callbacks de navegación desde el padre. Usan `useNavigate(ROUTES.X)` internamente.
2. **Los modales son propios** — cada vista gestiona su propio estado de modal con `useState`. `AppShell` no orquesta modales.
3. **No prop-drilling** — si una vista necesita navegar a otra, usa `useNavigate`, no callbacks.

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
- `ROUTES.SETTINGS` existe y funciona pero no está en `NAV_ITEMS` (acceso directo por URL o desde Header)
- `ROUTES.WALLET` no está en `NAV_ITEMS`; se accede desde `WalletSidebarCard` en el Sidebar

**Suspense boundary:** El `<Suspense>` vive dentro de `AppShell`, envolviendo solo el `<Outlet>`. Nunca mover Suspense por encima de AppShell — causaría que Sidebar y Header remonten en cada cambio de ruta lazy.

## Componentes base (Shared UI)

Importar desde `@/shared/ui`:

```js
import {
  Card, CardHeader, Button, Input, Toggle, Badge, Modal,
  Avatar, AvatarInfo, StatCard, Stepper, SegmentControl,
  DropdownFilter, SearchInput, TableToolbar, Pagination,
  PageHeader, SectionLabel, InfoBanner, Skeleton, Tooltip,
  MiniCalendar, EmptySearchState
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
| `Modal` | `isOpen`, `onClose`, `title`, `description`, `icon` | Modal glass con spring de entrada |
| `Avatar` | `initials`, `size` (sm/md), `variant` (purple/neutral), `glow` | Badge circular con iniciales |
| `AvatarInfo` | `initials`, `name`, `secondary`, `meta` | Avatar + nombre + texto secundario + ID |
| `StatCard` | `layout` (kpi/balance), `label`, `value`, `icon`, `variant`, `negative` | Tarjeta de métrica / KPI |
| `Stepper` | `steps[]`, `currentStep` | Stepper horizontal con estados done/active/pending |
| `SegmentControl` | `options[]`, `value`, `onChange` | Selector de segmentos con pill animado (layoutId) |
| `DropdownFilter` | `label`, `options[]`, `value`, `onChange`, `icon` | Dropdown select con spring |
| `SearchInput` | `value`, `onChange`, `placeholder` | Input con ícono de búsqueda |
| `TableToolbar` | left slot (filtros), right slot (acciones) | Toolbar glass para tablas |
| `Pagination` | `currentPage`, `totalPages`, `onPageChange` | Controles de paginación con elipsis |
| `PageHeader` | `title`, `description` + right slot | Encabezado de página (h1) |
| `SectionLabel` | `children`, `className` | Etiqueta uppercase secundaria |
| `InfoBanner` | `variant` (warning/info/danger), `message` | Banner de alerta con ícono automático |
| `Skeleton` | `width`, `height`, `className` | Loader shimmer animado |
| `Tooltip` | `content`, `position` (top/bottom/left/right) | Tooltip portal con fade |
| `MiniCalendar` | `selectedDate`, `onSelect`, `timeValue`, `onTimeChange`, `onConfirm` | Selector de fecha + hora con navegación por mes |
| `EmptySearchState` | `colSpan`, `term`, `onClear` | Fila vacía para tablas sin resultados |

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

Patrón estándar para cards y paneles:

```jsx
// Dark
'bg-[#252429]/40 backdrop-blur-md border border-white/10'

// Light
'bg-white/60 backdrop-blur-md border border-white shadow-sm'
```

## Animaciones — Framer Motion

Spring es el paradigma principal. Nunca usar `ease` o `tween` en interacciones de UI.

### Constantes spring

```js
const SPRING      = { type: 'spring', stiffness: 300, damping: 24 }
const SPRING_FAST = { type: 'spring', stiffness: 400, damping: 28 }
```

### Variantes de stagger (motionVariants.js)

Importar desde `@/shared/utils/motionVariants`:

```js
import { listVariants, itemVariants, cardItemVariants } from '@/shared/utils/motionVariants'
```

- `listVariants` — wrapper con `staggerChildren: 0.05`
- `itemVariants` — fila de tabla: slide izquierda→derecha (`x: -10 → 0`)
- `cardItemVariants` — card: slide abajo→arriba (`y: 15 → 0`)

Uso en tablas:
```jsx
<motion.tbody variants={listVariants} initial="hidden" animate="show">
  {rows.map(row => <motion.tr key={row.id} variants={itemVariants}>...</motion.tr>)}
</motion.tbody>
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

Usar `LayoutGroup` para coordinar `layoutId` entre múltiples botones:

```jsx
<LayoutGroup id="sidebar-nav">
  {NAV_ITEMS.map(item => (
    <button key={item.path}>
      <AnimatePresence initial={false}>
        {isActive && (
          <motion.span
            layoutId="active-indicator"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 rounded-lg bg-[#7C3AED]/20"
          />
        )}
      </AnimatePresence>
    </button>
  ))}
</LayoutGroup>
```

`initial={false}` en AnimatePresence evita que el indicador anime al cargar la primera vez.

### Modal

```jsx
// Backdrop
<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
  transition={{ duration: 0.2 }} />

// Contenedor
<motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  exit={{ opacity: 0, scale: 0.95, y: 10 }}
  transition={SPRING} />
```

## Contextos

| Hook | Provider | Retorna | localStorage key |
|------|----------|---------|-----------------|
| `useTheme()` | `ThemeProvider` | `{ isDarkMode, toggleTheme }` | `zwap-theme` (`'dark'`/`'light'`) |
| `useToast()` | `ToastProvider` | `{ addToast(message, type?, duration?) }` | — |

- `useToast` tipos: `'success'` (emerald) · `'error'` (rose) · `'info'` (purple). Default: `'success'`, duración: 3000ms
- Token de auth: `localStorage.getItem('zwap_token')` — usado por `AuthGuard` y `api.js`
- Ambos providers están en `App.jsx` envolviendo el router

## Mock data

Los datos de prueba están en `src/services/mocks/mockData.js`.

Exports disponibles:

| Export | Contenido |
|---|---|
| `BRANCHES` | `string[]` — nombres de sucursales |
| `KPIS` | KPIs del dashboard (label, value, change, icon, variant) |
| `TRANSACTIONS` | Historial de transacciones |
| `PERMANENT_LINKS` | Links de pago permanentes |
| `WITHDRAWALS` | Retiros/withdrawals |
| `PAYOUTS` | Liquidaciones programadas |
| `USERS` | Usuarios del sistema |
| `BRANCH_LIST` | Sucursales con detalle (address, users, isMain) |
| `CUSTOM_LINKS` | Links de pago customizados por cliente |

Importar desde ahí, no hardcodear datos en las vistas.

## No hacer

- No crear CSS modules ni archivos `.css` — Tailwind inline únicamente
- No usar clases `dark:` de Tailwind
- No pasar callbacks de modales como props desde `AppShell`
- No añadir dependencias sin consultarlo primero
- No crear helpers o abstracciones especulativos — solo lo que el task requiere
- No mover el `<Suspense>` por encima de `AppShell` — causa parpadeo de toda la UI
- No usar `ease`/`tween` en animaciones de UI — usar spring siempre
- No hardcodear datos en las vistas — usar `mockData.js`
