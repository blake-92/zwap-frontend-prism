# Zwap Frontend — Prism (Nuxt)

> **v0.13.0** · [Changelog](./CHANGELOG.md) · Deploy en Cloudflare Pages

Panel de administración para la plataforma de pagos Zwap. Migrado de React+Vite a **Nuxt 4 + Vue 3**, diseño Glassmorphism, arquitectura por feature slices.

## Stack

| Categoría | Tecnología |
|---|---|
| Framework | Nuxt 4 + Vue 3 |
| Bundler | Vite (integrado en Nuxt) |
| Routing | File-based (`app/pages/`) |
| Render mode | SPA (`ssr: false`) |
| Estilos | Tailwind CSS 3 |
| Estado | Pinia |
| Gráficas | SVG nativo (antes Recharts) |
| Animaciones | motion-v (port de Framer Motion) |
| Íconos | lucide-vue-next |
| Date picker | @vuepic/vue-datepicker |
| i18n | @nuxtjs/i18n (vue-i18n v9) |
| Fonts | @nuxt/fonts (Inter + JetBrains Mono self-hosted) |

## Requisitos

- Node.js 18+
- npm 9+

## Configuración inicial

```bash
npm install
cp .env.example .env    # editar si es necesario
npm run dev             # http://localhost:3000
```

## Scripts

```bash
npm run dev       # Dev server con HMR en :3000
npm run build     # Build de producción → dist/ (preset Cloudflare Pages)
npm run generate  # Prerender estático
npm run preview   # Preview del build
```

## Variables de entorno

| Variable | Descripción |
|---|---|
| `NUXT_PUBLIC_API_URL` | URL base de la API de Zwap (default: `http://localhost:3000/api`) |

## Estructura de carpetas

```
app/
├── pages/                          # Rutas (file-based)
│   ├── login.vue
│   ├── app/
│   │   ├── dashboard.vue
│   │   ├── transacciones.vue
│   │   ├── links.vue
│   │   ├── liquidaciones.vue
│   │   ├── wallet.vue
│   │   ├── sucursales.vue
│   │   ├── usuarios.vue
│   │   └── configuracion.vue
│   ├── legal/[doc].vue             # ruta dinámica
│   └── [...slug].vue               # catch-all → /login
│
├── layouts/
│   └── default.vue                 # AppShell (Sidebar + Header + main + BottomNav)
│
├── middleware/
│   └── auth.js                     # cookie zwap_token gate
│
├── components/
│   ├── ui/                         # 28 primitivos (Card, Button, Modal, ...)
│   ├── features/                   # Componentes por feature
│   │   ├── dashboard/
│   │   ├── links/
│   │   ├── transactions/
│   │   ├── settlements/
│   │   ├── wallet/
│   │   ├── branches/
│   │   ├── users/
│   │   └── settings/
│   ├── brand/                      # ZwapIsotipo, ZwapLogo, ZwapWordmark
│   ├── Header.vue                  # layout chrome
│   ├── Sidebar.vue
│   ├── BottomNav.vue
│   ├── GlassBackground.vue
│   └── ToastContainer.vue
│
├── stores/                         # Pinia
│   ├── theme.js                    # isDarkMode
│   ├── toast.js                    # toasts[]
│   └── viewSearch.js               # búsqueda/filtros contextuales
│
├── composables/                    # hooks
│   ├── useMediaQuery.js
│   ├── useScrollLock.js
│   ├── useModalOpen.js
│   ├── useChromeBlur.js
│   ├── useInfiniteScroll.js
│   └── useViewSearch.js
│
├── utils/                          # helpers puros
│   ├── formatCurrency.js
│   ├── cardClasses.js              # glass helpers
│   ├── springs.js                  # constantes spring
│   ├── motionVariants.js           # variantes compartidas
│   ├── routes.js                   # ROUTES
│   ├── api.js                      # HTTP client (Bearer cookie)
│   └── mockData.js                 # datos de prueba
│
├── plugins/
│   └── theme.client.js             # hydrate theme store
│
├── assets/css/
│   └── globals.css                 # Tailwind + scrollbar + keyframes
│
├── app.vue                         # <NuxtLayout><NuxtPage/>
└── error.vue                       # error page custom

i18n/
└── locales/
    ├── es.json                     # español (default)
    └── en.json                     # inglés

public/
├── favicon.svg
└── _headers                        # Cloudflare cache
```

