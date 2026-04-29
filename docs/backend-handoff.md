# Backend Handoff — sesión nueva para `zwap-backend-prism`

Guía para iniciar la implementación del backend en una sesión Claude separada. Esta sesión (rooted en `zwap-frontend-prism`) hizo la planificación; la sesión nueva ejecuta el código.

---

## 1. Setup local (comandos exactos)

```bash
mkdir ~/Developer/zwap-backend-prism
cd ~/Developer/zwap-backend-prism
git init
claude
```

> Si tu máquina o usuario son distintos a `/home/st-lx/`, ajusta paths en el starter prompt de abajo antes de pegarlo.

---

## 2. Starter prompt

Copia y pega esto como **primer mensaje** en la sesión nueva:

```
Hola. Estoy creando el backend para Zwap, una pasarela de cobros B2B
para sector turístico receptivo en Bolivia (con expansión a LATAM).
Visión: payment orchestrator multi-provider (Stripe + VPay + futuros).

CONTEXTO Y PLAN YA EXISTENTES (léelos antes de actuar):

1. Visión / arquitectura objetivo:
   /home/st-lx/Developer/zwap-frontend-prism/docs/backend-architecture.md

2. Plan ejecutable de FASE 1 (Identity & Access — login, users,
   branches, roles con branch scoping, multi-tenancy con RLS):
   /home/st-lx/Developer/zwap-frontend-prism/docs/backend-phase-1-iam.md

3. Frontend que consumirá este backend (para entender shape de auth y
   contratos esperados):
   /home/st-lx/Developer/zwap-frontend-prism/CLAUDE.md
   /home/st-lx/Developer/zwap-frontend-prism/app/middleware/auth.js
   /home/st-lx/Developer/zwap-frontend-prism/app/utils/mockData.js

DECISIONES YA TOMADAS (no re-debatir):
- Repo separado (estoy aquí: ~/Developer/zwap-backend-prism)
- Modular monolith con Spring Modulith → split a microservicios
  más adelante cuando los límites estén probados
- Stack: Java 21 + Spring Boot 3.3.x + Postgres 16 + Flyway +
  Maven + Docker Compose + MinIO (S3-compat) + Mailhog
- Hosting prod: Coolify self-hosted en AWS Lightsail
- Multi-tenancy: Hibernate filter + Postgres RLS (defense in depth)
- Auth: JWT cookie httpOnly + zwap_session no-httpOnly flag
- Refresh token rotation con detección de reuso desde día 1
- Audit log desde día 1
- Fase 1 NO incluye: KYB, Stripe, VPay, transactions, ledger,
  withdrawals, signup público (owner via seed/CLI)
- Roles del sistema: OWNER, ADMIN, ACCOUNTANT, RECEPTIONIST con
  matriz de permisos definida en backend-phase-1-iam.md § 3 y § 7

PREFERENCIAS DE TRABAJO:
- Respondeme en español
- Antes de cualquier cambio significativo, planéalo y preséntame el
  plan; ejecuta solo después de mi visto bueno
- Commits locales primero; push solo cuando yo lo pida
- No crees el repo en GitHub (gh repo create) sin pedir confirmación
- No contamines el repo de frontend (~/Developer/zwap-frontend-prism)
  desde aquí — los docs ya están commiteados allá

PRIMERA ACCIÓN:
Lee los 3 archivos referenciados (architecture + phase-1 + CLAUDE.md
del frontend), confírmame que entendiste el scope de fase 1, y luego
proponme el orden de los 12 pasos del § 11 del phase-1 doc para que
los aprobemos antes de ejecutar el bootstrap.
```

---

## 3. Qué esperar en el turn 1 del nuevo Claude

Checklist de validación. Si el nuevo Claude se desvía, redirígelo:

- [ ] Lee `backend-architecture.md` y `backend-phase-1-iam.md`
- [ ] Lee al menos parcialmente `CLAUDE.md` y `app/middleware/auth.js` del frontend
- [ ] Confirma stack: Java 21 + Spring Boot 3.3.x + Modulith + Postgres 16 + Flyway + Maven
- [ ] Confirma scope fase 1: solo IAM (auth, users, branches, roles), NO payments
- [ ] Reproduce los 12 pasos del § 11 del phase 1 doc en orden
- [ ] **No** ejecuta nada sin tu aprobación
- [ ] **No** crea el repo en GitHub
- [ ] **No** modifica archivos en `~/Developer/zwap-frontend-prism`

Si todo lo anterior se cumple, dale luz verde para ejecutar paso 1 (bootstrap del proyecto Spring Boot).

---

## 4. Cuándo correr `/init` en la sesión nueva

Después del **primer commit del scaffold** (post paso 1 del § 11). Razón: `/init` analiza el código real y genera un `CLAUDE.md` tailored al stack del backend (Spring conventions, no Vue/Nuxt).

Flujo recomendado:
1. Bootstrap proyecto (paso 1 del § 11) → smoke test verde → primer commit local
2. `/init` → genera CLAUDE.md inicial → revisa y ajusta
3. Segundo commit con CLAUDE.md
4. Continuar con paso 2 (migrations) en adelante

---

## 5. Push policy

Mismo patrón que en este repo:
- Commits locales sin push hasta que tú lo indiques
- Cuando llegue el momento del primer push, el Claude del backend debe **preguntar antes** de:
  - `gh repo create blake-92/zwap-backend-prism --private`
  - `git remote add origin ...`
  - `git push -u origin main`
- Asumir que el repo en GitHub aún no existe

---

## 6. Cross-repo references

Los 2 docs principales (`backend-architecture.md`, `backend-phase-1-iam.md`) viven en el repo del **frontend** (`~/Developer/zwap-frontend-prism/docs/`). El backend los referencia por path absoluto.

**Cuando un doc cambie sustancialmente** (ej. fase 1 evoluciona durante la implementación):

| Opción | Tradeoff |
|---|---|
| Editar en el frontend repo y commitear allá | El backend siempre lee la versión más fresca; pero el commit "evoluciona arquitectura" queda en el repo equivocado |
| Copiar al backend repo cuando se "fija" la decisión | Cada repo es self-contained; pero hay 2 versiones que pueden divergir |
| Submodule del frontend repo en el backend | Overkill para 2 archivos; complica el git workflow |

**Recomendación**: editar en frontend repo mientras los docs son fluidos (semanas iniciales); cuando fase 1 esté implementada y validada, copiar el snapshot final a `zwap-backend-prism/docs/` como referencia histórica y los docs del frontend pasan a ser solo retrospectiva.

---

## 7. Cuándo cerrar esta sesión (frontend)

Esta sesión ya cumplió su rol (planificación). Puedes:

- **Cerrarla** completamente — los docs están commiteados, no se pierde nada
- **Dejarla abierta en background** — útil si el Claude nuevo necesita que verifiques algo en el frontend (shape de un componente, una memoria persistente, etc.) sin perder el contexto de la sesión nueva

Mi sugerencia: ciérrala. Mantener dos sesiones activas en paralelo confunde el contexto y rara vez paga el cost de RAM/atención.

Si más adelante necesitas trabajar el frontend, abres una sesión fresca aquí — el `CLAUDE.md` del repo + memoria persistente del proyecto restauran el contexto en el primer turn.
