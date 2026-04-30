# Backend Architecture — `zwap-backend`

**Documento de visión y arquitectura objetivo** para el backend de Zwap. Cubre el sistema completo en su estado final (payment orchestrator multi-provider con KYB, RBAC, ledger, settlements, etc.), no la ejecución inmediata.

La construcción se hace **por fases**, cada una con su propio doc ejecutable bajo `docs/backend-phase-<n>-<name>.md`. Esta arquitectura es el norte; las fases son el camino.

| Fase | Doc | Estado |
|---|---|---|
| 1. Identity & Access (login, users, branches, roles) | `docs/backend-phase-1-iam.md` | En diseño |
| 2. KYB + Back-office Zwap admin | (pendiente) | — |
| 3. Stripe Direct + ledger | (pendiente) | — |
| 4. Links + Dashboard ops | (pendiente) | — |
| 5. Stripe Connect Express | (pendiente) | — |
| 6. VPay Bolivia + routing engine | (pendiente) | — |
| 7. Wallet + withdrawals | (pendiente) | — |
| 8. Settlements | (pendiente) | — |
| 9. Reconciliation jobs | (pendiente) | — |
| 10. Analytics + KPIs | (pendiente) | — |

> **Cómo usar este doc**: léelo entero al inicio de cada fase para mantener contexto; consulta secciones específicas cuando una decisión de fase pueda impactar las siguientes (ej. al diseñar tablas en fase 1, revisa § 5 multi-tenancy para no pintarte en una esquina).

---

## Índice

