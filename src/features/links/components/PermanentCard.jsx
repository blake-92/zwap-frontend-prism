import { QrCode, Copy, ExternalLink } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/shared/context/ThemeContext'
import { useToast } from '@/shared/context/ToastContext'
import { Card, Button, Toggle, Tooltip } from '@/shared/ui'
import useMediaQuery from '@/shared/hooks/useMediaQuery'

export default function PermanentCard({ link, onToggle }) {
  const { isDarkMode } = useTheme()
  const { addToast } = useToast()
  const { t } = useTranslation()
  const isMobile = useMediaQuery('(max-width: 639px)')

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://zwap.me/pay/${link.id}`)
    const key = isMobile ? 'links.linkCopiedShort' : 'links.linkCopied'
    addToast(t(key, { name: link.name }), 'success')
  }

  return (
    <Card className="p-6 relative group">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300 ${
          link.active
            ? isDarkMode ? 'bg-[#7C3AED]/15 text-[#7C3AED]' : 'bg-[#DBD3FB]/60 text-[#561BAF]'
            : isDarkMode ? 'bg-[#252429] text-[#888991]'    : 'bg-gray-100 text-[#67656E]'
        }`}>
          <QrCode size={22} />
        </div>
        <Toggle active={link.active} onToggle={onToggle} />
      </div>

      <h4 className={`text-lg font-bold tracking-tight mb-1 ${
        link.active
          ? isDarkMode ? 'text-white' : 'text-[#111113]'
          : isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'
      }`}>
        {link.name}
      </h4>
      <p className={`text-xs font-medium mb-6 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
        {link.desc}
      </p>

      <div className={`pt-4 border-t flex justify-between items-center ${isDarkMode ? 'border-white/10' : 'border-black/5'}`}>
        <div className="flex gap-2">
          <Tooltip content={t('links.viewQr')} position="top">
            <Button variant="ghost" size="icon" className="!p-1.5" disabled={!link.active}>
              <QrCode size={16} />
            </Button>
          </Tooltip>
          <Tooltip content={t('links.copyLink')} position="top">
            <Button variant="ghost" size="icon" className="!p-1.5" disabled={!link.active} onClick={handleCopy}>
              <Copy size={16} />
            </Button>
          </Tooltip>
        </div>
        <Button variant="outline" size="sm" disabled={!link.active} className="!py-1.5 !px-3 !text-xs">
          {t('common.open')} <ExternalLink size={12} />
        </Button>
      </div>
    </Card>
  )
}
