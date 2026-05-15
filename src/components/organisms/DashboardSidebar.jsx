import { NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { cn } from '../utils.js'
import { getUserMetrics } from '../../api/authService.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useTheme } from '../../context/ThemeContext.jsx'
import { getEatenMeals } from '../../api/mealTrackingService.js'
import { getWorkoutSessions } from '../../api/workoutTrackingService.js'

// ── Icons ──────────────────────────────────────────────────────────────────────
function IconDashboard() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  )
}
function IconMeals() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 11l19-9-9 19-2-8-8-2z" />
    </svg>
  )
}
function IconWorkouts() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6.5 6.5h11M6.5 17.5h11M4 12h16M4 12a2 2 0 01-2-2V8a2 2 0 012-2M20 12a2 2 0 002-2V8a2 2 0 00-2-2M4 12a2 2 0 00-2 2v2a2 2 0 002 2M20 12a2 2 0 012 2v2a2 2 0 01-2 2" />
    </svg>
  )
}
function IconRehab() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 4v16m-8-8h16M8 4h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4z" />
    </svg>
  )
}
function IconProfile() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" />
    </svg>
  )
}
function IconSettings() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  )
}
function IconLogout() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  )
}
function IconPlans() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 6h16M4 12h16M4 18h7" />
    </svg>
  )
}
function IconNotifications() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}
function IconHelp() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}
function IconFire() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2c0 0-4 4-4 8a4 4 0 004 4 4 4 0 004-4c0-1.5-.75-3-1.5-4C14 8 12 2 12 2zm0 14a2 2 0 01-2-2c0-1.5 1-3 2-4 1 1 2 2.5 2 4a2 2 0 01-2 2z" />
    </svg>
  )
}

function IconAdmin() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <circle cx="12" cy="11" r="3" />
    </svg>
  )
}

function IconBolt() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" 
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}

function IconSun() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  )
}

function IconMoon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

// ── Streak badge ───────────────────────────────────────────────────────────────
function StreakBadge({ label, count }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-body-sm text-text-body font-semibold">{label}</span>
      <div className="flex items-center gap-1 bg-warning-100 text-warning-500 rounded-round px-2 py-0.5">
        <IconFire />
        <span className="text-body-sm font-bold">{count} days</span>
      </div>
    </div>
  )
}

