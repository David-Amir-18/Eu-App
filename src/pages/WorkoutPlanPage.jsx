import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { cn } from '../components/utils.js'
import { Button } from '../components/atoms/Button.jsx'
import { Field } from '../components/atoms/Field.jsx'
import { getExercises } from '../api/exercisesService.js'
import { getWorkoutPlan, createRoutine, deleteRoutine, addExerciseToRoutine } from '../api/workoutsService.js'

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const WEEK_DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// ── Helper: today's routine ───────────────────────────────────────────────────
function getTodayRoutine(plan) {
  if (!plan?.plan_routines?.length) return null
  const routines = plan.plan_routines.filter(r => !r.is_rest_day)
  if (plan.schedule_type === 'weekly') {
    const todayIdx = new Date().getDay() // 0=Sun…6=Sat
    return routines.find(r => r.day_of_week === todayIdx) || null
  } else {
    // nday — cycle through by day count (simplified: use day of year % total slots)
    const slots = plan.plan_routines
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
    const slot = slots[dayOfYear % slots.length]
    return slot?.is_rest_day ? null : slot
  }
}

// ── Modal wrapper ─────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null
  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-neutral-black opacity-50" onClick={onClose} />
      <div className={cn('relative bg-surface-primary rounded-2xl shadow-2xl w-full flex flex-col max-h-[90vh]', widths[size])}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-primary shrink-0">
          <h2 className="text-heading-h6 font-bold text-text-headings">{title}</h2>
          <button onClick={onClose} className="text-text-disabled hover:text-text-headings transition-colors" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5 flex flex-col gap-4">{children}</div>
      </div>
    </div>
  )
}

