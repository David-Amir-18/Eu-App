import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { cn } from '../components/utils.js'
import { Button } from '../components/atoms/Button.jsx'
import { Field } from '../components/atoms/Field.jsx'
import { DatePicker } from '../components/molecules/DatePicker.jsx'
import { DefinedField } from '../components/molecules/DefinedField.jsx'
import { getExercises } from '../api/exercisesService.js'

// ── Icons ──────────────────────────────────────────────────────────────────────
function IconWorkout() {
  return <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 6.5h11M6.5 17.5h11M4 12h16M4 12a2 2 0 01-2-2V8a2 2 0 012-2M20 12a2 2 0 002-2V8a2 2 0 00-2-2M4 12a2 2 0 00-2 2v2a2 2 0 002 2M20 12a2 2 0 012 2v2a2 2 0 01-2 2" /></svg>
}
function IconDiet() {
  return <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l19-9-9 19-2-8-8-2z" /></svg>
}
function IconRehab() {
  return <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
}

// ── Constants ──────────────────────────────────────────────────────────────────
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MEAL_SLOTS = ['Breakfast', 'Lunch', 'Dinner', 'Snacks']

const EQUIPMENT_OPTIONS = [
  { value: 'none', label: 'Bodyweight Only (None)' },
  { value: 'dumbbell', label: 'Dumbbells' },
  { value: 'barbell', label: 'Barbell' },
  { value: 'machine', label: 'Machine' }
]

const EXERCISE_TYPE_OPTIONS = [
  { value: 'weight_reps', label: 'Weight & Reps' },
  { value: 'reps_only', label: 'Reps Only' },
  { value: 'duration', label: 'Timed Duration' }
]

const MUSCLE_GROUP_OPTIONS = [
  { value: 'all', label: 'All Muscles' },
  { value: 'chest', label: 'Chest' },
  { value: 'shoulders', label: 'Shoulders' },
  { value: 'biceps', label: 'Biceps' },
  { value: 'triceps', label: 'Triceps' },
  { value: 'upper_back', label: 'Upper Back' },
  { value: 'lower_back', label: 'Lower Back' },
  { value: 'core', label: 'Core (Abs)' },
  { value: 'quads', label: 'Quads' },
  { value: 'hamstrings', label: 'Hamstrings' },
  { value: 'calves', label: 'Calves' }
]

const DIET_PREF_OPTIONS = [
  { value: 'None', label: 'No Preference' },
  { value: 'Vegan', label: 'Vegan' },
  { value: 'Vegetarian', label: 'Vegetarian' },
  { value: 'Keto', label: 'Keto' }
]

// ── Components ─────────────────────────────────────────────────────────────────
function TypeCard({ type, active, onClick, icon, title, desc, activeClass }) {
  return (
    <button
      onClick={() => onClick(type)}
      className={cn(
        'flex flex-col items-start p-5 rounded-2xl border-2 text-left transition-all',
        active ? activeClass : 'border-border-primary bg-surface-primary hover:border-neutral-300'
      )}
    >
      <div className={cn('p-3 rounded-xl mb-4', active ? 'bg-neutral-white/20' : 'bg-neutral-100 text-text-disabled')}>
        {icon}
      </div>
      <h3 className={cn('text-heading-h6 font-bold mb-1', active ? 'text-neutral-white' : 'text-text-headings')}>{title}</h3>
      <p className={cn('text-body-sm', active ? 'text-neutral-white/80' : 'text-text-disabled')}>{desc}</p>
    </button>
  )
}

