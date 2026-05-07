import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '../components/utils.js'
import { Button } from '../components/atoms/Button.jsx'
import { Field } from '../components/atoms/Field.jsx'
import { DatePicker } from '../components/molecules/DatePicker.jsx'

// ── Icons ──────────────────────────────────────────────────────────────────────
function IconWorkout() {
  return <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 6.5h11M6.5 17.5h11M4 12h16M4 12a2 2 0 01-2-2V8a2 2 0 012-2M20 12a2 2 0 002-2V8a2 2 0 00-2-2M4 12a2 2 0 00-2 2v2a2 2 0 002 2M20 12a2 2 0 012 2v2a2 2 0 01-2 2" /></svg>
}
function IconDiet() {
  return <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l19-9-9 19-2-8-8-2z" /></svg>
}
function IconRehab() {
  return <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
}

// ── Constants ──────────────────────────────────────────────────────────────────
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MEAL_SLOTS = ['Breakfast', 'Lunch', 'Dinner', 'Snack']

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

  // General State
  const [type, setType] = useState('workout') // 'workout', 'diet', 'rehab'
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [level, setLevel] = useState('Beginner')

  // Workout State
  const [equipment, setEquipment] = useState('Basic Equipment')
  const [workoutDays, setWorkoutDays] = useState(['Mon', 'Wed', 'Fri'])

  // Diet State
  const [dietPref, setDietPref] = useState('None')
  const [calorieTarget, setCalorieTarget] = useState('2000')
  const [mealSlots, setMealSlots] = useState(['Breakfast', 'Lunch', 'Dinner'])

  // Rehab State
  const [injury, setInjury] = useState('')
  const [rehabDays, setRehabDays] = useState(['Mon', 'Tue', 'Thu', 'Fri'])

  // UI State
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showSwitchModal, setShowSwitchModal] = useState(false)
  const [showValidationModal, setShowValidationModal] = useState(false)
  const [pendingType, setPendingType] = useState(null)

  // ── Derived Data ──
  const isDirty = name !== '' || startDate !== null || endDate !== null || 
    (type === 'workout' ? (equipment !== 'Basic Equipment' || workoutDays.length !== 3) :
     type === 'diet' ? (dietPref !== 'None' || calorieTarget !== '2000' || mealSlots.length !== 3) :
     (injury !== '' || rehabDays.length !== 4))

  const handleTypeSwitch = (newType) => {
    if (newType === type) return
    if (isDirty) {
      setPendingType(newType)
      setShowSwitchModal(true)
    } else {
      setType(newType)
    }
  }
  const activeDays = type === 'workout' ? workoutDays : type === 'rehab' ? rehabDays : []
  const primaryColorClass = type === 'workout' ? 'workout-prim' : type === 'diet' ? 'meals-prim' : 'rehab-prim'
  const primaryColorHex = type === 'workout' ? 'bg-workout-prim' : type === 'diet' ? 'bg-meals-prim' : 'bg-rehab-prim'
  
  // Calculate duration in weeks purely for display purposes
  const durationWeeks = (startDate && endDate) 
    ? Math.max(1, Math.round((endDate - startDate) / (1000 * 60 * 60 * 24 * 7))) 
    : 0

  const handleSave = (status) => {
    if (!name.trim()) {
      setShowValidationModal(true)
      return
    }

    // Generate an ID
    const planId = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now()
    
    // Construct the payload
    const newPlan = {
      id: planId,
      name: name || 'Untitled Plan',
      defaultTab: type.charAt(0).toUpperCase() + type.slice(1),
      status: status, // 'draft' | 'active' | 'planned'
      dateRange: `${formatDateShort(startDate)} → ${formatDateShort(endDate)} · ${durationWeeks} weeks`,
      detail: type === 'diet' 
        ? `Target: ${calorieTarget} kcal/day · Pref: ${dietPref}`
        : `Frequency: ${activeDays.length} days / week · Level: ${level}`,
      detailColor: type === 'workout' ? 'bg-workout-prim' : type === 'diet' ? 'bg-meals-prim' : 'bg-rehab-prim',
      progress: 0,
      progressMax: type === 'diet' ? durationWeeks * 7 : durationWeeks * activeDays.length,
      sessions: 0,
      sessionsMax: type === 'diet' ? durationWeeks * 7 : durationWeeks * activeDays.length,
      ctaLabel: type === 'diet' ? 'Log a meal' : type === 'rehab' ? 'View Protocol' : 'Log a workout',
    }

    // Save to localStorage
    const existing = localStorage.getItem('user_plans')
    const plans = existing ? JSON.parse(existing) : []
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

                <div className="flex flex-col gap-2">
                  <label className="text-body-sm font-semibold text-text-headings">Plan Level</label>
                  <select 
                    value={level} onChange={e => setLevel(e.target.value)}
                    className="w-full rounded-xl px-4 py-2.5 text-body-md border border-border-primary focus:outline-none focus:border-neutral-400 bg-surface-primary text-text-body"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="All Levels">All Levels</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Step 3: Type Specific */}
            <section className="animate-fade-in" key={type}>
              <h2 className="text-heading-h6 font-bold text-text-headings mb-1">3. Customize Structure</h2>
              <p className="text-body-sm text-text-disabled mb-6">Configure the specific modules for your {type} plan.</p>

              {/* WORKOUT SPECIFIC */}
              {type === 'workout' && (
                <div className="flex flex-col gap-8">
                  <div className="flex flex-col gap-2">
                    <label className="text-body-sm font-semibold text-text-headings">Equipment Available</label>
                    <select 
                      value={equipment} onChange={e => setEquipment(e.target.value)}
                      className="w-full rounded-xl px-4 py-2.5 text-body-md border border-border-primary focus:outline-none focus:border-workout-prim bg-surface-primary text-text-body"
                    >
                      <option value="No Equipment">No Equipment (Bodyweight)</option>
                      <option value="Basic Equipment">Basic Equipment (Dumbbells, Bands)</option>
                      <option value="Full Gym">Full Gym</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-body-sm font-semibold text-text-headings">Preferred Workout Days</label>
                    <ToggleGroup options={DAYS} selected={workoutDays} onChange={setWorkoutDays} activeColor="bg-workout-prim" />
                  </div>

                  {/* Day Blocks */}
                  {workoutDays.length > 0 && (
                    <div className="flex flex-col gap-3 mt-4">
                      <label className="text-body-sm font-semibold text-text-headings">Daily Structure</label>
                      {DAYS.filter(d => workoutDays.includes(d)).map(day => (
                        <div key={day} className="flex items-center gap-4 p-4 rounded-xl border border-border-primary bg-surface-primary">
                          <span className="w-10 text-body-md font-bold text-workout-prim">{day}</span>
                          <div className="flex-1 border-l border-border-primary pl-4">
                            <button className="text-body-sm font-semibold text-text-disabled border border-dashed border-border-primary rounded-lg px-4 py-2 w-full text-left hover:bg-neutral-100 transition-colors">
                              + Add Exercise
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* DIET SPECIFIC */}
              {type === 'diet' && (
                <div className="flex flex-col gap-8">
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex-1 flex flex-col gap-2">
                      <label className="text-body-sm font-semibold text-text-headings">Dietary Preference</label>
                      <select 
                        value={dietPref} onChange={e => setDietPref(e.target.value)}
                        className="w-full rounded-xl px-4 py-2.5 text-body-md border border-border-primary focus:outline-none focus:border-meals-prim bg-surface-primary text-text-body"
                      >
                        <option value="None">No Preference</option>
                        <option value="Vegan">Vegan</option>
                        <option value="Vegetarian">Vegetarian</option>
                        <option value="Keto">Keto</option>
                        <option value="Diabetes-Friendly">Diabetes-Friendly</option>
                      </select>
                    </div>
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
                    <div className="flex justify-between items-center pb-1">
                      <span className="text-body-sm text-text-disabled font-medium">Equipment</span>
                      <span className="text-body-sm font-bold text-text-headings">{equipment}</span>
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
          setLevel('Beginner')
          setEquipment('Basic Equipment')
          setWorkoutDays(['Mon', 'Wed', 'Fri'])
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

    </div>
  )
}
