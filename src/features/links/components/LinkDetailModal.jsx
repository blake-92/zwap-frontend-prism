import { Copy, Mail, QrCode, Eye, Timer, CalendarDays, ListTree, ExternalLink } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/shared/context/ThemeContext'
import { useToast } from '@/shared/context/ToastContext'
import { Button, Badge, Modal, SectionLabel } from '@/shared/ui'

export default function LinkDetailModal({ link, onClose, onEdit }) {
  const { isDarkMode } = useTheme()
  const { t } = useTranslation()
  const { addToast } = useToast()

  const url = `https://zwap.me/pay/${link.id}`

  const handleCopy = () => {
    navigator.clipboard.writeText(url)
    addToast(t('links.linkCopied', { name: link.client }), 'success')
  }

  const footer = (
    <>
      <Button variant="outline" className="flex-1 !py-3.5" onClick={onClose}>
        {t('common.close')}
      </Button>
      <Button
        className="flex-1 !py-3.5"
        disabled={link.status === 'Expirado' || link.status === 'Pagado'}
      >
        <Mail size={16} /> {t('links.send')}
      </Button>
    </>
  )

  return (
    <Modal
      onClose={onClose}
      icon={<ExternalLink size={24} />}
      title={t('links.linkDetail')}
      description={link.client}
      maxWidth="480px"
      footer={footer}
    >
      <div className="p-5 sm:p-8 space-y-6">

        {/* Amount + Status */}
        <div className="flex items-center justify-between">
          <span className={`font-mono font-bold text-3xl tracking-tighter ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
            ${link.amount}
          </span>
          <Badge variant={link.statusVariant} icon={link.StatusIcon}>
            {link.status}
          </Badge>
        </div>

        {/* Meta row: views + expiry + items */}
        <div className={`flex items-center gap-4 flex-wrap text-xs font-medium ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
          <span className="flex items-center gap-1.5">
            <Eye size={13} /> {link.views} {t('links.views')}
          </span>
          <span className="flex items-center gap-1.5">
            <ListTree size={13} /> {link.items} {t('dashboard.items')}
          </span>
          <span className={`flex items-center gap-1.5 ${link.status === 'Expirado' ? 'text-rose-500' : ''}`}>
            <Timer size={13} />
            {link.expires !== '-' ? t('links.expires', { date: link.expires }) : t('links.noExpiration')}
          </span>
        </div>

        {/* Client info */}
        <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-[#111113]/30 border-white/5' : 'bg-gray-50/50 border-black/5'}`}>
          <SectionLabel className="mb-3">{t('links.sentTo')}</SectionLabel>
          <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
            {link.client}
          </p>
          <p className={`text-xs font-medium mt-0.5 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
            {link.email}
          </p>
        </div>

        {/* Link URL — copiable */}
        <div>
          <SectionLabel className="mb-3">{t('links.linkUrl')}</SectionLabel>
          <div className={`flex items-center gap-2 p-3 rounded-xl border ${
            isDarkMode ? 'bg-[#111113]/30 border-white/5' : 'bg-gray-50/50 border-black/5'
          }`}>
            <span className={`flex-1 text-xs font-mono truncate ${isDarkMode ? 'text-[#A78BFA]' : 'text-[#7C3AED]'}`}>
              {url}
            </span>
            <Button variant="ghost" size="sm" className="!p-1.5 flex-shrink-0" onClick={handleCopy}>
              <Copy size={14} />
            </Button>
          </div>
        </div>

        {/* Dates */}
        <div className={`flex items-center gap-3 text-xs font-medium ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
          <CalendarDays size={13} />
          <span>{t('links.created', { date: link.createdAt })}</span>
        </div>

        {/* Quick actions */}
        <div className="flex gap-2">
          <Button
            variant="outline" size="sm" className="flex-1 !py-2.5 justify-center"
            onClick={handleCopy}
            disabled={link.status === 'Expirado'}
          >
            <Copy size={15} /> {t('links.copyLink')}
          </Button>
          <Button
            variant="outline" size="sm" className="flex-1 !py-2.5 justify-center"
            disabled={link.status === 'Expirado'}
          >
            <QrCode size={15} /> {t('links.generateQr')}
          </Button>
          <Button
            variant="outline" size="sm" className="flex-1 !py-2.5 justify-center"
            disabled={link.status === 'Pagado'}
            onClick={() => { onClose(); onEdit(link) }}
          >
            {t('common.edit')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
