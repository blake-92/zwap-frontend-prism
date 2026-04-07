import { useState, Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { useTheme } from '@/shared/context/ThemeContext'
import { BRANCHES } from '@/services/mocks/mockData'
import Sidebar from './Sidebar'
import Header  from './Header'

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full min-h-[50vh]">
      <div className="w-8 h-8 border-2 border-[#7C3AED]/30 border-t-[#7C3AED] rounded-full animate-spin" />
    </div>
  )
}

export default function AppShell() {
  const { isDarkMode }      = useTheme()
  const [branch, setBranch] = useState(BRANCHES[0])

  return (
    <div className={`min-h-screen flex font-sans transition-colors duration-500 relative overflow-hidden ${
      isDarkMode ? 'text-[#D8D7D9]' : 'text-[#111113]'
    }`}>
      <Sidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden z-10 relative">
        <Header selectedBranch={branch} onBranchChange={setBranch} />

        <main className="flex-1 overflow-auto p-8 xl:p-10 pb-24 xl:pb-32">
          <div className="max-w-[1400px] mx-auto h-full">
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  )
}
