import { useState, useEffect } from 'react'
import { Button } from '../components/atoms/Button.jsx'
import { cn } from '../components/utils.js'
import { DefinedField } from '../components/molecules/DefinedField.jsx'


const EXERCISE_DATABASE = [
  {
    id: "4F5866F8",
    title: "Back Extension (Hyperextension)",
    muscle_group: "lower_back",
    other_muscles: ["hamstrings", "glutes"],
    exercise_type: "reps_only",
    equipment_category: "machine",
    url: "https://d2l9nsnmtah87f.cloudfront.net/exercise-assets/18601201-Hyperextension-(VERSION-2)_Hips.mp4",
    media_type: "video",
    manual_tag: "hyper extension",
    thumbnail_url: "https://d2l9nsnmtah87f.cloudfront.net/exercise-thumbnails/18601201-Hyperextension-(VERSION-2)_Hips_thumbnail@3x.jpg",
    is_custom: false,
    is_archived: false,
    hundred_percent_bodyweight_exercise: false,
    instructions: "1. Set yourself up on a back extension machine. Have your hips and thighs against the pad and your ankles locked on the foot brace.\n2. Engage your abs, cross your arms in front of your chest, and take a breath.\n3. Lower yourself by bending at the hips and move down until you feel a stretch in your hamstrings and glutes.\n4. Engage your buttocks and lower back to raise your torso to the top position, pausing for a moment and exhaling."
  },
  {
    id: "79D0BB3A",
    title: "Bench Press (Barbell)",
    muscle_group: "chest",
    other_muscles: ["triceps", "shoulders"],
    exercise_type: "weight_reps",
    equipment_category: "barbell",
    url: "https://d2l9nsnmtah87f.cloudfront.net/exercise-assets/00251201-Barbell-Bench-Press_Chest.mp4",
    media_type: "video",
    manual_tag: "chest bb",
    thumbnail_url: "https://d2l9nsnmtah87f.cloudfront.net/exercise-thumbnails/00251201-Barbell-Bench-Press_Chest_thumbnail@3x.jpg",
    is_custom: false,
    is_archived: false,
    hundred_percent_bodyweight_exercise: false,
    instructions: "1. Lie on the bench.\n2. Extend your arms and grab the bar evenly, having your hands slightly wider than shoulder-width apart.\n3. Bring your shoulder blades back and dig them into the bench.\n4. Arch your lower back and plant your feet flat on the floor.\n5. Take a breath, unrack the bar, and bring it over your chest.\n6. Inhale again and lower the barbell to your lower chest, tapping it slightly. \n7. Hold for a moment and press the bar until your elbows are straight. Exhale."
  },
  {
    id: "55E6546F",
    title: "Bent Over Row (Barbell)",
    muscle_group: "upper_back",
    other_muscles: ["lats", "biceps", "forearms"],
    exercise_type: "weight_reps",
    equipment_category: "barbell",
    url: "https://d2l9nsnmtah87f.cloudfront.net/exercise-assets/00271201-Barbell-Bent-Over-Row_Back.mp4",
    media_type: "video",
    manual_tag: "bb",
    thumbnail_url: "https://d2l9nsnmtah87f.cloudfront.net/exercise-thumbnails/00271201-Barbell-Bent-Over-Row_Back_thumbnail@3x.jpg",
    is_custom: false,
    is_archived: false,
    hundred_percent_bodyweight_exercise: false,
    instructions: "1. Stand in front of a loaded barbell with your feet in a comfortable stance and toes pointing slightly out.\n2. Lean forward by hinging at the hip and keep your spine in a neutral position.\n3. Grab the barbell with an even overhand grip.\n4. Engage your abs and lift the bar several inches off the floor.\n5. With your shoulders back and midsection tight, take a breath and row the barbell.\n6. Lift the bar until it taps your stomach and hold the position for a moment as you exhale.\n7. Lower the bar slowly."
  },
  {
    id: "A5AC6449",
    title: "Bicep Curl (Barbell)",
    muscle_group: "biceps",
    other_muscles: [],
    exercise_type: "weight_reps",
    equipment_category: "barbell",
    url: "https://d2l9nsnmtah87f.cloudfront.net/exercise-assets/00311201-Barbell-Curl_Upper-Arms.mp4",
    media_type: "video",
    manual_tag: "curls biceps standing bb",
    thumbnail_url: "https://d2l9nsnmtah87f.cloudfront.net/exercise-thumbnails/00311201-Barbell-Curl_Upper-Arms_thumbnail@3x.jpg",
    is_custom: false,
    is_archived: false,
    hundred_percent_bodyweight_exercise: false,
    instructions: "1. Pick the bar up and hold it with a grip slightly wider than your hips. Your arms should be straight, with your palms facing forward.\n2. Straighten your back, bring your chest out, take a breath, and curl the barbell, exhaling at the top. Don’t use body swinging and momentum to lift the bar; only your bicep strength.\n3. Lower the bar slowly as you breathe in, extending your arms and stretching your biceps.\n4. Repeat."
  }
]

