# Pending Links — Decision Matrix

Lógica de decisión del widget **"Links de pago pendientes"** (`app/components/features/dashboard/PendingCharges.vue`).

El widget no es un reporte de métricas; es un **tablero de triage operativo** para que un recepcionista pueda responder en segundos: *"¿a quién atiendo primero y cómo?"*.

---

## Insight de producto

Las vistas de un link de pago, por sí solas, no son una métrica de engagement — son una **señal que sólo cobra sentido cruzada con el tiempo transcurrido**.

- Un link con **0 vistas enviado hace 3 minutos** es perfectamente normal.
- Un link con **0 vistas enviado hace 18 horas** es una bandera roja.
- Un link con **8 vistas sin pagar** no es "cliente súper interesado" — casi siempre es **fricción** (tarjeta rechazada, problema 3DS, indecisión profunda, etc.).

Por eso la recomendación de acción se computa como `f(views, lifeElapsedPct)` y no `f(views)`.

---

## Variables

```
lifeElapsedPct = createdMinutesAgo / (createdMinutesAgo + expiresInMinutes)
```

Normaliza: un link de 1h y uno de 48h siguen la misma curva.

| Tier de vida | Rango | Semántica |
|---|---|---|
| **Early** | `< 30%` | Recién enviado, ventana inicial |
| **Mid** | `30–70%` | Ventana normal de acción |
| **Late** | `≥ 70%` | Se acaba el tiempo |

---

## Matriz de decisión

| Views ↓ / Vida → | Early (<30%) | Mid (30–70%) | Late (≥70%) |
|---|---|---|---|
| **0 views** | ESPERAR | REENVIAR | LLAMAR |
| **1 view** | ESPERAR | ESPERAR | LLAMAR |
| **2–4 views** | INTERÉS | INTERÉS | AYUDAR |
| **5+ views** | AYUDAR | AYUDAR | AYUDAR |

### Regla dominante

Si `views ≥ 5`, la fricción domina sobre el tiempo — la acción es siempre **AYUDAR**, independientemente del tier de vida. Vistas excesivas sin conversión implican que algo bloquea al cliente (técnico o emocional), y esperar no lo va a resolver.

---

## Acciones (5 estados)

| Acción | Color | Icono | Cuándo | Recomendación |
|---|---|---|---|---|
| **ESPERAR** | gris | `Hourglass` | 0–1 views + early/mid | Todo normal, dar tiempo |
| **INTERÉS** | emerald | `Eye` | 2–4 views + no late | Lead caliente, no interrumpir |
| **REENVIAR** | amber | `RefreshCw` | 0 views + mid-life | Probablemente no llegó, intentar otro canal |
| **AYUDAR** | orange | `LifeBuoy` | 5+ views **ó** 2–4 views + late | Fricción detectada, ofrecer asistencia activa |
| **LLAMAR** | rose | `Phone` | 0–1 views + late | Tiempo crítico, contactar por teléfono |

Los colores forman una progresión natural de urgencia: **gris → verde → ámbar → naranja → rose**.

---

## Prioridad de ordenamiento

El widget ordena por `ACTIONS[action].priority` ascendente (menor = más urgente):

```
1. LLAMAR    (rose)
2. AYUDAR    (orange)
3. REENVIAR  (amber)
4. INTERÉS   (emerald)
5. ESPERAR   (gris)
```

Tiebreaker dentro del mismo tier: `expiresInMinutes` ascendente (los que vencen antes, primero).

Esto pone arriba del widget a los que requieren acción, no los que menos tiempo tienen.

---

## Por qué esto importa (vs. mostrar views crudas)

1. **Muchas vistas ≠ mejor**. Es una curva en U: 0 es malo, el sweet spot está en 2–4, y 5+ es señal de fricción.
2. **Tiempo contextualiza**. La misma cantidad de vistas significa cosas opuestas según cuándo ocurran en la vida del link.
3. **Verbos accionables > descriptores**. "Llamar" / "Ayudar" dicen al recepcionista qué hacer. "Sin ver" / "Muy visto" sólo describen.

