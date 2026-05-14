import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { PlanCard } from '../components/molecules/PlanCard.jsx'
import { Button } from '../components/atoms/Button.jsx'
import { cn } from '../components/utils.js'
import { getWorkoutPlans, deleteWorkoutPlan } from '../api/workoutsService.js'
import { getMealPlans, getMealPlan, deleteMealPlan } from '../api/mealPlansService.js'
import { getMyRehabPlans, deleteRehabPlan } from '../api/rehabService.js'

const TABS = ['All', 'Workout', 'Diet', 'Rehab']

// ── Meal slot type → display time (best-effort; backend has no times) ────────
const SLOT_TIMES = {
  breakfast: '08:00 AM',
  lunch:     '01:00 PM',
  dinner:    '07:00 PM',
  snack:     '04:00 PM',
}

// ── Normalise backend plan shapes into a unified display shape ──────────────

function normaliseWorkoutPlan(p) {
  // WorkoutPlanListItem: title, difficulty_level, schedule_type, start_date, end_date
  // NO is_active, NO routines (those only exist on WorkoutPlanResponse / full detail)
  return {
    id: p.id,
    backendId: p.id,
    planType: 'Workout',
    defaultTab: 'Workout',
    name: p.title,
    status: 'planned',
    dateRange: [p.start_date, p.end_date].filter(Boolean).join(' → ') || 'No date range set',
    detail: `Level: ${p.difficulty_level ?? '—'} · Type: ${p.schedule_type ?? '—'}`,
    detailColor: 'bg-workout-prim',
    routines: [],
    progress: 0,
    progressMax: 0,
    ctaLabel: 'Log a workout',
  }
}

// Accepts MealPlanResponse (full detail with slot_meals embedded)
function normaliseMealPlanFull(p, takenMap = {}) {
  const slots = (p.slot_meals ?? []).map(s => ({
    id: s.id,
    label: s.meal_type,
    time: SLOT_TIMES[s.meal_type] ?? '12:00 PM',
    taken: !!(takenMap[s.id]),
    // ClosestPreview reads slot.meals[] — wrap the single embedded meal object
    meals: s.meal
      ? [{ id: s.meal_id, name: s.meal.title, image_url: s.meal.image_url, image: s.meal.image_url }]
      : [],
    selectedMealId: s.meal_id,
  }))

  const takenCount = slots.filter(s => s.taken).length

  return {
    id: p.id,
    backendId: p.id,
    planType: 'Diet',
    defaultTab: 'Diet',
    name: p.title,
    status: 'planned',
    dateRange: [p.start_date, p.end_date].filter(Boolean).join(' → ') || 'No date range set',
    detail: `Goal: ${p.goal_type ?? '—'}`,
    detailColor: 'bg-meals-prim',
    slots,
    slotCount: slots.length,
    progress: takenCount,
    progressMax: slots.length,
    ctaLabel: 'Log a meal',
  }
}

// Fallback when detail fetch fails — uses MealPlanListItem (no slot data)
function normaliseMealPlanSummary(p) {
  return {
    id: p.id,
    backendId: p.id,
    planType: 'Diet',
    defaultTab: 'Diet',
    name: p.title,
    status: 'planned',
    dateRange: [p.start_date, p.end_date].filter(Boolean).join(' → ') || 'No date range set',
    detail: `Goal: ${p.goal_type ?? '—'}`,
    detailColor: 'bg-meals-prim',
    slots: null,
    slotCount: p.slot_count ?? 0,
    progress: 0,
    progressMax: p.slot_count ?? 0,
    ctaLabel: 'Log a meal',
  }
}

function normaliseRehabPlan(p) {
  // RehabPlanListItem: title, description, is_active, condition — no routines
  return {
    id: p.id,
    backendId: p.id,
    planType: 'Rehab',
    defaultTab: 'Rehab',
    name: p.title,
    status: p.is_active ? 'active' : 'planned',
    dateRange: 'Ongoing',
    detail: p.description ?? 'Rehab protocol',
    detailColor: 'bg-rehab-prim',
    routines: [],
    progress: 0,
    progressMax: 0,
    ctaLabel: 'View Protocol',
  }
}

// ── Spinner ────────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-4 border-border-primary border-t-text-action rounded-full animate-spin" />
    </div>
  )
}

