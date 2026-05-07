import { useState, useEffect } from 'react'
import { Button } from '../components/atoms/Button.jsx'
import { DefinedField } from '../components/molecules/DefinedField.jsx'
import { getExercises } from '../api/exercisesService.js'

const PAGE_SIZE = 20

const MUSCLE_OPTIONS = [
  { value: 'all', label: 'All Muscles' },
  { value: 'chest', label: 'Chest' },
  { value: 'shoulders', label: 'Shoulders' },
  { value: 'upper_back', label: 'Upper Back' },
  { value: 'lower_back', label: 'Lower Back' },
  { value: 'lats', label: 'Lats' },
  { value: 'abs', label: 'Abs' },
  { value: 'obliques', label: 'Obliques' },
  { value: 'biceps', label: 'Biceps' },
  { value: 'triceps', label: 'Triceps' },
  { value: 'forearms', label: 'Forearms' },
  { value: 'quadriceps', label: 'Quadriceps' },
  { value: 'hamstrings', label: 'Hamstrings' },
  { value: 'glutes', label: 'Glutes' },
  { value: 'calves', label: 'Calves' },
]

const TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'weight_reps', label: 'Weight + Reps' },
  { value: 'reps_only', label: 'Reps Only' },
  { value: 'duration', label: 'Duration' },
]

const EQUIPMENT_OPTIONS = [
  { value: 'all', label: 'All Equipment' },
  { value: 'barbell', label: 'Barbell' },
  { value: 'dumbbell', label: 'Dumbbell' },
  { value: 'machine', label: 'Machine' },
  { value: 'none', label: 'No Equipment' },
]

