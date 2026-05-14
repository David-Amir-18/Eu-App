import { Outlet } from 'react-router-dom'
import { DashboardSidebar } from '../components/organisms/DashboardSidebar.jsx'

export default function DashboardLayout() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-surface-page">
      <DashboardSidebar />
      <div className="flex flex-col flex-1 min-w-0 md:ml-60 pt-16 md:pt-0 h-screen overflow-y-auto">
        <Outlet />
      </div>
    </div>
  )
}
