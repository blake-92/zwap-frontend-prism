import { useState, useEffect, useRef } from 'react'
import { X, Building2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/shared/context/ThemeContext'
import { Button, Input } from '@/shared/ui'

const SPRING = { type: 'spring', stiffness: 400, damping: 30 }

export default function NewBranchModal({ onClose }) {
  const { isDarkMode } = useTheme()
  const { t } = useTranslation()
  const containerRef = useRef(null)
  const [name, setName]       = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity]       = useState('')

  // ESC key handler
  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Body scroll lock
  useEffect(() => {
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = original }
  }, [])

  // Focus trap
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const getFocusable = () => el.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    const initial = getFocusable()
    if (initial.length > 0) initial[0].focus()
    const handleTab = (e) => {
      if (e.key !== 'Tab') return
      const focusable = getFocusable()
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', handleTab)
    return () => document.removeEventListener('keydown', handleTab)
  }, [])

  const fields = [
    { label: t('branches.branchName'), val: name, set: setName, ph: t('branches.branchNamePlaceholder'), full: true },
    { label: t('branches.address'),    val: address, set: setAddress, ph: t('branches.addressPlaceholder'), full: false },
    { label: t('branches.cityRegion'), val: city,    set: setCity,    ph: t('branches.cityRegionPlaceholder'), full: false },
  ]

  return (
    <motion.div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label={t('branches.newBranch')}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className={`absolute inset-0 backdrop-blur-md backdrop-saturate-200 ${isDarkMode ? 'bg-black/70' : 'bg-[#111113]/40'}`}
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{
          opacity: { duration: 0.15 },
          scale: SPRING,
          y: SPRING,
        }}
        className={`relative w-full max-w-[480px] rounded-t-[24px] sm:rounded-[24px] border overflow-hidden shadow-2xl max-h-[95vh] sm:max-h-[90vh] ${
        isDarkMode
          ? 'bg-[#252429]/80 backdrop-blur-3xl border-white/20 border-t-white/30'
          : 'bg-white/90 backdrop-blur-3xl border-white shadow-[0_20px_60px_rgba(0,0,0,0.15)]'
      }`}>

        {/* Header */}
        <div className={`px-5 sm:px-8 py-5 sm:py-6 border-b flex justify-between items-start ${isDarkMode ? 'border-white/10' : 'border-black/5'}`}>
          <div>
            <h2 className={`text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
              <Building2 className="text-[#7C3AED]" size={24} /> {t('branches.newBranch')}
            </h2>
            <p className={`text-sm mt-1 font-medium ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
              {t('branches.modalDescription')}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X size={20} /></Button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-8 space-y-5">
          {fields.filter(f => f.full).map(({ label, val, set, ph }) => (
            <div key={label}>
              <label className={`block text-xs font-bold tracking-widest mb-2 ${isDarkMode ? 'text-[#B0AFB4]' : 'text-[#67656E]'}`}>
                {label.toUpperCase()}
              </label>
              <Input
                value={val}
                onChange={e => set(e.target.value)}
                placeholder={ph}
              />
            </div>
          ))}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.filter(f => !f.full).map(({ label, val, set, ph }) => (
              <div key={label}>
                <label className={`block text-xs font-bold tracking-widest mb-2 ${isDarkMode ? 'text-[#B0AFB4]' : 'text-[#67656E]'}`}>
                  {label.toUpperCase()}
                </label>
                <Input
                  value={val}
                  onChange={e => set(e.target.value)}
                  placeholder={ph}
                />
              </div>
            ))}
          </div>

          <p className={`text-xs font-medium ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
            {t('branches.postCreateHint')}
          </p>
        </div>

        {/* Footer */}
        <div className={`px-5 sm:px-8 py-5 sm:py-6 flex gap-3 sm:gap-4 border-t ${isDarkMode ? 'bg-[#111113]/40 border-white/10' : 'bg-gray-50/50 border-black/5'}`}>
          <Button variant="outline" className="flex-1 !py-3.5" onClick={onClose}>{t('common.cancel')}</Button>
          <Button className="flex-1 !py-3.5" disabled={!name.trim() || !address.trim() || !city.trim()}>
            <Building2 size={18} /> {t('branches.createBranch')}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}
