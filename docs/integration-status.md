# Frontend ↔ Backend integration — fase 1.5 puente

> Estado de la integración del frontend (`zwap-frontend-prism`) contra el backend (`zwap-backend`).
> Este doc se actualiza después de cada día del plan (5 días) para que la sesión backend tenga
> handoff de vuelta al cerrar la fase.

## Día 1 — Auth foundation ✅

Fecha: 2026-05-01.
Branch: `concepts-dev`.

### Pantallas conectadas

| Pantalla | Endpoint | Estado |
|---|---|---|
| `/login` (form email + password) | `POST /api/auth/login` | ✅ conectado |
| Logout (Sidebar) | `POST /api/auth/logout` | ✅ conectado |
| Middleware `auth.js` (guard `/app/**`) | (cookie `zwap_session`) | ✅ migrado |

OAuth Google se quedó como stub: muestra un toast `"Google sign-in will be available soon"` —
fase 1 del backend no expone ese flujo.

### Cambios principales en el frontend

- **`app/utils/api.js`** — reescrito completo. Nuevos comportamientos:
  - `$fetch` (ofetch) con `credentials: 'include'` en todas las requests; sin `Authorization: Bearer`.
  - Refresh interceptor: 401 fuera de `/api/auth/{login,refresh,logout}` dispara `POST /api/auth/refresh`.
    Si refresh OK → reintenta la request original 1 vez. Si falla → limpia cookie `zwap_session`,
    redirige a `/login` con `?redirect=<path>`, toast de sesión expirada.
  - Single-flight: si N requests reciben 401 a la vez, todas esperan al mismo `POST /refresh`
    (variable `refreshPromise` compartida) y se reintentan tras su resolución.
  - Errores se mapean a la clase `ApiError { status, code, message, requestId, data }` para que
    las views las traten uniforme. Code = `data.error` del backend (e.g. `invalid_credentials`,
    `email_already_in_use`, `cannot_suspend_self`). `requestId` se lee del header `X-Request-Id`
    para mostrarse en pantallas de error.
- **`app/stores/session.js`** — store Pinia nuevo. State: `user`, `merchant`, `permissions[]`,
  `expiresAt`. Getters: `isAuthenticated` (lee cookie reactiva `zwap_session`), `displayName`,
  `hasPermission(code)`. Actions: `login({email,password})`, `fetchMe()`, `logout()`, `clear()`.
- **`app/middleware/auth.js`** — ahora lee `zwap_session` (no httpOnly, accesible desde JS) en
  vez de `zwap_token` (httpOnly).
- **`app/pages/login.vue`** — form llama `sessionStore.login()`. Manejo de errores:
  - 401 (`invalid_credentials`) → mensaje inline rosa bajo el form
  - 429 → mensaje "demasiados intentos, intenta de nuevo en unos minutos"
  - sin status (network) → "no se pudo conectar al servidor"
  - submit deshabilitado mientras `submitting === true`; label cambia a `"Iniciando sesión"`.
- **`app/components/Sidebar.vue`** — botón logout llama `sessionStore.logout()` en vez del
  `apiLogout` viejo.

### Configuración

- `nuxt.config.ts`: `runtimeConfig.public.apiUrl` → **`apiBase`** (origin sin `/api`).
- `.env.example`: `NUXT_PUBLIC_API_URL` → **`NUXT_PUBLIC_API_BASE=http://localhost:8080`**.
- `.env` local creado con el mismo valor (gitignoreado).

### i18n

Nuevas keys en `auth` y `errors` (es + en):
- `auth.loggingIn`, `auth.invalidCredentials`, `auth.rateLimited`, `auth.googleNotAvailable`
- `errors.network`, `errors.unexpected` (sumadas a `errors.sessionExpired` que ya existía)

### Tests

- **Unit** (`tests/unit/utils/api.spec.ts` reescrito): 9 specs — happy path GET/POST, 204,
  ApiError shape (500 + 409), bypass de `/api/auth/login` al refresh, refresh OK → retry,
  refresh fail → clear+navigate, single-flight (2 requests concurrentes → 1 refresh).
- **E2E** (`tests/e2e/fixtures.ts`, `error-states.spec.ts`): `mockAuth` y los specs que
  manipulaban `zwap_token` migrados a `zwap_session`.
- Suite completa: **431/431 unit verde** (mismo número que antes — no se rompió nada).

### Smoke manual contra backend real

Validado con curl contra `localhost:8080`:

