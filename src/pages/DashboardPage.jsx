import { useState, useMemo, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '../components/atoms/Button.jsx'
import { cn } from '../components/utils.js'
import { getUserMetrics } from '../api/authService.js'
import { getWorkoutPlan } from '../api/workoutsService.js'
import { getMealPlan } from '../api/mealPlansService.js'
import { Menu } from '../components/molecules/Menu.jsx'
import { getWorkoutSessions, createWorkoutSession, logWorkoutSet } from '../api/workoutTrackingService.js'
import { getEatenMeals, createMealSchedule, updateMealEatenStatus } from '../api/mealTrackingService.js'
import { getDailyLog, upsertDailyLog, listDailyLogs } from '../api/dailyLogsService.js'
import { useAuth } from '../context/AuthContext.jsx'
import { getRehabPlan } from '../api/rehabService.js'
import {
  getActiveWorkoutEnrollment,
  getActiveMealEnrollment,
  getActiveRehabEnrollment,
} from '../api/enrollmentService.js'
import { getRehabHistory, getRehabStreaks } from '../api/rehabTrackingService.js'
import { getNutritionStats } from '../api/nutritionService.js'

// Removed Static Mock Constants (replaced by live backend data aggregators)

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'
  return 'Good Evening'
}


// ── Segmented Control ──────────────────────────────────────────────────────────
function SegmentedControl({ options, selected, onChange }) {
  return (
    <div className="flex bg-neutral-100 p-1 rounded-lg border border-border-primary shrink-0">
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={cn(
            "px-3 py-1 text-[11px] font-semibold rounded-md transition-colors",
            selected === opt 
              ? "bg-surface-primary text-text-headings shadow-sm" 
              : "text-text-disabled hover:text-text-body"
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

// ── Bar Chart ──────────────────────────────────────────────────────────────────
function BarChart({ title, data, labels, total, totalLabel, actions }) {
  let max = Math.max(...data, 1)
  if (max > 10) {
    const magnitude = Math.pow(10, Math.floor(Math.log10(max)))
    max = Math.ceil(max / magnitude) * magnitude
  } else {
    max = Math.max(max, 4)
  }
  max = Math.ceil(max * 1.1)

  return (
    <div className="bg-surface-page rounded-xl p-6 border border-border-primary shadow-sm flex flex-col h-[360px]">
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h3 className="text-heading-h6 font-bold text-text-headings">{title}</h3>
          {total !== undefined && (
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-heading-h3 font-bold text-text-headings">
                {total.toLocaleString()}
              </span>
              {totalLabel && <span className="text-body-sm text-text-disabled">{totalLabel}</span>}
            </div>
          )}
        </div>
        {actions && <div className="flex flex-col md:flex-row gap-2 items-end md:items-center">{actions}</div>}
      </div>
      <div className="relative flex-1 flex w-full ml-8">
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none z-0">
          {[...Array(5)].map((_, i) => {
            const val = Math.round(max - (max / 4) * i)
            return (
              <div key={i} className="flex items-center w-full relative">
                <span className="text-[10px] text-text-disabled w-8 text-right absolute -translate-y-1/2 -left-10 truncate pr-1">
                  {val >= 1000 ? `${(val/1000).toFixed(1)}k` : val}
                </span>
                <div className="w-full border-t border-neutral-100" />
              </div>
            )
          })}
        </div>
        
        <div className="flex-1 flex justify-between items-end px-2 z-10 pt-2">
          {data.map((val, i) => (
            <div key={i} className="flex flex-col items-center gap-3 flex-1 group h-full justify-end">
              <div 
                className="w-full max-w-[2rem] bg-neutral-200 rounded-md transition-all duration-1000 ease-out origin-bottom group-hover:bg-surface-action"
                style={{ height: `${(val / max) * 100}%` }} 
                title={`${val}`} 
              />
              <span className="text-[10px] md:text-[11px] text-text-disabled font-medium truncate w-full text-center">{labels[i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, unit, emoji }) {
  return (
    <div className="bg-surface-primary rounded-xl border border-border-primary p-5 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow">
      {emoji && <span className="text-2xl leading-none">{emoji}</span>}
      <p className="text-[10px] font-bold uppercase tracking-widest text-text-disabled mt-1">{label}</p>
      <div className="flex items-baseline gap-1.5 mt-auto">
        <span className="text-heading-h3 font-bold text-text-headings">{value ?? '—'}</span>
        {unit && <span className="text-body-sm text-text-disabled">{unit}</span>}
      </div>
    </div>
  )
}

// ── Macro Breakdown Card ──────────────────────────────────────────────────────
function MacroBreakdownCard({ stats }) {
  const protein = stats.total_protein_g || 0
  const carbs   = stats.total_carbohydrates_g || 0
  const fat     = stats.total_fat_g || 0
  const fiber   = stats.total_fiber_g || 0
  const total   = protein + carbs + fat
  const bars = [
    { label: 'Protein',       value: Math.round(protein), color: '#10B981', pct: total > 0 ? (protein / total) * 100 : 0 },
    { label: 'Carbohydrates', value: Math.round(carbs),   color: '#F59E0B', pct: total > 0 ? (carbs   / total) * 100 : 0 },
    { label: 'Fats',          value: Math.round(fat),     color: '#EF4444', pct: total > 0 ? (fat     / total) * 100 : 0 },
    { label: 'Fiber',         value: Math.round(fiber),   color: '#6366F1', pct: total > 0 ? (fiber   / total) * 100 : 0 },
  ]
  return (
    <div className="bg-surface-page rounded-xl p-6 border border-border-primary shadow-sm">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-heading-h6 font-bold text-text-headings">Nutrition Breakdown</h3>
          <p className="text-body-sm text-text-disabled mt-0.5">{stats.meal_count || 0} meals tracked</p>
        </div>
        <div className="text-right">
          <p className="text-heading-h4 font-bold text-text-headings">{Math.round(stats.total_calories_cal || 0).toLocaleString()}</p>
          <p className="text-body-xs text-text-disabled">total kcal</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {bars.map(b => (
          <div key={b.label} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-body-sm font-semibold text-text-headings">{b.label}</span>
              <span className="text-body-xs text-text-disabled">{b.value}g · {Math.round(b.pct)}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-neutral-100 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${b.pct}%`, backgroundColor: b.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Exercise Completion Donut ─────────────────────────────────────────────────
function ExerciseCompletionCard({ sessions }) {
  const totalEx = sessions.reduce((s, r) => s + (r.total_exercises || 0), 0)
  const doneEx  = sessions.reduce((s, r) => s + (r.exercises_completed || 0), 0)
  const pct     = totalEx > 0 ? Math.round((doneEx / totalEx) * 100) : 0
  const painSessions = sessions.filter(s => s.pain_level)
  const avgPain = painSessions.length > 0
    ? (painSessions.reduce((s, r) => s + r.pain_level, 0) / painSessions.length).toFixed(1)
    : null
  const radius = 54, circ = 2 * Math.PI * radius, dash = (pct / 100) * circ
  return (
    <div className="bg-surface-page rounded-xl p-6 border border-border-primary shadow-sm flex flex-col h-[360px]">
      <h3 className="text-heading-h6 font-bold text-text-headings mb-1">Exercise Completion</h3>
      <p className="text-body-sm text-text-disabled mb-6">Across all completed rehab sessions</p>
      <div className="flex-1 flex items-center justify-center gap-10">
        <div className="relative shrink-0">
          <svg width="140" height="140" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r={radius} fill="none" stroke="#F3F4F6" strokeWidth="14" />
            <circle cx="70" cy="70" r={radius} fill="none" stroke="#8B5CF6" strokeWidth="14"
              strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={circ * 0.25}
              strokeLinecap="round" style={{ transition: 'stroke-dasharray 1.2s ease-out' }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-heading-h4 font-bold text-text-headings">{pct}%</span>
            <span className="text-body-xs text-text-disabled">done</span>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-body-xs text-text-disabled font-bold uppercase tracking-widest">Exercises</p>
            <p className="text-heading-h5 font-bold text-text-headings">{doneEx}
              <span className="text-body-sm text-text-disabled font-normal"> / {totalEx}</span></p>
          </div>
          <div>
            <p className="text-body-xs text-text-disabled font-bold uppercase tracking-widest">Sessions</p>
            <p className="text-heading-h5 font-bold text-text-headings">{sessions.length}</p>
          </div>
          {avgPain !== null && (
            <div>
              <p className="text-body-xs text-text-disabled font-bold uppercase tracking-widest">Avg Pain</p>
              <p className="text-heading-h5 font-bold text-text-headings">{avgPain}
                <span className="text-body-sm text-text-disabled font-normal"> / 10</span></p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Meal Type Donut ─────────────────────────────────────────────────────
function MealTypeDonut({ eatenMeals }) {
  const TYPES = [
    { key: 'breakfast', label: 'Breakfast', emoji: '🌅', color: '#F59E0B' },
    { key: 'lunch',     label: 'Lunch',     emoji: '☀️',    color: '#10B981' },
    { key: 'dinner',   label: 'Dinner',    emoji: '🌙',   color: '#6366F1' },
    { key: 'snack',    label: 'Snack',     emoji: '🍎',   color: '#F43F5E' },
  ]
  const counts = {}
  TYPES.forEach(t => { counts[t.key] = eatenMeals.filter(m => m.meal_type === t.key).length })
  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  const radius = 54, circ = 2 * Math.PI * radius
  let offset = circ * 0.25
  const arcs = TYPES.map(t => {
    const dash = total > 0 ? (counts[t.key] / total) * circ : 0
    const arc = { ...t, count: counts[t.key], dash, gap: circ - dash, offset }
    offset -= dash
    return arc
  })
  return (
    <div className="bg-surface-page rounded-xl p-6 border border-border-primary shadow-sm flex flex-col h-[360px]">
      <h3 className="text-heading-h6 font-bold text-text-headings mb-1">Meals by Type</h3>
      <p className="text-body-sm text-text-disabled mb-6">{total} total meals eaten</p>
      <div className="flex-1 flex items-center justify-center gap-8">
        <div className="relative shrink-0">
          <svg width="140" height="140" viewBox="0 0 140 140">
            {total === 0
              ? <circle cx="70" cy="70" r={radius} fill="none" stroke="#F3F4F6" strokeWidth="14" />
              : arcs.map((arc, i) => (
                <circle key={i} cx="70" cy="70" r={radius} fill="none"
                  stroke={arc.color} strokeWidth="14"
                  strokeDasharray={`${arc.dash} ${arc.gap}`}
                  strokeDashoffset={arc.offset}
                  strokeLinecap="butt" />
              ))
            }
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-heading-h4 font-bold text-text-headings">{total}</span>
            <span className="text-body-xs text-text-disabled">meals</span>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {TYPES.map(t => {
            const pct = total > 0 ? Math.round((counts[t.key] / total) * 100) : 0
            return (
              <div key={t.key} className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                <div>
                  <p className="text-body-xs font-semibold text-text-headings">{t.emoji} {t.label}</p>
                  <p className="text-body-xs text-text-disabled">{counts[t.key]} · {pct}%</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  
  const [workoutPlan, setWorkoutPlan] = useState(null)
  const [dietPlan, setDietPlan] = useState(null)
  const [rehabPlan, setRehabPlan] = useState(null)
  const [plansLoading, setPlansLoading] = useState(true)

  // Live tracking server records
  const [workoutSessions, setWorkoutSessions] = useState([])
  const [eatenMeals, setEatenMeals] = useState([])
  const [hasWorkoutHistory, setHasWorkoutHistory] = useState(false)
  const [hasMealHistory, setHasMealHistory] = useState(false)

  // Daily Wellbeing Log States
  const [recoveryNotes, setRecoveryNotes] = useState('')
  const [isSavingLog, setIsSavingLog] = useState(false)
  const [journalToast, setJournalToast] = useState('')
  const [recentLogs, setRecentLogs] = useState([])

  // Chart states
  const [workoutTime, setWorkoutTime] = useState('Week')
  const [mealTime, setMealTime] = useState('Week')
  const [mealMetric, setMealMetric] = useState('Meals')
  const [rehabTime, setRehabTime]           = useState('Month')

  // Analytics data
  const [rehabSessions, setRehabSessions]   = useState([])
  const [rehabStreaks, setRehabStreaks]     = useState(null)
  const [nutritionStats, setNutritionStats] = useState(null)

  const { user } = useAuth()
  const userId = user?.id
  const username = user?.name || user?.email?.split('@')[0] || 'there'

  // Helper: local YYYY-MM-DD (respects user's timezone, not UTC)
  function localDateStr(d = new Date()) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  useEffect(() => {
    async function fetchAll() {
      if (!userId) { 
          setProfileLoading(false)
          setPlansLoading(false)
          return 
      }
      try {
        const metrics = await getUserMetrics()
        setProfile(metrics)
      } catch (err) {
        setProfile(null)
      } finally {
        setProfileLoading(false)
      }

      // ── Workout plan: use active enrollment as source of truth
      try {
        const wEnrollment = await getActiveWorkoutEnrollment()
        if (wEnrollment?.workout_plan_id) {
          setHasWorkoutHistory(true)
          const fullWPlan = await getWorkoutPlan(wEnrollment.workout_plan_id)
          setWorkoutPlan(fullWPlan)
        } else {
          setHasWorkoutHistory(false)
        }
      } catch (e) {
        // 404 = no active workout enrollment
        setHasWorkoutHistory(false)
      }

      // ── Meal plan: use active enrollment as source of truth
      try {
        const mEnrollment = await getActiveMealEnrollment()
        if (mEnrollment?.meal_plan_id) {
          setHasMealHistory(true)
          const fullPlan = await getMealPlan(mEnrollment.meal_plan_id)
          const SLOT_TIMES = {
            breakfast: '7:00 AM', lunch: '12:30 PM', dinner: '7:00 PM', snack: '3:00 PM',
          }
          const normalised = fullPlan.slot_meals.map(sm => ({
            id:             sm.id,
            meal_type:      sm.meal_type,
            label:          sm.meal_type.charAt(0).toUpperCase() + sm.meal_type.slice(1),
            time:           SLOT_TIMES[sm.meal_type] || '',
            meals: sm.meal ? [{
              id:        sm.meal.id,
              name:      sm.meal.title,
              title:     sm.meal.title,
              calories:  sm.meal.nutrition?.calories_cal || 0,
              protein:   sm.meal.nutrition?.protein_g || 0,
              image_url: sm.meal.image_url,
              image:     sm.meal.image_url,
            }] : [],
            selectedMealId: sm.meal?.id ?? null,
            taken:          false,
            scheduleId:     null,
          }))
          // Hydrate today's eaten state
          try {
            const todayEatenRes = await getEatenMeals({ date: localDateStr() })
            const todayEaten = todayEatenRes.results || []
            todayEaten.forEach(m => {
              const slot = normalised.find(s => s.meal_type === m.meal_type)
              if (slot) { slot.taken = true; slot.scheduleId = m.id }
            })
          } catch (_) {}
          setDietPlan({ ...fullPlan, slots: normalised })
        } else {
          setHasMealHistory(false)
        }
      } catch (e) {
        // 404 = no active meal enrollment
        setHasMealHistory(false)
      }

      // ── Rehab plan: use active enrollment as source of truth
      try {
        const rEnrollment = await getActiveRehabEnrollment()
        if (rEnrollment?.rehab_plan_id) {
          const fullRPlan = await getRehabPlan(rEnrollment.rehab_plan_id)
          setRehabPlan(fullRPlan)
        }
      } catch (e) {
        // 404 = no active rehab enrollment, fine
      } finally {
        setPlansLoading(false)
      }

      // Fetch live telemetry summaries from current calendar year
      const fromDate = `${new Date().getFullYear()}-01-01`

      try {
        const sessions = await getWorkoutSessions({ status: 'completed', from_date: fromDate })
        setWorkoutSessions(sessions.results || [])
      } catch (err) {
        console.error('Telemetry failed for workouts', err)
      }

      try {
        const meals = await getEatenMeals({ from_date: fromDate })
        setEatenMeals(meals.results || [])
      } catch (err) {
        console.error('Telemetry failed for meals', err)
      }

      // Load today's existing daily recovery journal
      try {
        const todayStr = localDateStr()
        const log = await getDailyLog(todayStr)
        if (log) {
          setRecoveryNotes(log.recovery_notes || '')
        }
      } catch (err) {
        console.error('Failed to load daily log', err)
      }

      // Load recent historical daily logs
      try {
        const logs = await listDailyLogs()
        setRecentLogs(logs.results || [])
      } catch (err) {
        console.error('Failed to load historical logs', err)
      }

      // Load rehab analytics
      try { const s = await getRehabStreaks(); setRehabStreaks(s) } catch (_) {}
      try { const h = await getRehabHistory(); setRehabSessions(h.results || []) } catch (_) {}
      try { const n = await getNutritionStats(); setNutritionStats(n) } catch (_) {}
    }
    fetchAll()
  }, [userId])


  // Handle committing user recovery notes + auto aggregates to server
  const handleSaveDailyLog = async () => {
    try {
      setIsSavingLog(true)
      const todayStr = localDateStr()
      
      const payload = {
        date: todayStr,
        calories_consumed: Math.round(todayCalories),
        workouts_completed: todayWorkoutsDone,
        recovery_notes: recoveryNotes
      }
      
      await upsertDailyLog(payload)
      
      // Instant refresh history locally so timeline updates live!
      try {
        const logs = await listDailyLogs()
        setRecentLogs(logs.results || [])
      } catch (e) {}
      
      setJournalToast('Daily Log saved successfully!')
      setTimeout(() => setJournalToast(''), 3000)
    } catch (err) {
      console.error('Failed to save daily journal', err)
    } finally {
      setIsSavingLog(false)
    }
  }

  const [dashboardSessionId, setDashboardSessionId] = useState(null)

  const toggleExercise = async (routineId, idx) => {
    if (!workoutPlan) return
    const rIdx = workoutPlan.plan_routines.findIndex(r => r.id === routineId)
    if (rIdx === -1) return
    const ex = workoutPlan.plan_routines[rIdx].exercises[idx]
    const current = ex.is_completed || ex.taken || false
    const next = !current

    // Optimistic update
    const updatedPlan = JSON.parse(JSON.stringify(workoutPlan))
    updatedPlan.plan_routines[rIdx].exercises[idx] = { ...ex, is_completed: next, taken: next }
    setWorkoutPlan(updatedPlan)

    if (next) {
      try {
        let sessionId = dashboardSessionId
        if (!sessionId) {
          const session = await createWorkoutSession({
            workout_plan_id: workoutPlan.id,
            routine_id:      routineId,
            scheduled_date:  localDateStr(),
            status:          'in_progress',
          })
          sessionId = session.id
          setDashboardSessionId(sessionId)
          setWorkoutSessions(prev => [session, ...prev])
        }
        const exId = ex.exercise_id || ex.exercise?.id
        if (exId && sessionId) {
          await logWorkoutSet(sessionId, {
            exercise_id:    exId,
            set_number:     1,
            reps_completed: ex.reps   ? parseInt(ex.reps)   : undefined,
            weight_used:    ex.weight_kg ? parseFloat(ex.weight_kg) : undefined,
            is_completed:   true,
          })
          window.dispatchEvent(new CustomEvent('sidebarStatsRefresh'))
        }
      } catch (err) {
        console.error('Failed to log exercise to backend', err)
        // Rollback
        const rb = JSON.parse(JSON.stringify(workoutPlan))
        rb.plan_routines[rIdx].exercises[idx] = { ...ex, is_completed: false, taken: false }
        setWorkoutPlan(rb)
      }
    }
  }

  const toggleMeal = async (slotId) => {
    if (!dietPlan) return
    const slot = dietPlan.slots.find(s => s.id === slotId)
    if (!slot) return
    const wasTaken = slot.taken

    // Optimistic update
    setDietPlan(prev => ({
      ...prev,
      slots: prev.slots.map(sl => sl.id === slotId ? { ...sl, taken: !wasTaken } : sl)
    }))

    try {
      const today = localDateStr()
      if (!wasTaken) {
        // Mark eaten → create schedule record
        const mealId = slot.selectedMealId || slot.meals?.[0]?.id
        const schedule = await createMealSchedule({
          meal_id:         mealId,
          meal_plan_id:    dietPlan.id,
          meal_type:       slot.meal_type || slot.label.toLowerCase(),
          scheduled_date:  today,
          is_eaten:        true,
          eaten_date:      today,
        })
        setDietPlan(prev => ({
          ...prev,
          slots: prev.slots.map(sl =>
            sl.id === slotId ? { ...sl, taken: true, scheduleId: schedule.id } : sl
          )
        }))
        // Update analytics
        setEatenMeals(prev => [...prev, {
          ...schedule,
          meal_type: slot.meal_type || slot.label.toLowerCase(),
          scheduled_date: today,
        }])
        window.dispatchEvent(new CustomEvent('sidebarStatsRefresh'))
      } else {
        // Untoggle → unmark eaten
        if (slot.scheduleId) {
          await updateMealEatenStatus(slot.scheduleId, false)
          setEatenMeals(prev => prev.filter(m => m.id !== slot.scheduleId))
          window.dispatchEvent(new CustomEvent('sidebarStatsRefresh'))
        }
        setDietPlan(prev => ({
          ...prev,
          slots: prev.slots.map(sl =>
            sl.id === slotId ? { ...sl, taken: false, scheduleId: null } : sl
          )
        }))
      }
    } catch (err) {
      console.error('Failed to update meal status', err)
      // Rollback
      setDietPlan(prev => ({
        ...prev,
        slots: prev.slots.map(sl => sl.id === slotId ? { ...sl, taken: wasTaken } : sl)
      }))
    }
  }

  // Find today's routine
  const todayStr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()]
  const backendDayOfWeek = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1 // 0 is Mon, 6 is Sun in backend
  const todayRoutine = workoutPlan?.plan_routines?.find(r => 
      (r.assignedDays || []).includes(todayStr) || 
      r.day_of_week === backendDayOfWeek || 
      r.day_number === 1
  ) || workoutPlan?.plan_routines?.find(r => !r.is_rest_day) // Fallback to first non-rest routine
  
  const uniqueExercises = todayRoutine?.exercises?.filter((v, i, a) => {
      if (!v) return false;
      if (typeof v === 'string') return a.indexOf(v) === i;
      return a.findIndex(t => t && (t.id === v.id || t.exercise_id === v.exercise_id)) === i;
  }) || []

  // Find today's rehab routine.
  // Backend rehab routines don't store day_of_week — they use order_index.
  // Strategy: pick the routine whose order_index matches today's 0-indexed weekday (Mon=0…Sun=6).
  // Fallback: first routine so there is always something to show.
  const todayRehabRoutine = rehabPlan?.routines?.find(
    r => r.order_index === backendDayOfWeek
  ) || rehabPlan?.routines?.[0] || null

  const rehabExercises = todayRehabRoutine?.exercises?.filter(Boolean) || []

  // Prepare meals
  const todayMeals = dietPlan?.slots || []

  // ── Live Today's Aggregate Metrics for Telemetry Badge ──────────────────
  const todayCalories = useMemo(() => {
    if (!Array.isArray(todayMeals)) return 0
    return todayMeals.reduce((sum, slot) => {
      if (slot && slot.taken) {
        const meal = slot.meals?.find(m => m && m.id === slot.selectedMealId) || slot.meals?.[0]
        return sum + (meal?.calories || meal?.nutrition?.calories_cal || 0)
      }
      return sum
    }, 0)
  }, [todayMeals])

  const todayWorkoutsDone = useMemo(() => {
    if (!Array.isArray(uniqueExercises)) return 0
    return uniqueExercises.reduce((count, ex) => {
      const isDone = (ex && typeof ex === 'object') ? (ex.is_completed || ex.taken) : false
      return count + (isDone ? 1 : 0)
    }, 0)
  }, [uniqueExercises])

  // ── Live Workout Performance Aggregator Memo ────────────────────────────
  const workoutChartData = useMemo(() => {
    const now = new Date()
    let labels = []
    let data = []

    if (workoutTime === 'Week') {
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      data = Array(7).fill(0)
      
      const currentDay = now.getDay()
      const distanceToMon = currentDay === 0 ? -6 : 1 - currentDay
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() + distanceToMon)
      startOfWeek.setHours(0, 0, 0, 0)
      
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      endOfWeek.setHours(23, 59, 59, 999)

      workoutSessions.forEach(sess => {
        if (!sess || !sess.scheduled_date) return
        const d = new Date(sess.scheduled_date)
        if (isNaN(d.getTime())) return
        if (d >= startOfWeek && d <= endOfWeek) {
          const dayIdx = d.getDay() === 0 ? 6 : d.getDay() - 1
          data[dayIdx] += 1
        }
      })
    } else if (workoutTime === 'Month') {
      labels = ['W1', 'W2', 'W3', 'W4']
      data = Array(4).fill(0)
      
      workoutSessions.forEach(sess => {
        const d = new Date(sess.scheduled_date)
        if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
          const day = d.getDate()
          if (day <= 7) data[0] += 1
          else if (day <= 14) data[1] += 1
          else if (day <= 21) data[2] += 1
          else data[3] += 1
        }
      })
    } else { // Year
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      data = Array(12).fill(0)
      
      workoutSessions.forEach(sess => {
        const d = new Date(sess.scheduled_date)
        if (d.getFullYear() === now.getFullYear()) {
          const monthIdx = d.getMonth()
          data[monthIdx] += 1
        }
      })
    }

    const total = data.reduce((a, b) => a + b, 0)
    return { labels, data, total }
  }, [workoutSessions, workoutTime])

  // ── Live Nutrition & Macronutrient Aggregator Memo ──────────────────────
  const mealChartData = useMemo(() => {
    const now = new Date()
    let labels = []
    let data = []

    const getVal = (mItem) => {
      if (!mItem) return 0
      if (mealMetric === 'Meals') return 1
      if (!mItem?.meal?.nutrition) return 0
      const n = mItem.meal.nutrition
      if (mealMetric === 'Calories') return n.calories_cal || 0
      if (mealMetric === 'Carbs (g)') return n.carbohydrates_g || 0
      if (mealMetric === 'Protein (g)') return n.protein_g || 0
      if (mealMetric === 'Fats (g)') return n.total_fat_g || 0
      return 0
    }

    if (mealTime === 'Week') {
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      data = Array(7).fill(0)

      const currentDay = now.getDay()
      const distanceToMon = currentDay === 0 ? -6 : 1 - currentDay
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() + distanceToMon)
      startOfWeek.setHours(0, 0, 0, 0)

      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      endOfWeek.setHours(23, 59, 59, 999)

      eatenMeals.forEach(m => {
        if (!m || !m.scheduled_date) return
        const d = new Date(m.scheduled_date)
        if (isNaN(d.getTime())) return
        if (d >= startOfWeek && d <= endOfWeek) {
          const dayIdx = d.getDay() === 0 ? 6 : d.getDay() - 1
          data[dayIdx] += getVal(m)
        }
      })
    } else if (mealTime === 'Month') {
      labels = ['W1', 'W2', 'W3', 'W4']
      data = Array(4).fill(0)

      eatenMeals.forEach(m => {
        const d = new Date(m.scheduled_date)
        if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
          const day = d.getDate()
          const val = getVal(m)
          if (day <= 7) data[0] += val
          else if (day <= 14) data[1] += val
          else if (day <= 21) data[2] += val
          else data[3] += val
        }
      })
    } else { // Year
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      data = Array(12).fill(0)

      eatenMeals.forEach(m => {
        const d = new Date(m.scheduled_date)
        if (d.getFullYear() === now.getFullYear()) {
          const monthIdx = d.getMonth()
          data[monthIdx] += getVal(m)
        }
      })
    }

    if (mealMetric !== 'Meals' && mealMetric !== 'Calories') {
      data = data.map(val => Math.round(val * 10) / 10)
    }
    
    let total = data.reduce((a, b) => a + b, 0)
    if (mealMetric !== 'Meals' && mealMetric !== 'Calories') {
      total = Math.round(total * 10) / 10
    }

    return { labels, data, total }
  }, [eatenMeals, mealTime, mealMetric])

  // ── Rehab session chart data ─────────────────────────────────────────────────
  const rehabChartData = useMemo(() => {
    const now = new Date()
    let labels = [], data = []
    if (rehabTime === 'Week') {
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      data = Array(7).fill(0)
      const dist = now.getDay() === 0 ? -6 : 1 - now.getDay()
      const start = new Date(now); start.setDate(now.getDate() + dist); start.setHours(0,0,0,0)
      const end = new Date(start); end.setDate(start.getDate() + 6); end.setHours(23,59,59,999)
      rehabSessions.forEach(s => {
        const d = new Date(s.completed_at || s.session_date || '')
        if (isNaN(d)) return
        if (d >= start && d <= end) data[d.getDay() === 0 ? 6 : d.getDay() - 1] += 1
      })
    } else if (rehabTime === 'Month') {
      labels = ['W1', 'W2', 'W3', 'W4']; data = Array(4).fill(0)
      rehabSessions.forEach(s => {
        const d = new Date(s.completed_at || s.session_date || '')
        if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
          const day = d.getDate()
          if (day <= 7) data[0]++ ; else if (day <= 14) data[1]++ ; else if (day <= 21) data[2]++ ; else data[3]++
        }
      })
    } else {
      labels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; data = Array(12).fill(0)
      rehabSessions.forEach(s => {
        const d = new Date(s.completed_at || s.session_date || '')
        if (d.getFullYear() === now.getFullYear()) data[d.getMonth()] += 1
      })
    }
    return { labels, data, total: data.reduce((a,b) => a+b, 0) }
  }, [rehabSessions, rehabTime])

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 overflow-auto px-8 py-8 flex flex-col gap-10 animate-fade-in">

        {/* Greeting */}
        <h1 className="text-heading-h4 font-bold text-text-headings leading-tight">
          {getGreeting()}, {username}!{' '}
          <span className="font-regular text-text-body text-heading-h5">
            Here&apos;s how you&apos;re doing today.
          </span>
        </h1>

        {/* Today's Routine & Meals */}
        <section className="flex flex-col gap-8">
            {plansLoading ? (
                <div className="flex flex-col gap-8">
                    <div className="animate-pulse flex flex-col gap-4">
                        <div className="h-6 w-32 bg-neutral-200 rounded-md"></div>
                        <div className="flex gap-4 overflow-x-hidden">
                            <div className="w-[85%] sm:w-[320px] h-[400px] bg-neutral-200 rounded-2xl shrink-0"></div>
                            <div className="w-[85%] sm:w-[320px] h-[400px] bg-neutral-200 rounded-2xl shrink-0"></div>
                        </div>
                    </div>
                    <div className="animate-pulse flex flex-col gap-4">
                        <div className="h-6 w-32 bg-neutral-200 rounded-md"></div>
                        <div className="flex gap-4 overflow-x-hidden">
                            <div className="w-[85%] sm:w-[320px] h-[400px] bg-neutral-200 rounded-2xl shrink-0"></div>
                            <div className="w-[85%] sm:w-[320px] h-[400px] bg-neutral-200 rounded-2xl shrink-0"></div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-8">
                    {/* Meals Card */}
                    <div className="flex flex-col gap-4">
                        <h2 className="text-heading-h5 font-bold text-text-headings px-1">Today's Meals</h2>
                        {todayMeals.length > 0 ? (
                            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-8 px-8 md:mx-0 md:px-0">
                                {todayMeals.map(slot => {
                                    if (!slot) return null
                                    const meal = slot.meals?.find(m => m && m.id === slot.selectedMealId) || slot.meals?.[0]
                                    const imageUrl = meal?.image || meal?.image_url || 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80'

                                    return (
                                        <div key={slot.id} className="relative w-[85%] sm:w-[320px] h-[400px] shrink-0 snap-center rounded-2xl overflow-hidden shadow-md group">
                                            <img src={imageUrl} alt={meal?.name || 'Meal'} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                            {slot.taken && (
                                                <div className="absolute inset-0 bg-meals-prim/60 flex items-center justify-center pb-12 transition-all duration-300">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-neutral-white opacity-100 drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-neutral-black/90 via-neutral-black/30 to-transparent" />
                                            <div className="absolute inset-0 p-6 flex flex-col justify-end">
                                                <div className="flex-1 flex justify-end flex-col mb-4">
                                                  <p className="text-body-sm font-bold text-neutral-white uppercase tracking-wider mb-2 drop-shadow-md opacity-90">{slot.label} • {slot.time}</p>
                                                  <p className="text-heading-h4 font-bold text-neutral-white leading-tight drop-shadow-md" title={meal?.name || 'No meal'}>{meal?.name || 'No meal'}</p>
                                                  {meal?.calories && <p className="text-body-md text-neutral-white/90 mt-2 font-medium drop-shadow-sm">{meal.calories} kcal</p>}
                                                </div>
                                                <Button 
                                                    variant="meals-primary" size="lg"
                                                    onClick={() => toggleMeal(slot.id)}
                                                    className={cn("w-full shadow-xl text-body-lg font-bold transition-all border-none", slot.taken ? "!bg-meals-prim-600 !text-neutral-white hover:!bg-meals-prim-700" : "!bg-meals-prim !text-neutral-white hover:!bg-meals-prim-600")}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                                    {slot.taken ? 'Eaten' : 'Mark as Eaten'}
                                                </Button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="w-full py-12 flex flex-col items-center justify-center bg-surface-primary rounded-2xl border border-border-primary border-dashed">
                                <p className="text-body-lg font-semibold text-text-disabled mb-3">No active diet plan.</p>
                                <Link to="/plans/create">
                                    <Button variant="meals-primary">Create Diet Plan</Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Routine Card */}
                    <div className="flex flex-col gap-4">
                        <h2 className="text-heading-h5 font-bold text-text-headings px-1">Today's Routine</h2>
                        {todayRoutine ? (
                            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-8 px-8 md:mx-0 md:px-0">
                                {uniqueExercises.map((ex, idx) => {
                                    if (!ex) return null
                                    const title = typeof ex === 'string' ? ex : (ex?.title || ex?.exercise?.title || 'Exercise')
                                    const taken = (ex && typeof ex === 'object') ? (ex.is_completed || ex.taken) : false
                                    const imageUrl = (ex && typeof ex === 'object' && ex.thumbnail_url) ? ex.thumbnail_url : 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80'
                                    
                                    return (
                                        <div key={idx} className="relative w-[85%] sm:w-[320px] h-[400px] shrink-0 snap-center rounded-2xl overflow-hidden shadow-md group">
                                            <img src={imageUrl} alt={title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                            {taken && (
                                                <div className="absolute inset-0 bg-workout-prim/60 flex items-center justify-center pb-12 transition-all duration-300">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-neutral-white opacity-100 drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-neutral-black/90 via-neutral-black/30 to-transparent" />
                                            <div className="absolute inset-0 p-6 flex flex-col justify-end">
                                                <div className="flex-1 flex justify-end flex-col mb-4">
                                                  <p className="text-body-sm font-bold text-neutral-white uppercase tracking-wider mb-2 drop-shadow-md opacity-90">Exercise {idx + 1}</p>
                                                  <p className="text-heading-h4 font-bold text-neutral-white leading-tight drop-shadow-md" title={title}>{title}</p>
                                                  {typeof ex === 'object' && ex.sets && <p className="text-body-md text-neutral-white/90 mt-2 font-medium drop-shadow-sm">{ex.sets} sets × {ex.reps} reps</p>}
                                                </div>
                                                <Button 
                                                    variant="workout-primary" size="lg"
                                                    onClick={() => toggleExercise(todayRoutine.id, idx)}
                                                    className={cn("w-full shadow-xl text-body-lg font-bold transition-all border-none", taken ? "!bg-workout-prim-600 !text-neutral-white hover:!bg-workout-prim-700" : "!bg-workout-prim !text-neutral-white hover:!bg-workout-prim-600")}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                                    {taken ? 'Completed' : 'Mark as Done'}
                                                </Button>
                                            </div>
                                        </div>
                                    )
                                })}
                                {!uniqueExercises.length && (
                                    <div className="w-full py-12 flex flex-col items-center justify-center bg-surface-primary rounded-2xl border border-border-primary border-dashed">
                                        <p className="text-body-lg font-semibold text-text-disabled mb-3">Rest day!</p>
                                        <p className="text-body-md text-text-disabled mt-1">No exercises scheduled for today.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="w-full py-12 flex flex-col items-center justify-center bg-surface-primary rounded-2xl border border-border-primary border-dashed">
                                <p className="text-body-lg font-semibold text-text-disabled mb-3">No active workout routine.</p>
                                <Link to="/plans/create">
                                    <Button variant="workout-primary">Create Workout Plan</Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Today's Rehab */}
                    <div className="flex flex-col gap-4">
                        <h2 className="text-heading-h5 font-bold text-text-headings px-1">Today's Rehab</h2>
                        {todayRehabRoutine ? (
                            <div className="flex flex-col gap-3">
                                {/* Routine info banner */}
                                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-rehab-prim/10 border border-rehab-prim/20">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-rehab-prim shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M22 12h-4l-3 9L9 3l-3 9H2" />
                                    </svg>
                                    <div>
                                        <p className="text-body-sm font-bold text-rehab-prim">{todayRehabRoutine.name}</p>
                                        {rehabPlan?.condition?.name && (
                                            <p className="text-body-xs text-text-disabled">{rehabPlan.condition.name}</p>
                                        )}
                                    </div>
                                    <span className="ml-auto text-body-xs font-semibold text-rehab-prim bg-rehab-prim/10 px-2.5 py-1 rounded-lg">
                                        {rehabExercises.length} exercise{rehabExercises.length !== 1 ? 's' : ''}
                                    </span>
                                </div>

                                {rehabExercises.length > 0 ? (
                                    <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-8 px-8 md:mx-0 md:px-0">
                                        {rehabExercises.map((entry, idx) => {
                                            const ex = entry.exercise || entry
                                            const title = ex?.title || 'Exercise'
                                            const imageUrl = ex?.thumbnail_url || ex?.image_url ||
                                                'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80'
                                            const prescription = [
                                                entry.sets   ? `${entry.sets} sets`            : null,
                                                entry.reps   ? `× ${entry.reps} reps`          : null,
                                                entry.hold_time_seconds ? `${entry.hold_time_seconds}s hold` : null,
                                            ].filter(Boolean).join(' ')

                                            return (
                                                <div key={entry.id || idx} className="relative w-[85%] sm:w-[320px] h-[400px] shrink-0 snap-center rounded-2xl overflow-hidden shadow-md group">
                                                    <img src={imageUrl} alt={title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-black/90 via-neutral-black/30 to-transparent" />
                                                    <div className="absolute inset-0 p-6 flex flex-col justify-end">
                                                        <div className="flex-1 flex justify-end flex-col mb-4">
                                                            <p className="text-body-sm font-bold text-neutral-white uppercase tracking-wider mb-2 drop-shadow-md opacity-90">
                                                                Exercise {idx + 1}
                                                            </p>
                                                            <p className="text-heading-h4 font-bold text-neutral-white leading-tight drop-shadow-md" title={title}>{title}</p>
                                                            {prescription && (
                                                                <p className="text-body-md text-neutral-white/90 mt-2 font-medium drop-shadow-sm">{prescription}</p>
                                                            )}
                                                            {entry.notes && (
                                                                <p className="text-body-sm text-neutral-white/70 mt-1 italic line-clamp-2">{entry.notes}</p>
                                                            )}
                                                        </div>
                                                        {ex?.youtube_url && (
                                                            <a
                                                                href={ex.youtube_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="w-full py-3 rounded-xl bg-rehab-prim text-neutral-white font-bold text-body-md text-center shadow-xl flex items-center justify-center gap-2 hover:bg-rehab-prim/90 transition-colors"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                                                    <path d="M8 5v14l11-7z" />
                                                                </svg>
                                                                Watch Demo
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="w-full py-10 flex flex-col items-center justify-center bg-surface-primary rounded-2xl border border-border-primary border-dashed">
                                        <p className="text-body-lg font-semibold text-text-disabled">No exercises in this routine yet.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="w-full py-12 flex flex-col items-center justify-center bg-surface-primary rounded-2xl border border-border-primary border-dashed">
                                <p className="text-body-lg font-semibold text-text-disabled mb-3">No active rehab plan.</p>
                                <Link to="/plans/create">
                                    <Button variant="rehab-primary">Create Rehab Plan</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </section>

        {/* Statistics Section — Conditioned strictly on existing plans ownership */}
        {(hasWorkoutHistory || hasMealHistory) && (
          <section aria-label="Statistics">
              <h2 className="text-heading-h5 font-bold text-text-headings mb-5">Your Statistics</h2>
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                {hasWorkoutHistory && (
                  <BarChart 
                      title="Workouts Overview" 
                      data={workoutChartData.data}
                      labels={workoutChartData.labels}
                      total={workoutChartData.total}
                      totalLabel={`workouts / ${workoutTime.toLowerCase()}`}
                      actions={
                      <SegmentedControl 
                          options={['Week', 'Month', 'Year']} 
                          selected={workoutTime} 
                          onChange={setWorkoutTime} 
                      />
                      }
                  />
                )}

                {hasMealHistory && (
                  <BarChart 
                      title="Nutrition Overview" 
                      data={mealChartData.data}
                      labels={mealChartData.labels}
                      total={mealChartData.total}
                      totalLabel={`${mealMetric} / ${mealTime.toLowerCase()}`}
                      actions={
                      <>
                          <Menu
                          placement="bottom-end"
                          trigger={
                              <button className="flex items-center gap-2 px-3 py-1.5 bg-surface-primary border border-border-primary rounded-lg text-body-sm font-semibold text-text-headings hover:bg-neutral-100 transition-colors shadow-sm whitespace-nowrap">
                              {mealMetric}
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                              </button>
                          }
                          items={[
                              { label: 'Meals Taken', onClick: () => setMealMetric('Meals') },
                              { label: 'Calories', onClick: () => setMealMetric('Calories') },
                              { label: 'Carbs (g)', onClick: () => setMealMetric('Carbs (g)') },
                              { label: 'Fats (g)', onClick: () => setMealMetric('Fats (g)') },
                              { label: 'Protein (g)', onClick: () => setMealMetric('Protein (g)') },
                          ]}
                          />
                          <SegmentedControl 
                          options={['Week', 'Month', 'Year']} 
                          selected={mealTime} 
                          onChange={setMealTime} 
                          />
                      </>
                      }
                  />
                )}
              </div>
          </section>
        )}

        {/* ── Performance Analytics ── */}
        {(rehabStreaks || rehabSessions.length > 0 || nutritionStats) && (
          <section aria-label="Performance Analytics">
            <h2 className="text-heading-h5 font-bold text-text-headings mb-5">Performance Analytics</h2>
            <div className="flex flex-col gap-6">

              {/* KPI stat cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard emoji="🔥" label="Current Streak"   value={rehabStreaks?.current_streak ?? 0}  unit="days" />
                <StatCard emoji="🏆" label="Longest Streak"   value={rehabStreaks?.longest_streak ?? 0}  unit="days" />
                <StatCard emoji="🧘" label="Rehab Sessions"   value={rehabSessions.length}               unit="completed" />
                <StatCard emoji="💪" label="Workout Sessions" value={workoutSessions.length}             unit="completed" />
              </div>

              {/* Rehab bar chart + exercise completion donut */}
              {rehabSessions.length > 0 && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <BarChart
                    title="Rehab Sessions"
                    data={rehabChartData.data}
                    labels={rehabChartData.labels}
                    total={rehabChartData.total}
                    totalLabel={`sessions / ${rehabTime.toLowerCase()}`}
                    actions={
                      <SegmentedControl
                        options={['Week', 'Month', 'Year']}
                        selected={rehabTime}
                        onChange={setRehabTime}
                      />
                    }
                  />
                  <ExerciseCompletionCard sessions={rehabSessions} />
                </div>
              )}

              {/* Nutrition macro breakdown */}
              {nutritionStats && <MacroBreakdownCard stats={nutritionStats} />}

              {/* Recent rehab sessions list */}
              {rehabSessions.length > 0 && (
                <div className="flex flex-col gap-3">
                  <h3 className="text-body-lg font-bold text-text-headings">Recent Rehab Sessions</h3>
                  <div className="flex flex-col gap-2">
                    {rehabSessions.slice(0, 6).map(s => {
                      const pct = s.total_exercises > 0
                        ? Math.round((s.exercises_completed / s.total_exercises) * 100)
                        : 0
                      const dateStr = s.completed_at || s.session_date
                      const date = dateStr
                        ? new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                        : '—'
                      return (
                        <div key={s.session_id}
                          className="bg-surface-primary rounded-xl border border-border-primary px-4 py-3 flex items-center gap-4 hover:border-rehab-prim/30 transition-colors">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-body-xs font-bold shrink-0"
                            style={{ background: pct === 100 ? '#D1FAE5' : '#EDE9FE', color: pct === 100 ? '#059669' : '#7C3AED' }}>
                            {pct}%
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-body-sm font-bold text-text-headings truncate">{s.routine_name || 'Rehab Session'}</p>
                            <p className="text-body-xs text-text-disabled">{date} · {s.exercises_completed}/{s.total_exercises} exercises</p>
                          </div>
                          {s.pain_level > 0 && (
                            <span className="text-body-xs font-bold px-2 py-1 rounded-lg bg-neutral-100 text-text-disabled shrink-0">
                              Pain {s.pain_level}/10
                            </span>
                          )}
                          <span className={`text-body-xs font-bold px-2.5 py-1 rounded-full border shrink-0 ${
                            pct === 100
                              ? 'bg-success-100 text-success-700 border-success-200'
                              : 'bg-rehab-prim/10 text-rehab-prim border-rehab-prim/20'
                          }`}>
                            {pct === 100 ? '✓ Full' : 'Partial'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* ── WORKOUT ANALYTICS ── */}
              {workoutSessions.length > 0 && (
                <>
                  <div className="border-t border-border-primary pt-6">
                    <h3 className="text-body-lg font-bold text-text-headings mb-4">Workout Session History</h3>
                    <div className="flex flex-col gap-2">
                      {workoutSessions.slice(0, 6).map(s => {
                        const dateStr = s.scheduled_date || s.created_at
                        const date = dateStr
                          ? new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                          : '—'
                        const statusColor = s.status === 'completed' ? '#059669' : s.status === 'abandoned' ? '#EF4444' : '#6B7280'
                        const statusBg   = s.status === 'completed' ? '#D1FAE5' : s.status === 'abandoned' ? '#FEE2E2' : '#F3F4F6'
                        return (
                          <div key={s.id}
                            className="bg-surface-primary rounded-xl border border-border-primary px-4 py-3 flex items-center gap-4 hover:border-workout-prim/30 transition-colors">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                              style={{ background: statusBg, color: statusColor }}>
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-body-sm font-bold text-text-headings">Workout Session</p>
                              <p className="text-body-xs text-text-disabled">{date}</p>
                            </div>
                            <span className="text-body-xs font-bold px-2.5 py-1 rounded-full border shrink-0"
                              style={{ background: statusBg, color: statusColor, borderColor: statusColor + '40' }}>
                              {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* ── MEAL ANALYTICS ── */}
              {eatenMeals.length > 0 && (
                <div className="border-t border-border-primary pt-6 flex flex-col gap-5">
                  <h3 className="text-body-lg font-bold text-text-headings">Meal Analytics</h3>

                  {/* Meal type donut + day-of-week heatmap */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <MealTypeDonut eatenMeals={eatenMeals} />

                    {/* Day-of-week consistency card */}
                    <div className="bg-surface-page rounded-xl p-6 border border-border-primary shadow-sm flex flex-col h-[360px]">
                      <h3 className="text-heading-h6 font-bold text-text-headings mb-1">Meal Consistency</h3>
                      <p className="text-body-sm text-text-disabled mb-6">Average meals eaten per day of week</p>
                      <div className="flex-1 flex items-end gap-2 pb-2">
                        {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day, di) => {
                          const backendDay = di === 6 ? 0 : di + 1
                          const count = eatenMeals.filter(m => {
                            const d = new Date(m.scheduled_date || m.eaten_date || '')
                            return !isNaN(d) && d.getDay() === backendDay
                          }).length
                          const max = Math.max(...['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((_, i2) => {
                            const bd = i2 === 6 ? 0 : i2 + 1
                            return eatenMeals.filter(m => { const d = new Date(m.scheduled_date || ''); return !isNaN(d) && d.getDay() === bd }).length
                          }), 1)
                          const pct = (count / max) * 100
                          return (
                            <div key={day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                              <span className="text-body-xs text-text-disabled">{count}</span>
                              <div className="w-full rounded-t-md transition-all duration-700"
                                style={{ height: `${Math.max(pct, 4)}%`, backgroundColor: count > 0 ? '#10B981' : '#F3F4F6' }} />
                              <span className="text-[10px] text-text-disabled">{day}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Recent eaten meals */}
                  <div className="flex flex-col gap-2">
                    <h4 className="text-body-md font-bold text-text-headings">Recent Meals</h4>
                    {eatenMeals.slice(0, 6).map((m, i) => {
                      const typeEmoji = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎' }[m.meal_type] || '🍽️'
                      const date = m.scheduled_date
                        ? new Date(m.scheduled_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                        : '—'
                      return (
                        <div key={m.id || i}
                          className="bg-surface-primary rounded-xl border border-border-primary px-4 py-3 flex items-center gap-4 hover:border-meals-prim/30 transition-colors">
                          <span className="text-2xl shrink-0">{typeEmoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-body-sm font-bold text-text-headings capitalize">{m.meal_type}</p>
                            <p className="text-body-xs text-text-disabled">{date}</p>
                          </div>
                          <span className="text-body-xs font-bold px-2.5 py-1 rounded-full bg-success-100 text-success-700 border border-success-200 shrink-0">
                            ✓ Eaten
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

            </div>
          </section>
        )}

        {/* Daily Journal & Recovery Insights */}
        <section className="bg-surface-primary rounded-2xl border border-border-primary p-6 shadow-sm relative h-fit animate-fade-in z-10 flex flex-col gap-6">
          <div className="absolute top-[-30px] right-[-30px] w-48 h-48 bg-rehab-prim-100/20 rounded-full blur-3xl pointer-events-none" />
          
          {/* Row 1: Entry Form and Summary */}
          <div className="flex flex-col md:flex-row gap-6 z-10">
            <div className="flex-1 space-y-4 z-10">
              <div className="flex flex-col gap-1">
                <h2 className="text-heading-h6 font-bold text-text-headings flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-rehab-prim" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  Daily Wellbeing Journal
                </h2>
                <p className="text-body-sm text-text-disabled leading-relaxed">
                  Jot down reflections on today&apos;s rehabilitation progress, muscle soreness, motivation, or joint mobility status.
                </p>
              </div>
              
              <textarea
                value={recoveryNotes}
                onChange={e => setRecoveryNotes(e.target.value)}
                placeholder="E.g., Left knee feels highly mobile today. Felt slight tightness during squats. Slept great!..."
                className="block w-full h-28 bg-neutral-50 rounded-xl px-4 py-3 text-body-md text-text-body placeholder:text-text-disabled focus:outline-none focus:border-rehab-prim border border-border-primary resize-none shadow-inner transition-colors"
              />
              
              <div className="flex items-center justify-end gap-3">
                {journalToast && (
                  <span className="text-body-sm font-bold text-success-600 animate-pulse flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    Saved successfully
                  </span>
                )}
                <Button 
                  variant="rehab-primary" 
                  size="md"
                  className="font-bold px-6 shadow-sm"
                  onClick={handleSaveDailyLog}
                  disabled={isSavingLog}
                >
                  {isSavingLog ? 'Synchronizing...' : 'Save Today\'s Log'}
                </Button>
              </div>
            </div>

            {/* Automatic Summary Telemetry Block */}
            <div className="md:w-72 shrink-0 flex flex-col gap-3 bg-neutral-50 border border-border-primary rounded-2xl p-5 z-10 justify-center">
              <h3 className="text-[11px] font-bold text-text-disabled uppercase tracking-widest mb-1">Today&apos;s Automated Telemetry</h3>
              
              <div className="bg-surface-primary border border-border-primary rounded-xl p-4 shadow-xs flex flex-col gap-1 relative overflow-hidden">
                <span className="text-body-xs font-semibold text-meals-prim flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-meals-prim animate-pulse shrink-0" />
                  Nutrient Fuel
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-heading-h4 font-bold text-text-headings">{Math.round(todayCalories)}</span>
                  <span className="text-body-xs text-text-disabled">kcal consumed</span>
                </div>
              </div>

              <div className="bg-surface-primary border border-border-primary rounded-xl p-4 shadow-xs flex flex-col gap-1 relative overflow-hidden">
                <span className="text-body-xs font-semibold text-workout-prim flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-workout-prim animate-pulse shrink-0" />
                  Workout Items
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-heading-h4 font-bold text-text-headings">{todayWorkoutsDone}</span>
                  <span className="text-body-xs text-text-disabled">/{uniqueExercises.length} exercises done</span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Wellbeing History Carousel */}
          <div className="border-t border-border-primary/60 pt-6 z-10 animate-fade-in flex flex-col">
            <h3 className="text-[11px] font-bold text-text-disabled uppercase tracking-widest mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-rehab-prim" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Saved Journal History
            </h3>
            
            {recentLogs.filter(l => l.recovery_notes).length > 0 ? (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x">
                {recentLogs
                  .filter(l => l.recovery_notes)
                  .map(item => {
                    const d = new Date(item.date + 'T12:00:00')
                    const formatted = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                    
                    const isToday = item.date === localDateStr()
                    
                    return (
                      <div 
                        key={item.date} 
                        className={cn(
                          "min-w-[280px] md:min-w-[320px] border rounded-2xl p-4 shadow-xs shrink-0 snap-start flex flex-col gap-3 transition-all relative overflow-hidden",
                          isToday 
                            ? "bg-rehab-prim-100/10 border-rehab-prim/30 ring-1 ring-rehab-prim/20 shadow-md" 
                            : "bg-neutral-50 border-border-primary hover:border-rehab-prim/30"
                        )}
                      >
                        {isToday && (
                          <span className="absolute top-0 right-0 bg-rehab-prim text-neutral-white text-[8px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-bl-lg flex items-center shadow-xs z-20">
                            Today
                          </span>
                        )}
                        <div className="flex items-center justify-between border-b border-border-primary/40 pb-2">
                          <span className="text-body-xs font-bold text-text-headings">{formatted}</span>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-text-disabled">
                            {item.calories_consumed > 0 && <span className="flex items-center gap-0.5">🔥 {item.calories_consumed}</span>}
                            {item.workouts_completed > 0 && <span className="flex items-center gap-0.5">💪 {item.workouts_completed}</span>}
                          </div>
                        </div>
                        <p className="text-body-sm text-text-body italic leading-relaxed line-clamp-3 break-words">&ldquo;{item.recovery_notes}&rdquo;</p>
                      </div>
                    )
                  })
                }
              </div>
            ) : (
              <div className="bg-neutral-50 border border-dashed border-border-primary rounded-2xl p-6 flex flex-col items-center justify-center text-center py-8 gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-text-disabled opacity-50 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <span className="text-body-sm font-bold text-text-headings">No recovery logs saved yet</span>
                <span className="text-body-xs text-text-disabled max-w-xs leading-relaxed">When you write a reflection above and click &ldquo;Save&rdquo;, a snapshot of your day will appear in this timeline feed.</span>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  )
}
