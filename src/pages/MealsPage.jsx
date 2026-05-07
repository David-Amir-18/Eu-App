import { useState, useEffect } from 'react'
import { Button } from '../components/atoms/Button.jsx'
import { cn } from '../components/utils.js'
import { DefinedField } from '../components/molecules/DefinedField.jsx'


const MEAL_DATABASE = [
  {
    id: 'm1',
    name: 'Oatmeal with Berries',
    category: 'breakfast',
    calories: 320,
    protein: 12,
    carbs: 54,
    fat: 6,
    ingredients: ['Rolled oats', 'Fresh blueberries', 'Organic honey', 'Unsweetened almond milk', 'Chia seeds'],
    instructions: [
      'Boil almond milk in a small saucepan.',
      'Stir in rolled oats and reduce heat to low.',
      'Simmer for 5 minutes, stirring occasionally.',
      'Pour into a bowl, drizzle with honey, and top with fresh berries and chia seeds.'
    ],
    image: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'm2',
    name: 'Greek Yogurt Parfait',
    category: 'breakfast',
    calories: 280,
    protein: 18,
    carbs: 38,
    fat: 5,
    ingredients: ['Greek yogurt', 'Mixed berries', 'Gluten-free granola', 'Sliced almonds', 'Maple syrup'],
    instructions: [
      'Spoon half of the Greek yogurt into a glass or bowl.',
      'Top with a layer of mixed berries and granola.',
      'Add the remaining yogurt, followed by another layer of berries and granola.',
      'Garnish with sliced almonds and drizzle with maple syrup.'
    ],
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'm3',
    name: 'Avocado Toast',
    category: 'breakfast',
    calories: 350,
    protein: 10,
    carbs: 42,
    fat: 16,
    ingredients: ['Sourdough bread', 'Ripe avocado', 'Cherry tomatoes', 'Feta cheese', 'Red pepper flakes'],
    instructions: [
      'Toast the sourdough bread slices until golden brown.',
      'Mash the ripe avocado in a small bowl with a pinch of salt and pepper.',
      'Spread the mashed avocado evenly across the warm toast.',
      'Top with cherry tomatoes, crumbled feta, and red pepper flakes.'
    ],
    image: 'https://www.rootsandradishes.com/wp-content/uploads/2017/08/avocado-toast-with-everything-bagel-seasoning-4.jpg'
  },
  {
    id: 'm4',
    name: 'Grilled Chicken Salad',
    category: 'lunch',
    calories: 420,
    protein: 38,
    carbs: 22,
    fat: 18,
    ingredients: ['Chicken breast', 'Romaine lettuce', 'Cucumber', 'Avocado', 'Olive oil dressing', 'Parmesan cheese'],
    instructions: [
      'Season and grill the chicken breast until cooked through, then slice.',
      'Wash and chop the romaine lettuce and cucumber.',
      'Toss the vegetables in a large bowl with olive oil dressing.',
      'Top with sliced chicken, avocado, and freshly grated parmesan.'
    ],
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'm5',
    name: 'Quinoa Buddha Bowl',
    category: 'lunch',
    calories: 480,
    protein: 22,
    carbs: 68,
    fat: 12,
    ingredients: ['Organic quinoa', 'Roasted sweet potato', 'Chickpeas', 'Tahini dressing', 'Spinach', 'Pumpkin seeds'],
    instructions: [
      'Rinse quinoa thoroughly and cook according to package instructions.',
      'Toss cubed sweet potato in olive oil and roast at 200°C for 25 minutes.',
      'Arrange warm quinoa, roasted sweet potatoes, spinach, and chickpeas in a bowl.',
      'Drizzle with tahini dressing and garnish with pumpkin seeds.'
    ],
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'm6',
    name: 'White Rice & Curry',
    category: 'lunch',
    calories: 620,
    protein: 24,
    carbs: 95,
    fat: 14,
    ingredients: ['Basmati rice', 'Chickpea coconut curry', 'Tofu cubes', 'Coriander leaves', 'Lime juice'],
    instructions: [
      'Boil basmati rice until tender, then drain and set aside.',
      'Sauté tofu cubes in a pan until golden, then set aside.',
      'In a pot, simmer chickpea curry in coconut milk with spices.',
      'Stir in tofu, serve over rice, and garnish with coriander and lime.'
    ],
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'm7',
    name: 'Mixed Roasted Nuts',
    category: 'snacks',
    calories: 180,
    protein: 6,
    carbs: 8,
    fat: 16,
    ingredients: ['Almonds', 'Walnuts', 'Cashews', 'Sea salt', 'Rosemary'],
    instructions: [
      'Preheat your oven to 160°C.',
      'Toss almonds, walnuts, and cashews with sea salt, rosemary, and a touch of oil.',
      'Spread nuts evenly on a baking sheet.',
      'Roast for 10-12 minutes until fragrant and golden, stirring halfway.'
    ],
    image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'm8',
    name: 'Apple with Peanut Butter',
    category: 'snacks',
    calories: 210,
    protein: 5,
    carbs: 28,
    fat: 10,
    ingredients: ['Red apple', 'Creamy natural peanut butter', 'Cinnamon dusting'],
    instructions: [
      'Wash the red apple thoroughly.',
      'Core and slice the apple into even wedges.',
      'Arrange apple slices on a serving plate.',
      'Serve alongside creamy peanut butter dusted with cinnamon.'
    ],
    image: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'm9',
    name: 'Baked Salmon & Asparagus',
    category: 'dinner',
    calories: 520,
    protein: 42,
    carbs: 28,
    fat: 22,
    ingredients: ['Wild-caught salmon', 'Asparagus spears', 'Garlic butter', 'Lemon slices', 'Fresh dill'],
    instructions: [
      'Preheat oven to 200°C and line a baking sheet with foil.',
      'Place salmon fillet and asparagus spears on the sheet.',
      'Brush both with garlic butter and season with salt and pepper.',
      'Top salmon with lemon slices and dill, then bake for 12-15 minutes.'
    ],
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'm10',
    name: 'Lentil Soup with Kale',
    category: 'dinner',
    calories: 380,
    protein: 20,
    carbs: 58,
    fat: 6,
    ingredients: ['Brown lentils', 'Lacinato kale', 'Carrots', 'Celery', 'Vegetable broth', 'Cumin'],
    instructions: [
      'Sauté diced carrots and celery in a pot with cumin until soft.',
      'Add brown lentils and vegetable broth, bringing to a boil.',
      'Reduce heat, cover, and simmer for 25-30 minutes until lentils are soft.',
      'Stir in chopped lacinato kale and cook for 2 more minutes before serving.'
    ],
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=400&q=80'
  }
]

