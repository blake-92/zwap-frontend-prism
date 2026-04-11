# Prism UI — Guía de Sistema de Diseño
> **Zwap Frontend** · Stack: React 18 + Vite + Tailwind CSS 3 + Inter + JetBrains Mono  
> Modo: `darkMode: 'class'` — clase `dark` en `<html>` controlada por `ThemeContext`

---

## 1. Paleta de Colores

### 1.1 Brand (único color de acento)

| Nombre | Valor | Uso principal |
|---|---|---|
| `brand` | `#7C3AED` | Botón primario, íconos activos, toggles encendidos, auras |
| `brand-hover` | `#561BAF` | Hover del botón primario, texto acento light mode |
| `brand-light` | `#DBD3FB` | Fondos tintados en light mode, pills, badges default light |
| `brand-subtle` | `#B9A4F8` | Texto acento en dark mode, borde top del logo SVG |

El gradiente del isotipo Zwap sigue esta progresión:
```
#7C3AED → #9974F3 → #B9A4F8 → #DBD3FB
```

### 1.2 Neutrales — Dark Mode

| Nombre | Valor | Uso |
|---|---|---|
| `dark-bg` | `#111113` | Fondo absoluto de la app, inputs, cabeceras de tabla |
| `dark-surface` | `#252429` | Cards, sidebar, dropdowns, modales |
| `dark-border` | `rgba(255,255,255,0.10)` | Borde estándar de toda superficie |
| `dark-border-top` | `rgba(255,255,255,0.20)` | Borde superior (efecto luz de arriba) |
| `dark-text` | `#D8D7D9` | Texto principal |
| `dark-muted` | `#888991` | Labels, placeholders, íconos inactivos |
| `dark-dim` | `#45434A` | Estados desactivados, placeholders profundos |

### 1.3 Neutrales — Light Mode

| Nombre | Valor | Uso |
|---|---|---|
| `light-bg` | `#F4F4F6` | Fondo absoluto de la app |
| `light-surface` | `rgba(255,255,255,0.40)` | Cards |
| `light-border` | `rgba(255,255,255,1)` | Borde de cards (blanco sólido) |
| `light-text` | `#111113` | Texto principal |
| `light-muted` | `#67656E` | Labels, íconos secundarios |
| `light-dim` | `#B0AFB4` | Placeholders de inputs |

### 1.4 Colores Semánticos

Usados en badges, fondos de alerta e iconos de estado. La opacidad varía por modo.

| Estado | Color base | Dark (fondo/texto) | Light (fondo/texto) |
|---|---|---|---|
| **Success** | `emerald-500` / `#10B981` | `bg-emerald-500/15 text-emerald-500` | `bg-emerald-50 text-emerald-600` |
| **Warning** | `amber-500` / `#F59E0B` | `bg-amber-500/15 text-amber-500` | `bg-amber-50 text-amber-600` |
| **Danger** | `rose-500` / `#F43F5E` | `bg-rose-500/15 text-rose-500` | `bg-rose-50 text-rose-600` |
| **Default** | `#7C3AED` | `bg-[#7C3AED]/15 text-[#B9A4F8]` | `bg-[#DBD3FB]/60 text-[#561BAF]` |

### 1.5 Colores de Uso Específico

| Contexto | Color | Clase |
|---|---|---|
| Montos negativos / ajustes | `rose-500` | `text-rose-500` |
| Montos reembolsados | `rose-500` tachado | `text-rose-500 line-through opacity-70` |
| Fees / comisiones | `amber-500` | `text-amber-500` |
| Canal POS en gráficos | `#10B981` | – |
| Canal Links en gráficos | `#7C3AED` | – |
| Barras de gráfico | `linear-gradient(to top, #561BAF, #7C3AED)` | – |
| Mastercard en gráfico | `#10B981` | – |
| Amex en gráfico | `#F59E0B` | – |

---

## 2. Tipografía

### 2.1 Familias

```css
--font-sans: 'Inter', system-ui, -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

- **Inter** (`font-sans`): todo el UI — cuerpo, labels, botones, nav.
- **JetBrains Mono** (`font-mono`): montos de dinero, IDs de transacción, cuentas bancarias, URLs de links.

`-webkit-font-smoothing: antialiased` aplicado globalmente.

### 2.2 Escala tipográfica en uso

| Rol | Clases Tailwind | Ejemplo |
|---|---|---|
| Título de página | `text-3xl font-bold tracking-tight` | "Transacciones" |
| Título de modal | `text-2xl font-bold tracking-tight` | "Nueva Sucursal" |
| Título de card | `text-xl font-bold tracking-tight` | "Feed en Vivo" |
| Subtítulo de página | `text-sm font-medium` | "Historial de cobros..." |
| Label de sección | `text-xs font-bold tracking-widest uppercase` | "TIPO DE REEMBOLSO" |
| Cuerpo de alerta | `text-xs font-medium leading-relaxed` | Texto descriptivo |
| Cabecera de tabla | `text-[10px] uppercase font-bold tracking-widest` | "ID & Cliente" |
| Badge / pill | `text-[11px] font-bold` | "Exitoso" |
| Micro-label | `text-[10px] font-bold` | "En curso", "Principal" |
| KPI / monto grande | `text-3xl font-mono font-bold tracking-tight` | "$1,850.00" |
| Balance principal | `text-5xl font-mono font-bold tracking-tighter` | "$12,450.00" |
| Monto en tabla | `text-lg font-mono font-bold tracking-tight` | "$890.00" |
| Monto en receipt | `text-3xl font-bold tracking-tighter` | totales de ticket |
| ID de transacción | `font-mono font-bold text-sm` | "TRX-9823" |
| URL de link | `text-[11px] font-mono font-bold` | "zwap.pe/hsal/rec" |
| Hora / fecha | `font-bold text-sm` + `text-xs font-medium` | "29 Mar, 2026" |

---

## 3. Sistema de Superficies (Glass)

Toda superficie sigue la fórmula:  
**fondo semitransparente + `backdrop-blur` + borde con opacidad + borde superior más brillante**

### 3.1 Card base

```jsx
// Dark
'bg-[#252429]/30 backdrop-blur-2xl border-white/10 border-t-white/20 shadow-2xl'

