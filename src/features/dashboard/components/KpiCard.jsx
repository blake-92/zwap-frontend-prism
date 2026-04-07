import { StatCard } from '@/shared/ui'

export default function KpiCard({ kpi }) {
  return (
    <StatCard
      label={kpi.label}
      value={kpi.value}
      icon={kpi.icon}
      iconVariant={kpi.variant === 'default' ? 'default' : kpi.variant}
      badge={kpi.change}
      badgeVariant={kpi.variant === 'default' ? 'outline' : kpi.variant}
      badgeSuffix="vs. ayer"
    />
  )
}
