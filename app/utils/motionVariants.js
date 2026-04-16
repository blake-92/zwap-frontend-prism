export const listVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

export const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
}

export const cardItemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
}

export const pageVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 26 } },
  exit: { opacity: 0, y: -15, transition: { duration: 0.15 } },
}

/* ─── Instant variants (tier minimal) ─────────────────────── */
const INSTANT = { duration: 0 }

export const listVariantsInstant = {
  hidden: { opacity: 1 },
  show: { opacity: 1 },
}

export const itemVariantsInstant = {
  hidden: { opacity: 1, x: 0 },
  show: { opacity: 1, x: 0, transition: INSTANT },
}

export const cardItemVariantsInstant = {
  hidden: { opacity: 1, y: 0 },
  show: { opacity: 1, y: 0, transition: INSTANT },
}

export const pageVariantsInstant = {
  hidden: { opacity: 1, y: 0 },
  show: { opacity: 1, y: 0, transition: INSTANT },
  exit: { opacity: 0, transition: INSTANT },
}
