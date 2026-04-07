import { useState } from 'react'
import { MousePointerClick, QrCode, Copy, ExternalLink } from 'lucide-react'
import { useTheme } from '@/shared/context/ThemeContext'
import { useToast } from '@/shared/context/ToastContext'
import { Card, Button, SegmentControl } from '@/shared/ui'
import { PERMANENT_LINKS } from '@/services/mocks/mockData'

export default function QuickLinkCard({ onNewLink }) {
  const { isDarkMode }    = useTheme()
  const { addToast }      = useToast()
  const activeLinks       = PERMANENT_LINKS.filter(l => l.active)
  const [active, setActive] = useState(activeLinks[0]?.id ?? null)
  const selected          = PERMANENT_LINKS.find(l => l.id === active) ?? activeLinks[0]

  const handleCopy = () => {
    if (selected?.url) {
      navigator.clipboard.writeText(selected.url)
      addToast(`Enlace "${selected.name}" copiado al portapapeles.`, 'success')
    }
  }

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
        <div className="w-full mb-6">
          <SegmentControl
            options={activeLinks.map(l => ({ value: l.id, label: l.name }))}
            value={active}
            onChange={setActive}
            layoutId="quickLinkTab"
          />
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
          <Button className="w-full !py-2.5 shadow-lg" onClick={handleCopy}>
            <Copy size={16} /> Copiar Enlace
          </Button>
        </div>
      </div>
    </Card>
  )
}
