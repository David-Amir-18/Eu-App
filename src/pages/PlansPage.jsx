import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PlanCard } from '../components/molecules/PlanCard.jsx'
import { Button } from '../components/atoms/Button.jsx'
import { cn } from '../components/utils.js'



const TABS = ['All', 'Active', 'Planned', 'Completed', 'Drafts']

export default function PlansPage() {
  const [activeTab, setActiveTab] = useState('All')

  // Load custom plans from localStorage and combine with ALL_PLANS
  const [plans, setPlans] = useState(() => {
    try {
      const stored = localStorage.getItem('user_plans')
      const parsed = stored ? JSON.parse(stored) : []
      return [...parsed, ...ALL_PLANS]
    } catch {
      return ALL_PLANS
    }
  })

  const filteredPlans = plans.filter(plan => {
    if (activeTab === 'All') return plan.status !== 'draft'
    if (activeTab === 'Drafts') return plan.status === 'draft'
    return plan.status.toLowerCase() === activeTab.toLowerCase()
  })

  return (
    <div className="flex flex-col min-h-screen bg-neutral-100">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="bg-surface-primary border-b border-border-primary pt-12 pb-8 px-8 md:px-12 relative overflow-hidden animate-fade-in">
        {/* Abstract background blobs */}
        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-success-100 rounded-full opacity-40 blur-3xl" />
        <div className="absolute bottom-[-50px] left-[10%] w-48 h-48 bg-information-100 rounded-full opacity-40 blur-3xl" />

        <div className="relative z-10 flex flex-col items-start gap-4">
          <h1 className="text-heading-h3 font-bold text-text-headings">Your Plans</h1>
          <p className="text-body-lg text-text-disabled max-w-xl">
            Manage your active fitness routines, view upcoming plans, and look back at your completed achievements.
          </p>

          <div className="flex flex-wrap gap-2 mt-4 bg-neutral-100 p-1.5 rounded-xl border border-border-primary">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-body-sm font-semibold transition-all",
                  activeTab === tab
                    ? "bg-surface-primary text-text-action shadow-sm border border-border-primary"
                    : "text-text-disabled hover:text-text-headings"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto px-8 py-8 md:px-12 flex flex-col gap-10 animate-fade-in" style={{ animationDelay: '0.1s' }}>

        <section aria-label="Plans List" className="flex flex-col gap-6">
          <div className="flex flex-col gap-5">
            {filteredPlans.length > 0 ? (
              filteredPlans.map(plan => (
                <PlanCard key={plan.id} {...plan} />
              ))
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center border border-border-primary border-dashed rounded-xl bg-surface-primary opacity-70">
                <p className="text-body-lg font-semibold text-text-disabled mb-2">No {activeTab.toLowerCase()} plans found.</p>
                <p className="text-body-md text-text-disabled">Try switching tabs or creating a new plan.</p>
              </div>
            )}
          </div>

          {/* Create new plan CTA */}
          <div className="border border-border-primary border-dashed rounded-xl px-8 py-10 flex flex-col items-center gap-3 bg-surface-primary hover:bg-neutral-100 transition-colors mt-4">
            <h3 className="text-heading-h6 font-bold text-text-headings">Create a New Plan</h3>
            <p className="text-body-md text-text-body text-center max-w-sm">
              Start a new meal, workout, or rehab plan tailored just for you.
            </p>
            <Link to="/plans/create" id="create-plan-cta">
              <Button size="sm" className="mt-1 shadow-sm">+ New Plan</Button>
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}
