import { Outlet } from 'react-router-dom'
import { NavBar } from '../components/organisms/NavBar.jsx'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-surface-page">
      <NavBar />
      <main>
        <Outlet />
      </main>
    </div>
  )
}
