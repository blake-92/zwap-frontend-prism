import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header  from './Header'
import DashboardView from '../views/DashboardView'
import { BRANCHES } from '../../data/mockData'
import { useTheme } from '../../context/ThemeContext'

/* ─── Placeholder views (will be built next) ──────────────── */
function PlaceholderView({ name }) {
  const { isDarkMode } = useTheme()
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className={`text-6xl mb-4 font-bold opacity-10 ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
          🚧
        </div>
        <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>{name}</h2>
        <p className={`text-sm ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>Vista en construcción</p>
      </div>
    </div>
  )
}

const VIEW_MAP = {
  dashboard:     null, // rendered inline
  links:         <PlaceholderView name="Links de Pago" />,
  transacciones: <PlaceholderView name="Transacciones" />,
  liquidaciones: <PlaceholderView name="Liquidaciones" />,
  usuarios:      <PlaceholderView name="Usuarios" />,
  sucursales:    <PlaceholderView name="Sucursales" />,
  wallet:        <PlaceholderView name="Billetera & Retiros" />,
}

export default function AppShell() {
  const { isDarkMode }          = useTheme()
  const navigate                = useNavigate()
  const [tab, setTab]           = useState('dashboard')
  const [branch, setBranch]     = useState(BRANCHES[0])
  const [linkModalOpen, setLinkModalOpen] = useState(false)

  const handleNewLink = () => setLinkModalOpen(true)

  return (
    <div className={`min-h-screen flex font-sans transition-colors duration-500 relative overflow-hidden ${
      isDarkMode ? 'text-[#D8D7D9]' : 'text-[#111113]'
    }`}>

      {/* Sidebar */}
      <Sidebar activeTab={tab} onTabChange={setTab} />

      {/* Main column */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden z-10">
        <Header
          selectedBranch={branch}
          onBranchChange={setBranch}
        />

        {/* Scrollable content */}
        <main className="flex-1 overflow-auto p-8 xl:p-10 pb-20">
          <div className="max-w-[1400px] mx-auto h-full">
            {tab === 'dashboard' ? (
              <DashboardView
                onNewLink={handleNewLink}
                onViewTransactions={() => setTab('transacciones')}
              />
            ) : (
              VIEW_MAP[tab]
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
