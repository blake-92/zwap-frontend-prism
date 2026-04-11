import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Sun, Moon, ArrowLeft } from 'lucide-react'
import { useTheme } from '@/shared/context/ThemeContext'
import { Card, Button, Input } from '@/shared/ui'
import ZwapLogo from '@/shared/brand/ZwapLogo'
import { ROUTES } from '@/router/routes'

/* ─── Google SVG Icon ──────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.72 16.79 16.96 15.53 17.8V20.59H19.1C21.01 18.83 22.56 15.8 22.56 12.25Z" fill="#4285F4"/>
      <path d="M12 23C14.97 23 17.46 22.02 19.1 20.59L15.53 17.8C14.64 18.4 13.41 18.77 12 18.77C9.27 18.77 6.96 16.92 6.07 14.44H2.41V17.28C4.18 20.79 7.82 23 12 23Z" fill="#34A853"/>
      <path d="M6.07 14.44C5.84 13.75 5.71 13.01 5.71 12.25C5.71 11.49 5.84 10.75 6.07 10.06V7.22H2.41C1.68 8.68 1.25 10.4 1.25 12.25C1.25 14.1 1.68 15.82 2.41 17.28L6.07 14.44Z" fill="#FBBC05"/>
      <path d="M12 5.73C13.62 5.73 15.06 6.29 16.21 7.36L19.18 4.39C17.45 2.68 14.96 1.5 12 1.5C7.82 1.5 4.18 3.71 2.41 7.22L6.07 10.06C6.96 7.58 9.27 5.73 12 5.73Z" fill="#EA4335"/>
    </svg>
  )
}

/* ─── Divider ──────────────────────────────────────────────── */
function OrDivider() {
  const { isDarkMode } = useTheme()
  return (
    <div className="flex items-center gap-4 opacity-60">
      <div className={`flex-1 h-px ${isDarkMode ? 'bg-white/20' : 'bg-black/10'}`} />
      <span className={`text-xs font-semibold ${isDarkMode ? 'text-[#D8D7D9]' : 'text-[#67656E]'}`}>O</span>
      <div className={`flex-1 h-px ${isDarkMode ? 'bg-white/20' : 'bg-black/10'}`} />
    </div>
  )
}

/* ─── Legal Footer ─────────────────────────────────────────── */
function LegalFooter() {
  const { isDarkMode } = useTheme()
  const navigate = useNavigate()

  const linkCls = `hover:underline transition-colors hover:text-[#7C3AED] cursor-pointer`

  return (
    <div className={`absolute bottom-8 flex flex-col items-center gap-3 text-xs font-medium z-20 ${
      isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'
    }`}>
      <div className="flex gap-4">
        <span className={linkCls} onClick={() => navigate('/legal/terminos')}>Términos de Uso</span>
        <span className="opacity-30">•</span>
        <span className={linkCls} onClick={() => navigate('/legal/privacidad')}>Privacidad</span>
        <span className="opacity-30">•</span>
        <span className={linkCls} onClick={() => navigate('/legal/copyright')}>Copyright</span>
      </div>
      <p className="opacity-50 tracking-wide">© 2026 ZOKORP, LLC.</p>
    </div>
  )
}

/* ─── Google Button ────────────────────────────────────────── */
function GoogleButton({ onClick }) {
  const { isDarkMode } = useTheme()
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center w-full gap-3 py-3.5 px-4 rounded-xl text-sm font-bold transition-all duration-200 shadow-md ${
        isDarkMode
          ? 'bg-white hover:bg-gray-100 text-[#111113]'
          : 'bg-white border border-gray-200 hover:bg-gray-50 text-[#111113]'
      }`}
    >
      <GoogleIcon />
      Continuar con Google
    </button>
  )
}

/* ─── Email Form ───────────────────────────────────────────── */
function EmailForm({ onBack, onSubmit }) {
  const { isDarkMode } = useTheme()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')

  return (
    <form
      className="space-y-4 animate-slide-up"
      onSubmit={e => { e.preventDefault(); onSubmit({ email, password }) }}
    >
      <div>
        <label className={`block text-xs font-bold tracking-wide mb-2 ${isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]'}`}>
          Correo Electrónico
        </label>
        <Input
          icon={Mail}
          type="email"
          placeholder="admin@hotel.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className={`block text-xs font-bold tracking-wide ${isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]'}`}>
            Contraseña
          </label>
          <button className={`text-xs font-semibold transition-colors hover:underline ${
            isDarkMode ? 'text-[#B9A4F8] hover:text-white' : 'text-[#7C3AED] hover:text-[#561BAF]'
          }`}>
            ¿Olvidaste tu contraseña?
          </button>
        </div>
        <Input
          icon={Lock}
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
      </div>

      <Button
        type="submit"
        className="w-full !py-3.5 !text-base shadow-lg mt-4"
      >
        Iniciar Sesión
      </Button>

      <div className="pt-4 text-center">
        <button
          type="button"
          onClick={onBack}
          className={`text-xs font-semibold transition-colors hover:underline flex items-center justify-center w-full gap-1 ${
            isDarkMode ? 'text-[#888991] hover:text-white' : 'text-[#67656E] hover:text-[#111113]'
          }`}
        >
          <ArrowLeft size={14} /> Volver a métodos de ingreso
        </button>
      </div>
    </form>
  )
}

/* ─── LoginView ────────────────────────────────────────────── */
export default function LoginView() {
  const { isDarkMode, toggleTheme } = useTheme()
  const navigate                    = useNavigate()
  const [showEmail, setShowEmail]   = useState(false)

  const handleLogin = () => {
    localStorage.setItem('zwap_token', 'mock-token')
    navigate(ROUTES.DASHBOARD)
  }

  return (
    <div className="min-h-screen w-full flex flex-col relative z-10 animate-fade-in items-center justify-center p-4">

      {/* Theme toggle */}
      <div className="absolute top-6 right-6 md:top-10 md:right-10 z-50">
        <Button variant="ghost" size="icon" onClick={toggleTheme} title="Cambiar tema">
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </Button>
      </div>

      {/* Card */}
      <Card className={`w-full max-w-md p-8 md:p-10 flex flex-col items-center relative z-20 ${
        isDarkMode
          ? 'shadow-[0_40px_100px_rgba(0,0,0,0.8)]'
          : 'shadow-[0_20px_60px_rgba(0,0,0,0.15)]'
      }`}>

        {/* Logo */}
        <div className="mb-8 h-12 flex justify-center items-center w-full">
          <ZwapLogo isDarkMode={isDarkMode} className="h-10" />
        </div>

        {/* Heading */}
        <div className="w-full text-center mb-8">
          <h1 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
            Bienvenido de vuelta
          </h1>
          <p className={`text-sm mt-1 font-medium ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
            Ingresa a tu panel de control financiero
          </p>
        </div>

        {/* Auth methods */}
        <div className="w-full space-y-5">
          {!showEmail ? (
            <div className="space-y-6 animate-fade-in">
              <GoogleButton onClick={handleLogin} />
              <OrDivider />
              <Button
                variant="ghost"
                className="w-full !py-3.5"
                onClick={() => setShowEmail(true)}
              >
                <Mail size={18} className="mr-2" />
                Continuar con correo
              </Button>
            </div>
          ) : (
            <EmailForm
              onBack={() => setShowEmail(false)}
              onSubmit={handleLogin}
            />
          )}
        </div>
      </Card>

      <LegalFooter />
    </div>
  )
}
