import { useTheme } from '@/shared/context/ThemeContext'

/**
 * Stepper — Prism UI
 *
 * Indicador de progreso horizontal con conectores.
 *
 * Props:
 *   steps   array  — [{ label, sub, icon: LucideIcon, done: bool, active: bool }]
 */
export default function Stepper({ steps }) {
  const { isDarkMode } = useTheme()

  const connectorColor = (stepIndex) => {
    if (steps[stepIndex].done)   return 'bg-emerald-500/70'
    if (steps[stepIndex].active) return 'bg-[#7C3AED]/60'
    return isDarkMode ? 'bg-white/10' : 'bg-gray-200'
  }

  return (
    <div className="flex items-start w-full">
      {steps.map((step, i) => {
        const Icon  = step.icon
        const isLast = i === steps.length - 1
        return (
          <div key={step.label} className="flex items-start flex-1 min-w-0">
            <div className="flex flex-col items-center flex-1 min-w-0">

              {/* Circle + connectors row */}
              <div className="flex items-center w-full mb-3">
                {i > 0 && (
                  <div className={`flex-1 h-0.5 transition-colors ${connectorColor(i - 1)}`} />
                )}

                <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full transition-all duration-300 ${
                  step.done
                    ? 'bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                    : step.active
                      ? 'bg-[#7C3AED] text-white shadow-[0_0_20px_rgba(124,58,237,0.7)] outline outline-4 outline-[#7C3AED]/20'
                      : isDarkMode
                        ? 'bg-[#252429] border border-white/10 text-[#45434A]'
                        : 'bg-gray-100 border border-gray-200 text-gray-400'
                }`}>
                  <Icon size={14} className={step.active ? 'animate-spin-slow' : ''} />
                </div>

                {!isLast && (
                  <div className={`flex-1 h-0.5 transition-colors ${connectorColor(i)}`} />
                )}
              </div>

              {/* Label + subtitle */}
              <div className="text-center px-0.5">
                <p className={`text-[10px] font-bold leading-tight uppercase tracking-wide ${
                  step.done
                    ? 'text-emerald-500'
                    : step.active
                      ? isDarkMode ? 'text-white' : 'text-[#111113]'
                      : isDarkMode ? 'text-[#45434A]' : 'text-[#B0AFB4]'
                }`}>
                  {step.label}
                </p>
                <p className={`text-[9px] font-medium mt-0.5 ${
                  step.done
                    ? isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'
                    : step.active
                      ? isDarkMode ? 'text-[#A78BFA]' : 'text-[#7C3AED]'
                      : isDarkMode ? 'text-[#45434A]/60' : 'text-[#B0AFB4]/60'
                }`}>
                  {step.sub}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
