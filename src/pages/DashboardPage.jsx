import { useState, useMemo, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '../components/atoms/Button.jsx'
import { cn } from '../components/utils.js'
import { getUserMetrics } from '../api/authService.js'
import { getWorkoutPlans, getWorkoutPlan } from '../api/workoutsService.js'
import { getMealPlans, getMealPlan } from '../api/mealPlansService.js'
import { Menu } from '../components/molecules/Menu.jsx'

// ── Mock Data ──────────────────────────────────────────────────────────────────
const WORKOUT_MOCK_DATA = {
  Week: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], data: [1, 0, 1, 0, 1, 1, 0] },
  Month: { labels: ['W1', 'W2', 'W3', 'W4'], data: [3, 4, 3, 5] },
  Year: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], data: [12, 14, 15, 10, 16, 14, 18, 15, 12, 16, 14, 15] }
}

const MEALS_MOCK_DATA = {
  'Meals': {
    Week: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], data: [3, 4, 3, 4, 3, 4, 3] },
    Month: { labels: ['W1', 'W2', 'W3', 'W4'], data: [21, 24, 22, 25] },
    Year: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], data: [90, 85, 95, 90, 100, 95, 90, 95, 90, 95, 90, 95] }
  },
  'Calories': {
    Week: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], data: [2100, 2400, 1950, 2200, 2500, 2600, 2300] },
    Month: { labels: ['W1', 'W2', 'W3', 'W4'], data: [15400, 16200, 14800, 16500] },
    Year: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], data: [65000, 62000, 68000, 64000, 70000, 66000, 67000, 65000, 66000, 69000, 64000, 68000] }
  },
  'Carbs (g)': {
    Week: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], data: [250, 280, 220, 260, 290, 300, 270] },
    Month: { labels: ['W1', 'W2', 'W3', 'W4'], data: [1800, 1950, 1750, 1900] },
    Year: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], data: [7500, 7100, 7800, 7300, 8000, 7600, 7700, 7500, 7600, 7900, 7400, 7800] }
  },
  'Protein (g)': {
    Week: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], data: [140, 160, 130, 150, 170, 180, 150] },
    Month: { labels: ['W1', 'W2', 'W3', 'W4'], data: [1000, 1100, 950, 1150] },
    Year: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], data: [4200, 3900, 4400, 4100, 4600, 4300, 4400, 4200, 4300, 4500, 4100, 4400] }
  },
  'Fats (g)': {
    Week: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], data: [60, 75, 55, 65, 80, 85, 70] },
    Month: { labels: ['W1', 'W2', 'W3', 'W4'], data: [450, 520, 420, 550] },
    Year: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], data: [1900, 1800, 2100, 1950, 2200, 2050, 2100, 1950, 2000, 2150, 1900, 2100] }
  }
}

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

export default function DashboardPage() {
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  
  const [workoutPlan, setWorkoutPlan] = useState(null)
  const [dietPlan, setDietPlan] = useState(null)
  const [plansLoading, setPlansLoading] = useState(true)

  // Chart states
  const [workoutTime, setWorkoutTime] = useState('Week')
  const [mealTime, setMealTime] = useState('Week')
  const [mealMetric, setMealMetric] = useState('Meals')

  const userId = localStorage.getItem('user_id')
  const username = localStorage.getItem('username') || 'there'

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

      try {
        const wPlans = await getWorkoutPlans()
        if (wPlans && wPlans.length > 0) {
          const fullWPlan = await getWorkoutPlan(wPlans[0].id)
          setWorkoutPlan(fullWPlan)
        }
      } catch (e) {
        console.error('Failed to fetch workout plans:', e)
      }
      
      try {
        const storedPlans = localStorage.getItem('user_plans')
        if (storedPlans) {
            const plans = JSON.parse(storedPlans)
            const dPlan = plans.find(p => p.id === 'custom-diet-plan' || p.defaultTab === 'Diet')
            if (dPlan) setDietPlan(dPlan)
        }
      } catch (e) {
         console.error('Failed to parse diet plan', e)
      } finally {
         setPlansLoading(false)
      }
    }
    fetchAll()
  }, [userId])

  const toggleExercise = async (routineId, idx) => {
    if (!workoutPlan) return
    const newPlan = { ...workoutPlan }
    const rIdx = newPlan.plan_routines.findIndex(r => r.id === routineId)
    if (rIdx === -1) return
    
    const ex = newPlan.plan_routines[rIdx].exercises[idx]
    const current = ex.is_completed || ex.taken || false
    const nxt = !current
    
        newPlan.plan_routines[rIdx].exercises[idx] = { ...ex, is_completed: nxt, taken: nxt }
    setWorkoutPlan(newPlan)
  }

  const toggleMeal = (slotId) => {
      if (!dietPlan) return
      const newPlan = { ...dietPlan }
      newPlan.slots = newPlan.slots.map(sl => {
          if (sl.id === slotId) {
              return { ...sl, taken: !sl.taken }
          }
          return sl
      })
      setDietPlan(newPlan)
      try {
          const stored = localStorage.getItem('user_plans')
          const plans = stored ? JSON.parse(stored) : []
          const updated = plans.map(p => {
              if (p.id === newPlan.id) return newPlan
              return p
          })
          localStorage.setItem('user_plans', JSON.stringify(updated))
      } catch(e){}
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
      if (typeof v === 'string') return a.indexOf(v) === i;
      return a.findIndex(t => (t.id === v.id || t.exercise_id === v.exercise_id)) === i;
  }) || []

  // Prepare meals
  const todayMeals = dietPlan?.slots || []

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
                                    const meal = slot.meals?.find(m => m.id === slot.selectedMealId) || slot.meals?.[0]
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
                                    const title = typeof ex === 'string' ? ex : (ex.title || ex.exercise?.title)
                                    const taken = typeof ex === 'object' ? (ex.is_completed || ex.taken) : false
                                    const imageUrl = (typeof ex === 'object' && ex.thumbnail_url) ? ex.thumbnail_url : 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80'
                                    
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
                </div>
            )}
        </section>

        {/* Statistics Section */}
        <section aria-label="Statistics">
            <h2 className="text-heading-h5 font-bold text-text-headings mb-5">Your Statistics</h2>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
            <BarChart 
                title="Workouts Overview" 
                data={WORKOUT_MOCK_DATA[workoutTime].data}
                labels={WORKOUT_MOCK_DATA[workoutTime].labels}
                total={WORKOUT_MOCK_DATA[workoutTime].data.reduce((a,b)=>a+b, 0)}
                totalLabel={`workouts / ${workoutTime.toLowerCase()}`}
                actions={
                <SegmentedControl 
                    options={['Week', 'Month', 'Year']} 
                    selected={workoutTime} 
                    onChange={setWorkoutTime} 
                />
                }
            />
            <BarChart 
                title="Nutrition Overview" 
                data={MEALS_MOCK_DATA[mealMetric][mealTime].data}
                labels={MEALS_MOCK_DATA[mealMetric][mealTime].labels}
                total={MEALS_MOCK_DATA[mealMetric][mealTime].data.reduce((a,b)=>a+b, 0)}
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
            </div>
        </section>

      </div>
    </div>
  )
}