export default function WorkoutsPage() {
  const [activeMuscle, setActiveMuscle] = useState('all')
  const [activeEquipment, setActiveEquipment] = useState('all')
  const [activeType, setActiveType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedExercise, setSelectedExercise] = useState(null)
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(0)
  const [total, setTotal] = useState(0)

  // Plans / Add-to-Plan State
  const [userPlans, setUserPlans] = useState([])
  const [showAddToPlanModal, setShowAddToPlanModal] = useState(false)
  const [exerciseToAddToPlan, setExerciseToAddToPlan] = useState(null)
  const [targetPlanId, setTargetPlanId] = useState('')
  const [targetRoutineId, setTargetRoutineId] = useState('')
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    setPage(1)
  }, [searchQuery, activeMuscle, activeEquipment, activeType])

  useEffect(() => {
    setLoading(true)
    setFetchError('')
    const timer = setTimeout(() => {
      getExercises({
        page,
        pageSize: PAGE_SIZE,
        search: searchQuery || undefined,
        muscleGroup: activeMuscle !== 'all' ? activeMuscle : undefined,
        equipmentCategory: activeEquipment !== 'all' ? activeEquipment : undefined,
        exerciseType: activeType !== 'all' ? activeType : undefined,
      })
        .then((data) => {
          setExercises(data.items || [])
          setPages(data.pages || 0)
          setTotal(data.total || 0)
        })
        .catch((err) => setFetchError(err.message || 'Failed to load exercises'))
        .finally(() => setLoading(false))
    }, 300)
    return () => clearTimeout(timer)
  }, [page, searchQuery, activeMuscle, activeEquipment, activeType])

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

  const getImageSrc = (exercise) => {
    if (exercise.thumbnail_url) return exercise.thumbnail_url
    if (exercise.url && (exercise.media_type === 'image' || exercise.media_type === 'gif')) return exercise.url
    return null
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
      <div className="bg-surface-primary border-b border-border-primary pt-12 pb-8 px-8 md:px-12 relative z-30 overflow-visible animate-fade-in">
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

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl relative z-10">
          <DefinedField
            id="muscle-filter"
            label=""
            value={activeMuscle}
            onChange={setActiveMuscle}
            options={MUSCLE_OPTIONS}
            className="[&>label]:hidden"
          />
          <DefinedField
            id="type-filter"
            label=""
            value={activeType}
            onChange={setActiveType}
            options={TYPE_OPTIONS}
            className="[&>label]:hidden"
          />
          <Button
            variant="outline"
            size="md"
            onClick={() => {
              setSearchQuery('')
              setActiveMuscle('all')
              setActiveEquipment('all')
              setActiveType('all')
            }}
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* ── Grid List Content ── */}
      <div className="flex-1 relative z-0 overflow-auto px-8 py-8 md:px-12 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        {loading && (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full border-4 border-workout-prim border-t-transparent animate-spin mb-4" />
            <p className="text-body-md font-semibold text-text-disabled">Loading exercises...</p>
          </div>
        )}

        {!loading && fetchError && (
          <div className="py-20 flex flex-col items-center justify-center text-center border border-error-300 border-dashed rounded-2xl bg-surface-error max-w-xl mx-auto">
            <p className="text-body-lg font-semibold text-error-500 mb-2">Failed to load exercises</p>
            <p className="text-body-md text-text-disabled">{fetchError}</p>
          </div>
        )}

        {!loading && !fetchError && exercises.length > 0 ? (
          <>
          <div className="mb-4 text-body-sm text-text-disabled font-semibold">
            Showing page {page} of {pages} ({total} total)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {exercises.map(ex => (
              <div
                key={ex.id}
                className="group flex flex-col rounded-2xl border border-border-primary bg-surface-primary overflow-hidden shadow-sm hover:shadow-lg hover:scale-[1.01] transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedExercise(ex)}
              >
                {/* Exercise Cover Photo */}
                <div className="relative h-44 overflow-hidden shrink-0 bg-neutral-900">
                  {getImageSrc(ex) ? (
                    <img src={getImageSrc(ex)} alt={ex.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-body-sm font-semibold text-neutral-white bg-neutral-700">
                      No preview
                    </div>
                  )}
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
                      Primary: {ex.muscle_group?.replace('_', ' ')}
                    </p>
                  </div>

                  {/* Muscles row tags */}
                  <div className="flex flex-wrap gap-1 min-h-12 items-center">
                    <span className="text-[10px] bg-neutral-100 border border-border-primary text-text-body font-semibold px-2 py-0.5 rounded-md capitalize">
                      {ex.muscle_group?.replace('_', ' ')}
                    </span>
                    {ex.secondary_muscles?.map(m => (
                      <span key={m.id} className="text-[10px] bg-neutral-50 border border-border-primary text-text-disabled font-medium px-2 py-0.5 rounded-md capitalize">
                        {m.muscle_name}
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
          {pages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                Previous
              </Button>
              <span className="text-body-sm font-semibold text-text-body px-2">
                {page} / {pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pages}
                onClick={() => setPage((prev) => Math.min(pages, prev + 1))}
              >
                Next
              </Button>
            </div>
          )}
          </>
        ) : (
          !loading && !fetchError &&
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
              {selectedExercise.media_type === 'video' && selectedExercise.url ? (
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
                <img src={getImageSrc(selectedExercise)} alt={selectedExercise.title} className="w-full h-full object-cover" />
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
                    Primary: {selectedExercise.muscle_group?.replace('_', ' ')}
                  </span>
                  <span className="text-body-sm font-semibold bg-neutral-100 text-text-body px-3 py-1 rounded-lg capitalize">
                    {selectedExercise.exercise_type?.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Muscles Targeted */}
              <div className="flex flex-col gap-3 border-t border-border-primary pt-5">
                <h3 className="text-body-md font-bold text-text-headings">Targeted Muscles</h3>
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-workout-prim-100 text-workout-prim rounded-xl text-body-sm font-semibold capitalize border border-workout-prim-100">
                    <span className="w-2 h-2 rounded-full bg-workout-prim shrink-0" />
                    Primary: {selectedExercise.muscle_group?.replace('_', ' ')}
                  </div>
                  {selectedExercise.secondary_muscles?.map(m => (
                    <div key={m.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 text-text-disabled rounded-xl text-body-sm font-medium capitalize border border-border-primary">
                      <span className="w-2 h-2 rounded-full bg-neutral-400 shrink-0" />
                      Secondary: {m.muscle_name}
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
                variant="outline"
                className="flex-1"
                onClick={() => setSelectedExercise(null)}
              >
                Close Details
              </Button>
              <Button
                variant="workout-primary"
                className="flex-1 shadow-md"
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
          <div className="relative bg-surface-primary rounded-3xl shadow-2xl w-full max-w-md flex flex-col animate-scale-up border border-border-primary">

            <div className="px-6 py-5 border-b border-border-primary flex items-center justify-between rounded-t-3xl">
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

            <div className="border-t border-border-primary px-6 py-4 flex gap-3 bg-neutral-100 shrink-0 rounded-b-3xl">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowAddToPlanModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="workout-primary"
                className="flex-1 shadow-md"
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
