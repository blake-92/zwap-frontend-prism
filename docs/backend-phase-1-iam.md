# Backend Phase 1 — Identity & Access (IAM)

**Objetivo**: sistema de autenticación multi-tenant con RBAC granular y branch scoping. Sin pagos, sin KYB. Base sólida sobre la cual se construyen todas las fases siguientes.

> **Antes de leer**: ten a mano `docs/backend-architecture.md` para contexto de visión global. Esta fase implementa los módulos `auth`, `iam`, `merchants` y `audit` del modelo de arquitectura, en su forma mínima ejecutable.

---

## Índice

1. [Definition of Done](#1-definition-of-done)
2. [Decisiones tomadas](#2-decisiones-tomadas)
3. [Schema (migrations V1 + V2)](#3-schema-migrations-v1--v2)
4. [Multi-tenancy implementation](#4-multi-tenancy-implementation)
5. [Auth: login, refresh, logout](#5-auth-login-refresh-logout)
6. [Permission evaluator + branch scoping](#6-permission-evaluator--branch-scoping)
7. [Endpoints](#7-endpoints)
8. [Audit events de fase 1](#8-audit-events-de-fase-1)
9. [Seed inicial (primer merchant + owner)](#9-seed-inicial-primer-merchant--owner)
10. [Tests críticos esperados](#10-tests-críticos-esperados)
11. [Roadmap de tareas (orden de implementación)](#11-roadmap-de-tareas-orden-de-implementación)
12. [Out of scope (qué NO va en fase 1)](#12-out-of-scope-qué-no-va-en-fase-1)

---

## 1. Definition of Done

Phase 1 está terminada cuando todo lo siguiente es verdadero:

- [ ] Backend deployable a Coolify staging (Docker image build OK + healthcheck verde)
- [ ] Postgres con migrations V1 + V2 aplicadas, RLS habilitado, seeds del sistema cargados
- [ ] Owner seedeado puede `POST /api/auth/login` y recibe cookies `zwap_token` (httpOnly) + `zwap_session` (no-httpOnly) + `zwap_refresh` (httpOnly)
- [ ] Owner puede `POST /api/branches` y crear sucursales (visible en `GET /api/branches`)
- [ ] Owner puede `POST /api/users` invitando a un Receptionist asignado a una sucursal específica
- [ ] El Receptionist (con email + password temporal en email del Mailhog) puede loguear
- [ ] Receptionist al hacer `GET /api/branches` ve solo la(s) sucursal(es) a las que está asignado
- [ ] Receptionist al hacer `POST /api/wallet/withdrawals` (no existe en fase 1, pero el endpoint placeholder retorna 403 por permission missing) recibe `403 forbidden` con `error: "permission_denied"`
- [ ] Receptionist al hacer `GET /api/users` recibe `403`
- [ ] Otro merchant (segundo seed) **no puede** ver datos del primero — verificable con SQL directo: si fuerzas un query sin tenant filter, RLS lo detiene
- [ ] `audit_events` registra: cada login (success + fail), cada user invite, cada role assignment, cada branch create
- [ ] Test suite verde: arquitectura (Spring Modulith), auth flow E2E, permission evaluator, RLS isolation
- [ ] Swagger UI (`/swagger-ui.html`) muestra los endpoints documentados con ejemplos de request/response

---

## 2. Decisiones tomadas

| Decisión | Elección | Por qué |
|---|---|---|
| Stack | Java 21 + Spring Boot 3.3 + Modulith + Postgres 16 + Flyway + Maven | Ver `backend-architecture.md` § 4 |
| KYB en fase 1 | **No incluir** | Sin scaffold ni columnas. Fase 2 agrega via migration. Mantiene phase 1 limpia |
| Onboarding inicial | **Seed/CLI** | Sin endpoint público `/signup`. Merchants creados via SQL seed o comando admin |
| Back-office Zwap admin | **No incluir** | Fase 2. Sin necesidad en fase 1 (no hay KYB que aprobar) |
| MFA | Scaffold tabla `auth_mfa` pero sin enforce | Permite migrar a MFA-required después sin schema rewrite |
| Refresh token rotation | **Sí desde fase 1** | Cambio crítico de seguridad; difícil de retrofit |
| Multi-tenancy | **Hibernate filter + RLS desde día 1** | Defense in depth; retrofit es doloroso |
| Audit log | **Sí desde fase 1** | Cheap to add, paga dividendos. Eventos: login, role change, user invite, branch CRUD |
| User invite | Email con token de set-password | Mailhog en local, SES/Mailgun después |

---

## 3. Schema (migrations V1 + V2)

### `V1__core.sql`

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- MERCHANTS
-- ============================================================
CREATE TABLE merchants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_name TEXT NOT NULL,
  legal_name TEXT,
  tax_id TEXT,                                     -- NIT en Bolivia
  country TEXT NOT NULL DEFAULT 'BO',
  default_currency TEXT NOT NULL DEFAULT 'BOB',
  status TEXT NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE','SUSPENDED','ARCHIVED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- BRANCHES
-- ============================================================
CREATE TABLE branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,                                       -- código interno opcional
  is_primary BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE','ARCHIVED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (merchant_id, name)
);

CREATE INDEX idx_branches_merchant ON branches(merchant_id);
-- Solo una sucursal primary por merchant
CREATE UNIQUE INDEX idx_branches_one_primary
  ON branches(merchant_id) WHERE is_primary = true;

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  email_verified_at TIMESTAMPTZ,
  password_hash TEXT,                              -- NULL hasta que setea password (invite flow)
  full_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING_INVITE'
    CHECK (status IN ('PENDING_INVITE','ACTIVE','SUSPENDED','ARCHIVED')),
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (merchant_id, email)                      -- email único por merchant (mismo email puede existir en otro merchant)
);

CREATE INDEX idx_users_merchant ON users(merchant_id);

-- ============================================================
-- AUTH SESSIONS (refresh tokens)
-- ============================================================
CREATE TABLE auth_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash TEXT NOT NULL,                -- SHA-256(refresh_token)
  user_agent TEXT,
  ip INET,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  revoked_reason TEXT,
  parent_session_id UUID REFERENCES auth_sessions(id),  -- chain de rotation; detecta reuso
  UNIQUE (refresh_token_hash)
);

CREATE INDEX idx_auth_sessions_active ON auth_sessions(user_id) WHERE revoked_at IS NULL;

-- ============================================================
-- AUTH PASSWORD RESETS / INVITES (mismo flujo)
-- ============================================================
CREATE TABLE auth_password_resets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,                 -- SHA-256
  purpose TEXT NOT NULL CHECK (purpose IN ('INVITE','RESET')),
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- AUTH MFA (scaffold; no enforce en fase 1)
-- ============================================================
CREATE TABLE auth_mfa (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  method TEXT NOT NULL CHECK (method IN ('TOTP','SMS')),
  secret_encrypted TEXT NOT NULL,
  enabled_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ
);

-- ============================================================
-- AUDIT EVENTS
-- ============================================================
CREATE TABLE audit_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor_type TEXT NOT NULL CHECK (actor_type IN ('USER','SYSTEM')),
  actor_id UUID,
  merchant_id UUID,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  action TEXT NOT NULL,
  before_state JSONB,
  after_state JSONB,
  ip INET,
  user_agent TEXT,
  request_id TEXT
);

CREATE INDEX idx_audit_resource ON audit_events(resource_type, resource_id, occurred_at DESC);
CREATE INDEX idx_audit_actor ON audit_events(actor_type, actor_id, occurred_at DESC);
CREATE INDEX idx_audit_merchant ON audit_events(merchant_id, occurred_at DESC);
```

### `V2__iam.sql`

```sql
-- ============================================================
-- PERMISSIONS (catálogo de permisos atómicos)
-- ============================================================
CREATE TABLE permissions (
  code TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  category TEXT NOT NULL                           -- account|branches|users|wallet|... (para UI agrupar)
);

INSERT INTO permissions (code, description, category) VALUES
  ('ACCOUNT_VIEW_OWN',          'Ver datos del propio usuario',                  'account'),
  ('BRANCHES_VIEW',             'Ver sucursales (filtrado por scope)',            'branches'),
  ('BRANCHES_MANAGE',           'Crear, editar, archivar sucursales',             'branches'),
  ('USERS_VIEW',                'Ver lista de usuarios del merchant',             'users'),
  ('USERS_INVITE',              'Invitar nuevos usuarios',                        'users'),
  ('USERS_MANAGE_ROLES',        'Asignar y modificar roles de usuarios',          'users'),
  ('USERS_REMOVE',              'Remover usuarios del merchant',                  'users'),
  ('WALLET_VIEW',               'Ver balance y movimientos del wallet',           'wallet'),
  ('WALLET_WITHDRAW',           'Iniciar retiros del wallet',                     'wallet'),
  ('BANK_ACCOUNT_VIEW',         'Ver cuenta bancaria configurada',                'wallet'),
  ('BANK_ACCOUNT_MANAGE',       'Configurar y modificar cuenta bancaria',         'wallet'),
  ('SETTLEMENTS_VIEW',          'Ver liquidaciones',                              'settlements'),
  ('SETTLEMENTS_EXPORT',        'Exportar liquidaciones a CSV/PDF',               'settlements'),
  ('TRANSACTIONS_VIEW',         'Ver transacciones',                              'transactions'),
  ('TRANSACTIONS_REFUND',       'Iniciar reembolsos',                             'transactions'),
  ('TRANSACTIONS_EXPORT',       'Exportar transacciones a CSV/PDF',               'transactions'),
  ('LINKS_VIEW',                'Ver links de pago',                              'links'),
  ('LINKS_CREATE',              'Crear links de pago',                            'links'),
  ('LINKS_REVOKE',              'Revocar links de pago',                          'links'),
  ('DASHBOARD_OPS_VIEW',        'Ver dashboard de operaciones (cobrar)',          'dashboard'),
  ('DASHBOARD_ANALYTICS_VIEW',  'Ver dashboard de analytics (KPIs)',              'dashboard'),
  ('SETTINGS_MERCHANT',         'Editar configuración general del merchant',     'settings'),
  ('SETTINGS_BILLING',          'Ver y modificar plan/facturación',               'settings');

-- ============================================================
-- ROLES (sistema, hardcoded en fase 1)
-- ============================================================
CREATE TABLE roles (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_system BOOLEAN NOT NULL DEFAULT true,
  scope TEXT NOT NULL DEFAULT 'merchant' CHECK (scope IN ('merchant','zwap_admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO roles (code, name, description, is_system, scope) VALUES
  ('OWNER',        'Propietario',  'Control total, único que puede retirar dinero',     true, 'merchant'),
  ('ADMIN',        'Administrador','Mismo control que Owner excepto retirar',           true, 'merchant'),
  ('ACCOUNTANT',   'Contador',     'Lectura: wallet, settlements, transactions',        true, 'merchant'),
  ('RECEPTIONIST', 'Recepcionista','Cobrar via dashboard ops y links; ver transactions', true, 'merchant');

-- ============================================================
-- ROLE → PERMISSIONS
-- ============================================================
CREATE TABLE role_permissions (
  role_code TEXT NOT NULL REFERENCES roles(code) ON DELETE CASCADE,
  permission_code TEXT NOT NULL REFERENCES permissions(code) ON DELETE CASCADE,
  PRIMARY KEY (role_code, permission_code)
);

-- OWNER: TODOS los permisos
INSERT INTO role_permissions (role_code, permission_code)
  SELECT 'OWNER', code FROM permissions;

-- ADMIN: todos excepto WALLET_WITHDRAW, BANK_ACCOUNT_MANAGE, SETTINGS_BILLING
INSERT INTO role_permissions (role_code, permission_code)
  SELECT 'ADMIN', code FROM permissions
  WHERE code NOT IN ('WALLET_WITHDRAW','BANK_ACCOUNT_MANAGE','SETTINGS_BILLING');

-- ACCOUNTANT: read-only sobre wallet/settlements/transactions
INSERT INTO role_permissions (role_code, permission_code) VALUES
  ('ACCOUNTANT','ACCOUNT_VIEW_OWN'),
  ('ACCOUNTANT','BRANCHES_VIEW'),
  ('ACCOUNTANT','WALLET_VIEW'),
  ('ACCOUNTANT','BANK_ACCOUNT_VIEW'),
  ('ACCOUNTANT','SETTLEMENTS_VIEW'),
  ('ACCOUNTANT','SETTLEMENTS_EXPORT'),
  ('ACCOUNTANT','TRANSACTIONS_VIEW'),
  ('ACCOUNTANT','TRANSACTIONS_EXPORT');

-- RECEPTIONIST: cobrar via dashboard ops + links + ver transactions
INSERT INTO role_permissions (role_code, permission_code) VALUES
  ('RECEPTIONIST','ACCOUNT_VIEW_OWN'),
  ('RECEPTIONIST','BRANCHES_VIEW'),
  ('RECEPTIONIST','TRANSACTIONS_VIEW'),
  ('RECEPTIONIST','LINKS_VIEW'),
  ('RECEPTIONIST','LINKS_CREATE'),
  ('RECEPTIONIST','DASHBOARD_OPS_VIEW');

-- ============================================================
-- USER ROLES (asignación con branch scoping)
-- ============================================================
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_code TEXT NOT NULL REFERENCES roles(code),
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,  -- NULL = todas las sucursales
  granted_by UUID REFERENCES users(id),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role_code, branch_id)
);

CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_branch ON user_roles(branch_id) WHERE branch_id IS NOT NULL;
```

### `V3__rls.sql` (multi-tenancy enforcement)

```sql
-- Crear roles Postgres
CREATE ROLE app_tenant NOLOGIN;                    -- usado por la app para tenant queries
CREATE ROLE app_admin NOLOGIN BYPASSRLS;           -- usado por back-office (fase 2) y migrations

GRANT app_tenant TO zwap;                          -- usuario de app hereda
GRANT app_admin  TO zwap;

-- Habilitar RLS en tablas con merchant_id
ALTER TABLE merchants    ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches     ENABLE ROW LEVEL SECURITY;
ALTER TABLE users        ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

-- Policies: solo ven filas de su merchant
CREATE POLICY tenant_isolation_merchants ON merchants
  USING (id = current_setting('app.merchant_id', true)::uuid);

CREATE POLICY tenant_isolation_branches ON branches
  USING (merchant_id = current_setting('app.merchant_id', true)::uuid);

CREATE POLICY tenant_isolation_users ON users
  USING (merchant_id = current_setting('app.merchant_id', true)::uuid);

CREATE POLICY tenant_isolation_audit ON audit_events
  USING (merchant_id = current_setting('app.merchant_id', true)::uuid);

-- Tablas SIN tenant scope (catálogos globales): sin RLS
-- permissions, roles, role_permissions, auth_sessions, auth_password_resets, auth_mfa, user_roles

-- auth_sessions y user_roles tienen tenant indirecto via user_id; aceptamos riesgo de
-- defense-in-depth para estas — la query siempre va con WHERE user_id IN (subquery filtered)
```

---

## 4. Multi-tenancy implementation

### Java side: `TenantContext` + filter HTTP

```java
// shared/tenant/TenantContext.java
public class TenantContext {
  private static final ThreadLocal<UUID> CURRENT = new ThreadLocal<>();
  public static void set(UUID merchantId) { CURRENT.set(merchantId); }
  public static UUID get() { return CURRENT.get(); }
  public static void clear() { CURRENT.remove(); }
}
```

```java
// shared/tenant/TenantFilter.java
@Component
@Order(10)  // después de auth filter
public class TenantFilter extends OncePerRequestFilter {
  @Override
  protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
      throws ServletException, IOException {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth instanceof JwtAuthentication jwt) {
      TenantContext.set(jwt.getMerchantId());
    }
    try {
      chain.doFilter(req, res);
    } finally {
      TenantContext.clear();
    }
  }
}
```

### RLS connection wiring

```java
// shared/tenant/RlsAwareDataSource.java — Hikari interceptor
@Component
public class RlsConnectionInterceptor implements ConnectionPreparer {
  @Override
  public Connection prepare(Connection raw) throws SQLException {
    UUID merchantId = TenantContext.get();
    if (merchantId != null) {
      try (Statement stmt = raw.createStatement()) {
        // SET LOCAL es por transaction; usa SET para session si no estás en tx
        stmt.execute("SET app.merchant_id = '" + merchantId + "'");
      }
    }
    return raw;
  }
}
```

> **Nota**: usa `SET LOCAL app.merchant_id` dentro de una `@Transactional` method para que se limpie automáticamente al final de la transacción. Para queries sin transaction explícita, usa un `Around` aspect que setea + clea.

### Hibernate filter (segunda red)

```java
// shared/tenant/TenantEntityListener.java
@FilterDef(name = "tenantFilter", parameters = @ParamDef(name = "mid", type = UUID.class))
@Filter(name = "tenantFilter", condition = "merchant_id = :mid")
public abstract class TenantAwareEntity { ... }
```

Cada entidad de tenant extiende `TenantAwareEntity`. En el `EntityManager` setup, filter habilitado por request:

```java
@Component
@RequiredArgsConstructor
public class TenantSessionConfig {
  private final EntityManager em;

  @PostConstruct
  void enableFilter() {
    em.unwrap(Session.class).enableFilter("tenantFilter")
      .setParameter("mid", TenantContext.get());
  }
}
```

---

## 5. Auth: login, refresh, logout

### `POST /api/auth/login`

**Request:**
```json
{ "email": "owner@hotel.com", "password": "..." }
```

**Validation**:
- email no vacío
- password no vacío
- rate limit: max 10 intentos / 15 min por IP+email

**Lógica**:
1. SELECT user WHERE email = ? (sin tenant filter — login es cross-tenant para encontrar el merchant)
2. Verify BCrypt(password, user.password_hash). Si falla → 401 + audit `LOGIN_FAILED`
3. Verify user.status = ACTIVE. Si no → 403
4. Verify user.merchant.status = ACTIVE. Si no → 403
5. Generate access token (JWT 15 min) + refresh token (opaque 30 días)
6. INSERT auth_sessions con SHA-256(refresh_token_hash), user_agent, ip
7. Audit `LOGIN_SUCCESS`
8. Set 3 cookies, return body

**Response 200:**
```json
{
  "user": {
    "id": "uuid",
    "email": "owner@hotel.com",
    "fullName": "Juan Pérez",
    "merchantId": "uuid",
    "merchantName": "Hotel de Sal"
  },
  "branches": [
    { "id": "uuid", "name": "Sucursal Principal", "isPrimary": true },
    { "id": "uuid", "name": "Hotel de Madera", "isPrimary": false }
  ],
  "permissions": ["ACCOUNT_VIEW_OWN", "BRANCHES_MANAGE", ...],
  "expiresIn": 900
}
```

**Response 401:** `{ "error": "invalid_credentials" }`
**Response 403 (suspended):** `{ "error": "user_suspended" }` o `merchant_suspended`

**Set-Cookie headers:**
```
Set-Cookie: zwap_token=<jwt>; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=900
Set-Cookie: zwap_session=1; Path=/; Secure; SameSite=Lax; Max-Age=900
Set-Cookie: zwap_refresh=<opaque>; Path=/api/auth; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000
```

### `POST /api/auth/refresh`

**Request**: vacío. El cookie `zwap_refresh` viaja automáticamente.

**Lógica**:
1. SHA-256 del cookie value → buscar en auth_sessions
2. Si no existe → 401
3. Si revoked_at IS NOT NULL → **alerta de seguridad**: revoke toda la cadena (`parent_session_id` ascendente y descendente). Audit `REFRESH_REUSE_DETECTED`. Return 401.
4. Si expired → 401
5. Generate new access + refresh. Mark old session revoked, create new with `parent_session_id = old.id`
6. Set new cookies

**Response 200**: igual al login (sin re-fetch de user/branches si JWT lo tiene).

### `POST /api/auth/logout`

**Lógica**:
1. Identificar sesión actual via cookie refresh
2. Mark session revoked
3. Clear all 3 cookies (`Max-Age=0`)
4. Audit `LOGOUT`

**Response 204** sin body.

### `GET /api/account/me`

Auth requerido. Retorna user + merchant + branches accesibles + permisos.

**Response 200**: igual al body del login.

---

## 6. Permission evaluator + branch scoping

### `@perm.has(code)` y `@perm.has(code, branchId)`

```java
// iam/PermissionService.java
@Service
@RequiredArgsConstructor
public class PermissionService {
  private final UserRoleRepository userRoles;
  private final RolePermissionRepository rolePermissions;

  /** Permiso global o cualquier branch */
  public boolean has(UUID userId, String permissionCode) {
    return userRoles.findByUserId(userId).stream().anyMatch(ur ->
      rolePermissions.existsByRoleCodeAndPermissionCode(ur.getRoleCode(), permissionCode)
    );
  }

  /** Permiso scoped a una branch específica */
  public boolean has(UUID userId, String permissionCode, UUID branchId) {
    return userRoles.findByUserId(userId).stream().anyMatch(ur ->
      rolePermissions.existsByRoleCodeAndPermissionCode(ur.getRoleCode(), permissionCode)
      && (ur.getBranchId() == null || ur.getBranchId().equals(branchId))
    );
  }

  public Set<UUID> accessibleBranches(UUID userId, UUID merchantId) {
    var roles = userRoles.findByUserId(userId);
    if (roles.stream().anyMatch(ur -> ur.getBranchId() == null)) {
      return branchRepo.findIdsByMerchantId(merchantId);  // todas
    }
    return roles.stream().map(UserRole::getBranchId).filter(Objects::nonNull).collect(toSet());
  }
}
```

### Bean Spring Security `@perm`

```java
// shared/config/SecurityConfig.java
@Bean("perm")
public Object permBean(PermissionService svc) {
  return new Object() {
    public boolean has(String code) {
      return svc.has(currentUserId(), code);
    }
    public boolean has(String code, UUID branchId) {
      return svc.has(currentUserId(), code, branchId);
    }
  };
}
```

### Uso en controller

```java
@RestController
@RequestMapping("/api/branches")
@RequiredArgsConstructor
public class BranchController {
  private final BranchService service;

  @GetMapping
  @PreAuthorize("@perm.has('BRANCHES_VIEW')")
  public List<BranchResponse> list() {
    // Service filtra por accessibleBranches(currentUser, currentMerchant)
    return service.listAccessible();
  }

  @PostMapping
  @PreAuthorize("@perm.has('BRANCHES_MANAGE')")
  public BranchResponse create(@RequestBody @Valid CreateBranchRequest req) {
    return service.create(req);
  }
}
```

---

## 7. Endpoints

Lista completa de Phase 1. Todos requieren auth excepto los marcados como `(public)`.

### Auth

| Method | Path | Permission | Descripción |
|---|---|---|---|
| POST | `/api/auth/login` | (public) | Login con email + password |
| POST | `/api/auth/refresh` | (cookie refresh) | Rotación de tokens |
| POST | `/api/auth/logout` | auth | Logout actual session |
| POST | `/api/auth/invite/accept` | (public, requiere token) | Set password tras invite |
| POST | `/api/auth/password/reset/request` | (public) | Solicita email de reset |
| POST | `/api/auth/password/reset/confirm` | (public, token) | Confirma reset con nuevo password |

### Account

| Method | Path | Permission | Descripción |
|---|---|---|---|
| GET | `/api/account/me` | auth | User + merchant + branches + permisos |
| PATCH | `/api/account/me` | `ACCOUNT_VIEW_OWN` | Editar fullName propio |
| POST | `/api/account/password/change` | auth | Cambiar password (requiere password actual) |

### Branches

| Method | Path | Permission | Descripción |
|---|---|---|---|
| GET | `/api/branches` | `BRANCHES_VIEW` | Lista (filtrado por scope) |
| GET | `/api/branches/{id}` | `BRANCHES_VIEW` (verifica scope) | Detalle |
| POST | `/api/branches` | `BRANCHES_MANAGE` | Crear |
| PATCH | `/api/branches/{id}` | `BRANCHES_MANAGE` | Editar nombre, code, is_primary |
| DELETE | `/api/branches/{id}` | `BRANCHES_MANAGE` | Archivar (soft delete: status=ARCHIVED) |

### Users

| Method | Path | Permission | Descripción |
|---|---|---|---|
| GET | `/api/users` | `USERS_VIEW` | Lista del merchant |
| GET | `/api/users/{id}` | `USERS_VIEW` | Detalle + roles + branches asignadas |
| POST | `/api/users` | `USERS_INVITE` | Invitar — crea user + token + envía email |
| PATCH | `/api/users/{id}/roles` | `USERS_MANAGE_ROLES` | Asignar/remover roles + branches |
| POST | `/api/users/{id}/suspend` | `USERS_REMOVE` | Suspender (no hard delete) |
| POST | `/api/users/{id}/reactivate` | `USERS_REMOVE` | Reactivar |
| DELETE | `/api/users/{id}` | `USERS_REMOVE` | Archivar (status=ARCHIVED) |

### Permissions / Roles (read-only en fase 1)

| Method | Path | Permission | Descripción |
|---|---|---|---|
| GET | `/api/iam/permissions` | auth | Catálogo de permisos disponibles |
| GET | `/api/iam/roles` | auth | Roles del sistema con sus permisos |

### Shapes clave

**`POST /api/users` request:**
```json
{
  "email": "ana@hotel.com",
  "fullName": "Ana López",
  "roleAssignments": [
    { "roleCode": "RECEPTIONIST", "branchId": "uuid-branch-1" },
    { "roleCode": "RECEPTIONIST", "branchId": "uuid-branch-2" }
  ]
}
```

**`POST /api/users` response 201:**
```json
{
  "id": "uuid",
  "email": "ana@hotel.com",
  "fullName": "Ana López",
  "status": "PENDING_INVITE",
  "roles": [...],
  "inviteEmailSent": true
}
```

**`POST /api/auth/invite/accept` request:**
```json
{ "token": "...", "password": "newSecurePassword123" }
```

Validation password: min 12 chars, mix de letras + números (no enforce caracteres especiales para no frustrar usuarios; reglas se ajustan después con feedback).

**`PATCH /api/users/{id}/roles` request:**
```json
{
  "assignments": [
    { "roleCode": "ADMIN", "branchId": null }
  ]
}
```
Reemplaza completamente las asignaciones (idempotente). Valida que el actor tiene `USERS_MANAGE_ROLES`.

**Errores estándar:**
```json
{ "error": "permission_denied", "message": "...", "requestId": "..." }
{ "error": "validation_failed", "details": [{ "field": "email", "code": "invalid_format" }] }
{ "error": "not_found" }
{ "error": "conflict", "message": "email already in use" }
```

---

## 8. Audit events de fase 1

Eventos a registrar en `audit_events`:

| Action | Resource | Cuándo | actor | merchant_id |
|---|---|---|---|---|
| `LOGIN_SUCCESS` | USER | Login OK | self | user.merchant |
| `LOGIN_FAILED` | USER | Password incorrecto | NULL (anonymous) | NULL |
| `LOGIN_USER_SUSPENDED` | USER | Login con user suspendido | self | user.merchant |
| `LOGOUT` | USER | Logout | self | user.merchant |
| `REFRESH_REUSE_DETECTED` | AUTH_SESSION | Token revocado reutilizado | self | user.merchant |
| `PASSWORD_CHANGED` | USER | Cambio password | self | user.merchant |
| `PASSWORD_RESET_REQUESTED` | USER | Solicitó reset | NULL | user.merchant |
| `PASSWORD_RESET_COMPLETED` | USER | Confirmó reset | self | user.merchant |
| `USER_INVITED` | USER | Invite enviado | actor | merchant |
| `USER_INVITE_ACCEPTED` | USER | Set password tras invite | invitee | merchant |
| `USER_ROLES_UPDATED` | USER | Cambio roles/branches | actor | merchant |
| `USER_SUSPENDED` | USER | Actor suspendió a otro | actor | merchant |
| `USER_REACTIVATED` | USER | | actor | merchant |
| `BRANCH_CREATED` | BRANCH | | actor | merchant |
| `BRANCH_UPDATED` | BRANCH | Edit | actor | merchant |
| `BRANCH_ARCHIVED` | BRANCH | Soft delete | actor | merchant |
| `MERCHANT_UPDATED` | MERCHANT | Edit profile | actor | merchant |

`before_state` y `after_state` se llenan en updates (diff de las columnas afectadas).

---

## 9. Seed inicial (primer merchant + owner)

`db/migration/V99__seed_dev.sql` (solo en perfil `local` y `dev`):

```sql
-- Merchant de prueba
INSERT INTO merchants (id, business_name, legal_name, tax_id, country, default_currency, status)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Hotel de Sal',
  'Hotel de Sal S.R.L.',
  '1023456789',
  'BO',
  'BOB',
  'ACTIVE'
);

-- Sucursal primary
INSERT INTO branches (id, merchant_id, name, is_primary, status)
VALUES (
  'b0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'Sucursal Principal',
  true,
  'ACTIVE'
);

-- Owner user (password: "ChangeMe123!" hasheado con BCrypt cost 12)
INSERT INTO users (id, merchant_id, email, email_verified_at, password_hash, full_name, status)
VALUES (
  'c0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'owner@hoteldesal.bo',
  now(),
  '$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',  -- BCrypt("ChangeMe123!")
  'Juan Pérez',
  'ACTIVE'
);

-- OWNER role sobre todas las branches (branch_id NULL)
INSERT INTO user_roles (user_id, role_code, branch_id, granted_at)
VALUES (
  'c0000000-0000-0000-0000-000000000001',
  'OWNER',
  NULL,
  now()
);
```

> **CRÍTICO**: el password hash arriba es ejemplo. Genera uno real con `BCrypt.hashpw("ChangeMe123!", BCrypt.gensalt(12))` o vía `htpasswd -bnBC 12 "" "ChangeMe123!" | tr -d ':\n'`.

Alternativa: comando Spring Shell `seed-merchant` que pide nombre + email del owner por CLI:
```bash
./mvnw spring-boot:run -Dspring-boot.run.arguments="seed-merchant --name='Hotel X' --email=owner@hotel.com --password=..."
```

---

## 10. Tests críticos esperados

### Unit
- `PermissionServiceTest` — has(perm), has(perm, branch), accessibleBranches() con casos: owner sin branch_id, receptionist con 1 branch, multi-branch
- `BCryptPasswordHasherTest` — verify ↔ hash
- `JwtServiceTest` — issue + verify + claims

### Integration (Testcontainers Postgres)
- `AuthFlowIT` — login → /me → refresh → logout, con cookies persistentes
- `RefreshReuseIT` — usar un refresh dos veces → segunda llamada falla + cadena revoked
- `RlsIsolationIT` — crear datos en merchant A, query con `app.merchant_id = B` → no ve datos
- `BranchScopingIT` — receptionist con branch X no ve transactions de branch Y (cuando exista; placeholder ahora)
- `UserInviteFlowIT` — invite → email recibido en Mailhog → token consumido → password seteado → login OK
- `AuditEventsIT` — cada acción dispara su audit event esperado

### Architecture (Spring Modulith)
- `ArchitectureTest.modulesRespectBoundaries()` — módulo `auth` no importa de `merchants.internal`, etc.

### Seguridad
- `RateLimitIT` — 11 logins fallidos en 15 min → 429
- `JwtTamperingIT` — JWT con signature rota → 401
- `CookieFlagsIT` — verifica HttpOnly, Secure, SameSite presentes en responses

---

## 11. Roadmap de tareas (orden de implementación)

Sugerencia de cómo trabajar la fase 1, en orden de menor a mayor riesgo:

1. **Bootstrap proyecto** (1 día)
   - `start.spring.io` con dependencias (ver `backend-architecture.md` § 17)
   - `docker-compose.yml` con postgres + mailhog
   - `application-local.yml`
   - Smoke test: `./mvnw spring-boot:run` → `/actuator/health` 200
2. **Migrations V1 + V2 + V3** (1 día)
   - Schema completo
   - Seed permissions + roles + role_permissions
   - Verificar con `psql` que todo cargó
3. **Spring Modulith setup + ArchitectureTest** (medio día)
   - `@ApplicationModule` en cada paquete
   - Test que verifica grafo
4. **Multi-tenancy infrastructure** (2 días)
   - `TenantContext` + `TenantFilter`
   - `RlsConnectionInterceptor`
   - Hibernate filter en entities
   - Test: `RlsIsolationIT`
5. **Auth: login + JWT** (2 días)
   - JJWT setup, JwtService
   - SecurityConfig con custom filter que lee cookie
   - `POST /api/auth/login` + cookies + audit
   - `GET /api/account/me`
   - Test: `AuthFlowIT` (login + /me)
6. **Auth: refresh + logout** (1 día)
   - Refresh rotation + reuse detection
   - Logout
   - Test: `RefreshReuseIT`
7. **Permission service + bean** (1 día)
   - `PermissionService`
   - Spring bean `@perm`
   - `@PreAuthorize` en controllers placeholder
8. **Branches CRUD** (1 día)
   - Endpoints + service + repo
   - Branch scoping en list
   - Audit events
9. **Users CRUD + invite flow** (3 días)
   - Endpoints
   - Invite token + email via Mailhog
   - `POST /api/auth/invite/accept`
   - Test: `UserInviteFlowIT`
10. **Audit log** (1 día)
    - `AuditService` + `@TransactionalEventListener`
    - Eventos publicados desde cada controller
11. **Seed data + smoke test E2E** (medio día)
    - V99 seed migration
    - Manual: login owner → crear branch → invitar receptionist → receptionist set password → receptionist login → ver branches
12. **Hardening** (2 días)
    - Rate limit en login
    - Password reset flow
    - OpenAPI annotations + Swagger UI clean
    - Logback JSON
    - Healthcheck endpoints

**Total estimado**: ~17 días de trabajo focalizado. Realísticamente con interrupciones y aprendizaje: **3-4 semanas**.

---

## 12. Out of scope (qué NO va en fase 1)

- KYB (workflow, documents, MinIO)
- Back-office Zwap admin
- Stripe / VPay / cualquier provider de pagos
- transactions, payment_links, refunds, withdrawals
- ledger
- outbox pattern (no hay eventos cross-module críticos en phase 1)
- idempotency keys (no hay endpoints financieros)
- reconciliation
- analytics / KPIs
- /signup público (solo seed/CLI)
- MFA enforcement (tabla `auth_mfa` existe, no se usa)
- Custom roles por merchant (solo system roles)
- Scheduled jobs (no hay nada periódico en fase 1)

Cada item vive en su fase correspondiente. NO añadir nada de esto "por si acaso" — la fase 1 está diseñada para ser entregable y verificable sin estos elementos.