```
POST /api/auth/login {owner@hoteldesal.bo / ChangeMe123!}
  → 200 + 3 cookies (zwap_token httpOnly /, zwap_session NOT httpOnly /, zwap_refresh httpOnly /api/auth)
  → body { user, merchant, permissions[23], expiresIn: 900 }

GET /api/account/me con cookies → 200 + mismo shape (sin expiresIn)

POST /api/auth/login {pass incorrecta} → 401 {error: "invalid_credentials"}

POST /api/auth/logout → 204 + Set-Cookie expirando las 3 cookies
```

El smoke E2E desde browser (login real → dashboard → logout, viendo cookies en DevTools)
queda para que lo confirmes vos abriendo `http://localhost:3000/login` con el backend corriendo.

## Bugs / gaps detectados en backend

(ninguno hasta el momento)

## Decisiones de diseño tomadas en frontend

- **Wrapper procedural vs composable**: mantuve el wrapper como módulo procedural (`get/post/patch/del`
  exports) en vez de migrarlo a un composable `useApi`. Razones: 1) las stores de Pinia llaman al
  wrapper desde actions y no son setup contexts; 2) el wrapper actual ya estaba estructurado así;
  3) los composables Nuxt acoplan al ciclo del setup. Si más adelante necesitamos request cancellation
  por route change podemos envolverlo en un composable que use AbortController scoped al component.
- **`refreshPromise` como módulo-level variable**: no en el sessionStore. Es un detalle del wrapper
  HTTP, no parte del estado público de la sesión. Reset via `queueMicrotask` para que callers que
  entren mid-flight tomen el mismo resultado.
- **Limpieza local de la cookie `zwap_session`** dentro de `clear()` aunque el backend ya manda
  `Set-Cookie` con `Max-Age=0` en logout. Razón: si el call de logout falla por red, la UI debe
  reaccionar inmediatamente sin quedar en estado "logueado".
- **Anti-enumeration en login UI**: el backend devuelve siempre `invalid_credentials` para
  email-no-existe / pass-incorrecto / user suspended. El frontend respeta esa decisión y muestra el
  mismo mensaje genérico ("Email o contraseña incorrectos") en los tres casos.
- **OAuth Google stub**: no se removió el botón porque el UI de la card de login pierde balance
  visual. En su lugar muestra un toast informativo. Cuando fase 2 (o donde corresponda) habilite
  OAuth se conecta sin tocar el resto del layout.

## Pendientes (siguientes días del plan)

- **Día 2** — Account/Me + hidratar Sidebar/Header con `sessionStore.fetchMe()` (hoy todavía
  muestran `CURRENT_USER` mockData). Plugin `.client.js` para hidratar al boot si la cookie
  `zwap_session` está presente.
- **Día 3-4** — UsuariosView + flujo invite (Mailhog).
- **Día 4-5** — SucursalesView + scoping de RECEPTIONIST.
- **Día 5** — Aceptar invite + reset password (rutas públicas).

---

## Día 2 — Header BranchPicker + Sucursales/Usuarios CRUD ✅

Fecha: 2026-05-01.
Branch: `concepts-dev`.
Doc seguido: `~/Developer/zwap-backend/docs/frontend-real-data-cutover.md` (parcialmente — solo § 3-4.3 / § 4.7 según scope explícito del usuario; § 4.4-4.6 placeholder de Dashboard/Wallet/Links/Transacciones/Liquidaciones quedó **fuera de scope** y se mantiene la UI mock anterior intacta).

### Vistas tocadas (las que conectan al backend)

