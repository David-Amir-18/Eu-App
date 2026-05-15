import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { cn } from '../components/utils.js'
import { Button } from '../components/atoms/Button.jsx'
import { getMeal, getMeals, getFilterOptions } from '../api/mealsService.js'
import { getMealPlan } from '../api/mealPlansService.js'
import { getActiveMealEnrollment, createEnrollment, updateEnrollmentStatus } from '../api/enrollmentService.js'
import { createMealSchedule, updateMealEatenStatus, getEatenMeals } from '../api/mealTrackingService.js'



const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const WEEK_CALORIES = [1650, 1820, 1780, 0, 1900, 1720, 1800]

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


// ── Edit Plan Structure modal ──────────────────────────────────────────────────
function EditStructureModal({ open, onClose, slots, onSave }) {
  const [localSlots, setLocalSlots] = useState(slots)
  const PREDEFINED = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Pre-workout', 'Post-workout']

  function addSlot(label) {
    const id = label.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now()
    setLocalSlots(s => [...s, { id, label, time: '', meals: [], selectedMealId: null, taken: false }])
  }
  function removeSlot(id) {
    setLocalSlots(s => s.filter(sl => sl.id !== id))
  }
  function updateLabel(id, label) {
    setLocalSlots(s => s.map(sl => sl.id === id ? { ...sl, label } : sl))
  }
  function updateTime(id, time) {
    setLocalSlots(s => s.map(sl => sl.id === id ? { ...sl, time } : sl))
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit Plan Structure" size="lg">
      <p className="text-body-sm text-text-disabled">Add, rename, or remove meal slots for this plan.</p>

      {/* Predefined quick-add */}
      <div className="flex flex-wrap gap-2">
        {PREDEFINED.map(label => (
          <button key={label} onClick={() => addSlot(label)}
            className="px-3 py-1 rounded-round text-body-sm font-semibold border border-meals-prim text-meals-prim hover:bg-meals-prim-100 transition-colors">
            + {label}
          </button>
        ))}
      </div>

      {/* Slot list */}
      <div className="flex flex-col gap-3">
        {localSlots.map(slot => (
          <div key={slot.id} className="flex items-center gap-3 p-3 rounded-xl border border-border-primary bg-neutral-100">
            <input
              value={slot.label}
              onChange={e => updateLabel(slot.id, e.target.value)}
              className="flex-1 bg-surface-primary rounded-md px-3 py-1.5 text-body-sm border border-border-primary focus:outline-none focus:border-meals-prim text-text-body"
              placeholder="Slot name"
            />
            <input
              value={slot.time}
              onChange={e => updateTime(slot.id, e.target.value)}
              className="w-24 bg-surface-primary rounded-md px-3 py-1.5 text-body-sm border border-border-primary focus:outline-none focus:border-meals-prim text-text-body"
              placeholder="7:00 AM"
            />
            <button onClick={() => removeSlot(slot.id)} className="text-text-disabled hover:text-text-error transition-colors shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            </button>
          </div>
        ))}
      </div>

      {/* Custom slot */}
      <button onClick={() => addSlot('Custom Slot')}
        className="text-body-sm text-meals-prim font-semibold hover:text-meals-prim-500 transition-colors self-start">
        + Add Custom Slot
      </button>

      <div className="flex gap-3 pt-2">
        <Button variant="meals-outline" size="md" onClick={onClose} className="flex-1">Cancel</Button>
        <Button variant="meals-primary" size="md" onClick={() => { onSave(localSlots); onClose() }} className="flex-1">Save</Button>
      </div>
    </Modal>
  )
}



