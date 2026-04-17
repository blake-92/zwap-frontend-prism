<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { motion, AnimatePresence } from 'motion-v'
import { CreditCard } from 'lucide-vue-next'
import Card from '~/components/ui/Card.vue'
import SegmentControl from '~/components/ui/SegmentControl.vue'
import { useThemeStore } from '~/stores/theme'
import { CHART_DATA, CONVERSION_DATA, PAYMENT_METHODS } from '~/utils/mockData'

const { t } = useI18n()
const themeStore = useThemeStore()
const chart = ref('volumen')

const CHART_TITLES = computed(() => ({
  volumen: { h: t('dashboard.volumeByChannel'), sub: t('dashboard.volumeByChannelDesc') },
  conversion: { h: t('dashboard.conversionRate'), sub: t('dashboard.conversionRateDesc') },
  metodos: { h: t('dashboard.paymentMethods'), sub: t('dashboard.paymentMethodsDesc') },
}))

const FADE_SPRING = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}

const segmentOptions = computed(() => [
  { value: 'volumen', label: t('dashboard.volume') },
  { value: 'conversion', label: t('dashboard.conversion') },
  { value: 'metodos', label: t('dashboard.methods') },
])

// ── Volumen: SVG area chart (replaces recharts) ──
const hoverIdx = ref(-1)

const svgW = 520
const svgH = 200
const padL = 40, padR = 10, padT = 10, padB = 30

const chartX = (i, len) => padL + (i * (svgW - padL - padR) / Math.max(1, len - 1))
const maxY = computed(() => {
  let max = 0
  CHART_DATA.forEach(d => {
    if (d.links > max) max = d.links
    if (d.pos > max) max = d.pos
  })
  return Math.ceil(max / 1000) * 1000 || 1000
})
const chartY = (v) => padT + (svgH - padT - padB) * (1 - v / maxY.value)

const makeAreaPath = (key) => {
  const n = CHART_DATA.length
  let d = `M ${chartX(0, n)} ${chartY(CHART_DATA[0][key])}`
  for (let i = 1; i < n; i++) {
    const x0 = chartX(i - 1, n), y0 = chartY(CHART_DATA[i - 1][key])
    const x1 = chartX(i, n), y1 = chartY(CHART_DATA[i][key])
    const cx = (x0 + x1) / 2
    d += ` C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`
  }
  d += ` L ${chartX(n - 1, n)} ${svgH - padB} L ${chartX(0, n)} ${svgH - padB} Z`
  return d
}
const makeLinePath = (key) => {
  const n = CHART_DATA.length
  let d = `M ${chartX(0, n)} ${chartY(CHART_DATA[0][key])}`
  for (let i = 1; i < n; i++) {
    const x0 = chartX(i - 1, n), y0 = chartY(CHART_DATA[i - 1][key])
    const x1 = chartX(i, n), y1 = chartY(CHART_DATA[i][key])
    const cx = (x0 + x1) / 2
    d += ` C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`
  }
  return d
}

const areaLinks = computed(() => makeAreaPath('links'))
const areaPos = computed(() => makeAreaPath('pos'))
const lineLinks = computed(() => makeLinePath('links'))
const linePos = computed(() => makeLinePath('pos'))

const yTicks = computed(() => {
  const step = maxY.value / 4
  return [0, step, step * 2, step * 3, maxY.value]
})

const gridStroke = computed(() => themeStore.isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)')
const axisTick = computed(() => themeStore.isDarkMode ? '#888991' : '#A1A1AA')

let rafId = null
const onHover = (e) => {
  if (rafId) return
  rafId = requestAnimationFrame(() => {
    rafId = null
    const svg = e.currentTarget
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * svgW
    const n = CHART_DATA.length
    let closest = 0, best = Infinity
    for (let i = 0; i < n; i++) {
      const cx = chartX(i, n)
      const d = Math.abs(x - cx)
      if (d < best) { best = d; closest = i }
    }
    hoverIdx.value = closest
  })
}
const onLeave = () => {
  if (rafId) { cancelAnimationFrame(rafId); rafId = null }
  hoverIdx.value = -1
}