| Vista / componente | Cambio |
|---|---|
| `app/components/Header.vue` | El selector top-right pasó de **merchant-picker mock** (3 strings: "Sucursal Principal" / "Hotel de Sal" / "Hotel de Madera" — modelo conceptualmente roto, doc § 3) a **BranchPicker real**: lista de `branchesStore.active`, default `isPrimary`, persist en `useCookie('zwap_active_branch')`. Header del dropdown muestra `merchant.businessName` como label estático **no clickeable** (un user pertenece a un solo merchant en fase 1). |
| `app/components/Sidebar.vue` | Footer footer: nombre + iniciales del user vienen de `sessionStore.user` (login real). Wallet balance se mantiene mock (`WALLET_BALANCE.short`) porque WalletView sigue siendo mock — coherencia. Logout llama `sessionStore.logout()`. |
| `app/components/features/branches/SucursalesView.vue` | `BRANCH_LIST` mock con `address`/`city` → `branchesStore.items`. Filtro ACTIVE/ARCHIVED con toggle, badges `Principal`/`Archivada`, acciones **edit / archive / reactivate / promote-primary** gated por `BRANCHES_MANAGE`. Contador "X usuarios asignados" mock removido (doc § 4.2 — derivable del usersStore pero no esencial para este flujo). |
| `app/components/features/branches/NewBranchModal.vue` | Form pedía `name + address + city` (campos mock). Ahora pide `name + code? + isPrimary` (shape real del DTO `CreateBranchRequest`). POST real con manejo de 409 `branch_name_taken` y 403 `permission_denied`. |
| `app/components/features/users/UsuariosView.vue` | `USERS` mock con role-strings ("Contador") y toggle activo/inactivo → `usersStore.items` real. Badges de status (ACTIVE/PENDING_INVITE/SUSPENDED/ARCHIVED), roles formateados ("Recepcionista @ Sucursal Principal" — el backend ya devuelve `branchName` resuelto en GET /api/users), acciones suspend/reactivate/archive gated por `USERS_REMOVE`, edit-roles gated por `USERS_MANAGE_ROLES`. No se permiten suspend/archive sobre `currentUserId` (cliente respeta el guard `cannot_*_self`). |
| `app/components/features/users/NewUserModal.vue` | 3 roles UI con códigos minúsculos (`admin`/`accountant`/`receptionist`) sin mapeo → códigos backend (`ADMIN`/`ACCOUNTANT`/`RECEPTIONIST`). OWNER queda fuera del invite (existe solo el primer user del merchant, doc § 3). Branch scope visible solo cuando role === `RECEPTIONIST`; otros roles muestran "Acceso global". POST real con manejo 409 `email_already_in_use`/`merchant_must_have_owner`. |

### Vistas no tocadas (mock anterior intacto)

`DashboardView`, `LinksView`, `TransaccionesView`, `LiquidacionesView`, `WalletView` y todos sus subcomponentes (KpiCards, ChartCard, LiveFeed, PendingCharges, NewLinkModal, ReceiptModal, RefundModal, WithdrawModal, etc.) **se mantienen idénticos** al estado pre-integración. Cuando el backend exponga los endpoints de pagos/wallet/settlements/links se conectan en una fase posterior — pero hasta entonces el UI mock sigue ahí para el flujo de prototipo y demos.

`SettingsView` y sus tabs (Profile/Security/Billing) **se mantienen mock** también — fuera de scope explícito.

### Archivos nuevos

**Stores nuevos (Pinia):**
- `app/stores/branches.js` — fetch + create + update + archive + reactivate; getters `active`/`archived`/`primary`/`activeBranch`; persiste `activeBranchId` en `useCookie('zwap_active_branch')` (frontend-only state, doc § 4.1 — el JWT claim `activeBranchId` no se actualiza hasta fase 2).
- `app/stores/users.js` — fetch + invite + updateRoles + suspend + reactivate + archive; getter `countByBranch(id)`.

**Plugin de hidratación:**
- `app/plugins/session.client.js` — al boot del SPA llama `sessionStore.fetchMe()` si la cookie `zwap_session` está presente, así sidebar/header sobreviven al reload con datos reales.

**Helpers:**
- `app/utils/roles.js` — mapeo `roleCode` → label i18n + variante de Badge, `formatRoleAssignment(t, role)` que aprovecha el `branchName` ya resuelto por el backend en GET /api/users.

**Layout:**
- `app/layouts/default.vue` — watch sobre `sessionStore.isAuthenticated` dispara `branchesStore.fetch()` al login y `clear()` al logout. Saqué la prop `selectedBranch`/emit `branchChange` del Header (estado vive en el store, no en el layout).

**i18n (es + en):**
- Namespace nuevo `roles.{OWNER,ADMIN,ACCOUNTANT,RECEPTIONIST,global}`.
- Namespace nuevo `userStatus.{ACTIVE,PENDING_INVITE,SUSPENDED,ARCHIVED}`.
- Errores 409 conocidos: `users.errorEmailTaken`, `users.errorCannotSuspendSelf`, `users.errorCannotArchiveSelf`, `users.errorMustHaveOwner`, `users.errorReceptionistNeedsBranch`, `branches.errorNameTaken`, `branches.errorCannotArchivePrimary`.
- `errors.permissionDenied` para 403.

### Bugs / gaps detectados en backend

1. **`/api/account/me` no devuelve los `roles[]` del user logueado** — solo `permissions[]`. Eso fuerza al frontend a derivar el rol heurísticamente (combinando flags de permisos), lo cual es impreciso cuando OWNER y ADMIN tienen permisos solapados. **Pedido**: incluir `roles: [{ roleCode, branchId, branchName? }]` en el payload de login y de `/me`, con la misma forma que `GET /api/users[].roles`. Sin esto, sidebar footer / gating UI por rol no pueden ser precisos.