1. [Contexto y decisiones](#1-contexto-y-decisiones)
2. [Dominio: payment orchestrator](#2-dominio-payment-orchestrator)
3. [Arquitectura: módulos](#3-arquitectura-módulos)
4. [Stack](#4-stack)
5. [Multi-tenancy strategy](#5-multi-tenancy-strategy)
6. [Authn + Authz](#6-authn--authz)
7. [RBAC con branch scoping](#7-rbac-con-branch-scoping)
8. [KYB workflow](#8-kyb-workflow)
9. [Back-office Zwap admin](#9-back-office-zwap-admin)
10. [Payment orchestration](#10-payment-orchestration)
11. [Stripe Connect Express](#11-stripe-connect-express)
12. [Ledger (double-entry)](#12-ledger-double-entry)
13. [Audit log](#13-audit-log)
14. [Money, FX, async jobs](#14-money-fx-async-jobs)
15. [Estructura del repo](#15-estructura-del-repo)
16. [Schema inicial (migrations)](#16-schema-inicial-migrations)
17. [Bootstrap paso a paso](#17-bootstrap-paso-a-paso)
18. [Coolify + Lightsail + backups](#18-coolify--lightsail--backups)
19. [CI/CD](#19-cicd)
20. [Conexión con el frontend](#20-conexión-con-el-frontend)
21. [Roadmap a microservicios + out of scope](#21-roadmap-a-microservicios--out-of-scope)
22. [Referencias](#22-referencias)

---

## 1. Contexto y decisiones

| Decisión | Elección | Justificación |
|---|---|---|
| Repo | Separado `zwap-backend` | Ciclos de release independientes; contrato vía OpenAPI |
| Arquitectura | Modular monolith (Spring Modulith) | Empezar simple; extraer microservicios cuando los límites estén probados |
| Lenguaje / runtime | Java 21 LTS | LTS actual; virtual threads para concurrencia barata |
| Framework | Spring Boot 3.3.x | Stack estándar enterprise |
| Module enforcement | Spring Modulith | Boundaries verificados en tests + eventos internos listos para extracción |
| DB | Postgres 16 (self-hosted Coolify) | Decisión del usuario; **backup robusto obligatorio** (ver § 18) |
| Migrations | Flyway | SQL plano, versionado |
| Auth | Spring Security + JWT (cookie) | Compatible con `app/middleware/auth.js` |
| Multi-tenancy | Row-level + Postgres RLS (defense in depth) | Detalle § 5 |
| Provider integration | Stripe (direct + Connect Express) + VPay Bolivia | Pluggable para futuros (dLocal, MercadoPago, etc.) |
| API spec | springdoc-openapi 2.x | OpenAPI 3 auto-generado |
| Tests | JUnit 5 + AssertJ + Testcontainers | Postgres real |
| Build | Maven | Más simple que Gradle para arrancar |
| Local dev | Docker Compose | Postgres + backend + MinIO (KYB docs) + Mailhog |
| Hosting prod | Coolify self-hosted en AWS Lightsail | Backups Postgres → S3 obligatorios |

---

## 2. Dominio: payment orchestrator

Zwap **no es** un procesador de pagos — es un orquestador. Esto significa:
- Múltiples providers detrás (Stripe direct, Stripe Connect Express, VPay Bolivia, futuros)
- **Routing** decide a quién va cada cobro según moneda, país, canal, monto, costos
- **Fallback** si el primary falla
- **Idempotencia** end-to-end para que retries no doble-cobren
- **Reconciliation** diaria contra cada provider
- **Settlement** unificado al merchant aunque el dinero venga de N rails

Esta es THE razón de existir; el resto del backend (auth, KYB, branches, users) son requisitos para que el orchestrator opere de forma B2B compliant.

---

## 3. Arquitectura: módulos

```
auth          → identity, sessions, JWT, password reset, MFA
kyb           → KYB workflow, document store, compliance review
merchants     → merchant profile, branches, plan
iam           → roles, permissions, user-branch assignments, permission evaluator
payments      → transactions (charges, refunds, captures, voids)
links         → payment links (single-use, multi-use, permanent)
wallet        → balance ledger view, withdrawals, bank accounts
settlements   → payouts (multi-provider, reconciled)
providers     → provider adapters (StripeDirect, StripeConnect, VPay)
orchestrator  → routing rules, idempotency, retry, fallback
ledger        → double-entry bookkeeping (financial truth)
audit         → append-only audit log
admin         → back-office Zwap (KYB review, merchant ops, support)
analytics     → read-side projections (KPIs, charts) — fed by events
notifications → emails (SES prod, Mailhog dev), in-app
shared        → security, OpenAPI, error handlers, money types
```

### Grafo de dependencias (Spring Modulith verifica)

```
auth                 ← (raíz, todos dependen de su API)
iam                  → auth
merchants            → auth, iam
kyb                  → auth, merchants
admin                → auth, kyb, merchants, payments, ledger    (lectura cross-domain)
providers            → (sin deps de dominio, pure adapters)
orchestrator         → providers, payments
payments             → auth, iam, merchants, orchestrator, ledger
links                → auth, iam, merchants, payments
wallet               → auth, iam, merchants, ledger
settlements          → auth, iam, merchants, payments, ledger, providers
ledger               → (sin deps; recibe eventos de payments/wallet/settlements)
audit                → (recibe eventos de TODOS los módulos)
analytics            → (recibe eventos)
notifications        → (recibe eventos)
```

`audit`, `analytics`, `notifications`, `ledger` son **read-side / event-driven**: nunca son llamados síncronamente desde el dominio; reciben eventos via `ApplicationEventPublisher` + `@TransactionalEventListener`. Esto los hace extraibles a microservicios sin tocar el dominio cuando se requiera.

---

## 4. Stack

| Capa | Elección | Notas |
|---|---|---|
| JDK | Java 21 LTS (Temurin) | Virtual threads (Loom) habilitados con `spring.threads.virtual.enabled=true` |
| Framework | Spring Boot 3.3.x | + Spring Web, Data JPA, Security, Validation, Actuator |
| Modulith | Spring Modulith 1.3.x | Module verification + externalized events |
| ORM | Hibernate 6 (vía JPA) | `@Filter` para tenant isolation |
| Migrations | Flyway 10 | SQL puro |
| Auth | Spring Security 6 + JJWT 0.12 | Cookie httpOnly + refresh rotation |
| Validation | Hibernate Validator | `@Valid` en controllers |
| API spec | springdoc-openapi 2.6 | `/v3/api-docs` + Swagger UI |
| HTTP client | Spring `RestClient` (Boot 3.2+) | Para Stripe/VPay calls — NO RestTemplate |
| Stripe SDK | stripe-java 28.x | Oficial |
| Object storage | MinIO (S3-compatible, en Coolify) | KYB docs |
| Tests | JUnit 5, AssertJ, Testcontainers (postgres + minio), Mockito | Integration first |
| Build | Maven 3.9 | `./mvnw` wrapper |
| Logging | Logback + JSON encoder (logstash-logback-encoder) | Structured JSON desde día 1 |

---

## 5. Multi-tenancy strategy

**Defense in depth: app-level filter + DB-level RLS.**

### Tablas de dominio

Toda tabla con datos de merchant lleva `merchant_id UUID NOT NULL`. Tablas globales (permissions, roles, providers, fx_rates, zwap_admins) no.

### Capa 1 — Hibernate filter automático

```java
@FilterDef(name = "tenant", parameters = @ParamDef(name = "mid", type = UUID.class))
@Filter(name = "tenant", condition = "merchant_id = :mid")
@Entity public class Transaction { ... }
```

Un `OncePerRequestFilter` extrae `merchantId` del JWT y habilita el filter al inicio del request.

### Capa 2 — Postgres RLS

```sql
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON transactions
  USING (merchant_id = current_setting('app.merchant_id', true)::uuid);
```

En cada conexión obtenida del pool: `SET LOCAL app.merchant_id = '<uuid>'`. Si la app olvida el filter Hibernate, RLS detiene el query a nivel DB.

**Excepciones**: queries del módulo `admin` corren con un rol Postgres `zwap_admin` que tiene `BYPASSRLS`. La conexión se obtiene de un pool separado; nunca se mezcla con el pool de tenant.

---

## 6. Authn + Authz

### Login flow

```
POST /api/auth/login { email, password }
  ↓ verify password (BCrypt cost 12)
  ↓ check user.merchant.kyb_status = APPROVED (else 403 kyb_required)
  ↓ check user.status = ACTIVE
  → 200 OK
    Set-Cookie: zwap_session=1; Path=/; HttpOnly=false; Secure; SameSite=Lax; Max-Age=900
    Set-Cookie: zwap_token=<JWT>; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=900
    Set-Cookie: zwap_refresh=<opaque>; Path=/api/auth; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000
    Body: { user, merchant, branches, permissions }
```

**Por qué dos cookies de sesión**:
- `zwap_token` (httpOnly): JWT real que el navegador envía en cada request, **invisible a JS** (anti-XSS exfiltration)
- `zwap_session` (no-httpOnly): flag `"1"` que el frontend lee con `useCookie('zwap_session')` para saber si hay sesión, **sin contener nada sensible**

Esto requiere cambio mínimo en el frontend: cambiar `app/middleware/auth.js:9` de `if (!token.value)` a leer `zwap_session`. Documentado como **paso pendiente del frontend** al hacer cutover.

### JWT shape

```json
{
  "sub": "user-uuid",
  "merchantId": "merchant-uuid",
  "activeBranchId": "branch-uuid-or-null",
  "scope": "merchant",
  "iat": 1730000000,
  "exp": 1730000900,
  "jti": "session-uuid"
}
```

`scope` es `merchant` o `zwap_admin`; permite al filter elegir qué pool de DB usar y qué controllers son alcanzables.

`activeBranchId` es opcional — usuario puede cambiar sucursal activa sin re-login (re-issue token con nuevo claim).

### Refresh token

- Almacenado hasheado en `auth_sessions(refresh_token_hash, ...)` con SHA-256
- Rotation en cada uso: el viejo se marca revoked, se emite uno nuevo
- Detección de reuso: si un refresh ya revoked se intenta usar → revoke toda la sesión + alerta de seguridad

### MFA (futuro, scaffold ya)

Tabla `auth_mfa(user_id, method=TOTP|SMS, secret_encrypted, enabled_at)`. Endpoint `/api/auth/mfa/verify` durante login si `user.mfa_enabled`. Implementar primero para `OWNER` y `zwap_admin`.

---

## 7. RBAC con branch scoping

### Modelo

```sql
permissions       (code TEXT PK, description TEXT)
roles             (code TEXT PK, name TEXT, is_system BOOL, scope TEXT)  -- scope: merchant | zwap_admin
role_permissions  (role_code, permission_code) PK compuesta
user_roles        (id, user_id, role_code, branch_id UUID NULL, granted_by, granted_at)
```

`branch_id NULL` → permiso aplica a todas las sucursales del merchant. `branch_id = X` → solo a sucursal X. Un user puede tener múltiples filas en `user_roles` (e.g., RECEPTIONIST en sucursal A + RECEPTIONIST en sucursal B).

### Permisos atómicos (v1)

```
Auth/Account:
  ACCOUNT_VIEW_OWN

KYB:
  KYB_SUBMIT_OWN, KYB_VIEW_OWN

Branches:
  BRANCHES_VIEW, BRANCHES_MANAGE

Users:
  USERS_VIEW, USERS_INVITE, USERS_MANAGE_ROLES, USERS_REMOVE

Wallet:
  WALLET_VIEW, WALLET_WITHDRAW
  BANK_ACCOUNT_VIEW, BANK_ACCOUNT_MANAGE

Settlements:
  SETTLEMENTS_VIEW, SETTLEMENTS_EXPORT

Transactions:
  TRANSACTIONS_VIEW, TRANSACTIONS_REFUND, TRANSACTIONS_EXPORT

Links:
  LINKS_VIEW, LINKS_CREATE, LINKS_REVOKE

Dashboard:
  DASHBOARD_OPS_VIEW       (cobrar, pending charges)
  DASHBOARD_ANALYTICS_VIEW (KPIs, charts)

Settings:
  SETTINGS_MERCHANT, SETTINGS_BILLING
```

### Matriz role → permisos (sistema)

| Permiso | OWNER | ADMIN | ACCOUNTANT | RECEPTIONIST |
|---|:-:|:-:|:-:|:-:|
| ACCOUNT_VIEW_OWN | ✓ | ✓ | ✓ | ✓ |
| KYB_SUBMIT_OWN / VIEW_OWN | ✓ | ✓ | — | — |
| BRANCHES_VIEW | ✓ | ✓ | ✓ | ✓¹ |
| BRANCHES_MANAGE | ✓ | ✓ | — | — |
| USERS_VIEW | ✓ | ✓ | — | — |
| USERS_INVITE / MANAGE_ROLES / REMOVE | ✓ | ✓ | — | — |
| WALLET_VIEW | ✓ | ✓ | ✓ | — |
| **WALLET_WITHDRAW** | ✓ | — | — | — |
| BANK_ACCOUNT_VIEW | ✓ | ✓ | ✓ | — |
| BANK_ACCOUNT_MANAGE | ✓ | — | — | — |
| SETTLEMENTS_VIEW | ✓ | ✓ | ✓ | — |
| SETTLEMENTS_EXPORT | ✓ | ✓ | ✓ | — |
| TRANSACTIONS_VIEW | ✓ | ✓ | ✓ | ✓ |
| TRANSACTIONS_REFUND | ✓ | ✓ | — | — |
| TRANSACTIONS_EXPORT | ✓ | ✓ | ✓ | — |
| LINKS_VIEW | ✓ | ✓ | — | ✓ |
| LINKS_CREATE | ✓ | ✓ | — | ✓ |
| LINKS_REVOKE | ✓ | ✓ | — | — |
| DASHBOARD_OPS_VIEW | ✓ | ✓ | — | ✓ |
| DASHBOARD_ANALYTICS_VIEW | ✓ | ✓ | — | — |
| SETTINGS_MERCHANT | ✓ | ✓ | — | — |
| SETTINGS_BILLING | ✓ | — | — | — |

¹ Receptionist ve solo las sucursales a las que está asignado.

### Permission evaluator

```java
@Component("perm")
public class PermissionEvaluator {
  public boolean has(String code) { return has(code, null); }

  public boolean has(String code, UUID branchId) {
    User u = SecurityContext.currentUser();
    return u.userRoles().stream().anyMatch(ur ->
      ur.role().permissions().contains(code)
      && (ur.branchId() == null || ur.branchId().equals(branchId))
    );
  }
}
```

Uso en controller:
```java
@PostMapping("/api/links")
@PreAuthorize("@perm.has('LINKS_CREATE', #req.branchId())")
public LinkResponse create(@RequestBody @Valid CreateLinkRequest req) { ... }
```

### Resolución de "branches accesibles"

```sql
SELECT b.id FROM branches b
WHERE b.merchant_id = :mid
  AND (
    EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = :uid AND ur.branch_id IS NULL)
    OR b.id IN (SELECT branch_id FROM user_roles WHERE user_id = :uid)
  );
```

Esta query alimenta el filtro automático en queries de `transactions`, `links`, etc. para receptionist.

---

## 8. KYB workflow

### State machine

```
DRAFT  ←──────────── (merchant edits)
  │
  ▼ submit
PENDING_REVIEW
  │
  ├──→ ADDITIONAL_INFO_REQUESTED ──(merchant uploads more)──→ PENDING_REVIEW (loop)
  │
  ├──→ APPROVED ──→ SUSPENDED (compliance flag) ──→ APPROVED
  │
  └──→ REJECTED  (terminal por X días, luego puede re-aplicar)
```

### Tablas

```sql
kyb_applications (
  id UUID PK,
  merchant_id UUID NOT NULL REFERENCES merchants(id),
  status TEXT NOT NULL,                -- DRAFT|PENDING_REVIEW|ADDITIONAL_INFO_REQUESTED|APPROVED|REJECTED|SUSPENDED
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reviewer_zwap_admin_id UUID,
  decision_reason TEXT,
  expires_at TIMESTAMPTZ,              -- re-KYB anual
  metadata JSONB                       -- legal name, NIT, FUNDEMPRESA num, address, etc.
);

kyb_documents (
  id UUID PK,
  application_id UUID NOT NULL REFERENCES kyb_applications(id),
  type TEXT NOT NULL,                  -- NIT|FUNDEMPRESA|CI_REPRESENTANTE|PODER_NOTARIAL|CONTRATO|FOTO_ESTABLECIMIENTO|OTHER
  s3_key TEXT NOT NULL,
  sha256 TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL,
  uploaded_by UUID NOT NULL
);

kyb_review_events (                    -- audit trail
  id UUID PK,
  application_id UUID NOT NULL,
  event TEXT NOT NULL,                 -- SUBMITTED|REQUESTED_INFO|APPROVED|REJECTED|SUSPENDED|UNSUSPENDED|RE_KYB_DUE
  actor_user_id UUID,                  -- merchant user o zwap admin
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Document storage

- **MinIO** en Coolify (S3 API compatible, encrypted at-rest)
- Bucket `zwap-kyb-docs` privado, acceso solo via signed URLs (TTL 5 min)
- SHA256 para detectar tampering
- Backup MinIO → S3 AWS off-site (cross-region) — ver § 18

### Hard gate

Spring Security filter ANTES del PermissionEvaluator:
```java
if (request.getServletPath().startsWith("/api/")
    && currentUser.getMerchant().getKybStatus() != APPROVED
    && !KYB_EXEMPT_PATHS.contains(request.getServletPath())) {
  throw new ForbiddenException("kyb_required");
}
```

`KYB_EXEMPT_PATHS`: `/api/auth/*`, `/api/account/me`, `/api/kyb/*` (para que pueda submit).

Defense in depth: ningún cobro/retiro es posible si KYB no está APPROVED, incluso si hay un bug en RBAC.

---

## 9. Back-office Zwap admin

### Separación física

- **Tabla aparte**: `zwap_admins(id, email, password_hash, full_name, role, mfa_enabled, ...)` — no comparte con `users`
- **Subdomain o ruta**: idealmente `admin.zwap.app` (separación cookie scope) o ruta protegida `/admin/*` con check de `JWT.scope = zwap_admin`
- **Pool de DB separado**: conexión con rol Postgres `zwap_admin_role` que tiene `BYPASSRLS` para queries cross-tenant (KYB review necesita ver datos de cualquier merchant)
- **MFA obligatorio** desde día 1 para todo zwap admin

### Roles internos

| Role | Permisos |
|---|---|
| ZWAP_SUPERADMIN | Todo + manage zwap admins |
| ZWAP_COMPLIANCE | KYB review, suspend merchant |
| ZWAP_SUPPORT | Read-only across tenants, ver transactions, contactar merchant |
| ZWAP_FINANCE | Settlements oversight, manual payouts, refunds excepcionales |

Tabla `zwap_admin_roles(zwap_admin_id, role)` simple (no branch scoping aquí).

### Endpoints admin

```
POST   /admin/api/auth/login              # login Zwap admin (MFA enforced)
GET    /admin/api/kyb/applications        # filterable: status, submitted_at
GET    /admin/api/kyb/applications/{id}
POST   /admin/api/kyb/applications/{id}/approve
POST   /admin/api/kyb/applications/{id}/reject
POST   /admin/api/kyb/applications/{id}/request-info
GET    /admin/api/kyb/applications/{id}/documents/{docId}/download   # signed URL
GET    /admin/api/merchants               # search, filter
GET    /admin/api/merchants/{id}
POST   /admin/api/merchants/{id}/suspend
POST   /admin/api/transactions/{id}/manual-resolve
GET    /admin/api/audit                   # filter by actor, target, event
```

### Frontend admin

Idealmente: app Nuxt separada en repo distinto (`zwap-admin-prism`) con su propio CLAUDE.md. Comparte design system con frontend principal vía package npm interno o copy-paste tactical inicialmente.

---

## 10. Payment orchestration

### Provider abstraction

```java
public interface PaymentProvider {
  ProviderId id();                                // STRIPE_DIRECT, STRIPE_CONNECT, VPAY
  Set<Currency> supportedCurrencies();
  Set<Channel> supportedChannels();               // CARD, QR_BO, BANK_TRANSFER
  ChargeResult charge(ChargeCommand cmd);         // idempotent on cmd.idempotencyKey
  RefundResult refund(RefundCommand cmd);
  WebhookEvent verifyAndParseWebhook(byte[] body, Map<String,String> headers);
  ProviderHealth health();                        // circuit breaker input
}
```

Implementaciones en `providers/`:
- `StripeDirectProvider` — usa cuenta Stripe principal de Zwap (Zwap es merchant of record)
- `StripeConnectProvider` — usa Stripe Connect Express del merchant (merchant es el of record)
- `VPayProvider` — VPay Bolivia para BOB

### Routing engine

```sql
routing_rules (
  id UUID PK,
  merchant_id UUID NULL,                          -- NULL = global default rule
  priority INT NOT NULL,                          -- lower = first
  match_currency TEXT,                            -- NULL = wildcard
  match_country TEXT,
  match_channel TEXT,
  match_amount_min NUMERIC, match_amount_max NUMERIC,
  provider_id TEXT NOT NULL,                      -- STRIPE_DIRECT|STRIPE_CONNECT|VPAY
  fallback_provider_ids TEXT[],
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

`PaymentRouter.route(ChargeContext)` evalúa rules ordenadas por (merchant_id NOT NULL primero, priority asc), retorna primer match con su fallback chain.

### Idempotency (no negociable)

Todo `POST /api/payments/charge`, `POST /api/payments/refund`, `POST /api/wallet/withdrawals` requiere header `Idempotency-Key: <uuid>`. Sin él → 400.

```sql
idempotency_keys (
  key TEXT PRIMARY KEY,
  request_hash TEXT NOT NULL,                     -- SHA256(method + path + body)
  response_status INT,
  response_body JSONB,
  status TEXT NOT NULL,                           -- IN_PROGRESS | COMPLETED
  created_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL                 -- 24h
);
```

Filter Spring (orden ANTES de auth filter no, después):
1. Si key existe + hash matches + status COMPLETED → return cached response
2. Si key existe + hash distinto → 422 `idempotency_conflict`
3. Si key existe + status IN_PROGRESS → 409 `processing` (cliente debe retry con backoff)
4. Si no existe → INSERT (key, hash, IN_PROGRESS), procesar, UPDATE con response

### Outbox pattern (eventos garantizados)

En la **misma DB transaction** que el cambio de estado del aggregate:

```sql
outbox (
  id UUID PK,
  aggregate_type TEXT NOT NULL,                   -- transaction | payout | withdrawal | ...
  aggregate_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  attempts INT NOT NULL DEFAULT 0,
  next_attempt_at TIMESTAMPTZ
);
CREATE INDEX outbox_pending ON outbox(next_attempt_at) WHERE sent_at IS NULL;
```

Worker `@Scheduled(fixedDelay=1000)` (o virtual thread loop): SELECT pending, publica a destino (webhook merchant, email, audit, ledger), marca sent_at. Si falla, `attempts++` + exponential backoff (`next_attempt_at`).

Esto garantiza que **un evento NUNCA se pierde** aunque la app crashee tras commitear el estado.

### Webhook ingestion (provider → Zwap)

```
1. POST /webhooks/{provider} ← Stripe / VPay
2. Verify signature (provider-specific) — sin esto, vulnerable a forge
3. INSERT INTO webhook_events (provider, provider_event_id, payload, received_at, processed_at NULL)
   — UNIQUE (provider, provider_event_id) garantiza idempotencia natural
4. Return 200 INMEDIATAMENTE (Stripe retry si ve >5s)
5. Worker async procesa: actualiza Transaction state, dispara eventos a outbox
```

Manejo de duplicados: si el INSERT falla por unique violation → ya procesado, return 200.

### Reconciliation (verdad cruzada, daily)

`@Scheduled(cron="0 0 4 * * *")` (4 AM):

Por cada provider activo:
1. Fetch transactions del día anterior via API del provider
2. Compare contra `transactions` table del lado Zwap (filtered by `provider_transaction_id`)
3. Discrepancias a `reconciliation_alerts(provider, type, severity, payload, resolved_at)`:
   - `MISSING_LOCAL` — provider tiene, Zwap no (webhook perdido)
   - `MISSING_REMOTE` — Zwap tiene, provider no (estado huérfano)
   - `AMOUNT_MISMATCH`
   - `STATUS_MISMATCH`
4. Compliance officer review en back-office; auto-resolve algunos casos triviales

---

## 11. Stripe Connect Express

### Modelo de provider accounts

```sql
provider_accounts (
  id UUID PK,
  merchant_id UUID NOT NULL REFERENCES merchants(id),
  provider_id TEXT NOT NULL,                      -- STRIPE_DIRECT|STRIPE_CONNECT|VPAY
  account_type TEXT NOT NULL,                     -- DIRECT | CONNECTED_EXPRESS | DIRECT_INTEGRATION
  external_account_id TEXT,                       -- Stripe account ID (acct_xxx) o VPay ID
  external_metadata JSONB,
  status TEXT NOT NULL,                           -- PENDING | ACTIVE | RESTRICTED | DISABLED
  charges_enabled BOOLEAN NOT NULL DEFAULT false,
  payouts_enabled BOOLEAN NOT NULL DEFAULT false,
  onboarding_started_at TIMESTAMPTZ,
  onboarding_completed_at TIMESTAMPTZ,
  capabilities JSONB,                             -- card_payments, transfers, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Flow de onboarding Connect Express

1. Merchant approved en KYB de Zwap → puede activar Connect Express
2. Backend: `stripe.accounts.create(type="express", country="BO" o destination, capabilities=["card_payments","transfers"])` → guarda `acct_xxx`
3. Backend: `stripe.accountLinks.create(account=acct, type="account_onboarding", refresh_url, return_url)` → URL temporal
4. Frontend redirige al merchant a esa URL (Stripe-hosted onboarding embedded)
5. Merchant completa KYC con Stripe (Stripe pide su info bancaria, ID, etc.)
6. Stripe redirect a `return_url`
7. Backend: webhook `account.updated` actualiza `charges_enabled` / `payouts_enabled`
8. Cuando ambos true → merchant puede cobrar via su Connect Express

### Charge via Connect Express

```java
PaymentIntent intent = PaymentIntent.create(PaymentIntentCreateParams.builder()
  .setAmount(amountInCents)
  .setCurrency(currency.toLowerCase())
  .setApplicationFeeAmount(zwapFeeInCents)        // comisión Zwap
  .setTransferData(TransferData.builder()
    .setDestination(merchantConnectAccountId)     // acct_xxx
    .build())
  .setIdempotencyKey(idempotencyKey)
  .build());
```

El dinero va al merchant (su Stripe Connect), Zwap retiene `application_fee` automáticamente.

### Settlements differ por account_type

- **DIRECT**: Zwap recibe el dinero en su cuenta bancaria, hace payout manual al merchant según schedule (settlements module calcula y agenda)
- **CONNECTED_EXPRESS**: Stripe hace payout directo al merchant a su cuenta bancaria; Zwap solo cobró la `application_fee`. El módulo `settlements` reporta lo que Stripe ya pagó (read-only de Stripe API).

---

## 12. Ledger (double-entry)

Cada movimiento financiero genera N entradas balanceadas (sum debits = sum credits).

```sql
ledger_accounts (
  id UUID PK,
  merchant_id UUID,                               -- NULL para cuentas Zwap (fees, system)
  type TEXT NOT NULL,                             -- ASSET|LIABILITY|EQUITY|REVENUE|EXPENSE
  code TEXT NOT NULL,                             -- e.g., "merchant.balance", "zwap.fees", "stripe.in_transit"
  currency TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  UNIQUE (merchant_id, code, currency)
);

ledger_entries (
  id UUID PK,
  account_id UUID NOT NULL REFERENCES ledger_accounts(id),
  transaction_id UUID NOT NULL,                   -- ledger transaction (NOT payment)
  direction TEXT NOT NULL,                        -- DEBIT|CREDIT
  amount NUMERIC(20,4) NOT NULL,                  -- siempre positivo; direction da el signo
  currency TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  metadata JSONB
);

ledger_transactions (
  id UUID PK,
  description TEXT,
  source_event_id UUID,                           -- payment_intent_succeeded, refund_created, etc.
  posted_at TIMESTAMPTZ NOT NULL
);

-- Constraint crítico: cada ledger_transaction debe tener entries balanceadas
-- Verificado por trigger o test de integridad nightly
```

### Ejemplo: cobro $100 USD via Stripe Direct con fee 2.9%+30¢

Generates 4 entries:
```
DR  stripe.in_transit       100.00 USD
CR  merchant.balance         97.10 USD       (lo que recibe el merchant)
CR  zwap.fees                 2.90 USD       (comisión Zwap)
                             ─────
                             100.00 = 100.00 ✓
```

Wait, esto no balancea: 100 = 97.10 + 2.90. Sí balancea (DR 100 = CR 97.10 + 2.90). 

### Por qué importa

Sin ledger:
- "¿De dónde salen los $11,694 del wallet?" — no hay respuesta auditable
- Refunds se vuelven cálculos ad-hoc
- Reconciliation con Stripe es inferir
- Reportes contables son imposibles
- Auditoría externa rechaza el sistema

`wallet.balance` es **una vista** del ledger: `SUM(credits) - SUM(debits)` sobre la cuenta `merchant.balance`.

---

## 13. Audit log

Append-only, never deleted. Recibe eventos de TODOS los módulos via outbox.

```sql
audit_events (
  id UUID PK,
  occurred_at TIMESTAMPTZ NOT NULL,
  actor_type TEXT NOT NULL,                       -- USER|ZWAP_ADMIN|SYSTEM|PROVIDER_WEBHOOK
  actor_id UUID,
  merchant_id UUID,                               -- target tenant (NULL si cross-tenant)
  resource_type TEXT NOT NULL,                    -- USER|MERCHANT|KYB|TRANSACTION|...
  resource_id UUID,
  action TEXT NOT NULL,                           -- CREATED|UPDATED|DELETED|APPROVED|...
  before_state JSONB,
  after_state JSONB,
  ip INET,
  user_agent TEXT,
  request_id TEXT
);
CREATE INDEX audit_events_resource ON audit_events(resource_type, resource_id, occurred_at DESC);
CREATE INDEX audit_events_actor ON audit_events(actor_type, actor_id, occurred_at DESC);
```

### Eventos críticos a registrar (no negociable)

- KYB transitions (submit, approve, reject, request_info, suspend)
- User invites, role changes, password resets
- Withdrawals initiated/approved
- Refunds
- Bank account changes
- Settings changes (pricing, branches)
- Login attempts (success + fail), MFA enable/disable
- Zwap admin actions cross-tenant

### Retention

Mínimo 7 años (compliance financiera). Particionado mensual + archive a S3 cold storage después del año 2.

---

## 14. Money, FX, async jobs

### Money type

```java
public record Money(BigDecimal amount, Currency currency) {
  public Money {
    Objects.requireNonNull(amount); Objects.requireNonNull(currency);
    if (amount.scale() > currency.getDefaultFractionDigits())
      throw new IllegalArgumentException("scale exceeds currency precision");
  }
  public Money add(Money other) { ... }   // throws if currencies differ
  public Money subtract(Money other) { ... }
  public Money applyFee(BigDecimal pct) { ... }
}
```

NUNCA `double`. NUNCA `float`. JPA AttributeConverter para persistir como `(amount NUMERIC(20,4), currency TEXT)`.

### FX rates

```sql
fx_rates (
  id UUID PK,
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL,
  rate NUMERIC(20,10) NOT NULL,
  source TEXT NOT NULL,                           -- ECB|BCB|STRIPE|MANUAL
  effective_at TIMESTAMPTZ NOT NULL,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (from_currency, to_currency, effective_at, source)
);
```

Cada transaction en moneda distinta a la de settlement guarda `fx_rate_id` snapshot — auditable.

### Async strategy (sin Kafka, sin Rabbit)

| Concern | Tooling |
|---|---|
| Fire-and-forget no crítico | Spring `@Async` + `ThreadPoolTaskExecutor` (virtual threads) |
| Eventos críticos garantizados | Outbox table + worker `@Scheduled` (1s) |
| Jobs periódicos | `@Scheduled` (cron / fixedDelay) |
| Retries con backoff | Spring Retry + `RetryableTask` o columna `next_attempt_at` en outbox |

Para migración futura a Kafka cuando escale: Spring Modulith permite `@Externalized` events con un cambio de configuración — outbox sigue funcionando, cambia el destino.

---

## 15. Estructura del repo

```
zwap-backend/
├── docker-compose.yml                             # postgres + minio + mailhog
├── Dockerfile                                     # multi-stage
├── pom.xml
├── .github/workflows/ci.yml
├── README.md
├── docs/
│   ├── adr/                                      # Architecture Decision Records
│   ├── api-contract.md
│   └── runbook.md                                # incident response
├── ops/
│   ├── postgres-backup.sh
│   └── postgres-restore.sh
├── src/main/java/com/zwap/
│   ├── ZwapApplication.java
│   ├── auth/                                     # @ApplicationModule
│   │   ├── api/   ├── domain/   ├── infra/   └── web/
│   ├── kyb/
│   ├── merchants/
│   ├── iam/
│   ├── payments/
│   ├── links/
│   ├── wallet/
│   ├── settlements/
│   ├── providers/
│   │   ├── stripe/
│   │   └── vpay/
│   ├── orchestrator/
│   ├── ledger/
│   ├── audit/
│   ├── admin/
│   ├── analytics/
│   ├── notifications/
│   └── shared/
│       ├── config/                               # SecurityConfig, OpenApiConfig, CorsConfig, RlsConfig
│       ├── error/
│       ├── money/                                # Money, Currency, FxConverter
│       ├── tenant/                               # TenantFilter, RlsConnectionInterceptor
│       └── idempotency/
├── src/main/resources/
│   ├── application.yml
│   ├── application-local.yml
│   ├── application-prod.yml
│   └── db/migration/
│       ├── V1__core.sql
│       ├── V2__iam.sql
│       ├── V3__kyb.sql
│       ├── V4__providers.sql
│       ├── V5__ledger.sql
│       ├── V6__transactions_links.sql
│       ├── V7__audit_outbox.sql
│       └── V8__rls_policies.sql
└── src/test/java/com/zwap/
    ├── ArchitectureTest.java
    ├── support/
    │   ├── PostgresTestContainer.java
    │   └── TenantTestSupport.java
    └── <module>/...
```

---

## 16. Schema inicial (migrations)

Diseño de 8 migrations iniciales. Detalle parcial (full SQL al ejecutar bootstrap):

| Migration | Tablas |
|---|---|
| `V1__core.sql` | `merchants`, `branches`, `users`, `auth_sessions`, `auth_password_resets`, `auth_mfa` |
| `V2__iam.sql` | `permissions`, `roles`, `role_permissions`, `user_roles` + seed system roles + system permissions |
| `V3__kyb.sql` | `kyb_applications`, `kyb_documents`, `kyb_review_events` |
| `V4__providers.sql` | `provider_accounts`, `routing_rules`, `webhook_events` |
| `V5__ledger.sql` | `ledger_accounts`, `ledger_transactions`, `ledger_entries`, `fx_rates` + balance check trigger |
| `V6__transactions_links.sql` | `transactions`, `refunds`, `payment_links`, `wallet_withdrawals`, `bank_accounts`, `payouts`, `settlements` |
| `V7__audit_outbox.sql` | `audit_events`, `outbox`, `idempotency_keys`, `reconciliation_alerts` |
| `V8__rls_policies.sql` | RLS policies en todas las tablas con `merchant_id`, rol Postgres `app_tenant` y `app_admin` |

Tabla aparte para back-office: `V9__zwap_admin.sql` con `zwap_admins`, `zwap_admin_roles`, `zwap_admin_sessions`.

---

## 17. Bootstrap paso a paso

### Paso 1 — repo + scaffold

```bash
mkdir -p ~/Developer/zwap-backend && cd ~/Developer/zwap-backend
git init

# Generar via start.spring.io
curl https://start.spring.io/starter.zip \
  -d type=maven-project -d language=java -d bootVersion=3.3.5 -d javaVersion=21 \
  -d groupId=com.zwap -d artifactId=zwap-backend \
  -d name=zwap-backend -d packageName=com.zwap \
  -d dependencies=web,data-jpa,security,validation,postgresql,flyway,actuator,modulith,docker-compose \
  -o starter.zip
unzip starter.zip && rm starter.zip
```

Agregar a `pom.xml`:
- `org.springdoc:springdoc-openapi-starter-webmvc-ui:2.6.0`
- `io.jsonwebtoken:jjwt-api:0.12.6` + impl + jackson runtime
- `com.stripe:stripe-java:28.0.0`
- `io.minio:minio:8.5.12`
- `net.logstash.logback:logstash-logback-encoder:8.0`
- `org.testcontainers:postgresql:1.20.3`, `minio:1.20.3` (test scope)
- `com.github.f4b6a3:uuid-creator:6.0.0` (UUIDv7 ordenable)

### Paso 2 — `docker-compose.yml`

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: zwap
      POSTGRES_USER: zwap
      POSTGRES_PASSWORD: zwap_dev
    ports: ["5432:5432"]
    volumes: [pg-data:/var/lib/postgresql/data]
    healthcheck:
      test: ["CMD","pg_isready","-U","zwap"]
      interval: 5s

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: zwap
      MINIO_ROOT_PASSWORD: zwap_dev_minio
    ports: ["9000:9000","9001:9001"]
    volumes: [minio-data:/data]

  mailhog:
    image: mailhog/mailhog:latest
    ports: ["1025:1025","8025:8025"]

volumes:
  pg-data:
  minio-data:
```

### Paso 3 — `application-local.yml`

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/zwap
    username: zwap
    password: zwap_dev
  jpa:
    hibernate.ddl-auto: validate
    properties:
      hibernate.session_factory.statement_inspector: com.zwap.shared.tenant.TenantStatementInspector
  flyway.enabled: true
  threads.virtual.enabled: true

app:
  jwt:
    secret: ${JWT_SECRET:dev-only-32-chars-minimum-aaaaaaaa}
    access-ttl: PT15M
    refresh-ttl: P30D
  cors.allowed-origins: http://localhost:3000
  storage.s3:
    endpoint: http://localhost:9000
    bucket: zwap-kyb-docs
    access-key: zwap
    secret-key: zwap_dev_minio
  providers:
    stripe:
      secret-key: ${STRIPE_SECRET:sk_test_...}
      webhook-secret: ${STRIPE_WEBHOOK_SECRET:whsec_...}
    vpay:
      base-url: https://sandbox.vpay.bo
      api-key: ${VPAY_API_KEY:}
      webhook-secret: ${VPAY_WEBHOOK_SECRET:}

springdoc:
  api-docs.path: /v3/api-docs
  swagger-ui.path: /swagger-ui.html
```

### Paso 4 — primera migration y seed

`V1__core.sql` + `V2__iam.sql` con `INSERT INTO permissions ...` y `INSERT INTO roles ...` para los roles del sistema. Las matrices del § 7 se materializan aquí.

### Paso 5 — Architecture test

```java
@AnalyzeClasses(packages = "com.zwap")
class ArchitectureTest {
  @Test void modulesRespectBoundaries() {
    ApplicationModules.of(ZwapApplication.class).verify();
  }
}
```

### Paso 6 — arrancar

```bash
docker compose up -d postgres minio mailhog
SPRING_PROFILES_ACTIVE=local ./mvnw spring-boot:run
# Swagger: http://localhost:8080/swagger-ui.html
# MinIO console: http://localhost:9001
```

---

## 18. Coolify + Lightsail + backups

### Topología prod

```
┌──────────────────────────────────────────┐
│ AWS Lightsail (Coolify)                  │
│  ├─ traefik (TLS via Let's Encrypt)      │
│  ├─ zwap-backend (1 instance)            │
│  ├─ postgres-16                          │
│  └─ minio                                │
└──────────────────────────────────────────┘
           ↓ daily 03:00 UTC
┌──────────────────────────────────────────┐
│ AWS S3 (off-site, cross-region)          │
│  ├─ zwap-pg-backups/   (30 days hot)     │
│  └─ zwap-minio-mirror/ (continuous sync) │
└──────────────────────────────────────────┘
```

### Backup obligatorio (Postgres self-hosted)

**Sin esto, un disk crash de Lightsail = pérdida total de datos financieros. Innegociable.**

`ops/postgres-backup.sh` (ejecutado via Coolify scheduled task o cron en host):

```bash
#!/bin/bash
set -euo pipefail
TS=$(date -u +%Y%m%d-%H%M%S)
PGPASSWORD=$POSTGRES_PASSWORD pg_dump -h localhost -U zwap -d zwap -F c \
  | gzip > /tmp/zwap-${TS}.dump.gz
aws s3 cp /tmp/zwap-${TS}.dump.gz s3://zwap-pg-backups/daily/zwap-${TS}.dump.gz \
  --storage-class STANDARD_IA
rm /tmp/zwap-${TS}.dump.gz
# Lifecycle rule en S3: hot 30 días → Glacier 1 año → delete año 7
```

Frecuencia mínima:
- **Daily full dump** → S3 STANDARD_IA, lifecycle a Glacier
- **Hourly WAL archive** (opcional) → S3 STANDARD para PITR (point-in-time recovery)

### Restore drill mensual

`ops/postgres-restore.sh` debe ejecutarse en staging desde un dump de S3 al menos 1 vez/mes. **Backups no probados = backups inexistentes**.

Documentar RPO/RTO esperados:
- RPO (max data loss): 24h con backup daily, 1h con WAL archiving
- RTO (max downtime to recover): 30 min en staging restore drill, ~2h en prod (descarga de S3 + restore + validación)

### MinIO backup

`mc mirror` continuo a S3 bucket separado. Documentos KYB son menos volátiles pero pierden = compliance breach.

### Secrets

- Coolify env vars (encrypted at-rest) para JWT_SECRET, STRIPE_SECRET, VPAY_API_KEY, AWS_ACCESS_KEY (para backups)
- NUNCA en `application.yml` commiteado
- Rotation: JWT_SECRET cada 90 días (con rolling deployment para no invalidar todas las sesiones)

### Recursos Lightsail

Recomendación mínima: **4 GB RAM / 2 vCPU / 80 GB SSD** ($24/mes). Distribución:
- Postgres: 1.5 GB shared_buffers, ~2 GB total con conexiones
- Backend: 1 GB heap (G1GC)
- MinIO: ~256 MB
- Traefik + sistema: ~512 MB

Si crece: subir a 8 GB ($48/mes) o migrar Postgres a RDS.

---

## 19. CI/CD

`.github/workflows/ci.yml`:

```yaml
name: ci
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: { java-version: '21', distribution: 'temurin', cache: 'maven' }
      - run: ./mvnw -B verify

  build-image:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker build -t ghcr.io/${{ github.repository }}:${{ github.sha }} .
      - run: echo "$GHCR_TOKEN" | docker login ghcr.io -u ${{ github.actor }} --password-stdin
        env: { GHCR_TOKEN: ${{ secrets.GITHUB_TOKEN }} }
      - run: docker push ghcr.io/${{ github.repository }}:${{ github.sha }}

  deploy:
    needs: build-image
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - run: curl -X POST "$COOLIFY_DEPLOY_WEBHOOK"
        env: { COOLIFY_DEPLOY_WEBHOOK: ${{ secrets.COOLIFY_DEPLOY_WEBHOOK }} }
```

Coolify pull la imagen + restart container con healthcheck. Zero-downtime.

---

## 20. Conexión con el frontend

Cambios pendientes en `zwap-frontend-prism` cuando backend esté en staging (no se hacen ahora):

1. **`nuxt.config.ts`** — agregar `runtimeConfig.public.apiBase` con default `http://localhost:8080`, override prod `https://api.zwap.app`
2. **Cambiar `app/middleware/auth.js`** — leer cookie `zwap_session` en vez de `zwap_token` (token es httpOnly, frontend no lo ve)
3. **Crear `app/utils/api/`**:
   - `schema.d.ts` — generado desde `/v3/api-docs` con `npx openapi-typescript`
   - `client.js` — composable `useApi()` con `$fetch` + `credentials: 'include'`
4. **Crear `app/composables/useDataSource.js`** — feature-flag mock/API por módulo
5. **Migrar vistas progresivamente** según orden:
   - merchants (branches list, profile) — read-mostly, valida shape
   - auth (login, /me) — necesario para todo lo demás
   - **kyb (gate + onboarding)** — bloquea acceso al resto si no APPROVED
   - transactions — la más rica en datos
   - links (write + revoke)
   - wallet (writes financieros — más cuidado)
   - settlements, analytics
6. **Frontend nuevo: KYB onboarding flow** — primera vez login redirige a `/kyb/onboarding` si `merchant.kyb_status != APPROVED`. Vistas: submit form + upload docs + status tracker
7. **Frontend nuevo: provider account onboarding** (Stripe Connect Express) — botón "Conectar mi Stripe" → backend genera account_link → redirect a Stripe → return → status actualizado
8. **Eliminar `app/utils/mockData.js`** cuando todas las vistas usen API

Cada paso = un PR pequeño con feature flag, rollback trivial.

---

## 21. Roadmap a microservicios + out of scope

### Cuando extraer un módulo

Spring Modulith hace el split casi mecánico. Un módulo se extrae cuando:
- Carga independiente (ej. `payments` con 100x más tráfico)
- Ownership separado (equipo distinto lo evoluciona)
- Tech requirement diferente (ej. `analytics` migra a ClickHouse)
- Compliance (ej. reducir PCI scope extrayendo solo el módulo que toca cards)

### Orden probable de extracción (cuando escale)

1. **`webhooks` ingestion** → service dedicado (alto throughput, ack rápido)
2. **`analytics`** → service con ClickHouse + Grafana
3. **`notifications`** → service con cola dedicada
4. **`providers`** → si terceros queremos plug-and-play

### Out of scope para esta sesión

- Crear el repo `zwap-backend` real (otra working directory)
- Generar `pom.xml`, `Dockerfile`, migrations SQL completas (ejecución del bootstrap)
- Modificar `nuxt.config.ts` con `runtimeConfig.apiBase`
- Crear `app/utils/api/client.js`
- Pipeline de codegen OpenAPI

### TBD que requieren tu input antes de implementar

- **Pricing model**: ¿application_fee % por trx? ¿flat? ¿tiered? Afecta `routing_rules` y `ledger_accounts`
- **VPay API contract**: ¿qué endpoints expone? ¿qué shape webhooks? Necesario para `VPayProvider` impl
- **Compliance ASFI Bolivia**: ¿qué retention/reporting requiere? Afecta audit retention + reportes regulatorios
- **PCI scope**: confirmado SAQ-A (no almacenamos card numbers, solo tokens)?
- **Schedule de payouts**: ¿daily? ¿weekly? ¿on-demand vía botón "Retirar"? Esto último es lo que muestra el frontend actual

---

## 22. Referencias

### Frontend
- `app/utils/mockData.js` — entities a modelar
- `app/middleware/auth.js:3-8` — shape exacto del cookie de sesión
- `app/utils/routes.js` — CORS allowlist
- `CLAUDE.md` — convenciones frontend
- `docs/change-protocol.md` — protocolo de cambios significativos

### Tech docs externos
- [Spring Modulith Reference](https://docs.spring.io/spring-modulith/reference/)
- [Spring Security 6 Reference](https://docs.spring.io/spring-security/reference/)
- [Stripe Connect Express](https://stripe.com/docs/connect/express-accounts)
- [Stripe Idempotency](https://stripe.com/docs/api/idempotent_requests)
- [Postgres Row-Level Security](https://www.postgresql.org/docs/16/ddl-rowsecurity.html)
- [Outbox Pattern](https://microservices.io/patterns/data/transactional-outbox.html)
- [Coolify Docs](https://coolify.io/docs)
- [start.spring.io](https://start.spring.io)