## Arquitectura

El proyecto sigue **Bulletproof React** adaptado a Vue (vertical slices por feature):

- Cada `components/features/<nombre>/` es autónomo: vista, modales y estado local.
- Las vistas no reciben callbacks desde el padre — usan `navigateTo(...)` para rutas y `ref` para modales propios.
- `layouts/default.vue` solo provee layout (Sidebar/BottomNav + Header + `<NuxtPage />`), sin orquestar estado de features.
- Code splitting automático: Nuxt carga cada ruta lazy.
- Responsive: Sidebar en desktop (≥1024px), BottomNav en mobile/tablet.

## Autenticación (mock)

El login guarda `zwap_token` como cookie (`useCookie('zwap_token')`). El middleware `auth` en `/app/*` redirige a `/login` si la cookie no existe.

## Diseño

**Prism UI**: glassmorphism con backdrop-blur, paleta púrpura (`#7C3AED` / `#561BAF`), soporte dark/light mode mediante `useThemeStore`. Animaciones spring-first con motion-v. Ver [prism-ui.md](./prism-ui.md).

## Internacionalización

Soporte bilingüe español/inglés con `@nuxtjs/i18n` (vue-i18n v9). Idioma por defecto: español. Selector en Settings > Mi Perfil. Persistencia en cookie `zwap-language`. Locales en `i18n/locales/`.

**Convenciones vue-i18n** (distinto de react-i18next):
- Interpolación: `{var}` (llaves simples, NO `{{var}}`)
- Pluralización: pipe `"singular | plural"` (NO `_one`/`_other`)
- `@` en strings requiere escape `{'@'}` o `\u0040` (reservado para linked-message syntax)

## Features principales

| Módulo | Descripción |
|---|---|
| **Dashboard** | KPIs, gráficas SVG custom, live feed, triage de pending links, QR swipeable mobile, header fusionado |
| **Transactions** | Historial con filtros, recibos, reembolsos, SwipeableCard en mobile |
| **Payment Links** | Permanentes (cards/swipeable) + custom CRUD, fee split configurable, DatePicker |
| **Settlements** | Cierres diarios, KPIs, filtros, CSV export |
| **Wallet** | Balance, retiros, stepper, filtros |
| **Branches** | Grid de cards + modal |
| **Users** | Tabla + filtros por rol/estado |
| **Settings** | Perfil, seguridad, facturación con búsqueda tipo WhatsApp |

## Búsqueda y filtros

La barra del Header se conecta a la vista activa via `useViewSearchStore` (Pinia). Cada vista registra su placeholder mediante `useViewSearch(t('key'))`. En mobile, la barra se expande inline con spring. Las vistas con filtros muestran indicador en el Header, y ofrecen reset via `TableToolbar`.

## Experiencia nativa

- **Touch feedback:** variants `active:` en botones y cards interactivos.
- **Sin selección de texto:** `user-select: none` global, excepciones para inputs/tablas/código.
- **Toasts responsivos:** centrados abajo en mobile, esquina inferior derecha en desktop; versiones cortas para mobile.
- **PageHeader oculto en mobile:** BottomNav provee contexto; botón de acción full-width separado.

## Deploy

Build configurado para **Cloudflare Pages** via `nitro.preset: 'cloudflare-pages'`. Output en `dist/`:

```bash
npm run build
npx wrangler pages deploy dist --project-name=zwap-prism
```

Si alguna lib requiere Node compat, agregar en `wrangler.toml`:
```toml
compatibility_flags = ["nodejs_compat"]
```

## Versionamiento

[SemVer](https://semver.org/lang/es/). `0.x.x` = pre-release. Parches de seguridad bajo `### Security` en el CHANGELOG.
