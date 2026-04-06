import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  User, Shield, CreditCard, Bell, Save,
  Smartphone, KeyRound, MonitorSmartphone, Mail, Lock
} from 'lucide-react'
import { useTheme } from '@/shared/context/ThemeContext'
import { useToast } from '@/shared/context/ToastContext'
import { Card, Button, Input, Toggle, Badge } from '@/shared/ui'

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
  const { isDarkMode } = useTheme()
  const { addToast } = useToast()
  const [activeTab, setActiveTab] = useState('perfil')

  const handleSave = () => {
    addToast('Cambios guardados correctamente.', 'success')
  }

  const TABS = [
    { id: 'perfil', label: 'Mi Perfil', icon: User },
    { id: 'seguridad', label: 'Seguridad', icon: Shield },
    { id: 'facturacion', label: 'Facturación', icon: CreditCard },
  ]

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="max-w-4xl mx-auto"
    >

      {/* Page header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-2 tracking-tight ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
          Configuración
        </h1>
        <p className={`text-sm font-medium ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
          Administra tus preferencias, seguridad y métodos de pago
        </p>
      </div>

      {/* Tabs */}
      <div className={`flex gap-2 p-1 mb-6 rounded-xl inline-flex ${
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

      {/* Content Area */}
      <div className="space-y-6">

        {/* ── PERFIL ── */}
        {activeTab === 'perfil' && (
          <>
            <Card className="p-6 md:p-8">
              <h3 className={`text-sm font-bold tracking-widest uppercase mb-6 ${isDarkMode ? 'text-[#B0AFB4]' : 'text-[#67656E]'}`}>
                Información Personal
              </h3>

              <div className="flex flex-col sm:flex-row gap-8 items-start mb-8">
                {/* Avatar */}
                <div className="relative group cursor-pointer">
                  <div className={`w-24 h-24 rounded-2xl flex items-center justify-center font-bold text-2xl transition-all ${
                    isDarkMode
                      ? 'bg-[#7C3AED]/20 text-[#7C3AED] border border-[#7C3AED]/40 group-hover:shadow-[0_0_20px_rgba(124,58,237,0.4)]'
                      : 'bg-[#DBD3FB]/60 border border-white text-[#561BAF] shadow-sm'
                  }`}>
                    CS
                  </div>
                  <div className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold backdrop-blur-sm">
                    Cambiar
                  </div>
                </div>

                <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={`block text-xs font-bold tracking-widest mb-2 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                      NOMBRE COMPLETO
                    </label>
                    <Input defaultValue="Carlos Smith" />
                  </div>
                  <div>
                    <label className={`block text-xs font-bold tracking-widest mb-2 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                      CARGO / ROL
                    </label>
                    <Input defaultValue="Administrador" disabled />
                  </div>
                  <div className="md:col-span-2">
                    <label className={`block text-xs font-bold tracking-widest mb-2 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                      CORREO ELECTRÓNICO
                    </label>
                    <Input icon={Mail} defaultValue="carlos@hotel.com" />
                  </div>
                </div>
              </div>

              <div className={`pt-6 border-t flex justify-end ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
                <Button onClick={handleSave}><Save size={16} /> Guardar Cambios</Button>
              </div>
            </Card>

            <Card className="p-6 md:p-8">
              <h3 className={`text-sm font-bold tracking-widest uppercase mb-2 ${isDarkMode ? 'text-[#B0AFB4]' : 'text-[#67656E]'}`}>
                Preferencias de Notificaciones
              </h3>

              <div className="flex flex-col">
                <SettingRow
                  icon={Bell}
                  title="Alertas de Nuevos Pagos"
                  desc="Recibe un email cada vez que un link de pago sea completado."
                  control={<Toggle active={true} />}
                />
                <SettingRow
                  icon={Smartphone}
                  title="Notificaciones Push"
                  desc="Alertas en tiempo real en tu navegador."
                  control={<Toggle active={false} />}
                />
              </div>
            </Card>
          </>
        )}

        {/* ── SEGURIDAD ── */}
        {activeTab === 'seguridad' && (
          <>
            <Card className="p-6 md:p-8">
              <h3 className={`text-sm font-bold tracking-widest uppercase mb-6 ${isDarkMode ? 'text-[#B0AFB4]' : 'text-[#67656E]'}`}>
                Autenticación y Accesos
              </h3>

              <div className="flex flex-col">
                <SettingRow
                  icon={KeyRound}
                  title="Contraseña"
                  desc="Actualizada hace 3 meses."
                  control={<Button variant="outline" size="sm">Cambiar</Button>}
                />
                <SettingRow
                  icon={Lock}
                  title="Autenticación de Dos Factores (2FA)"
                  desc="Protege tu cuenta con un código temporal enviado a tu móvil."
                  control={<Toggle active={false} />}
                />
              </div>
            </Card>

            <Card className="p-6 md:p-8">
              <h3 className={`text-sm font-bold tracking-widest uppercase mb-6 ${isDarkMode ? 'text-[#B0AFB4]' : 'text-[#67656E]'}`}>
                Sesiones Activas
              </h3>

              <div className="flex flex-col">
                <SettingRow
                  icon={MonitorSmartphone}
                  title="MacBook Pro - Chrome"
                  desc="Santa Cruz, BO • Sesión actual"
                  control={<Badge variant="success">Actual</Badge>}
                />
                <SettingRow
                  icon={Smartphone}
                  title="iPhone 14 Pro - Safari"
                  desc="Santa Cruz, BO • Activo hace 2 horas"
                  control={<Button variant="danger" size="sm" className="!py-1.5 !px-3">Revocar</Button>}
                />
              </div>
            </Card>
          </>
        )}

        {/* ── FACTURACION ── */}
        {activeTab === 'facturacion' && (
          <Card className="p-6 md:p-8">
            <h3 className={`text-sm font-bold tracking-widest uppercase mb-6 ${isDarkMode ? 'text-[#B0AFB4]' : 'text-[#67656E]'}`}>
              Métodos de Pago y Planes
            </h3>

            <div className={`p-6 rounded-2xl border mb-6 flex justify-between items-center ${
              isDarkMode ? 'bg-[#111113]/50 border-white/10' : 'bg-gray-50 border-gray-200'
            }`}>
              <div>
                <p className={`text-xs font-bold tracking-widest uppercase mb-1 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                  PLAN ACTUAL
                </p>
                <h4 className={`text-xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
                  Prism Enterprise <Badge variant="default">Pro</Badge>
                </h4>
                <p className={`text-sm mt-1 font-medium ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                  Renueva el 15 Nov, 2026 ($299.00/mes)
                </p>
              </div>
              <Button variant="outline">Administrar Plan</Button>
            </div>

            <div className="flex flex-col">
              <SettingRow
                icon={CreditCard}
                title="Visa terminada en 4242"
                desc="Expiración: 12/28 • Tarjeta Principal"
                control={<Button variant="outline" size="sm">Actualizar</Button>}
              />
            </div>
          </Card>
        )}

      </div>
    </motion.div>
  )
}