onBeforeUnmount(() => {
  if (rafId) { cancelAnimationFrame(rafId); rafId = null }
})

const tooltipClass = computed(() =>
  themeStore.isDarkMode
    ? 'bg-[#252429]/90 border-white/10 text-white'
    : 'bg-white/90 border-[#7C3AED]/20 text-[#111113]',
)
</script>

<template>
  <Card class="lg:col-span-2 p-8 flex flex-col">
    <div class="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
      <div>
        <h3 :class="['font-bold text-lg', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']">{{ CHART_TITLES[chart].h }}</h3>
        <p :class="['text-xs font-medium mt-1', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">{{ CHART_TITLES[chart].sub }}</p>
      </div>
      <SegmentControl v-model="chart" :options="segmentOptions" layout-id="chartTabIndicator" />
    </div>

    <div class="flex-1 relative min-h-[220px] flex items-end">
      <AnimatePresence mode="wait">
        <!-- Volumen: SVG area -->
        <motion.div
          v-if="chart === 'volumen'"
          key="volumen"
          :variants="FADE_SPRING"
          initial="hidden"
          animate="show"
          exit="exit"
          class="w-full h-[200px] relative"
        >
          <svg
            :viewBox="`0 0 ${svgW} ${svgH}`"
            preserveAspectRatio="none"
            class="w-full h-full"
            @mousemove="onHover"
            @mouseleave="onLeave"
          >
            <defs>
              <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stop-color="#7C3AED" stop-opacity="0.3" />
                <stop offset="95%" stop-color="#7C3AED" stop-opacity="0" />
              </linearGradient>
              <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stop-color="#10B981" stop-opacity="0.3" />
                <stop offset="95%" stop-color="#10B981" stop-opacity="0" />
              </linearGradient>
            </defs>

            <!-- Grid -->
            <line v-for="(y, i) in yTicks" :key="`g-${i}`" :x1="padL" :x2="svgW - padR" :y1="chartY(y)" :y2="chartY(y)" :stroke="gridStroke" stroke-dasharray="4 4" />

            <!-- Y axis labels -->
            <text
              v-for="(y, i) in yTicks"
              :key="`yl-${i}`"
              :x="padL - 6"
              :y="chartY(y) + 4"
              text-anchor="end"
              :fill="axisTick"
              font-size="11"
              font-weight="600"
            >${{ y / 1000 }}k</text>

            <!-- X axis labels -->
            <text
              v-for="(d, i) in CHART_DATA"
              :key="`xl-${i}`"
              :x="chartX(i, CHART_DATA.length)"
              :y="svgH - padB + 18"
              text-anchor="middle"
              :fill="axisTick"
              font-size="11"
              font-weight="600"
            >{{ d.name }}</text>

            <!-- Areas + lines -->
            <path :d="areaLinks" fill="url(#purpleGrad)" />
            <path :d="lineLinks" fill="none" stroke="#7C3AED" stroke-width="3" />
            <path :d="areaPos" fill="url(#emeraldGrad)" />
            <path :d="linePos" fill="none" stroke="#10B981" stroke-width="3" />

            <!-- Cursor + active dots -->
            <template v-if="hoverIdx >= 0">
              <line
                :x1="chartX(hoverIdx, CHART_DATA.length)"
                :x2="chartX(hoverIdx, CHART_DATA.length)"
                :y1="padT"
                :y2="svgH - padB"
                :stroke="themeStore.isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'"
                stroke-width="1"
                stroke-dasharray="4 4"
              />
              <circle :cx="chartX(hoverIdx, CHART_DATA.length)" :cy="chartY(CHART_DATA[hoverIdx].links)" r="6" fill="#7C3AED" />
              <circle :cx="chartX(hoverIdx, CHART_DATA.length)" :cy="chartY(CHART_DATA[hoverIdx].pos)" r="6" fill="#10B981" />
            </template>
          </svg>

          <!-- Tooltip -->
          <div
            v-if="hoverIdx >= 0"
            :class="['absolute top-2 p-3 rounded-xl border backdrop-blur-md shadow-xl pointer-events-none transition-all', tooltipClass]"
            :style="{ left: `${(chartX(hoverIdx, CHART_DATA.length) / svgW) * 100}%`, transform: 'translateX(-50%)' }"
          >
            <p class="font-bold text-sm mb-2">{{ CHART_DATA[hoverIdx].name }}</p>
            <div class="flex items-center gap-2 text-xs font-medium mt-1">
              <div class="w-2 h-2 rounded-full" style="background-color: #7C3AED" />
              <span :class="themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'">{{ t('dashboard.chartPaymentLinks') }}:</span>
              <span class="font-mono font-bold">${{ CHART_DATA[hoverIdx].links.toLocaleString() }}</span>
            </div>
            <div class="flex items-center gap-2 text-xs font-medium mt-1">
              <div class="w-2 h-2 rounded-full" style="background-color: #10B981" />
              <span :class="themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'">{{ t('dashboard.chartTerminalPos') }}:</span>
              <span class="font-mono font-bold">${{ CHART_DATA[hoverIdx].pos.toLocaleString() }}</span>
            </div>
          </div>
        </motion.div>

        <!-- Conversion bars -->
        <motion.div
          v-else-if="chart === 'conversion'"
          key="conversion"
          :variants="FADE_SPRING"
          initial="hidden"
          animate="show"
          exit="exit"
          class="w-full h-[200px] flex items-end justify-between px-4 pb-6"
        >
          <div v-for="item in CONVERSION_DATA" :key="item.day" class="flex flex-col items-center gap-2 group cursor-pointer">
            <span :class="['text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity', themeStore.isDarkMode ? 'text-[#B9A4F8]' : 'text-[#7C3AED]']">
              {{ item.value }}%
            </span>
            <div
              :class="[
                'w-10 md:w-14 rounded-md relative flex items-end p-1 transition-colors',
                themeStore.isDarkMode ? 'bg-[#111113]/50 border border-white/5' : 'bg-gray-100 border border-black/5'
              ]"
              :style="{ height: '140px' }"
            >
              <div
                class="w-full rounded-sm transition-all duration-700 group-hover:brightness-125"
                :style="{
                  height: `${item.value}%`,
                  background: 'linear-gradient(to top, #561BAF, #7C3AED)',
                  boxShadow: '0 0 10px rgba(124,58,237,0.2)',
                }"
              />
            </div>
            <span :class="['text-[10px] font-bold', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#A1A1AA]']">{{ item.day }}</span>
          </div>
        </motion.div>

        <!-- Metodos: horizontal bars -->
        <motion.div
          v-else-if="chart === 'metodos'"
          key="metodos"
          :variants="FADE_SPRING"
          initial="hidden"
          animate="show"
          exit="exit"
          class="w-full h-[200px] flex flex-col justify-center gap-6 px-4"
        >
          <div v-for="item in PAYMENT_METHODS" :key="item.label" class="flex items-center gap-4">
            <div :class="['w-8 flex justify-center', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#A1A1AA]']">
              <CreditCard :size="20" />
            </div>
            <div class="flex-1">
              <div class="flex justify-between mb-1.5">
                <span :class="['text-xs font-bold', themeStore.isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]']">{{ item.label }}</span>
                <span class="text-xs font-mono font-bold" :style="{ color: item.color }">{{ item.val }}%</span>
              </div>
              <div :class="['h-2.5 rounded-full overflow-hidden', themeStore.isDarkMode ? 'bg-[#111113]' : 'bg-gray-200']">
                <div class="h-full rounded-full transition-all duration-1000" :style="{ width: `${item.val}%`, backgroundColor: item.color }" />
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  </Card>
</template>
