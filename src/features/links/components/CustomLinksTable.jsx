import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Download, ChevronDown, Edit2, Mail, Eye, Timer, ListTree, CalendarDays, Copy, QrCode } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/shared/context/ThemeContext'
import { useToast } from '@/shared/context/ToastContext'
import { Card, Button, Badge, Tooltip, TableToolbar, EmptySearchState, SwipeableCard } from '@/shared/ui'
import { listVariants, itemVariants, cardItemVariants } from '@/shared/utils/motionVariants'
import { CUSTOM_LINKS } from '@/services/mocks/mockData'
import useMediaQuery from '@/shared/hooks/useMediaQuery'

export default function CustomLinksTable({ onDetail, onEdit, search, onClearSearch }) {
  const { isDarkMode } = useTheme()
  const { addToast } = useToast()
  const { t } = useTranslation()
  const isMobile = useMediaQuery('(max-width: 639px)')

  const filtered = useMemo(() => CUSTOM_LINKS.filter(l =>
    !search || l.client.toLowerCase().includes(search.toLowerCase())
  ), [search])

  const handleCopy = (link) => {
    navigator.clipboard.writeText(`https://zwap.me/pay/${link.id}`)
    const key = isMobile ? 'links.linkCopiedShort' : 'links.linkCopied'
    addToast(t(key, { name: link.client }), 'success')
  }

  return (
    <>
      <TableToolbar
        actions={<Button variant="successExport" size="sm"><Download size={14} /> {t('common.exportCsv')}</Button>}
      >
        <Button variant="outline" size="sm">
          {t('filters.status')} <ChevronDown size={12} />
        </Button>
      </TableToolbar>

      {/* Table (desktop) */}
      <Card className="pb-2 hidden lg:block">
        <div className="overflow-x-auto">
          <table aria-label={t('links.title')} className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className={`text-[10px] uppercase font-bold tracking-widest ${
                isDarkMode ? 'text-[#888991] border-b border-white/10 bg-[#111113]/40' : 'text-[#67656E] border-b border-black/5 bg-white/50'
              }`}>
                <th className="px-8 py-4">{t('transactions.tableClient')}</th>
                <th className="px-6 py-4">{t('settlements.tableDetail')}</th>
                <th className="px-6 py-4">{t('settlements.tableTiming')}</th>
                <th className="px-6 py-4 text-center">{t('filters.status')}</th>
                <th className="px-8 py-4 text-right">{t('transactions.tableActions')}</th>
              </tr>
            </thead>
            <motion.tbody variants={listVariants} initial="hidden" animate="show">
              {filtered.length === 0 ? (
                <EmptySearchState colSpan={5} term={search} onClear={() => onClearSearch()} />
              ) : filtered.map((link) => (
                <motion.tr
                  variants={itemVariants}
                  key={link.id}
                  className={`group transition-colors duration-200 ${
                    isDarkMode
                      ? 'border-b border-white/5 hover:bg-[#7C3AED]/5 last:border-0'
                      : 'border-b border-black/5 hover:bg-[#DBD3FB]/20 last:border-0'
                  }`}
                >
                  {/* Cliente */}
                  <td className="px-8 py-4">
                    <div>
                      <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
                        {link.client}
                      </p>
                      <p className={`text-xs font-medium mt-0.5 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                        {link.email}
                      </p>
                    </div>
                  </td>

                  {/* Detalle */}
                  <td className="px-6 py-4">
                    <p className={`font-mono font-bold text-[15px] tracking-tight ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
                      ${link.amount}
                    </p>
                    <p className={`text-[11px] font-medium flex items-center gap-1.5 mt-1 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                      <ListTree size={12} className="opacity-70" /> {link.items} {t('dashboard.items')}
                    </p>
                  </td>

                  {/* Tiempos */}
                  <td className="px-6 py-4">
                    <p className={`text-xs font-bold flex items-center gap-1.5 ${
                      link.status === 'Expirado' ? 'text-rose-500' : isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]'
                    }`}>
                      <Timer size={14} className="opacity-70" />
                      {link.expires !== '-' ? t('links.expires', { date: link.expires }) : t('links.noExpiration')}
                    </p>
                    <p className={`text-[10px] font-medium flex items-center gap-1.5 mt-1 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                      <CalendarDays size={12} className="opacity-70" /> {t('links.created', { date: link.createdAt })}
                    </p>
                  </td>

                  {/* Estado */}
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center gap-1.5">
                      <Badge variant={link.statusVariant} icon={link.StatusIcon}>
                        {link.status}
                      </Badge>
                      <p className={`text-[10px] font-medium flex items-center gap-1 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                        <Eye size={10} /> {link.views} {t('links.views')}
                      </p>
                    </div>
                  </td>

                  {/* Acciones */}
                  <td className="px-8 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Tooltip content={t('common.edit')} position="top">
                        <Button variant="ghost" size="sm" className="!px-2" disabled={link.status === 'Pagado'} onClick={() => onEdit(link)}>
                          <Edit2 size={15} />
                        </Button>
                      </Tooltip>
                      <Tooltip content={t('links.copyLink')} position="top">
                        <Button
                          variant="ghost" size="sm" className="!px-2"
                          disabled={link.status === 'Expirado'}
                          onClick={() => handleCopy(link)}
                        >
                          <Copy size={15} />
                        </Button>
                      </Tooltip>
                      <Tooltip content={t('links.generateQr')} position="top">
                        <Button variant="ghost" size="sm" className="!px-2" disabled={link.status === 'Expirado'}>
                          <QrCode size={15} />
                        </Button>
                      </Tooltip>
                      <Tooltip content={t('users.sendByEmail')} position="top">
                        <Button
                          variant="action" size="sm" className="!px-3 ml-1"
                          disabled={link.status === 'Expirado' || link.status === 'Pagado'}
                        >
                          <Mail size={15} />
                          <span className="hidden xl:inline text-xs ml-1">{t('links.send')}</span>
                        </Button>
                      </Tooltip>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        </div>
      </Card>

      {/* Cards (mobile / tablet) — SwipeableCard with swipe-to-edit */}
      <div className="lg:hidden">
        {filtered.length > 0 ? (
          <motion.div variants={listVariants} initial="hidden" animate="show" className="space-y-3">
            {filtered.map((link) => (
              <motion.div key={link.id} variants={cardItemVariants}>
                <SwipeableCard
                  actions={[
                    {
                      label: t('common.edit'),
                      icon: Edit2,
                      disabled: link.status === 'Pagado',
                      onClick: () => onEdit(link),
                    },
                  ]}
                >
                  {/* Tappable area → opens detail modal */}
                  <div className="p-4" onClick={() => onDetail(link)}>
                    {/* Row 1: Client name + Amount */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <p className={`text-sm font-bold truncate min-w-0 ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
                        {link.client}
                      </p>
                      <span className={`font-mono font-bold text-lg tracking-tight flex-shrink-0 ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
                        ${link.amount}
                      </span>
                    </div>

                    {/* Row 2: Status + items/views + expiry */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5">
                        <Badge variant={link.statusVariant} icon={link.StatusIcon} />
                        <span className={`text-[10px] font-medium flex items-center gap-1 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                          <ListTree size={10} /> {link.items}
                        </span>
                        <span className={`text-[10px] font-medium flex items-center gap-1 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                          <Eye size={10} /> {link.views}
                        </span>
                      </div>
                      <span className={`text-[11px] font-bold flex items-center gap-1 ${
                        link.status === 'Expirado' ? 'text-rose-500' : isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'
                      }`}>
                        <Timer size={11} />
                        {link.expires !== '-' ? link.expires : t('links.noExpiration')}
                      </span>
                    </div>
                  </div>

                  {/* Row 3: Action buttons — outside tap area to prevent detail modal */}
                  <div className={`flex items-center gap-1.5 px-4 pb-4 ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
                    <Button
                      variant="ghost" size="sm" className="!p-2.5 flex-1 justify-center"
                      disabled={link.status === 'Expirado' || link.status === 'Pagado'}
                      onClick={(e) => { e.stopPropagation() }}
                    >
                      <Mail size={16} />
                    </Button>
                    <Button
                      variant="ghost" size="sm" className="!p-2.5 flex-1 justify-center"
                      disabled={link.status === 'Expirado'}
                      onClick={(e) => { e.stopPropagation(); handleCopy(link) }}
                    >
                      <Copy size={16} />
                    </Button>
                    <Button
                      variant="ghost" size="sm" className="!p-2.5 flex-1 justify-center"
                      disabled={link.status === 'Expirado'}
                      onClick={(e) => { e.stopPropagation() }}
                    >
                      <QrCode size={16} />
                    </Button>
                  </div>
                </SwipeableCard>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <Card className="p-8 text-center">
            <p className={`text-sm font-medium ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
              {search ? t('links.notFoundFor', { term: search }) : t('links.notFound')}
            </p>
            {search && (
              <Button variant="ghost" size="sm" onClick={() => onClearSearch()} className="mt-2">
                {t('common.clearSearch')}
              </Button>
            )}
          </Card>
        )}
      </div>
    </>
  )
}
