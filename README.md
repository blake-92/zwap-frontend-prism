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
│   ├── context/            # ThemeContext (dark/light mode)
│   ├── hooks/              # Custom hooks globales
│   ├── layout/             # AppShell, Sidebar, GlassBackground
│   ├── ui/                 # Componentes base (Card, Button, Input…)
│   └── utils/              # Helpers y formatters
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
- `AppShell` sólo provee el layout (Sidebar + `<Outlet />`), sin orquestar estado de features.
- Código splitting automático: cada ruta se carga con `lazy()` + `Suspense`.

## Autenticación (mock)

En desarrollo, el login guarda `zwap_token` en `localStorage`. `AuthGuard` protege las rutas privadas redirigiendo a `/login` si el token no existe.

## Diseño

Sistema de diseño **Prism UI**: glassmorphism con backdrop-blur, tokens de color púrpura (`#7C3AED` / `#561BAF`), soporte dark/light mode mediante `ThemeContext`.