2. **`POST /api/branches` requiere `isPrimary` explícito en el body** — el DTO `CreateBranchRequest` declara `isPrimary` como primitive `boolean` (no `Boolean`), entonces Jackson rechaza con 400 si el field falta o viene como `null`. La guía de integración (`docs/frontend-integration-guide.md` § 7) declara `isPrimary?` como opcional, lo que es engañoso. **Pedido**: cambiar el DTO a `Boolean` con `@JsonSetter(nulls = AS_DEFAULT)`, **o** actualizar la doc clarificando que es required con default sugerido `false`.

3. **Inconsistencia entre los dos docs backend**: `frontend-real-data-cutover.md` § 5 documenta `POST /api/branches/{id}/archive` que **no existe**; el endpoint real es `DELETE /api/branches/{id}` (correcto en `frontend-integration-guide.md` § 3). Alinear los dos docs.

4. **Branches del seed no tienen `code` configurado** (todos `code: null`). El UI muestra el campo "código operativo" como vacío en cada card. No es bug, pero el seed con códigos sintéticos (`PRI`, `MAD`) sería más realista para demos y para validar el campo end-to-end.

5. **Sin endpoint "abilities" del user actual**. El frontend gating se basa en combinaciones de `sessionStore.permissions[]`, lo cual está bien pero duplica lógica que el backend ya tiene. Un `/api/account/me/abilities` que devuelva `{ canCreateBranch: true, canInviteUser: false }` ahorraría esa duplicación. Bajo prioridad.

### Sugerencias de DX backend

- **Códigos de error 409 más programáticos**: hoy el `message` es snake_case (`email_already_in_use`, `cannot_suspend_self`). Funciona para mapeo, pero un campo `code` separado del `message` (libre y traducible) ayudaría. E.g. `{ "error": "conflict", "code": "email_already_in_use", "message": "Email already in use" }`.
- **Retornar `inviterUserId` en POST /api/users response**: hoy el body es `{ user, inviteEmailSent }`. Sumar quién hizo el invite simplifica auditoría visual en la UI ("Invitado por X"). Bajo prioridad.
- **`X-Request-Id` en errores**: el wrapper api.js ya lo extrae como `ApiError.requestId`. Un ejemplo en el doc backend de cómo mostrarlo en pantallas de error ayudaría.
- **Endpoint HEAD/OPTIONS scoped para health-check con cookie**: hoy `/actuator/health` cumple, pero es público. Para diagnostics post-login conviene uno autenticado que valide cookie sin hacer trabajo pesado.

### Tests

- **Unit (Vitest)**: 431/431 verde. Sin tests rotos.
- **E2E (Playwright)**: `tests/e2e/fixtures.ts → mockAuth` ahora también inyecta stubs de `/api/account/me`, `/api/branches`, `/api/users` para que los E2E offline sigan funcionando con el plugin de hidratación + el watch del layout. Tests que tocan NewLinkModal/PermanentCard se mantienen sin cambios (LinksView volvió mock).

### Smoke manual contra backend real

Validado con curl contra `localhost:8080` (OWNER `owner@hoteldesal.bo / ChangeMe123!`):

```
GET /api/account/me   → 200 { user, merchant, permissions[23] }   ✅
GET /api/branches     → 200 [4 branches, mix ACTIVE/ARCHIVED]      ✅
GET /api/users        → 200 [4 users con roles[].branchName]       ✅
POST /api/branches    → 201 con body {name, isPrimary, code?}      ✅ (descubierto: isPrimary required)
DELETE /api/branches  → 204                                        ✅
POST /api/users       → 201 { user, inviteEmailSent: true }        ✅
DELETE /api/users     → 204                                        ✅
```

**Smoke E2E desde browser pendiente** — login con OWNER/RECEPTIONIST, validar que:
- BranchPicker muestra solo branches ACTIVE del merchant; el `merchant.businessName` aparece como label estático arriba (no es seleccionable).
- Sucursales: crear → la lista se actualiza, archive + reactivate funciona, archivada gris.
- Usuarios: invite RECEPTIONIST → email en Mailhog; suspend/reactivate funciona; OWNER no ve botones de suspend/archive sobre sí mismo.
- Login como RECEPTIONIST: vista Usuarios muestra placeholder "Sin permiso" (backend 403 sobre /api/users).
- Dashboard/Wallet/Links/Transacciones/Liquidaciones: siguen renderizando la UI mock anterior, sin cambios.
