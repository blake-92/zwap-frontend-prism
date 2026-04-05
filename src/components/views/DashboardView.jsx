import { useState } from 'react'
import {
  Plus, ArrowRight, MousePointerClick, Bell,
  QrCode, Copy, ExternalLink, CreditCard,
  Clock, ArrowRightLeft, LinkIcon, Smartphone,
  Timer, AlertOctagon, Landmark, User, Globe2,
  CheckCircle2,
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { Card, Button, Badge } from '../ui'
import { KPIS, TRANSACTIONS, PERMANENT_LINKS } from '../../data/mockData'

/* ─────────────────────────────────────────────────────────────
   KPI Card
───────────────────────────────────────────────────────────── */
function KpiCard({ kpi }) {
  const { isDarkMode } = useTheme()

  const iconColors = {
    success: isDarkMode ? 'bg-emerald-500/15 text-emerald-500 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]'  : 'bg-emerald-100 text-emerald-600 group-hover:shadow-md',
    warning: isDarkMode ? 'bg-amber-500/15 text-amber-500 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.3)]'     : 'bg-amber-100 text-amber-600 group-hover:shadow-md',
    default: isDarkMode ? 'bg-[#7C3AED]/15 text-[#7C3AED] group-hover:shadow-[0_0_15px_rgba(124,58,237,0.3)]'    : 'bg-[#DBD3FB]/60 text-[#561BAF] group-hover:shadow-md',
  }

  return (
    <Card hoverEffect className="p-6 cursor-pointer group">
      <div className="flex justify-between items-start mb-6">
        <span className={`text-sm font-semibold transition-colors ${
          isDarkMode ? 'text-[#B0AFB4] group-hover:text-white' : 'text-[#67656E] group-hover:text-[#111113]'
        }`}>
          {kpi.label}
        </span>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${iconColors[kpi.variant]}`}>
          <kpi.icon size={20} />
        </div>
      </div>
      <h3 className={`text-3xl font-mono font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
        {kpi.value}
      </h3>
      <div className="mt-4 flex items-center gap-2">
        <Badge variant={kpi.variant === 'default' ? 'outline' : kpi.variant}>
          {kpi.change}
        </Badge>
        <span className={`text-xs font-medium ${isDarkMode ? 'text-[#888991]' : 'text-[#888991]'}`}>
          vs. ayer
        </span>
      </div>
    </Card>
  )
}

/* ─────────────────────────────────────────────────────────────
   Quick Cobro (QR) Card
───────────────────────────────────────────────────────────── */
function QuickLinkCard({ onNewLink }) {
  const { isDarkMode }    = useTheme()
  const activeLinks       = PERMANENT_LINKS.filter(l => l.active)
  const [active, setActive] = useState(activeLinks[0]?.id ?? null)
  const selected          = PERMANENT_LINKS.find(l => l.id === active) ?? activeLinks[0]

  return (
    <Card className="p-0 flex flex-col bg-gradient-to-b from-[#7C3AED]/5 to-transparent">
      {/* Header */}
      <div className={`p-6 border-b flex items-center justify-between ${isDarkMode ? 'border-white/10' : 'border-black/5'}`}>
        <div>
          <h3 className={`font-bold text-lg flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
            <MousePointerClick size={18} className="text-[#7C3AED]" />
            Cobro Rápido
          </h3>
          <p className={`text-xs font-medium mt-1 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
            Escanea para pagar
          </p>
        </div>
      </div>

      <div className="p-6 flex flex-col items-center flex-1">
        {/* Tab switcher */}
        <div className={`flex w-full rounded-xl p-1 mb-6 shadow-inner ${
          isDarkMode ? 'bg-black/60 border border-white/5' : 'bg-gray-200/50 border border-black/5'
        }`}>
          {activeLinks.map(link => (
            <button
              key={link.id}
              onClick={() => setActive(link.id)}
              className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all duration-300 truncate px-2 ${
                active === link.id
                  ? isDarkMode
                    ? 'bg-[#252429] text-white border border-white/10 shadow-[0_4px_15px_rgba(124,58,237,0.2)]'
                    : 'bg-white text-[#7C3AED] shadow-md border border-[#7C3AED]/20'
                  : isDarkMode
                    ? 'text-[#888991] hover:text-[#D8D7D9]'
                    : 'text-[#67656E] hover:text-[#111113]'
              }`}
            >
              {link.name}
            </button>
          ))}
        </div>

        {/* QR Code placeholder */}
        <div className="bg-white p-4 rounded-2xl shadow-xl border border-gray-100 mb-6 relative group cursor-pointer">
          <QrCode size={140} className="text-black" strokeWidth={1.5} />
          <div className="absolute inset-0 flex items-center justify-center bg-black/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="action" size="icon" className="!rounded-full shadow-lg">
              <ExternalLink size={16} />
            </Button>
          </div>
        </div>

        {/* URL + CTA */}
        <div className="text-center w-full mt-auto">
          <p className={`text-[11px] font-mono font-bold mb-3 truncate ${isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]'}`}>
            {selected?.url}
          </p>
          <Button className="w-full !py-2.5 shadow-lg">
            <Copy size={16} /> Copiar Enlace
          </Button>
        </div>
      </div>
    </Card>
  )
}

/* ─────────────────────────────────────────────────────────────
   Volume/Conversion/Methods Chart Card
───────────────────────────────────────────────────────────── */
function ChartCard() {
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

/* ─────────────────────────────────────────────────────────────
   Live Feed table
───────────────────────────────────────────────────────────── */
function LiveFeed({ onViewAll }) {
  const { isDarkMode } = useTheme()

  return (
    <Card className="lg:col-span-2 pb-2 flex flex-col">
      <div className={`p-6 pb-5 flex justify-between items-center border-b ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
        <div>
          <h3 className={`font-bold text-xl tracking-tight flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)] inline-block" />
            Feed en Vivo
          </h3>
          <p className={`text-xs font-medium mt-1 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
            Últimas operaciones procesadas
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onViewAll} className="!text-[#7C3AED] !h-8 !px-2">
          Ver Todas <ArrowRight size={14} className="ml-1" />
        </Button>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[640px]">
          <thead>
            <tr className={`text-[10px] uppercase font-bold tracking-widest ${
              isDarkMode ? 'text-[#888991] bg-[#111113]/20' : 'text-[#67656E] bg-white/20'
            }`}>
              <th className="px-6 py-3">Tiempo</th>
              <th className="px-4 py-3">Origen</th>
              <th className="px-4 py-3">Canal</th>
              <th className="px-4 py-3 text-center">Estado</th>
              <th className="px-6 py-3 text-right">Monto</th>
            </tr>
          </thead>
          <tbody>
            {TRANSACTIONS.slice(0, 4).map((trx, idx) => (
              <tr
                key={idx}
                className={`group transition-colors duration-200 ${
                  isDarkMode
                    ? 'border-b border-white/5 hover:bg-[#7C3AED]/5 last:border-0'
                    : 'border-b border-black/5 hover:bg-[#DBD3FB]/20 last:border-0'
                }`}
              >
                {/* Time */}
                <td className="px-6 py-3">
                  <span className={`text-xs font-bold ${isDarkMode ? 'text-[#D8D7D9] group-hover:text-white' : 'text-[#111113]'}`}>
                    {trx.time}
                  </span>
                </td>

                {/* Origin */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center bg-gray-100 border border-black/5 flex-shrink-0">
                      {trx.countryCode === 'xx'
                        ? <User size={12} className="text-gray-400" />
                        : <img src={`https://flagcdn.com/w20/${trx.countryCode}.png`} alt={trx.country} className="w-full h-full object-cover" />
                      }
                    </div>
                    <span className={`font-bold text-xs ${isDarkMode ? 'text-[#D8D7D9] group-hover:text-white' : 'text-[#111113]'}`}>
                      {trx.client ? trx.client.split(' ')[0] : 'Mostrador'}
                    </span>
                  </div>
                </td>

                {/* Channel */}
                <td className="px-4 py-3">
                  <span className={`text-[11px] font-semibold flex items-center gap-1.5 ${isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]'}`}>
                    <trx.ChannelIcon size={12} className={isDarkMode ? 'text-[#7C3AED]' : 'text-[#561BAF]'} />
                    {trx.channel.includes('POS') ? 'POS' : 'Link'}
                  </span>
                </td>

                {/* Status */}
                <td className="px-4 py-3 text-center">
                  <Badge variant={trx.statusVariant} icon={trx.StatusIcon} className="!py-0.5 !px-2 !text-[9px]">
                    {trx.status}
                  </Badge>
                </td>

                {/* Amount */}
                <td className="px-6 py-3 text-right">
                  <span className={`font-mono font-bold text-sm tracking-tight ${
                    trx.status === 'Reembolsado'
                      ? 'text-rose-500 line-through opacity-70'
                      : isDarkMode ? 'text-white' : 'text-[#111113]'
                  }`}>
                    ${trx.amount}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

/* ─────────────────────────────────────────────────────────────
   Alerts panel
───────────────────────────────────────────────────────────── */
function AlertsPanel() {
  const { isDarkMode } = useTheme()

  const alerts = [
    {
      icon: Timer, iconColor: 'amber', title: 'Link expira en 2 hrs',
      body: 'Reserva de Alice Smith ($350.00)',
      action: { label: 'Ver Link', variant: 'outline' },
    },
    {
      icon: AlertOctagon, iconColor: 'rose', title: 'Disputa Abierta',
      body: 'Pago de $150.00 reportado como fraude (Visa •••• 4242).',
      action: { label: 'Gestionar Evidencia', variant: 'danger' },
    },
    {
      icon: Landmark, iconColor: 'emerald', title: 'Depósito Confirmado',
      body: 'Liquidación del 25 Mar ($2,526.00) acreditada en tu cuenta.',
      action: null,
    },
  ]

  const colorMap = {
    amber:   { bg: isDarkMode ? 'bg-amber-500/20 text-amber-400'   : 'bg-amber-100 text-amber-600',   border: isDarkMode ? 'hover:border-amber-500/30'   : 'hover:border-amber-200' },
    rose:    { bg: isDarkMode ? 'bg-rose-500/20 text-rose-400'     : 'bg-rose-100 text-rose-600',     border: isDarkMode ? 'hover:border-rose-500/30'     : 'hover:border-rose-200' },
    emerald: { bg: isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600', border: isDarkMode ? 'hover:border-emerald-500/30' : 'hover:border-emerald-200' },
  }

  return (
    <Card className="lg:col-span-1 p-0 flex flex-col">
      <div className={`p-6 border-b flex items-center justify-between ${isDarkMode ? 'border-white/10' : 'border-black/5'}`}>
        <div>
          <h3 className={`font-bold text-lg flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
            <Bell size={18} className="text-amber-500 animate-pulse" />
            Requiere Atención
          </h3>
          <p className={`text-xs font-medium mt-1 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
            Alertas de tu operativa hoy
          </p>
        </div>
        <Badge variant="warning">{alerts.length}</Badge>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {alerts.map((alert, i) => (
          <div
            key={i}
            className={`group p-4 m-1 rounded-xl border transition-all duration-300 hover:shadow-md cursor-pointer ${
              isDarkMode
                ? `bg-[#252429]/40 border-white/5 hover:bg-[#252429]/80 ${colorMap[alert.iconColor].border}`
                : `bg-white/50 border-black/5 hover:bg-white ${colorMap[alert.iconColor].border}`
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 p-1.5 rounded-lg flex-shrink-0 ${colorMap[alert.iconColor].bg}`}>
                <alert.icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`text-sm font-bold ${isDarkMode ? 'text-[#D8D7D9] group-hover:text-white' : 'text-[#111113]'}`}>
                  {alert.title}
                </h4>
                <p className={`text-xs mt-0.5 font-medium leading-relaxed ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                  {alert.body}
                </p>
                {alert.action && (
                  <div className="mt-3 opacity-60 group-hover:opacity-100 transition-opacity">
                    <Button variant={alert.action.variant} size="sm" className="!py-1 !h-7 !text-[10px] w-full">
                      {alert.action.label}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

/* ─────────────────────────────────────────────────────────────
   DashboardView (root)
───────────────────────────────────────────────────────────── */
export default function DashboardView({ onNewLink, onViewTransactions }) {
  const { isDarkMode } = useTheme()

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className={`text-3xl font-bold mb-2 tracking-tight ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
            Buenas noches, Admin 👋
          </h1>
          <p className={`text-sm font-medium ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
            Aquí tienes el pulso financiero de tus sucursales hoy.
          </p>
        </div>
        <Button onClick={onNewLink} className="hidden md:flex">
          <Plus size={18} /> Nueva Reserva
        </Button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {KPIS.map((kpi, i) => <KpiCard key={i} kpi={kpi} />)}
      </div>

      {/* Middle row: Quick cobro + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <QuickLinkCard onNewLink={onNewLink} />
        <ChartCard />
      </div>

      {/* Bottom row: Live feed + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <LiveFeed onViewAll={onViewTransactions} />
        <AlertsPanel />
      </div>
    </div>
  )
}
