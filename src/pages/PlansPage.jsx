import { useState , useEffect} from 'react'
import { Link } from 'react-router-dom'
import { PlanCard } from '../components/molecules/PlanCard.jsx'
import { Button } from '../components/atoms/Button.jsx'
import { cn } from '../components/utils.js'


const TABS = ['All', 'Active', 'Completed', 'Drafts']

export default function PlansPage() {
  const [activeTab, setActiveTab] = useState('All')

  // Load custom plans from localStorage and combine with ALL_PLANS.
  // Auto-purge stale workout plans that pre-date backend integration (no backendId).
  const [plans, setPlans] = useState(() => {
        try {
            const stored = localStorage.getItem('user_plans')
            const parsed = stored ? JSON.parse(stored) : []
      // Remove any Workout plans that don't have a real backend UUID (backendId)
      const cleaned = parsed.filter(p => !(p.defaultTab === 'Workout' && !p.backendId))
      if (cleaned.length !== parsed.length) {
        localStorage.setItem('user_plans', JSON.stringify(cleaned))
      }
      return [...cleaned]
    } catch {
      return ALL_PLANS
      }
  })

  const [planToDelete, setPlanToDelete] = useState(null)

  const handleDeletePlan = (id) => {
    setPlanToDelete(id)
  }

  const confirmDeletePlan = () => {
    if (!planToDelete) return
    try {
      const stored = localStorage.getItem('user_plans')
      const parsed = stored ? JSON.parse(stored) : []
      const updated = parsed.filter(plan => plan.id !== planToDelete)
      localStorage.setItem('user_plans', JSON.stringify(updated))
      setPlans([...updated, ...(typeof ALL_PLANS !== 'undefined' ? ALL_PLANS : [])])
    } catch (e) {
      console.error(e)
    } finally {
      setPlanToDelete(null)
    }
  }

  const handleToggleSlotTaken = (planId, slotId) => {
    try {
      const updatedPlans = plans.map(p => {
        if (p.id === planId && p.slots) {
          const newSlots = p.slots.map(s => s.id === slotId ? { ...s, taken: !s.taken } : s)
          return { ...p, slots: newSlots }
        }
        return p
      })
      setPlans(updatedPlans)
      
      const stored = localStorage.getItem('user_plans')
      if (stored) {
        const parsed = JSON.parse(stored)
        const updatedStored = parsed.map(p => {
          if (p.id === planId && p.slots) {
            const newSlots = p.slots.map(s => s.id === slotId ? { ...s, taken: !s.taken } : s)
            return { ...p, slots: newSlots }
          }
          return p
        })
        localStorage.setItem('user_plans', JSON.stringify(updatedStored))
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleToggleExerciseDone = (planId, routineId, exerciseIndex) => {
    try {
      const updatePlan = (p) => {
        if (p.id === planId && p.routines) {
          const newRoutines = p.routines.map(r => {
            if (r.id === routineId && r.exercises) {
              const newExercises = r.exercises.map((ex, idx) => {
                if (idx === exerciseIndex) {
                  // handle if ex is string or object
                  if (typeof ex === 'string') {
                    return { title: ex, taken: true }
                  }
                  return { ...ex, taken: !ex.taken }
                }
                return ex
              })
              return { ...r, exercises: newExercises }
            }
            return r
          }
          )
          return { ...p, routines: newRoutines }
        }
        return p
      }

      setPlans(plans.map(updatePlan))
      
      const stored = localStorage.getItem('user_plans')
      if (stored) {
        const parsed = JSON.parse(stored)
        localStorage.setItem('user_plans', JSON.stringify(parsed.map(updatePlan)))
      }
    } catch (e) {
      console.error(e)
    }
  }

  const filteredPlans = plans.filter(plan => {
    if (activeTab === 'All') return plan.status !== 'draft'
    if (activeTab === 'Drafts') return plan.status === 'draft'
    return plan.status.toLowerCase() === activeTab.toLowerCase()
  })

  return (
    <div className="flex flex-col min-h-screen bg-neutral-100">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="bg-surface-primary border-b border-border-primary pt-12 pb-8 px-8 md:px-12 relative overflow-hidden animate-fade-in">
        {/* Abstract background blobs */}
        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-success-100 rounded-full opacity-40 blur-3xl" />
        <div className="absolute bottom-[-50px] left-[10%] w-48 h-48 bg-information-100 rounded-full opacity-40 blur-3xl" />

        <div className="relative z-10 flex flex-col items-start gap-4">
          <h1 className="text-heading-h3 font-bold text-text-headings">Your Plans</h1>
          <p className="text-body-lg text-text-disabled max-w-xl">
            Manage your active fitness routines, view upcoming plans, and look back at your completed achievements.
          </p>

          <div className="flex flex-wrap gap-2 mt-4 bg-neutral-100 p-1.5 rounded-xl border border-border-primary">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-body-sm font-semibold transition-all",
                  activeTab === tab
                    ? "bg-surface-primary text-text-action shadow-sm border border-border-primary"
                    : "text-text-disabled hover:text-text-headings"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto px-8 py-8 md:px-12 flex flex-col gap-10 animate-fade-in" style={{ animationDelay: '0.1s' }}>

        <section aria-label="Plans List" className="flex flex-col gap-6">
          <div className="flex flex-col gap-5">
            {filteredPlans.length > 0 ? (
              filteredPlans.map(plan => {
                let progress = plan.progress
                let progressMax = plan.progressMax
                if (plan.defaultTab === 'Diet' && plan.slots) {
                  progressMax = plan.slots.length
                  progress = plan.slots.filter(s => s.taken).length
                } else if (plan.defaultTab === 'Workout' && plan.routines) {
                  const todayStr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()]
                  const todayRoutine = plan.routines.find(r => (r.assignedDays || []).includes(todayStr))
                  if (todayRoutine && todayRoutine.exercises) {
                    progressMax = todayRoutine.exercises.length
                    progress = todayRoutine.exercises.filter(ex => typeof ex === 'object' && ex.taken).length
                  }
                }
                return (
                  <PlanCard 
                    key={plan.id} 
                    {...plan} 
                    progress={progress}
                    progressMax={progressMax}
                    onDelete={handleDeletePlan} 
                    onToggleSlotTaken={handleToggleSlotTaken}
                    onToggleExerciseDone={handleToggleExerciseDone}
                  />
                )
              })
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center border border-border-primary border-dashed rounded-xl bg-surface-primary opacity-70">
                <p className="text-body-lg font-semibold text-text-disabled mb-2">No {activeTab.toLowerCase()} plans found.</p>
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

      {/* Custom In-App Confirmation Modal */}
      {planToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-black/50 backdrop-blur-xs animate-fade-in" onClick={() => setPlanToDelete(null)} />
          <div className="relative bg-surface-primary rounded-3xl shadow-2xl border border-border-primary w-full max-w-md overflow-hidden p-6 flex flex-col gap-5 animate-scale-up z-10 animate-fade-in">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-error-50 text-error-500 rounded-2xl shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-heading-h6 font-bold text-text-headings">Delete Custom Plan?</h3>
                <p className="text-body-md text-text-disabled leading-relaxed">
                  Are you absolutely sure you want to delete this plan? This action is permanent and cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-2">
              <Button
                variant="neutral"
                onClick={() => setPlanToDelete(null)}
                className="flex-1 sm:flex-none border border-border-primary bg-surface-primary hover:bg-neutral-100 font-bold px-5 text-text-body"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={confirmDeletePlan}
                className="flex-1 sm:flex-none bg-error-500 hover:bg-error-600 text-neutral-white font-bold px-6 shadow-md"
              >
                Yes, Delete Plan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
