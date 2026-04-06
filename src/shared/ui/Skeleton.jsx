import { useTheme } from '@/shared/context/ThemeContext'
import { motion } from 'framer-motion'

export default function Skeleton({ width = '100%', height = '1rem', className = '', rounded = 'rounded-lg' }) {
  const { isDarkMode } = useTheme()
  
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ repeat: Infinity, duration: 1.5, repeatType: 'reverse', ease: 'easeInOut' }}
      className={`relative overflow-hidden ${rounded} ${className} ${
        isDarkMode ? 'bg-[#252429] border border-white/5' : 'bg-gray-200 border border-black/5'
      }`}
      style={{ width, height }}
    >
      <motion.div
        animate={{ x: ['-100%', '200%'] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
        className="absolute inset-0 z-10"
        style={{
          background: isDarkMode 
            ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)' 
            : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)'
        }}
      />
    </motion.div>
  )
}