// ── Add Routine Modal ─────────────────────────────────────────────────────────
function AddRoutineModal({ open, onClose, plan, onCreated }) {
  const [name, setName] = useState('')
  const [dayNumber, setDayNumber] = useState('')
  const [dayOfWeek, setDayOfWeek] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate() {
    if (!name.trim()) { setError('Routine name is required.'); return }
    setLoading(true); setError('')
    try {
      const payload = {
        name: name.trim(),
        ...(plan.schedule_type === 'nday'
          ? { day_number: parseInt(dayNumber) || (plan.plan_routines.length + 1) }
          : { day_of_week: dayOfWeek !== '' ? parseInt(dayOfWeek) : null }),
      }
      const created = await createRoutine(plan.id, payload)
      onCreated(created)
      setName(''); setDayNumber(''); setDayOfWeek('')
      onClose()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="New Routine" size="sm">
      <Field id="routine-name" name="name" label="Routine Name" placeholder="e.g. Push Day, Leg Day…" value={name} onChange={e => setName(e.target.value)} />
      {plan?.schedule_type === 'nday' ? (
        <Field id="day-number" name="dayNumber" label="Day Number" type="number" placeholder="e.g. 1" value={dayNumber} onChange={e => setDayNumber(e.target.value)} />
      ) : (
        <div className="flex flex-col gap-1">
          <label className="text-body-sm font-semibold text-text-headings">Day of Week</label>
          <select value={dayOfWeek} onChange={e => setDayOfWeek(e.target.value)}
            className="rounded-md px-3 py-2 text-body-sm border border-border-primary focus:outline-none focus:border-workout-prim bg-surface-primary text-text-body">
            <option value="">Select day…</option>
            {WEEK_DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
          </select>
        </div>
      )}
      {error && <p className="text-body-sm text-text-error">{error}</p>}
      <div className="flex gap-3">
        <Button variant="workout-outline" size="md" onClick={onClose} className="flex-1">Cancel</Button>
        <Button variant="workout-primary" size="md" onClick={handleCreate} loading={loading} className="flex-1">Create</Button>
      </div>
    </Modal>
  )
}

// ── Routine slide-over ────────────────────────────────────────────────────────
function RoutineSlideOver({ routine, planId, onClose, onRoutineUpdated, onDeleteRoutine }) {
  const [search, setSearch] = useState('')
  const [exercises, setExercises] = useState([])
  const [loadingEx, setLoadingEx] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [addingId, setAddingId] = useState(null)

  useEffect(() => {
    if (!showSearch) return
    setLoadingEx(true)
    getExercises({ search, pageSize: 30 })
      .then(data => setExercises(data.items || []))
      .catch(() => setExercises([]))
      .finally(() => setLoadingEx(false))
  }, [search, showSearch])

  async function handleAdd(ex) {
    if (!routine) return
    setAddingId(ex.id)
    try {
      await addExerciseToRoutine(routine.id, { exercise_id: ex.id, position: routine.exercises.length })
      // Reload the updated routine data
      const { getWorkoutPlan: gp } = await import('../api/workoutsService.js')
      // We'll just notify parent to refresh
      onRoutineUpdated()
      setShowSearch(false); setSearch('')
    } catch (e) {
      console.error(e)
    } finally {
      setAddingId(null)
    }
  }

  if (!routine) return null
  const exList = routine.exercises || []

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-neutral-black opacity-40" onClick={onClose} />
      <div className="relative bg-surface-primary w-full max-w-sm h-full flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-primary">
          <div>
            <h2 className="text-heading-h6 font-bold text-text-headings">{routine.name}</h2>
            <p className="text-body-sm text-text-disabled">{exList.length} exercises</p>
          </div>
          <button onClick={onClose} className="text-text-disabled hover:text-text-headings transition-colors" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-3">
          {exList.length === 0 && (
            <p className="text-body-sm text-text-disabled italic">No exercises yet. Add one below.</p>
          )}
          {exList.map((entry, i) => (
            <div key={entry.id} className="flex items-center justify-between px-4 py-3 rounded-xl border border-border-primary bg-workout-prim-100">
              <div>
                <p className="text-body-md font-semibold text-text-headings">{entry.exercise?.title || `Exercise ${i + 1}`}</p>
                <p className="text-body-sm text-text-disabled capitalize">
                  {entry.exercise?.muscle_group} · {entry.exercise?.equipment_category}
                </p>
              </div>
              <span className="text-body-sm text-workout-prim font-semibold shrink-0 ml-2">
                {entry.sets && entry.reps ? `${entry.sets}×${entry.reps}` : entry.sets ? `${entry.sets} sets` : '—'}
              </span>
            </div>
          ))}

          {showSearch ? (
            <div className="flex flex-col gap-2 mt-2">
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search exercises…"
                className="w-full rounded-md px-3 py-2 text-body-sm border border-border-primary focus:outline-none focus:border-workout-prim bg-surface-primary text-text-body"
                autoFocus
              />
              {loadingEx && <p className="text-body-sm text-text-disabled">Loading…</p>}
              <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
                {exercises.map(ex => {
                  const alreadyAdded = exList.some(e => e.exercise_id === ex.id || e.exercise?.id === ex.id)
                  return (
                    <button key={ex.id} disabled={alreadyAdded || addingId === ex.id}
                      onClick={() => handleAdd(ex)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left',
                        alreadyAdded ? 'opacity-50 cursor-not-allowed' : 'hover:bg-workout-prim-100'
                      )}>
                      <div className="flex-1">
                        <p className="text-body-sm font-semibold text-text-headings">{ex.title}</p>
                        <p className="text-body-sm text-text-disabled">{ex.muscle_group} · {ex.equipment_category}</p>
                      </div>
                      {alreadyAdded && <span className="text-body-sm text-workout-prim font-semibold shrink-0">Added</span>}
                    </button>
                  )
                })}
              </div>
              <button onClick={() => { setShowSearch(false); setSearch('') }}
                className="text-body-sm text-text-disabled hover:text-text-headings transition-colors self-start">
                Cancel
              </button>
            </div>
          ) : (
            <button onClick={() => setShowSearch(true)}
              className="text-body-sm text-workout-prim font-semibold hover:text-workout-prim-500 transition-colors self-start mt-2">
              + Add Exercise
            </button>
          )}
        </div>

        <div className="px-6 py-4 border-t border-border-primary flex flex-col gap-2">
          <Button variant="workout-primary" size="md" fullWidth>Start This Routine</Button>
          <Button variant="ghost" size="sm" fullWidth className="text-text-error" onClick={() => onDeleteRoutine(routine.id)}>
            Delete Routine
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Log Workout Modal ─────────────────────────────────────────────────────────
function LogWorkoutModal({ open, onClose, routine }) {
  const exList = routine?.exercises || []
  const [sets, setSets] = useState([])

  useEffect(() => {
    setSets(exList.map(e => ({ name: e.exercise?.title || 'Exercise', reps: String(e.reps || ''), weight: String(e.weight_kg || '') })))
  }, [routine?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Modal open={open} onClose={onClose} title={`Log: ${routine?.name || ''}`} size="lg">
      <p className="text-body-sm text-text-disabled">Enter actual reps and weight for each exercise.</p>
      {sets.map((s, i) => (
        <div key={i} className="flex flex-col gap-2">
          <span className="text-body-sm font-semibold text-text-headings">{s.name}</span>
          <div className="flex gap-3">
            <Field id={`reps-${i}`} name="reps" placeholder="Reps" type="number" value={s.reps}
              onChange={e => setSets(prev => prev.map((p, idx) => idx === i ? { ...p, reps: e.target.value } : p))}
              className="flex-1" />
            <Field id={`weight-${i}`} name="weight" placeholder="Weight (kg)" type="number" value={s.weight}
              onChange={e => setSets(prev => prev.map((p, idx) => idx === i ? { ...p, weight: e.target.value } : p))}
              className="flex-1" />
          </div>
        </div>
      ))}
      <div className="flex gap-3 pt-2">
        <Button variant="workout-outline" size="md" onClick={onClose} className="flex-1">Cancel</Button>
        <Button variant="workout-primary" size="md" onClick={onClose} className="flex-1">Save Log</Button>
      </div>
    </Modal>
  )
}

// ── Plan Structure sidebar ────────────────────────────────────────────────────
function PlanStructure({ plan, onSlotClick }) {
  const routines = plan.plan_routines || []
  if (plan.schedule_type === 'weekly') {
    return (
      <div className="flex flex-col gap-2">
        {WEEK_DAYS.map((day, idx) => {
          const routine = routines.find(r => r.day_of_week === idx)
          return (
            <div key={day}
              onClick={() => routine && !routine.is_rest_day && onSlotClick(routine)}
              className={cn('flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                routine && !routine.is_rest_day
                  ? 'bg-workout-prim-100 cursor-pointer hover:bg-workout-prim-200'
                  : 'bg-neutral-100'
              )}>
              <span className="text-body-sm font-bold text-workout-prim w-10 shrink-0">{day}</span>
              <span className={cn('text-body-sm font-semibold', routine && !routine.is_rest_day ? 'text-text-headings' : 'text-text-disabled')}>
                {routine ? (routine.is_rest_day ? 'Rest' : routine.name) : 'Rest'}
              </span>
            </div>
          )
        })}
      </div>
    )
  }
  // nday
  return (
    <div className="flex flex-col gap-2">
      {routines.map((r, i) => (
        <div key={r.id}
          onClick={() => !r.is_rest_day && onSlotClick(r)}
          className={cn('flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
            !r.is_rest_day ? 'bg-workout-prim-100 cursor-pointer hover:bg-workout-prim-200' : 'bg-neutral-100'
          )}>
          <span className="text-body-sm font-bold text-workout-prim w-14 shrink-0">
            {r.day_number ? `Day ${r.day_number}` : `#${i + 1}`}
          </span>
          <span className={cn('text-body-sm font-semibold', !r.is_rest_day ? 'text-text-headings' : 'text-text-disabled')}>
            {r.is_rest_day ? 'Rest' : r.name}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function WorkoutPlanPage() {
  const navigate = useNavigate()
  const { id: planId } = useParams()

  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddRoutine, setShowAddRoutine] = useState(false)
  const [activeRoutine, setActiveRoutine] = useState(null)
  const [showLog, setShowLog] = useState(false)

  const fetchPlan = useCallback(async () => {
    if (!planId) return

    // Guard: backend expects a UUID — redirect if it's a legacy slug
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!UUID_RE.test(planId)) {
      navigate('/plans', { replace: true })
      return
    }

    setLoading(true)
    try {
      const data = await getWorkoutPlan(planId)
      setPlan(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [planId, navigate])

  useEffect(() => { fetchPlan() }, [fetchPlan])

  // Refresh just the active routine after adding an exercise
  async function handleRoutineUpdated() {
    await fetchPlan()
    if (activeRoutine) {
      setPlan(prev => {
        if (!prev) return prev
        const updated = prev.plan_routines.find(r => r.id === activeRoutine.id)
        if (updated) setActiveRoutine(updated)
        return prev
      })
    }
  }

  async function handleDeleteRoutine(routineId) {
    try {
      await deleteRoutine(routineId)
      setActiveRoutine(null)
      fetchPlan()
    } catch (e) {
      console.error(e)
    }
  }

  // ── Loading / error ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-surface-page items-center justify-center gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-workout-prim border-t-transparent animate-spin" />
        <p className="text-body-md font-semibold text-text-disabled">Loading plan…</p>
      </div>
    )
  }

  if (error || !plan) {
    return (
      <div className="flex flex-col min-h-screen bg-surface-page items-center justify-center gap-4 px-8">
        <p className="text-body-lg font-semibold text-text-error">{error || 'Plan not found.'}</p>
        <Button variant="workout-outline" onClick={() => navigate('/plans')}>Back to Plans</Button>
      </div>
    )
  }

  const todayRoutine = getTodayRoutine(plan)
  const nonRestRoutines = (plan.plan_routines || []).filter(r => !r.is_rest_day)

  return (
    <div className="flex flex-col min-h-screen bg-surface-page">

      {/* ── Banner ── */}
      <div className="relative h-56 overflow-hidden bg-workout-prim">
        <div className="absolute inset-0 bg-gradient-to-br from-workout-prim via-workout-prim-600 to-workout-prim-700 opacity-90" />
        <div className="absolute inset-0 flex flex-col justify-between p-6">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-body-sm text-neutral-white font-semibold self-start hover:opacity-80 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Back
          </button>
          <div className="flex items-end justify-between">
            <div>
              <span className="bg-neutral-white/20 text-neutral-white text-body-sm font-bold px-2 py-0.5 rounded-round capitalize">
                {plan.difficulty_level || 'Workout'}
              </span>
              <h1 className="text-heading-h4 font-bold text-neutral-white mt-1">{plan.title}</h1>
              <p className="text-body-sm text-neutral-200">
                {plan.start_date ? new Date(plan.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No start date'}
                {plan.end_date && ` → ${new Date(plan.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                {' · '}{plan.schedule_type === 'weekly' ? 'Weekly schedule' : `${plan.plan_routines?.length || 0}-day cycle`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div className="px-8 py-3 bg-surface-primary border-b border-border-primary flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-body-sm text-text-disabled">Routines</span>
          <span className="text-body-sm font-bold text-text-headings">{nonRestRoutines.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-body-sm text-text-disabled">Schedule</span>
          <span className="text-body-sm font-bold text-text-headings capitalize">{plan.schedule_type === 'weekly' ? 'Weekly' : 'N-Day'}</span>
        </div>
        {plan.description && (
          <p className="text-body-sm text-text-disabled ml-auto truncate max-w-xs">{plan.description}</p>
        )}
      </div>

      {/* ── Main content ── */}
      <div className="flex flex-col lg:flex-row gap-6 px-8 py-6 flex-1">

        {/* Left: Plan structure */}
        <div className="lg:w-72 shrink-0 flex flex-col gap-4">
          <div className="bg-surface-primary rounded-xl border border-border-primary p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-body-lg font-bold text-text-headings">Plan Structure</h2>
              <span className="text-body-sm text-text-disabled capitalize">{plan.schedule_type}</span>
            </div>
            {plan.plan_routines?.length ? (
              <PlanStructure plan={plan} onSlotClick={r => setActiveRoutine(r)} />
            ) : (
              <p className="text-body-sm text-text-disabled italic">No routines yet. Add one to get started.</p>
            )}
          </div>

          {/* Today's workout */}
          <div className="bg-workout-prim rounded-xl p-5 flex flex-col gap-3">
            <p className="text-body-sm text-workout-prim-100 font-semibold uppercase tracking-widest">Today</p>
            {todayRoutine ? (
              <>
                <h3 className="text-body-lg font-bold text-neutral-white">{todayRoutine.name}</h3>
                <p className="text-body-sm text-workout-prim-100">{(todayRoutine.exercises || []).length} exercises</p>
                <Button variant="workout-outline" size="sm"
                  className="border-neutral-white text-neutral-white hover:bg-neutral-white/10"
                  onClick={() => { setActiveRoutine(todayRoutine); setShowLog(true) }}>
                  Log Workout
                </Button>
              </>
            ) : (
              <p className="text-body-md font-semibold text-neutral-white">Rest Day </p>
            )}
          </div>
        </div>

        {/* Right: Routines grid */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-body-lg font-bold text-text-headings">Routines</h2>
            <Button variant="workout-primary" size="sm" onClick={() => setShowAddRoutine(true)}>
              + Add Routine
            </Button>
          </div>

          {nonRestRoutines.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-3 border-2 border-dashed border-border-primary rounded-xl text-center">
              <p className="text-body-md font-semibold text-text-disabled">No routines yet</p>
              <p className="text-body-sm text-text-disabled">Create your first routine to start tracking workouts.</p>
              <Button variant="workout-outline" size="sm" onClick={() => setShowAddRoutine(true)}>Create Routine</Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {nonRestRoutines.map(routine => (
                <div key={routine.id}
                  className="bg-surface-primary rounded-xl border border-border-primary px-5 py-4 flex items-center justify-between hover:border-workout-prim transition-colors">
                  <div className="flex flex-col gap-1">
                    <span className="text-body-md font-bold text-text-headings">{routine.name}</span>
                    <span className="text-body-sm text-text-disabled">
                      {(routine.exercises || []).length} exercise{(routine.exercises || []).length !== 1 ? 's' : ''}
                      {plan.schedule_type === 'weekly' && routine.day_of_week != null
                        ? ` · ${WEEK_DAYS[routine.day_of_week]}`
                        : routine.day_number != null ? ` · Day ${routine.day_number}` : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="workout-outline" size="sm" onClick={() => setActiveRoutine(routine)}>View</Button>
                    <Button variant="workout-primary" size="sm" onClick={() => { setActiveRoutine(routine); setShowLog(true) }}>Log</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Modals / slide-overs ── */}
      <AddRoutineModal
        open={showAddRoutine}
        onClose={() => setShowAddRoutine(false)}
        plan={plan}
        onCreated={() => fetchPlan()}
      />
      <RoutineSlideOver
        routine={activeRoutine && !showLog ? activeRoutine : null}
        planId={plan.id}
        onClose={() => setActiveRoutine(null)}
        onRoutineUpdated={handleRoutineUpdated}
        onDeleteRoutine={handleDeleteRoutine}
      />
      <LogWorkoutModal
        open={showLog}
        onClose={() => setShowLog(false)}
        routine={activeRoutine || todayRoutine}
      />
    </div>
  )
}
