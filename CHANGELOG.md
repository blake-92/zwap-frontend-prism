# Changelog

Todas las versiones notables del proyecto se documentan aquí.

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).
Versionamiento según [Semantic Versioning](https://semver.org/lang/es/).

---

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
