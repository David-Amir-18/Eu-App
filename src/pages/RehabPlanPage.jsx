import { useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { cn } from '../components/utils.js'
import { Button } from '../components/atoms/Button.jsx'
import { Field } from '../components/atoms/Field.jsx'

// ── Mock data generators ────────────────────────────────────────────────────────

const getMockPlan = (id) => {
  if (id === 'acl-injury') {
    return {
      id: 'acl-injury',
      name: 'ACL Recovery Protocol',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80',
      level: 'Phase 1',
      cycleType: 'week', // 'week' | 'nday'
      cycleDays: 7,
      structure: [],
      weekStructure: {
        Mon: 'mobility', Tue: 'strength', Wed: 'mobility', Thu: 'strength', Fri: 'balance', Sat: 'mobility', Sun: null,
      },
      progress: 5,
      progressMax: 30,
      startDate: 'Jan 01, 2026',
      endDate: 'Feb 15, 2026',
    }
  }

  // Generic fallback
  return {
    id: id || 'general-rehab',
    name: 'General Physical Therapy',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80',
    level: 'Beginner',
    cycleType: 'week',
    cycleDays: 7,
    structure: [],
    weekStructure: {
      Mon: 'mobility', Tue: null, Wed: 'strength', Thu: null, Fri: 'mobility', Sat: null, Sun: null,
    },
    progress: 2,
    progressMax: 15,
    startDate: 'Jan 01, 2026',
    endDate: 'Feb 15, 2026',
  }
}

const getMockRoutines = (id) => {
  if (id === 'acl-injury') {
    return [
      { id: 'mobility', name: 'Range of Motion', exercises: ['Heel Slides', 'Quad Sets', 'Ankle Pumps', 'Prone Hangs'] },
      { id: 'strength', name: 'Strengthening', exercises: ['Straight Leg Raises', 'Mini Squats', 'Calf Raises', 'Hamstring Curls'] },
      { id: 'balance', name: 'Balance & Proprioception', exercises: ['Single Leg Stand', 'Weight Shifts', 'Wobble Board'] },
    ]
  }

  return [
    { id: 'mobility', name: 'Mobility & Stretching', exercises: ['Gentle Stretches', 'Foam Rolling'] },
    { id: 'strength', name: 'Light Strengthening', exercises: ['Resistance Band Work', 'Isometrics'] },
  ]
}

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
              cycleType === t ? 'bg-rehab-prim text-neutral-white border-transparent' : 'border-border-primary text-text-body hover:border-rehab-prim'
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
              <span className="text-body-sm font-bold text-rehab-prim w-12 shrink-0">Day {slot.slot}</span>
              <select
                value={slot.routineId || ''}
                onChange={e => setSlotRoutine(i, e.target.value)}
                className="flex-1 rounded-md px-3 py-2 text-body-sm border border-border-primary focus:outline-none focus:border-rehab-prim bg-surface-primary text-text-body"
              >
                <option value="">Rest</option>
                {routines.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
              <button onClick={() => removeSlot(i)} className="text-text-disabled hover:text-text-error transition-colors" aria-label="Remove">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          ))}
          <button onClick={addSlot} className="text-body-sm text-rehab-prim font-semibold hover:text-rehab-prim-500 transition-colors self-start">
            + Add Day
          </button>
        </div>
      )}

      {cycleType === 'week' && (
        <div className="flex flex-col gap-3">
          <p className="text-body-sm text-text-disabled">Assign therapy sessions to specific days of the week.</p>
          {WEEK_DAYS.map(day => (
            <div key={day} className="flex items-center gap-3">
              <span className="text-body-sm font-bold text-rehab-prim w-10 shrink-0">{day}</span>
              <select
                value={weekMap[day] || ''}
                onChange={e => setWeekMap(m => ({ ...m, [day]: e.target.value || null }))}
                className="flex-1 rounded-md px-3 py-2 text-body-sm border border-border-primary focus:outline-none focus:border-rehab-prim bg-surface-primary text-text-body"
              >
                <option value="">Rest</option>
                {routines.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button variant="rehab-outline" size="md" onClick={onClose} className="flex-1">Cancel</Button>
        <Button variant="rehab-primary" size="md" onClick={onClose} className="flex-1">Save Structure</Button>
      </div>
    </Modal>
  )
}

// ── Add routine modal ──────────────────────────────────────────────────────────
function AddRoutineModal({ open, onClose }) {
  const [name, setName] = useState('')
  return (
    <Modal open={open} onClose={onClose} title="New Rehab Module" size="sm">
      <Field id="module-name" name="name" label="Module name" placeholder="e.g. Mobility, Strengthening..." value={name} onChange={e => setName(e.target.value)} />
      <div className="flex gap-3">
        <Button variant="rehab-outline" size="md" onClick={onClose} className="flex-1">Cancel</Button>
        <Button variant="rehab-primary" size="md" onClick={onClose} className="flex-1">Create</Button>
      </div>
    </Modal>
  )
}

// ── Routine detail slide-over ──────────────────────────────────────────────────
function RoutineSlideOver({ routine, onClose }) {
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
            <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl border border-border-primary bg-rehab-prim-100">
              <span className="text-body-md font-semibold text-text-headings">{ex}</span>
              <span className="text-body-sm text-rehab-prim font-semibold">3 × 10</span>
            </div>
          ))}
          <button className="text-body-sm text-rehab-prim font-semibold hover:text-rehab-prim-500 transition-colors self-start mt-2">
            + Add Exercise
          </button>
        </div>
        <div className="px-6 py-4 border-t border-border-primary">
          <Button variant="rehab-primary" size="md" fullWidth>Start Session</Button>
        </div>
      </div>
    </div>
  )
}