---

## Presentación en la tabla (desktop)

El widget expone las tres variables de la decisión como columnas consecutivas para que la lógica sea legible de un vistazo:

| Columna | Contenido | Por qué |
|---|---|---|
| **Vistas** | Número crudo en mono grande, coloreado por acción | El input primario; el color ya indica veredicto sin leer el resto |
| **Tiempo** | Expira en + fecha de creación; rojo <60min, ámbar <180min | Contexto temporal — lo que decide el veredicto cuando las vistas son ambiguas |
| **Recomendación** | Ícono de la acción + verbo uppercase | El output: qué hacer |

El orden **Vistas → Tiempo → Recomendación** reproduce visualmente el orden causal: dos señales crudas a la izquierda, conclusión accionable a la derecha. El receptionista puede verificar por qué se recomendó algo sin abandonar la fila.

El color actúa como hilo: las tres columnas comparten la misma tinta por acción, así que una fila "rose" se lee de inmediato como crítica aunque se mire de reojo.

---

## Presentación mobile

En mobile no hay espacio para tres columnas. El widget se convierte en un **ticker denso** de máximo 5 items (`MAX_ITEMS_MOBILE = 5`) con dos líneas por fila:

```
Diego Paredes                                $240
[👁 6]  [⏱ 10m]
```

| Elemento | Contenido |
|---|---|
| **Línea 1** | Cliente + monto |
| **Línea 2** | Dos stat chips tintados (vistas + tiempo restante) en el color de la acción |

El verbo de recomendación **NO** aparece en la fila. El color de los chips (`bg-{color}/10 border-{color}/15 text-{color}`) codifica el veredicto implícitamente — gris pasivo → rose crítico. Los datos (números) son los héroes; el verbo vive en el modal.

### Modal de detalle (tap → `TriageDetailModal`)

Al tocar una fila se abre un modal bottom-sheet alineado a Prism UI (glass + acentos semánticos sutiles, nunca gradient sólido) con:

1. **Recomendación** en card glass tintado (`bg-{color}/8 border-{color}/20`): ícono + verbo en color de acción + línea de razón (`reasonKey` por acción).
2. **Monto + items** en fila.
3. **Inputs del triage** — vistas + "Expira en" como números grandes mono, coloreados.
4. **Fecha de creación**.
5. **Acciones rápidas** — QR en body; Copy link + Send en footer.

El modal funciona como una *explicación del triage*: muestra el veredicto con su razón, y debajo los inputs crudos que lo sustentan. El receptionista puede confiar en la recomendación o verificar por sí mismo viendo vistas y tiempo.

Las frases de razón viven en i18n bajo `dashboard.reasonEsperar/Reenviar/Llamar/Interes/Ayudar` (ES/EN).

---

## Extender o ajustar

Si modificas la matriz, mantén estas invariantes:

- Los 5 colores deben seguir un gradiente de urgencia (gris pasivo → rose crítico).
- La regla `views ≥ 5 → AYUDAR` debe preservarse — es la señal de fricción más importante.
- Los umbrales 30% / 70% son empíricos para el caso de reservas hoteleras; en otros verticals pueden cambiar.
- `priority` debe reflejar la urgencia operativa, no el "drama visual".
- Las tres columnas desktop (Vistas, Tiempo, Recomendación) deben mantenerse consecutivas y en ese orden — la legibilidad causal es parte del diseño, no cosmética.
- El modal mobile debe respetar el lenguaje Prism: glass tintado + color semántico en íconos/números, no bloques de color sólido.

Los umbrales (`< 30%`, `≥ 70%`) y los topes de filas (`MAX_ITEMS = 10`, `MAX_ITEMS_MOBILE = 5`) viven en constantes al tope de `PendingCharges.jsx`.
