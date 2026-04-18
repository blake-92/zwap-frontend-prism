<script setup>
import { ref, computed } from 'vue'
import { motion, AnimatePresence } from 'motion-v'
import { Plus } from 'lucide-vue-next'
import { useViewSearch } from '~/composables/useViewSearch'
import { useDebouncedSearch } from '~/composables/useDebouncedSearch'
import { useMotionVariants } from '~/composables/useMotionVariants'
import { PERMANENT_LINKS } from '~/utils/mockData'
import Button from '~/components/ui/Button.vue'
import SectionLabel from '~/components/ui/SectionLabel.vue'
import PageHeader from '~/components/ui/PageHeader.vue'
import PermanentCard from './PermanentCard.vue'
import QuickLinkSwipeable from './QuickLinkSwipeable.vue'
import CustomLinksTable from './CustomLinksTable.vue'
import NewLinkModal from './NewLinkModal.vue'
import LinkDetailModal from './LinkDetailModal.vue'

const mv = useMotionVariants()
const { t } = useI18n()
const links = ref(PERMANENT_LINKS.map(l => ({ ...l })))
const newLinkOpen = ref(false)
const detailLink = ref(null)
const editLink = ref(null)
const viewSearch = useViewSearch(computed(() => t('links.searchPlaceholder')))
// Debounce solo en Lite — CustomLinksTable recibe el valor debounced vía prop
const debouncedQuery = useDebouncedSearch(() => viewSearch.query)

const toggleLink = (id) => {
  const l = links.value.find(x => x.id === id)
  if (l) l.active = !l.active
}

const handleEdit = (link) => {
  detailLink.value = null
  editLink.value = link
}
</script>

<template>
  <motion.div :variants="mv.page.value" initial="hidden" animate="show" exit="exit">
    <PageHeader :title="t('links.title')">
      <div class="hidden lg:block">
        <Button @click="newLinkOpen = true">
          <Plus :size="18" /> {{ t('links.createLink') }}
        </Button>
      </div>
    </PageHeader>

    <!-- Permanentes desktop -->
    <div class="hidden lg:block">
      <SectionLabel class="uppercase mb-4">{{ t('links.permanentSection') }}</SectionLabel>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 2xl:gap-8 mb-10">
        <PermanentCard
          v-for="link in links"
          :key="link.id"
          :link="link"
          @toggle="toggleLink(link.id)"
        />
      </div>
    </div>

    <!-- Mobile new link button -->
    <div class="lg:hidden mb-6">
      <Button size="lg" class="w-full" @click="newLinkOpen = true">
        <Plus :size="18" /> {{ t('links.createLink') }}
      </Button>
    </div>

    <!-- Mobile quick link -->
    <div class="lg:hidden mb-6">
      <SectionLabel class="uppercase mb-3">{{ t('links.quickLinks') }}</SectionLabel>
      <QuickLinkSwipeable :links="links" @toggle="toggleLink" />
    </div>

    <!-- Custom -->
    <SectionLabel class="uppercase mb-4">{{ t('links.customSection') }}</SectionLabel>
    <CustomLinksTable
      :search="debouncedQuery"
      @detail="detailLink = $event"
      @edit="handleEdit"
      @clear-search="viewSearch.setQuery('')"
    />

    <AnimatePresence>
      <NewLinkModal v-if="newLinkOpen" key="new-link" @close="newLinkOpen = false" />
    </AnimatePresence>
    <AnimatePresence>
      <NewLinkModal v-if="editLink" key="edit-link" :link="editLink" @close="editLink = null" />
    </AnimatePresence>
    <AnimatePresence>
      <LinkDetailModal v-if="detailLink" key="link-detail" :link="detailLink" @close="detailLink = null" @edit="handleEdit" />
    </AnimatePresence>
  </motion.div>
</template>