export default function PlansPage() {
  const [activeTab, setActiveTab] = useState('All')
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [planToDelete, setPlanToDelete] = useState(null)  // { id, planType }
  const [deleting, setDeleting] = useState(false)
  // Local "taken" state for meal slots — { [slotId]: boolean }
  // Resets on page refresh (no persistence needed for a quick day-level toggle)
  const [slotTakenMap, setSlotTakenMap] = useState({})

  // ── Fetch all plan types from backend ─────────────────────────────────────
  const loadPlans = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [workoutRes, mealRes, rehabRes] = await Promise.allSettled([
        getWorkoutPlans(),
        getMealPlans(),
        getMyRehabPlans(),
      ])

      const workoutPlans = workoutRes.status === 'fulfilled'
        ? (workoutRes.value ?? []).map(normaliseWorkoutPlan)
        : []

      const rehabPlans = rehabRes.status === 'fulfilled'
        ? (rehabRes.value ?? []).map(normaliseRehabPlan)
        : []

      // For meal plans: fetch full detail for each plan to get slot_meals with images
      let mealPlans = []
      if (mealRes.status === 'fulfilled' && mealRes.value?.length > 0) {
        const mealListItems = mealRes.value
        const detailResults = await Promise.allSettled(
          mealListItems.map(p => getMealPlan(p.id))
        )
        mealPlans = mealListItems.map((listItem, i) => {
          if (detailResults[i].status === 'fulfilled') {
            return normaliseMealPlanFull(detailResults[i].value, slotTakenMap)
          }
          // Fall back to summary if detail fetch fails
          return normaliseMealPlanSummary(listItem)
        })
      }

      setPlans([...workoutPlans, ...mealPlans, ...rehabPlans])
    } catch (err) {
      setError(err.message || 'Failed to load plans.')
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    loadPlans()
  }, [loadPlans])

  // ── Slot taken toggle (local state) ───────────────────────────────────────
  const handleToggleSlotTaken = useCallback((planId, slotId) => {
    setSlotTakenMap(prev => {
      const next = { ...prev, [slotId]: !prev[slotId] }
      // Reflect the change in the plans list
      setPlans(prevPlans => prevPlans.map(p => {
        if (p.id !== planId || !p.slots) return p
        const updatedSlots = p.slots.map(s =>
          s.id === slotId ? { ...s, taken: !s.taken } : s
        )
        const takenCount = updatedSlots.filter(s => s.taken).length
        return { ...p, slots: updatedSlots, progress: takenCount }
      }))
      return next
    })
  }, [])

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDeletePlan = useCallback((id) => {
    const plan = plans.find(p => p.id === id)
    if (!plan) return
    setPlanToDelete({ id, planType: plan.planType })
  }, [plans])

  const confirmDeletePlan = async () => {
    if (!planToDelete) return
    setDeleting(true)
    try {
      const { id, planType } = planToDelete
      if (planType === 'Workout') await deleteWorkoutPlan(id)
      else if (planType === 'Diet')    await deleteMealPlan(id)
      else if (planType === 'Rehab')   await deleteRehabPlan(id)
      setPlans(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      setError(err.message || 'Failed to delete plan.')
    } finally {
      setDeleting(false)
      setPlanToDelete(null)
    }
  }

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filteredPlans = plans.filter(plan =>
    activeTab === 'All' ? true : plan.planType === activeTab
  )

  return (
    <div className="flex flex-col min-h-screen bg-neutral-100">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="bg-surface-primary border-b border-border-primary pt-12 pb-8 px-8 md:px-12 relative overflow-hidden animate-fade-in">
        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-success-100 rounded-full opacity-40 blur-3xl" />
        <div className="absolute bottom-[-50px] left-[10%] w-48 h-48 bg-information-100 rounded-full opacity-40 blur-3xl" />

        <div className="relative z-10 flex flex-col items-start gap-4">
          <div className="flex items-center justify-between w-full">
            <div>
              <h1 className="text-heading-h3 font-bold text-text-headings">Your Plans</h1>
              <p className="text-body-lg text-text-disabled max-w-xl mt-1">
                Manage your active fitness routines, view upcoming plans, and look back at your completed achievements.
              </p>
            </div>
            <button
              onClick={loadPlans}
              disabled={loading}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl border border-border-primary bg-surface-primary text-text-disabled hover:text-text-headings hover:border-neutral-300 text-body-sm font-semibold transition-all disabled:opacity-50"
            >
              <svg className={cn('w-4 h-4', loading && 'animate-spin')} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 4v6h-6M1 20v-6h6" /><path d="M3.51 9a9 9 0 0114.36-3.36L23 10M1 14l5.13 4.36A9 9 0 0020.49 15" />
              </svg>
              Refresh
            </button>
          </div>

          {/* Tab bar */}
          <div className="flex flex-wrap gap-2 mt-4 bg-neutral-100 p-1.5 rounded-xl border border-border-primary">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-4 py-1.5 rounded-lg text-body-sm font-semibold transition-all',
                  activeTab === tab
                    ? 'bg-surface-primary text-text-action shadow-sm border border-border-primary'
                    : 'text-text-disabled hover:text-text-headings'
                )}
              >
                {tab}
                {!loading && tab !== 'All' && (
                  <span className={cn(
                    'ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold',
                    tab === 'Workout' ? 'bg-workout-prim/10 text-workout-prim' :
                    tab === 'Diet'    ? 'bg-meals-prim/10 text-meals-prim'    :
                                       'bg-rehab-prim/10 text-rehab-prim'
                  )}>
                    {plans.filter(p => p.planType === tab).length}
                  </span>
                )}
                {!loading && tab === 'All' && (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-200 text-text-disabled">
                    {plans.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto px-8 py-8 md:px-12 flex flex-col gap-10 animate-fade-in" style={{ animationDelay: '0.1s' }}>

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-3 px-4 py-3 bg-error-50 border border-error-200 rounded-xl text-error-600 text-body-sm font-medium">
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
            <button onClick={loadPlans} className="ml-auto underline hover:no-underline">Retry</button>
          </div>
        )}

        <section aria-label="Plans List" className="flex flex-col gap-6">
          <div className="flex flex-col gap-5">
            {loading ? (
              <Spinner />
            ) : filteredPlans.length > 0 ? (
              filteredPlans.map(plan => (
                <PlanCard
                  key={plan.id}
                  {...plan}
                  onDelete={handleDeletePlan}
                  onToggleSlotTaken={handleToggleSlotTaken}
                />
              ))
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center border border-border-primary border-dashed rounded-xl bg-surface-primary opacity-70">
                <p className="text-body-lg font-semibold text-text-disabled mb-2">
                  No {activeTab === 'All' ? '' : activeTab.toLowerCase() + ' '}plans yet.
                </p>
                <p className="text-body-md text-text-disabled">Try switching tabs or creating a new plan.</p>
              </div>
            )}
          </div>

          {/* Create new plan CTA */}
          <div className="border border-border-primary border-dashed rounded-xl px-8 py-10 flex flex-col items-center gap-3 bg-surface-primary hover:bg-neutral-100 transition-colors mt-4">
            <h3 className="text-heading-h6 font-bold text-text-headings">Create a New Plan</h3>
            <p className="text-body-md text-text-body text-center max-w-sm">
              Start a new meal, workout, or rehab plan tailored just for you.
            </p>
            <Link to="/plans/create" id="create-plan-cta">
              <Button size="sm" className="mt-1 shadow-sm">+ New Plan</Button>
            </Link>
          </div>
        </section>

      </div>

      {/* ── Delete Confirmation Modal ────────────────────────────────────────── */}
      {planToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-black/50 backdrop-blur-xs animate-fade-in" onClick={() => !deleting && setPlanToDelete(null)} />
          <div className="relative bg-surface-primary rounded-3xl shadow-2xl border border-border-primary w-full max-w-md overflow-hidden p-6 flex flex-col gap-5 z-10 animate-fade-in">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-error-50 text-error-500 rounded-2xl shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-heading-h6 font-bold text-text-headings">Delete Plan?</h3>
                <p className="text-body-md text-text-disabled leading-relaxed">
                  Are you absolutely sure? This will permanently delete the plan from the server and cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-2">
              <Button
                variant="neutral"
                onClick={() => setPlanToDelete(null)}
                disabled={deleting}
                className="flex-1 sm:flex-none border border-border-primary bg-surface-primary hover:bg-neutral-100 font-bold px-5 text-text-body"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={confirmDeletePlan}
                disabled={deleting}
                className="flex-1 sm:flex-none bg-error-500 hover:bg-error-600 text-neutral-white font-bold px-6 shadow-md"
              >
                {deleting ? 'Deleting…' : 'Yes, Delete Plan'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
