import { useState } from 'react'
import { CreditCard } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { useTheme } from '@/shared/context/ThemeContext'
import { Card, SegmentControl } from '@/shared/ui'

import { CHART_DATA, CONVERSION_DATA, PAYMENT_METHODS } from '@/services/mocks/mockData'

const CHART_TABS = [
  { value: 'volumen',    label: 'Volumen' },
  { value: 'conversion', label: 'Conversión' },
  { value: 'metodos',    label: 'Métodos' },
]

const CHART_TITLES = {
  volumen:    { h: 'Volumen por Canal',      sub: 'Terminal POS vs. Links de Pago (Últimos 7 días)' },
  conversion: { h: 'Tasa de Conversión',     sub: 'Links pagados vs. expirados' },
  metodos:    { h: 'Métodos de Pago',        sub: 'Distribución por tipo de tarjeta' },
}

function ChartTooltip({ active, payload, label, isDarkMode }) {
  if (active && payload && payload.length) {
    return (
      <div className={`p-3 rounded-xl border backdrop-blur-md shadow-xl ${
        isDarkMode 
          ? 'bg-[#252429]/90 border-white/10 text-white' 
          : 'bg-white/90 border-[#7C3AED]/20 text-[#111113]'
      }`}>
        <p className="font-bold text-sm mb-2">{label}</p>
        {payload.map(entry => (
          <div key={entry.name} className="flex items-center gap-2 text-xs font-medium mt-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className={isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}>{entry.name}:</span>
            <span className="font-mono font-bold">${entry.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function ChartCard() {
  const { isDarkMode } = useTheme()
  const [chart, setChart] = useState('volumen')

  return (
    <Card className="lg:col-span-2 p-8 flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
        <div>
          <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
            {CHART_TITLES[chart].h}
          </h3>
          <p className={`text-xs font-medium mt-1 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
            {CHART_TITLES[chart].sub}
          </p>
        </div>

        {/* Tab switcher */}
        <SegmentControl
          options={CHART_TABS}
          value={chart}
          onChange={setChart}
          layoutId="chartTabIndicator"
        />
      </div>

      {/* Chart area */}
      <div className="flex-1 relative min-h-[220px] flex items-end">

        {/* ── Volumen: área line chart ── */}
        {chart === 'volumen' && (
          <div className="w-full h-[200px] animate-fade-in">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_DATA} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="4 4" 
                  vertical={false} 
                  stroke={isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} 
                />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: isDarkMode ? '#888991' : '#A1A1AA', fontSize: 11, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: isDarkMode ? '#888991' : '#A1A1AA', fontSize: 11, fontWeight: 600 }}
                  tickFormatter={(val) => `$${val/1000}k`}
                />
                <Tooltip content={<ChartTooltip isDarkMode={isDarkMode} />} cursor={{ stroke: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area 
                  type="monotone" 
                  dataKey="links" 
                  name="Links de Pago"
                  stroke="#7C3AED" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#purpleGrad)" 
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#7C3AED' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="pos" 
                  name="Terminal POS"
                  stroke="#10B981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#emeraldGrad)" 
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#10B981' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ── Conversión: bar chart ── */}
        {chart === 'conversion' && (
          <div className="w-full h-[200px] flex items-end justify-between px-4 pb-6 animate-fade-in">
            {CONVERSION_DATA.map((item) => (
              <div key={item.day} className="flex flex-col items-center gap-2 group cursor-pointer">
                <span className={`text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity ${isDarkMode ? 'text-[#B9A4F8]' : 'text-[#7C3AED]'}`}>
                  {item.value}%
                </span>
                <div className={`w-10 md:w-14 rounded-md relative flex items-end p-1 transition-colors ${
                  isDarkMode ? 'bg-[#111113]/50 border border-white/5' : 'bg-gray-100 border border-black/5'
                }`} style={{ height: '140px' }}>
                  <div
                    className="w-full rounded-sm transition-all duration-700 group-hover:brightness-125"
                    style={{
                      height: `${item.value}%`,
                      background: 'linear-gradient(to top, #561BAF, #7C3AED)',
                      boxShadow: '0 0 10px rgba(124,58,237,0.2)',
                    }}
                  />
                </div>
                <span className={`text-[10px] font-bold ${isDarkMode ? 'text-[#888991]' : 'text-[#A1A1AA]'}`}>
                  {item.day}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ── Métodos: horizontal bars ── */}
        {chart === 'metodos' && (
          <div className="w-full h-[200px] flex flex-col justify-center gap-6 px-4 animate-fade-in">
            {PAYMENT_METHODS.map((item) => (
              <div key={item.label} className="flex items-center gap-4">
                <div className={`w-8 flex justify-center ${isDarkMode ? 'text-[#888991]' : 'text-[#A1A1AA]'}`}>
                  <CreditCard size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1.5">
                    <span className={`text-xs font-bold ${isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]'}`}>
                      {item.label}
                    </span>
                    <span className="text-xs font-mono font-bold" style={{ color: item.color }}>
                      {item.val}%
                    </span>
                  </div>
                  <div className={`h-2.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-[#111113]' : 'bg-gray-200'}`}>
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${item.val}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}
