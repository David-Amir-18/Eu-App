import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '../components/utils.js'
import { Button } from '../components/atoms/Button.jsx'
import { Field } from '../components/atoms/Field.jsx'
import { getExercises } from '../api/exercisesService.js'

// ── Mock data ──────────────────────────────────────────────────────────────────
const MOCK_PLAN = {
  id: 'full-body',
  name: 'Full Body Plan',
  image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80',
  level: 'Beginner',
  cycleType: 'nday', // 'week' | 'nday'
  cycleDays: 5,
  structure: [
    { slot: 1, routineId: 'push', label: 'Push' },
    { slot: 2, routineId: 'pull', label: 'Pull' },
    { slot: 3, routineId: null,   label: 'Rest' },
    { slot: 4, routineId: 'upper', label: 'Upper Body' },
    { slot: 5, routineId: 'lower', label: 'Lower Body' },
  ],
  weekStructure: {
    Mon: 'push', Tue: 'pull', Wed: null, Thu: 'upper', Fri: 'lower', Sat: null, Sun: null,
  },
  progress: 12,
  progressMax: 24,
  startDate: 'Jan 01, 2026',
  endDate: 'Feb 15, 2026',
}

const MOCK_ROUTINES = [
  { id: 'push',  name: 'Push',       exercises: ['Bench Press', 'Shoulder Press', 'Tricep Dips'] },
  { id: 'pull',  name: 'Pull',       exercises: ['Pull-ups', 'Barbell Row', 'Bicep Curl', 'Face Pull'] },
  { id: 'upper', name: 'Upper Body', exercises: ['Incline Press', 'Lat Pulldown', 'Lateral Raise'] },
  { id: 'lower', name: 'Lower Body', exercises: ['Squat', 'Romanian Deadlift', 'Leg Press', 'Calf Raise', 'Leg Curl'] },
]

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// ── Helpers ────────────────────────────────────────────────────────────────────
function getTodayRoutine(plan, routines) {
  if (plan.cycleType === 'nday') {
    const dayInCycle = (new Date().getDay()) % plan.cycleDays
    const slot = plan.structure[dayInCycle]
    return slot?.routineId ? routines.find(r => r.id === slot.routineId) : null
  } else {
    const dayName = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date().getDay()]
    const routineId = plan.weekStructure[dayName]
    return routineId ? routines.find(r => r.id === routineId) : null
  }
}

// ── Modal wrapper ──────────────────────────────────────────────────────────────
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

