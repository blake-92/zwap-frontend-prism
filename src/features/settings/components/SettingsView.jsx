import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useViewSearch } from '@/shared/context/ViewSearchContext'
import { pageVariants } from '@/shared/utils/motionVariants'
import {
  User, Shield, CreditCard, Bell, Save,
  Smartphone, KeyRound, MonitorSmartphone, Mail, Lock, Globe
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/shared/context/ThemeContext'
import { useToast } from '@/shared/context/ToastContext'
import { Card, Button, Input, Toggle, Badge, PageHeader } from '@/shared/ui'
import { CURRENT_USER, PLAN_INFO, SESSIONS, PAYMENT_CARD } from '@/services/mocks/mockData'

/* ─── Generic Setting Row ─────────────────────────────────── */
function SettingRow({ icon: Icon, title, desc, control }) {
  const { isDarkMode } = useTheme()
  return (
    <div className={`py-5 flex items-start sm:items-center justify-between gap-4 border-b last:border-0 ${
      isDarkMode ? 'border-white/5' : 'border-black/5'
    }`}>
      <div className="flex gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0 ${
          isDarkMode ? 'bg-[#7C3AED]/15 text-[#7C3AED]' : 'bg-[#DBD3FB]/50 text-[#561BAF]'
        }`}>
          <Icon size={18} />
        </div>
        <div>
          <h4 className={`text-sm font-bold ${isDarkMode ? 'text-[#D8D7D9]' : 'text-[#111113]'}`}>
            {title}
          </h4>
          <p className={`text-xs mt-0.5 font-medium ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
            {desc}
          </p>
        </div>
      </div>
      <div className="flex-shrink-0">
        {control}
      </div>
    </div>
  )
}

