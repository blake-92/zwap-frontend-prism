import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { listVariants, cardItemVariants, pageVariants } from '@/shared/utils/motionVariants'
import {
  Building2, MapPin, Users, Pencil, Trash2,
  PlusCircle, Star,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/shared/context/ThemeContext'
import { useViewSearch } from '@/shared/context/ViewSearchContext'
import { Card, Button, Badge, Tooltip, PageHeader } from '@/shared/ui'
import { BRANCH_LIST } from '@/services/mocks/mockData'
import NewBranchModal from './NewBranchModal'

/* ─── Branch Card ─────────────────────────────────────────── */
function BranchCard({ branch }) {
  const { isDarkMode } = useTheme()
  const { t } = useTranslation()

  return (
    <Card hoverEffect className="p-6 cursor-pointer group relative overflow-hidden">
      {/* Top row: icon + action buttons */}
      <div className="flex justify-between items-start mb-5">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
          isDarkMode
            ? 'bg-[#7C3AED]/15 text-[#7C3AED] group-hover:shadow-[0_0_20px_rgba(124,58,237,0.4)]'
            : 'bg-[#DBD3FB]/60 text-[#561BAF] shadow-sm'
        }`}>
          <Building2 size={22} />
        </div>

        <div className="flex items-center gap-2">
          <Tooltip content={t('branches.editBranch')} position="top">
            <Button variant="action" size="sm" className="!px-2.5 !py-2">
              <Pencil size={13} />
            </Button>
          </Tooltip>
          {!branch.isMain && (
            <Tooltip content={t('branches.deleteBranch')} position="top">
              <Button variant="danger" size="sm" className="!px-2.5 !py-2">
                <Trash2 size={13} />
              </Button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Name + main badge */}
      <div className="flex items-center gap-2 mb-1.5">
        <h3 className={`font-bold text-lg tracking-tight ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
          {branch.name}
        </h3>
        {branch.isMain && (
          <Badge variant="default">
            <Star size={9} className="inline mr-0.5" />{t('branches.main')}
          </Badge>
        )}
      </div>

      {/* Address */}
      <p className={`text-xs font-medium flex items-center gap-1.5 mb-5 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
        <MapPin size={12} className="opacity-70 flex-shrink-0" />
        {branch.address}
      </p>

      {/* Footer: user count */}
      <div className={`pt-4 border-t flex items-center gap-2 ${isDarkMode ? 'border-white/10' : 'border-black/5'}`}>
        <Users size={14} className={isDarkMode ? 'text-[#7C3AED]' : 'text-[#561BAF]'} />
        <span className={`text-xs font-bold ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
          {t('branches.usersAssigned', { count: branch.users })}
        </span>
      </div>
    </Card>
  )
}

/* ─── Add card ────────────────────────────────────────────── */
function AddBranchCard({ onClick }) {
  const { isDarkMode } = useTheme()
  const { t } = useTranslation()
  return (
    <button
      onClick={onClick}
      className={`rounded-[20px] border-2 border-dashed flex flex-col items-center justify-center gap-3 p-8 min-h-[200px] transition-all duration-300 group ${
        isDarkMode
          ? 'border-white/10 text-[#888991] hover:border-[#7C3AED]/40 hover:text-[#A78BFA] hover:bg-[#7C3AED]/5'
          : 'border-gray-200 text-[#B0AFB4] hover:border-[#7C3AED]/40 hover:text-[#7C3AED] hover:bg-[#DBD3FB]/10'
      }`}
    >
      <PlusCircle size={28} className="transition-transform duration-300 group-hover:scale-110" />
      <span className="text-sm font-bold">{t('branches.newBranch')}</span>
    </button>
  )
}

/* ─── SucursalesView ──────────────────────────────────────── */
export default function SucursalesView() {
  const { t } = useTranslation()
  const { isDarkMode } = useTheme()
  const { query: search, setQuery: setSearch } = useViewSearch(t('branches.searchPlaceholder'))
  const [newBranchOpen, setNewBranchOpen] = useState(false)

  const filtered = useMemo(() => {
    if (!search) return BRANCH_LIST
    const q = search.toLowerCase()
    return BRANCH_LIST.filter(b =>
      b.name.toLowerCase().includes(q) ||
      b.address.toLowerCase().includes(q)
    )
  }, [search])

  return (
    <motion.div variants={pageVariants} initial="hidden" animate="show">

      <PageHeader title={t('branches.title')}>
        <Button onClick={() => setNewBranchOpen(true)}>
          <PlusCircle size={18} /> {t('branches.newBranch')}
        </Button>
      </PageHeader>

      <div className="sm:hidden mb-6">
        <Button size="lg" className="w-full" onClick={() => setNewBranchOpen(true)}>
          <PlusCircle size={18} /> {t('branches.newBranch')}
        </Button>
      </div>

      {/* Cards grid */}
      {filtered.length > 0 ? (
        <motion.div variants={listVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 2xl:gap-8">
          {filtered.map(b => (
            <motion.div key={b.id} variants={cardItemVariants}>
              <BranchCard branch={b} />
            </motion.div>
          ))}
          {!search && (
            <motion.div variants={cardItemVariants}>
              <AddBranchCard onClick={() => setNewBranchOpen(true)} />
            </motion.div>
          )}
        </motion.div>
      ) : (
        <Card className="p-8 text-center">
          <p className={`text-sm font-medium ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
            {search ? t('branches.notFoundFor', { term: search }) : t('branches.notFound')}
          </p>
          {search && (
            <Button variant="ghost" size="sm" onClick={() => setSearch('')} className="mt-2">
              {t('common.clearSearch')}
            </Button>
          )}
        </Card>
      )}

      <AnimatePresence>
        {newBranchOpen && <NewBranchModal key="new-branch" onClose={() => setNewBranchOpen(false)} />}
      </AnimatePresence>
    </motion.div>
  )
}
