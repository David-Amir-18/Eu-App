import { useState } from 'react'
import { cn } from '../utils.js'
import { Button } from '../atoms/Button'

// ── Plan type tab switcher ─────────────────────────────────────────────────────
const PLAN_TABS = ['Diet', 'Workout', 'Rehab']

const tabActiveClasses = {
  Diet:    'bg-success-500 text-neutral-white',
  Workout: 'bg-error-500 text-neutral-white',
  Rehab:   'bg-secondary-500 text-neutral-white',
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

// ── Closest item preview (small right column) ──────────────────────────────────
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
  name,
  defaultTab = 'Diet',
  dateRange = 'Jan 01, 2026 → Feb 01, 2026 · 4 weeks',
  detail = 'Daily calorie target: kcal / day · Goal: Lose Weight',
  detailColor = 'bg-surface-action',
  progress = 10,
  progressMax = 30,
  sessions,
  sessionsMax,
  ctaLabel = 'Log a meal',
}) {
  const [activeTab, setActiveTab] = useState(defaultTab)

  const progressColor =
    activeTab === 'Diet'    ? 'bg-success-500' :
    activeTab === 'Workout' ? 'bg-error-500' :
    'bg-secondary-500'

  const closestLabel = activeTab === 'Diet' ? 'Closest\nMeal' : 'Closest\nworkout'

  return (
    <div className="flex border border-border-primary rounded-lg overflow-hidden bg-surface-primary hover:shadow-sm transition-shadow">

      {/* Plan name label */}
      <div className="flex items-center justify-center bg-neutral-100 px-5 min-w-[7rem] max-w-[8rem]">
        <span className="text-body-md font-bold text-text-headings text-center">{name}</span>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 px-5 py-4 gap-3 min-w-0">

        {/* Tab switcher */}
        <div className="flex items-center gap-2">
          {PLAN_TABS.map((tab) => (
            <button
              key={tab}
              id={`plan-tab-${name.replace(/\s+/g, '-').toLowerCase()}-${tab.toLowerCase()}`}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-3 py-1 rounded-round text-body-sm font-semibold transition-colors border',
                activeTab === tab
                  ? tabActiveClasses[tab] + ' border-transparent'
                  : 'bg-surface-primary text-text-disabled border-border-primary hover:border-border-action hover:text-text-action'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Date range */}
        <p className="text-body-sm text-text-disabled">{dateRange}</p>

        {/* Highlighted detail */}
        <div className={cn('px-3 py-1.5 rounded-md text-body-sm font-semibold text-neutral-white w-fit max-w-full', detailColor)}>
          {detail}
        </div>

        {/* Progress */}
        <div className="flex flex-col gap-1">
          <ProgressBar value={progress} max={progressMax} color={progressColor} />
          {sessions !== undefined && (
            <p className="text-body-sm text-text-disabled">
              {sessions} / {sessionsMax} {activeTab === 'Diet' ? 'days on track' : 'sessions completed'}
            </p>
          )}
        </div>

        {/* CTAs */}
        <div className="flex gap-2 mt-1">
          <Button variant="outline" size="sm">View Plan</Button>
          <Button size="sm">{ctaLabel}</Button>
        </div>
      </div>

      {/* Closest preview column */}
      <div className="border-l border-border-primary px-4 py-4 flex items-center">
        <ClosestPreview label={closestLabel} />
      </div>
    </div>
  )
}