// Light
'bg-white/40 backdrop-blur-2xl border-white border-t-white shadow-[0_10px_40px_rgb(0,0,0,0.05)]'

// Siempre: rounded-[24px] border transition-all duration-300 transform-gpu overflow-hidden
```

**Con `hoverEffect`:**
```jsx
// Dark hover
'hover:-translate-y-1 hover:bg-[#252429]/50 hover:shadow-[0_20px_40px_rgba(0,0,0,0.6),0_0_30px_rgba(124,58,237,0.10)]'

// Light hover
'hover:-translate-y-1 hover:bg-white/80 hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)]'
```

### 3.2 Sidebar

```jsx
// Dark
'bg-[#111113]/20 backdrop-blur-2xl border-r border-white/10'

// Light
'bg-white/40 backdrop-blur-2xl border-r border-white/80 shadow-[4px_0_30px_rgba(0,0,0,0.03)]'
```

### 3.3 Header

```jsx
// Dark
'bg-[#111113]/20 backdrop-blur-2xl border-b border-white/10'

// Light
'bg-white/30 backdrop-blur-2xl border-b border-white/80'
```

### 3.4 Modal

```jsx
// Contenedor modal
// Dark
'bg-[#252429]/80 backdrop-blur-3xl border-white/20 border-t-white/30 shadow-2xl'

// Light
'bg-white/90 backdrop-blur-3xl border-white shadow-[0_20px_60px_rgba(0,0,0,0.15)]'

// Siempre: rounded-[24px] border overflow-hidden
// Entrada: motion spring — ver sección 11.3
```

**Ancho máximo según contenido:**
- Formularios simples: `max-w-[480px]`
- Formularios medianos: `max-w-[540px]`
- Formularios anchos: `max-w-[600px]`
- Modales tipo wizard / split: `max-w-[1000px]`

### 3.5 Modal Backdrop

```jsx
// Dark
'absolute inset-0 backdrop-blur-md backdrop-saturate-200 bg-black/70'

// Light
'absolute inset-0 backdrop-blur-md backdrop-saturate-200 bg-[#111113]/40'
```

### 3.6 Dropdown / Popover

```jsx
// Dark
'bg-[#252429]/95 backdrop-blur-3xl border-white/20 shadow-[0_40px_80px_rgba(0,0,0,0.9)]'

// Light
'bg-white/95 backdrop-blur-xl border-gray-200 shadow-[0_40px_80px_rgba(0,0,0,0.15)]'

// Siempre: rounded-2xl border overflow-hidden
// Entrada: motion spring — ver sección 11.4
```

### 3.7 Mini Calendar (popover flotante)

```jsx
// Dark
'bg-[#111113] border-white/20 shadow-[0_30px_60px_rgba(0,0,0,0.5)]'

// Light
'bg-white border-gray-200 shadow-xl'

// Siempre: rounded-2xl z-50 animate-scale-in
```

### 3.8 Toolbar (barra de búsqueda/filtros)

```jsx
// Dark
'bg-[#252429]/20 backdrop-blur-xl border-white/10'

// Light
'bg-white/40 backdrop-blur-xl border-white shadow-sm'

// Siempre: p-2 rounded-2xl border flex justify-between items-center
```

**Input de búsqueda dentro del toolbar:**
```jsx
// Dark
'bg-[#111113]/50 border border-white/5 focus-within:border-[#7C3AED]/40'

// Light
'bg-white/60 border border-white focus-within:border-[#7C3AED]/30'

// Siempre: flex items-center px-4 py-2 rounded-xl w-72 transition-all
```

### 3.9 Card con gradiente de fondo (QuickLinkCard, panel derecho de NewLinkModal)

```jsx
// Dark
'bg-gradient-to-b from-[#7C3AED]/5 to-transparent'

// Light
'bg-gradient-to-b from-[#DBD3FB]/20 to-transparent'
```

### 3.10 Footer de modal (área de acciones)

```jsx
// Dark
'bg-[#111113]/40 border-white/10'

// Light
'bg-gray-50/50 border-black/5'

// Siempre: px-8 py-6 flex gap-4 border-t
```

---

## 4. Border Radius

| Elemento | Clase |
|---|---|
| Cards, modales, wallet card, sucursal card | `rounded-[24px]` |
| Nav items activos, items de dropdown | `rounded-xl` |
| Botones, inputs, badges de sección | `rounded-xl` |
| Dropdowns, alertas dentro de card | `rounded-2xl` |
| Mini calendar, summary card | `rounded-2xl` |
| Icon containers (KPI, sidebar wallet) | `rounded-[24px]` |
| Icon containers (tabla, stepper) | `rounded-xl` o `rounded-2xl` |
| Avatar iniciales | `rounded-full` |
| Toggle switch | `rounded-full` |
| Tab switcher activo | `rounded-lg` |
| QR overlay | `rounded-2xl` |
| Receipt ticket | `rounded-t-xl` (solo arriba) |
| Barras de gráfico | `rounded-md` (contenedor) / `rounded-sm` (barra) |
| Botones flotantes del receipt | `rounded-full` |
| Días del calendario | `rounded-md` |

---

## 5. Sistema de Sombras

```jsx
// Card base dark
'shadow-2xl'