const ANATOMICAL_REGIONS = [
  { id: 'all', label: 'All Muscles' },
  { id: 'chest_shoulders', label: 'Chest & Shoulders', subMuscles: ['chest', 'shoulders'] },
  { id: 'back_core', label: 'Back & Core', subMuscles: ['lower_back', 'upper_back', 'lats', 'abs', 'obliques'] },
  { id: 'arms', label: 'Arms', subMuscles: ['biceps', 'triceps', 'forearms'] },
  { id: 'legs', label: 'Legs', subMuscles: ['hamstrings', 'glutes', 'quadriceps', 'calves'] }
]
const EQUIPMENT_OPTIONS = [
  { value: 'all', label: 'All Equipment' },
  { value: 'machine', label: 'Machine' },
  { value: 'barbell', label: 'Barbell' }
]

export default function WorkoutsPage() {
  const [activeRegion, setActiveRegion] = useState('all')
  const [activeEquipment, setActiveEquipment] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedExercise, setSelectedExercise] = useState(null)

  // Plans / Add-to-Plan State
  const [userPlans, setUserPlans] = useState([])
  const [showAddToPlanModal, setShowAddToPlanModal] = useState(false)
  const [exerciseToAddToPlan, setExerciseToAddToPlan] = useState(null)
  const [targetPlanId, setTargetPlanId] = useState('')
  const [targetRoutineId, setTargetRoutineId] = useState('')
  const [toastMessage, setToastMessage] = useState('')

  // Load plans on component mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('user_plans')
      const parsed = stored ? JSON.parse(stored) : []
      // Filter Workout plans
      const workoutPlans = parsed.filter(p => p.defaultTab === 'Workout')
      setUserPlans(workoutPlans)
      if (workoutPlans.length > 0) {
        setTargetPlanId(workoutPlans[0].id)
        // Set default routine/slot
        const activeDays = workoutPlans[0].rawWorkoutDays || ['Mon', 'Wed', 'Fri']
        setTargetRoutineId(activeDays[0])
      }
    } catch (e) {
      console.error(e)
    }
  }, [])

  // Dynamic routine target updating when plan selection changes
  const handlePlanChange = (planId) => {
    setTargetPlanId(planId)
    const selectedPlan = userPlans.find(p => p.id === planId)
    if (selectedPlan) {
      const activeDays = selectedPlan.rawWorkoutDays || ['Mon', 'Wed', 'Fri']
      setTargetRoutineId(activeDays[0])
    }
  }

  // Filtered Exercises based on Anatomical Region + Equipment Category + Search query
  const filteredExercises = EXERCISE_DATABASE.filter(ex => {
    const region = ANATOMICAL_REGIONS.find(r => r.id === activeRegion)
    const matchesMuscle = activeRegion === 'all' || (region && region.subMuscles.includes(ex.muscle_group))
    const matchesEquipment = activeEquipment === 'all' || ex.equipment_category === activeEquipment
    const matchesSearch = ex.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ex.manual_tag && ex.manual_tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesMuscle && matchesEquipment && matchesSearch
  })

  // Add exercise to selected Workout Plan & Routine in LocalStorage
  const handleAddExerciseToPlan = () => {
    if (!targetPlanId || !targetRoutineId || !exerciseToAddToPlan) return

    try {
      const stored = localStorage.getItem('user_plans')
      const parsed = stored ? JSON.parse(stored) : []

      const updatedPlans = parsed.map(plan => {
        if (plan.id === targetPlanId) {
          // Initialize routines / structure if it doesn't exist
          if (!plan.routines) {
            const activeDays = plan.rawWorkoutDays || ['Mon', 'Wed', 'Fri']
            plan.routines = activeDays.map(day => ({
              id: day.toLowerCase(),
              name: day,
              exercises: []
            }))
          }

          // Add exercise name/title to specified day's exercises
          plan.routines = plan.routines.map(r => {
            if (r.name.toLowerCase() === targetRoutineId.toLowerCase()) {
              const exists = r.exercises.includes(exerciseToAddToPlan.title)
              if (!exists) {
                r.exercises.push(exerciseToAddToPlan.title)
              }
            }
            return r
          })
        }
        return plan
      })

      localStorage.setItem('user_plans', JSON.stringify(updatedPlans))

      // Show success toast
      const planName = userPlans.find(p => p.id === targetPlanId)?.name || 'Plan'
      setToastMessage(`"${exerciseToAddToPlan.title}" added to ${targetRoutineId} in "${planName}"!`)
      setShowAddToPlanModal(false)

      // Clear toast after 3 seconds
      setTimeout(() => setToastMessage(''), 3000)
    } catch (e) {
      console.error(e)
    }
  }

  // Parse instruction list lines helper
  const getInstructionSteps = (inst) => {
    if (typeof inst === 'string') {
      return inst.split('\n').map(line => line.replace(/^\d+\.\s*/, ''))
    }
    return inst || []
  }

  return (
    <div className="flex flex-col min-h-screen bg-neutral-100 relative">

      {/* Toast Alert Notification */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-workout-prim text-neutral-white px-6 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-slide-down border border-workout-prim-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          <span className="text-body-md font-bold">{toastMessage}</span>
        </div>
      )}

      {/* ── Header Area ── */}
      <div className="bg-surface-primary border-b border-border-primary pt-12 pb-8 px-8 md:px-12 relative overflow-hidden animate-fade-in">
        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-workout-prim/10 rounded-full opacity-30 blur-3xl" />
        <div className="absolute bottom-[-50px] left-[10%] w-48 h-48 bg-workout-prim-100/20 rounded-full opacity-25 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-heading-h3 font-bold text-text-headings">All Workouts</h1>
            <p className="text-body-lg text-text-disabled max-w-xl">
              Browse professional exercises, view full targeted muscle diagrams, and dynamically add movements to your custom programs.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-stretch w-full md:w-auto">
            {/* Search Input */}
            <div className="relative w-full md:w-64 shrink-0">
              <input
                type="text"
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-surface-primary border border-border-primary rounded-xl pl-11 pr-4 py-2.5 text-body-md text-text-body focus:outline-none focus:border-workout-prim shadow-sm transition-all"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-text-disabled absolute left-4 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            </div>

            {/* Equipment Dropdown */}
            <div className="w-full sm:w-48 shrink-0">
              <DefinedField
                id="equipment-dropdown-filter"
                label=""
                value={activeEquipment}
                onChange={setActiveEquipment}
                options={EQUIPMENT_OPTIONS}
                className="[&>label]:hidden"
              />
            </div>
          </div>
        </div>

        {/* Muscle Filter Tabs */}
        <div className="flex flex-wrap gap-2 mt-8 bg-neutral-100 p-1.5 rounded-xl border border-border-primary w-fit relative z-10">
          {ANATOMICAL_REGIONS.map(region => (
            <button
              key={region.id}
              onClick={() => setActiveRegion(region.id)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-body-sm font-semibold transition-all",
                activeRegion === region.id
                  ? "bg-surface-primary text-workout-prim shadow-sm border border-border-primary"
                  : "text-text-disabled hover:text-text-headings"
              )}
            >
              {region.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid List Content ── */}
      <div className="flex-1 overflow-auto px-8 py-8 md:px-12 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        {filteredExercises.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredExercises.map(ex => (
              <div
                key={ex.id}
                className="group flex flex-col rounded-2xl border border-border-primary bg-surface-primary overflow-hidden shadow-sm hover:shadow-lg hover:scale-[1.01] transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedExercise(ex)}
              >
                {/* Exercise Cover Photo */}
                <div className="relative h-44 overflow-hidden shrink-0 bg-neutral-900">
                  <img src={ex.thumbnail_url} alt={ex.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-black/60 to-transparent" />
                  <span className="absolute top-3 right-3 bg-workout-prim-100 text-workout-prim text-body-xs font-bold px-2.5 py-1 rounded-round shadow-sm capitalize">
                    {ex.equipment_category}
                  </span>
                  {ex.media_type === 'video' && (
                    <span className="absolute bottom-3 right-3 bg-neutral-black/75 text-neutral-white p-1.5 rounded-full shadow">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 fill-current" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                    </span>
                  )}
                </div>

                {/* Card Info */}
                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-body-lg font-bold text-text-headings leading-snug truncate" title={ex.title}>
                      {ex.title}
                    </h3>
                    <p className="text-body-xs text-text-disabled capitalize">
                      Primary: {ex.muscle_group.replace('_', ' ')}
                    </p>
                  </div>

                  {/* Muscles row tags */}
                  <div className="flex flex-wrap gap-1 min-h-12 items-center">
                    <span className="text-[10px] bg-neutral-100 border border-border-primary text-text-body font-semibold px-2 py-0.5 rounded-md capitalize">
                      {ex.muscle_group.replace('_', ' ')}
                    </span>
                    {ex.other_muscles.map(m => (
                      <span key={m} className="text-[10px] bg-neutral-50 border border-border-primary text-text-disabled font-medium px-2 py-0.5 rounded-md capitalize">
                        {m}
                      </span>
                    ))}
                  </div>

                  {/* Add to Plan Button */}
                  <Button
                    variant="workout-primary"
                    size="sm"
                    className="w-full font-bold shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation() // Prevent opening detail modal
                      setExerciseToAddToPlan(ex)
                      setShowAddToPlanModal(true)
                    }}
                  >
                    + Add to Plan
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center border border-border-primary border-dashed rounded-2xl bg-surface-primary opacity-80 max-w-xl mx-auto">
            <p className="text-body-lg font-semibold text-text-disabled mb-2">No exercises found matching your criteria.</p>
            <p className="text-body-md text-text-disabled">Try resetting the muscle group, changing equipment filters, or searching another keyword.</p>
          </div>
        )}
      </div>

      {/* ── Exercise Detail Modal ── */}
      {selectedExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-black/50 backdrop-blur-xs" onClick={() => setSelectedExercise(null)} />
          <div className="relative bg-surface-primary rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up border border-border-primary">

            {/* Header / Video Banner */}
            <div className="relative h-72 shrink-0 overflow-hidden bg-neutral-900">
              {selectedExercise.url ? (
                <video
                  src={selectedExercise.url}
                  poster={selectedExercise.thumbnail_url}
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                  className="w-full h-full object-cover"
                />
              ) : (
                <img src={selectedExercise.thumbnail_url} alt={selectedExercise.title} className="w-full h-full object-cover" />
              )}
              <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-neutral-black/60 to-transparent p-4 flex justify-between items-center z-10 pointer-events-none">
                <span className="bg-workout-prim text-neutral-white text-body-xs font-bold px-3 py-1 rounded-full shadow-md uppercase tracking-wide capitalize pointer-events-auto">
                  {selectedExercise.equipment_category}
                </span>
                <button
                  onClick={() => setSelectedExercise(null)}
                  className="bg-neutral-black/40 hover:bg-neutral-black/60 text-neutral-white p-2 rounded-full transition-colors pointer-events-auto shadow"
                  aria-label="Close"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-6">
              <div>
                <h2 className="text-heading-h4 font-bold text-text-headings leading-tight">{selectedExercise.title}</h2>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <span className="text-body-sm font-semibold bg-workout-prim-100 text-workout-prim px-3 py-1 rounded-lg capitalize">
                    Primary: {selectedExercise.muscle_group.replace('_', ' ')}
                  </span>
                  <span className="text-body-sm font-semibold bg-neutral-100 text-text-body px-3 py-1 rounded-lg capitalize">
                    {selectedExercise.exercise_type.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Muscles Targeted */}
              <div className="flex flex-col gap-3 border-t border-border-primary pt-5">
                <h3 className="text-body-md font-bold text-text-headings">Targeted Muscles</h3>
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-workout-prim-100 text-workout-prim rounded-xl text-body-sm font-semibold capitalize border border-workout-prim-100">
                    <span className="w-2 h-2 rounded-full bg-workout-prim shrink-0" />
                    Primary: {selectedExercise.muscle_group.replace('_', ' ')}
                  </div>
                  {selectedExercise.other_muscles.map(m => (
                    <div key={m} className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 text-text-disabled rounded-xl text-body-sm font-medium capitalize border border-border-primary">
                      <span className="w-2 h-2 rounded-full bg-neutral-400 shrink-0" />
                      Secondary: {m}
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions steps */}
              <div className="flex flex-col gap-3 border-t border-border-primary pt-5">
                <h3 className="text-body-md font-bold text-text-headings">Execution Steps</h3>
                <ol className="flex flex-col gap-3.5">
                  {getInstructionSteps(selectedExercise.instructions).map((step, idx) => (
                    <li key={idx} className="flex gap-4 text-body-md text-text-body items-start">
                      <span className="w-6 h-6 rounded-full bg-workout-prim-100 text-workout-prim flex items-center justify-center shrink-0 font-bold text-body-sm mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="flex-1 pt-0.5 leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="border-t border-border-primary px-8 py-5 shrink-0 flex gap-4 bg-neutral-100">
              <Button
                variant="neutral"
                className="flex-1 font-bold border border-border-primary bg-surface-primary text-text-body hover:bg-neutral-100"
                onClick={() => setSelectedExercise(null)}
              >
                Close Details
              </Button>
              <Button
                variant="primary"
                className="flex-1 font-bold bg-workout-prim hover:bg-workout-prim-600 text-neutral-white shadow-md"
                onClick={() => {
                  setExerciseToAddToPlan(selectedExercise)
                  setSelectedExercise(null)
                  setShowAddToPlanModal(true)
                }}
              >
                Add to Program
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* ── Add to Plan Selection Modal ── */}
      {showAddToPlanModal && exerciseToAddToPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-black/50 backdrop-blur-xs" onClick={() => setShowAddToPlanModal(false)} />
          <div className="relative bg-surface-primary rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-scale-up border border-border-primary">

            <div className="px-6 py-5 border-b border-border-primary flex items-center justify-between">
              <h3 className="text-heading-h6 font-bold text-text-headings">Add to Plan</h3>
              <button
                onClick={() => setShowAddToPlanModal(false)}
                className="text-text-disabled hover:text-text-headings transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            <div className="p-6 flex flex-col gap-5">
              <p className="text-body-sm text-text-disabled">
                Select which customized workout plan and day/routine slot you would like to add <strong>"{exerciseToAddToPlan.title}"</strong> to.
              </p>

              {userPlans.length > 0 ? (
                <>
                  <DefinedField
                    id="target-workout-plan-select"
                    label="Target Workout Plan"
                    value={targetPlanId}
                    onChange={handlePlanChange}
                    options={userPlans.map(plan => ({ value: plan.id, label: plan.name }))}
                    className="mb-4"
                  />

                  <DefinedField
                    id="target-routine-day-select"
                    label="Workout Day / Slot"
                    value={targetRoutineId}
                    onChange={setTargetRoutineId}
                    options={(userPlans.find(p => p.id === targetPlanId)?.rawWorkoutDays || ['Mon', 'Wed', 'Fri']).map(day => ({ value: day, label: day }))}
                  />
                </>
              ) : (
                <div className="py-6 text-center border border-border-primary border-dashed rounded-xl bg-neutral-100">
                  <p className="text-body-md font-semibold text-text-disabled mb-1">No Active Workout Plans Found</p>
                  <p className="text-body-sm text-text-disabled">Please create a new workout plan in the Plans page first!</p>
                </div>
              )}
            </div>

            <div className="border-t border-border-primary px-6 py-4 flex gap-3 bg-neutral-100 shrink-0">
              <Button
                variant="neutral"
                className="flex-1 font-bold border border-border-primary bg-surface-primary text-text-body"
                onClick={() => setShowAddToPlanModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1 font-bold bg-workout-prim hover:bg-workout-prim-600 text-neutral-white shadow-md"
                disabled={userPlans.length === 0}
                onClick={handleAddExerciseToPlan}
              >
                Confirm Add
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