export default function SettingsView() {
  const { t, i18n } = useTranslation()
  const { isDarkMode } = useTheme()
  const { addToast } = useToast()
  const { query: search } = useViewSearch(t('settings.searchPlaceholder'))
  const [activeTab, setActiveTab] = useState('perfil')
  const [alertEmails, setAlertEmails] = useState(true)
  const [pushNotifs, setPushNotifs]   = useState(false)
  const [twoFactor, setTwoFactor]     = useState(false)

  const TABS = [
    { id: 'perfil', label: t('settings.tabProfile'), icon: User },
    { id: 'seguridad', label: t('settings.tabSecurity'), icon: Shield },
    { id: 'facturacion', label: t('settings.tabBilling'), icon: CreditCard },
  ]

  const handleSave = () => {
    addToast(t('settings.changesSaved'), 'success')
  }

  /* ─── Searchable sections with keywords ─── */
  const sections = useMemo(() => [
    {
      id: 'personal-info',
      tab: 'perfil',
      keywords: [
        t('settings.personalInfo'),
        t('users.fullName'), t('users.role'), t('users.emailLabel'),
        CURRENT_USER.name, CURRENT_USER.email, t('users.roleAdmin'),
      ],
    },
    {
      id: 'notifications',
      tab: 'perfil',
      keywords: [
        t('settings.notificationPrefs'),
        t('settings.paymentAlerts'), t('settings.paymentAlertsDesc'),
        t('settings.pushNotifications'), t('settings.pushNotificationsDesc'),
      ],
    },
    {
      id: 'language',
      tab: 'perfil',
      keywords: [
        t('settings.language'), t('settings.languageDesc'),
        t('settings.languageEs'), t('settings.languageEn'),
      ],
    },
    {
      id: 'auth',
      tab: 'seguridad',
      keywords: [
        t('settings.authAccess'),
        t('settings.password'), t('settings.passwordUpdated'),
        t('settings.twoFactor'), t('settings.twoFactorDesc'),
      ],
    },
    {
      id: 'sessions',
      tab: 'seguridad',
      keywords: [
        t('settings.activeSessions'),
        ...SESSIONS.map(s => s.device),
        ...SESSIONS.map(s => s.location),
      ],
    },
    {
      id: 'billing',
      tab: 'facturacion',
      keywords: [
        t('settings.paymentMethods'),
        t('settings.currentPlan'), t('settings.managePlan'),
        PLAN_INFO.name, PLAN_INFO.tier,
        PAYMENT_CARD.brand,
      ],
    },
  ], [t])

  const isSearching = !!search
  const visibleSections = useMemo(() => {
    if (!search) return null
    const q = search.toLowerCase()
    return new Set(
      sections
        .filter(s => s.keywords.some(kw => kw.toLowerCase().includes(q)))
        .map(s => s.id)
    )
  }, [search, sections])

  const showSection = (id, tab) => {
    if (isSearching) return visibleSections?.has(id) ?? false
    return activeTab === tab
  }

  const noResults = isSearching && visibleSections?.size === 0

  return (
    <motion.div variants={pageVariants} initial="hidden" animate="show" className="max-w-4xl mx-auto">

      <PageHeader title={t('settings.title')} />

      {/* Tabs — hidden during search */}
      <AnimatePresence>
        {!isSearching && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="overflow-hidden mb-6"
          >
            <div className={`flex gap-2 p-1 rounded-xl inline-flex ${
              isDarkMode ? 'bg-[#111113]/50 border border-white/5' : 'bg-gray-200/50 border border-black/5'
            }`}>
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-colors duration-300 ${
                    activeTab === id
                      ? isDarkMode
                        ? 'text-white'
                        : 'text-[#7C3AED]'
                      : isDarkMode
                        ? 'text-[#888991] hover:text-white'
                        : 'text-[#67656E] hover:text-[#111113]'
                  }`}
                >
                  {activeTab === id && (
                    <motion.div
                      layoutId="settingsTabIndicator"
                      className={`absolute inset-0 rounded-lg ${
                        isDarkMode
                          ? 'bg-[#252429] border border-white/10 shadow-[0_2px_10px_rgba(0,0,0,0.5)]'
                          : 'bg-white border border-[#7C3AED]/20 shadow-sm'
                      }`}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon size={16} />
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Area */}
      <div className="space-y-6">

        {/* ── PERSONAL INFO ── */}
        {showSection('personal-info', 'perfil') && (
          <Card className="p-6 md:p-8">
            <h3 className={`text-sm font-bold tracking-widest uppercase mb-6 ${isDarkMode ? 'text-[#B0AFB4]' : 'text-[#67656E]'}`}>
              {t('settings.personalInfo')}
            </h3>

            <div className="flex flex-col sm:flex-row gap-8 items-start mb-8">
              {/* Avatar */}
              <div className="relative group cursor-pointer">
                <div className={`w-24 h-24 rounded-2xl flex items-center justify-center font-bold text-2xl transition-all ${
                  isDarkMode
                    ? 'bg-[#7C3AED]/20 text-[#7C3AED] border border-[#7C3AED]/40 group-hover:shadow-[0_0_20px_rgba(124,58,237,0.4)]'
                    : 'bg-[#DBD3FB]/60 border border-white text-[#561BAF] shadow-sm'
                }`}>
                  {CURRENT_USER.initials}
                </div>
                <div className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold backdrop-blur-sm">
                  {t('common.change')}
                </div>
              </div>

              <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={`block text-xs font-bold tracking-widest mb-2 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                    {t('users.fullName')}
                  </label>
                  <Input defaultValue={CURRENT_USER.name} />
                </div>
                <div>
                  <label className={`block text-xs font-bold tracking-widest mb-2 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                    {t('users.role')}
                  </label>
                  <Input defaultValue={t('users.roleAdmin')} disabled />
                </div>
                <div className="md:col-span-2">
                  <label className={`block text-xs font-bold tracking-widest mb-2 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                    {t('users.emailLabel')}
                  </label>
                  <Input icon={Mail} defaultValue={CURRENT_USER.email} />
                </div>
              </div>
            </div>

            <div className={`pt-6 border-t flex justify-end ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
              <Button onClick={handleSave}><Save size={16} /> {t('common.save')}</Button>
            </div>
          </Card>
        )}

        {/* ── NOTIFICATIONS ── */}
        {showSection('notifications', 'perfil') && (
          <Card className="p-6 md:p-8">
            <h3 className={`text-sm font-bold tracking-widest uppercase mb-2 ${isDarkMode ? 'text-[#B0AFB4]' : 'text-[#67656E]'}`}>
              {t('settings.notificationPrefs')}
            </h3>

            <div className="flex flex-col">
              <SettingRow
                icon={Bell}
                title={t('settings.paymentAlerts')}
                desc={t('settings.paymentAlertsDesc')}
                control={<Toggle active={alertEmails} onToggle={() => setAlertEmails(v => !v)} />}
              />
              <SettingRow
                icon={Smartphone}
                title={t('settings.pushNotifications')}
                desc={t('settings.pushNotificationsDesc')}
                control={<Toggle active={pushNotifs} onToggle={() => setPushNotifs(v => !v)} />}
              />
            </div>
          </Card>
        )}

        {/* ── LANGUAGE ── */}
        {showSection('language', 'perfil') && (
          <Card className="p-6 md:p-8">
            <h3 className={`text-sm font-bold tracking-widest uppercase mb-2 ${isDarkMode ? 'text-[#B0AFB4]' : 'text-[#67656E]'}`}>
              {t('settings.language')}
            </h3>

            <SettingRow
              icon={Globe}
              title={t('settings.language')}
              desc={t('settings.languageDesc')}
              control={
                <div className={`flex rounded-xl overflow-hidden border ${isDarkMode ? 'border-white/10' : 'border-black/10'}`}>
                  <button
                    onClick={() => i18n.changeLanguage('es')}
                    className={`px-4 py-2 text-sm font-bold transition-colors ${
                      i18n.language === 'es'
                        ? isDarkMode
                          ? 'bg-[#7C3AED]/20 text-[#A78BFA]'
                          : 'bg-[#DBD3FB]/50 text-[#7C3AED]'
                        : isDarkMode
                          ? 'text-[#888991] hover:bg-white/5'
                          : 'text-[#67656E] hover:bg-black/5'
                    }`}
                  >
                    {t('settings.languageEs')}
                  </button>
                  <button
                    onClick={() => i18n.changeLanguage('en')}
                    className={`px-4 py-2 text-sm font-bold transition-colors border-l ${
                      i18n.language === 'en'
                        ? isDarkMode
                          ? 'bg-[#7C3AED]/20 text-[#A78BFA] border-white/10'
                          : 'bg-[#DBD3FB]/50 text-[#7C3AED] border-black/10'
                        : isDarkMode
                          ? 'text-[#888991] hover:bg-white/5 border-white/10'
                          : 'text-[#67656E] hover:bg-black/5 border-black/10'
                    }`}
                  >
                    {t('settings.languageEn')}
                  </button>
                </div>
              }
            />
          </Card>
        )}

        {/* ── AUTH & ACCESS ── */}
        {showSection('auth', 'seguridad') && (
          <Card className="p-6 md:p-8">
            <h3 className={`text-sm font-bold tracking-widest uppercase mb-6 ${isDarkMode ? 'text-[#B0AFB4]' : 'text-[#67656E]'}`}>
              {t('settings.authAccess')}
            </h3>

            <div className="flex flex-col">
              <SettingRow
                icon={KeyRound}
                title={t('settings.password')}
                desc={t('settings.passwordUpdated')}
                control={<Button variant="outline" size="sm">{t('common.change')}</Button>}
              />
              <SettingRow
                icon={Lock}
                title={t('settings.twoFactor')}
                desc={t('settings.twoFactorDesc')}
                control={<Toggle active={twoFactor} onToggle={() => setTwoFactor(v => !v)} />}
              />
            </div>
          </Card>
        )}

        {/* ── SESSIONS ── */}
        {showSection('sessions', 'seguridad') && (
          <Card className="p-6 md:p-8">
            <h3 className={`text-sm font-bold tracking-widest uppercase mb-6 ${isDarkMode ? 'text-[#B0AFB4]' : 'text-[#67656E]'}`}>
              {t('settings.activeSessions')}
            </h3>

            <div className="flex flex-col">
              {SESSIONS.map((session) => (
                <SettingRow
                  key={session.id}
                  icon={session.icon === 'desktop' ? MonitorSmartphone : Smartphone}
                  title={session.device}
                  desc={`${session.location} • ${session.isCurrent ? t('settings.currentSession') : session.lastActive}`}
                  control={session.isCurrent
                    ? <Badge variant="success">{t('settings.currentSession')}</Badge>
                    : <Button variant="danger" size="sm" className="!py-1.5 !px-3">{t('common.revoke')}</Button>
                  }
                />
              ))}
            </div>
          </Card>
        )}

        {/* ── BILLING ── */}
        {showSection('billing', 'facturacion') && (
          <Card className="p-6 md:p-8">
            <h3 className={`text-sm font-bold tracking-widest uppercase mb-6 ${isDarkMode ? 'text-[#B0AFB4]' : 'text-[#67656E]'}`}>
              {t('settings.paymentMethods')}
            </h3>

            <div className={`p-6 rounded-2xl border mb-6 flex justify-between items-center ${
              isDarkMode ? 'bg-[#111113]/50 border-white/10' : 'bg-gray-50 border-gray-200'
            }`}>
              <div>
                <p className={`text-xs font-bold tracking-widest uppercase mb-1 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                  {t('settings.currentPlan')}
                </p>
                <h4 className={`text-xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
                  {PLAN_INFO.name} <Badge variant="default">{PLAN_INFO.tier}</Badge>
                </h4>
                <p className={`text-sm mt-1 font-medium ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                  {PLAN_INFO.renewDate} ({PLAN_INFO.price})
                </p>
              </div>
              <Button variant="outline">{t('settings.managePlan')}</Button>
            </div>

            <div className="flex flex-col">
              <SettingRow
                icon={CreditCard}
                title={`${PAYMENT_CARD.brand} ••${PAYMENT_CARD.last4}`}
                desc={`${t('settings.expiration')}: ${PAYMENT_CARD.expiry} • ${PAYMENT_CARD.isPrimary ? t('settings.primaryCard') : t('settings.secondaryCard')}`}
                control={<Button variant="outline" size="sm">{t('common.update')}</Button>}
              />
            </div>
          </Card>
        )}

        {/* ── No results ── */}
        {noResults && (
          <Card className="p-8 text-center">
            <p className={`text-sm font-medium ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
              {t('settings.noResultsFor', { term: search })}
            </p>
          </Card>
        )}

      </div>
    </motion.div>
  )
}