// ── Log workout modal ──────────────────────────────────────────────────────────
function LogWorkoutModal({ open, onClose, routine }) {
  const [sets, setSets] = useState(
    routine?.exercises.map(ex => ({ name: ex, reps: '', painLevel: '' })) || []
  )
  return (
    <Modal open={open} onClose={onClose} title={`Log: ${routine?.name || ''}`} size="lg">
      <p className="text-body-sm text-text-disabled">Enter the reps and rate your pain level (0-10) for each exercise.</p>
      {sets.map((s, i) => (
        <div key={i} className="flex flex-col gap-2">
          <span className="text-body-sm font-semibold text-text-headings">{s.name}</span>
          <div className="flex gap-3">
            <Field id={`reps-${i}`} name="reps" placeholder="Reps" type="number" value={s.reps}
              onChange={e => setSets(prev => prev.map((p, idx) => idx === i ? { ...p, reps: e.target.value } : p))}
              className="flex-1" />
            <Field id={`pain-${i}`} name="painLevel" placeholder="Pain (0-10)" type="number" min="0" max="10" value={s.painLevel}
              onChange={e => setSets(prev => prev.map((p, idx) => idx === i ? { ...p, painLevel: e.target.value } : p))}
              className="flex-1" />
          </div>
        </div>
      ))}
      <div className="flex gap-3 pt-2">
        <Button variant="rehab-outline" size="md" onClick={onClose} className="flex-1">Cancel</Button>
        <Button variant="rehab-primary" size="md" onClick={onClose} className="flex-1">Save Log</Button>
      </div>
    </Modal>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function RehabPlanPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  
  // Initialize mock data based on route param
  const plan = useMemo(() => getMockPlan(id), [id])
  const routines = useMemo(() => getMockRoutines(id), [id])

  const [showStructure, setShowStructure] = useState(false)
  const [showAddRoutine, setShowAddRoutine] = useState(false)
  const [activeRoutine, setActiveRoutine] = useState(null)
  const [showLog, setShowLog] = useState(false)

  const todayRoutine = getTodayRoutine(plan, routines)
  const pct = Math.round((plan.progress / plan.progressMax) * 100)

  return (
    <div className="flex flex-col min-h-screen bg-surface-page animate-fade-in">

      {/* ── Banner ── */}
      <div className="relative h-56 shrink-0 overflow-hidden">
        <img src={plan.image} alt={plan.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-black via-neutral-black/40 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-between p-6">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-body-sm text-neutral-white font-semibold self-start hover:opacity-80 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Back
          </button>
          <div className="flex items-end justify-between">
            <div>
              <span className="bg-rehab-prim-100 text-rehab-prim text-body-sm font-bold px-2 py-0.5 rounded-round">Rehab Protocol</span>
              <h1 className="text-heading-h4 font-bold text-neutral-white mt-1">{plan.name}</h1>
              <p className="text-body-sm text-neutral-200">{plan.startDate} → {plan.endDate} · {plan.level}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="rehab-outline" size="sm" className="border-neutral-white text-neutral-white hover:bg-neutral-white/10">Edit Protocol</Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className="px-8 py-4 bg-surface-primary border-b border-border-primary flex items-center gap-4">
        <div className="flex-1 h-2 bg-neutral-100 rounded-round overflow-hidden">
          <div className="h-full bg-rehab-prim rounded-round transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-body-sm font-semibold text-text-headings shrink-0">{plan.progress}/{plan.progressMax} sessions</span>
      </div>

      {/* ── Main content ── */}
      <div className="flex flex-col lg:flex-row gap-6 px-8 py-6 flex-1">

        {/* Left: Plan structure */}
        <div className="lg:w-72 shrink-0 flex flex-col gap-4">
          <div className="bg-surface-primary rounded-xl border border-border-primary p-5 flex flex-col gap-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-body-lg font-bold text-text-headings">Protocol Schedule</h2>
              <button onClick={() => setShowStructure(true)}
                className="text-body-sm text-rehab-prim font-semibold hover:text-rehab-prim-500 transition-colors">
                Edit
              </button>
            </div>
            <p className="text-body-sm text-text-disabled">
              {plan.cycleType === 'nday' ? `${plan.cycleDays}-day cycle` : 'Week-bound schedule'}
            </p>

            {plan.cycleType === 'nday' ? (
              <div className="flex flex-col gap-2">
                {plan.structure.map((slot, i) => (
                  <div key={i} className={cn('flex items-center gap-3 px-3 py-2 rounded-lg',
                    slot.routineId ? 'bg-rehab-prim-100' : 'bg-neutral-100'
                  )}>
                    <span className="text-body-sm font-bold text-rehab-prim w-12 shrink-0">Day {slot.slot}</span>
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
                      routine ? 'bg-rehab-prim-100' : 'bg-neutral-100'
                    )}>
                      <span className="text-body-sm font-bold text-rehab-prim w-10 shrink-0">{day}</span>
                      <span className={cn('text-body-sm font-semibold', routine ? 'text-text-headings' : 'text-text-disabled')}>
                        {routine ? routine.name : 'Rest'}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Today's session */}
          <div className="bg-gradient-to-br from-rehab-prim to-rehab-prim-600 rounded-xl p-5 flex flex-col gap-3 shadow-sm">
            <p className="text-body-sm text-rehab-prim-100 font-semibold uppercase tracking-widest">Today</p>
            {todayRoutine ? (
              <>
                <h3 className="text-body-lg font-bold text-neutral-white">{todayRoutine.name}</h3>
                <p className="text-body-sm text-rehab-prim-100">{todayRoutine.exercises.length} exercises</p>
                <Button variant="rehab-outline" size="sm"
                  className="border-neutral-white text-neutral-white hover:bg-neutral-white/10 mt-2"
                  onClick={() => setShowLog(true)}>
                  Log Session
                </Button>
              </>
            ) : (
              <p className="text-body-md font-semibold text-neutral-white">Rest & Recovery 🎉</p>
            )}
          </div>
        </div>

        {/* Right: Modules */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-body-lg font-bold text-text-headings">Therapy Modules</h2>
            <Button variant="rehab-primary" size="sm" onClick={() => setShowAddRoutine(true)}>
              + Add Module
            </Button>
          </div>

          <div className="flex flex-col gap-3">
            {routines.map(routine => (
              <div key={routine.id}
                className="bg-surface-primary rounded-xl border border-border-primary px-5 py-4 flex items-center justify-between hover:border-rehab-prim transition-colors shadow-sm">
                <div className="flex flex-col gap-1">
                  <span className="text-body-md font-bold text-text-headings">{routine.name}</span>
                  <span className="text-body-sm text-text-disabled">{routine.exercises.length} exercises</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="rehab-outline" size="sm" onClick={() => setActiveRoutine(routine)}>
                    Preview
                  </Button>
                  <Button variant="rehab-primary" size="sm" onClick={() => { setActiveRoutine(routine); setShowLog(true) }}>
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
      <RoutineSlideOver routine={activeRoutine && !showLog ? activeRoutine : null} onClose={() => setActiveRoutine(null)} />
      <LogWorkoutModal open={showLog} onClose={() => { setShowLog(false) }} routine={activeRoutine || todayRoutine} />
    </div>
  )
}
