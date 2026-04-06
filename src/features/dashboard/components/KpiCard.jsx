import { useTheme } from '@/shared/context/ThemeContext'
import { Card, Badge } from '@/shared/ui'

export default function KpiCard({ kpi }) {
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
