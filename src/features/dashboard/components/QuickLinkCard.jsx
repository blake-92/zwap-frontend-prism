import { useState } from 'react'
import { MousePointerClick, QrCode, Copy, ExternalLink, Maximize } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/shared/context/ThemeContext'
import { useToast } from '@/shared/context/ToastContext'
import { Card, Button, SegmentControl } from '@/shared/ui'
import { PERMANENT_LINKS } from '@/services/mocks/mockData'

export default function QuickLinkCard() {
  const { isDarkMode }    = useTheme()
  const { addToast }      = useToast()
  const activeLinks       = PERMANENT_LINKS.filter(l => l.active)
  const [active, setActive] = useState(activeLinks[0]?.id ?? null)
  const selected          = PERMANENT_LINKS.find(l => l.id === active) ?? activeLinks[0]
  
  const [isQrMaximized, setIsQrMaximized] = useState(false)

  const handleCopy = () => {
    if (selected?.url) {
      navigator.clipboard.writeText(selected.url)
      addToast(`Enlace "${selected.name}" copiado al portapapeles.`, 'success')
    }
  }

  return (
    <>
      <Card className="p-0 flex flex-col bg-gradient-to-b from-[#7C3AED]/5 to-transparent relative z-10">
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
          <div className="w-full mb-6">
            <SegmentControl
              options={activeLinks.map(l => ({ value: l.id, label: l.name }))}
              value={active}
              onChange={setActive}
              layoutId="quickLinkTab"
            />
          </div>

          {/* QR Code placeholder */}
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

          {/* URL + CTA */}
          <div className="text-center w-full mt-auto">
            <p className={`text-[11px] font-mono font-bold mb-3 truncate ${isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]'}`}>
              {selected?.url}
            </p>
            <div className="grid grid-cols-2 gap-3 w-full">
              <Button variant="outline" className="w-full !py-2.5 shadow-sm" onClick={handleCopy}>
                <Copy size={16} /> Copiar
              </Button>
              <Button className="w-full !py-2.5 shadow-lg" onClick={() => window.open(selected.url, '_blank')}>
                <ExternalLink size={16} /> Abrir
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Lightbox / Fullscreen QR */}
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
              <p className="text-[#111113] font-bold text-xl mb-1 text-center">{selected?.name}</p>
              <p className="text-[#67656E] font-mono text-sm text-center">{selected?.url}</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