// Card hover dark
'shadow-[0_20px_40px_rgba(0,0,0,0.6),0_0_30px_rgba(124,58,237,0.10)]'

// Card hover light
'shadow-[0_15px_40px_rgba(0,0,0,0.08)]'

// Botón primario dark
'shadow-[0_8px_30px_rgba(124,58,237,0.4)]'

// Botón primario light
'shadow-[0_8px_25px_rgba(124,58,237,0.3)]'

// Glow del toggle encendido
'shadow-[0_0_12px_rgba(124,58,237,0.4)]'

// Glow del avatar activo (hover en tabla)
'shadow-[0_0_20px_rgba(124,58,237,0.4)]'

// Glow icono success en stepper
'shadow-[0_0_14px_rgba(16,185,129,0.4)]'

// Glow icono brand en stepper
'shadow-[0_0_14px_rgba(124,58,237,0.4)]'

// Glow live dot
'shadow-[0_0_8px_rgba(16,185,129,0.8)]'

// Glow notificación dark
'shadow-[0_0_10px_rgba(124,58,237,0.9)]'

// Glow notificación light
'shadow-[0_0_10px_rgba(239,68,68,0.6)]'

// Glow blob de wallet sidebar dark
'shadow-[0_0_20px_rgba(124,58,237,0.15)]'

// Modal grande dark
'shadow-[0_40px_100px_rgba(0,0,0,0.9)]'

// Botón print del receipt
'shadow-[0_0_30px_rgba(124,58,237,0.5)]'

// Botón de devolución (rose)
'shadow-[0_8px_25px_rgba(244,63,94,0.3)]'

// Pulse glow animado
// 0%,100%: box-shadow: 0 0 8px rgba(124,58,237,0.40)
// 50%:     box-shadow: 0 0 20px rgba(124,58,237,0.80)
```

---

## 6. Componentes UI — Referencia

### Contenedores y Estructura

#### 6.1 `<Card>`

**Props:** `hoverEffect`, `className`, `onClick`, `style`

- Base: glass surface con `rounded-[24px]` (ver sección 3.1)
- `hoverEffect`: `-translate-y-1` + sombra con glow morado

#### 6.2 `<CardHeader>`

**Props:** `title` (node), `description` (string), `className`, `children` (acciones derecha)

- Línea divisoria inferior. Jerarquía visual entre título (`font-bold`) y subtítulo (muted)

#### 6.3 `<PageHeader>`

**Props:** `title`, `description`, `className`, `children` (nodo de acción)

- Renderiza `<h1>` con `text-3xl font-bold tracking-tight`

#### 6.4 `<SectionLabel>`

**Props:** `children`, `className`

- `text-xs uppercase tracking-widest font-bold` en color muted — no roba atención al contenido

#### 6.5 `<Modal>`

**Props:** `onClose`, `title`, `description`, `icon`, `maxWidth`, `footer`, `className`, `children`

- Glass con `backdrop-blur-3xl` (ver sección 3.4)
- Entrada con spring (ver sección 11.3)
- Anchos estándar: `max-w-[480px]` simple · `max-w-[540px]` mediano · `max-w-[600px]` ancho · `max-w-[1000px]` wizard

### Entradas de Usuario

#### 6.6 `<Button>`

**Props:** `variant`, `size`, `disabled`, `onClick`, `type`

> Implementado como `motion.button` — `whileTap={{ scale: 0.94 }}` automático. Ver sección 11.2.

| Variant | Uso |
|---|---|
| `default` | Acción principal — morado sólido con glow |
| `outline` | Acciones secundarias — glass translúcido con borde |
| `ghost` | Nav, íconos de acción — sin fondo, tint en hover |
| `action` | Botones de fila en tabla — tint morado suave |
| `danger` | Eliminar, devolución — neutro → rose en hover |
| `successExport` | Exportar — neutro → emerald en hover |

| Size | Padding | Texto |
|---|---|---|
| `default` | `px-5 py-2.5` | `text-sm` |
| `sm` | `px-4 py-2` | `text-xs` |
| `lg` | `px-6 py-3` | `text-base` |
| `icon` | `p-2 w-9 h-9` | – |

**Override de colores** (caso devolución):
```jsx
<Button className="!bg-rose-500 hover:!bg-rose-600 !border-rose-400 !shadow-[0_8px_25px_rgba(244,63,94,0.3)]">
  Procesar Devolución
