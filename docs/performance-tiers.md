# Performance Tiers — Prism UI

Sistema de 3 niveles de degradación gradual entre dispositivos. **Identidad preservada en todos los tiers**; se degradan solo efectos decorativos con costo GPU/CPU significativo.

---

## Los 3 tiers

| Tier | Display label | Target devices |
|---|---|---|
| `full` | **Prism** | Desktop, MacBook, iPhone 13+, Pixel 7+, Galaxy S23+ |
| `normal` | **Normal** | iPhone XR-14, Galaxy A5x-A7x, Pixel 5-6, la mayoría de Androids 2020+ |
| `lite` | **Lite** | Samsung A15, Redmi Note, Androids 4GB RAM, + `prefers-reduced-motion` |

## Detección automática

`app/stores/performance.js` → `detectTier()`:

```
if prefers-reduced-motion              → 'lite'
if cores < 4 || memory < 4GB           → 'lite'
if cores < 8 || memory < 6GB           → 'normal'
if userAgent.mobile || (touch && !memory)  → 'normal'
else                                    → 'full'
```

**Nota mobile**: la detección empuja devices táctiles hacia `normal` incluso con 8 cores, porque en mobile los efectos GPU cuestan más (screen density, menor termal headroom).

## Override manual

`SettingsView` → pestaña Mi Perfil → sección Performance → SegmentControl con 3 opciones. Persiste en `localStorage['zwap-perf']`.

Si el valor almacenado es inválido (ej: `'minimal'` heredado de versión previa), se re-ejecuta `detectTier()`.

---

## Matriz completa de efectos

### Surfaces (cristal)

| Efecto | Prism | Normal | Lite |
|---|---|---|---|
| **Backdrop-blur radius** (cards) | blur-2xl 40px | 16px (CSS override) | `backdrop-filter: none` |
| **Backdrop-blur radius** (modales) | blur-3xl 64px | 24px (CSS override) | `backdrop-filter: none` |
| **Card bg opacity (dark)** | `/20` liquid | `/30` semi-opaco | `bg-[#1A1A1D]` sólido |
| **Card bg opacity (light)** | `/30` liquid | `/40` | `bg-white` sólido |
| **Modal bg opacity (dark)** | `/65` | `/80` | `bg-[#252429]` sólido |
| **Modal bg opacity (light)** | `/70` | `/80` | `bg-white` sólido |
| **backdrop-saturate en glass elevated** | `150` | — | — |
| **backdrop-saturate BottomNav** | `150` | — | — |
| **Chrome bg (Sidebar/BottomNav/Header)** dark | `bg-[#111113]/20-45` blur | idem | `bg-[#1A1A1D]` sólido |

### Shadows

| Efecto | Prism | Normal | Lite |
|---|---|---|---|
| **Modal shadow** | `0_40px_80px_rgba(...0.9)` + `inset_0_1px_0_white` (dual-source) | `0_20px_50px_rgba(...0.75)` | `shadow-2xl` |
| **Dropdown shadow** | `0_40px_80px` + inset top highlight | `0_20px_40px` | `shadow-xl` |
| **Card base shadow** | `inset top + 0_16px_32px` dual-source | `shadow-2xl` | `shadow-xl` |
| **Card hover shadow** | neon glow `0_0_30px_rgba(124,58,237,0.10)` | `shadow-2xl` plano | — (no hover-lift) |

### Neon glows (solo Prism)

| Componente | Prism | Normal/Lite |
|---|---|---|
| `Button` variant=`default` | `shadow-[0_8px_30px_rgba(124,58,237,0.4)]` | `shadow-lg` |
| `Toggle` active dark | `shadow-[0_0_12px_rgba(124,58,237,0.4)]` | sin glow |
| `Pagination` página activa dark | `shadow-[0_0_12px_rgba(124,58,237,0.3)]` | sin glow |
| `SegmentControl` pill dark | `shadow-[0_4px_15px_rgba(124,58,237,0.2)]` | `shadow-md` |
| `StatCard` icon hover | `shadow-[0_0_15px_rgba(...,0.3)]` por variante | `shadow-md` |
| `Stepper` step done/active | `shadow-[0_0_12|20px_rgba(...)]` | `shadow-md` |
| `Avatar` (`glow` prop) hover dark | `shadow-[0_0_20px_rgba(124,58,237,0.4)]` | `shadow-md` |
| `LiveFeed` emerald pulse dot | shadow `rgba(16,185,129,0.8)` | sin shadow |
| `Header` search focus (desktop + mobile) | focus glow | — |
| `Header` branch pill dark | glow | — |
| `Sidebar` wallet active | glow | — |

### Motion

