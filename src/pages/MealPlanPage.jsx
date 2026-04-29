import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '../components/utils.js'
import { Button } from '../components/atoms/Button.jsx'

// ── Mock data ──────────────────────────────────────────────────────────────────
const MOCK_PLAN = {
  id: 'diabetes-friendly',
  name: 'Diabetes Friendly',
  image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80',
  condition: 'Diabetes',
  calorieTarget: 1800,
  startDate: 'Jan 01, 2026',
  endDate: 'Feb 01, 2026',
}

const MOCK_SLOTS = [
  {
    id: 'breakfast',
    label: 'Breakfast',
    time: '7:00 AM',
    meals: [
      { id: 'm1', name: 'Oatmeal with Berries', calories: 320, protein: 12, carbs: 54, fat: 6, image: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&w=400&q=80', warning: null },
      { id: 'm2', name: 'Greek Yogurt Parfait', calories: 280, protein: 18, carbs: 38, fat: 5, image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400&q=80', warning: null },
      { id: 'm3', name: 'Avocado Toast', calories: 350, protein: 10, carbs: 42, fat: 16, image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c820?auto=format&fit=crop&w=400&q=80', warning: null },
    ],
    selectedMealId: 'm1',
    taken: false,
  },
  {
    id: 'lunch',
    label: 'Lunch',
    time: '12:30 PM',
    meals: [
      { id: 'm4', name: 'Grilled Chicken Salad', calories: 420, protein: 38, carbs: 22, fat: 18, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80', warning: null },
      { id: 'm5', name: 'Quinoa Bowl', calories: 480, protein: 22, carbs: 68, fat: 12, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80', warning: null },
      { id: 'm6', name: 'White Rice & Curry', calories: 620, protein: 24, carbs: 95, fat: 14, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=400&q=80', warning: '⚠️ High glycemic index — not recommended for diabetes' },
    ],
    selectedMealId: 'm4',
    taken: false,
  },
  {
    id: 'snack',
    label: 'Snack',
    time: '3:30 PM',
    meals: [
      { id: 'm7', name: 'Mixed Nuts', calories: 180, protein: 6, carbs: 8, fat: 16, image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=400&q=80', warning: null },
      { id: 'm8', name: 'Apple with Peanut Butter', calories: 210, protein: 5, carbs: 28, fat: 10, image: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?auto=format&fit=crop&w=400&q=80', warning: null },
    ],
    selectedMealId: 'm7',
    taken: false,
  },
  {
    id: 'dinner',
    label: 'Dinner',
    time: '7:00 PM',
    meals: [
      { id: 'm9', name: 'Baked Salmon & Veggies', calories: 520, protein: 42, carbs: 28, fat: 22, image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=400&q=80', warning: null },
      { id: 'm10', name: 'Lentil Soup', calories: 380, protein: 20, carbs: 58, fat: 6, image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=400&q=80', warning: null },
    ],
    selectedMealId: 'm9',
    taken: false,
  },
]

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

// ── Meal library (mock) ────────────────────────────────────────────────────────
const MEAL_LIBRARY = [
  { id: 'm1',  name: 'Oatmeal with Berries',      calories: 320, image: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&w=400&q=80' },
  { id: 'm2',  name: 'Greek Yogurt Parfait',       calories: 280, image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400&q=80' },
  { id: 'm3',  name: 'Avocado Toast',              calories: 350, image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c820?auto=format&fit=crop&w=400&q=80' },
  { id: 'm4',  name: 'Grilled Chicken Salad',      calories: 420, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80' },
  { id: 'm5',  name: 'Quinoa Bowl',                calories: 480, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80' },
  { id: 'm6',  name: 'White Rice & Curry',         calories: 620, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=400&q=80' },
  { id: 'm7',  name: 'Mixed Nuts',                 calories: 180, image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=400&q=80' },
  { id: 'm8',  name: 'Apple with Peanut Butter',   calories: 210, image: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?auto=format&fit=crop&w=400&q=80' },
  { id: 'm9',  name: 'Baked Salmon & Veggies',     calories: 520, image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=400&q=80' },
  { id: 'm10', name: 'Lentil Soup',                calories: 380, image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=400&q=80' },
  { id: 'm11', name: 'Scrambled Eggs',             calories: 260, image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=400&q=80' },
  { id: 'm12', name: 'Veggie Stir Fry',            calories: 340, image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=400&q=80' },
]

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
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(new Set(slot?.meals.map(m => m.id) || []))

  if (!slot) return null

  const filtered = MEAL_LIBRARY.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase())
  )

  function toggle(id) {
    setSelected(s => {
      const next = new Set(s)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleSave() {
    const meals = MEAL_LIBRARY.filter(m => selected.has(m.id)).map(m => ({
      ...m, protein: 20, carbs: 30, fat: 10, warning: null,
    }))
    onSave(slot.id, meals)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={`Meal Collection — ${slot.label}`} size="lg">
      <p className="text-body-sm text-text-disabled">Select which meals are available for this slot. The user can then choose or randomize from this collection daily.</p>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search meals..."
        className="w-full rounded-md px-4 py-2 text-body-sm border border-border-primary focus:outline-none focus:border-meals-prim bg-surface-primary text-text-body"
      />

      <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
        {filtered.map(meal => {
          const isSelected = selected.has(meal.id)
          return (
            <button key={meal.id} onClick={() => toggle(meal.id)}
              className={cn('flex items-center gap-3 px-3 py-2 rounded-xl border transition-colors text-left',
                isSelected ? 'border-meals-prim bg-meals-prim-100' : 'border-border-primary hover:border-meals-prim'
              )}>
              <img src={meal.image} alt={meal.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-body-sm font-semibold text-text-headings truncate">{meal.name}</p>
                <p className="text-body-sm text-text-disabled">{meal.calories} kcal</p>
              </div>
              {isSelected && (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-meals-prim shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              )}
            </button>
          )
        })}
      </div>

      <p className="text-body-sm text-text-disabled">{selected.size} meal{selected.size !== 1 ? 's' : ''} selected</p>

      <div className="flex gap-3 pt-2">
        <Button variant="meals-outline" size="md" onClick={onClose} className="flex-1">Cancel</Button>
        <Button variant="meals-primary" size="md" onClick={handleSave} className="flex-1">Save Collection</Button>
      </div>
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

// ── Main page ──────────────────────────────────────────────────────────────────
export default function MealPlanPage() {
  const navigate = useNavigate()
  const [slots, setSlots] = useState(MOCK_SLOTS)
  const [showEditStructure, setShowEditStructure] = useState(false)
  const [editCollectionSlot, setEditCollectionSlot] = useState(null)

  const totalCalories = slots.reduce((sum, slot) => {
    const meal = slot.meals.find(m => m.id === slot.selectedMealId) || slot.meals[0]
    return sum + (slot.taken && meal ? meal.calories : 0)
  }, 0)

  const plannedCalories = slots.reduce((sum, slot) => {
    const meal = slot.meals.find(m => m.id === slot.selectedMealId) || slot.meals[0]
    return sum + (meal ? meal.calories : 0)
  }, 0)

  function toggleTaken(slotId) {
    setSlots(s => s.map(sl => sl.id === slotId ? { ...sl, taken: !sl.taken } : sl))
  }

  function selectMeal(slotId, mealId) {
    setSlots(s => s.map(sl => sl.id === slotId ? { ...sl, selectedMealId: mealId } : sl))
  }

  function randomMeal(slotId) {
    setSlots(s => s.map(sl => {
      if (sl.id !== slotId) return sl
      const others = sl.meals.filter(m => m.id !== sl.selectedMealId)
      if (!others.length) return sl
      const pick = others[Math.floor(Math.random() * others.length)]
      return { ...sl, selectedMealId: pick.id }
    }))
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

  const caloriePct = Math.min(100, Math.round((totalCalories / MOCK_PLAN.calorieTarget) * 100))
  const takenCount = slots.filter(s => s.taken).length

  return (
    <div className="flex flex-col min-h-screen bg-surface-page">

      {/* ── Banner ── */}
      <div className="relative h-56 overflow-hidden">
        <img src={MOCK_PLAN.image} alt={MOCK_PLAN.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-black via-neutral-black/40 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-between p-6">
          <button onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1 text-body-sm text-neutral-white font-semibold self-start hover:opacity-80 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Dashboard
          </button>
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-meals-prim-100 text-meals-prim text-body-sm font-bold px-2 py-0.5 rounded-round">Diet</span>
                <span className="bg-error-100 text-error-500 text-body-sm font-bold px-2 py-0.5 rounded-round">{MOCK_PLAN.condition}</span>
              </div>
              <h1 className="text-heading-h4 font-bold text-neutral-white">{MOCK_PLAN.name}</h1>
              <p className="text-body-sm text-neutral-200">{MOCK_PLAN.startDate} → {MOCK_PLAN.endDate}</p>
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
            <span className="text-body-sm font-bold text-text-headings">{totalCalories} / {MOCK_PLAN.calorieTarget} kcal</span>
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
