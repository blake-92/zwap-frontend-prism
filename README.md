# Zwap Frontend — Prism

Panel de administración para la plataforma de pagos Zwap. Construido con React + Vite, diseño Glassmorphism, arquitectura Bulletproof React.

## Stack

| Categoría | Tecnología |
|---|---|
| Framework | React 18 |
| Bundler | Vite 5 |
| Routing | React Router v6 |
| Estilos | Tailwind CSS 3 |
| Gráficas | Recharts |
| Animaciones | Framer Motion |
| Íconos | Lucide React |
| Calendario | react-day-picker v9 |
| i18n | react-i18next + i18next |

## Requisitos

- Node.js 18+
- npm 9+

## Configuración inicial

```bash
# 1. Clonar repositorio
git clone <repo-url>
cd zwap-frontend-prism

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con los valores correspondientes

# 4. Iniciar servidor de desarrollo
npm run dev
```

La app queda disponible en `http://localhost:5173`.

## Scripts

```bash
npm run dev      # Servidor de desarrollo con HMR
npm run build    # Build de producción en /dist
npm run preview  # Preview del build de producción
npm run lint     # Linter ESLint
```

## Variables de entorno

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL base de la API de Zwap |

## Estructura de carpetas

```
src/
├── features/               # Módulos verticales por dominio
│   ├── auth/               # Login / autenticación
│   ├── dashboard/          # Vista principal con KPIs
│   ├── links/              # Links de pago (CRUD + modales)
│   ├── transactions/       # Historial de transacciones
│   ├── settlements/        # Liquidaciones y cierres
│   ├── wallet/             # Billetera y saldo
│   ├── branches/           # Gestión de sucursales
│   ├── users/              # Gestión de usuarios
│   └── settings/           # Configuración de cuenta
│
├── shared/                 # Código reutilizable
│   ├── brand/              # Logo y assets de marca
│   ├── context/            # ThemeContext, ToastProvider, ViewSearchContext
│   ├── hooks/              # Custom hooks globales (useMediaQuery)
│   ├── layout/             # AppShell, Sidebar, Header, BottomNav
│   ├── ui/                 # Componentes base (Card, Button, Modal…)
│   └── utils/              # Helpers y formatters
│
├── i18n/
│   ├── index.js            # Configuración i18next
│   └── locales/            # es.json, en.json
│
├── router/
│   ├── index.jsx           # Definición de rutas (lazy-loaded)
│   ├── routes.js           # Constantes ROUTES
│   └── guards/             # AuthGuard
│
└── services/
    └── mocks/              # mockData.js — datos de prueba
```

## Arquitectura

El proyecto sigue el patrón **Bulletproof React** (vertical slices por feature):

- Cada `feature/` es autónoma: vista, modales y estado local.
- Las vistas no reciben callbacks desde el padre — usan `useNavigate` para rutas y `useState` para modales propios.
- `AppShell` sólo provee el layout (Sidebar/BottomNav + Header + `<Outlet />`), sin orquestar estado de features.
- Código splitting automático: cada ruta se carga con `lazy()` + `Suspense`.
- Responsive: Sidebar en desktop (≥1024px), BottomNav en mobile/tablet.

## Autenticación (mock)

En desarrollo, el login guarda `zwap_token` en `localStorage`. `AuthGuard` protege las rutas privadas redirigiendo a `/login` si el token no existe.

## Diseño

Sistema de diseño **Prism UI**: glassmorphism con backdrop-blur, tokens de color púrpura (`#7C3AED` / `#561BAF`), soporte dark/light mode mediante `ThemeContext`. Animaciones spring-first con Framer Motion.

## Internacionalización

Soporte bilingüe español/inglés con `react-i18next`. Idioma por defecto: español. Selector de idioma en Settings > Mi Perfil. Locales en `src/i18n/locales/`.

## Features principales

| Módulo | Descripción |
|---|---|
| **Dashboard** | KPIs, gráficas (Recharts), live feed, acciones rápidas, QR |
| **Transactions** | Historial con filtros (fecha/estado), recibos, reembolsos |
| **Payment Links** | Links permanentes y custom, CRUD, fee split configurable |
| **Settlements** | Control de cierres diarios, filtros, exportación CSV |
| **Wallet** | Balance, retiros, filtros (estado/fecha), exportación CSV |
| **Branches** | Gestión de sucursales con búsqueda por nombre/dirección |
| **Users** | Gestión de usuarios con filtros por rol y estado |
| **Settings** | Perfil, seguridad, facturación — búsqueda contextual tipo WhatsApp |

## Búsqueda y filtros

La barra de búsqueda del Header se conecta a la vista activa via `ViewSearchContext`. Cada vista registra su placeholder y lógica de filtrado. En mobile, la barra se expande inline con animación spring. Las vistas con filtros muestran un indicador en el ícono de filtros del Header, y ofrecen reset rápido via `TableToolbar`.
