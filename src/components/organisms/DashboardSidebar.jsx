import { NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { cn } from '../utils.js'
import { getUserMetrics } from '../../api/authService.js'

// ── Icons ──────────────────────────────────────────────────────────────────────
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
function IconFire() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2c0 0-4 4-4 8a4 4 0 004 4 4 4 0 004-4c0-1.5-.75-3-1.5-4C14 8 12 2 12 2zm0 14a2 2 0 01-2-2c0-1.5 1-3 2-4 1 1 2 2.5 2 4a2 2 0 01-2 2z" />
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
const navItems = [
  { to: '/dashboard', label: 'Meals',     icon: <IconMeals />,    end: true },
  { to: '/workouts',  label: 'Workouts',  icon: <IconWorkouts />, end: false },
  { to: '/profile',   label: 'Profile',   icon: <IconProfile />,  end: false },
  { to: '/settings',  label: 'Settings',  icon: <IconSettings />, end: false },
]

// ── Component ──────────────────────────────────────────────────────────────────
export function DashboardSidebar() {
  const [profile, setProfile] = useState(null)
  const userId = localStorage.getItem('user_id')
  const username = localStorage.getItem('username') || 'User'

  useEffect(() => {
    if (!userId) return
    getUserMetrics()
      .then(setProfile)
      .catch(() => setProfile(null))
  }, [userId])

  const streak = profile?.CurrentStreak ?? 0
  const calorieTarget = profile?.DailyCalorieTarget ?? 2000

  return (
    <aside className="fixed top-0 left-0 w-60 h-screen bg-surface-primary border-r border-border-primary flex flex-col overflow-y-auto z-40">

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border-primary">
        <div className="w-9 h-9 rounded-round bg-surface-action flex items-center justify-center shrink-0">
          <span className="text-body-sm font-bold text-neutral-white">EU</span>
        </div>
        <span className="text-heading-h6 font-bold text-text-headings tracking-tight">EU Health</span>
      </div>

      {/* Streaks */}
      <div className="px-5 py-4 border-b border-border-primary flex flex-col gap-3">
        <p className="text-body-sm font-bold text-text-disabled uppercase tracking-widest">Statistics</p>
        <StreakBadge label="Meals Streak" count={streak} />
        <StreakBadge label="Workout Streak" count={streak} />
      </div>

      {/* Quick stats */}
      <div className="px-5 py-4 border-b border-border-primary flex flex-col gap-3">
        <StatRow label="Today's Calories" value={0} max={calorieTarget} />
        <StatRow label="Today's Workout" value={3} max={5} />
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
        {navItems.map(({ to, label, icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
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

      {/* Logout */}
      <div className="px-3 py-4 border-t border-border-primary">
        <button
          onClick={() => {
            localStorage.removeItem('token')
            localStorage.removeItem('refresh_token')
            localStorage.removeItem('user_id')
            localStorage.removeItem('username')
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
  )
}