function ToggleGroup({ options, selected, onChange, activeColor = 'bg-workout-prim' }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => {
        const isSelected = selected.includes(opt)
        return (
          <button
            key={opt}
            onClick={() => {
              if (isSelected) onChange(selected.filter(o => o !== opt))
              else onChange([...selected, opt])
            }}
            className={cn(
              'px-4 py-2 rounded-lg text-body-sm font-semibold transition-colors border',
              isSelected
                ? `${activeColor} text-neutral-white border-transparent`
                : 'bg-surface-primary border-border-primary text-text-body hover:border-neutral-400'
            )}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}

function Modal({ open, onClose, onConfirm, title, confirmText = "Yes, discard", cancelText = "No, keep editing", children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-neutral-black/50" onClick={onClose} />
      <div className="relative bg-surface-primary rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
        <h2 className="text-heading-h6 font-bold text-text-headings">{title}</h2>
        <p className="text-body-md text-text-disabled">{children}</p>
        <div className="flex gap-3 mt-2">
          {cancelText && <Button variant="neutral" onClick={onClose} className="flex-1 border border-border-primary">{cancelText}</Button>}
          {onConfirm && <Button variant="primary" onClick={onConfirm} className="flex-1 bg-error-500 hover:bg-error-600 text-neutral-white">{confirmText}</Button>}
        </div>
      </div>
    </div>
  )
}

function formatDateShort(date) {
  if (!date) return 'TBD'
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[date.getMonth()]} ${String(date.getDate()).padStart(2, '0')}, ${date.getFullYear()}`
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function CreatePlanPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const draftData = location.state?.draftPlan

  // General State
  const [type, setType] = useState(draftData?.rawType || 'workout')
  const [name, setName] = useState(draftData?.name || '')
  const [startDate, setStartDate] = useState(draftData?.rawStartDate ? new Date(draftData.rawStartDate) : null)
  const [endDate, setEndDate] = useState(draftData?.rawEndDate ? new Date(draftData.rawEndDate) : null)
  const [level, setLevel] = useState(draftData?.rawLevel || (draftData?.rawType === 'diet' ? 'General Health' : draftData?.rawType === 'rehab' ? 'Phase 1 (Pain Management)' : 'Beginner'))

  // Workout State
  const [equipment, setEquipment] = useState(draftData?.rawEquipment || 'dumbbell')
  const [workoutDays, setWorkoutDays] = useState(draftData?.rawWorkoutDays || ['Mon', 'Wed', 'Fri'])
  const [exerciseType, setExerciseType] = useState(draftData?.rawExerciseType || 'weight_reps')
  const [muscleGroup, setMuscleGroup] = useState(draftData?.rawMuscleGroup || 'chest')
  const hundredPercentBodyweight = equipment === 'none'
  const [routineExercises, setRoutineExercises] = useState(draftData?.routines?.[0]?.exercises || [])

  // Exercise selection states
  const [showExerciseSearchModal, setShowExerciseSearchModal] = useState(false)
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState('')
  const [availableExercises, setAvailableExercises] = useState([])
  const [exerciseSearchLoading, setExerciseSearchLoading] = useState(false)

  useEffect(() => {
    if (!showExerciseSearchModal) return
    setExerciseSearchLoading(true)
    getExercises({
      page: 1,
      pageSize: 50,
      search: exerciseSearchQuery || undefined,
      equipmentCategory: hundredPercentBodyweight ? 'none' : undefined,
    })
      .then((data) => {
        let items = data.items || []
        if (hundredPercentBodyweight) {
          items = items.filter(e => e.equipment_category !== 'machine' && e.equipment_category !== 'barbell' && e.equipment_category !== 'dumbbell')
        }
        setAvailableExercises(items)
      })
      .catch(err => console.error(err))
      .finally(() => setExerciseSearchLoading(false))
  }, [showExerciseSearchModal, exerciseSearchQuery, hundredPercentBodyweight])

  // Diet State
  const [dietPref, setDietPref] = useState(draftData?.rawDietPref || 'None')
  const [calorieTarget, setCalorieTarget] = useState(draftData?.rawCalorieTarget || '2000')
  const [mealSlots, setMealSlots] = useState(draftData?.rawMealSlots || ['Breakfast', 'Lunch', 'Dinner', 'Snacks'])

  // Rehab State
  const [injury, setInjury] = useState(draftData?.rawInjury || '')
  const [rehabDays, setRehabDays] = useState(draftData?.rawRehabDays || ['Mon', 'Tue', 'Thu', 'Fri'])

  // UI State
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showSwitchModal, setShowSwitchModal] = useState(false)
  const [showValidationModal, setShowValidationModal] = useState(false)
  const [pendingType, setPendingType] = useState(null)

  // ── Derived Data ──
  const isDirty = name !== '' || startDate !== null || endDate !== null ||
    (type === 'workout' ? (equipment !== 'dumbbell' || workoutDays.length !== 3 || exerciseType !== 'weight_reps' || muscleGroup !== 'chest') :
      type === 'diet' ? (dietPref !== 'None' || calorieTarget !== '2000' || mealSlots.length !== 4) :
        (injury !== '' || rehabDays.length !== 4))

  const handleTypeSwitch = (newType) => {
    if (newType === type) return
    if (isDirty) {
      setPendingType(newType)
      setShowSwitchModal(true)
    } else {
      setType(newType)
      if (newType === 'workout') setLevel('Beginner')
      if (newType === 'diet') setLevel('General Health')
      if (newType === 'rehab') setLevel('Phase 1 (Pain Management)')
    }
  }
  const activeDays = type === 'workout' ? workoutDays : type === 'rehab' ? rehabDays : []
  const primaryColorClass = type === 'workout' ? 'workout-prim' : type === 'diet' ? 'meals-prim' : 'rehab-prim'
  const primaryColorHex = type === 'workout' ? 'bg-workout-prim' : type === 'diet' ? 'bg-meals-prim' : 'bg-rehab-prim'

  const getLevelFieldLabel = () => {
    if (type === 'diet') return 'Diet Focus'
    if (type === 'rehab') return 'Recovery Phase'
    return 'Workout Level'
  }

  const getLevelOptions = () => {
    if (type === 'diet') {
      return [
        { value: 'General Health', label: 'General Health & Nutrition' },
        { value: 'Weight Management', label: 'Weight Management (Loss/Gain)' },
        { value: 'Illness Management', label: 'Illness Management (e.g., Diabetes, Hypertension)' },
        { value: 'Athletic Performance', label: 'Athletic Performance & Muscle Building' }
      ]
    }
    if (type === 'rehab') {
      return [
        { value: 'Phase 1 (Pain Management)', label: 'Phase 1 (Acute Recovery & Pain Management)' },
        { value: 'Phase 2 (Mobility)', label: 'Phase 2 (Range of Motion & Mobility)' },
        { value: 'Phase 3 (Strengthening)', label: 'Phase 3 (Strengthening & Stability)' },
        { value: 'Phase 4 (Return to Sport)', label: 'Phase 4 (Functional Return to Activity)' }
      ]
    }
    return [
      { value: 'Beginner', label: 'Beginner' },
      { value: 'Intermediate', label: 'Intermediate' },
      { value: 'Advanced', label: 'Advanced' },
      { value: 'All Levels', label: 'All Levels' }
    ]
  }

  // Calculate duration in weeks purely for display purposes
  const durationWeeks = (startDate && endDate)
    ? Math.max(1, Math.round((endDate - startDate) / (1000 * 60 * 60 * 24 * 7)))
    : 0

  const handleSave = (status) => {
    if (!name.trim()) {
      setShowValidationModal(true)
      return
    }

    // Generate or preserve ID
    const planId = draftData?.id || (name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now())

    // Construct the payload
    const newPlan = {
      id: planId,
      name: name || 'Untitled Plan',
      defaultTab: type.charAt(0).toUpperCase() + type.slice(1),
      status: status, // 'draft' | 'active' | 'planned'
      dateRange: `${formatDateShort(startDate)} → ${formatDateShort(endDate)} · ${durationWeeks} weeks`,
      routines: type === 'workout' ? [
        {
          id: 'default-routine',
          name: 'Unified Workout Routine',
          exercises: routineExercises
        }
      ] : [],
      detail: type === 'diet'
        ? `Daily calorie target: ${calorieTarget} kcal / day · Goal: ${level}`
        : `Frequency: ${activeDays.length} days / week · Level: ${level}`,
      detailColor: type === 'workout' ? 'bg-workout-prim' : type === 'diet' ? 'bg-meals-prim' : 'bg-rehab-prim',
      progress: 0,
      progressMax: type === 'diet' ? durationWeeks * 7 : durationWeeks * activeDays.length,
      sessions: 0,
      sessionsMax: type === 'diet' ? durationWeeks * 7 : durationWeeks * activeDays.length,
      ctaLabel: type === 'diet' ? 'Log a meal' : type === 'rehab' ? 'View Protocol' : 'Log a workout',
      // Raw preservation:
      rawType: type,
      rawLevel: level,
      rawStartDate: startDate ? startDate.toISOString() : null,
      rawEndDate: endDate ? endDate.toISOString() : null,
      rawEquipment: equipment,
      rawWorkoutDays: workoutDays,
      rawExerciseType: exerciseType,
      rawMuscleGroup: muscleGroup,
      rawHundredPercentBodyweight: equipment === 'none',
      rawDietPref: dietPref,
      rawCalorieTarget: calorieTarget,
      rawMealSlots: mealSlots,
      rawInjury: injury,
      rawRehabDays: rehabDays,
    }

    // Save to localStorage
    const existing = localStorage.getItem('user_plans')
    let plans = existing ? JSON.parse(existing) : []
    // If updating an existing draft, remove the old instance
    if (draftData?.id) {
      plans = plans.filter(p => p.id !== draftData.id)
    }
    plans.push(newPlan)
    localStorage.setItem('user_plans', JSON.stringify(plans))

    // Navigate back to plans
    navigate('/plans')
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface-page animate-fade-in">

      {/* ── Header ── */}
      <div className="px-8 py-6 border-b border-border-primary flex items-center justify-between bg-surface-primary sticky top-0 z-20">
        <h1 className="text-heading-h5 font-bold text-text-headings">Create New Plan</h1>
        <div className="flex items-center gap-3">
          <Button variant="neutral" onClick={() => setShowCancelModal(true)} className="border border-border-primary bg-surface-primary text-text-body hover:bg-neutral-100 hidden sm:block">
            Cancel
          </Button>
          <Button variant="neutral" onClick={() => handleSave('draft')} className="border border-border-primary bg-surface-primary text-text-body hover:bg-neutral-100 hidden sm:block">
            Save as Draft
          </Button>
          <Button
            variant="primary"
            onClick={() => handleSave('planned')}
            className={cn("text-neutral-white", type === 'workout' ? 'bg-workout-prim hover:bg-workout-prim-600' : type === 'diet' ? 'bg-meals-prim hover:bg-meals-prim-600' : 'bg-rehab-prim hover:bg-rehab-prim-600')}
          >
            Save Plan
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row max-w-[1600px] w-full mx-auto">

        {/* ── Main Form Area ── */}
        <div className="flex-1 px-8 py-8 lg:p-12 overflow-y-auto">
          <div className="max-w-3xl flex flex-col gap-12">

            {/* Step 1: Type */}
            <section>
              <h2 className="text-heading-h6 font-bold text-text-headings mb-1">1. Choose Plan Type</h2>
              <p className="text-body-sm text-text-disabled mb-6">Select the core focus of your new plan. This determines the structure and features available.</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <TypeCard
                  type="workout" active={type === 'workout'} onClick={handleTypeSwitch}
                  icon={<IconWorkout />} title="Workout" desc="Build strength, endurance, or muscle."
                  activeClass="bg-workout-prim text-neutral-white border-workout-prim shadow-lg scale-[1.02]"
                />
                <TypeCard
                  type="diet" active={type === 'diet'} onClick={handleTypeSwitch}
                  icon={<IconDiet />} title="Diet" desc="Track meals, macros, and dietary goals."
                  activeClass="bg-meals-prim text-neutral-white border-meals-prim shadow-lg scale-[1.02]"
                />
                <TypeCard
                  type="rehab" active={type === 'rehab'} onClick={handleTypeSwitch}
                  icon={<IconRehab />} title="Rehab" desc="Targeted recovery and physical therapy."
                  activeClass="bg-rehab-prim text-neutral-white border-rehab-prim shadow-lg scale-[1.02]"
                />
              </div>
            </section>

            {/* Step 2: General Details */}
            <section>
              <h2 className="text-heading-h6 font-bold text-text-headings mb-1">2. Basic Information</h2>
              <p className="text-body-sm text-text-disabled mb-6">Set the generic parameters for your plan.</p>

              <div className="flex flex-col gap-6 p-6 bg-surface-primary rounded-2xl border border-border-primary">
                <Field id="planName" name="name" label="Plan Name" placeholder={`e.g., My Awesome ${type.charAt(0).toUpperCase() + type.slice(1)} Plan`} value={name} onChange={e => setName(e.target.value)} />

                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="flex-1">
                    <DatePicker id="startDate" label="Start Date" value={startDate} onChange={setStartDate} placeholder="Select start date" />
                  </div>
                  <div className="flex-1">
                    <DatePicker id="endDate" label="End Date" value={endDate} onChange={setEndDate} placeholder="Select end date" minDate={startDate || undefined} />
                  </div>
                </div>

                <DefinedField
                  id="level-select"
                  label={getLevelFieldLabel()}
                  value={level}
                  onChange={setLevel}
                  options={getLevelOptions()}
                />
              </div>
            </section>

            {/* Step 3: Type Specific */}
            <section className="animate-fade-in" key={type}>
              <h2 className="text-heading-h6 font-bold text-text-headings mb-1">3. Customize Structure</h2>
              <p className="text-body-sm text-text-disabled mb-6">Configure the specific modules for your {type} plan.</p>

              {/* WORKOUT SPECIFIC */}
              {type === 'workout' && (
                <div className="flex flex-col gap-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <DefinedField
                      id="workout-equipment"
                      label="Equipment Category"
                      value={equipment}
                      onChange={setEquipment}
                      options={EQUIPMENT_OPTIONS}
                    />

                    <DefinedField
                      id="workout-metric"
                      label="Exercise Metric / Type"
                      value={exerciseType}
                      onChange={setExerciseType}
                      options={EXERCISE_TYPE_OPTIONS}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <DefinedField
                      id="workout-muscle-focus"
                      label="Primary Muscle Group Focus"
                      value={muscleGroup}
                      onChange={setMuscleGroup}
                      options={MUSCLE_GROUP_OPTIONS}
                      className="sm:col-span-2"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-body-sm font-semibold text-text-headings">Preferred Workout Days</label>
                    <ToggleGroup options={DAYS} selected={workoutDays} onChange={setWorkoutDays} activeColor="bg-workout-prim" />
                  </div>

                  {/* Routine Builder */}
                  <div className="flex flex-col gap-4 mt-4">
                    <div className="flex justify-between items-center border-b border-border-primary pb-3">
                      <div>
                        <label className="text-body-sm font-bold text-text-headings">Workout Routine</label>
                        <p className="text-body-xs text-text-disabled mt-0.5">Customize the exercises included in this training program's central routine.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowExerciseSearchModal(true)}
                        className="text-body-xs font-bold text-workout-prim bg-workout-prim/10 hover:bg-workout-prim/20 px-4 py-2 rounded-xl transition-colors shrink-0"
                      >
                        + Add Exercise
                      </button>
                    </div>

                    {routineExercises.length > 0 ? (
                      <div className="flex flex-col gap-3">
                        {routineExercises.map((exercise, index) => (
                          <div key={index} className="flex items-center justify-between p-4 rounded-xl border border-border-primary bg-surface-primary hover:border-workout-prim transition-all shadow-sm">
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-full bg-workout-prim-100 text-workout-prim flex items-center justify-center font-bold text-body-xs">
                                {index + 1}
                              </span>
                              <span className="text-body-md font-bold text-text-headings">{typeof exercise === 'string' ? exercise : exercise.title}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setRoutineExercises(prev => prev.filter((_, i) => i !== index))}
                              className="text-text-disabled hover:text-text-error transition-colors p-1"
                              title="Remove Exercise"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center border-2 border-dashed border-border-primary rounded-2xl bg-neutral-50/50">
                        <p className="text-body-md font-semibold text-text-disabled mb-1">No Exercises Added Yet</p>
                        <p className="text-body-xs text-text-disabled mb-4">Click "Add Exercise" to select and build your custom workout routine.</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowExerciseSearchModal(true)}
                        >
                          Browse Exercise Database
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* DIET SPECIFIC */}
              {type === 'diet' && (
                <div className="flex flex-col gap-8">
                  <div className="flex flex-col sm:flex-row gap-6">
                    <DefinedField
                      id="diet-preference"
                      label="Dietary Preference"
                      value={dietPref}
                      onChange={setDietPref}
                      options={DIET_PREF_OPTIONS}
                      className="flex-1"
                    />
                    <div className="flex-1">
                      <Field id="calories" name="calories" label="Daily Calorie Target (kcal)" type="number" value={calorieTarget} onChange={e => setCalorieTarget(e.target.value)} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-body-sm font-semibold text-text-headings">Preferred Meal Slots</label>
                    <ToggleGroup options={MEAL_SLOTS} selected={mealSlots} onChange={setMealSlots} activeColor="bg-meals-prim" />
                  </div>

                  {/* Meal Blocks */}
                  {mealSlots.length > 0 && (
                    <div className="flex flex-col gap-3 mt-4">
                      <label className="text-body-sm font-semibold text-text-headings">Daily Structure</label>
                      {MEAL_SLOTS.filter(s => mealSlots.includes(s)).map(slot => (
                        <div key={slot} className="flex items-center gap-4 p-4 rounded-xl border border-border-primary bg-surface-primary">
                          <span className="w-20 text-body-sm font-bold text-meals-prim">{slot}</span>
                          <div className="flex-1 border-l border-border-primary pl-4">
                            <button className="text-body-sm font-semibold text-text-disabled border border-dashed border-border-primary rounded-lg px-4 py-2 w-full text-left hover:bg-neutral-100 transition-colors">
                              + Add Meal Option
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* REHAB SPECIFIC */}
              {type === 'rehab' && (
                <div className="flex flex-col gap-8">
                  <div className="flex flex-col gap-2">
                    <Field id="injury" name="injury" label="Target Injury / Area" placeholder="e.g., ACL Recovery, Lower Back Pain" value={injury} onChange={e => setInjury(e.target.value)} />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-body-sm font-semibold text-text-headings">Preferred Therapy Days</label>
                    <ToggleGroup options={DAYS} selected={rehabDays} onChange={setRehabDays} activeColor="bg-rehab-prim" />
                  </div>

                  {/* Day Blocks */}
                  {rehabDays.length > 0 && (
                    <div className="flex flex-col gap-3 mt-4">
                      <label className="text-body-sm font-semibold text-text-headings">Protocol Structure</label>
                      {DAYS.filter(d => rehabDays.includes(d)).map(day => (
                        <div key={day} className="flex items-center gap-4 p-4 rounded-xl border border-border-primary bg-surface-primary">
                          <span className="w-10 text-body-md font-bold text-rehab-prim">{day}</span>
                          <div className="flex-1 border-l border-border-primary pl-4">
                            <button className="text-body-sm font-semibold text-text-disabled border border-dashed border-border-primary rounded-lg px-4 py-2 w-full text-left hover:bg-neutral-100 transition-colors">
                              + Add Rehab Module
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>

          </div>
        </div>

        {/* ── Summary Sticky Sidebar ── */}
        <div className="w-full lg:w-[400px] border-t lg:border-t-0 lg:border-l border-border-primary bg-neutral-100 p-8 flex flex-col items-center">
          <div className="sticky top-28 w-full flex flex-col gap-6">
            <h2 className="text-heading-h6 font-bold text-text-headings text-center">My New Plan</h2>

            <div className={cn("w-full rounded-3xl overflow-hidden shadow-2xl transition-all duration-500", primaryColorHex)}>
              <div className="px-6 py-10 flex flex-col items-center justify-center text-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-neutral-white/20 flex items-center justify-center text-neutral-white mb-2">
                  {type === 'workout' ? <IconWorkout /> : type === 'diet' ? <IconDiet /> : <IconRehab />}
                </div>
                <h3 className="text-heading-h4 font-bold text-neutral-white leading-tight">
                  {name || 'Untitled Plan'}
                </h3>
                <p className="text-body-md text-neutral-white/80 font-medium bg-neutral-black/20 px-4 py-1.5 rounded-full">
                  {type.charAt(0).toUpperCase() + type.slice(1)} · {level}
                </p>
              </div>

              <div className="bg-surface-primary p-6 flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-border-primary pb-3">
                  <span className="text-body-sm text-text-disabled font-medium">Duration</span>
                  <span className="text-body-sm font-bold text-text-headings">{durationWeeks} weeks</span>
                </div>

                {type === 'workout' && (
                  <>
                    <div className="flex justify-between items-center border-b border-border-primary pb-3">
                      <span className="text-body-sm text-text-disabled font-medium">Frequency</span>
                      <span className="text-body-sm font-bold text-text-headings">{workoutDays.length} days / week</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-border-primary pb-3">
                      <span className="text-body-sm text-text-disabled font-medium">Equipment</span>
                      <span className="text-body-sm font-bold text-text-headings">{equipment === 'none' ? 'Bodyweight' : equipment}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-border-primary pb-3">
                      <span className="text-body-sm text-text-disabled font-medium">Muscle Focus</span>
                      <span className="text-body-sm font-bold text-text-headings">{muscleGroup}</span>
                    </div>
                    <div className="flex justify-between items-center pb-1">
                      <span className="text-body-sm text-text-disabled font-medium">Metric</span>
                      <span className="text-body-sm font-bold text-text-headings">{exerciseType === 'weight_reps' ? 'Weight & Reps' : exerciseType === 'reps_only' ? 'Reps Only' : 'Timed Duration'}</span>
                    </div>
                  </>
                )}

                {type === 'diet' && (
                  <>
                    <div className="flex justify-between items-center border-b border-border-primary pb-3">
                      <span className="text-body-sm text-text-disabled font-medium">Daily Target</span>
                      <span className="text-body-sm font-bold text-text-headings">{calorieTarget} kcal</span>
                    </div>
                    <div className="flex justify-between items-center pb-1">
                      <span className="text-body-sm text-text-disabled font-medium">Dietary Pref</span>
                      <span className="text-body-sm font-bold text-text-headings">{dietPref}</span>
                    </div>
                  </>
                )}

                {type === 'rehab' && (
                  <>
                    <div className="flex justify-between items-center border-b border-border-primary pb-3">
                      <span className="text-body-sm text-text-disabled font-medium">Frequency</span>
                      <span className="text-body-sm font-bold text-text-headings">{rehabDays.length} days / week</span>
                    </div>
                    <div className="flex justify-between items-center pb-1">
                      <span className="text-body-sm text-text-disabled font-medium">Target Area</span>
                      <span className="text-body-sm font-bold text-text-headings">{injury || 'Not specified'}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <p className="text-body-sm text-center text-text-disabled px-4 mt-2">
              Review your plan details. You can save it as a draft to finish later, or save the plan to make it active.
            </p>
          </div>
        </div>
      </div>

      <Modal
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={() => navigate('/plans')}
        title="Discard Plan?"
      >
        Are you sure you want to discard this plan? All your current settings will be lost.
      </Modal>

      <Modal
        open={showSwitchModal}
        onClose={() => setShowSwitchModal(false)}
        onConfirm={() => {
          setType(pendingType)
          setName('')
          setStartDate(null)
          setEndDate(null)
          if (pendingType === 'workout') setLevel('Beginner')
          if (pendingType === 'diet') setLevel('General Health')
          if (pendingType === 'rehab') setLevel('Phase 1 (Pain Management)')
          setEquipment('dumbbell')
          setWorkoutDays(['Mon', 'Wed', 'Fri'])
          setExerciseType('weight_reps')
          setMuscleGroup('chest')
          setDietPref('None')
          setCalorieTarget('2000')
          setMealSlots(['Breakfast', 'Lunch', 'Dinner'])
          setInjury('')
          setRehabDays(['Mon', 'Tue', 'Thu', 'Fri'])
          setShowSwitchModal(false)
        }}
        title="Discard Current Changes?"
      >
        You have unsaved changes in your {type} plan. Switching to {pendingType} will discard these changes. Would you like to discard them and switch?
      </Modal>

      <Modal
        open={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        cancelText="OK, I'll add a name"
        title="Missing Information"
      >
        Please give your plan a name before saving! We need it to help you identify it later.
      </Modal>

      {/* Exercise Search & Selection Modal */}
      {showExerciseSearchModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-black/50 backdrop-blur-xs" onClick={() => setShowExerciseSearchModal(false)} />
          <div className="relative bg-surface-primary rounded-3xl shadow-2xl w-full max-w-md flex flex-col max-h-[80vh] overflow-hidden border border-border-primary animate-scale-up">
            <div className="px-6 py-5 border-b border-border-primary flex justify-between items-center bg-surface-primary rounded-t-3xl">
              <div>
                <h3 className="text-heading-h6 font-bold text-text-headings">Add Exercises to Routine</h3>
                {hundredPercentBodyweight && (
                  <p className="text-[11px] font-semibold text-workout-prim mt-0.5">Filtering: Bodyweight Only</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowExerciseSearchModal(false)}
                className="text-text-disabled hover:text-text-headings transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            {/* Search bar inside modal */}
            <div className="p-4 border-b border-border-primary bg-neutral-50">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search exercises..."
                  value={exerciseSearchQuery}
                  onChange={e => setExerciseSearchQuery(e.target.value)}
                  className="w-full bg-surface-primary border border-border-primary rounded-xl pl-11 pr-4 py-2 text-body-md text-text-body focus:outline-none focus:border-workout-prim shadow-sm transition-all"
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-text-disabled absolute left-4 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
              {exerciseSearchLoading ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="w-8 h-8 rounded-full border-4 border-workout-prim border-t-transparent animate-spin mb-3" />
                  <p className="text-body-sm font-semibold text-text-disabled">Loading exercises...</p>
                </div>
              ) : availableExercises.length > 0 ? (
                availableExercises.map((ex) => {
                  const isAdded = routineExercises.includes(ex.title)
                  return (
                    <div
                      key={ex.id}
                      onClick={() => {
                        if (isAdded) {
                          setRoutineExercises(prev => prev.filter(title => title !== ex.title))
                        } else {
                          setRoutineExercises(prev => [...prev, ex.title])
                        }
                      }}
                      className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                        isAdded
                          ? 'border-workout-prim bg-workout-prim-50/10'
                          : 'border-border-primary bg-surface-primary hover:border-workout-prim/50'
                      }`}
                    >
                      <div className="flex flex-col gap-0.5 text-left">
                        <span className="text-body-sm font-bold text-text-headings">{ex.title}</span>
                        <span className="text-[11px] text-text-disabled capitalize">
                          {ex.muscle_group} · {ex.equipment_category}
                        </span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                        isAdded ? 'border-workout-prim bg-workout-prim text-neutral-white' : 'border-border-primary'
                      }`}>
                        {isAdded && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        )}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="py-12 text-center">
                  <p className="text-body-md font-semibold text-text-disabled">No matching exercises found.</p>
                  {hundredPercentBodyweight && (
                    <p className="text-body-xs text-text-disabled mt-1">Try disabling "Filter Bodyweight-Only Exercises" to see more equipment types.</p>
                  )}
                </div>
              )}
            </div>

            <div className="border-t border-border-primary px-6 py-4 flex bg-neutral-50 shrink-0 rounded-b-3xl">
              <Button
                type="button"
                variant="workout-primary"
                className="w-full shadow-md"
                onClick={() => setShowExerciseSearchModal(false)}
              >
                Done Adding ({routineExercises.length} selected)
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
