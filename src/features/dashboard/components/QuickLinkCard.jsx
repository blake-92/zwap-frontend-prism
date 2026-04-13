import { useState, useEffect } from 'react'
import { MousePointerClick, QrCode, Copy, ExternalLink, Maximize } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/shared/context/ThemeContext'
import { useToast } from '@/shared/context/ToastContext'
import { Card, Button, SegmentControl } from '@/shared/ui'
import { PERMANENT_LINKS } from '@/services/mocks/mockData'
import useMediaQuery from '@/shared/hooks/useMediaQuery'

const SPRING_DOTS = { type: 'spring', stiffness: 420, damping: 32 }

export default function QuickLinkCard() {
  const { t }          = useTranslation()
  const { isDarkMode } = useTheme()
  const { addToast }   = useToast()
  const isDesktop      = useMediaQuery('(min-width: 1024px)')

  // Desktop: SegmentControl por link activo
  const activeLinks         = PERMANENT_LINKS.filter(l => l.active)
  const [active, setActive] = useState(activeLinks[0]?.id ?? null)
  const desktopSelected     = PERMANENT_LINKS.find(l => l.id === active) ?? activeLinks[0]

  // Mobile: swipe por todos los links
  const [mobileIndex, setMobileIndex] = useState(0)
  const mobileSelected = PERMANENT_LINKS[mobileIndex] ?? PERMANENT_LINKS[0]

  const [isQrMaximized, setIsQrMaximized] = useState(false)

  // Link que muestra el lightbox según modo activo
  const lightboxLink = isDesktop ? desktopSelected : mobileSelected

  useEffect(() => {
    if (!isQrMaximized) return
    const onKey = (e) => { if (e.key === 'Escape') setIsQrMaximized(false) }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [isQrMaximized])

  const handleCopy = () => {
    if (desktopSelected?.url) {
      navigator.clipboard.writeText(desktopSelected.url)
      const key = window.innerWidth < 640 ? 'links.linkCopiedShort' : 'links.linkCopied'
      addToast(t(key, { name: desktopSelected.name }), 'success')
    }
  }

  const goNext = () => setMobileIndex(i => (i + 1) % PERMANENT_LINKS.length)
  const goPrev = () => setMobileIndex(i => (i - 1 + PERMANENT_LINKS.length) % PERMANENT_LINKS.length)

  return (
    <>
      {isDesktop ? (
        /* ── Desktop: widget completo con tabs ── */
        <Card className="p-0 flex flex-col bg-gradient-to-b from-[#7C3AED]/5 to-transparent relative z-10">
          <div className={`p-6 border-b flex items-center justify-between ${isDarkMode ? 'border-white/10' : 'border-black/5'}`}>
            <div>
              <h3 className={`font-bold text-lg flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
                <MousePointerClick size={18} className="text-[#7C3AED]" />
                {t('dashboard.quickCharge')}
              </h3>
              <p className={`text-xs font-medium mt-1 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                {t('dashboard.scanToPay')}
              </p>
            </div>
          </div>

          <div className="p-6 flex flex-col items-center flex-1">
            <div className="w-full mb-6">
              <SegmentControl
                options={activeLinks.map(l => ({ value: l.id, label: l.name }))}
                value={active}
                onChange={setActive}
                layoutId="quickLinkTab"
              />
            </div>

            <motion.div
              layoutId="qr-code"
              onClick={() => setIsQrMaximized(true)}
              className="bg-white p-4 rounded-2xl shadow-xl border border-gray-100 mb-6 relative group cursor-pointer"
            >
              <QrCode size={140} className="text-black" strokeWidth={1.5} />
              <div className="absolute inset-0 flex items-center justify-center bg-black/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="action" size="icon" className="!rounded-full shadow-lg pointer-events-none">
                  <Maximize size={16} />
                </Button>
              </div>
            </motion.div>

            <div className="text-center w-full mt-auto">
              <p className={`text-[11px] font-mono font-bold mb-3 truncate ${isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]'}`}>
                {desktopSelected?.url}
              </p>
              <div className="grid grid-cols-2 gap-3 w-full">
                <Button variant="outline" className="w-full !py-2.5 shadow-sm" onClick={handleCopy}>
                  <Copy size={16} /> {t('dashboard.copy')}
                </Button>
                <Button className="w-full !py-2.5 shadow-lg" onClick={() => window.open(desktopSelected?.url, '_blank')}>
                  <ExternalLink size={16} /> {t('common.open')}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        /* ── Mobile: swipeable sin acciones — solo QR + info + dots ── */
        <Card className="p-0 overflow-hidden bg-gradient-to-b from-[#7C3AED]/5 to-transparent">
          {/* Header compacto */}
          <div className={`px-4 pt-3.5 pb-0 flex items-center gap-2 border-b ${isDarkMode ? 'border-white/10' : 'border-black/5'}`}>
            <MousePointerClick size={14} className="text-[#7C3AED] flex-shrink-0" />
            <p className={`text-xs font-bold pb-3.5 ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
              {t('dashboard.quickCharge')}
            </p>
          </div>

          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.12}
            style={{ touchAction: 'pan-y' }}
            onDragEnd={(_, info) => {
              if (info.velocity.x < -200 || info.offset.x < -50) goNext()
              else if (info.velocity.x > 200 || info.offset.x > 50) goPrev()
            }}
            className="flex items-center justify-center gap-4 px-6 py-4 cursor-grab active:cursor-grabbing select-none"
          >
            {/* QR */}
            <motion.div
              layoutId="qr-code"
              onClick={() => mobileSelected.active && setIsQrMaximized(true)}
              className={`relative flex-shrink-0 bg-white p-3 rounded-2xl shadow-lg border border-gray-100 group ${
                mobileSelected.active ? 'cursor-pointer' : 'cursor-default'
              }`}
            >
              <QrCode
                size={84}
                className={`text-black transition-opacity duration-300 ${
                  mobileSelected.active ? 'opacity-100' : 'opacity-10'
                }`}
                strokeWidth={1.5}
              />
              <AnimatePresence>
                {!mobileSelected.active && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/80 backdrop-blur-[2px]"
                  >
                    <span className="text-[9px] font-bold text-[#888991] uppercase tracking-wide">
                      {t('links.inactive')}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
              {mobileSelected.active && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/[0.04] rounded-2xl opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-[#7C3AED] rounded-full p-1.5 shadow-md">
                    <Maximize size={11} className="text-white" />
                  </div>
                </div>
              )}
            </motion.div>

            {/* Nombre + URL + dots */}
            <div className="flex flex-col gap-1 min-w-0 max-w-[160px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={mobileSelected.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.13 }}
                >
                  <p className={`text-sm font-bold truncate ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
                    {mobileSelected.name}
                  </p>
                  <p className={`text-[10px] font-mono truncate mt-0.5 ${
                    mobileSelected.active
                      ? isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'
                      : isDarkMode ? 'text-[#45434A]' : 'text-[#C5C3CC]'
                  }`}>
                    {mobileSelected.url}
                  </p>
                </motion.div>
              </AnimatePresence>

              <div className="flex gap-1.5 mt-2.5">
                {PERMANENT_LINKS.map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      width: i === mobileIndex ? 16 : 6,
                      backgroundColor: i === mobileIndex
                        ? '#7C3AED'
                        : isDarkMode ? '#45434A' : '#D1D0D6',
                    }}
                    transition={SPRING_DOTS}
                    className="h-1.5 rounded-full"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </Card>
      )}

      {/* Lightbox compartido */}
      <AnimatePresence>
        {isQrMaximized && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={() => setIsQrMaximized(false)}
            />
            <motion.div
              layoutId="qr-code"
              className="relative bg-white p-8 sm:p-12 rounded-[32px] shadow-2xl flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <QrCode size={280} className="text-black mb-6" strokeWidth={1.5} />
              <p className="text-[#111113] font-bold text-xl mb-1 text-center">{lightboxLink?.name}</p>
              <p className="text-[#67656E] font-mono text-sm text-center">{lightboxLink?.url}</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