// ── Structure editor modal ─────────────────────────────────────────────────────
function StructureModal({ open, onClose, plan, routines }) {
  const [cycleType, setCycleType] = useState(plan.cycleType)
  const [slots, setSlots] = useState(plan.structure)
  const [weekMap, setWeekMap] = useState(plan.weekStructure)
  const [cycleDays, setCycleDays] = useState(plan.cycleDays)

  function addSlot() {
    setSlots(s => [...s, { slot: s.length + 1, routineId: null, label: 'Rest' }])
  }
  function removeSlot(i) {
    setSlots(s => s.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, slot: idx + 1 })))
  }
  function setSlotRoutine(i, routineId) {
    setSlots(s => s.map((sl, idx) => idx === i
      ? { ...sl, routineId: routineId || null, label: routineId ? routines.find(r => r.id === routineId)?.name : 'Rest' }
      : sl
    ))
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit Plan Structure" size="lg">
      <div className="flex gap-3">
        {['nday', 'week'].map(t => (
          <button key={t} onClick={() => setCycleType(t)}
            className={cn('flex-1 py-2 rounded-lg text-body-sm font-semibold border transition-colors',
              cycleType === t ? 'bg-workout-prim text-neutral-white border-transparent' : 'border-border-primary text-text-body hover:border-workout-prim'
            )}>
            {t === 'nday' ? 'N-Day Cycle' : 'Week-Bound'}
          </button>
        ))}
      </div>

      {cycleType === 'nday' && (
        <div className="flex flex-col gap-3">
          <p className="text-body-sm text-text-disabled">Define a sequence of days that repeats regardless of the calendar.</p>
          {slots.map((slot, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-body-sm font-bold text-workout-prim w-12 shrink-0">Day {slot.slot}</span>
              <select
                value={slot.routineId || ''}
                onChange={e => setSlotRoutine(i, e.target.value)}
                className="flex-1 rounded-md px-3 py-2 text-body-sm border border-border-primary focus:outline-none focus:border-workout-prim bg-surface-primary text-text-body"
              >
                <option value="">Rest</option>
                {routines.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
              <button onClick={() => removeSlot(i)} className="text-text-disabled hover:text-text-error transition-colors" aria-label="Remove">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          ))}
          <button onClick={addSlot} className="text-body-sm text-workout-prim font-semibold hover:text-workout-prim-500 transition-colors self-start">
            + Add Day
          </button>
        </div>
      )}

      {cycleType === 'week' && (
        <div className="flex flex-col gap-3">
          <p className="text-body-sm text-text-disabled">Assign routines to specific days of the week.</p>
          {WEEK_DAYS.map(day => (
            <div key={day} className="flex items-center gap-3">
              <span className="text-body-sm font-bold text-workout-prim w-10 shrink-0">{day}</span>
              <select
                value={weekMap[day] || ''}
                onChange={e => setWeekMap(m => ({ ...m, [day]: e.target.value || null }))}
                className="flex-1 rounded-md px-3 py-2 text-body-sm border border-border-primary focus:outline-none focus:border-workout-prim bg-surface-primary text-text-body"
              >
                <option value="">Rest</option>
                {routines.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button variant="workout-outline" size="md" onClick={onClose} className="flex-1">Cancel</Button>
        <Button variant="workout-primary" size="md" onClick={onClose} className="flex-1">Save Structure</Button>
      </div>
    </Modal>
  )
}

// ── Add routine modal ──────────────────────────────────────────────────────────
function AddRoutineModal({ open, onClose }) {
  const [name, setName] = useState('')
  return (
    <Modal open={open} onClose={onClose} title="New Routine" size="sm">
      <Field id="routine-name" name="name" label="Routine name" placeholder="e.g. Push, Pull, Legs..." value={name} onChange={e => setName(e.target.value)} />
      <div className="flex gap-3">
        <Button variant="workout-outline" size="md" onClick={onClose} className="flex-1">Cancel</Button>
        <Button variant="workout-primary" size="md" onClick={onClose} className="flex-1">Create</Button>
      </div>
    </Modal>
  )
}

// ── Routine detail slide-over ──────────────────────────────────────────────────
function RoutineSlideOver({ routine, onClose, onAddExercise }) {
  const [search, setSearch] = useState('')
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(false)
  const [showSearch, setShowSearch] = useState(false)

  useEffect(() => {
    if (!showSearch) return
    setLoading(true)
    getExercises({ search, pageSize: 30 })
      .then(data => setExercises(data.items))
      .catch(() => setExercises([]))
      .finally(() => setLoading(false))
  }, [search, showSearch])

  if (!routine) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-neutral-black opacity-40" onClick={onClose} />
      <div className="relative bg-surface-primary w-full max-w-sm h-full flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-primary">
          <h2 className="text-heading-h6 font-bold text-text-headings">{routine.name}</h2>
          <button onClick={onClose} className="text-text-disabled hover:text-text-headings transition-colors" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-3">
          <p className="text-body-sm text-text-disabled font-semibold uppercase tracking-widest">{routine.exercises.length} exercises</p>
          {routine.exercises.map((ex, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl border border-border-primary bg-workout-prim-100">
              <span className="text-body-md font-semibold text-text-headings">{ex}</span>
              <span className="text-body-sm text-workout-prim font-semibold">3 × 10</span>
            </div>
          ))}

          {/* Add exercise section */}
          {showSearch ? (
            <div className="flex flex-col gap-2 mt-2">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search exercises..."
                className="w-full rounded-md px-3 py-2 text-body-sm border border-border-primary focus:outline-none focus:border-workout-prim bg-surface-primary text-text-body"
                autoFocus
              />
              {loading && <p className="text-body-sm text-text-disabled">Loading...</p>}
              <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
                {exercises.map(ex => (
                  <button key={ex.id} onClick={() => { onAddExercise(routine.id, ex.title); setShowSearch(false); setSearch('') }}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-workout-prim-100 transition-colors text-left">
                    <div className="flex-1">
                      <p className="text-body-sm font-semibold text-text-headings">{ex.title}</p>
                      <p className="text-body-sm text-text-disabled">{ex.muscle_group} · {ex.equipment_category}</p>
                    </div>
                  </button>
                ))}
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

        <div className="px-6 py-4 border-t border-border-primary">
          <Button variant="workout-primary" size="md" fullWidth>Start This Routine</Button>
        </div>
      </div>
    </div>
  )
}

// ── Log workout modal ──────────────────────────────────────────────────────────
function LogWorkoutModal({ open, onClose, routine }) {
  const [sets, setSets] = useState(
    routine?.exercises.map(ex => ({ name: ex, reps: '', weight: '' })) || []
  )
  return (
    <Modal open={open} onClose={onClose} title={`Log: ${routine?.name || ''}`} size="lg">
      <p className="text-body-sm text-text-disabled">Enter the reps and weight for each exercise.</p>
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

// ── Main page ──────────────────────────────────────────────────────────────────
export default function WorkoutPlanPage() {
  const navigate = useNavigate()
  const [plan] = useState(MOCK_PLAN)
  const [routines, setRoutines] = useState(MOCK_ROUTINES)
  const [showStructure, setShowStructure] = useState(false)
  const [showAddRoutine, setShowAddRoutine] = useState(false)
  const [activeRoutine, setActiveRoutine] = useState(null)
  const [showLog, setShowLog] = useState(false)

  const todayRoutine = getTodayRoutine(plan, routines)

  function addExerciseToRoutine(routineId, exerciseName) {
    setRoutines(r => r.map(rt => rt.id === routineId
      ? { ...rt, exercises: [...rt.exercises, exerciseName] }
      : rt
    ))
  }
  const pct = Math.round((plan.progress / plan.progressMax) * 100)

  return (
    <div className="flex flex-col min-h-screen bg-surface-page">

      {/* ── Banner ── */}
      <div className="relative h-56 overflow-hidden">
        <img src={plan.image} alt={plan.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-black via-neutral-black/40 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-between p-6">
          <button onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1 text-body-sm text-neutral-white font-semibold self-start hover:opacity-80 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Dashboard
          </button>
          <div className="flex items-end justify-between">
            <div>
              <span className="bg-workout-prim-100 text-workout-prim text-body-sm font-bold px-2 py-0.5 rounded-round">Workout</span>
              <h1 className="text-heading-h4 font-bold text-neutral-white mt-1">{plan.name}</h1>
              <p className="text-body-sm text-neutral-200">{plan.startDate} → {plan.endDate} · {plan.level}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="workout-outline" size="sm" className="border-neutral-white text-neutral-white hover:bg-neutral-white/10">Edit</Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className="px-8 py-4 bg-surface-primary border-b border-border-primary flex items-center gap-4">
        <div className="flex-1 h-2 bg-neutral-100 rounded-round overflow-hidden">
          <div className="h-full bg-workout-prim rounded-round transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-body-sm font-semibold text-text-headings shrink-0">{plan.progress}/{plan.progressMax} sessions</span>
      </div>

      {/* ── Main content ── */}
      <div className="flex flex-col lg:flex-row gap-6 px-8 py-6 flex-1">

        {/* Left: Plan structure */}
        <div className="lg:w-72 shrink-0 flex flex-col gap-4">
          <div className="bg-surface-primary rounded-xl border border-border-primary p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-body-lg font-bold text-text-headings">Plan Structure</h2>
              <button onClick={() => setShowStructure(true)}
                className="text-body-sm text-workout-prim font-semibold hover:text-workout-prim-500 transition-colors">
                Edit
              </button>
            </div>
            <p className="text-body-sm text-text-disabled">
              {plan.cycleType === 'nday' ? `${plan.cycleDays}-day cycle` : 'Week-bound'}
            </p>

            {plan.cycleType === 'nday' ? (
              <div className="flex flex-col gap-2">
                {plan.structure.map((slot, i) => (
                  <div key={i} className={cn('flex items-center gap-3 px-3 py-2 rounded-lg',
                    slot.routineId ? 'bg-workout-prim-100' : 'bg-neutral-100'
                  )}>
                    <span className="text-body-sm font-bold text-workout-prim w-12 shrink-0">Day {slot.slot}</span>
                    <span className={cn('text-body-sm font-semibold', slot.routineId ? 'text-text-headings' : 'text-text-disabled')}>
                      {slot.label}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {WEEK_DAYS.map(day => {
                  const routineId = plan.weekStructure[day]
                  const routine = routineId ? routines.find(r => r.id === routineId) : null
                  return (
                    <div key={day} className={cn('flex items-center gap-3 px-3 py-2 rounded-lg',
                      routine ? 'bg-workout-prim-100' : 'bg-neutral-100'
                    )}>
                      <span className="text-body-sm font-bold text-workout-prim w-10 shrink-0">{day}</span>
                      <span className={cn('text-body-sm font-semibold', routine ? 'text-text-headings' : 'text-text-disabled')}>
                        {routine ? routine.name : 'Rest'}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Today's workout */}
          <div className="bg-workout-prim rounded-xl p-5 flex flex-col gap-3">
            <p className="text-body-sm text-workout-prim-100 font-semibold uppercase tracking-widest">Today</p>
            {todayRoutine ? (
              <>
                <h3 className="text-body-lg font-bold text-neutral-white">{todayRoutine.name}</h3>
                <p className="text-body-sm text-workout-prim-100">{todayRoutine.exercises.length} exercises</p>
                <Button variant="workout-outline" size="sm"
                  className="border-neutral-white text-neutral-white hover:bg-neutral-white/10"
                  onClick={() => setShowLog(true)}>
                  Log Workout
                </Button>
              </>
            ) : (
              <p className="text-body-md font-semibold text-neutral-white">Rest Day 🎉</p>
            )}
          </div>
        </div>

        {/* Right: Routines */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-body-lg font-bold text-text-headings">Routines</h2>
            <Button variant="workout-primary" size="sm" onClick={() => setShowAddRoutine(true)}>
              + Add Routine
            </Button>
          </div>

          <div className="flex flex-col gap-3">
            {routines.map(routine => (
              <div key={routine.id}
                className="bg-surface-primary rounded-xl border border-border-primary px-5 py-4 flex items-center justify-between hover:border-workout-prim transition-colors">
                <div className="flex flex-col gap-1">
                  <span className="text-body-md font-bold text-text-headings">{routine.name}</span>
                  <span className="text-body-sm text-text-disabled">{routine.exercises.length} exercises</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="workout-outline" size="sm" onClick={() => setActiveRoutine(routine)}>
                    View
                  </Button>
                  <Button variant="workout-primary" size="sm" onClick={() => { setActiveRoutine(routine); setShowLog(true) }}>
                    Log
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      <StructureModal open={showStructure} onClose={() => setShowStructure(false)} plan={plan} routines={routines} />
      <AddRoutineModal open={showAddRoutine} onClose={() => setShowAddRoutine(false)} />
      <RoutineSlideOver routine={activeRoutine && !showLog ? activeRoutine : null} onClose={() => setActiveRoutine(null)} onAddExercise={addExerciseToRoutine} />
      <LogWorkoutModal open={showLog} onClose={() => { setShowLog(false) }} routine={activeRoutine || todayRoutine} />
    </div>
  )
}