// ── Stat row ───────────────────────────────────────────────────────────────────
function StatRow({ label, value, max }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-body-sm text-text-disabled">{label}</span>
        <span className="text-body-sm font-semibold text-text-headings">
          {value}<span className="font-regular text-text-disabled">/{max}</span>
        </span>
      </div>
      <div className="w-full h-1.5 bg-neutral-100 rounded-round overflow-hidden">
        <div
          className="h-full bg-surface-action rounded-round transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// ── Nav items ──────────────────────────────────────────────────────────────────

export function DashboardSidebar() {
  const { isAdmin, user, logout } = useAuth()
  const { isDark, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [profile, setProfile] = useState(null)
  const [caloriesConsumed, setCaloriesConsumed] = useState(0)
  const [workoutsCompleted, setWorkoutsCompleted] = useState(0)
  const userId = user?.id
  const username = user?.name || user?.email?.split('@')[0] || 'User'

  function todayStr() {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  }

  async function fetchLiveStats() {
    try {
      const [mealsRes, sessionsRes] = await Promise.allSettled([
        getEatenMeals({ date: todayStr() }),
        getWorkoutSessions({ status: 'completed', from_date: todayStr(), to_date: todayStr() }),
      ])

      if (mealsRes.status === 'fulfilled') {
        const meals = mealsRes.value?.results || []
        const totalCal = meals.reduce((sum, m) => {
          const cal = m.meal?.nutrition?.calories_cal || m.meal?.calories_cal || 0
          return sum + cal
        }, 0)
        setCaloriesConsumed(Math.round(totalCal))
      }

      if (sessionsRes.status === 'fulfilled') {
        setWorkoutsCompleted((sessionsRes.value?.results || []).length)
      }
    } catch (_) {}
  }

  const baseNavItems = [
    { to: '/dashboard', label: 'Dashboard', icon: <IconDashboard />, end: true },
    { to: '/meals',     label: 'Meals',     icon: <IconMeals />,    end: false },
    { to: '/workouts',  label: 'Workouts',  icon: <IconWorkouts />, end: false },
    { to: '/rehab',     label: 'Rehab',     icon: <IconRehab />,    end: false },
    { to: '/plans',     label: 'Plans',     icon: <IconPlans />,    end: false },
    { to: '/profile',   label: 'Account',   icon: <IconProfile />,  end: false },
    { to: '/help',      label: 'Help',      icon: <IconHelp />,     end: false },
  ]

  const resolvedNav = isAdmin 
    ? [...baseNavItems.slice(0, 1), { to: '/admin', label: 'Admin Hub', icon: <IconAdmin />, end: false }, ...baseNavItems.slice(1)] 
    : baseNavItems

  useEffect(() => {
    if (!userId) return
    const load = async () => {
      try { const p = await getUserMetrics(); setProfile(p) } catch (_) {}
      await fetchLiveStats()
    }
    load()
    // Refresh stats every 60 s as a background fallback
    const interval = setInterval(fetchLiveStats, 60_000)
    // Also refresh immediately whenever any page fires this event
    const handleRefresh = () => fetchLiveStats()
    window.addEventListener('sidebarStatsRefresh', handleRefresh)
    return () => {
      clearInterval(interval)
      window.removeEventListener('sidebarStatsRefresh', handleRefresh)
    }
  }, [userId])

  const calorieTarget = profile?.daily_calorie_target ?? 2000
  const workoutsGoal  = 3 

  return (
    <>
      {/* Mobile Top Navigation Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-surface-primary border-b border-border-primary z-30 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-round bg-surface-action flex items-center justify-center shrink-0">
            <span className="text-body-xs font-bold text-neutral-white">EU</span>
          </div>
          <span className="text-heading-h6 font-bold text-text-headings tracking-tight">EU Health</span>
        </div>
        <button onClick={() => setIsOpen(true)} className="p-2 text-text-body hover:bg-neutral-100 rounded-lg transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-neutral-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={cn(
        "fixed top-0 left-0 w-60 h-screen bg-surface-primary border-r border-border-primary flex flex-col overflow-y-auto z-50 transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>

        {/* Logo - Desktop only */}
        <div className="hidden md:flex items-center gap-3 px-5 py-5 border-b border-border-primary shrink-0">
          <div className="w-9 h-9 rounded-round bg-surface-action flex items-center justify-center shrink-0">
            <span className="text-body-sm font-bold text-neutral-white">EU</span>
          </div>
          <span className="text-heading-h6 font-bold text-text-headings tracking-tight">EU Health</span>
        </div>

        {/* Mobile Drawer Header */}
        <div className="md:hidden flex items-center justify-between px-5 py-4 border-b border-border-primary shrink-0">
          <span className="text-heading-h6 font-bold text-text-headings">Menu</span>
          <button onClick={() => setIsOpen(false)} className="p-2 text-text-disabled hover:bg-neutral-100 rounded-lg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

      {/* Quick stats */}
      <div className="px-5 py-4 border-b border-border-primary flex flex-col gap-3">
        <StatRow label="Today's Calories" value={caloriesConsumed} max={calorieTarget} />
        <StatRow label="Today's Workout" value={workoutsCompleted} max={workoutsGoal} />
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
        {resolvedNav.map(({ to, label, icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-body-md transition-colors',
                isActive
                  ? 'bg-surface-action-hover2 text-text-action font-semibold'
                  : 'text-text-body hover:bg-neutral-100 hover:text-text-action font-semibold'
              )
            }
          >
            {icon}
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Dark mode toggle */}
      <div className="px-3 pt-3 border-t border-border-primary">
        <button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-body-md font-semibold transition-all duration-200 w-full",
            isDark
              ? "text-white bg-white/10 hover:bg-white/20 ring-1 ring-white/20"
              : "text-neutral-700 bg-neutral-100 hover:bg-neutral-200 ring-1 ring-neutral-200"
          )}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <IconSun /> : <IconMoon />}
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>

      {/* Logout */}
      <div className="px-3 py-3">
        <button
          onClick={() => {
            logout()
            window.location.href = '/login'
          }}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-body-md font-semibold text-error-500 hover:bg-surface-error transition-colors w-full"
          aria-label="Logout"
        >
          <IconLogout />
          Logout
        </button>
      </div>
    </aside>
    </>
  )
}
