import { useState } from 'react'
import { CreditCard } from 'lucide-react'
import { useTheme } from '@/shared/context/ThemeContext'
import { Card } from '@/shared/ui'

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
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-300 ${
                chart === t.id
                  ? isDarkMode
                    ? 'bg-[#252429] text-white border border-white/10 shadow-[0_4px_15px_rgba(124,58,237,0.2)]'
                    : 'bg-white text-[#7C3AED] shadow-md border border-[#7C3AED]/20'
                  : isDarkMode
                    ? 'text-[#888991] hover:text-[#D8D7D9]'
                    : 'text-[#67656E] hover:text-[#111113]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart area */}
      <div className="flex-1 relative min-h-[220px] flex items-end">

        {/* ── Volumen: área line chart ── */}
        {chart === 'volumen' && (
          <svg
            className="w-full h-[200px] overflow-visible animate-fade-in"
            viewBox="0 0 1000 200"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#7C3AED" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#10B981" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            <g stroke={isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} strokeWidth="1" strokeDasharray="4 4">
              <line x1="0" y1="20"  x2="1000" y2="20" />
              <line x1="0" y1="80"  x2="1000" y2="80" />
              <line x1="0" y1="140" x2="1000" y2="140" />
            </g>

            {/* POS area (emerald) */}
            <path
              d="M 0 180 C 80 180 100 130 166 140 C 250 150 280 80 333 90 C 400 100 450 120 500 110 C 580 90 600 40 666 50 C 750 60 780 110 833 100 C 900 90 950 60 1000 70 L 1000 180 Z"
              fill="url(#emeraldGrad)"
            />
            <path
              d="M 0 180 C 80 180 100 130 166 140 C 250 150 280 80 333 90 C 400 100 450 120 500 110 C 580 90 600 40 666 50 C 750 60 780 110 833 100 C 900 90 950 60 1000 70"
              fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round"
            />

            {/* Links area (purple) */}
            <path
              d="M 0 180 C 80 180 100 150 166 160 C 250 170 280 110 333 120 C 400 130 450 80 500 70 C 580 50 600 90 666 80 C 750 70 780 30 833 40 C 900 50 950 20 1000 30 L 1000 180 Z"
              fill="url(#purpleGrad)"
            />
            <path
              d="M 0 180 C 80 180 100 150 166 160 C 250 170 280 110 333 120 C 400 130 450 80 500 70 C 580 50 600 90 666 80 C 750 70 780 30 833 40 C 900 50 950 20 1000 30"
              fill="none" stroke="#7C3AED" strokeWidth="3" strokeLinecap="round"
            />

            {/* Day labels */}
            <g fill={isDarkMode ? '#888991' : '#A1A1AA'} fontSize="11" fontWeight="600" textAnchor="middle">
              {['Lun','Mar','Mié','Jue','Vie','Sáb','Hoy'].map((d, i) => (
                <text key={d} x={i * 166.6} y="218">{d}</text>
              ))}
            </g>

            {/* Legend */}
            <g fontSize="10" fontWeight="700">
              <circle cx="810" cy="6" r="4" fill="#7C3AED" />
              <text x="818" y="10" fill={isDarkMode ? '#D8D7D9' : '#45434A'}>Links</text>
              <circle cx="860" cy="6" r="4" fill="#10B981" />
              <text x="868" y="10" fill={isDarkMode ? '#D8D7D9' : '#45434A'}>POS</text>
            </g>
          </svg>
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
