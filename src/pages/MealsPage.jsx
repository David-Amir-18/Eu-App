import { useState } from 'react'
import { MealTabBar } from '../components/organisms/MealTabBar.jsx'
import { Button } from '../components/atoms/Button.jsx'

export default function MealsPage() {
  const [mealTab, setMealTab] = useState('today')

  // Derive title based on active tab
  const getTabTitle = () => {
    switch(mealTab) {
      case 'breakfast': return 'Breakfast'
      case 'lunch': return 'Lunch'
      case 'dinner': return 'Dinner'
      case 'today':
      default: return "Today's Meals"
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface-page">
      {/* ── Tabs ────────────────────────────────────────────────────────────── */}
      <MealTabBar activeTab={mealTab} onTabChange={setMealTab} />

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto px-8 py-8 md:px-12 flex flex-col gap-10 animate-fade-in">
        
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-heading-h3 font-bold text-text-headings">{getTabTitle()}</h1>
          <p className="text-body-lg text-text-disabled">
            Track your nutrition, discover healthy recipes, and stay on top of your dietary goals.
          </p>
        </div>

        {/* Empty State / Placeholder */}
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border-primary rounded-xl bg-neutral-100 opacity-80 min-h-[400px]">
          <div className="w-16 h-16 bg-surface-primary rounded-full flex items-center justify-center mb-4 shadow-sm text-text-disabled">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 11l19-9-9 19-2-8-8-2z" />
            </svg>
          </div>
          <h2 className="text-heading-h5 font-bold text-text-headings mb-2">No meals logged yet</h2>
          <p className="text-body-md text-text-disabled mb-6 text-center max-w-sm">
            It looks like you haven't logged any meals for {getTabTitle().toLowerCase()} yet.
          </p>
          <Button>Log a Meal</Button>
        </div>

      </div>
    </div>
  )
}
