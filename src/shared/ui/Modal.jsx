import { X } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTheme } from '@/shared/context/ThemeContext'
import Button from './Button'

/**
 * Modal — Prism UI
 *
 * Wrapper glass estándar para modales de formulario.
 * Los modales de recibo (ReceiptModal, WithdrawReceiptModal) usan AnimatePresence
 * y diseño especializado — no usan este componente.
 *
 * Props:
 *   onClose       fn        — handler de cierre (backdrop + X button)
 *   title         string    — título del header (h2)
 *   description   node?     — subtítulo del header (puede ser JSX)
 *   icon          node?     — ícono junto al título (e.g. <ArrowUpFromLine />)
 *   maxWidth      string?   — ancho máximo del modal (default '480px')
 *   footer        node?     — contenido del footer (wrapped en barra con borde y fondo)
 *   className     string?   — clases extra en el contenedor interno (e.g. 'max-h-[90vh] flex flex-col')
 *   children      node      — cuerpo del modal
 */
export default function Modal({
  onClose,
  title,
  description,
  icon,
  maxWidth = '480px',
  footer,
  className = '',
  children,
}) {
  const { isDarkMode } = useTheme()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className={`absolute inset-0 backdrop-blur-md backdrop-saturate-200 ${
          isDarkMode ? 'bg-black/70' : 'bg-[#111113]/40'
        }`}
        onClick={onClose}
      />

      {/* Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        style={{ maxWidth }}
        className={`relative w-full rounded-[24px] border overflow-hidden shadow-2xl ${
          isDarkMode
            ? 'bg-[#252429]/80 backdrop-blur-3xl border-white/20 border-t-white/30'
            : 'bg-white/90 backdrop-blur-3xl border-white shadow-[0_20px_60px_rgba(0,0,0,0.15)]'
        } ${className}`}
      >
        {/* Header */}
        <div className={`px-8 py-6 border-b flex justify-between items-start flex-shrink-0 ${
          isDarkMode ? 'border-white/10' : 'border-black/5'
        }`}>
          <div>
            <h2 className={`text-2xl font-bold tracking-tight flex items-center gap-2 ${
              isDarkMode ? 'text-white' : 'text-[#111113]'
            }`}>
              {icon && <span className="text-[#7C3AED]">{icon}</span>}
              {title}
            </h2>
            {description && (
              <p className={`text-sm mt-1 font-medium ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                {description}
              </p>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>

        {/* Body */}
        {children}

        {/* Footer */}
        {footer && (
          <div className={`px-8 py-6 flex gap-4 border-t flex-shrink-0 ${
            isDarkMode ? 'bg-[#111113]/40 border-white/10' : 'bg-gray-50/50 border-black/5'
          }`}>
            {footer}
          </div>
        )}
      </motion.div>
    </div>
  )
}
