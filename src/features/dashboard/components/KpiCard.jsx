import { StatCard } from '@/shared/ui'

export default function KpiCard({ kpi }) {
  // Only show "vs. ayer" suffix for percentage-based changes
  const isComparative = typeof kpi.change === 'string' && kpi.change.includes('%')

  return (
    <StatCard
      label={kpi.label}
      value={kpi.value}
      icon={kpi.icon}
      iconVariant={kpi.variant === 'default' ? 'default' : kpi.variant}
      badge={kpi.change}
      badgeVariant={kpi.variant === 'default' ? 'outline' : kpi.variant}
      badgeSuffix={isComparative ? 'vs. ayer' : undefined}
    />
  )
}
