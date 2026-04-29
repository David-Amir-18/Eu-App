import { useNavigate } from 'react-router-dom'
import { cn } from '../utils.js'
import { Button } from '../atoms/Button'

// ── Plan type config ───────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  Diet: {
    progress:      'bg-meals-prim',
    gradient:      'var(--gradient-meals)',
    image:         'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80',
    badge:         'bg-meals-prim-100 text-meals-prim',
    detail:        'bg-meals-prim',
    btnPrimary:    'meals-primary',
    btnOutline:    'meals-outline',
  },
  Workout: {
    progress:      'bg-workout-prim',
    gradient:      'var(--gradient-workout)',
    image:         'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=400&q=80',
    badge:         'bg-workout-prim-100 text-workout-prim',
    detail:        'bg-workout-sec',
    btnPrimary:    'workout-primary',
    btnOutline:    'workout-outline',
  },
  Rehab: {
    progress:      'bg-rehab-prim',
    gradient:      'var(--gradient-rehab)',
    image:         'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80',
    badge:         'bg-rehab-prim-100 text-rehab-prim',
    detail:        'bg-rehab-prim',
    btnPrimary:    'rehab-primary',
    btnOutline:    'rehab-outline',
  },
}

// ── Progress bar ───────────────────────────────────────────────────────────────
function ProgressBar({ value, max, color = 'bg-surface-action' }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div className="w-full h-2 bg-neutral-100 rounded-round overflow-hidden">
      <div
        className={cn('h-full rounded-round transition-all duration-500', color)}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

// ── Closest item preview ───────────────────────────────────────────────────────
function ClosestPreview({ label }) {
  return (
    <div className="flex flex-col items-center gap-1 min-w-[4.5rem]">
      <p className="text-body-sm text-text-disabled font-semibold text-center leading-tight">{label}</p>
      <div className="w-full h-10 rounded-md bg-neutral-100" />
      <div className="w-6 h-6 rounded-md border border-border-primary flex items-center justify-center text-text-disabled">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
    </div>
  )
}

// ── PlanCard ──────────────────────────────────────────────────────────────────
export function PlanCard({
  id,
  name,
  defaultTab = 'Diet',
  dateRange = 'Jan 01, 2026 → Feb 01, 2026 · 4 weeks',
  detail = 'Daily calorie target: kcal / day · Goal: Lose Weight',
  progress = 10,
  progressMax = 30,
  sessions,
  sessionsMax,
  ctaLabel = 'Log a meal',
  image,
}) {
  const navigate = useNavigate()
  const planType = defaultTab
  const cfg = TYPE_CONFIG[planType] || TYPE_CONFIG.Diet
  const bgImage = image || cfg.image
  const closestLabel = planType === 'Diet' ? 'Closest\nMeal' : 'Closest\nWorkout'

  return (
    <div className="flex border border-border-primary rounded-xl overflow-hidden bg-surface-primary hover:shadow-md transition-shadow">

      {/* Left panel — fixed width, image background */}
      <div
        className="relative shrink-0 w-32 flex items-end justify-start p-3 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 60%, transparent 100%), url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Type badge top-right */}
        <span className={cn('absolute top-2 right-2 text-body-sm font-bold px-2 py-0.5 rounded-round', cfg.badge)}>
          {planType}
        </span>
        {/* Plan name bottom-left */}
        <span className="text-body-md font-bold text-neutral-white leading-tight">{name}</span>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 px-5 py-4 gap-3 min-w-0">

        {/* Date range */}
        <p className="text-body-sm text-text-disabled">{dateRange}</p>

        {/* Highlighted detail */}
        <div className={cn('px-3 py-1.5 rounded-md text-body-sm font-semibold text-neutral-white w-fit max-w-full', cfg.detail)}>
          {detail}
        </div>

        {/* Progress */}
        <div className="flex flex-col gap-1">
          <ProgressBar value={progress} max={progressMax} color={cfg.progress} />
          {sessions !== undefined && (
            <p className="text-body-sm text-text-disabled">
              {sessions} / {sessionsMax} {planType === 'Diet' ? 'days on track' : 'sessions completed'}
            </p>
          )}
        </div>

        {/* CTAs */}
        <div className="flex gap-2 mt-1">
          <Button variant={cfg.btnOutline} size="sm" onClick={() => {
            const type = planType.toLowerCase()
            const planId = id || name.replace(/\s+/g, '-').toLowerCase()
            navigate(`/plans/${type}/${planId}`)
          }}>View Plan</Button>
          <Button variant={cfg.btnPrimary} size="sm">{ctaLabel}</Button>
        </div>
      </div>

      {/* Closest preview column */}
      <div className="border-l border-border-primary px-4 py-4 flex items-center">
        <ClosestPreview label={closestLabel} />
      </div>
    </div>
  )
}
