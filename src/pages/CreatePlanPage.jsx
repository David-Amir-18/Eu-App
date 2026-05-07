import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { cn } from '../components/utils.js'
import { Button } from '../components/atoms/Button.jsx'
import { Field } from '../components/atoms/Field.jsx'
import { DatePicker } from '../components/molecules/DatePicker.jsx'
import { DefinedField } from '../components/molecules/DefinedField.jsx'
import { getExercises } from '../api/exercisesService.js'
import { createWorkoutPlan, createRoutine, addExerciseToRoutine } from '../api/workoutsService.js'
import { getMeals, createMealPlan, addMealSlot } from '../api/mealPlansService.js'

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
const MEAL_SLOT_TYPES = ['breakfast', 'lunch', 'dinner', 'snack']
const MEAL_SLOT_LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snack' }
const DAY_TO_WEEK_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }

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
  { value: 'weight_loss',   label: 'Weight Loss' },
  { value: 'muscle_gain',  label: 'Muscle Gain' },
  { value: 'maintenance',  label: 'Maintenance' },
  { value: 'rehab',        label: 'Recovery / Rehab' },
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

function Modal({ open, onClose, onConfirm, title, confirmText = "Yes, discard", cancelText = "No, keep editing", zIndex = 'z-50', children }) {
  if (!open) return null
  const isTextContent = typeof children === 'string'
  return (
    <div className={`fixed inset-0 ${zIndex} flex items-center justify-center p-4`}>
      <div className="absolute inset-0 bg-neutral-black/50" onClick={onClose} />
      <div className="relative bg-surface-primary rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
        <h2 className="text-heading-h6 font-bold text-text-headings">{title}</h2>
        {isTextContent ? (
          <p className="text-body-md text-text-disabled">{children}</p>
        ) : (
          <div>{children}</div>
        )}
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
  const [routines, setRoutines] = useState(draftData?.rawRoutines || [])

  // Exercise selection states
  const [showExerciseSearchModal, setShowExerciseSearchModal] = useState(false)
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState('')
  const [availableExercises, setAvailableExercises] = useState([])
  const [exerciseSearchLoading, setExerciseSearchLoading] = useState(false)
  const [activeRoutineId, setActiveRoutineId] = useState(null)
  const [showRoutineModal, setShowRoutineModal] = useState(false)
  const [editingRoutineId, setEditingRoutineId] = useState(null)
  const [routineNameInput, setRoutineNameInput] = useState('')
  const [routineDescriptionInput, setRoutineDescriptionInput] = useState('')
  const [showAssignDaysModal, setShowAssignDaysModal] = useState(false)
  const [routineForDayAssign, setRoutineForDayAssign] = useState(null)
  const [showExerciseConfigModal, setShowExerciseConfigModal] = useState(false)
  const [pendingExercise, setPendingExercise] = useState(null)
  const [exerciseConfig, setExerciseConfig] = useState({ sets: '', reps: '', weight_kg: '', rest_time_seconds: '' })

  // Modal exercise filter state
  const [modalMuscleGroup, setModalMuscleGroup] = useState('all')
  const [modalExerciseType, setModalExerciseType] = useState('all')

  useEffect(() => {
    if (!showExerciseSearchModal || !activeRoutineId) return
    setExerciseSearchLoading(true)
    getExercises({
      page: 1,
      pageSize: 50,
      search: exerciseSearchQuery || undefined,
      equipmentCategory: hundredPercentBodyweight ? 'none' : undefined,
      exerciseType: modalExerciseType !== 'all' ? modalExerciseType : undefined,
      muscleGroup: modalMuscleGroup !== 'all' ? modalMuscleGroup : undefined,
    })
      .then((data) => {
        setAvailableExercises(data.items || [])
      })
      .catch(err => console.error(err))
      .finally(() => setExerciseSearchLoading(false))
  }, [showExerciseSearchModal, exerciseSearchQuery, hundredPercentBodyweight, activeRoutineId, modalMuscleGroup, modalExerciseType])

  // Meal search — fires whenever the modal is open or filters change
  useEffect(() => {
    if (!showMealSearchModal) return
    setMealSearchLoading(true)
    getMeals({
      page: mealSearchPage,
      pageSize: MEAL_PAGE_SIZE,
      search: mealSearchQuery || undefined,
      tag:    mealSearchTag   || undefined,
      maxCalories: mealSearchMaxCal ? parseInt(mealSearchMaxCal) : undefined,
    })
      .then(data => { setMealSearchResults(data.results || []); setMealSearchTotal(data.total || 0) })
      .catch(() => setMealSearchResults([]))
      .finally(() => setMealSearchLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showMealSearchModal, mealSearchQuery, mealSearchTag, mealSearchMaxCal, mealSearchPage])

  function openMealSearch(slotType) {
    setMealSearchSlot(slotType)
    setMealSearchQuery('')
    setMealSearchTag('')
    setMealSearchMaxCal('')
    setMealSearchPage(1)
    setMealSearchResults([])
    setShowMealSearchModal(true)
  }

  function selectMeal(meal) {
    setSelectedMealSlots(prev => ({ ...prev, [mealSearchSlot]: meal }))
    setShowMealSearchModal(false)
  }

  // Diet / Meal State
  const [dietPref, setDietPref] = useState(draftData?.rawDietPref || 'weight_loss')
  const [calorieTarget, setCalorieTarget] = useState(draftData?.rawCalorieTarget || '2000')
  // selectedMealSlots: { breakfast: MealListItem|null, lunch: ..., dinner: ..., snack: ... }
  const [selectedMealSlots, setSelectedMealSlots] = useState({ breakfast: null, lunch: null, dinner: null, snack: null })
  // Meal search modal state
  const [showMealSearchModal, setShowMealSearchModal] = useState(false)
  const [mealSearchSlot, setMealSearchSlot] = useState(null)   // which slot type is being filled
  const [mealSearchQuery, setMealSearchQuery] = useState('')
  const [mealSearchTag, setMealSearchTag] = useState('')
  const [mealSearchMaxCal, setMealSearchMaxCal] = useState('')
  const [mealSearchResults, setMealSearchResults] = useState([])
  const [mealSearchLoading, setMealSearchLoading] = useState(false)
  const [mealSearchPage, setMealSearchPage] = useState(1)
  const [mealSearchTotal, setMealSearchTotal] = useState(0)
  const MEAL_PAGE_SIZE = 20

  // Rehab State
  const [injury, setInjury] = useState(draftData?.rawInjury || '')
  const [rehabDays, setRehabDays] = useState(draftData?.rawRehabDays || ['Mon', 'Tue', 'Thu', 'Fri'])

  // UI State
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showSwitchModal, setShowSwitchModal] = useState(false)
  const [showValidationModal, setShowValidationModal] = useState(false)
  const [validationMessage, setValidationMessage] = useState('Please give your plan a name before saving! We need it to help you identify it later.')
  const [pendingType, setPendingType] = useState(null)

  // ── Derived Data ──
  const isDirty = name !== '' || startDate !== null || endDate !== null ||
    (type === 'workout' ? (equipment !== 'dumbbell' || workoutDays.length !== 3 || exerciseType !== 'weight_reps' || muscleGroup !== 'chest' || routines.length > 0) :
      type === 'diet' ? (dietPref !== 'weight_loss' || calorieTarget !== '2000' || Object.values(selectedMealSlots).some(Boolean)) :
        (injury !== '' || rehabDays.length !== 4))

  const activeRoutine = routines.find(r => r.id === activeRoutineId) || null

  const openCreateRoutineModal = () => {
    setEditingRoutineId(null)
    setRoutineNameInput('')
    setRoutineDescriptionInput('')
    setShowRoutineModal(true)
  }

  const openEditRoutineModal = (routine) => {
    setEditingRoutineId(routine.id)
    setRoutineNameInput(routine.name)
    setRoutineDescriptionInput(routine.description || '')
    setShowRoutineModal(true)
  }

  const saveRoutine = () => {
    const trimmedName = routineNameInput.trim()
    if (!trimmedName) return

    if (editingRoutineId) {
      setRoutines(prev => prev.map(r => (
        r.id === editingRoutineId
          ? { ...r, name: trimmedName, description: routineDescriptionInput.trim() || null }
          : r
      )))
    } else {
      setRoutines(prev => [
        ...prev,
        {
          id: `routine-${Date.now()}`,
          name: trimmedName,
          description: routineDescriptionInput.trim() || null,
          assignedDays: [],
          exercises: [],
        }
      ])
    }
    setShowRoutineModal(false)
  }

  const removeRoutine = (routineId) => {
    setRoutines(prev => prev.filter(r => r.id !== routineId))
    if (activeRoutineId === routineId) setActiveRoutineId(null)
  }

  const openAssignDays = (routineId) => {
    setRoutineForDayAssign(routineId)
    setShowAssignDaysModal(true)
  }

  const toggleRoutineDay = (day) => {
    if (!routineForDayAssign) return
    setRoutines(prev => {
      const target = prev.find(r => r.id === routineForDayAssign)
      const alreadyAssigned = target?.assignedDays?.includes(day)
      return prev.map(r => {
        if (r.id === routineForDayAssign) {
          return {
            ...r,
            assignedDays: alreadyAssigned
              ? r.assignedDays.filter(d => d !== day)
              : [...r.assignedDays, day]
          }
        }
        // Keep one routine per day by removing this day from others.
        return { ...r, assignedDays: r.assignedDays.filter(d => d !== day) }
      })
    })
  }

  const openExerciseSearchForRoutine = (routineId) => {
    setActiveRoutineId(routineId)
    setExerciseSearchQuery('')
    setModalMuscleGroup('all')
    setModalExerciseType('all')
    setShowExerciseSearchModal(true)
  }

  const openExerciseConfig = (exercise) => {
    setPendingExercise(exercise)
    setExerciseConfig({ sets: '', reps: '', weight_kg: '', rest_time_seconds: '' })
    setShowExerciseConfigModal(true)
  }

  const addExerciseToRoutine = () => {
    if (!pendingExercise || !activeRoutineId) return
    setRoutines(prev => prev.map(r => {
      if (r.id !== activeRoutineId) return r
      if (r.exercises.some(ex => ex.exercise_id === pendingExercise.id)) return r
      return {
        ...r,
        exercises: [
          ...r.exercises,
          {
            exercise_id: pendingExercise.id,
            title: pendingExercise.title,
            sets: exerciseConfig.sets ? Number(exerciseConfig.sets) : null,
            reps: exerciseConfig.reps ? Number(exerciseConfig.reps) : null,
            weight_kg: exerciseConfig.weight_kg ? Number(exerciseConfig.weight_kg) : null,
            rest_time_seconds: exerciseConfig.rest_time_seconds ? Number(exerciseConfig.rest_time_seconds) : null,
          }
        ]
      }
    }))
    setShowExerciseConfigModal(false)
    setPendingExercise(null)
  }

  const removeExerciseFromRoutine = (routineId, exerciseId) => {
    setRoutines(prev => prev.map(r => (
      r.id === routineId
        ? { ...r, exercises: r.exercises.filter(ex => ex.exercise_id !== exerciseId) }
        : r
    )))
  }

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

  const handleSave = async (status) => {
    if (!name.trim()) {
      setValidationMessage('Please give your plan a name before saving! We need it to help you identify it later.')
      setShowValidationModal(true)
      return
    }

    if (type === 'workout') {
      if (routines.length === 0) {
        setValidationMessage('Please create at least one routine before saving your workout plan.')
        setShowValidationModal(true)
        return
      }
      const hasAssignedSlots = routines.some(r => (r.assignedDays || []).length > 0)
      if (!hasAssignedSlots) {
        setValidationMessage('Assign at least one day to a routine before saving your workout plan.')
        setShowValidationModal(true)
        return
      }
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
      routines: type === 'workout'
        ? routines.map((r, idx) => ({
          id: `routine-${idx + 1}`,
          name: r.name,
          description: r.description || null,
          assignedDays: r.assignedDays || [],
          exercises: r.exercises.map(ex => ex.title),
        }))
        : [],
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
      rawRoutines: routines,
      rawDietPref: dietPref,
      rawCalorieTarget: calorieTarget,
      rawInjury: injury,
      rawRehabDays: rehabDays,
    }

    if (type === 'workout') {
      const difficultyMap = {
        Beginner: 'beginner',
        Intermediate: 'intermediate',
        Advanced: 'advanced',
        'All Levels': 'advanced',
      }
      try {
        // Step 1: Create the plan (metadata only)
        const createdPlan = await createWorkoutPlan({
          title: name.trim(),
          difficulty_level: difficultyMap[level] || 'beginner',
          schedule_type: 'weekly',
          description: `${exerciseType} focused ${muscleGroup} workout plan`,
          start_date: startDate ? startDate.toISOString().split('T')[0] : null,
          end_date: endDate ? endDate.toISOString().split('T')[0] : null,
        })

        // Step 2: Create each routine + its exercises
        for (const [routineIndex, routine] of routines.entries()) {
          const days = routine.assignedDays || []
          for (const day of days) {
            const createdRoutine = await createRoutine(createdPlan.id, {
              name: routine.name,
              description: routine.description || null,
              day_of_week: DAY_TO_WEEK_INDEX[day],
              position: routineIndex,
              is_rest_day: false,
            })
            // Step 3: Add exercises to the created routine
            for (const [pos, ex] of (routine.exercises || []).entries()) {
              await addExerciseToRoutine(createdRoutine.id, {
                exercise_id: ex.exercise_id,
                position: pos,
                sets: ex.sets ?? null,
                reps: ex.reps ?? null,
                weight_kg: ex.weight_kg ?? null,
                rest_time_seconds: ex.rest_time_seconds ?? null,
              })
            }
          }
        }

        // Step 4: Save minimal reference to localStorage and navigate to plan
        const existing = localStorage.getItem('user_plans')
        let plans = existing ? JSON.parse(existing) : []
        if (draftData?.id) plans = plans.filter(p => p.id !== draftData.id)
        plans.push({ ...newPlan, id: createdPlan.id, backendId: createdPlan.id })
        localStorage.setItem('user_plans', JSON.stringify(plans))
        navigate(`/plans/workout/${createdPlan.id}`)
        return
      } catch (error) {
        setValidationMessage(error.message || 'Failed to save workout plan to server.')
        setShowValidationModal(true)
        return
      }
    }

    if (type === 'diet') {
      try {
        // Step 1: Create the meal plan
        const createdPlan = await createMealPlan({
          title: name.trim(),
          description: `${dietPref} meal plan · ${calorieTarget} kcal/day`,
          goal_type: dietPref,
          start_date: startDate ? startDate.toISOString().split('T')[0] : null,
          end_date:   endDate   ? endDate.toISOString().split('T')[0]   : null,
        })
        // Step 2: Add each selected meal slot
        for (const [slotType, meal] of Object.entries(selectedMealSlots)) {
          if (!meal) continue
          await addMealSlot(createdPlan.id, { meal_id: meal.id, meal_type: slotType })
        }
        // Save reference and navigate
        const existing = localStorage.getItem('user_plans')
        let plans = existing ? JSON.parse(existing) : []
        if (draftData?.id) plans = plans.filter(p => p.id !== draftData.id)
        plans.push({ ...newPlan, id: createdPlan.id, backendId: createdPlan.id })
        localStorage.setItem('user_plans', JSON.stringify(plans))
        navigate('/plans')
        return
      } catch (error) {
        setValidationMessage(error.message || 'Failed to save meal plan to server.')
        setShowValidationModal(true)
        return
      }
    }

    // Save to localStorage (rehab / other)
    const existing = localStorage.getItem('user_plans')
    let plans = existing ? JSON.parse(existing) : []
    if (draftData?.id) plans = plans.filter(p => p.id !== draftData.id)
    plans.push(newPlan)
    localStorage.setItem('user_plans', JSON.stringify(plans))
    navigate('/plans')
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-surface-page animate-fade-in">

      {/* ── Header ── */}
      <div className="shrink-0 px-8 py-6 border-b border-border-primary flex items-center justify-between bg-surface-primary sticky top-0 z-20">
        <h1 className="text-heading-h5 font-bold text-text-headings">Create New Plan</h1>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setShowCancelModal(true)} className="hidden sm:block">
            Cancel
          </Button>
          <Button variant="outline" onClick={() => handleSave('draft')} className="hidden sm:block">
            Save as Draft
          </Button>
          <Button
            variant={type === 'workout' ? 'workout-primary' : type === 'diet' ? 'meals-primary' : 'rehab-primary'}
            onClick={() => handleSave('planned')}
          >
            Save Plan
          </Button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0 overflow-hidden w-full">

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
                        <label className="text-body-sm font-bold text-text-headings">Workout Routines</label>
                        <p className="text-body-sm text-text-disabled mt-0.5">Create routines, assign each one to week days, then add exercises per routine.</p>
                      </div>
                      <button
                        type="button"
                        onClick={openCreateRoutineModal}
                        className="text-body-xs font-bold text-workout-prim bg-workout-prim/10 hover:bg-workout-prim/20 px-4 py-2 rounded-xl transition-colors shrink-0"
                      >
                        + Create Routine
                      </button>
                    </div>

                    {routines.length > 0 ? (
                      <div className="flex flex-col gap-3">
                        {routines.map((routine) => (
                          <div key={routine.id} className="p-4 rounded-2xl border border-border-primary bg-surface-primary shadow-sm flex flex-col gap-3">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <h4 className="text-body-md font-bold text-text-headings">{routine.name}</h4>
                                <p className="text-body-sm text-text-disabled">
                                  {(routine.assignedDays || []).length} assigned day(s) · {(routine.exercises || []).length} exercise(s)
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button type="button" variant="ghost" size="sm" onClick={() => openEditRoutineModal(routine)}>Edit</Button>
                                <Button type="button" variant="ghost" size="sm" onClick={() => removeRoutine(routine.id)} className="text-text-error">Delete</Button>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {(routine.assignedDays || []).length > 0 ? (
                                routine.assignedDays.map(day => (
                                  <span key={day} className="px-2.5 py-1 rounded-lg text-body-sm font-semibold bg-workout-prim-100 text-workout-prim">{day}</span>
                                ))
                              ) : (
                                <span className="text-body-sm text-text-disabled">No days assigned yet.</span>
                              )}
                            </div>

                            {(routine.exercises || []).length > 0 && (
                              <div className="flex flex-col gap-2">
                                {routine.exercises.map((ex, index) => (
                                  <div key={ex.exercise_id} className="flex items-center justify-between px-3 py-2 rounded-xl bg-surface-primary border border-border-primary">
                                    <span className="text-body-sm font-semibold text-text-headings">{index + 1}. {ex.title}</span>
                                    <button
                                      type="button"
                                      onClick={() => removeExerciseFromRoutine(routine.id, ex.exercise_id)}
                                      className="text-text-disabled hover:text-text-error transition-colors p-1"
                                      title="Remove Exercise"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="flex flex-wrap gap-2">
                              <Button type="button" variant="workout-outline" size="sm" onClick={() => openAssignDays(routine.id)}>Assign Week Days</Button>
                              <Button type="button" variant="workout-primary" size="sm" onClick={() => openExerciseSearchForRoutine(routine.id)}>Add Exercises</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center border-2 border-dashed border-border-primary rounded-2xl bg-neutral-100">
                        <p className="text-body-md font-semibold text-text-disabled mb-1">No Routines Added Yet</p>
                        <p className="text-body-xs text-text-disabled mb-4">Create your first routine, assign it to days, then add exercises to it.</p>
                        <Button type="button" variant="workout-outline" size="sm" onClick={openCreateRoutineModal}>
                          Create First Routine
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
                      id="diet-goal"
                      label="Goal Type"
                      value={dietPref}
                      onChange={setDietPref}
                      options={DIET_PREF_OPTIONS}
                      className="flex-1"
                    />
                    <div className="flex-1">
                      <Field id="calories" name="calories" label="Daily Calorie Target (kcal)" type="number" value={calorieTarget} onChange={e => setCalorieTarget(e.target.value)} />
                    </div>
                  </div>

                  {/* Meal slot pickers */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b border-border-primary pb-3">
                      <div>
                        <label className="text-body-sm font-bold text-text-headings">Daily Meal Slots</label>
                        <p className="text-body-sm text-text-disabled mt-0.5">Pick one meal per slot from the library. All slots are optional.</p>
                      </div>
                    </div>
                    {MEAL_SLOT_TYPES.map(slotType => {
                      const meal = selectedMealSlots[slotType]
                      return (
                        <div key={slotType} className="flex items-center gap-4 p-4 rounded-xl border border-border-primary bg-surface-primary transition-all hover:border-meals-prim">
                          <span className="w-24 shrink-0 text-body-sm font-bold text-meals-prim capitalize">{MEAL_SLOT_LABELS[slotType]}</span>
                          <div className="flex-1 border-l border-border-primary pl-4">
                            {meal ? (
                              <div className="flex items-center gap-3">
                                {meal.image_url && (
                                  <img src={meal.image_url} alt={meal.title} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-body-sm font-bold text-text-headings truncate">{meal.title}</p>
                                  <p className="text-body-sm text-text-disabled">
                                    {meal.nutrition?.calories_cal ? `${meal.nutrition.calories_cal} kcal` : ''}
                                    {meal.nutrition?.protein_g ? ` · ${meal.nutrition.protein_g}g protein` : ''}
                                  </p>
                                </div>
                                <button type="button" onClick={() => setSelectedMealSlots(p => ({ ...p, [slotType]: null }))}
                                  className="text-text-disabled hover:text-text-error transition-colors shrink-0 p-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                </button>
                              </div>
                            ) : (
                              <button type="button" onClick={() => openMealSearch(slotType)}
                                className="text-body-sm font-semibold text-text-disabled border border-dashed border-border-primary rounded-lg px-4 py-2 w-full text-left hover:bg-neutral-100 hover:text-meals-prim hover:border-meals-prim transition-colors">
                                + Choose a meal…
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
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
        <div className="shrink-0 w-full lg:w-[400px] border-l border-border-primary bg-neutral-100 overflow-y-auto">
          <div className="p-8 flex flex-col gap-6">
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
                    <div className="flex justify-between items-center border-b border-border-primary pb-3">
                      <span className="text-body-sm text-text-disabled font-medium">Goal</span>
                      <span className="text-body-sm font-bold text-text-headings capitalize">{dietPref.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between items-center pb-1">
                      <span className="text-body-sm text-text-disabled font-medium">Meals Assigned</span>
                      <span className="text-body-sm font-bold text-text-headings">
                        {Object.values(selectedMealSlots).filter(Boolean).length} / {MEAL_SLOT_TYPES.length}
                      </span>
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
          setRoutines([])
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
        {validationMessage}
      </Modal>

      <Modal
        open={showRoutineModal}
        onClose={() => setShowRoutineModal(false)}
        onConfirm={saveRoutine}
        confirmText={editingRoutineId ? 'Save Routine' : 'Create Routine'}
        cancelText="Cancel"
        title={editingRoutineId ? 'Edit Routine' : 'Create Routine'}
      >
        <div className="flex flex-col gap-4">
          <Field
            id="routine-name-input"
            name="routineName"
            label="Routine Name"
            placeholder="e.g., Push Day"
            value={routineNameInput}
            onChange={(e) => setRoutineNameInput(e.target.value)}
          />
          <Field
            id="routine-desc-input"
            name="routineDescription"
            label="Description (optional)"
            placeholder="Short description..."
            value={routineDescriptionInput}
            onChange={(e) => setRoutineDescriptionInput(e.target.value)}
          />
        </div>
      </Modal>

      <Modal
        open={showAssignDaysModal}
        onClose={() => setShowAssignDaysModal(false)}
        onConfirm={() => setShowAssignDaysModal(false)}
        confirmText="Done"
        cancelText="Cancel"
        title="Assign Routine Days"
      >
        <div className="flex flex-col gap-3">
          <p className="text-body-sm text-text-disabled">
            Select which training days should run this routine. A day can only be assigned to one routine.
          </p>
          <div className="flex flex-wrap gap-2">
            {workoutDays.map((day) => {
              const selected = routines.find(r => r.id === routineForDayAssign)?.assignedDays?.includes(day)
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleRoutineDay(day)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-body-sm font-semibold transition-colors border',
                    selected
                      ? 'bg-workout-prim text-neutral-white border-transparent'
                      : 'bg-surface-primary border-border-primary text-text-body hover:border-neutral-400'
                  )}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>
      </Modal>

      {/* Exercise Search & Selection Modal */}
      {showExerciseSearchModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-black/50 backdrop-blur-xs" onClick={() => setShowExerciseSearchModal(false)} />
          <div className="relative bg-surface-primary rounded-3xl shadow-2xl w-full max-w-md flex flex-col max-h-[80vh] overflow-hidden border border-border-primary animate-scale-up">
            <div className="px-6 py-5 border-b border-border-primary flex justify-between items-center bg-surface-primary rounded-t-3xl">
              <div>
                <h3 className="text-heading-h6 font-bold text-text-headings">Add Exercises to Routine</h3>
                <p className="text-[11px] font-semibold text-text-disabled mt-0.5">
                  Routine: {activeRoutine?.name || '—'}
                </p>
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
            <div className="p-4 border-b border-border-primary bg-surface-primary">
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

            {/* Muscle group + exercise type filters */}
            <div className="px-4 py-3 border-b border-border-primary bg-neutral-100 flex flex-col gap-2">
              <div className="flex flex-wrap gap-1.5">
                {MUSCLE_GROUP_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setModalMuscleGroup(opt.value)}
                    className={cn(
                      'px-2.5 py-0.5 rounded-round text-body-sm font-semibold border transition-all',
                      modalMuscleGroup === opt.value
                        ? 'bg-workout-prim text-neutral-white border-transparent'
                        : 'bg-surface-primary text-text-disabled border-border-primary hover:border-workout-prim hover:text-workout-prim'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {EXERCISE_TYPE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setModalExerciseType(opt.value)}
                    className={cn(
                      'px-2.5 py-0.5 rounded-round text-body-sm font-semibold border transition-all',
                      modalExerciseType === opt.value
                        ? 'bg-workout-prim-500 text-neutral-white border-transparent'
                        : 'bg-surface-primary text-text-disabled border-border-primary hover:border-workout-prim hover:text-workout-prim'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
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
                  const isAdded = (activeRoutine?.exercises || []).some(item => item.exercise_id === ex.id)
                  return (
                    <div
                      key={ex.id}
                      onClick={() => {
                        if (!isAdded) openExerciseConfig(ex)
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

            <div className="border-t border-border-primary px-6 py-4 flex bg-surface-primary shrink-0 rounded-b-3xl">
              <Button
                type="button"
                variant="workout-primary"
                className="w-full shadow-md"
                onClick={() => setShowExerciseSearchModal(false)}
              >
                Done Adding ({(activeRoutine?.exercises || []).length} selected)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Exercise Config Modal — z-[200] sits above the exercise search modal (z-[100]) */}
      <Modal
        open={showExerciseConfigModal}
        onClose={() => setShowExerciseConfigModal(false)}
        onConfirm={addExerciseToRoutine}
        confirmText="Add Exercise"
        cancelText="Cancel"
        title={`Configure ${pendingExercise?.title || 'Exercise'}`}
        zIndex="z-[200]"
      >
        <div className="grid grid-cols-2 gap-3">
          <Field id="sets-input" name="sets" label="Sets" type="number" value={exerciseConfig.sets} onChange={(e) => setExerciseConfig(prev => ({ ...prev, sets: e.target.value }))} />
          <Field id="reps-input" name="reps" label="Reps" type="number" value={exerciseConfig.reps} onChange={(e) => setExerciseConfig(prev => ({ ...prev, reps: e.target.value }))} />
          <Field id="weight-input" name="weight" label="Weight (kg)" type="number" value={exerciseConfig.weight_kg} onChange={(e) => setExerciseConfig(prev => ({ ...prev, weight_kg: e.target.value }))} />
          <Field id="rest-input" name="rest" label="Rest (seconds)" type="number" value={exerciseConfig.rest_time_seconds} onChange={(e) => setExerciseConfig(prev => ({ ...prev, rest_time_seconds: e.target.value }))} />
        </div>
      </Modal>

    </div>
  )
}
