import { NavLink } from 'react-router-dom'
import { cn } from '../utils.js'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/workouts', label: 'Workouts' },
  { to: '/meals', label: 'Meals' },
]

export function NavBar() {
  return (
    <header className="w-full bg-surface-primary border-b border-border-primary">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <NavLink to="/" className="text-heading-h6 font-bold text-text-headings tracking-tight">
          EU Health
        </NavLink>

        {/* Nav links */}
        <nav className="flex items-center gap-6">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                cn(
                  'text-body-md font-semibold transition-colors',
                  isActive
                    ? 'text-text-action border-b-2 border-border-action pb-0.5'
                    : 'text-text-body hover:text-text-action',
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
