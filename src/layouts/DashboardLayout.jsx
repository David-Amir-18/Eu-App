import { Outlet } from 'react-router-dom'
import { DashboardSidebar } from '../components/organisms/DashboardSidebar.jsx'

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-surface-page">
      <DashboardSidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-auto ml-60">
        <Outlet />
      </div>
    </div>
  )
}