const TABS = ['all', 'breakfast', 'lunch', 'dinner', 'snacks']

export default function MealsPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMeal, setSelectedMeal] = useState(null)

  // Plans / Add-to-Plan State
  const [userPlans, setUserPlans] = useState([])
  const [showAddToPlanModal, setShowAddToPlanModal] = useState(false)
  const [mealToAddToPlan, setMealToAddToPlan] = useState(null)
  const [targetPlanId, setTargetPlanId] = useState('')
  const [targetSlot, setTargetSlot] = useState('')
  const [toastMessage, setToastMessage] = useState('')

  // Load plans on component mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('user_plans')
      const parsed = stored ? JSON.parse(stored) : []
      // Filter only Diet plans
      const dietPlans = parsed.filter(p => p.defaultTab === 'Diet')
      setUserPlans(dietPlans)
      if (dietPlans.length > 0) {
        const slots = dietPlans[0].mealSlots || dietPlans[0].rawMealSlots || ['Breakfast', 'Lunch', 'Dinner', 'Snacks']
        setTargetSlot(slots[0])
      }
    } catch (e) {
      console.error(e)
    }
  }, [])

  // Dynamic slot updating when plan selection changes
  const handlePlanChange = (planId) => {
    setTargetPlanId(planId)
    const selectedPlan = userPlans.find(p => p.id === planId)
    if (selectedPlan) {
      const slots = selectedPlan.mealSlots || selectedPlan.rawMealSlots || ['Breakfast', 'Lunch', 'Dinner', 'Snacks']
      setTargetSlot(slots[0])
    }
  }

  // Filtered meals based on Category Tab + Search query
  const filteredMeals = MEAL_DATABASE.filter(meal => {
    const matchesTab = activeTab === 'all' || meal.category === activeTab
    const matchesSearch = meal.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  // Add meal to selected plan & slot in LocalStorage
  const handleAddMealToPlan = () => {
    if (!targetPlanId || !targetSlot || !mealToAddToPlan) return

    try {
      const stored = localStorage.getItem('user_plans')
      const parsed = stored ? JSON.parse(stored) : []

      const updatedPlans = parsed.map(plan => {
        if (plan.id === targetPlanId) {
          // Initialize slots structure if it doesn't exist
          if (!plan.slots) {
            const slotsToUse = plan.mealSlots || plan.rawMealSlots || ['Breakfast', 'Lunch', 'Dinner', 'Snacks']
            plan.slots = slotsToUse.map(label => ({
              id: label.toLowerCase(),
              label: label,
              time: label === 'Breakfast' ? '7:00 AM' : label === 'Lunch' ? '12:30 PM' : '7:00 PM',
              meals: [],
              selectedMealId: null,
              taken: false
            }))
          }

          // Add meal to specified slot
          plan.slots = plan.slots.map(s => {
            if (s.label.toLowerCase() === targetSlot.toLowerCase()) {
              const exists = s.meals.some(m => m.id === mealToAddToPlan.id)
              if (!exists) {
                s.meals.push({
                  id: mealToAddToPlan.id,
                  name: mealToAddToPlan.name,
                  calories: mealToAddToPlan.calories,
                  protein: mealToAddToPlan.protein,
                  carbs: mealToAddToPlan.carbs,
                  fat: mealToAddToPlan.fat,
                  image: mealToAddToPlan.image,
                  warning: null
                })
              }
              s.selectedMealId = mealToAddToPlan.id // Auto-select added meal
            }
            return s
          })
        }
        return plan
      })

      localStorage.setItem('user_plans', JSON.stringify(updatedPlans))

      // Show success toast
      const planName = userPlans.find(p => p.id === targetPlanId)?.name || 'Plan'
      setToastMessage(`"${mealToAddToPlan.name}" added to ${targetSlot} in "${planName}"!`)
      setShowAddToPlanModal(false)

      // Clear toast after 3 seconds
      setTimeout(() => setToastMessage(''), 3000)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-neutral-100 relative">

      {/* Toast Alert Notification */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-success-500 text-neutral-white px-6 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-slide-down border border-success-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          <span className="text-body-md font-bold">{toastMessage}</span>
        </div>
      )}

      {/* ── Header Area ── */}
      <div className="bg-surface-primary border-b border-border-primary pt-12 pb-8 px-8 md:px-12 relative overflow-hidden animate-fade-in">
        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-meals-prim rounded-full opacity-30 blur-3xl" />
        <div className="absolute bottom-[-50px] left-[10%] w-48 h-48 bg-meals-sec rounded-full opacity-25 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-heading-h3 font-bold text-text-headings">All Meals</h1>
            <p className="text-body-lg text-text-disabled max-w-xl">
              Discover and select rich, nutritious recipes to customize your personalized diet plans.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80 shrink-0">
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-surface-primary border border-border-primary rounded-xl pl-11 pr-4 py-2.5 text-body-md text-text-body focus:outline-none focus:border-meals-prim shadow-sm transition-all"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-text-disabled absolute left-4 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap gap-2 mt-8 bg-neutral-100 p-1.5 rounded-xl border border-border-primary w-fit relative z-10">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-body-sm font-semibold transition-all capitalize",
                activeTab === tab
                  ? "bg-surface-primary text-meals-prim shadow-sm border border-border-primary"
                  : "text-text-disabled hover:text-text-headings"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid List Content ── */}
      <div className="flex-1 overflow-auto px-8 py-8 md:px-12 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        {filteredMeals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMeals.map(meal => (
              <div
                key={meal.id}
                className="group flex flex-col rounded-2xl border border-border-primary bg-surface-primary overflow-hidden shadow-sm hover:shadow-lg hover:scale-[1.01] transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedMeal(meal)}
              >
                {/* Meal Cover Photo */}
                <div className="relative h-44 overflow-hidden shrink-0">
                  <img src={meal.image} alt={meal.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-black/60 to-transparent" />
                  <span className="absolute top-3 right-3 bg-meals-prim-100 text-meals-prim text-body-xs font-bold px-2.5 py-1 rounded-round shadow-sm capitalize">
                    {meal.category}
                  </span>
                </div>

                {/* Card Info */}
                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-body-lg font-bold text-text-headings leading-snug truncate">{meal.name}</h3>
                    <p className="text-body-xs text-text-disabled">{meal.ingredients.length} ingredients · {meal.instructions.length} steps</p>
                  </div>

                  {/* Macros Row */}
                  <div className="grid grid-cols-4 gap-2 bg-neutral-100 p-2.5 rounded-xl border border-border-primary text-center">
                    <div className="flex flex-col">
                      <span className="text-body-sm font-extrabold text-meals-prim">{meal.calories}</span>
                      <span className="text-[10px] text-text-disabled uppercase font-medium">kcal</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-body-sm font-extrabold text-text-headings">{meal.protein}g</span>
                      <span className="text-[10px] text-text-disabled uppercase font-medium">prot</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-body-sm font-extrabold text-text-headings">{meal.carbs}g</span>
                      <span className="text-[10px] text-text-disabled uppercase font-medium">carb</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-body-sm font-extrabold text-text-headings">{meal.fat}g</span>
                      <span className="text-[10px] text-text-disabled uppercase font-medium">fat</span>
                    </div>
                  </div>

                  {/* Add to Plan Button */}
                  <Button
                    variant="meals-primary"
                    size="sm"
                    className="w-full font-bold shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation() // Prevent opening detail modal
                      setMealToAddToPlan(meal)
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
            <p className="text-body-lg font-semibold text-text-disabled mb-2">No meals found matching your criteria.</p>
            <p className="text-body-md text-text-disabled">Try resetting the tab filter or searching for another keyword.</p>
          </div>
        )}
      </div>

      {/* ── Meal Detail Modal ── */}
      {selectedMeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-black/50 backdrop-blur-xs" onClick={() => setSelectedMeal(null)} />
          <div className="relative bg-surface-primary rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up border border-border-primary">

            {/* Header / Banner */}
            <div className="relative h-64 shrink-0 overflow-hidden">
              <img src={selectedMeal.image} alt={selectedMeal.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-black/80 via-neutral-black/20 to-transparent" />
              <button
                onClick={() => setSelectedMeal(null)}
                className="absolute top-4 right-4 bg-neutral-black/40 hover:bg-neutral-black/60 text-neutral-white p-2 rounded-full transition-colors"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>

              <div className="absolute bottom-6 left-6 right-6">
                <span className="bg-meals-prim text-neutral-white text-body-xs font-bold px-3 py-1 rounded-full shadow-md uppercase capitalize tracking-wide">
                  {selectedMeal.category}
                </span>
                <h2 className="text-heading-h4 font-bold text-neutral-white mt-2 leading-tight">{selectedMeal.name}</h2>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-8">

              {/* Macros Panel */}
              <div className="flex flex-col gap-3">
                <h3 className="text-body-md font-bold text-text-headings">Nutrition Information</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-meals-prim-100/50 p-4 rounded-2xl border border-meals-prim-100 text-center">
                    <p className="text-heading-h5 font-extrabold text-meals-prim leading-none">{selectedMeal.calories}</p>
                    <p className="text-body-xs text-text-disabled font-medium mt-1 uppercase">Calories</p>
                  </div>
                  <div className="bg-neutral-100 p-4 rounded-2xl border border-border-primary text-center">
                    <p className="text-heading-h5 font-extrabold text-text-headings leading-none">{selectedMeal.protein}g</p>
                    <p className="text-body-xs text-text-disabled font-medium mt-1 uppercase">Protein</p>
                  </div>
                  <div className="bg-neutral-100 p-4 rounded-2xl border border-border-primary text-center">
                    <p className="text-heading-h5 font-extrabold text-text-headings leading-none">{selectedMeal.carbs}g</p>
                    <p className="text-body-xs text-text-disabled font-medium mt-1 uppercase">Carbs</p>
                  </div>
                  <div className="bg-neutral-100 p-4 rounded-2xl border border-border-primary text-center">
                    <p className="text-heading-h5 font-extrabold text-text-headings leading-none">{selectedMeal.fat}g</p>
                    <p className="text-body-xs text-text-disabled font-medium mt-1 uppercase">Fats</p>
                  </div>
                </div>
              </div>

              {/* Ingredients */}
              <div className="flex flex-col gap-3 border-t border-border-primary pt-6">
                <h3 className="text-body-md font-bold text-text-headings">Ingredients Needed</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {selectedMeal.ingredients.map((ing, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-body-md text-text-body">
                      <div className="w-5 h-5 rounded-md border border-meals-prim bg-meals-prim-100/30 flex items-center justify-center shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-meals-prim" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      </div>
                      <span>{ing}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cooking Instructions */}
              <div className="flex flex-col gap-3 border-t border-border-primary pt-6">
                <h3 className="text-body-md font-bold text-text-headings">Cooking Instructions</h3>
                <ol className="flex flex-col gap-3.5">
                  {selectedMeal.instructions.map((step, idx) => (
                    <li key={idx} className="flex gap-4 text-body-md text-text-body items-start">
                      <span className="w-6 h-6 rounded-full bg-meals-prim-100 text-meals-prim flex items-center justify-center shrink-0 font-bold text-body-sm mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="flex-1 pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="border-t border-border-primary px-8 py-5 shrink-0 flex gap-4 bg-neutral-100">
              <Button
                variant="meals-outline"
                className="flex-1 font-bold"
                onClick={() => setSelectedMeal(null)}
              >
                Close Details
              </Button>
              <Button
                variant="meals-primary"
                className="flex-1 font-bold shadow-md"
                onClick={() => {
                  setMealToAddToPlan(selectedMeal)
                  setSelectedMeal(null)
                  setShowAddToPlanModal(true)
                }}
              >
                Add to Diet Plan
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* ── Add to Plan Selection Modal ── */}
      {showAddToPlanModal && mealToAddToPlan && (
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
                Select which customized diet plan and meal slot you would like to add <strong>"{mealToAddToPlan.name}"</strong> to.
              </p>

              {userPlans.length > 0 ? (
                <>
                  <DefinedField
                    id="target-plan-select"
                    label="Target Diet Plan"
                    value={targetPlanId}
                    onChange={handlePlanChange}
                    options={userPlans.map(plan => ({ value: plan.id, label: plan.name }))}
                    className="mb-4"
                  />

                  <DefinedField
                    id="target-slot-select"
                    label="Meal Slot"
                    value={targetSlot}
                    onChange={setTargetSlot}
                    options={(userPlans.find(p => p.id === targetPlanId)?.mealSlots || userPlans.find(p => p.id === targetPlanId)?.rawMealSlots || ['Breakfast', 'Lunch', 'Dinner', 'Snacks']).map(slot => ({ value: slot, label: slot }))}
                  />
                </>
              ) : (
                <div className="py-6 text-center border border-border-primary border-dashed rounded-xl bg-neutral-100">
                  <p className="text-body-md font-semibold text-text-disabled mb-1">No Active Diet Plans Found</p>
                  <p className="text-body-sm text-text-disabled">Please create a new diet plan in the Plans page first!</p>
                </div>
              )}
            </div>

            <div className="border-t border-border-primary px-6 py-4 flex gap-3 bg-neutral-100 shrink-0 rounded-b-3xl">
              <Button
                variant="meals-outline"
                className="flex-1 font-bold"
                onClick={() => setShowAddToPlanModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="meals-primary"
                className="flex-1 font-bold shadow-md"
                disabled={userPlans.length === 0}
                onClick={handleAddMealToPlan}
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
