import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PlanCard } from '../components/molecules/PlanCard.jsx'
import { Button } from '../components/atoms/Button.jsx'
import { cn } from '../components/utils.js'
import { getUserMetrics } from '../api/authService.js'

// ── Mock user ──────────────────────────────────────────────────────────────────
// username and user_id come from localStorage after login/register

// ── Mock plans ─────────────────────────────────────────────────────────────────
const PLANS = [
  {
    id: 'diabetes-friendly',
    name: 'Diabetes\nfriendly',
    defaultTab: 'Diet',
    dateRange: 'Jan 01, 2026 → Feb 01, 2026 · 4 weeks',
    detail: 'Daily calorie target: kcal / day · Goal: Lose Weight',
    detailColor: 'bg-success-500',
    progress: 10,
    progressMax: 30,
    sessions: 10,
    sessionsMax: 30,
    ctaLabel: 'Log a meal',
  },
  {
    id: 'full-body',
    name: 'Full Body',
    defaultTab: 'Workout',
    dateRange: 'Jan 01, 2026 → Feb 15, 2026 · 6 weeks',
    detail: 'Frequency: 4 days / week · Level: Beginner',
    detailColor: 'bg-error-400',
    progress: 12,
    progressMax: 24,
    sessions: 12,
    sessionsMax: 24,
    ctaLabel: 'Log a workout',
  },
  {
    id: 'acl-injury',
    name: 'ACL Injury',
    defaultTab: 'Rehab',
    dateRange: 'Jan 01, 2026 → Feb 15, 2026 · 6 weeks',
    detail: 'Frequency: 4 days / week · Level: Beginner',
    detailColor: 'bg-secondary-500',
    progress: 12,
    progressMax: 24,
    sessions: 12,
    sessionsMax: 24,
    ctaLabel: 'Log a workout',
  },
]

// ── Calendar helpers ───────────────────────────────────────────────────────────
const DAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const HOURS = ['6 am', '7 am', '8 am', '9 am', '10 am', '11 am', '12 pm', '1 pm', '2 pm', '3 pm', '4 pm']
const CALENDAR_VIEWS = ['Month', 'Week', 'Day']

function getWeekDays(referenceDate) {
  const d = new Date(referenceDate)
  // Monday of the current week
  const day = d.getDay() === 0 ? 6 : d.getDay() - 1
  const monday = new Date(d)
  monday.setDate(d.getDate() - day)
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    return date
  })
}

function formatMonth(date) {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'
  return 'Good Evening'
}

