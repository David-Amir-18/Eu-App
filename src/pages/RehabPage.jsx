import { useState, useEffect } from 'react'
import { Button } from '../components/atoms/Button.jsx'
import { DefinedField } from '../components/molecules/DefinedField.jsx'
import { getRehabExercises } from '../api/rehabService.js'

export default function RehabPage() {
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Detail Modal State
  const [selectedExercise, setSelectedExercise] = useState(null)

  // Plan Selection States
  const [userPlans, setUserPlans] = useState([])
  const [showAddToPlanModal, setShowAddToPlanModal] = useState(false)
  const [exerciseToAddToPlan, setExerciseToAddToPlan] = useState(null)
  const [targetPlanId, setTargetPlanId] = useState('')
  const [targetRoutineId, setTargetRoutineId] = useState('')
  const [toastMessage, setToastMessage] = useState('')

  // Load user plans from localStorage on component mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('user_plans')
      const parsed = stored ? JSON.parse(stored) : []
      // Filter Rehab plans
      const rehabPlans = parsed.filter(p => p.defaultTab === 'Rehab')
      setUserPlans(rehabPlans)
      if (rehabPlans.length > 0) {
        setTargetPlanId(rehabPlans[0].id)
        // Set default day slot
        const activeDays = rehabPlans[0].rawRehabDays || ['Mon', 'Tue', 'Thu', 'Fri']
        setTargetRoutineId(activeDays[0])
      }
    } catch (e) {
      console.error('Failed to read local plans', e)
    }
  }, [])

  // Handle switching selected target plan inside the modal
  const handlePlanChange = (planId) => {
    setTargetPlanId(planId)
    const selectedPlan = userPlans.find(p => p.id === planId)
    if (selectedPlan) {
      const activeDays = selectedPlan.rawRehabDays || ['Mon', 'Tue', 'Thu', 'Fri']
      setTargetRoutineId(activeDays[0])
    }
  }

  // Execute saving user selected exercise back to the target plan's slot inside localStorage
  const handleAddExerciseToPlan = () => {
    if (!targetPlanId || !targetRoutineId || !exerciseToAddToPlan) return

    try {
      const stored = localStorage.getItem('user_plans')
      const parsed = stored ? JSON.parse(stored) : []

      const updatedPlans = parsed.map(plan => {
        if (plan.id === targetPlanId) {
          // Dynamically populate routines array if it's not initialized for standard custom rehab
          if (!plan.routines || plan.routines.length === 0) {
            const activeDays = plan.rawRehabDays || ['Mon', 'Tue', 'Thu', 'Fri']
            plan.routines = activeDays.map(day => ({
              id: day.toLowerCase(),
              name: day,
              exercises: []
            }))
          }

          // Insert exercise title under the targeted routine slot day
          plan.routines = plan.routines.map(r => {
            if (r.name.toLowerCase() === targetRoutineId.toLowerCase()) {
              // In rehab, exercises are stored as full title/taken objects
              const rawExList = r.exercises.map(ex => typeof ex === 'string' ? ex : ex.title)
              if (!rawExList.includes(exerciseToAddToPlan.title)) {
                r.exercises.push({
                  title: exerciseToAddToPlan.title,
                  thumbnail_url: exerciseToAddToPlan.thumbnail_url || null,
                  taken: false
                })
              }
            }
            return r
          })
        }
        return plan
      })

      localStorage.setItem('user_plans', JSON.stringify(updatedPlans))

      // Trigger visual toast feedback
      const planName = userPlans.find(p => p.id === targetPlanId)?.name || 'Plan'
      setToastMessage(`"${exerciseToAddToPlan.title}" successfully added to ${targetRoutineId} in "${planName}"!`)
      setShowAddToPlanModal(false)

      // Reset toast state automatically after 3 seconds
      setTimeout(() => setToastMessage(''), 3000)
    } catch (err) {
      console.error(err)
    }
  }

  // Load initial exercises from endpoint
  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true)
        setFetchError('')
        
        // Load standard exercises
        const exers = await getRehabExercises()
        setExercises(exers)
      } catch (err) {
        setFetchError(err.message || 'Failed to load exercises.')
      } finally {
        setLoading(false)
      }
    }
    loadInitialData()
  }, [])

  // Client-side visual narrowing
  const filteredExercises = exercises.filter(ex => {
    if (!searchQuery.trim()) return true
    const term = searchQuery.toLowerCase()
    return (
      ex.title?.toLowerCase().includes(term) ||
      ex.description?.toLowerCase().includes(term) ||
      ex.categories?.some(c => c.toLowerCase().includes(term)) ||
      ex.tags?.some(t => t.toLowerCase().includes(term))
    )
  })

  return (
    <div className="flex flex-col min-h-screen bg-neutral-100 relative">
      
      {/* ── Floating Toast Notification ── */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] animate-fade-in">
          <div className="flex items-center gap-2.5 bg-neutral-900 text-neutral-white px-5 py-3 rounded-2xl shadow-2xl border border-neutral-800 border-t-rehab-prim border-t-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-rehab-prim" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
            <span className="text-body-sm font-bold">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* ── Header Area ── */}
      <div className="shrink-0 bg-surface-primary border-b border-border-primary pt-12 pb-8 px-8 md:px-12 relative z-30 overflow-visible animate-fade-in">
        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-rehab-prim/10 rounded-full opacity-30 blur-3xl" />
        <div className="absolute bottom-[-50px] left-[10%] w-48 h-48 bg-rehab-prim-100/20 rounded-full opacity-25 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-heading-h3 font-bold text-text-headings">Rehab Library</h1>
            <p className="text-body-lg text-text-disabled max-w-xl">
              Target restorative kinetic chains, isolate injury-prone joints, and safely recover mobility with clinical progressions.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-stretch w-full md:w-auto">
            {/* Search Input */}
            <div className="relative w-full md:w-80 shrink-0">
              <input
                type="text"
                placeholder="Search rehab..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-surface-primary border border-border-primary rounded-xl pl-11 pr-4 py-2.5 text-body-md text-text-body focus:outline-none focus:border-rehab-prim shadow-sm transition-all"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-text-disabled absolute left-4 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            </div>
          </div>
        </div>
      </div>

      {/* ── Grid List Content ── */}
      <div className="flex-1 relative z-0 overflow-auto px-8 py-8 md:px-12 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        {loading && (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full border-4 border-rehab-prim border-t-transparent animate-spin mb-4" />
            <p className="text-body-md font-semibold text-text-disabled">Loading recovery movements...</p>
          </div>
        )}

        {!loading && fetchError && (
          <div className="py-20 flex flex-col items-center justify-center text-center border border-error-300 border-dashed rounded-2xl bg-surface-error max-w-xl mx-auto">
            <p className="text-body-lg font-semibold text-error-500 mb-2">Failed to load exercises</p>
            <p className="text-body-md text-text-disabled">{fetchError}</p>
          </div>
        )}

        {!loading && !fetchError && filteredExercises.length > 0 ? (
          <>
          <div className="mb-4 text-body-sm text-text-disabled font-semibold">
            Found {filteredExercises.length} therapeutic movements
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredExercises.map(ex => (
              <div
                key={ex.id}
                className="group flex flex-col rounded-2xl border border-border-primary bg-surface-primary overflow-hidden shadow-sm hover:shadow-lg hover:scale-[1.01] transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedExercise(ex)}
              >
                {/* Exercise Cover Photo */}
                <div className="relative h-44 overflow-hidden shrink-0 bg-neutral-900">
                  {ex.thumbnail_url ? (
                    <img src={ex.thumbnail_url} alt={ex.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" />
                  ) : ex.youtube_id ? (
                    <img src={`https://img.youtube.com/vi/${ex.youtube_id}/mqdefault.jpg`} alt={ex.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-body-sm font-semibold text-neutral-white bg-neutral-700">
                      No preview
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-black/60 to-transparent" />
                  {ex.youtube_id && (
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
                      Clinical Progression
                    </p>
                  </div>

                  {/* Simplified clinical detail instead of weird filters */}
                  <p className="text-body-sm text-text-disabled line-clamp-2 min-h-10 leading-relaxed">
                    {ex.description || "Guided clinical range of motion."}
                  </p>

                  <Button
                    variant="rehab-primary"
                    size="sm"
                    className="w-full font-bold shadow-sm transition-all"
                    onClick={(e) => {
                      e.stopPropagation() // Prevent opening instructions modal
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
          </>
        ) : (
          !loading && !fetchError &&
          <div className="py-20 flex flex-col items-center justify-center text-center border border-border-primary border-dashed rounded-2xl bg-surface-primary opacity-80 max-w-xl mx-auto">
            <p className="text-body-lg font-semibold text-text-disabled mb-2">No recovery movements found matching your criteria.</p>
            <p className="text-body-md text-text-disabled">Try selecting another injury condition or clearing keyword search.</p>
          </div>
        )}
      </div>

      {/* ── Exercise Detail Modal ── */}
      {selectedExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-black/50 backdrop-blur-xs animate-fade-in" onClick={() => setSelectedExercise(null)} />
          <div className="relative bg-surface-primary rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up border border-border-primary">

            {/* Header / Video Banner */}
            <div className="relative h-72 shrink-0 overflow-hidden bg-neutral-950">
              {selectedExercise.youtube_id ? (
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${selectedExercise.youtube_id}?autoplay=1`}
                  title={selectedExercise.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-neutral-500 font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /></svg>
                  No instruction video available.
                </div>
              )}
              <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-neutral-black/60 to-transparent p-4 flex justify-end items-center z-10 pointer-events-none">
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
            <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-6 bg-white">
              <div>
                <h2 className="text-heading-h4 font-bold text-text-headings leading-tight">{selectedExercise.title}</h2>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {selectedExercise.categories?.map(c => (
                    <span key={c} className="text-body-sm font-semibold bg-rehab-prim-100 text-rehab-prim px-3 py-1 rounded-lg capitalize">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Target Muscles Targeted */}
              <div className="flex flex-col gap-3 border-t border-border-primary pt-5">
                <h3 className="text-body-md font-bold text-text-headings">Target Mechanics</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedExercise.muscles_involved?.map(m => (
                    <div key={m} className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 border border-border-primary text-text-body rounded-xl text-body-sm font-medium capitalize">
                      <span className="w-2 h-2 rounded-full bg-rehab-prim shrink-0" />
                      {m.replace('_', ' ')}
                    </div>
                  )) || <p className="text-body-sm italic text-text-disabled">General mobility group.</p>}
                </div>
              </div>

              {/* Instructions / Description */}
              <div className="flex flex-col gap-3 border-t border-border-primary pt-5">
                <h3 className="text-body-md font-bold text-text-headings">Clinical Progression Guidelines</h3>
                <div className="bg-neutral-50 p-4 rounded-2xl border border-border-primary">
                  <p className="text-body-md text-text-body leading-relaxed">
                    {selectedExercise.description || "Perform slow, controlled movements inside a pain-free range of motion. Consult an orthopedic specialist before adding external resistance."}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-border-primary px-8 py-5 shrink-0 flex gap-4 bg-neutral-100">
              <Button
                variant="outline"
                className="flex-1 font-bold shadow-sm"
                onClick={() => setSelectedExercise(null)}
              >
                Close Details
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* ── Add to Plan Selection Modal ── */}
      {showAddToPlanModal && exerciseToAddToPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-black/50 backdrop-blur-xs animate-fade-in" onClick={() => setShowAddToPlanModal(false)} />
          <div className="relative bg-surface-primary rounded-3xl shadow-2xl w-full max-w-md flex flex-col animate-scale-up border border-border-primary overflow-hidden z-10">

            <div className="px-6 py-5 border-b border-border-primary flex items-center justify-between bg-neutral-50">
              <h3 className="text-heading-h6 font-bold text-text-headings">Add to Rehab Plan</h3>
              <button
                onClick={() => setShowAddToPlanModal(false)}
                className="text-text-disabled hover:text-text-headings transition-colors p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            <div className="p-6 flex flex-col gap-5 bg-white">
              <p className="text-body-sm text-text-disabled leading-relaxed">
                Select which customized physical therapy protocol and day you would like to add <strong>"{exerciseToAddToPlan.title}"</strong> to.
              </p>

              {userPlans.length > 0 ? (
                <>
                  <DefinedField
                    id="target-rehab-plan-select"
                    label="Target Rehab Plan"
                    value={targetPlanId}
                    onChange={handlePlanChange}
                    options={userPlans.map(plan => ({ value: plan.id, label: plan.name }))}
                    className="mb-4"
                  />

                  <DefinedField
                    id="target-routine-day-select"
                    label="Recovery Day / Slot"
                    value={targetRoutineId}
                    onChange={setTargetRoutineId}
                    options={(userPlans.find(p => p.id === targetPlanId)?.rawRehabDays || ['Mon', 'Tue', 'Thu', 'Fri']).map(day => ({ value: day, label: day }))}
                  />
                </>
              ) : (
                <div className="py-6 px-4 text-center border border-border-primary border-dashed rounded-xl bg-neutral-50">
                  <p className="text-body-md font-semibold text-text-disabled mb-1">No Active Rehab Plans Found</p>
                  <p className="text-body-sm text-text-disabled">Please create a new physical therapy protocol in the Plans page first!</p>
                </div>
              )}
            </div>

            <div className="border-t border-border-primary px-6 py-4 flex gap-3 bg-neutral-50 shrink-0">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowAddToPlanModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="rehab-primary"
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
