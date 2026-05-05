# Fase 2 — Preguntas pendientes para el equipo backend

> **Estado: cerrado.** Todas las preguntas fueron respondidas por el backend en el commit `2d829e9` del repo `zwap-backend`. Este doc queda como registro histórico de la coordinación. El frontend ya consume las decisiones acá: `useSessionStore.activationLevel` + `useSessionStore.kybState`, fixtures actualizadas, polling 15s→30s con back-off.

---

## 1. Shape de `activation_level` en `/api/account/me` ✅

**Doc fase 2 §TL;DR:** "Dos niveles de activación visibles en `/api/account/me`: `activation_level=BASIC` … `activation_level=FULL` …".

**Lo que vimos en OpenAPI live (`/v3/api-docs`) antes del patch:**

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

No aparecía ningún campo `activation_level` ni `activationLevel` en `AccountResponse` ni en `MerchantView`.

**Respuesta del backend:** opción **(a)** confirmada — el campo va dentro de `MerchantView`. El patch agregó **dos** campos:

```json
"MerchantView": {
  "id":               "uuid",
  "businessName":     "string",
  "activationLevel":  "NONE | BASIC | FULL",
  "kybState":         "DRAFT | SUBMITTED | IN_REVIEW | APPROVED | REJECTED | MORE_INFO_REQUIRED | GRANDFATHERED"
}
```

**Aplicación en el frontend:**
- `useSessionStore.activationLevel` getter lee `merchant?.activationLevel ?? 'NONE'`. Default `'NONE'` cubre el caso `scope=zwap_admin` (cross-tenant, sin merchant) y el caso defensivo de campo faltante.
- `useSessionStore.kybState` getter lee `merchant?.kybState ?? 'DRAFT'`.
- Verificado contra el seed real con curl: `owner@sal.bo` → `merchant.activationLevel="BASIC"`, `merchant.kybState="GRANDFATHERED"`.

---

## 2. Polling del estado intermedio "tu cuenta está en review" ✅

**Doc fase 2 §10:** "Estado intermedio 'tu cuenta está en review' entre el `submit` y el accept del invite."

**Suposición de trabajo:** poll cada 15s con back-off a 30s después de 2min, solo con tab visible.

**Respuesta del backend:** confirmado. Los intervalos están dentro del rate-limit `KYB_PUBLIC_QUERY = 60/min/IP` (15s = 4/min). No hay long-poll ni SSE. **Adicional:** si el draft expira (TTL 30 días) el `GET /api/kyb/{id}` devuelve `404` — la pantalla "en review" debe tratar el 404 como "tu sesión expiró, empezá de nuevo" y redirigir a `/onboarding/start`.

**Aplicación en el frontend:** `useKybApi.pollStatus()` implementa el back-off + manejo de 404 → redirect.

---

## 3. `activation_level` en `LoginResponse` ✅

**Pregunta original:** ¿`LoginResponse` también debería traer `activationLevel`? El routing post-login depende de eso.

**Respuesta del backend:** resuelto por #1. `LoginResponse.merchant` tiene la misma shape que `AccountResponse.merchant` — incluye `activationLevel` y `kybState`. Verificado con curl.

**Aplicación en el frontend:** `sessionStore.login()` ya hidrata `this.merchant = data.merchant` sin transformación, los getters funcionan idénticos sobre los datos del login y los de `/me`.

---

## 4. `personHeritable` con caller anónimo ✅

**Pregunta original:** `POST /start` es público — ¿`personHeritable` aparece cuando el caller no tiene `zwap_token`?

**Respuesta del backend:** **no**, anti-enumeration. El campo solo aparece cuando hay sesión autenticada y el `ownerEmail` matchea un user real con `Person VERIFIED`. Caller anónimo siempre recibe `personHeritable: false` (o el campo ausente).

**Aplicación en el frontend:** `useKybApi.start()` solo muestra el CTA "usar mis datos KYC actuales" si `personHeritable === true`. Cero suposiciones implícitas.

---

## 5. Códigos de error de uploads ✅

**Pregunta original:** ¿hay un código separado para MIME inválido?

**Respuesta del backend:** **no**, el catálogo es:

| Status | Code | Causa | Copy del UX |
|---|---|---|---|
| 400 | `kyb_missing_part` | Multipart sin part `file` | "Archivo no enviado" |
| 409 | `kyb_invalid_data` | MIME inválido / archivo vacío | leer `detail` ("tipo de archivo no permitido: application/zip", "archivo vacío") |
| 413 | `kyb_file_too_large` | > 10 MB | "El archivo supera 10 MB" |

El `detail` del 409 es la fuente del copy contextual. El frontend valida client-side primero (MIME + tamaño) para evitar round-trips, pero sí muestra el `detail` cuando llega.

**Aplicación en el frontend:** `KybDocumentUploader.vue` valida MIME + tamaño antes del POST; si el backend igual rechaza, el toast/inline-error renderea `error.detail` directamente.

---

## Resumen final

| # | Pregunta | Estado | Resolución |
|---|----------|--------|------------|
| 1 | Shape de `activationLevel` | ✅ | `merchant.activationLevel` (commit backend `2d829e9`) |
| 2 | Polling intervalo | ✅ | 15s→30s con back-off; 404 = draft expirado → restart |
| 3 | `activationLevel` en `LoginResponse` | ✅ | Misma shape que `/me` (resuelto por #1) |
| 4 | `personHeritable` con caller anónimo | ✅ | Solo aparece con sesión activa (anti-enumeration) |
| 5 | Códigos de error de uploads | ✅ | 400/409/413; MIME+vacío van como 409 con `detail` |

**Coordinación adicional**: si durante la integración aparecen nuevos gaps, abrir un nuevo doc `phase-2-backend-questions-v2.md` (mismo formato) en lugar de re-abrir este.