// ── Calendar component ─────────────────────────────────────────────────────────
function WeekCalendar({ today }) {
  const [refDate, setRefDate] = useState(new Date(today))
  const [calView, setCalView] = useState('Week')

  const weekDays = useMemo(() => getWeekDays(refDate), [refDate])

  function prevWeek() {
    const d = new Date(refDate)
    d.setDate(d.getDate() - 7)
    setRefDate(d)
  }
  function nextWeek() {
    const d = new Date(refDate)
    d.setDate(d.getDate() + 7)
    setRefDate(d)
  }
  function goToday() {
    setRefDate(new Date(today))
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-heading-h5 font-bold text-text-headings">
          {formatMonth(refDate)}
        </h2>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex items-center border border-border-primary rounded-lg overflow-hidden">
            {CALENDAR_VIEWS.map((v) => (
              <button
                key={v}
                id={`cal-view-${v.toLowerCase()}`}
                onClick={() => setCalView(v)}
                className={cn(
                  'px-3 py-1.5 text-body-sm font-semibold transition-colors',
                  calView === v
                    ? 'bg-surface-action text-neutral-white'
                    : 'bg-surface-primary text-text-body hover:bg-neutral-100'
                )}
              >
                {v}
              </button>
            ))}
          </div>
          {/* Prev / Today / Next */}
          <div className="flex items-center gap-1">
            <button
              id="cal-prev"
              onClick={prevWeek}
              aria-label="Previous week"
              className="p-1.5 rounded-md text-text-disabled hover:bg-neutral-100 hover:text-text-action transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              id="cal-today"
              onClick={goToday}
              className="px-3 py-1 rounded-md text-body-sm font-semibold text-text-action border border-border-action hover:bg-surface-action-hover2 transition-colors"
            >
              today
            </button>
            <button
              id="cal-next"
              onClick={nextWeek}
              aria-label="Next week"
              className="p-1.5 rounded-md text-text-disabled hover:bg-neutral-100 hover:text-text-action transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-8 border border-border-primary rounded-lg overflow-hidden">
        {/* Empty corner for time column */}
        <div className="border-r border-border-primary bg-neutral-100" />
        {weekDays.map((date, i) => {
          const isToday = date.toDateString() === today.toDateString()
          return (
            <div
              key={i}
              className={cn(
                'flex flex-col items-center py-3 gap-1 border-r last:border-r-0 border-border-primary',
                isToday ? 'bg-surface-action-hover2' : 'bg-neutral-100'
              )}
            >
              <span className="text-body-sm text-text-disabled font-semibold">
                {DAY_LABELS[i]}
              </span>
              <span
                className={cn(
                  'w-8 h-8 rounded-round flex items-center justify-center text-body-md font-bold',
                  isToday
                    ? 'bg-surface-action text-neutral-white'
                    : 'text-text-headings'
                )}
              >
                {date.getDate()}
              </span>
            </div>
          )
        })}

        {/* Time grid */}
        {HOURS.map((hour) => (
          <div key={`row-${hour}`} className="contents">
            <div className="border-t border-r border-border-primary bg-neutral-100 px-3 py-3 text-body-sm text-text-disabled text-right">
              {hour}
            </div>
            {weekDays.map((_, di) => (
              <div
                key={`cell-${hour}-${di}`}
                className="border-t border-r last:border-r-0 border-border-primary h-12 hover:bg-surface-action-hover2 transition-colors cursor-pointer"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Health stats bar ───────────────────────────────────────────────────────────
function HealthStatsBar({ profile, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-neutral-100 rounded-xl p-4 animate-pulse h-20" />
        ))}
      </div>
    )
  }
  if (!profile) return null

  const bmi = profile.Weight && profile.Height
    ? (parseFloat(profile.Weight) / Math.pow(parseFloat(profile.Height) / 100, 2)).toFixed(1)
    : '—'

  const stats = [
    { label: 'Weight', value: profile.Weight ? `${parseFloat(profile.Weight)} kg` : '—' },
    { label: 'Height', value: profile.Height ? `${parseFloat(profile.Height)} cm` : '—' },
    { label: 'BMI', value: bmi },
    { label: 'Goal', value: profile.PrimaryGoal?.replace(/([A-Z])/g, ' $1').trim() ?? '—' },
    { label: 'Fitness Level', value: profile.FitnessLevel ?? '—' },
    { label: 'Activity', value: profile.ActivityLevel?.replace(/([A-Z])/g, ' $1').trim() ?? '—' },
    { label: 'Streak', value: profile.CurrentStreak != null ? `${profile.CurrentStreak} days` : '—' },
    { label: 'Calorie Target', value: profile.DailyCalorieTarget ? `${profile.DailyCalorieTarget} kcal` : '—' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map(({ label, value }) => (
        <div key={label} className="bg-neutral-100 rounded-xl p-4 flex flex-col gap-1 border border-border-primary">
          <span className="text-body-sm text-text-disabled font-semibold">{label}</span>
          <span className="text-body-lg font-bold text-text-headings">{value}</span>
        </div>
      ))}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const today = useMemo(() => new Date(), [])
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)

  const userId = localStorage.getItem('user_id')
  const username = localStorage.getItem('username') || 'there'

  useEffect(() => {
    if (!userId) { setProfileLoading(false); return }
    getUserMetrics(userId)
      .then(data => {
        console.log('Health profile response:', data)
        setProfile(data)
      })
      .catch(err => {
        console.error('Health profile error:', err.message)
        setProfile(null)
      })
      .finally(() => setProfileLoading(false))
  }, [userId])

  return (
    <div className="flex flex-col min-h-screen">
      {/* Scrollable content */}
      <div className="flex-1 overflow-auto px-8 py-8 flex flex-col gap-10 animate-fade-in">

        {/* Greeting */}
        <h1 className="text-heading-h4 font-bold text-text-headings leading-tight">
          {getGreeting()}, {username}!{' '}
          <span className="font-regular text-text-body text-heading-h5">
            Here&apos;s how you&apos;re doing today.
          </span>
        </h1>

        {/* Calendar */}
        <section aria-label="Weekly schedule">
          <WeekCalendar today={today} />
        </section>

        {/* Divider */}
        <div className="h-px bg-border-primary" />

        {/* Your Plans */}
        <section className="flex flex-col gap-6" aria-label="Your Plans">
          <h2 className="text-heading-h4 font-bold text-text-headings">Your Plans</h2>

          <div className="flex flex-col gap-4">
            {PLANS.map((plan) => (
              <PlanCard key={plan.id} {...plan} />
            ))}
          </div>

          {/* Create new plan CTA */}
          {/* <div className="border border-border-primary border-dashed rounded-lg px-8 py-10 flex flex-col items-center gap-3 bg-neutral-100 hover:bg-surface-action-hover2 transition-colors">
            <h3 className="text-heading-h6 font-bold text-text-headings">Create a New Plan</h3>
            <p className="text-body-md text-text-body text-center max-w-sm">
              Start a new meal, workout, or rehab plan tailored just for you.
            </p>
            <Link to="/plans/new" id="create-plan-cta">
              <Button size="sm" className="mt-1">+ New Plan</Button>
            </Link>
          </div> */}
        </section>
      </div>
    </div>
  )
}
