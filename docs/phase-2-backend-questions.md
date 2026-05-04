# Fase 2 — Preguntas pendientes para el equipo backend

Este documento recopila los puntos del contract de fase 2 que requieren confirmación del backend antes de cerrar el plan de integración del frontend. Mientras estén abiertos, el frontend implementa con la suposición indicada en cada punto y centraliza la lectura en un único getter para que el día que se confirme la forma real, el cambio sea un único patch.

---

## 1. Shape de `activation_level` en `/api/account/me`

**Doc fase 2 §TL;DR:** "Dos niveles de activación visibles en `/api/account/me`: `activation_level=BASIC` … `activation_level=FULL` …".

**Lo que vemos en OpenAPI live (`/v3/api-docs`):**

```json
"AccountResponse": {
  "user":         { "$ref": "#/components/schemas/UserView" },
  "merchant":     { "$ref": "#/components/schemas/MerchantView" },
  "scope":        "string",
  "permissions":  ["string"]
}
"MerchantView": {
  "id":           "uuid",
  "businessName": "string"
}
```

No aparece ningún campo `activation_level` ni `activationLevel` en `AccountResponse` ni en `MerchantView`.

**Pregunta:** ¿cuál es la forma autoritativa?

- (a) **Campo en `MerchantView`** que falta en el OpenAPI por bug de anotación → `merchant.activationLevel: "NONE" | "BASIC" | "FULL"`.
- (b) **Campo top-level** en `AccountResponse` → `account.activationLevel: "NONE" | "BASIC" | "FULL"`.
- (c) **Derivado en frontend** a partir de `business_profile.profileStatus === "APPROVED"` → ¿pero qué distingue `BASIC` de `NONE`?
- (d) Otra cosa que no estamos viendo.

**Suposición de trabajo del frontend (mientras esperamos respuesta):** opción (a). El `useSessionStore` expone un getter `activationLevel` que lee `merchant?.activationLevel ?? 'NONE'`. Toda la UI gating (banner "en review", lock de cobros, badge BASIC/FULL en sidebar) consume ese único getter. Si la respuesta real es (b), cambiamos una sola línea del store.

**Acción del backend:** confirmar o corregir, y si es (a)/(b) anotar el campo en el `@Schema` correspondiente para que el OpenAPI lo refleje.

---

## 2. Polling del estado intermedio "tu cuenta está en review"

**Doc fase 2 §10:** "Estado intermedio 'tu cuenta está en review' entre el `submit` y el accept del invite."

No se especifica:
- Intervalo de polling recomendado.
- Si hay un endpoint server-sent-events / websockets como alternativa.
- Rate-limit aplicable a `GET /api/kyb/{id}` durante el polling.
- TTL de la pantalla intermedia (¿cuánto puede quedar abierta antes de que el draft expire?).

**Suposición de trabajo del frontend:**
- Poll `GET /api/kyb/{id}` cada **15s** mientras `document.visibilityState === 'visible'`.
- Back-off a **30s** después de los primeros 2 minutos.
- Stop polling si state pasa a `APPROVED | REJECTED | MORE_INFO_REQUIRED` o si la tab se oculta.
- Reanudar polling cuando la tab vuelve a estar visible (`visibilitychange`).
- Aplicar también al estado FULL en review (`/api/account/profile/business-profile`) mientras `profileStatus ∈ {SUBMITTED, IN_REVIEW}`.

**Pregunta:** ¿son intervalos razonables para el rate-limit configurado (`KYB_PUBLIC_QUERY` 60/min por IP)? 15s = 4/min, dentro del presupuesto. ¿Hay algún endpoint preferido o un long-poll soportado?

---

## 3. Activación del campo `activation_level` en login

**Doc:** el flow describe que tras `accept invite + login`, el dashboard muestra `BASIC`. Implícitamente el `LoginResponse` debe incluir el mismo campo que `/api/account/me` para que el routing post-login pueda decidir entre `/dashboard` (BASIC) y `/onboarding/start` (NONE).

**OpenAPI:** `LoginResponse = { user, merchant, scope, permissions, expiresIn }` — mismo gap que `/me`.

**Pregunta:** ¿`LoginResponse` también debería traer `activationLevel`? Si la respuesta de (1) es (a), el campo viene en `merchant.activationLevel` y queda resuelto. Si es (b), el `LoginResponse` necesita el suyo propio.

---

## 4. Heredar Person verificada — campo opcional en `KybStartResponse`

**Doc §2 multi-merchant heredado:** describe que `POST /start` puede devolver `personHeritable: true` + `personPreview` cuando el `ownerEmail` matchea un user autenticado con `Person` VERIFIED.

**OpenAPI:** confirma `personHeritable` y `personPreview` en `KybStartResponse`. ✅ No hay duda acá, solo queremos confirmar que **funciona sin auth**: `POST /start` es público (capability token), pero el lookup de "matchea user autenticado con Person VERIFIED" implica leer la sesión activa. ¿Es válido cuando el caller llega anónimo (sin `zwap_token`)? Esperamos `personHeritable: false` siempre en ese caso.

---

## 5. Errores de uploads — `kyb_missing_part` vs `kyb_file_too_large` vs validación MIME

**Doc §2:** lista los códigos de error de uploads pero no especifica si la validación de MIME ocurre antes o después del límite de tamaño. Para el copy de UX necesitamos:

- `kyb_file_too_large` (413) → "Archivo > 10 MB"
- `kyb_missing_part` (400) → "Archivo no enviado"
- ¿Hay un código separado para MIME inválido (ej. `kyb_unsupported_mime`)? El doc no lo menciona pero el frontend va a validar client-side y el backend debería tener fallback.

**Suposición:** validación MIME es client-side primaria; si llega un `application/zip` por accidente al backend, asumimos que devuelve `kyb_invalid_data` con `detail` legible.

---

## Estado y próximos pasos

| # | Pregunta | Estado | Owner backend |
|---|----------|--------|---------------|
| 1 | Shape de `activation_level` | 🔴 Bloqueante | — |
| 2 | Polling intervalo | 🟡 No bloqueante (asumimos 15s/30s) | — |
| 3 | `activation_level` en LoginResponse | 🔴 Bloqueante (ligado a #1) | — |
| 4 | `personHeritable` con caller anónimo | 🟢 Confirmación cosmética | — |
| 5 | Códigos de error de uploads | 🟢 Confirmación cosmética | — |

El frontend va a empezar a implementar Fase 1 y 2 del plan asumiendo las suposiciones de cada punto. Cuando llegue respuesta, ajustamos en una iteración chica antes de cerrar la PR.
