import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { cn } from '../components/utils.js'
import { Button } from '../components/atoms/Button.jsx'
import { Field } from '../components/atoms/Field.jsx'
import { DatePicker } from '../components/molecules/DatePicker.jsx'
import { DefinedField } from '../components/molecules/DefinedField.jsx'
import { getExercises } from '../api/exercisesService.js'
import { getWorkoutPlan, createRoutine, deleteRoutine, addExerciseToRoutine, updateWorkoutPlan, updateRoutine, cloneRoutine } from '../api/workoutsService.js'
import { getActiveWorkoutEnrollment, createEnrollment, updateEnrollmentStatus } from '../api/enrollmentService.js'
import {
  createWorkoutSession,
  updateWorkoutSessionStatus,
  logWorkoutSet,
  logWorkoutSetsBulk,
  updateWorkoutSet,
  deleteWorkoutSet,
  getWorkoutSessions,
} from '../api/workoutTrackingService.js'

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

// ── Workout Session Logger (slide-over) ───────────────────────────────────────
// Replaces the fake LogWorkoutModal. Creates a real in_progress session,
// lets the user log sets per exercise, then completes it.
function WorkoutSessionLogger({ open, onClose, routine, planId, onSessionCompleted, resumeSession }) {
  const [session, setSession]         = useState(null)   // SessionResponse from backend
  const [starting, setStarting]       = useState(false)
  const [completing, setCompleting]   = useState(false)
  const [error, setError]             = useState('')

  // Per-exercise set data: { [exerciseId]: [{ set_number, reps, weight, itemId, is_completed }] }
  const [setData, setSetData] = useState({})
  const [loggingId, setLoggingId] = useState(null)  // exerciseId currently being submitted

  const exList = routine?.exercises || []

  // Reset state every time we open for a different routine
  useEffect(() => {
    if (open && routine) {
      // If resuming an existing session, pre-load it
      if (resumeSession) {
        setSession(resumeSession)
        setError('')
        setCompleting(false)
        // Pre-fill set rows from routine prescription
        const initial = {}
        exList.forEach(entry => {
          const exId = entry.exercise_id || entry.exercise?.id
          if (!exId) return
          const numSets = entry.sets || 3
          initial[exId] = Array.from({ length: numSets }, (_, i) => ({
            set_number: i + 1,
            reps: String(entry.reps || ''),
            weight: String(entry.weight_kg || ''),
            itemId: null,
            is_completed: false,
          }))
        })
        setSetData(initial)
        return
      }
      setSession(null)
      setError('')
      setCompleting(false)
      const initial = {}
      exList.forEach(entry => {
        const exId = entry.exercise_id || entry.exercise?.id
        if (!exId) return
        const numSets = entry.sets || 3
        initial[exId] = Array.from({ length: numSets }, (_, i) => ({
          set_number: i + 1,
          reps: String(entry.reps || ''),
          weight: String(entry.weight_kg || ''),
          itemId: null,
          is_completed: false,
        }))
      })
      setSetData(initial)
    }
    if (!open) {
      setSession(null)
      setStarting(false)
      setCompleting(false)
      setError('')
    }
  }, [open, routine?.id, resumeSession?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Create the session in_progress
  async function handleStart() {
    setStarting(true); setError('')
    try {
      const s = await createWorkoutSession({
        workout_plan_id: planId || null,
        routine_id: routine?.id || null,
        status: 'in_progress',
      })
      setSession(s)
    } catch (err) {
      setError(err.message)
    } finally {
      setStarting(false)
    }
  }

  // Log all sets for one exercise (bulk)
  async function handleLogExercise(exId, exerciseName) {
    if (!session) return
    const rows = setData[exId] || []
    const setsPayload = rows.map(r => ({
      exercise_id: exId,
      set_number: r.set_number,
      reps_completed: r.reps ? parseInt(r.reps) : 0,
      weight_used: r.weight ? parseFloat(r.weight) : 0,
      is_completed: true,
    }))
    setLoggingId(exId)
    try {
      await logWorkoutSetsBulk(session.id, exId, setsPayload)
      // Mark all sets completed locally
      setSetData(prev => ({
        ...prev,
        [exId]: prev[exId].map(r => ({ ...r, is_completed: true })),
      }))
    } catch (err) {
      setError(`Failed to log ${exerciseName}: ${err.message}`)
    } finally {
      setLoggingId(null)
    }
  }

  // Complete the session
  async function handleComplete() {
    if (!session) return
    setCompleting(true); setError('')
    try {
      await updateWorkoutSessionStatus(session.id, { status: 'completed' })
      onSessionCompleted?.()
      onClose()
    } catch (err) {
      setError(err.message)
      setCompleting(false)
    }
  }

  // Abandon
  async function handleAbandon() {
    if (!session) return
    try {
      await updateWorkoutSessionStatus(session.id, { status: 'abandoned' })
    } catch (_) {}
    onClose()
  }

  function updateSetRow(exId, idx, field, value) {
    setSetData(prev => ({
      ...prev,
      [exId]: prev[exId].map((r, i) => i === idx ? { ...r, [field]: value } : r),
    }))
  }

  function addSetRow(exId) {
    setSetData(prev => {
      const rows = prev[exId] || []
      return {
        ...prev,
        [exId]: [...rows, { set_number: rows.length + 1, reps: '', weight: '', itemId: null, is_completed: false }],
      }
    })
  }

  if (!open) return null

  const anyLogged = Object.values(setData).some(rows => rows.some(r => r.is_completed))

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-neutral-black opacity-40" onClick={session ? undefined : onClose} />
      <div className="relative bg-surface-primary w-full max-w-lg h-full flex flex-col shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-primary shrink-0 bg-workout-prim">
          <div>
            <h2 className="text-heading-h6 font-bold text-neutral-white">{routine?.name || 'Workout'}</h2>
            <p className="text-body-xs text-workout-prim-100">
              {session ? (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-success-400 inline-block animate-pulse" />
                  Session in progress
                </span>
              ) : 'Not started'}
            </p>
          </div>
          <button onClick={session ? handleAbandon : onClose}
            className="text-neutral-white/70 hover:text-neutral-white transition-colors" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">

          {!session ? (
            /* ── Pre-start state ── */
            <div className="flex flex-col items-center justify-center h-full gap-5 text-center">
              <div className="w-16 h-16 rounded-full bg-workout-prim/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-workout-prim" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6.5 6.5h11M6.5 17.5h11M4 12h16M4 12a2 2 0 01-2-2V8a2 2 0 012-2M20 12a2 2 0 002-2V8a2 2 0 00-2-2M4 12a2 2 0 00-2 2v2a2 2 0 002 2M20 12a2 2 0 012 2v2a2 2 0 01-2 2"/>
                </svg>
              </div>
              <div>
                <p className="text-body-lg font-bold text-text-headings">{routine?.name}</p>
                <p className="text-body-sm text-text-disabled mt-1">{exList.length} exercises · Start to begin logging</p>
              </div>
              <button onClick={handleStart} disabled={starting}
                className="px-8 py-3 rounded-xl bg-workout-prim text-neutral-white font-bold text-body-md hover:bg-workout-prim/90 transition-colors shadow-lg disabled:opacity-50">
                {starting ? 'Starting…' : '▶ Start Session'}
              </button>
              {error && <p className="text-body-sm text-text-error">{error}</p>}
            </div>
          ) : (
            /* ── In-progress: exercise logging ── */
            <>
              {exList.map((entry) => {
                const exId = entry.exercise_id || entry.exercise?.id
                if (!exId) return null
                const title = entry.exercise?.title || `Exercise`
                const rows = setData[exId] || []
                const allDone = rows.length > 0 && rows.every(r => r.is_completed)
                const isLogging = loggingId === exId

                return (
                  <div key={exId} className={cn(
                    'rounded-xl border p-4 flex flex-col gap-3 transition-colors',
                    allDone ? 'border-success-300 bg-success-50' : 'border-border-primary bg-surface-primary',
                  )}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-body-md font-bold text-text-headings">{title}</p>
                        <p className="text-body-xs text-text-disabled capitalize">
                          {entry.exercise?.muscle_group} · {entry.exercise?.equipment_category}
                        </p>
                      </div>
                      {allDone && (
                        <span className="text-body-xs font-bold px-2 py-0.5 rounded-full bg-success-100 text-success-700 border border-success-200">✓ Done</span>
                      )}
                    </div>

                    {/* Set rows */}
                    <div className="flex flex-col gap-2">
                      <div className="grid grid-cols-[2rem_1fr_1fr_auto] gap-2 text-body-xs text-text-disabled font-semibold px-1">
                        <span>Set</span><span>Reps</span><span>Weight (kg)</span><span />
                      </div>
                      {rows.map((row, idx) => (
                        <div key={idx} className="grid grid-cols-[2rem_1fr_1fr_auto] gap-2 items-center">
                          <span className={cn('text-body-sm font-bold text-center', row.is_completed ? 'text-success-600' : 'text-text-disabled')}>{idx + 1}</span>
                          <input
                            type="number" min="0" value={row.reps} disabled={allDone}
                            onChange={e => updateSetRow(exId, idx, 'reps', e.target.value)}
                            placeholder="12"
                            className="rounded-md px-2 py-1.5 text-body-sm border border-border-primary focus:outline-none focus:border-workout-prim bg-surface-primary text-text-body w-full disabled:opacity-50"
                          />
                          <input
                            type="number" min="0" step="0.5" value={row.weight} disabled={allDone}
                            onChange={e => updateSetRow(exId, idx, 'weight', e.target.value)}
                            placeholder="0"
                            className="rounded-md px-2 py-1.5 text-body-sm border border-border-primary focus:outline-none focus:border-workout-prim bg-surface-primary text-text-body w-full disabled:opacity-50"
                          />
                          {row.is_completed
                            ? <span className="text-success-600 text-body-sm font-bold">✓</span>
                            : <span className="w-4" />}
                        </div>
                      ))}
                    </div>

                    {!allDone && (
                      <div className="flex gap-2 mt-1">
                        <button onClick={() => addSetRow(exId)}
                          className="text-body-xs text-workout-prim font-semibold hover:underline">
                          + Add Set
                        </button>
                        <button onClick={() => handleLogExercise(exId, title)} disabled={isLogging}
                          className="ml-auto px-4 py-1.5 rounded-lg text-body-sm font-bold bg-workout-prim text-neutral-white hover:bg-workout-prim/90 transition-colors disabled:opacity-50">
                          {isLogging ? 'Saving…' : 'Log Exercise'}
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}

              {error && <p className="text-body-sm text-text-error px-1">{error}</p>}
            </>
          )}
        </div>

        {/* Footer */}
        {session && (
          <div className="px-6 py-4 border-t border-border-primary flex flex-col gap-2 shrink-0">
            <button onClick={handleComplete} disabled={completing || !anyLogged}
              className="w-full py-3 rounded-xl bg-success-600 text-neutral-white font-bold text-body-md hover:bg-success-700 transition-colors shadow-md disabled:opacity-50">
              {completing ? 'Completing…' : '✓ Complete Session'}
            </button>
            {!anyLogged && (
              <p className="text-body-xs text-text-disabled text-center">Log at least one exercise to complete the session.</p>
            )}
            <button onClick={handleAbandon} className="text-body-sm text-text-error hover:underline text-center">
              Abandon Session
            </button>
          </div>
        )}
      </div>
    </div>
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

// ── Edit Plan Modal ───────────────────────────────────────────────────────────
function EditPlanModal({ open, onClose, plan, onSaved }) {
  const [title, setTitle] = useState(plan?.title || '')
  const [description, setDescription] = useState(plan?.description || '')
  const [level, setLevel] = useState(plan?.difficulty_level || 'beginner')
  const [startDate, setStartDate] = useState(plan?.start_date ? new Date(plan.start_date) : null)
  const [endDate, setEndDate] = useState(plan?.end_date ? new Date(plan.end_date) : null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (plan && open) {
      setTitle(plan.title || '')
      setDescription(plan.description || '')
      setLevel(plan.difficulty_level || 'beginner')
      setStartDate(plan.start_date ? new Date(plan.start_date) : null)
      setEndDate(plan.end_date ? new Date(plan.end_date) : null)
      setError('')
    }
  }, [plan, open])

  async function handleSave() {
    if (!title.trim()) { setError('Plan title is required.'); return }
    setLoading(true); setError('')
    try {
      await updateWorkoutPlan(plan.id, {
        title: title.trim(),
        description: description.trim() || null,
        difficulty_level: level,
        start_date: startDate ? startDate.toISOString().split('T')[0] : null,
        end_date: endDate ? endDate.toISOString().split('T')[0] : null,
      })
      onSaved()
      onClose()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const difficultyOptions = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ]

  return (
    <Modal open={open} onClose={onClose} title="Edit Workout Plan" size="md">
      <div className="flex flex-col gap-4">
        <Field id="edit-plan-title" name="title" label="Plan Name" value={title} onChange={e => setTitle(e.target.value)} />
        <Field id="edit-plan-desc" name="description" label="Description" value={description} onChange={e => setDescription(e.target.value)} />
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <DatePicker id="edit-start-date" label="Start Date" value={startDate} onChange={setStartDate} placeholder="Select start date" />
          </div>
          <div className="flex-1">
            <DatePicker id="edit-end-date" label="End Date" value={endDate} onChange={setEndDate} minDate={startDate || undefined} placeholder="Select end date" />
          </div>
        </div>
        <DefinedField id="edit-plan-level" label="Difficulty Level" value={level} onChange={setLevel} options={difficultyOptions} />
      </div>
      {error && <p className="text-body-sm text-text-error">{error}</p>}
      <div className="flex gap-3 pt-2">
        <Button variant="workout-outline" size="md" onClick={onClose} className="flex-1">Cancel</Button>
        <Button variant="workout-primary" size="md" onClick={handleSave} loading={loading} className="flex-1">Save Changes</Button>
      </div>
    </Modal>
  )
}

// ── Edit Routine Modal ────────────────────────────────────────────────────────
function EditRoutineModal({ open, onClose, routine, plan, onUpdated }) {
  const [name, setName] = useState('')
  const [dayNumber, setDayNumber] = useState('')
  const [dayOfWeek, setDayOfWeek] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (routine && open) {
      setName(routine.name || '')
      setDayNumber(routine.day_number || '')
      setDayOfWeek(routine.day_of_week ?? '')
      setError('')
    }
  }, [routine, open])

  async function handleUpdate() {
    if (!name.trim()) { setError('Routine name is required.'); return }
    setLoading(true); setError('')
    try {
      const payload = {
        name: name.trim(),
        ...(plan.schedule_type === 'nday'
          ? { day_number: parseInt(dayNumber) || (plan.plan_routines.length + 1) }
          : { day_of_week: dayOfWeek !== '' ? parseInt(dayOfWeek) : null }),
      }
      await updateRoutine(routine.id, payload)
      onUpdated()
      onClose()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDuplicate() {
    if (plan.schedule_type !== 'weekly') {
      setError('Duplication is currently only supported for weekly schedules.')
      return
    }
    const newDay = prompt('Enter the new Day of Week (0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat):')
    if (newDay === null || newDay === '') return
    const parsedDay = parseInt(newDay)
    if (isNaN(parsedDay) || parsedDay < 0 || parsedDay > 6) {
      setError('Invalid day entered.')
      return
    }
    setLoading(true); setError('')
    try {
      await cloneRoutine(plan.id, routine.id, parsedDay)
      onUpdated()
      onClose()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (!routine) return null

  return (
    <Modal open={open} onClose={onClose} title="Edit Routine" size="sm">
      <Field id="edit-routine-name" name="name" label="Routine Name" value={name} onChange={e => setName(e.target.value)} />
      {plan?.schedule_type === 'nday' ? (
        <Field id="edit-day-number" name="dayNumber" label="Day Number" type="number" value={dayNumber} onChange={e => setDayNumber(e.target.value)} />
      ) : (
        <div className="flex flex-col gap-1">
          <label className="text-body-sm font-semibold text-text-headings">Assigned Day</label>
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
        <Button variant="workout-primary" size="md" onClick={handleUpdate} loading={loading} className="flex-1">Save Changes</Button>
      </div>
      <div className="pt-2 border-t border-border-primary mt-2">
        <Button variant="neutral" size="sm" fullWidth onClick={handleDuplicate} loading={loading} className="border border-border-primary">
          Duplicate to Another Day
        </Button>
      </div>
    </Modal>
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
  const [showEditPlan, setShowEditPlan] = useState(false)
  const [showEditRoutine, setShowEditRoutine] = useState(false)
  const [editingRoutine, setEditingRoutine] = useState(null)
  const [activeRoutine, setActiveRoutine] = useState(null)
  const [showLog, setShowLog] = useState(false)  // legacy, kept for RoutineSlideOver compat

  // ── Tracker state ─────────────────────────────────────────────────────
  const [sessionRoutine, setSessionRoutine] = useState(null)  // routine being logged
  const [showSessionLogger, setShowSessionLogger] = useState(false)
  const [existingSession, setExistingSession] = useState(null) // orphaned in_progress session
  const [resumeSession, setResumeSession] = useState(null)     // session to resume

  // ── Enrollment state ─────────────────────────────────────────────────────
  const [enrollment, setEnrollment] = useState(null)   // EnrollmentResponse | null
  const [enrolling, setEnrolling] = useState(false)
  const [enrollError, setEnrollError] = useState('')

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

  // Fetch active enrollment for this plan on mount
  useEffect(() => {
    getActiveWorkoutEnrollment()
      .then(e => { if (e.workout_plan_id === planId) setEnrollment(e) })
      .catch(() => {}) // 404 = not enrolled, that's fine
  }, [planId])

  // Detect any orphaned in_progress session for this plan
  useEffect(() => {
    if (!planId) return
    getWorkoutSessions({ status: 'in_progress', workout_plan_id: planId })
      .then(({ results }) => {
        if (results?.length) setExistingSession(results[0])
      })
      .catch(() => {})
  }, [planId])

  // Enroll in this plan
  async function handleEnroll() {
    setEnrolling(true); setEnrollError('')
    try {
      const e = await createEnrollment({ workoutPlanId: planId })
      setEnrollment(e)
    } catch (err) {
      setEnrollError(err.message)
    } finally {
      setEnrolling(false)
    }
  }

  // Change status
  async function handleEnrollStatus(newStatus) {
    if (!enrollment) return
    setEnrolling(true); setEnrollError('')
    try {
      const e = await updateEnrollmentStatus(enrollment.id, newStatus)
      setEnrollment(e)
    } catch (err) {
      setEnrollError(err.message)
    } finally {
      setEnrolling(false)
    }
  }

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
      <div className="relative h-56 shrink-0 overflow-hidden bg-workout-prim">
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
            <Button variant="workout-outline" size="sm" className="border-neutral-white text-neutral-white hover:bg-neutral-white/10" onClick={() => setShowEditPlan(true)}>Edit</Button>
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
                  onClick={() => { setSessionRoutine(todayRoutine); setShowSessionLogger(true) }}>
                  ▶ Start Session
                </Button>
              </>
            ) : (
              <p className="text-body-md font-semibold text-neutral-white">Rest Day </p>
            )}
          </div>

          {/* ── Enrollment panel ────────────────────────────────────────────── */}
          <div className="bg-surface-primary rounded-xl border border-border-primary p-5 flex flex-col gap-3">
            <p className="text-body-sm font-bold text-text-headings">Enrollment</p>

            {enrollment ? (
              <>
                <div className={cn(
                  'inline-flex items-center gap-1.5 self-start text-body-sm font-bold px-3 py-1 rounded-full border',
                  enrollment.status === 'active'    && 'bg-success-100 text-success-700 border-success-200',
                  enrollment.status === 'paused'    && 'bg-warning-100 text-warning-700 border-warning-200',
                  enrollment.status === 'completed' && 'bg-information-100 text-information-700 border-information-200',
                  enrollment.status === 'dropped'   && 'bg-error-100 text-error-600 border-error-200',
                )}>
                  {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                </div>
                <p className="text-body-xs text-text-disabled">
                  Since {new Date(enrollment.enrolled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
                <div className="flex flex-col gap-2">
                  {enrollment.status === 'active' && (
                    <>
                      <button onClick={() => handleEnrollStatus('paused')} disabled={enrolling}
                        className="w-full py-2 rounded-lg text-body-sm font-bold border border-warning-300 text-warning-700 bg-warning-50 hover:bg-warning-100 transition-colors disabled:opacity-50">
                        {enrolling ? '…' : '⏸ Pause Enrollment'}
                      </button>
                      <button onClick={() => handleEnrollStatus('completed')} disabled={enrolling}
                        className="w-full py-2 rounded-lg text-body-sm font-bold border border-information-300 text-information-700 bg-information-50 hover:bg-information-100 transition-colors disabled:opacity-50">
                        {enrolling ? '…' : '✓ Mark Completed'}
                      </button>
                      <button onClick={() => handleEnrollStatus('dropped')} disabled={enrolling}
                        className="w-full py-2 rounded-lg text-body-sm font-bold border border-error-200 text-error-500 bg-error-50 hover:bg-error-100 transition-colors disabled:opacity-50">
                        {enrolling ? '…' : '✕ Drop Plan'}
                      </button>
                    </>
                  )}
                  {enrollment.status === 'paused' && (
                    <>
                      <button onClick={() => handleEnrollStatus('active')} disabled={enrolling}
                        className="w-full py-2 rounded-lg text-body-sm font-bold bg-success-600 text-neutral-white hover:bg-success-700 transition-colors disabled:opacity-50">
                        {enrolling ? '…' : '▶ Resume Enrollment'}
                      </button>
                      <button onClick={() => handleEnrollStatus('dropped')} disabled={enrolling}
                        className="w-full py-2 rounded-lg text-body-sm font-bold border border-error-200 text-error-500 bg-error-50 hover:bg-error-100 transition-colors disabled:opacity-50">
                        {enrolling ? '…' : '✕ Drop Plan'}
                      </button>
                    </>
                  )}
                  {(enrollment.status === 'completed' || enrollment.status === 'dropped') && (
                    <button onClick={handleEnroll} disabled={enrolling}
                      className="w-full py-2 rounded-lg text-body-sm font-bold bg-success-600 text-neutral-white hover:bg-success-700 transition-colors disabled:opacity-50">
                      {enrolling ? '…' : '↩ Re-enroll'}
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                <p className="text-body-sm text-text-disabled">Not enrolled yet.</p>
                <button onClick={handleEnroll} disabled={enrolling}
                  className="w-full py-2.5 rounded-lg text-body-sm font-bold bg-workout-prim text-neutral-white hover:bg-workout-prim/90 transition-colors shadow-sm disabled:opacity-50">
                  {enrolling ? 'Enrolling…' : '+ Enroll in This Plan'}
                </button>
              </>
            )}

            {enrollError && <p className="text-body-xs text-text-error">{enrollError}</p>}
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

          {/* Resume banner — shows when an in_progress session exists */}
          {existingSession && (() => {
            const routineMatch = plan.plan_routines?.find(r => r.id === existingSession.routine_id)
            return (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-warning-50 border border-warning-300">
                <span className="text-warning-600 text-body-lg">⚠</span>
                <div className="flex-1">
                  <p className="text-body-sm font-bold text-warning-700">Session in progress</p>
                  <p className="text-body-xs text-warning-600">{routineMatch?.name || 'Unknown routine'} — started earlier</p>
                </div>
                <button
                  onClick={() => {
                    const r = routineMatch || plan.plan_routines?.[0]
                    setSessionRoutine(r)
                    setResumeSession(existingSession)
                    setShowSessionLogger(true)
                  }}
                  className="px-3 py-1.5 rounded-lg text-body-sm font-bold bg-warning-600 text-neutral-white hover:bg-warning-700 transition-colors">
                  ▶ Resume
                </button>
                <button
                  onClick={() => setExistingSession(null)}
                  className="text-warning-400 hover:text-warning-600 transition-colors" aria-label="Dismiss">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            )
          })()}

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
                    <Button variant="workout-outline" size="sm" onClick={() => { setEditingRoutine(routine); setShowEditRoutine(true) }}>Edit</Button>
                    <Button variant="workout-primary" size="sm"
                      onClick={() => { setSessionRoutine(routine); setShowSessionLogger(true) }}>
                      ▶ Start Session
                    </Button>
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

      {/* ── Real workout session logger ── */}
      <WorkoutSessionLogger
        open={showSessionLogger}
        onClose={() => {
          setShowSessionLogger(false)
          setSessionRoutine(null)
          setResumeSession(null)
        }}
        routine={sessionRoutine}
        planId={plan.id}
        resumeSession={resumeSession}
        onSessionCompleted={() => {
          setShowSessionLogger(false)
          setSessionRoutine(null)
          setResumeSession(null)
          setExistingSession(null)  // clear banner
        }}
      />
      <EditPlanModal
        open={showEditPlan}
        onClose={() => setShowEditPlan(false)}
        plan={plan}
        onSaved={fetchPlan}
      />
      <EditRoutineModal
        open={showEditRoutine}
        onClose={() => setShowEditRoutine(false)}
        routine={editingRoutine}
        plan={plan}
        onUpdated={() => {
          fetchPlan()
          // Optionally refresh activeRoutine if it's the one being edited
          if (activeRoutine?.id === editingRoutine?.id) {
            handleRoutineUpdated()
          }
        }}
      />
    </div>
  )
}
