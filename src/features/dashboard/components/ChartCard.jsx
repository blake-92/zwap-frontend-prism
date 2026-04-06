import { useState } from 'react'
import { motion } from 'framer-motion'
import { CreditCard } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { useTheme } from '@/shared/context/ThemeContext'
import { Card } from '@/shared/ui'

const chartData = [
  { name: 'Lun', pos: 2400, links: 4000 },
  { name: 'Mar', pos: 1398, links: 3000 },
  { name: 'Mié', pos: 9800, links: 2000 },
  { name: 'Jue', pos: 3908, links: 2780 },
  { name: 'Vie', pos: 4800, links: 1890 },
  { name: 'Sáb', pos: 3800, links: 2390 },
  { name: 'Hoy', pos: 4300, links: 3490 },
]

export default function ChartCard() {
  const { isDarkMode } = useTheme()
  const [chart, setChart] = useState('volumen')

  const tabs = [
    { id: 'volumen',    label: 'Volumen' },
    { id: 'conversion', label: 'Conversión' },
    { id: 'metodos',    label: 'Métodos' },
  ]

  const titles = {
    volumen:    { h: 'Volumen por Canal',      sub: 'Terminal POS vs. Links de Pago (Últimos 7 días)' },
    conversion: { h: 'Tasa de Conversión',     sub: 'Links pagados vs. expirados' },
    metodos:    { h: 'Métodos de Pago',        sub: 'Distribución por tipo de tarjeta' },
  }

  const CustomTooltip = ({ active, payload, label }) => {
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

  return (
    <Card className="lg:col-span-2 p-8 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
            {titles[chart].h}
          </h3>
          <p className={`text-xs font-medium mt-1 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
            {titles[chart].sub}
          </p>
        </div>

        {/* Tab switcher */}
        <div className={`flex rounded-xl p-1.5 shadow-inner ${
          isDarkMode ? 'bg-black/60 border border-white/5' : 'bg-gray-200/50 border border-black/5'
        }`}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setChart(t.id)}
              className={`relative px-3 py-1.5 text-xs font-bold rounded-lg transition-colors duration-300 ${
                chart === t.id
                  ? isDarkMode
                    ? 'text-white'
                    : 'text-[#7C3AED]'
                  : isDarkMode
                    ? 'text-[#888991] hover:text-[#D8D7D9]'
                    : 'text-[#67656E] hover:text-[#111113]'
              }`}
            >
              {chart === t.id && (
                <motion.div
                  layoutId="chartTabIndicator"
                  className={`absolute inset-0 rounded-lg ${
                    isDarkMode
                      ? 'bg-[#252429] border border-white/10 shadow-[0_4px_15px_rgba(124,58,237,0.2)]'
                      : 'bg-white border border-[#7C3AED]/20 shadow-md'
                  }`}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chart area */}
      <div className="flex-1 relative min-h-[220px] flex items-end">

        {/* ── Volumen: área line chart ── */}
        {chart === 'volumen' && (
          <div className="w-full h-[200px] animate-fade-in">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
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
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }} />
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
            {[60, 80, 45, 90, 75, 85, 95].map((val, i) => (
              <div key={i} className="flex flex-col items-center gap-2 group cursor-pointer">
                <span className={`text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity ${isDarkMode ? 'text-[#B9A4F8]' : 'text-[#7C3AED]'}`}>
                  {val}%
                </span>
                <div className={`w-10 md:w-14 rounded-md relative flex items-end p-1 transition-colors ${
                  isDarkMode ? 'bg-[#111113]/50 border border-white/5' : 'bg-gray-100 border border-black/5'
                }`} style={{ height: '140px' }}>
                  <div
                    className="w-full rounded-sm transition-all duration-700 group-hover:brightness-125"
                    style={{
                      height: `${val}%`,
                      background: 'linear-gradient(to top, #561BAF, #7C3AED)',
                      boxShadow: '0 0 10px rgba(124,58,237,0.2)',
                    }}
                  />
                </div>
                <span className={`text-[10px] font-bold ${isDarkMode ? 'text-[#888991]' : 'text-[#A1A1AA]'}`}>
                  {['Lun','Mar','Mié','Jue','Vie','Sáb','Hoy'][i]}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ── Métodos: horizontal bars ── */}
        {chart === 'metodos' && (
          <div className="w-full h-[200px] flex flex-col justify-center gap-6 px-4 animate-fade-in">
            {[
              { label: 'Visa',       val: 65, color: '#7C3AED', icon: CreditCard },
              { label: 'Mastercard', val: 25, color: '#10B981', icon: CreditCard },
              { label: 'Amex',       val: 10, color: '#F59E0B', icon: CreditCard },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-4">
                <div className={`w-8 flex justify-center ${isDarkMode ? 'text-[#888991]' : 'text-[#A1A1AA]'}`}>
                  <item.icon size={20} />
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
