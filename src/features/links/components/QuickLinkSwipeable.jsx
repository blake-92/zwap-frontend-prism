import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QrCode, Copy, ExternalLink, Maximize } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/shared/context/ThemeContext'
import { useToast } from '@/shared/context/ToastContext'
import { Card, Toggle, QrLightbox } from '@/shared/ui'
import { SPRING_DOTS } from '@/shared/utils/springs'
import useMediaQuery from '@/shared/hooks/useMediaQuery'

export default function QuickLinkSwipeable({ links, onToggle }) {
  const { isDarkMode } = useTheme()
  const { addToast }   = useToast()
  const { t }          = useTranslation()
  const isMobile       = useMediaQuery('(max-width: 639px)')

  const [index, setIndex] = useState(
    () => Math.max(0, links.findIndex(l => l.active))
  )
  const [isQrOpen, setIsQrOpen] = useState(false)

  const selected = links[index]

  const goNext = () => setIndex(i => (i + 1) % links.length)
  const goPrev = () => setIndex(i => (i - 1 + links.length) % links.length)

  return (
    <>
      <Card className="p-0 overflow-hidden bg-gradient-to-b from-[#7C3AED]/5 to-transparent">
        <div className="flex items-stretch">

          {/* ── Izquierda: área swipeable — QR + nombre/url + dots ── */}
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.12}
            style={{ touchAction: 'pan-y' }}
            onDragEnd={(_, info) => {
              if (info.velocity.x < -200 || info.offset.x < -50) goNext()
              else if (info.velocity.x > 200 || info.offset.x > 50) goPrev()
            }}
            className="flex-1 flex items-center gap-4 px-4 py-4 min-w-0 cursor-grab active:cursor-grabbing select-none"
          >
            {/* QR — tap abre lightbox */}
            <motion.div
              layoutId="ql-qr-mini"
              onClick={() => selected.active && setIsQrOpen(true)}
              className={`relative flex-shrink-0 bg-white p-3 rounded-2xl shadow-lg border border-gray-100 group ${
                selected.active ? 'cursor-pointer' : 'cursor-default'
              }`}
            >
              <QrCode
                size={84}
                className={`text-black transition-opacity duration-300 ${
                  selected.active ? 'opacity-100' : 'opacity-10'
                }`}
                strokeWidth={1.5}
              />
              <AnimatePresence>
                {!selected.active && (
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
              {selected.active && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/[0.04] rounded-2xl opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-[#7C3AED] rounded-full p-1.5 shadow-md">
                    <Maximize size={11} className="text-white" />
                  </div>
                </div>
              )}
            </motion.div>

            {/* Nombre + URL + dots */}
            <div className="flex flex-col gap-1 min-w-0 flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selected.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.13 }}
                >
                  <p className={`text-sm font-bold truncate ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
                    {selected.name}
                  </p>
                  <p className={`text-[10px] font-mono truncate mt-0.5 ${
                    selected.active
                      ? isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'
                      : isDarkMode ? 'text-[#45434A]' : 'text-[#C5C3CC]'
                  }`}>
                    {selected.url}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Pill dots — la activa se expande */}
              <div className="flex gap-1.5 mt-2.5">
                {links.map((link, i) => (
                  <motion.div
                    key={link.id}
                    animate={{
                      width: i === index ? 16 : 6,
                      backgroundColor: i === index
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

          {/* ── Divisor ── */}
          <div className={`w-px my-3 flex-shrink-0 ${isDarkMode ? 'bg-white/8' : 'bg-black/5'}`} />

          {/* ── Derecha: columna de acciones ── */}
          <div className="flex flex-col items-center justify-center gap-2.5 px-3 py-4 flex-shrink-0">
            <button
              disabled={!selected.active}
              onClick={() => {
                if (!selected.active) return
                navigator.clipboard.writeText(`https://${selected.url}`)
                const key = isMobile ? 'links.linkCopiedShort' : 'links.linkCopied'
                addToast(t(key, { name: selected.name }), 'success')
              }}
              className={`p-2 rounded-xl transition-colors ${
                selected.active
                  ? isDarkMode
                    ? 'text-[#D8D7D9] hover:bg-white/8 active:bg-white/12'
                    : 'text-[#45434A] hover:bg-black/5 active:bg-black/8'
                  : 'opacity-25 cursor-not-allowed'
              }`}
            >
              <Copy size={16} />
            </button>

            <div className={`w-5 border-t ${isDarkMode ? 'border-white/8' : 'border-black/6'}`} />

            <button
              disabled={!selected.active}
              onClick={() => {
                if (!selected.active) return
                window.open(`https://${selected.url}`, '_blank')
              }}
              className={`p-2 rounded-xl transition-colors ${
                selected.active
                  ? isDarkMode
                    ? 'text-[#D8D7D9] hover:bg-white/8 active:bg-white/12'
                    : 'text-[#45434A] hover:bg-black/5 active:bg-black/8'
                  : 'opacity-25 cursor-not-allowed'
              }`}
            >
              <ExternalLink size={16} />
            </button>

            <div className={`w-5 border-t ${isDarkMode ? 'border-white/8' : 'border-black/6'}`} />

            <Toggle
              active={selected.active}
              onToggle={() => onToggle(selected.id)}
            />
          </div>
        </div>
      </Card>

      {/* Lightbox fullscreen */}
      <QrLightbox
        isOpen={isQrOpen && !!selected}
        onClose={() => setIsQrOpen(false)}
        layoutId="ql-qr-mini"
        name={selected?.name}
        url={selected?.url}
        qrSize={260}
      />
    </>
  )
}
