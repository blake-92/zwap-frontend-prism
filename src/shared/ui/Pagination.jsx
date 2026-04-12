import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/shared/context/ThemeContext'
import Button from './Button'

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const { t } = useTranslation()
  const { isDarkMode } = useTheme()

  if (totalPages <= 1) return null

  const getPages = () => {
    const pages = []
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        pages.push(i)
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        pages.push('...')
      }
    }
    return pages.filter((p, i, arr) => p !== '...' || arr[i - 1] !== '...')
  }

  return (
    <nav aria-label={t('pagination.showingPage', { current: currentPage, total: totalPages })} className={`flex items-center justify-between pt-4 border-t ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
      <span className={`text-xs font-medium ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
        {t('pagination.showingPage', { current: currentPage, total: totalPages })}
      </span>
      <div className="flex items-center gap-1.5">
        <Button variant="outline" size="icon" onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="!h-8 !w-8">
          <ChevronLeft size={14} />
        </Button>
        {getPages().map((p, idx) => (
          p === '...'
            ? <span key={`e-${idx}`} className={`px-2 text-xs font-bold ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>...</span>
            : <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`h-8 min-w-[32px] px-2 rounded-lg text-xs font-bold transition-all duration-300 flex items-center justify-center ${
                  currentPage === p
                    ? isDarkMode
                      ? 'bg-[#7C3AED]/20 text-[#A78BFA] border border-[#7C3AED]/30 shadow-[0_0_12px_rgba(124,58,237,0.3)]'
                      : 'bg-[#DBD3FB]/60 text-[#561BAF] border border-[#7C3AED]/20 shadow-sm'
                    : isDarkMode
                      ? 'text-[#888991] hover:bg-white/5 hover:text-white'
                      : 'text-[#67656E] hover:bg-gray-100 hover:text-[#111113]'
                }`}
              >{p}</button>
        ))}
        <Button variant="outline" size="icon" onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="!h-8 !w-8">
          <ChevronRight size={14} />
        </Button>
      </div>
    </nav>
  )
}
