import { cn } from '../utils.js'

const TABS = [
  { id: 'today',     label: "Today's meals" },
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch',     label: 'Lunch' },
  { id: 'dinner',    label: 'Dinner' },
]

export function MealTabBar({ activeTab = 'today', onTabChange }) {
  return (
    <div className="flex items-stretch border-b border-border-primary bg-surface-primary">
      {TABS.map(({ id, label }) => {
        const isActive = activeTab === id
        return (
          <button
            key={id}
            id={`meal-tab-${id}`}
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange?.(id)}
            className={cn(
              'px-6 py-4 text-body-md font-semibold transition-colors relative shrink-0',
              isActive
                ? 'text-text-action'
                : 'text-text-body hover:text-text-action'
            )}
          >
            {label}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-surface-action rounded-t-sm" />
            )}
          </button>
        )
      })}
    </div>
  )
}
