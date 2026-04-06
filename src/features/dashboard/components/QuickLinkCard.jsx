import { useState } from 'react'
import { MousePointerClick, QrCode, Copy, ExternalLink } from 'lucide-react'
import { useTheme } from '@/shared/context/ThemeContext'
import { Card, Button } from '@/shared/ui'
import { PERMANENT_LINKS } from '@/services/mocks/mockData'

export default function QuickLinkCard({ onNewLink }) {
  const { isDarkMode }    = useTheme()
  const activeLinks       = PERMANENT_LINKS.filter(l => l.active)
  const [active, setActive] = useState(activeLinks[0]?.id ?? null)
  const selected          = PERMANENT_LINKS.find(l => l.id === active) ?? activeLinks[0]

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
        <div className={`flex w-full rounded-xl p-1 mb-6 shadow-inner ${
          isDarkMode ? 'bg-black/60 border border-white/5' : 'bg-gray-200/50 border border-black/5'
        }`}>
          {activeLinks.map(link => (
            <button
              key={link.id}
              onClick={() => setActive(link.id)}
              className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all duration-300 truncate px-2 ${
                active === link.id
                  ? isDarkMode
                    ? 'bg-[#252429] text-white border border-white/10 shadow-[0_4px_15px_rgba(124,58,237,0.2)]'
                    : 'bg-white text-[#7C3AED] shadow-md border border-[#7C3AED]/20'
                  : isDarkMode
                    ? 'text-[#888991] hover:text-[#D8D7D9]'
                    : 'text-[#67656E] hover:text-[#111113]'
              }`}
            >
              {link.name}
            </button>
          ))}
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
          <Button className="w-full !py-2.5 shadow-lg">
            <Copy size={16} /> Copiar Enlace
          </Button>
        </div>
      </div>
    </Card>
  )
}