| Efecto | Prism | Normal | Lite |
|---|---|---|---|
| **Spring physics** (springs motion-v) | ✓ | ✓ | ✓ |
| **Layout morphs** (QR expand) | ✓ | ✓ | ✓ |
| **Nav morphs** (Sidebar/BottomNav/Segment pill) | ✓ desliza | ✓ desliza | ❌ instant |
| **Continuous animations** (LiveFeed pulse, Stepper spin, bell wiggle) | ✓ | ✓ | ❌ |
| **Hover lift** (cards `-translate-y-1`) | ✓ | ✓ | ❌ (CSS override) |

### Prism-only premium elevations (Paquetes A+B+C)

| Efecto | Componente | Cómo |
|---|---|---|
| **Glass elevation** — rim top+left + inset 1px + dual shadow | Card, Modal, Dropdown | `getCardClasses(..., useGlassElevation=true)` |
| **Ambient halo** — blob púrpura blurreado detrás del pill activo | Sidebar, BottomNav, SegmentControl | `perfStore.useActiveHalo` + segundo `<motion.div>` con layout-id propio `*-halo` |
| **Button shimmer** — sheen lavanda cada 8s | Button variant=`default` | `.prism-button-shimmer::before` pseudo con `rgba(185,164,248,0.14)` |
| **GlassBackground parallax** — blobs drift sinusoidal | GlassBackground | `.prism-blob-a` 22s / `.prism-blob-b` 18s |
| **QR landing shimmer** — sweep one-shot al expandir | QrLightbox | `.prism-qr-shimmer` animation 900ms delay 400ms |
| **Typography features** — Inter `cv11 cv05 ss01` + Mono `calt zero` | Global | CSS `html.perf-full body { font-feature-settings: ... }` |
| **GlassBackground blob radius** | GlassBackground | 140/120px vs Normal 100/80px vs Lite 60/50px |

---

## Implementación

### Store (`app/stores/performance.js`)

```js
export const usePerformanceStore = defineStore('performance', {
  state: () => ({ tier: 'full', _hydrated: false }),
  getters: {
    // Tier checks
    isFull, isNormal, isLite,

    // GPU effects
    useBlur, useReducedBlur, useNeon, useInnerHighlight,
    useWalletGlowBubble, useGlassElevation, useActiveHalo,
    chromeSaturate,

    // Shadow level — returns 'deep' | 'medium' | 'compact'
    modalShadow,

    // Backdrop filter for modal backdrop (string of Tailwind classes)
    modalBackdropFilter,

    // Motion
    useSpring, useLayoutMorphs, useNavMorphs, useContinuousAnim,

    // Interaction
    useHoverLift, useDecorGradients,
  },
  actions: { hydrate, setTier, apply },
})
```

### CSS global (`app/assets/css/globals.css`)

```css
/* Normal — reduce radios de backdrop-blur */
html.perf-normal .backdrop-blur-3xl { backdrop-filter: blur(24px) !important; }
html.perf-normal .backdrop-blur-2xl { backdrop-filter: blur(16px) !important; }
html.perf-normal .backdrop-blur-xl  { backdrop-filter: blur(10px) !important; }

/* Lite — sin backdrop-filter ni filter:blur decorativo, sin hover-lift */
html.perf-lite *         { backdrop-filter: none !important; }
html.perf-lite .blur-*   { filter: none !important; }
html.perf-lite .hover\:-translate-y-1:hover { transform: none !important; }

/* Prism — kinetic premium + typography details */
html.perf-full .prism-button-shimmer::before { animation: prism-button-sheen 8s infinite; }
html.perf-full .prism-blob-a   { animation: prism-blob-drift-a 22s infinite; }
html.perf-full .prism-blob-b   { animation: prism-blob-drift-b 18s infinite; }
html.perf-full .prism-qr-shimmer { animation: prism-qr-shimmer 900ms 400ms 1; }
html.perf-full body { font-feature-settings: 'cv11' 1, 'cv05' 1, 'ss01' 1; }
html.perf-full .font-mono { font-feature-settings: 'calt' 1, 'zero' 1; }

/* A11y OS-level */
@media (prefers-reduced-motion: reduce) { * { animation-duration: 0.01ms !important; } }
```

---

## Cómo agregar un nuevo efecto tierizable

### 1. Efecto con costo GPU (shadow, blur, filter, gradient)

Decide en qué tier(s) existe:

```js
// stores/performance.js
useMiEfecto: (s) => s.tier === 'full',              // solo Prism
useMiEfecto: (s) => s.tier !== 'lite',              // Prism + Normal
useMiEfecto: (s) => true,                            // todos (raro)
```

En el componente:

```vue
<script setup>
import { usePerformanceStore } from '~/stores/performance'
const perfStore = usePerformanceStore()

const effectClass = computed(() =>
  perfStore.useMiEfecto
    ? 'shadow-[0_0_20px_rgba(124,58,237,0.3)]'
    : 'shadow-md'
)
</script>
```

### 2. Animación continua

```js
// stores: usar `useContinuousAnim` existente
useContinuousAnim: (s) => s.tier === 'full' || s.tier === 'normal'
```

