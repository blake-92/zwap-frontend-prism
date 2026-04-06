# CLAUDE.md — Zwap Frontend Prism

Instrucciones para Claude Code al trabajar en este repositorio.

## Stack

- **React 18** + **Vite 5**
- **Tailwind CSS 3** — utilidades inline, sin CSS modules
- **React Router v6** — nested routes con `<Outlet />`
- **Lucide React** — íconos
- **Recharts** — gráficas
- **Framer Motion** — animaciones

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

### Reglas de features

1. **Las vistas son autónomas** — no reciben callbacks de navegación desde el padre. Usan `useNavigate(ROUTES.X)` internamente.
2. **Los modales son propios** — cada vista gestiona su propio estado de modal con `useState`. `AppShell` no orquesta modales.
3. **No prop-drilling** — si una vista necesita navegar a otra, usa `useNavigate`, no callbacks.

## Rutas

Las constantes de rutas están en `src/router/routes.js`. Al añadir una ruta nueva:

1. Agregar la constante en `routes.js`
2. Agregar el `<Route>` en `src/router/index.jsx` (con `lazy()`)
3. Agregar el ítem en `NAV_ITEMS` de `Sidebar.jsx` si aplica

## Componentes base (Shared UI)

Importar desde `@/shared/ui`:

```js
import { Card, Button, Input, Toggle, Badge, Modal } from '@/shared/ui'
```

- `Card` — contenedor con glass y bordes
- `Button` — variantes: `default`, `outline`, `danger`, `ghost`
- `Input` — acepta prop `icon` (Lucide component)
- `Toggle` — switch on/off, prop `active`
- `Badge` — variantes: `default`, `success`, `warning`, `danger`
- `Modal` — wrapper con backdrop blur; recibe `isOpen`, `onClose`, `title`

## Sistema de diseño — Prism UI

### Tokens de color

| Token | Valor | Uso |
|---|---|---|
| Primario | `#7C3AED` | Acciones, activos, iconos |
| Primario oscuro | `#561BAF` | Hover, texto activo en light |
| Surface dark | `#111113` | Fondo base dark |
| Surface card dark | `#252429` | Cards en dark |
| Text primary dark | `#D8D7D9` | Texto principal dark |
| Text secondary dark | `#888991` | Texto secundario dark |

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

## Mock data

Los datos de prueba están en `src/services/mocks/mockData.js`. Importar desde ahí, no hardcodear datos en las vistas.

## No hacer

- No crear CSS modules ni archivos `.css` — Tailwind inline únicamente
- No usar clases `dark:` de Tailwind
- No pasar callbacks de modales como props desde `AppShell`
- No añadir dependencias sin consultarlo primero
- No crear helpers o abstracciones especulativos — solo lo que el task requiere
