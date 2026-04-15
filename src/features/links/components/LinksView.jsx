import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useViewSearch } from '@/shared/context/ViewSearchContext'
import { Button, SectionLabel, PageHeader } from '@/shared/ui'
import { pageVariants } from '@/shared/utils/motionVariants'
import { PERMANENT_LINKS } from '@/services/mocks/mockData'
import PermanentCard from './PermanentCard'
import QuickLinkSwipeable from './QuickLinkSwipeable'
import CustomLinksTable from './CustomLinksTable'
import NewLinkModal from './NewLinkModal'
import LinkDetailModal from './LinkDetailModal'

export default function LinksView() {
  const { t } = useTranslation()
  const [links, setLinks]         = useState(PERMANENT_LINKS)
  const [newLinkOpen, setNewLinkOpen] = useState(false)
  const [detailLink, setDetailLink]   = useState(null)
  const [editLink, setEditLink]       = useState(null)
  const { query: search, setQuery: setSearch } = useViewSearch(t('links.searchPlaceholder'))

  const toggleLink = id =>
    setLinks(prev => prev.map(l => l.id === id ? { ...l, active: !l.active } : l))

  const handleEdit = (link) => {
    setDetailLink(null)
    setEditLink(link)
  }

  return (
    <motion.div variants={pageVariants} initial="hidden" animate="show" exit="exit">
      <PageHeader title={t('links.title')}>
        <div className="hidden lg:block">
          <Button onClick={() => setNewLinkOpen(true)}>
            <Plus size={18} /> {t('links.createLink')}
          </Button>
        </div>
      </PageHeader>

      {/* Permanentes — desktop: grid cards */}
      <div className="hidden lg:block">
        <SectionLabel className="uppercase mb-4">{t('links.permanentSection')}</SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 2xl:gap-8 mb-10">
          {links.map(link => (
            <PermanentCard key={link.id} link={link} onToggle={() => toggleLink(link.id)} />
          ))}
        </div>
      </div>

      {/* Mobile only: Full-width new link button */}
      <div className="lg:hidden mb-6">
        <Button size="lg" className="w-full" onClick={() => setNewLinkOpen(true)}>
          <Plus size={18} /> {t('links.createLink')}
        </Button>
      </div>

      {/* Mobile: compact quick-charge card */}
      <div className="lg:hidden mb-6">
        <SectionLabel className="uppercase mb-3">{t('links.quickLinks')}</SectionLabel>
        <QuickLinkSwipeable links={links} onToggle={toggleLink} />
      </div>

      {/* Personalizados */}
      <SectionLabel className="uppercase mb-4">{t('links.customSection')}</SectionLabel>
      <CustomLinksTable onDetail={setDetailLink} onEdit={handleEdit} search={search} onClearSearch={() => setSearch('')} />

      {/* Modals */}
      <AnimatePresence>
        {newLinkOpen && <NewLinkModal key="new-link" onClose={() => setNewLinkOpen(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {editLink && <NewLinkModal key="edit-link" link={editLink} onClose={() => setEditLink(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {detailLink && (
          <LinkDetailModal
            key="link-detail"
            link={detailLink}
            onClose={() => setDetailLink(null)}
            onEdit={handleEdit}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
