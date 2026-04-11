import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Trash2, Mail, User, ListTree,
  Star, Receipt, Link as LinkIcon,
  CalendarDays,
} from 'lucide-react'
import { useTheme } from '@/shared/context/ThemeContext'
import { Card, Button, Input, Modal, SegmentControl, MiniCalendar, SectionLabel } from '@/shared/ui'

export default function NewLinkModal({ onClose }) {
  const { isDarkMode } = useTheme()

  const [items, setItems]               = useState([{ id: 1, desc: '', amount: '' }])
  const [nextItemId, setNextItemId]     = useState(2)
  const [feeBearer, setFeeBearer]       = useState('hotel')
  const [selectedDate, setSelectedDate] = useState(null)
  const [timeValue, setTimeValue]       = useState('14:00')
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [showConfirmClose, setShowConfirmClose] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const hasData = () => {
    const hasItems = items.some(it => it.desc.trim() !== '' || it.amount.trim() !== '')
    return hasItems || selectedDate !== null || feeBearer !== 'hotel' || timeValue !== '14:00'
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

  const subtotal = items.reduce((sum, it) => sum + (parseFloat(it.amount) || 0), 0)
  const fee      = feeBearer === 'cliente' ? subtotal * 0.03 : 0
  const total    = subtotal + fee

  return (
    <>
      {/* Confirmation sub-modal */}
      <AnimatePresence>
        {showConfirmClose && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-md bg-black/60"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 26 }}
              className={`p-6 rounded-2xl border shadow-2xl max-w-[360px] ${
                isDarkMode ? 'bg-[#252429] border-white/20' : 'bg-white border-gray-200'
              }`}
            >
              <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
                ¿Descartar cambios?
              </h3>
              <p className={`text-sm mb-6 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                Tienes datos sin guardar. Si cierras ahora, perderás toda la información ingresada.
              </p>
              <div className="flex gap-3 justify-end">
                <Button variant="ghost" onClick={() => setShowConfirmClose(false)}>
                  Cancelar
                </Button>
                <Button variant="danger" onClick={onClose}>
                  Sí, descartar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Modal
        onClose={handleClose}
        icon={<LinkIcon size={24} />}
        title="Crear Link de Reserva"
        description="Genera un enlace de cobro con vencimiento e ítems detallados."
        maxWidth="1000px"
        className="max-h-[90vh] flex flex-col"
      >
        {/* Body: 60% left + 40% right */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">

          {/* ── LEFT: Cliente + Items ── */}
          <div className={`p-8 flex-[1.5] md:border-r overflow-y-auto ${isDarkMode ? 'border-white/10' : 'border-black/5'}`}>

            {/* Cliente */}
            <div className="mb-8">
              <SectionLabel className="flex items-center gap-2 mb-4"><User size={14} /> DATOS DEL CLIENTE</SectionLabel>
              <div className="space-y-4">
                <div>
                  <label className={`block text-xs font-bold tracking-wide mb-2 ${isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]'}`}>
                    Nombre del Titular
                  </label>
                  <Input type="text" placeholder="Ej: Alice Smith" />
                </div>
                <div>
                  <label className={`block text-xs font-bold tracking-wide mb-2 ${isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]'}`}>
                    Correo Electrónico
                  </label>
                  <Input icon={Mail} type="email" placeholder="alice@example.com" />
                </div>
              </div>
            </div>

            {/* Items */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-xs font-bold tracking-widest flex items-center gap-2 ${isDarkMode ? 'text-[#B0AFB4]' : 'text-[#67656E]'}`}>
                  <ListTree size={14} /> CONSTRUCTOR DE ÍTEMS
                </h3>
                <Button variant="outline" size="sm" onClick={addItem} className="!h-8 !px-3">
                  <Plus size={14} /> Añadir Ítem
                </Button>
              </div>

              <div className={`p-5 rounded-2xl border space-y-4 ${isDarkMode ? 'bg-[#111113]/30 border-white/5' : 'bg-gray-50/50 border-black/5'}`}>
                {items.map((item, idx) => (
                  <div key={item.id} className="flex gap-3 items-start animate-fade-in">
                    <div className="flex-1">
                      <Input
                        type="text"
                        placeholder="Concepto (Ej: Habitación Simple x2 noches)"
                        value={item.desc}
                        onChange={e => updateItem(idx, 'desc', e.target.value)}
                      />
                    </div>
                    <div className="w-32">
                      <Input
                        type="number"
                        min="0"
                        placeholder="Precio ($)"
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

          {/* ── RIGHT: Config + Summary ── */}
          <div className={`flex-1 flex flex-col relative overflow-hidden ${
            isDarkMode ? 'bg-gradient-to-b from-[#7C3AED]/10 to-transparent' : 'bg-gradient-to-b from-[#DBD3FB]/20 to-transparent'
          }`}>
            <div className="p-8 flex-1 overflow-y-auto">
              <SectionLabel className="flex items-center gap-2 mb-6"><Star size={14} /> CONFIGURACIÓN</SectionLabel>

              <div className="space-y-6">
                {/* Fecha */}
                <div>
                  <label className={`block text-xs font-bold tracking-wide mb-2 ${isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]'}`}>
                    Fecha/Hora de Expiración
                  </label>
                  <div className="relative">
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${!selectedDate && (isDarkMode ? '!text-[#888991]' : '!text-[#B0AFB4]')}`}
                      onClick={e => { e.stopPropagation(); setCalendarOpen(v => !v) }}
                    >
                      <CalendarDays size={16} className={`mr-2 ${selectedDate ? 'text-[#7C3AED]' : 'opacity-50'}`} />
                      {selectedDate ? `${selectedDate} a las ${timeValue}` : 'Seleccionar fecha y hora...'}
                    </Button>

                    {calendarOpen && (
                      <MiniCalendar
                        selectedDate={selectedDate}
                        onSelect={setSelectedDate}
                        timeValue={timeValue}
                        onTimeChange={setTimeValue}
                        onConfirm={() => setCalendarOpen(false)}
                      />
                    )}
                  </div>
                </div>

                {/* Fee bearer */}
                <div>
                  <label className={`block text-xs font-bold tracking-wide mb-2 ${isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]'}`}>
                    Comisión Bancaria (3%)
                  </label>
                  <SegmentControl
                    options={[{ value: 'hotel', label: 'El Hotel' }, { value: 'cliente', label: 'El Cliente' }]}
                    value={feeBearer}
                    onChange={setFeeBearer}
                  />
                </div>
              </div>

              {/* Summary ticket */}
              <Card className={`mt-8 !rounded-2xl ${isDarkMode ? '!bg-[#111113]/50 border-white/5' : '!bg-white/80 border-white'}`}>
                <div className="p-5">
                  <SectionLabel className="flex items-center gap-2 mb-4"><Receipt size={14} /> RESUMEN DEL LINK</SectionLabel>
                  <div className="space-y-3 font-mono text-sm">
                    <div className={`flex justify-between ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                      <span>Subtotal ({items.length} ítems):</span>
                      <span className={isDarkMode ? 'text-white' : 'text-[#111113]'}>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className={`flex justify-between ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                      <span>Comisión Stripe:</span>
                      <span>{feeBearer === 'cliente' ? `+$${fee.toFixed(2)}` : 'Absorbida'}</span>
                    </div>
                    <div className={`flex justify-between items-end pt-4 mt-4 border-t ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
                      <span className={`font-sans font-bold text-sm ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
                        Total a cobrar:
                      </span>
                      <span className="text-3xl font-bold tracking-tighter text-[#7C3AED]">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Footer CTA */}
            <div className={`p-6 border-t flex-shrink-0 backdrop-blur-xl ${isDarkMode ? 'border-white/10 bg-[#111113]/80' : 'border-black/5 bg-white/50'}`}>
              <Button
                className="w-full !py-4 shadow-lg relative overflow-hidden"
                onClick={handleGenerateLink}
                disabled={isGenerating || !selectedDate || subtotal === 0}
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" />
                    Generando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <LinkIcon size={18} /> Generar Link de Reserva
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}