```vue
<motion.div v-if="perfStore.useContinuousAnim" :animate="{ ... infinite }" />
<div v-else class="..." />  <!-- Versión estática -->
```

### 3. Layout-id morph

Decidir si es **navegación** (OFF en Lite) o **acción one-shot** (siempre ON):

```vue
<!-- Navegación (pill que se mueve entre tabs) -->
<motion.div :layout-id="perfStore.useNavMorphs ? 'mi-pill' : undefined" />

<!-- Acción one-shot (QR expand) -->
<motion.div layout-id="mi-expand" />
```

### 4. Glass surface nueva

Usar los helpers de `cardClasses.js`:

```vue
<div :class="getCardClasses(
  themeStore.isDarkMode,
  hoverEffect,
  perfStore.useBlur,
  perfStore.useNeon,
  perfStore.useGlassElevation
).base" />
```

---

## Trade-offs y decisiones de diseño

### ¿Por qué solo 3 tiers (no 4 como antes)?
El tier previo `minimal` se colapsó en `lite` porque la accesibilidad (`prefers-reduced-motion`) se maneja mejor a nivel CSS global que como tier separado. Esto simplifica el UI y la matriz de decisiones.

### ¿Por qué Normal conserva las bolas de fondo?
Las bolas purple son **identidad de Zwap**. Quitarlas en tiers degradados rompería la reconocibilidad visual. En lugar, reducimos su blur radius (140→100→60px) para preservar presencia reduciendo costo GPU.

### ¿Por qué los morphs de navegación se apagan solo en Lite?
Los morphs de layout ID requieren medición de DOM + cálculos por frame. Son baratos CPU-wise pero perceptualmente "pesados" — en un tier llamado "Lite" se espera respuesta inmediata. Los morphs de expand (QR) son one-shot y aportan identidad, se mantienen.

### ¿Por qué Prism tiene typography features?
OpenType font features son runtime-free (se aplican en text shaping time). El costo es solo re-layout al cambiar tier. El beneficio es que Prism se siente tipográficamente premium (single-storey 'a', open digits, slashed zero en mono) — matching competidores como Stripe Dashboard, Linear.

### ¿Por qué `backdrop-saturate` solo en Prism?
`saturate` filter compone con `blur` multiplicando el costo GPU. En mobile permanente (BottomNav) esto es caro. En Prism (flagships opt-in) el costo es aceptable y el vibración del color detrás del cristal vale el trade.

### ¿Por qué el halo del pill activo usa su propio `layout-id`?
Para que **morphe independientemente** del pill principal. Cuando el usuario cambia de tab en Sidebar, el halo se arrastra con su animación propia (22s aunque usualmente termina antes por el spring) y el pill con la suya — ambos llegando al destino sincronizados pero con trayectorias independientes que crean efecto de "luz atmosférica + pill sólido".

---

## Testing / QA

1. **Comparar los 3 tiers** abriendo Settings → Mi Perfil → Performance y cambiando rápido:
   - Prism: glass líquido + ambient halos + button sheen + blobs drifting
   - Normal: glass semi-opaco + morphs + no neon + no halos
   - Lite: surfaces sólidas + instant toggles + no animations continuas

2. **Verificar `prefers-reduced-motion`**: Chrome DevTools → Rendering → Emulate CSS media feature → `prefers-reduced-motion: reduce` → todas las animaciones CSS deben pausarse. Motion-v sigue animando (CPU-cheap, acceptable).

3. **Mobile real device test**:
   - Samsung A15 (target Lite): verificar que no hay jank al scroll o al abrir modales
   - iPhone 12 (target Normal): verificar que modales abren smooth, hover-lift funciona (N/A en touch, pero click feedback sí)
   - iPhone 14 Pro / S23 (target Prism): verificar que halo follows pill, button sheen visible pero no distracting

4. **Build size**: changes suman ~0 al bundle (todo CSS + getters existentes). Verify con `npm run build`.

---

## Archivos clave

| Archivo | Responsabilidad |
|---|---|
| `app/stores/performance.js` | Store + detectTier + getters granulares |
| `app/assets/css/globals.css` | CSS overrides por tier + keyframes Prism-only |
| `app/utils/cardClasses.js` | 3 helpers que aceptan flags de tier |
| `app/plugins/performance.client.js` | Hidratación inicial |
| `app/components/features/settings/SettingsView.vue` | UI de override manual |
| `app/components/GlassBackground.vue` | Blobs tier-aware (radius + parallax) |

## Referencias

- Memoria: `feedback_liquid_glass_prism.md` (fórmula validada de cristal premium)
- CLAUDE.md sección **Performance Tiers**
- Componentes tiered: Card, SwipeableCard, Modal, Dropdown, Button, Toggle, Pagination, StatCard, Stepper, Avatar, SegmentControl, Sidebar, BottomNav, Header, LiveFeed, QrLightbox
