import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTheme } from '@/shared/context/ThemeContext'
import Button from './Button'

export default function MiniCalendar({ selectedDate, onSelect, timeValue, onTimeChange, onConfirm }) {
  const { isDarkMode } = useTheme()

  return (
    <div className={`absolute top-full left-0 mt-2 p-3 w-[250px] rounded-2xl z-50 shadow-[0_30px_60px_rgba(0,0,0,0.5)] animate-scale-in border ${
      isDarkMode ? 'bg-[#111113] border-white/20' : 'bg-white border-gray-200 shadow-xl'
    }`}>
      <div className="flex justify-between items-center mb-3">
        <Button variant="ghost" size="icon" className="!h-6 !w-6"><ChevronLeft size={12} /></Button>
        <span className={`text-[11px] font-bold ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>Abril 2026</span>
        <Button variant="ghost" size="icon" className="!h-6 !w-6"><ChevronRight size={12} /></Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {['Lu','Ma','Mi','Ju','Vi','Sa','Do'].map(d => (
          <div key={d} className={`text-[9px] font-bold ${isDarkMode ? 'text-[#888991]' : 'text-[#B0AFB4]'}`}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {[...Array(30)].map((_, i) => {
          const day   = i + 1
          const label = `${day} Abr 2026`
          return (
            <button
              key={day}
              onClick={() => onSelect(label)}
              className={`h-7 w-7 rounded-md text-[11px] font-semibold flex items-center justify-center transition-all ${
                selectedDate === label
                  ? 'bg-[#7C3AED] text-white shadow-md'
                  : isDarkMode ? 'text-[#D8D7D9] hover:bg-white/10' : 'text-[#45434A] hover:bg-gray-100'
              }`}
            >{day}</button>
          )
        })}
      </div>

      <div className={`mt-3 pt-3 border-t flex justify-between items-center ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
        <span className={`text-[10px] font-bold ${isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]'}`}>Hora Límite:</span>
        <div className={`flex items-center gap-1 rounded-md px-2 py-1 border transition-all ${
          isDarkMode ? 'bg-[#252429] border-white/20 focus-within:border-[#7C3AED]/60' : 'bg-gray-50 border-gray-300 focus-within:border-[#7C3AED]/40'
        }`}>
          <input type="text" maxLength={2} className={`w-5 text-center text-[11px] font-mono outline-none bg-transparent ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}
            value={timeValue.split(':')[0]}
            onChange={e => { let v = e.target.value.replace(/\D/g,''); if(v.length===2&&parseInt(v)>23)v='23'; onTimeChange(`${v}:${timeValue.split(':')[1]}`) }}
            onBlur={e => { let v=e.target.value; if(!v)v='00'; if(v.length===1)v=`0${v}`; onTimeChange(`${v}:${timeValue.split(':')[1]}`) }}
          />
          <span className={`text-[11px] font-mono ${isDarkMode ? 'text-[#888991]' : 'text-gray-400'}`}>:</span>
          <input type="text" maxLength={2} className={`w-5 text-center text-[11px] font-mono outline-none bg-transparent ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}
            value={timeValue.split(':')[1]}
            onChange={e => { let v=e.target.value.replace(/\D/g,''); if(v.length===2&&parseInt(v)>59)v='59'; onTimeChange(`${timeValue.split(':')[0]}:${v}`) }}
            onBlur={e => { let v=e.target.value; if(!v)v='00'; if(v.length===1)v=`0${v}`; onTimeChange(`${timeValue.split(':')[0]}:${v}`) }}
          />
        </div>
      </div>

      <Button className="w-full mt-3 !py-1.5 !text-xs" onClick={onConfirm} disabled={!selectedDate}>
        Confirmar Fecha
      </Button>
    </div>
  )
}