</Button>
```

#### 6.7 `<Input>`

**Props:** `icon` (Lucide), más props nativos de `<input>`

- Con ícono: `pl-11`; sin ícono: `px-4`
- Dark focus: borde morado + `shadow-[0_0_15px_rgba(124,58,237,0.15)]`

#### 6.8 `<SearchInput>`

**Props:** `value`, `onChange`, `placeholder`, `className`

- Ícono `Search` fijo a la izquierda. Fondo más transparente para vivir dentro de `TableToolbar`

#### 6.9 `<Toggle>`

**Props:** `active`, `onToggle`, `disabled`

- Knob anima con spring `x: active ? 20 : 0` (ver sección 11.6)
- Encendido: `bg-[#7C3AED] shadow-[0_0_12px_rgba(124,58,237,0.4)]`

#### 6.10 `<DropdownFilter>`

**Props:** `label`, `options`, `value`, `onChange`, `icon`

- Gatillo `<Button>` + panel `AnimatePresence` + píldora activa con `layoutId` (ver sección 11.4)

#### 6.11 `<SegmentControl>`

**Props:** `options`, `value`, `onChange`, `layoutId`

- Píldora viaja entre opciones con spring `layoutId`. Patrón también en tab switchers de cards.

```jsx
// Contenedor dark: bg-black/60 border border-white/5 · light: bg-gray-200/50 border border-black/5
// Opción activa dark: bg-[#252429] text-white shadow-[0_4px_15px_rgba(124,58,237,0.2)]
// Opción activa light: bg-white text-[#7C3AED] shadow-md border border-[#7C3AED]/20
```

#### 6.12 `<MiniCalendar>`

**Props:** `selectedDate`, `onSelect`, `timeValue`, `onTimeChange`, `onConfirm`

- Grid de días del mes + inputs separados de horas/minutos
- Se renderiza como popover flotante (ver sección 3.7)

### Visualización de Datos

#### 6.13 `<Badge>`

**Props:** `variant` (default/success/warning/danger/outline), `icon` (Lucide), `className`

```jsx
<Badge variant="success" icon={CheckCircle2}>Exitoso</Badge>
```

- `backdrop-blur-md` con sombra mínima. Con ícono: `strokeWidth={3}` forzado

#### 6.14 `<Avatar>`

**Props:** `initials`, `size` (sm/md), `variant` (purple/neutral), `glow`

- Círculo con iniciales. `glow` activa `shadow-[0_0_20px_rgba(124,58,237,0.4)]` en hover desde el padre

#### 6.15 `<AvatarInfo>`

**Props:** `initials`, `primary`, `secondary`, `meta`, `glow`

- Compone `Avatar` + nombre + texto secundario + ID
- Si `initials` es null: círculo discontinuo con ícono `User` como fallback

#### 6.16 `<StatCard>`

**Props:** `label`, `value`, `icon`, `iconVariant` (default/success/warning/danger), `badge`, `badgeVariant`, `badgeSuffix`, `negative`, `layout` (kpi/balance)

- `kpi`: label arriba, valor centrado, badge abajo — para dashboards
- `balance`: ícono/badge arriba, valor grande — para WalletView
- `negative`: tiñe el valor en `rose-500`

#### 6.17 `<TableToolbar>`

**Props:** `children` (SearchInput, filtros, pills), `actions` (botones exportar/añadir), `className`

- Barra glass semitransparente (ver sección 3.8)
- `children` → izquierda; `actions` → derecha (solo se renderiza si existe)

### Navegación y Flujo

#### 6.18 `<Pagination>`

**Props:** `currentPage`, `totalPages`, `onPageChange`

- Elipsis `...` inteligente para rangos largos. Íconos `ChevronLeft`/`ChevronRight` de Lucide

#### 6.19 `<Stepper>`

**Props:** `steps[]` (cada step: `label`, `sub`, `icon`, `done`, `active`)

- Conectores entre pasos con líneas divisorias
- Paso activo: glow + puede usar `animate-spin-slow` en el ícono
- Glow completado: `shadow-[0_0_14px_rgba(16,185,129,0.4)]` · activo: `shadow-[0_0_14px_rgba(124,58,237,0.4)]`

### Retroalimentación

#### 6.20 `<InfoBanner>`

**Props:** `children`, `variant` (warning/info/danger)

- Ícono automático según variante. Ideal en cabeceras de modales o páginas

#### 6.21 `<Skeleton>`

**Props:** `width`, `height`, `rounded` (clase Tailwind, default `rounded-lg`), `className`

- Framer Motion: shimmer `x: ['-100%','200%']` + respiración `opacity: 0.5→1`

#### 6.22 `<EmptySearchState>`

**Props:** `colSpan`, `term`, `onClear`

- Renderiza directamente dentro de `<tbody>`. Ícono `SearchX` centrado
- `onClear`: callback del botón "Limpiar búsqueda"

#### 6.23 `<Tooltip>`

**Props:** `children`, `content`, `position` (top/bottom/left/right, default `top`)

- Portal con `createPortal` para evitar clipping por `overflow: hidden` en padres
- Cálculo dinámico de posición; fade de entrada/salida

---

## 7. Patrones de Layout

### 7.1 Estructura global

```
GlassBackground (fixed, z-0)
└── AppShell (min-h-screen flex)
    ├── Sidebar (w-64 h-screen z-20)
    └── Main column (flex-1 flex flex-col h-screen overflow-hidden z-10)
        ├── Header (h-20 z-50)
        └── <main> (flex-1 overflow-auto p-8 xl:p-10 pb-16 xl:pb-24)
            └── <div> max-w-[1400px] mx-auto
```

### 7.2 Grid de KPIs

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
```

### 7.3 Grid dashboard (1 + 2 columnas)

```jsx
// Fila media: Cobro Rápido (1) + Chart (2)
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
  <QuickLinkCard />          {/* col-span-1 */}
  <ChartCard />              {/* lg:col-span-2 */}
</div>

// Fila bottom: Feed (2) + Alertas (1)
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <LiveFeed />               {/* lg:col-span-2 */}
  <AlertsPanel />            {/* col-span-1 */}
</div>
```

### 7.4 Grid de cards (Sucursales, Links permanentes)

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
```

### 7.5 Encabezado de página (patrón estándar)

```jsx
<div className="flex justify-between items-end mb-8">
  <div>
    <h1 className={`text-3xl font-bold mb-2 tracking-tight ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
      Título de Vista
    </h1>
    <p className={`text-sm font-medium ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
      Subtítulo descriptivo
    </p>
  </div>
  <Button><PlusCircle size={18} /> CTA Principal</Button>
</div>
```

### 7.6 Encabezado de sección (label de separador)

```jsx
<p className={`text-xs font-bold tracking-widest uppercase mb-4 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
  NOMBRE DE SECCIÓN
</p>
```

### 7.7 Modal split 60/40 (NewLinkModal)

```jsx
<div className="flex flex-col md:flex-row flex-1 overflow-hidden">
  {/* Izquierda (datos) */}
  <div className={`p-8 flex-[1.5] md:border-r overflow-y-auto ${isDarkMode ? 'border-white/10' : 'border-black/5'}`}>
    ...
  </div>
  {/* Derecha (config + resumen) */}
  <div className="flex-1 flex flex-col relative overflow-hidden bg-gradient-to-b from-[#7C3AED]/10 to-transparent">
    ...
  </div>
</div>
```

---

## 8. Patrón de Tablas

### 8.1 Contenedor

```jsx
<Card className="pb-2">
  <div className="overflow-x-auto">
    <table className="w-full text-left border-collapse min-w-[900px]">
```

### 8.2 Cabecera

```jsx
<thead>
  <tr className={`text-[10px] uppercase font-bold tracking-widest ${
    isDarkMode
      ? 'text-[#888991] border-b border-white/10 bg-[#111113]/40'
      : 'text-[#67656E] border-b border-black/5 bg-white/50'
  }`}>
    <th className="px-8 py-4">Columna</th>
  </tr>
</thead>
```

### 8.3 Fila

```jsx
<tr className={`group transition-colors duration-200 ${
  isDarkMode
    ? 'border-b border-white/5 hover:bg-[#7C3AED]/5 last:border-0'
    : 'border-b border-black/5 hover:bg-[#DBD3FB]/20 last:border-0'
}`}>
```

### 8.4 Acciones en fila (visibles solo en hover)

```jsx
<div className="flex items-center justify-end gap-2 opacity-40 group-hover:opacity-100 transition-opacity duration-200">
  <Button variant="action" size="sm" className="!px-3 !py-2">
    <Pencil size={14} />
  </Button>
  <Button variant="danger" size="sm" className="!px-3 !py-2">
    <Trash2 size={14} />
  </Button>
</div>
```

---

## 9. Avatar de Iniciales

Patrón reutilizado en tablas de Usuarios, Transacciones y Links.

```jsx
// Con iniciales (usuario identificado)
<div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 transition-all ${
  isDarkMode
    ? 'bg-[#7C3AED]/15 text-[#7C3AED] border border-[#7C3AED]/30 group-hover:shadow-[0_0_20px_rgba(124,58,237,0.4)]'
    : 'bg-[#DBD3FB]/60 border border-white text-[#561BAF] shadow-sm'
}`}>
  {initials}
</div>

// Anónimo (usuario desconocido)
<div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 border-dashed flex-shrink-0 ${
  isDarkMode ? 'bg-[#111113]/50 border-white/20 text-[#888991]' : 'bg-gray-50 border-gray-300 text-gray-400'
}`}>
  <User size={16} />
</div>
```

---

## 10. Elementos Especiales

### 10.1 Auras de fondo (GlassBackground)

Dos blobs fijos que definen el ambiente visual de toda la app.

```jsx
{/* Base */}
<div className={`fixed inset-0 pointer-events-none z-0 ${isDarkMode ? 'bg-[#111113]' : 'bg-[#F4F4F6]'}`}>
  {/* Aura top-left (el "sol" morado) */}
  <div className={`absolute top-[-10%] left-[-10%] w-[55%] h-[55%] rounded-full blur-[140px] ${
    isDarkMode ? 'bg-[#7C3AED]/15' : 'bg-[#7C3AED]/20'
  }`} />
  {/* Aura bottom-right (la sombra profunda) */}
  <div className={`absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full blur-[120px] ${
    isDarkMode ? 'bg-[#300C67]/40' : 'bg-[#561BAF]/15'
  }`} />
</div>
```

**Blobs locales adicionales** (usados dentro de componentes):
- Sidebar wallet card: `absolute -bottom-6 -right-6 w-24 h-24 rounded-full blur-2xl bg-[#7C3AED]/30`
- Balance card (WalletView): `absolute -top-10 -right-10 w-48 h-48 rounded-full blur-3xl bg-[#7C3AED]/20`

### 10.2 Live Pulse Dot (Feed en Vivo)

```jsx
<span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)] inline-block" />
```

### 10.3 Punto de Notificación (Header)

```jsx
<span className={`absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full border-[2px] ${
  isDarkMode
    ? 'bg-[#7C3AED] border-[#111113] shadow-[0_0_10px_rgba(124,58,237,0.9)]'
    : 'bg-red-500 border-white shadow-[0_0_10px_rgba(239,68,68,0.6)]'
}`} />
```

> Nota: el punto es **morado** en dark mode y **rojo** en light mode.

### 10.4 Receipt / Ticket Térmico

```jsx
// El ticket siempre es blanco independientemente del modo
<div className="w-full max-w-[380px] bg-white rounded-t-xl shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
  <div className="px-8 pt-10 pb-8 text-center font-mono text-gray-800">
    {/* Contenido */}
    <div className="border-t-2 border-dashed border-gray-300 my-4" />
  </div>
  {/* Borde dentado inferior */}
  <div className="receipt-edge w-full" />
</div>
```

**CSS del receipt-edge** (en globals.css):
```css
.receipt-edge {
  height: 16px;
  background:
    radial-gradient(circle at 50% 0, #fff 8px, transparent 9px) repeat-x 0 0 / 18px 16px,
    linear-gradient(#fff, #fff);
}
```

**Botones flotantes del receipt:**
```jsx
<div className="absolute -right-16 top-0 flex flex-col gap-3">
  {/* Cerrar */}
  <button className="p-3.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 shadow-lg">
    <X size={22} />
  </button>
  {/* Imprimir */}
  <button className="p-3.5 rounded-full bg-[#7C3AED] hover:bg-[#561BAF] text-white border border-[#7C3AED]/50 shadow-[0_0_30px_rgba(124,58,237,0.5)]">
    <Printer size={22} />
  </button>
</div>
```

### 10.5 Caja de Advertencia (Amber)

```jsx
<div className={`p-4 rounded-xl border flex items-start gap-3 ${
  isDarkMode ? 'bg-amber-500/10 border-amber-500/20 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-800'
}`}>
  <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
  <p className="text-xs font-medium leading-relaxed">Texto de advertencia</p>
</div>
```

### 10.6 Stepper vertical (WalletView)

```jsx
// Paso completado:  bg-emerald-500 text-white shadow-[0_0_14px_rgba(16,185,129,0.4)]
// Paso activo:      bg-[#7C3AED] text-white shadow-[0_0_14px_rgba(124,58,237,0.4)]
// Paso pendiente:   bg-white/10 text-[#45434A] border border-white/10  (dark)
//                   bg-gray-100 text-gray-400 border border-gray-200   (light)

// Línea conectora completada: w-0.5 bg-emerald-500/40
// Línea conectora pendiente:  w-0.5 bg-white/10 (dark) / bg-gray-200 (light)
```

### 10.7 Card add (borde punteado)

Usado en SucursalesView para la tarjeta "Nueva Sucursal".

```jsx
<button className={`rounded-[20px] border-2 border-dashed flex flex-col items-center justify-center gap-3 p-8 min-h-[200px] transition-all duration-300 group ${
  isDarkMode
    ? 'border-white/10 text-[#888991] hover:border-[#7C3AED]/40 hover:text-[#A78BFA] hover:bg-[#7C3AED]/5'
    : 'border-gray-200 text-[#B0AFB4] hover:border-[#7C3AED]/40 hover:text-[#7C3AED] hover:bg-[#DBD3FB]/10'
}`}>
```

### 10.8 Nav item activo (Sidebar)

```jsx
// Dark
'bg-[#252429]/40 border border-white/10 border-t-white/20 text-white shadow-xl shadow-black/30 backdrop-blur-md'

// Light
'bg-white/60 border border-white text-[#561BAF] shadow-[0_8px_20px_rgba(0,0,0,0.04)] backdrop-blur-md'

// Ícono del nav activo (siempre): text-[#7C3AED]
```

### 10.9 Opciones radio (RefundModal)

```jsx
// Seleccionado "Total" dark:   bg-rose-500/10 border-rose-500/50
// Seleccionado "Total" light:  bg-rose-50 border-rose-400
// Seleccionado "Parcial" dark: bg-[#7C3AED]/10 border-[#7C3AED]/50
// Seleccionado "Parcial" light:bg-[#DBD3FB]/40 border-[#7C3AED]/40
// No seleccionado dark:        bg-[#111113]/30 border-white/10 hover:bg-white/5
// No seleccionado light:       bg-white/50 border-white hover:bg-white
```

---

## 11. Animaciones

Prism UI usa **Framer Motion** como sistema de animación principal. Las animaciones CSS (`globals.css`) se reservan para casos donde Framer Motion no aplica (loading spinners, pulse de live dot).

### 11.1 Sistema Spring — Constantes

Todas las animaciones de interacción usan spring, no ease. Cada componente declara su `SPRING` local ajustado a su caso:

```js
// motionVariants.js — stagger items (tablas, cards)
{ type: 'spring', stiffness: 300, damping: 24 }

// Sidebar — collapse/expand (critically damped, sin rebote)
{ type: 'spring', stiffness: 380, damping: 42 }

// AppShell toggle, buttons — interacciones rápidas
{ type: 'spring', stiffness: 400, damping: 30 }

// DropdownFilter panel — apertura de paneles
{ type: 'spring', stiffness: 500, damping: 30 }

// pageVariants — page entry
{ type: 'spring', stiffness: 260, damping: 26 }
```

Estas constantes se declaran al nivel del módulo (fuera del componente) para evitar re-creaciones.

---

### 11.2 Button — `whileTap` spring

Todos los botones de la app (`<Button>`) tienen feedback táctil al presionar:

```jsx
<motion.button
  whileTap={disabled ? undefined : { scale: 0.94 }}
  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
>
```

- Escala: `0.94` — suficiente para ser perceptible sin ser agresivo
- Respeta `disabled`: cuando el botón está deshabilitado no anima
- Implementado en `src/shared/ui/Button.jsx` — aplica a todos los botones automáticamente

---

### 11.3 Modal — Spring entrance

Los modales usan un patrón de 3 capas con opacity independiente por elemento:

```jsx
{/* Root — solo posiciona, sin initial/animate opacity (conserva exit para AnimatePresence) */}
<motion.div
  exit={{ opacity: 0 }}
  className="fixed inset-0 z-50 flex items-center justify-center"
>

  {/* Backdrop — opacity independiente */}
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.15 }}
    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
  />

  {/* Panel — opacity + scale/y con per-property transitions */}
  <motion.div
    initial={{ opacity: 0, scale: 0.95, y: 10 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95, y: 10 }}
    transition={{
      opacity: { duration: 0.15 },
      scale: { type: 'spring', stiffness: 400, damping: 30 },
      y: { type: 'spring', stiffness: 400, damping: 30 },
    }}
  />
</motion.div>
```

**Nota:** El root NO anima opacity en initial/animate — solo en exit. Cada hijo controla su propia opacity. Esto evita desincronización donde el backdrop-blur era imperceptible a baja opacidad del root.

---

### 11.4 Dropdown / Popover — Spring completo

Todos los paneles flotantes (DropdownFilter, branch selector del Header) usan el mismo patrón:

```jsx
const panelVariants = {
  hidden:  { opacity: 0, scale: 0.95, y: -4 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 500, damping: 30 } },
  exit:    { opacity: 0, scale: 0.95, y: -4, transition: { duration: 0.12, ease: 'easeIn' } },
}

<AnimatePresence>
  {isOpen && (
    <motion.div
      variants={panelVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{ transformOrigin: 'top left' }}  // o 'top right' según posición
    />
  )}
</AnimatePresence>
```

**Chevron spring** (acompaña al panel):
```jsx
<motion.span
  animate={{ rotate: isOpen ? 180 : 0 }}
  transition={SPRING}
>
  <ChevronDown size={14} />
</motion.span>
```

**Píldora activa con layoutId** (opción seleccionada):
```jsx
{isSelected && (
  <motion.div
    layoutId={`dropdown-pill-${useId()}`}
    className="absolute inset-0 rounded-xl bg-[#7C3AED]/15"
    transition={SPRING}
  />
)}
```

> Usar `useId()` de React 18 para el `layoutId` cuando el componente puede instanciarse múltiples veces en la misma página.

---

### 11.5 Sidebar Nav — `layoutId` spring pill

El indicador activo del sidebar se mueve entre ítems con shared layout animation. Sin `AnimatePresence` — el spring de layout maneja la transición:

```jsx
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'

<LayoutGroup id="sidebar-nav">
  {NAV_ITEMS.map(item => (
    <button key={item.id} className="relative w-full flex items-center gap-3 py-3 pl-[19px] ...">
      {isActive && (
        <motion.div
          layoutId="sidebar-indicator"
          className="absolute inset-0 rounded-xl ..."
          transition={SPRING}
        />
      )}
      <Icon className="relative z-10 flex-shrink-0" />
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.span variants={LABEL_VARIANTS} initial="hidden" animate="show" exit="exit"
            className="relative z-10 whitespace-nowrap">{label}</motion.span>
        )}
      </AnimatePresence>
    </button>
  ))}
</LayoutGroup>
```

- **`<LayoutGroup>`** es obligatorio para que Framer Motion coordine el `layoutId` entre botones distintos
- **`pl-[19px]` fijo** — centra el ícono de 18px en el sidebar colapsado de 56px sin cambiar className al colapsar (evita salto visual)
- **`AnimatePresence initial={false}`** solo envuelve el label (blur reveal/exit), no el indicator
- El ícono y el label necesitan `relative z-10` para quedar sobre el indicador

---

### 11.6 Toggle — Spring knob

El knob del toggle usa `motion.div` con `animate={{ x }}` en lugar de clases CSS `translate-x-*`:

```jsx
<motion.div
  className="w-4 h-4 rounded-full bg-white shadow-sm"
  animate={{ x: active ? 20 : 0 }}
  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
/>
```

---

### 11.7 Hover spring (WalletSidebarCard)

Para elementos que reaccionan al hover con movimiento spring:

```jsx
const [hovered, setHovered] = useState(false)

<motion.button
  onHoverStart={() => setHovered(true)}
  onHoverEnd={() => setHovered(false)}
  animate={{ y: !isActive && hovered ? -3 : 0 }}
  transition={SPRING}
>
  {/* Elemento que aparece en hover */}
  <motion.div
    animate={hovered ? { x: 0, opacity: 1 } : { x: -8, opacity: 0 }}
    transition={SPRING}
  />
</motion.button>
```

---

### 11.8 Stagger de listas

Para listas de cards y filas de tabla que deben aparecer en cascada al montar:

```js
// src/shared/utils/motionVariants.js
export const listVariants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.05 } },
}

export const itemVariants = {   // filas de tabla (slide desde izquierda)
  hidden: { opacity: 0, x: -10 },
  show:   { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
}

export const cardItemVariants = {  // cards/grids (aparece desde abajo)
  hidden: { opacity: 0, y: 15 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
}
```

**Uso en tabla:**
```jsx
import { listVariants, itemVariants } from '@/shared/utils/motionVariants'

<motion.tbody variants={listVariants} initial="hidden" animate="show">
  {rows.map((row, i) => (
    <motion.tr key={i} variants={itemVariants}>
      ...
    </motion.tr>
  ))}
</motion.tbody>
```

**Uso en grid de cards:**
```jsx
<motion.div variants={listVariants} initial="hidden" animate="show" className="grid ...">
  {items.map((item, i) => (
    <motion.div key={i} variants={cardItemVariants}>
      <Card>...</Card>
    </motion.div>
  ))}
</motion.div>
```

---

### 11.9 Bell wiggle — Hover de ícono

Para íconos de notificación que sacuden al hover:

```jsx
<motion.span
  whileHover={{ rotate: [0, -18, 14, -10, 6, 0] }}
  transition={{ duration: 0.5, ease: 'easeInOut' }}
  className="flex items-center justify-center"
>
  <Bell size={20} />
</motion.span>
```

---

### 11.10 Animaciones CSS (globals.css)

Reservadas para casos donde Framer Motion no aplica:

| Clase | Keyframe | Duración | Uso |
|---|---|---|---|
| `animate-fade-in` | `opacity: 0 → 1` | 0.4s ease | Entrada de vistas completas |
| `animate-slide-up` | `opacity 0→1 + translateY 12px→0` | 0.4s ease | Formularios de email en login |
| `animate-pulse-glow` | box-shadow pulsante morado | 2s ease-in-out ∞ | Elementos que requieren atención |
| `animate-spin-slow` | `rotate 0→360deg` | 2s linear ∞ | Íconos de carga |
| `animate-pulse` (Tailwind) | opacidad pulsante | built-in | Live dot del feed |

> `animate-scale-in` fue reemplazado por Framer Motion en modales y dropdowns. No usar en componentes nuevos.

---

## 12. Scrollbar Personalizado

```css
::-webkit-scrollbar             { width: 6px; height: 6px; }
::-webkit-scrollbar-track       { background: transparent; margin: 12px; }
::-webkit-scrollbar-thumb       {
  background: rgba(124,58,237,0.30);
  border-radius: 9999px;
  border: 2px solid transparent;
  background-clip: padding-box;
}
::-webkit-scrollbar-thumb:hover { background: rgba(124,58,237,0.55); }
::-webkit-scrollbar-button      { display:none; }
/* Firefox */
* { scrollbar-width: thin; scrollbar-color: rgba(124,58,237,0.30) transparent; }

/* Para ocultar completamente (ej: sidebar nav) */
.no-scrollbar { overflow: hidden; }
```

---

## 13. ZwapLogo SVG

El logo adapta el color del texto según el modo:

```jsx
// Isotipo Z: siempre gradiente url(#isoGrad) — #7C3AED → #9974F3 → #B9A4F8 → #DBD3FB
// Logotipo ZWAP:
fill={isDarkMode ? '#FFFFFF' : '#170339'}

// Drop shadow del SVG:
isDarkMode ? 'drop-shadow-[0_0_12px_rgba(255,255,255,0.15)]' : 'drop-shadow-sm'
```

---

## 14. Theming — Patrón de Uso

Cada componente llama a `useTheme()` directamente. No se hace prop-drilling de `isDarkMode`.

```jsx
import { useTheme } from '@/shared/context/ThemeContext'

function MiComponente() {
  const { isDarkMode, toggleTheme } = useTheme()

  return (
    <div className={isDarkMode ? 'text-[#D8D7D9]' : 'text-[#111113]'}>
      ...
    </div>
  )
}
```

**Persistencia:** `localStorage.getItem('zwap-theme')` — valores `'dark'`/`'light'`. Si no hay valor, usa `prefers-color-scheme` del OS.

---

## 15. Responsive Breakpoints en Uso

| Breakpoint | Uso principal |
|---|---|
| `md` | Sidebar visible, grids de 2 col, modal split vertical→horizontal |
| `lg` | Grids de 3 col (dashboard, liquidaciones, saldo) |
| `xl` | Grid de 4 col (KPIs), padding mayor (`xl:p-10`, `xl:pb-24`), texto largo en tablas |

---

## 16. Tokens CSS (globals.css)

```css
:root {
  --font-sans:         'Inter', system-ui, -apple-system, sans-serif;
  --font-mono:         'JetBrains Mono', 'Fira Code', monospace;

  --color-brand:        #7C3AED;
  --color-brand-hover:  #561BAF;
  --color-brand-light:  #DBD3FB;
  --color-brand-subtle: #B9A4F8;

  --dark-bg:        #111113;
  --dark-surface:   #252429;
  --dark-border:    rgba(255,255,255,0.10);
  --dark-text:      #D8D7D9;
  --dark-muted:     #888991;

  --light-bg:       #F4F4F6;
  --light-surface:  rgba(255,255,255,0.40);
  --light-border:   rgba(255,255,255,1);
  --light-text:     #111113;
  --light-muted:    #67656E;
}
```

---

## 17. Principios de Diseño

1. **Profundidad sin opacidad total.** Ninguna superficie es sólida; todo tiene transparencia + blur. El resultado son capas que "respiran".

2. **Un solo color de acento.** `#7C3AED` es el único saturado en toda la UI. Aparece con moderación: siempre como acento, nunca como fondo de pantalla completa.

3. **Borde superior más brillante.** `border-t-white/20` sobre `border-white/10` simula una fuente de luz que viene de arriba, dando volumen a cada superficie.

4. **Monospace para números, sans para texto.** Los montos, IDs y códigos siempre usan `font-mono`. El contraste tipográfico refuerza la lectura escaneable.

5. **Acciones contextuales en hover.** Los botones de acción en filas de tabla tienen `opacity-40 group-hover:opacity-100`. La UI es limpia en reposo y funcional en interacción.

6. **Semántica consistente por color.** Emerald = bien. Amber = atención. Rose = peligro/negativo. Purple = brand/neutro-positivo. Nunca se mezclan estos roles.

7. **`duration-300` como estándar.** Todas las transiciones de color y transform usan `transition-all duration-300`, excepto apariciones de elementos (que usan Framer Motion spring).

8. **Spring sobre ease para interacciones.** Cualquier elemento que responde a input del usuario (clic, hover, selección) anima con `type: 'spring'`. Las animaciones ease (`duration` fijo) se reservan para entradas de página y fundidos pasivos. La física spring da la sensación de materialidad que define Prism UI.

9. **`layoutId` para indicadores de selección.** Cuando un indicador visual (píldora, underline, highlight) se mueve entre opciones, usar `layoutId` con `LayoutGroup` en lugar de mostrar/ocultar. La píldora "viaja" en lugar de parpadear.
