# Changelog

Todas las versiones notables del proyecto se documentan aquí.

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).
Versionamiento según [Semantic Versioning](https://semver.org/lang/es/).

---

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
