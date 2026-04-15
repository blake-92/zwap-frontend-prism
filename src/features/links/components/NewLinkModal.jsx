import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Trash2, Mail, User, ListTree,
  Link as LinkIcon,
  CalendarDays,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/shared/context/ThemeContext'
import useMediaQuery from '@/shared/hooks/useMediaQuery'
import { SPRING } from '@/shared/utils/springs'
import { Button, Input, Modal, SegmentControl, DatePickerModal, SectionLabel } from '@/shared/ui'

export default function NewLinkModal({ onClose, link = null }) {
  const { isDarkMode } = useTheme()
  const { t } = useTranslation()
  const isDesktop = useMediaQuery('(min-width: 640px)')
  const isEditing = !!link

  const buildInitialItems = () => {
    if (!link) return [{ id: 1, desc: '', amount: '' }]
    const count = link.items || 1
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      desc: i === 0 ? (link.client || '') : '',
      amount: i === 0 ? (link.amount?.replace(/,/g, '') || '') : '',
    }))
  }

  const [items, setItems]               = useState(buildInitialItems)
  const [nextItemId, setNextItemId]     = useState((link?.items || 1) + 1)
  const [feeMode, setFeeMode]           = useState('hotel')
  const [clientFeePercent, setClientFeePercent] = useState(50)
  const [selectedDate, setSelectedDate] = useState(null)
  const [timeValue, setTimeValue]       = useState('14:00')
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [showConfirmClose, setShowConfirmClose] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const hasData = () => {
    const hasItems = items.some(it => it.desc.trim() !== '' || it.amount.trim() !== '')
    return hasItems || selectedDate !== null || feeMode !== 'hotel' || timeValue !== '14:00'
  }

  const handleClose = () => {
    if (hasData()) {
      setShowConfirmClose(true)
    } else {
      onClose()
    }
  }

  const addItem    = () => { setItems(prev => [...prev, { id: nextItemId, desc: '', amount: '' }]); setNextItemId(n => n + 1) }
  const removeItem = i  => setItems(prev => prev.filter((_, idx) => idx !== i))
  const updateItem = (i, field, val) => setItems(prev => prev.map((it, idx) => idx === i ? { ...it, [field]: val } : it))

  const handleGenerateLink = () => {
    setIsGenerating(true)
    setTimeout(() => { setIsGenerating(false); onClose() }, 1500)
  }

  const FEE_RATE = 0.03
  const subtotal = items.reduce((sum, it) => sum + (parseFloat(it.amount) || 0), 0)
  const totalFee = subtotal * FEE_RATE

  const clientFeeShare = feeMode === 'hotel' ? 0
    : feeMode === 'cliente' ? totalFee
    : totalFee * (clientFeePercent / 100)

  const total = subtotal + clientFeeShare

  const footer = (
    <div className="w-full space-y-4">
      {/* Fee bearer */}
      <div>
        <label className={`block text-[11px] font-bold tracking-wide mb-2 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
          {t('links.bankFee')}
        </label>
        <SegmentControl
          options={[
            { value: 'hotel', label: t('refund.hotelBearer') },
            { value: 'shared', label: t('links.feeShared') },
            { value: 'cliente', label: t('refund.clientBearer') },
          ]}
          value={feeMode}
          onChange={setFeeMode}
        />
      </div>

      {/* Slider for shared mode */}
      <AnimatePresence>
        {feeMode === 'shared' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={SPRING}
            className="overflow-hidden"
          >
            <div className={`rounded-xl p-3 ${isDarkMode ? 'bg-[#111113]/40 border border-white/5' : 'bg-gray-50/80 border border-black/5'}`}>
              <input
                type="range"
                min={10}
                max={90}
                step={10}
                value={clientFeePercent}
                onChange={e => setClientFeePercent(Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[#7C3AED] bg-gradient-to-r from-[#7C3AED]/20 to-[#7C3AED]/60"
                style={{
                  background: `linear-gradient(to right, ${isDarkMode ? '#7C3AED33' : '#7C3AED22'} 0%, ${isDarkMode ? '#7C3AED99' : '#7C3AED'} 100%)`,
                }}
              />
              <div className="flex justify-between mt-2">
                <span className={`text-[11px] font-bold ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                  {t('links.feeHotelShare', { percent: 100 - clientFeePercent })}
                </span>
                <span className={`text-[11px] font-bold text-[#7C3AED]`}>
                  {t('links.feeClientShare', { percent: clientFeePercent })}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary breakdown */}
      <div className={`rounded-xl p-3 space-y-2 font-mono text-xs ${isDarkMode ? 'bg-[#111113]/60 border border-white/5' : 'bg-gray-50 border border-black/5'}`}>
        <div className={`flex justify-between ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
          <span>{t('links.subtotal')} ({items.length}):</span>
          <span className={isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]'}>${subtotal.toFixed(2)}</span>
        </div>

        {feeMode === 'hotel' && (
          <div className={`flex justify-between ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
            <span>{t('links.stripeFee')}:</span>
            <span>{t('links.absorbed')}</span>
          </div>
        )}

        {feeMode === 'cliente' && (
          <div className={`flex justify-between ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
            <span>{t('links.feeClientLabel', { percent: 100 })}:</span>
            <span className={isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]'}>+${clientFeeShare.toFixed(2)}</span>
          </div>
        )}

        {feeMode === 'shared' && (
          <>
            <div className={`flex justify-between ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
              <span>{t('links.feeHotelLabel', { percent: 100 - clientFeePercent })}:</span>
              <span>{t('links.absorbed')}</span>
            </div>
            <div className={`flex justify-between ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
              <span>{t('links.feeClientLabel', { percent: clientFeePercent })}:</span>
              <span className={isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]'}>+${clientFeeShare.toFixed(2)}</span>
            </div>
          </>
        )}

        <div className={`flex justify-between items-end pt-2 mt-1 border-t ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
          <span className={`font-sans font-bold text-sm ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
            {t('links.totalCharge')}:
          </span>
          <span className="text-2xl font-bold tracking-tighter text-[#7C3AED]">
            ${total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* CTA */}
      <Button
        className="w-full !py-4 shadow-lg relative overflow-hidden"
        onClick={handleGenerateLink}
        disabled={isGenerating || !selectedDate || subtotal === 0}
      >
        {isGenerating ? (
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" />
            {isEditing ? t('links.saving') : t('common.generating')}...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <LinkIcon size={18} /> {isEditing ? t('links.saveChanges') : t('links.generateLink')}
          </span>
        )}
      </Button>
    </div>
  )

  return (
    <>
      {/* Date picker modal — z-[55] to stack above parent modal (z-50) */}
      {calendarOpen && (
        <div className="relative z-[55]">
          <DatePickerModal
            selectedDate={selectedDate}
            onSelect={setSelectedDate}
            timeValue={timeValue}
            onTimeChange={setTimeValue}
            onConfirm={() => setCalendarOpen(false)}
            onClose={() => setCalendarOpen(false)}
          />
        </div>
      )}

      <Modal
        onClose={handleClose}
        icon={<LinkIcon size={24} />}
        title={isEditing ? t('links.editLink') : t('links.createLink')}
        description={isDesktop ? (isEditing ? t('links.editLinkDesc') : t('links.generateDescription')) : undefined}
        maxWidth="580px"
        footer={footer}
        className="max-h-[95vh] sm:max-h-[90vh] flex flex-col"
      >
        <div className="p-5 sm:p-8 space-y-6">

          {/* ── Fecha de expiración ── */}
          <div>
            <SectionLabel className="flex items-center gap-2 mb-4">
              <CalendarDays size={14} /> {t('links.expirationDate')}
            </SectionLabel>
            <Button
              variant="outline"
              className={`w-full justify-start text-left font-normal ${!selectedDate && (isDarkMode ? '!text-[#888991]' : '!text-[#B0AFB4]')}`}
              onClick={() => setCalendarOpen(true)}
            >
              <CalendarDays size={16} className={`mr-2 flex-shrink-0 ${selectedDate ? 'text-[#7C3AED]' : 'opacity-50'}`} />
              <span className="truncate">
                {selectedDate ? `${selectedDate} – ${timeValue}` : t('links.selectDateTime')}
              </span>
            </Button>
          </div>

          {/* ── Cliente ── */}
          <div>
            <SectionLabel className="flex items-center gap-2 mb-4">
              <User size={14} /> {t('links.clientData')}
            </SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="link-client-name" className={`block text-xs font-bold tracking-wide mb-2 ${isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]'}`}>
                  {t('links.clientName')}
                </label>
                <Input id="link-client-name" type="text" placeholder={t('links.clientNamePlaceholder')} />
              </div>
              <div>
                <label htmlFor="link-client-email" className={`block text-xs font-bold tracking-wide mb-2 ${isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]'}`}>
                  {t('links.clientEmail')}
                </label>
                <Input id="link-client-email" icon={Mail} type="email" placeholder={t('links.clientEmailPlaceholder')} />
              </div>
            </div>
          </div>

          {/* ── Items ── */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <SectionLabel className="flex items-center gap-2">
                <ListTree size={14} /> {t('links.itemBuilder')}
              </SectionLabel>
              <Button variant="outline" size="sm" onClick={addItem} className="!h-8 !px-3">
                <Plus size={14} /> {t('links.addItem')}
              </Button>
            </div>

            <div className={`p-4 rounded-2xl border space-y-3 ${isDarkMode ? 'bg-[#111113]/30 border-white/5' : 'bg-gray-50/50 border-black/5'}`}>
              {items.map((item, idx) => (
                <div key={item.id} className="flex gap-2 sm:gap-3 items-start animate-fade-in">
                  <div className="flex-1 min-w-0">
                    <Input
                      type="text"
                      placeholder={t('links.conceptPlaceholder')}
                      value={item.desc}
                      onChange={e => updateItem(idx, 'desc', e.target.value)}
                    />
                  </div>
                  <div className="w-28 sm:w-32 flex-shrink-0">
                    <Input
                      type="number"
                      min="0"
                      placeholder={t('links.price')}
                      value={item.amount}
                      onChange={e => updateItem(idx, 'amount', e.target.value)}
                    />
                  </div>
                  {items.length > 1 ? (
                    <Button variant="danger" size="icon" onClick={() => removeItem(idx)} className="flex-shrink-0 mt-1">
                      <Trash2 size={16} />
                    </Button>
                  ) : (
                    <Button variant="ghost" size="icon" disabled className="flex-shrink-0 mt-1 opacity-20 cursor-not-allowed">
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Confirmation sub-modal — renders after parent in DOM so z-50 stacking is correct */}
      <AnimatePresence>
        {showConfirmClose && (
          <Modal
            onClose={() => setShowConfirmClose(false)}
            title={t('common.discardConfirmTitle')}
            maxWidth="360px"
            footer={
              <>
                <Button variant="ghost" className="flex-1" onClick={() => setShowConfirmClose(false)}>
                  {t('common.cancel')}
                </Button>
                <Button variant="danger" className="flex-1" onClick={onClose}>
                  {t('common.discardConfirmAction')}
                </Button>
              </>
            }
          >
            <p className={`px-5 sm:px-8 py-5 text-sm ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
              {t('common.discardConfirmBody')}
            </p>
          </Modal>
        )}
      </AnimatePresence>
    </>
  )
}