// ── Edit Meal Collection modal ─────────────────────────────────────────────────
function EditCollectionModal({ open, onClose, slot, onSave }) {
  const [search, setSearch]           = useState('')
  const [tag, setTag]                 = useState('all')
  const [tagOptions, setTagOptions]   = useState([])
  const [meals, setMeals]             = useState([])
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState(null)
  const [selected, setSelected]       = useState(new Set())
  const [detailMeal, setDetailMeal]         = useState(null)
  const [isDetailLoading, setIsDetailLoading] = useState(false)

  async function openDetail(meal) {
  setDetailMeal(meal)          // show modal immediately with what we have
  setIsDetailLoading(true)
  try {
    console.log(meal.id);
    
      const full = await getMeal(meal.id)
      setDetailMeal(full)
    } catch (err) {
      // keep the partial data already set
      console.log("Failed to get meal details");
      console.log(err);
      
    } finally {
      setIsDetailLoading(false)
    }
  }

  // Fetch tag options once on open
  useEffect(() => {
    if (!open) return
    getFilterOptions()
      .then(data => setTagOptions(data.tags ?? []))
      .catch(() => setTagOptions([]))
  }, [open])

  // Sync selected IDs when slot changes
  useEffect(() => {
    if (open) {
      setSearch('')
      setTag('all')
      setSelected(new Set(slot?.meals.map(m => m.id) || []))
    }
  }, [open, slot])

  // Debounced fetch
  useEffect(() => {
    if (!open) return
    const timer = setTimeout(() => {
      setLoading(true)
      setError(null)
      getMeals({
        search: search || undefined,
        tag: tag !== 'all' ? tag : undefined,
        page_size: 50,
      })
        .then(data => setMeals(data.results))
        .catch(() => setError('Failed to load meals.'))
        .finally(() => setLoading(false))
    }, 400)
    return () => clearTimeout(timer)
  }, [search, tag, open])

  if (!slot) return null

  function toggle(id) {
    setSelected(s => {
      const next = new Set(s)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleSave() {
    // Keep previously selected meals that aren't in the current page,
    // merge with newly selected ones from current results
    const currentPageSelected = meals.filter(m => selected.has(m.id))
    const previouslySelected  = (slot.meals || []).filter(
      m => selected.has(m.id) && !meals.find(cm => cm.id === m.id)
    )
    const merged = [...previouslySelected, ...currentPageSelected].map(m => ({
      ...m,
      name:    m.title,          // normalise title → name for the rest of the page
      calories: m.nutrition?.calories_cal ?? 0,
      protein:  m.nutrition?.protein_g    ?? 0,
      carbs:    m.nutrition?.carbohydrates_g ?? 0,
      fat:      m.nutrition?.total_fat_g  ?? 0,
      warning:  null,
      image:    m.image_url,            
    }))
    onSave(slot.id, merged)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={`Meal Collection — ${slot.label}`} size="lg">
      <p className="text-body-sm text-text-disabled">
        Select which meals are available for this slot.
      </p>

      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search meals..."
        className="w-full rounded-md px-4 py-2 text-body-sm border border-border-primary focus:outline-none focus:border-meals-prim bg-surface-primary text-text-body"
      />

      {/* Tag filter */}
      <select
        value={tag}
        onChange={e => setTag(e.target.value)}
        className="w-full rounded-md px-4 py-2 text-body-sm border border-border-primary focus:outline-none focus:border-meals-prim bg-surface-primary text-text-body"
      >
        <option value="all">All tags</option>
        {tagOptions.map(t => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      {/* Results */}
      <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
        {loading && <p className="text-body-sm text-text-disabled text-center py-4">Loading...</p>}
        {error   && <p className="text-body-sm text-text-error text-center py-4">{error}</p>}
        {!loading && !error && meals.map(meal => {
          const isSelected = selected.has(meal.id)
          return (
            <div 
              key={meal.id} 
              onClick={() => toggle(meal.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggle(meal.id);
                }
              }}
              className={cn('flex items-center gap-3 px-3 py-2 rounded-xl border transition-colors text-left cursor-pointer',
                isSelected ? 'border-meals-prim bg-meals-prim-100' : 'border-border-primary hover:border-meals-prim'
              )}
            >
              <img src={meal.image_url} alt={meal.title} className="w-12 h-12 rounded-lg object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-body-sm font-semibold text-text-headings truncate">{meal.title}</p>
                <p className="text-body-sm text-text-disabled">{meal.nutrition?.calories_cal ?? '—'} kcal</p>
              </div>

              {/* Detail button */}
              <button
                onClick={e => { e.stopPropagation(); openDetail(meal) }}
                className="p-1.5 rounded-lg text-text-disabled hover:text-meals-prim hover:bg-meals-prim-100 transition-colors shrink-0"
                title="View details"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </button>
              {isSelected && (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-meals-prim shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              )}
            </div>
          )
        })}
      </div>

      <p className="text-body-sm text-text-disabled">{selected.size} meal{selected.size !== 1 ? 's' : ''} selected</p>

      <div className="flex gap-3 pt-2">
        <Button variant="meals-outline" size="md" onClick={onClose} className="flex-1">Cancel</Button>
        <Button variant="meals-primary" size="md" onClick={handleSave} className="flex-1">Save Collection</Button>
      </div>
      {/* Meal detail modal — rendered on top of the collection modal */}
      {detailMeal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-neutral-black/50 backdrop-blur-xs"
            onClick={() => !isDetailLoading && setDetailMeal(null)}
          />
          <div className="relative bg-surface-primary rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] border border-border-primary">
            {isDetailLoading ? (
              <div className="flex flex-col items-center justify-center p-20 gap-4">
                <div className="w-12 h-12 border-4 border-meals-prim border-t-transparent rounded-full animate-spin" />
                <p className="text-body-md text-text-disabled font-medium">Loading recipe details...</p>
              </div>
            ) : (
              <>
                {/* Header / Banner */}
                <div className="relative h-64 shrink-0 overflow-hidden">
                  <img
                    src={detailMeal.image_url || 'https://via.placeholder.com/800x400?text=No+Image'}
                    alt={detailMeal.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-black/80 via-neutral-black/20 to-transparent" />
                  <button
                    onClick={() => setDetailMeal(null)}
                    className="absolute top-4 right-4 bg-neutral-black/40 hover:bg-neutral-black/60 text-neutral-white p-2 rounded-full transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                  <div className="absolute bottom-6 left-6 right-6">
                    {detailMeal.tags?.length > 0 && (
                      <span className="bg-meals-prim text-neutral-white text-body-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                        {detailMeal.tags[0]}
                      </span>
                    )}
                    <h2 className="text-heading-h4 font-bold text-neutral-white mt-2 leading-tight">{detailMeal.title}</h2>
                  </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-8">
                  {/* Nutrition */}
                  <div className="flex flex-col gap-3">
                    <h3 className="text-body-md font-bold text-text-headings">Nutrition Information</h3>
                    <div className="grid grid-cols-4 gap-4">
                      {[
                        { label: 'Calories', value: detailMeal.nutrition?.calories_cal ?? 0, unit: '', highlight: true },
                        { label: 'Protein',  value: detailMeal.nutrition?.protein_g ?? 0,    unit: 'g' },
                        { label: 'Carbs',    value: detailMeal.nutrition?.carbohydrates_g ?? 0, unit: 'g' },
                        { label: 'Fats',     value: detailMeal.nutrition?.total_fat_g ?? 0,  unit: 'g' },
                      ].map(({ label, value, unit, highlight }) => (
                        <div key={label} className={cn('p-4 rounded-2xl border text-center flex flex-col justify-center',
                          highlight ? 'bg-meals-prim-100/50 border-meals-prim-100' : 'bg-neutral-100 border-border-primary'
                        )}>
                          <p className={cn('text-heading-h5 font-extrabold leading-none', highlight ? 'text-meals-prim' : 'text-text-headings')}>
                            {value}{unit}
                          </p>
                          <p className="text-body-xs text-text-disabled font-medium mt-1 uppercase">{label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ingredients */}
                  <div className="flex flex-col gap-3 border-t border-border-primary pt-6">
                    <h3 className="text-body-md font-bold text-text-headings">Ingredients Needed</h3>
                    <h3>{detailMeal.ingredients} aaaaaaaaa</h3> 
                    {detailMeal.ingredients?.length > 0 ? (
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {detailMeal.ingredients.map((ing, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-body-md text-text-body">
                            <div className="w-5 h-5 mt-0.5 rounded-md border border-meals-prim bg-meals-prim-100/30 flex items-center justify-center shrink-0">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-meals-prim" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            </div>
                            <span className="flex-1">{ing}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-text-disabled italic text-body-md">No ingredients listed.</p>
                    )}
                  </div>

                  {/* Instructions */}
                  <div className="flex flex-col gap-3 border-t border-border-primary pt-6">
                    <h3 className="text-body-md font-bold text-text-headings">Cooking Instructions</h3>
                    {detailMeal.instructions?.length > 0 ? (
                      <ol className="flex flex-col gap-3.5">
                        {detailMeal.instructions.map((step, idx) => (
                          <li key={idx} className="flex gap-4 text-body-md text-text-body items-start">
                            <span className="w-6 h-6 rounded-full bg-meals-prim-100 text-meals-prim flex items-center justify-center shrink-0 font-bold text-body-sm mt-0.5">{idx + 1}</span>
                            <span className="flex-1 pt-0.5">{step}</span>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="text-text-disabled italic text-body-md">No instructions listed.</p>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-border-primary px-8 py-5 shrink-0 bg-neutral-100">
                  <Button variant="meals-outline" className="w-full font-bold" onClick={() => setDetailMeal(null)}>
                    Close Details
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}

// ── Macro pill ─────────────────────────────────────────────────────────────────
function MacroPill({ label, value, unit = 'g', color }) {
  return (
    <div className={cn('flex flex-col items-center px-3 py-1.5 rounded-lg', color)}>
      <span className="text-body-sm font-bold text-neutral-white">{value}{unit}</span>
      <span className="text-body-sm text-neutral-white opacity-75">{label}</span>
    </div>
  )
}

// ── Meal picker popup (inline, no modal) ───────────────────────────────────────
function MealPicker({ slot, onSelect, onClose }) {
  return (
    <div className="absolute top-full left-0 right-0 mt-2 z-30 bg-surface-primary rounded-xl shadow-2xl border border-border-primary overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-primary">
        <span className="text-body-sm font-bold text-text-headings">Choose {slot.label}</span>
        <button onClick={onClose} className="text-text-disabled hover:text-text-headings">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      {slot.meals.map(meal => (
        <button
          key={meal.id}
          onClick={() => onSelect(slot.id, meal.id)}
          className={cn(
            'w-full flex items-center gap-3 px-4 py-3 hover:bg-meals-prim-100 transition-colors text-left',
            slot.selectedMealId === meal.id && 'bg-meals-prim-100'
          )}
        >
          <img src={meal.image} alt={meal.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-body-sm font-semibold text-text-headings truncate">{meal.name}</p>
            <p className="text-body-sm text-text-disabled">{meal.calories} kcal</p>
            {meal.warning && <p className="text-body-sm text-text-error mt-0.5">{meal.warning}</p>}
          </div>
          {slot.selectedMealId === meal.id && (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-meals-prim shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          )}
        </button>
      ))}
    </div>
  )
}

// ── Meal slot card ─────────────────────────────────────────────────────────────
function MealSlotCard({ slot, onToggleTaken, onSelectMeal, onRandomMeal, onEditCollection }) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const selectedMeal = slot.meals.find(m => m.id === slot.selectedMealId) || slot.meals[0]

  // Slot has no meals yet
  if (!selectedMeal) {
    return (
      <div className="relative flex flex-col rounded-2xl overflow-hidden border border-dashed border-meals-prim bg-meals-prim-100 min-h-[200px] items-center justify-center gap-3 p-6">
        <p className="text-body-md font-semibold text-meals-prim text-center">{slot.label}</p>
        <p className="text-body-sm text-text-disabled text-center">No meals in collection yet.</p>
        <button onClick={onEditCollection}
          className="text-body-sm text-meals-prim font-semibold border border-meals-prim px-3 py-1.5 rounded-lg hover:bg-meals-prim hover:text-neutral-white transition-colors">
          + Add Meals
        </button>
      </div>
    )
  }

  return (
    <div className="relative flex flex-col rounded-2xl overflow-hidden border border-border-primary shadow-sm">

      {/* Image background */}
      <div className="relative h-44 overflow-hidden">
        <img src={selectedMeal.image} alt={selectedMeal.name} className="w-full h-full object-cover transition-all duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-black/80 via-neutral-black/20 to-transparent" />

        {/* Taken overlay */}
        {slot.taken && (
          <div className="absolute inset-0 bg-meals-prim/60 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-neutral-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
        )}

        {/* Warning badge */}
        {selectedMeal.warning && (
          <div className="absolute top-2 left-2 bg-error-500 text-neutral-white text-body-sm font-bold px-2 py-0.5 rounded-round">
            ⚠️ Warning
          </div>
        )}

        {/* Slot label + time */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-3">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-body-sm text-meals-sec font-semibold">{slot.time}</p>
              <h3 className="text-body-lg font-bold text-neutral-white">{slot.label}</h3>
            </div>
            <span className="text-body-sm text-neutral-white font-semibold">{selectedMeal.calories} kcal</span>
          </div>
        </div>
      </div>

      {/* Meal name + macros */}
      <div className="bg-surface-primary px-4 py-3 flex flex-col gap-2">
        <p className="text-body-md font-semibold text-text-headings truncate">{selectedMeal.name}</p>
        <div className="flex gap-2">
          <MacroPill label="Protein" value={selectedMeal.protein} color="bg-meals-prim" />
          <MacroPill label="Carbs"   value={selectedMeal.carbs}   color="bg-meals-sec-500" />
          <MacroPill label="Fat"     value={selectedMeal.fat}     color="bg-meals-prim-500" />
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-surface-primary px-4 pb-4 flex gap-2 border-t border-border-primary pt-3">
        {/* Mark taken */}
        <button
          onClick={() => onToggleTaken(slot.id)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-body-sm font-semibold transition-colors flex-1 justify-center',
            slot.taken
              ? 'bg-meals-prim text-neutral-white'
              : 'border border-meals-prim text-meals-prim hover:bg-meals-prim-100'
          )}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          {slot.taken ? 'Taken' : 'Mark Taken'}
        </button>

        {/* Choose meal */}
        <button
          onClick={() => setPickerOpen(p => !p)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-body-sm font-semibold border border-border-primary text-text-body hover:border-meals-prim hover:text-meals-prim transition-colors"
          title="Choose meal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          {slot.meals.length}
        </button>

        {/* Random */}
        <button
          onClick={() => onRandomMeal(slot.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-body-sm font-semibold border border-border-primary text-text-body hover:border-meals-prim hover:text-meals-prim transition-colors"
          title="Random meal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/></svg>
        </button>

        {/* Edit collection */}
        <button
          onClick={onEditCollection}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-body-sm font-semibold border border-border-primary text-text-body hover:border-meals-prim hover:text-meals-prim transition-colors"
          title="Edit meal collection"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
      </div>

      {/* Inline meal picker */}
      {pickerOpen && (
        <MealPicker
          slot={slot}
          onSelect={(slotId, mealId) => { onSelectMeal(slotId, mealId); setPickerOpen(false) }}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  )
}

export default function MealPlanPage() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [plan, setPlan]       = useState(null)
  const [slots, setSlots]     = useState([])
  const [pageLoading, setPageLoading] = useState(true)
  const [pageError, setPageError]     = useState(null)

  // ── Load plan from backend + hydrate today's eaten state ────────────────────
  useEffect(() => {
    if (!id) return
    let cancelled = false
    async function load() {
      setPageLoading(true)
      setPageError(null)
      try {
        const data = await getMealPlan(id)
        if (cancelled) return

        const kcalMatch = (data.description || '').match(/(\d+)\s*kcal/i)
        setPlan({ ...data, calorieTarget: kcalMatch ? parseInt(kcalMatch[1]) : 2000 })

        const SLOT_TIMES = {
          breakfast: '08:00 AM', lunch: '01:00 PM',
          dinner: '07:00 PM', snack: '04:00 PM',
        }
        const mappedSlots = (data.slot_meals ?? []).map(s => ({
          id: s.id,
          meal_type: s.meal_type,
          label: s.meal_type.charAt(0).toUpperCase() + s.meal_type.slice(1),
          time: SLOT_TIMES[s.meal_type] ?? '12:00 PM',
          taken: false,
          scheduleId: null,
          meals: s.meal ? [{
            id: s.meal_id,
            name: s.meal.title,
            image: s.meal.image_url,
            calories: s.meal.nutrition?.calories_cal ?? 0,
            protein:  s.meal.nutrition?.protein_g ?? 0,
            carbs:    s.meal.nutrition?.carbohydrates_g ?? 0,
            fat:      s.meal.nutrition?.total_fat_g ?? 0,
            warning:  null,
          }] : [],
          selectedMealId: s.meal_id ?? null,
        }))

        // Hydrate today's eaten state so checkboxes show the correct state on load
        let eatenToday = []
        try {
          const todayStr = new Date().toISOString().split('T')[0]
          const { results } = await getEatenMeals({ date: todayStr })
          eatenToday = results || []
        } catch (_) {}

        const merged = mappedSlots.map(slot => {
          const match = eatenToday.find(r => r.is_eaten && r.meal_id === slot.selectedMealId)
          return match ? { ...slot, taken: true, scheduleId: match.id } : slot
        })

        if (!cancelled) setSlots(merged)
      } catch (err) {
        if (!cancelled) setPageError(err.message || 'Failed to load meal plan.')
      } finally {
        if (!cancelled) setPageLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [id])


  const [showEditStructure, setShowEditStructure] = useState(false)
  const [editCollectionSlot, setEditCollectionSlot] = useState(null)

  // ── Enrollment ─────────────────────────────────────────────────────────
  const [enrollment, setEnrollment] = useState(null)
  const [enrolling, setEnrolling] = useState(false)
  const [enrollError, setEnrollError] = useState('')

  useEffect(() => {
    getActiveMealEnrollment()
      .then(e => { if (e.meal_plan_id === id) setEnrollment(e) })
      .catch(() => {})
  }, [id])

  async function handleEnroll() {
    setEnrolling(true); setEnrollError('')
    try {
      const e = await createEnrollment({ mealPlanId: id })
      setEnrollment(e)
    } catch (err) { setEnrollError(err.message) }
    finally { setEnrolling(false) }
  }

  async function handleEnrollStatus(newStatus) {
    if (!enrollment) return
    setEnrolling(true); setEnrollError('')
    try {
      const e = await updateEnrollmentStatus(enrollment.id, newStatus)
      setEnrollment(e)
    } catch (err) { setEnrollError(err.message) }
    finally { setEnrolling(false) }
  }
  const totalCalories = slots.reduce((sum, slot) => {
    const meal = slot.meals.find(m => m.id === slot.selectedMealId) || slot.meals[0]
    return sum + (slot.taken && meal ? meal.calories : 0)
  }, 0)

  const plannedCalories = slots.reduce((sum, slot) => {
    const meal = slot.meals.find(m => m.id === slot.selectedMealId) || slot.meals[0]
    return sum + (meal ? meal.calories : 0)
  }, 0)

  async function toggleTaken(slotId) {
    const slot = slots.find(sl => sl.id === slotId)
    if (!slot) return
    const meal = slot.meals.find(m => m.id === slot.selectedMealId) || slot.meals[0]
    if (!meal) return
    if (!slot.taken) {
      setSlots(s => s.map(sl => sl.id === slotId ? { ...sl, taken: true } : sl))
      try {
        const todayIso = new Date().toISOString()
        const rawType = (slot.meal_type || slot.label || 'snack').toLowerCase().replace(/[^a-z]/g, '')
        const validType = ['breakfast','lunch','dinner','snack'].includes(rawType) ? rawType : 'snack'
        const record = await createMealSchedule({
          meal_id: meal.id,
          scheduled_date: todayIso,
          meal_type: validType,
          is_eaten: true,
          eaten_date: todayIso,
        })
        setSlots(s => s.map(sl => sl.id === slotId ? { ...sl, scheduleId: record.id } : sl))
      } catch (err) {
        setSlots(s => s.map(sl => sl.id === slotId ? { ...sl, taken: false } : sl))
        console.error('Failed to mark meal taken:', err.message)
      }
    } else {
      setSlots(s => s.map(sl => sl.id === slotId ? { ...sl, taken: false } : sl))
      if (slot.scheduleId) {
        try { await updateMealEatenStatus(slot.scheduleId, false) }
        catch (err) {
          setSlots(s => s.map(sl => sl.id === slotId ? { ...sl, taken: true } : sl))
          console.error('Failed to unmark meal:', err.message)
        }
      }
    }
  }

  function selectMeal(slotId, mealId) {
    setSlots(s => s.map(sl => sl.id === slotId ? { ...sl, selectedMealId: mealId } : sl))
  }

  function randomMeal(slotId) {
    const sl = slots.find(s => s.id === slotId)
    if (!sl) return
    const others = sl.meals.filter(m => m.id !== sl.selectedMealId)
    if (!others.length) return
    const pick = others[Math.floor(Math.random() * others.length)]
    
    selectMeal(slotId, pick.id)
  }

  function saveStructure(newSlots) {
    // Preserve existing meals for slots that already existed
    setSlots(prev => newSlots.map(newSlot => {
      const existing = prev.find(s => s.id === newSlot.id)
      return existing
        ? { ...existing, label: newSlot.label, time: newSlot.time }
        : { ...newSlot, meals: [], selectedMealId: null, taken: false }
    }))
  }

  function saveCollection(slotId, meals) {
    setSlots(s => s.map(sl => sl.id === slotId
      ? { ...sl, meals, selectedMealId: meals[0]?.id || null }
      : sl
    ))
  }

  const caloriePct = Math.min(100, Math.round((totalCalories / (plan?.calorieTarget || 2000)) * 100))
  const takenCount = slots.filter(s => s.taken).length

  // ── Loading / error screens ──────────────────────────────────────────
  if (pageLoading) return (
    <div className="flex flex-col min-h-screen items-center justify-center gap-4 bg-surface-page">
      <div className="w-10 h-10 border-4 border-meals-prim border-t-transparent rounded-full animate-spin" />
      <p className="text-body-md text-text-disabled font-medium">Loading meal plan...</p>
    </div>
  )

  if (pageError || !plan) return (
    <div className="flex flex-col min-h-screen items-center justify-center gap-4 bg-surface-page px-8">
      <p className="text-body-lg font-bold text-text-headings">Failed to load plan</p>
      <p className="text-body-md text-text-disabled text-center">{pageError || 'Plan not found.'}</p>
      <button onClick={() => navigate(-1)} className="text-meals-prim font-semibold underline text-body-md">Go back</button>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen bg-surface-page">

      {/* ── Banner ── */}
      <div className="relative h-56 shrink-0 overflow-hidden">
        <img src={plan.image_url || 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80'} alt={plan.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-black via-neutral-black/40 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-between p-6">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-body-sm text-neutral-white font-semibold self-start hover:opacity-80 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Back
          </button>
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-meals-prim-100 text-meals-prim text-body-sm font-bold px-2 py-0.5 rounded-round">Diet</span>
                <span className="bg-error-100 text-error-500 text-body-sm font-bold px-2 py-0.5 rounded-round">{plan.goal_type || plan.level || plan.condition || 'General Health'}</span>
              </div>
              <h1 className="text-heading-h4 font-bold text-neutral-white">{plan.title || plan.name}</h1>
              <p className="text-body-sm text-neutral-200">{plan.dateRange || (plan.start_date && plan.end_date ? `${plan.start_date} → ${plan.end_date}` : 'Ongoing')}</p>
            </div>
            <Button variant="meals-outline" size="sm" className="border-neutral-white text-neutral-white hover:bg-neutral-white/10" onClick={() => setShowEditStructure(true)}>Edit</Button>
          </div>
        </div>
      </div>

      {/* ── Today's summary bar ── */}
      <div className="bg-surface-primary border-b border-border-primary px-8 py-4 flex items-center gap-6 flex-wrap">
        <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
          <div className="flex items-center justify-between">
            <span className="text-body-sm text-text-disabled font-semibold">Today's Calories</span>
            <span className="text-body-sm font-bold text-text-headings">{totalCalories} / {plan.calorieTarget} kcal</span>
          </div>
          <div className="w-full h-2 bg-neutral-100 rounded-round overflow-hidden">
            <div className="h-full bg-meals-prim rounded-round transition-all duration-500" style={{ width: `${caloriePct}%` }} />
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-full bg-meals-prim-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-meals-prim" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <span className="text-body-sm font-semibold text-text-headings">{takenCount}/{slots.length} meals taken</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-body-sm text-text-disabled">Planned:</span>
          <span className="text-body-sm font-semibold text-text-headings">{plannedCalories} kcal</span>
        </div>

        {/* ── Inline enrollment row ── */}
        <div className="w-full flex items-center gap-3 flex-wrap pt-1 border-t border-border-primary mt-1">
          <span className="text-body-sm font-bold text-text-headings">Enrollment:</span>
          {enrollment ? (
            <>
              <span className={cn(
                'text-body-xs font-bold px-2.5 py-1 rounded-full border',
                enrollment.status === 'active'    && 'bg-success-100 text-success-700 border-success-200',
                enrollment.status === 'paused'    && 'bg-warning-100 text-warning-700 border-warning-200',
                enrollment.status === 'completed' && 'bg-information-100 text-information-700 border-information-200',
                enrollment.status === 'dropped'   && 'bg-error-100 text-error-600 border-error-200',
              )}>
                {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
              </span>
              {enrollment.status === 'active' && (
                <>
                  <button onClick={() => handleEnrollStatus('paused')} disabled={enrolling}
                    className="px-3 py-1 rounded-lg text-body-xs font-bold border border-warning-300 text-warning-700 bg-warning-50 hover:bg-warning-100 transition-colors disabled:opacity-50">
                    {enrolling ? '…' : '⏸ Pause'}
                  </button>
                  <button onClick={() => handleEnrollStatus('completed')} disabled={enrolling}
                    className="px-3 py-1 rounded-lg text-body-xs font-bold border border-information-300 text-information-700 bg-information-50 hover:bg-information-100 transition-colors disabled:opacity-50">
                    {enrolling ? '…' : '✓ Complete'}
                  </button>
                  <button onClick={() => handleEnrollStatus('dropped')} disabled={enrolling}
                    className="px-3 py-1 rounded-lg text-body-xs font-bold border border-error-200 text-error-500 bg-error-50 hover:bg-error-100 transition-colors disabled:opacity-50">
                    {enrolling ? '…' : '✕ Drop'}
                  </button>
                </>
              )}
              {enrollment.status === 'paused' && (
                <>
                  <button onClick={() => handleEnrollStatus('active')} disabled={enrolling}
                    className="px-3 py-1 rounded-lg text-body-xs font-bold bg-success-600 text-neutral-white hover:bg-success-700 transition-colors disabled:opacity-50">
                    {enrolling ? '…' : '▶ Resume'}
                  </button>
                  <button onClick={() => handleEnrollStatus('dropped')} disabled={enrolling}
                    className="px-3 py-1 rounded-lg text-body-xs font-bold border border-error-200 text-error-500 bg-error-50 hover:bg-error-100 transition-colors disabled:opacity-50">
                    {enrolling ? '…' : '✕ Drop'}
                  </button>
                </>
              )}
              {(enrollment.status === 'completed' || enrollment.status === 'dropped') && (
                <button onClick={handleEnroll} disabled={enrolling}
                  className="px-3 py-1 rounded-lg text-body-xs font-bold bg-success-600 text-neutral-white hover:bg-success-700 transition-colors disabled:opacity-50">
                  {enrolling ? '…' : '↩ Re-enroll'}
                </button>
              )}
            </>
          ) : (
            <button onClick={handleEnroll} disabled={enrolling}
              className="px-4 py-1.5 rounded-lg text-body-sm font-bold bg-meals-prim text-neutral-white hover:bg-meals-prim/90 transition-colors shadow-sm disabled:opacity-50">
              {enrolling ? 'Enrolling…' : '+ Enroll in This Plan'}
            </button>
          )}
          {enrollError && <span className="text-body-xs text-text-error ml-auto">{enrollError}</span>}
        </div>
      </div>

      {/* ── Meal slots grid ── */}
      <div className="px-8 py-6 flex flex-col gap-6">
        <h2 className="text-heading-h5 font-bold text-text-headings">Today's Meals</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {slots.map(slot => (
            <MealSlotCard
              key={slot.id}
              slot={slot}
              onToggleTaken={toggleTaken}
              onSelectMeal={selectMeal}
              onRandomMeal={randomMeal}
              onEditCollection={() => setEditCollectionSlot(slot)}
            />
          ))}
        </div>
      </div>

      {/* ── Modals ── */}
      <EditStructureModal
        open={showEditStructure}
        onClose={() => setShowEditStructure(false)}
        slots={slots}
        onSave={saveStructure}
      />
      <EditCollectionModal
        key={editCollectionSlot?.id}
        open={!!editCollectionSlot}
        onClose={() => setEditCollectionSlot(null)}
        slot={editCollectionSlot}
        onSave={saveCollection}
      />
    </div>
  )
}
