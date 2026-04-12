import { useState, useMemo } from 'react'
import { DayPicker } from 'react-day-picker'
import { es, enUS } from 'react-day-picker/locale'
import { CalendarDays, Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/shared/context/ThemeContext'
import useMediaQuery from '@/shared/hooks/useMediaQuery'
import Modal from './Modal'
import Button from './Button'

const MINUTES = ['00', '15', '30', '45']

/**
 * DatePickerModal — Prism UI
 *
 * Modal dedicado para selección de fecha y hora.
 * Desktop: react-day-picker + time picker custom
 * Mobile:  inputs nativos (type="date" + type="time") para UX nativa del OS
 *
 * Props:
 *   selectedDate  string|null   — "12 Abr 2026" format
 *   onSelect      fn(label)     — callback con string de fecha
 *   timeValue     string        — "HH:MM"
 *   onTimeChange  fn(value)     — callback con string de hora
 *   onConfirm     fn()          — cierra y confirma
 *   onClose       fn()          — cierra sin confirmar
 */
export default function DatePickerModal({ selectedDate, onSelect, timeValue = '14:00', onTimeChange, onConfirm, onClose }) {
  const { t, i18n } = useTranslation()
  const { isDarkMode } = useTheme()
  const isMobile = !useMediaQuery('(min-width: 640px)')
  const monthsShort = t('calendar.monthsShort', { returnObjects: true })
  const locale = i18n.language === 'es' ? es : enUS

  // Parse selectedDate string → Date object for DayPicker
  const selectedDay = useMemo(() => {
    if (!selectedDate) return undefined
    const parts = selectedDate.split(' ')
    if (parts.length !== 3) return undefined
    const day = parseInt(parts[0])
    const monthIdx = monthsShort.indexOf(parts[1])
    const year = parseInt(parts[2])
    if (isNaN(day) || monthIdx === -1 || isNaN(year)) return undefined
    return new Date(year, monthIdx, day)
  }, [selectedDate, monthsShort])

  // Parse selectedDate → native input value (YYYY-MM-DD)
  const nativeDateValue = useMemo(() => {
    if (!selectedDay) return ''
    const y = selectedDay.getFullYear()
    const m = String(selectedDay.getMonth() + 1).padStart(2, '0')
    const d = String(selectedDay.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }, [selectedDay])

  const handleDayClick = (day) => {
    if (!day) return
    const label = `${day.getDate()} ${monthsShort[day.getMonth()]} ${day.getFullYear()}`
    onSelect(label)
  }

  const handleNativeDateChange = (e) => {
    const val = e.target.value
    if (!val) return
    const [y, m, d] = val.split('-').map(Number)
    const label = `${d} ${monthsShort[m - 1]} ${y}`
    onSelect(label)
  }

  const handleNativeTimeChange = (e) => {
    onTimeChange(e.target.value)
  }

  const [hh, mm] = timeValue.split(':')

  const themeClass = isDarkMode ? 'rdp-prism-dark' : 'rdp-prism-light'

  const inputClass = `w-full rounded-xl px-4 py-3 border text-sm font-medium outline-none transition-all ${
    isDarkMode
      ? 'bg-[#252429] border-white/10 text-white focus:border-[#7C3AED]/60'
      : 'bg-gray-50 border-gray-200 text-[#111113] focus:border-[#7C3AED]/40'
  }`

  const footer = (
    <Button
      className="w-full !py-3.5"
      onClick={onConfirm}
      disabled={!selectedDate}
    >
      <CalendarDays size={16} /> {t('calendar.confirmDate')}
    </Button>
  )

  return (
    <Modal
      onClose={onClose}
      icon={<CalendarDays size={18} />}
      title={t('calendar.selectDateTime')}
      maxWidth="380px"
      footer={footer}
    >
      <div className="p-5 sm:p-6">
        {isMobile ? (
          /* ── Mobile: native pickers ── */
          <div className="space-y-5">
            <div>
              <label className={`block text-xs font-bold tracking-wide mb-2 ${isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]'}`}>
                <CalendarDays size={12} className="inline mr-1.5 text-[#7C3AED]" />
                {t('filters.date')}
              </label>
              <input
                type="date"
                value={nativeDateValue}
                onChange={handleNativeDateChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className={`block text-xs font-bold tracking-wide mb-2 ${isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]'}`}>
                <Clock size={12} className="inline mr-1.5 text-[#7C3AED]" />
                {t('calendar.deadline')}
              </label>
              <input
                type="time"
                value={timeValue}
                onChange={handleNativeTimeChange}
                className={inputClass}
              />
            </div>
          </div>
        ) : (
          /* ── Desktop: react-day-picker + custom time ── */
          <div className="space-y-4">
            <div className={themeClass}>
              <DayPicker
                mode="single"
                selected={selectedDay}
                onSelect={handleDayClick}
                locale={locale}
                weekStartsOn={1}
                showOutsideDays
                fixedWeeks
              />
            </div>

            {/* Time picker */}
            <div className={`pt-4 border-t ${isDarkMode ? 'border-white/10' : 'border-gray-100'}`}>
              <span className={`text-[11px] font-bold flex items-center gap-1.5 mb-3 ${isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]'}`}>
                <Clock size={12} className="text-[#7C3AED]" /> {t('calendar.deadline')}
              </span>

              {/* Hour presets */}
              <div className={`grid grid-cols-6 gap-1 p-1 rounded-xl border ${
                isDarkMode ? 'bg-[#252429]/80 border-white/10' : 'bg-gray-50 border-gray-200'
              }`}>
                {['06', '08', '10', '12', '14', '18'].map(h => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => onTimeChange(`${h}:${mm}`)}
                    className={`py-1.5 rounded-lg text-[11px] font-mono font-semibold transition-all ${
                      hh === h
                        ? 'bg-[#7C3AED] text-white shadow-sm'
                        : isDarkMode
                          ? 'text-[#888991] hover:text-white hover:bg-white/10'
                          : 'text-[#67656E] hover:text-[#111113] hover:bg-gray-100'
                    }`}
                  >
                    {h}:00
                  </button>
                ))}
              </div>

              {/* Manual input + minute presets */}
              <div className="flex gap-2 items-center mt-2">
                <div className={`flex items-center gap-1 rounded-xl px-3 py-2 border flex-1 ${
                  isDarkMode
                    ? 'bg-[#252429]/80 border-white/10 focus-within:border-[#7C3AED]/60'
                    : 'bg-gray-50 border-gray-200 focus-within:border-[#7C3AED]/40'
                }`}>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={2}
                    className={`w-6 text-center text-xs font-mono font-semibold outline-none bg-transparent ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}
                    value={hh}
                    onChange={e => {
                      let v = e.target.value.replace(/\D/g, '')
                      if (v.length === 2 && parseInt(v) > 23) v = '23'
                      onTimeChange(`${v}:${mm}`)
                    }}
                    onBlur={e => {
                      let v = e.target.value
                      if (!v) v = '00'
                      if (v.length === 1) v = `0${v}`
                      onTimeChange(`${v}:${mm}`)
                    }}
                  />
                  <span className={`text-xs font-mono font-bold ${isDarkMode ? 'text-[#888991]' : 'text-gray-400'}`}>:</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={2}
                    className={`w-6 text-center text-xs font-mono font-semibold outline-none bg-transparent ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}
                    value={mm}
                    onChange={e => {
                      let v = e.target.value.replace(/\D/g, '')
                      if (v.length === 2 && parseInt(v) > 59) v = '59'
                      onTimeChange(`${hh}:${v}`)
                    }}
                    onBlur={e => {
                      let v = e.target.value
                      if (!v) v = '00'
                      if (v.length === 1) v = `0${v}`
                      onTimeChange(`${hh}:${v}`)
                    }}
                  />
                </div>
                <div className={`grid grid-cols-4 gap-1 p-1 rounded-xl border ${
                  isDarkMode ? 'bg-[#252429]/80 border-white/10' : 'bg-gray-50 border-gray-200'
                }`}>
                  {MINUTES.map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => onTimeChange(`${hh}:${m}`)}
                      className={`px-2 py-1.5 rounded-lg text-[11px] font-mono font-semibold transition-all ${
                        mm === m
                          ? 'bg-[#7C3AED] text-white shadow-sm'
                          : isDarkMode
                            ? 'text-[#888991] hover:text-white hover:bg-white/10'
                            : 'text-[#67656E] hover:text-[#111113] hover:bg-gray-100'
                      }`}
                    >
                      :{m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
