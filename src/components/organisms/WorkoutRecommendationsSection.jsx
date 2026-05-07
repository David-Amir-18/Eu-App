import { useState, useMemo } from 'react'
import { WorkoutCard } from '../molecules/WorkoutCard.jsx'
import { cn } from '../utils.js'

// ── Mock recommended workouts (matches backend shape) ─────────────────────────
// Replace this with a real API call when the backend is wired up.
const MOCK_WORKOUTS = [
  {
    id: '4F5866F8',
    title: 'Back Extension (Hyperextension)',
    priority: 10,
    muscle_group: 'lower_back',
    other_muscles: ['hamstrings', 'glutes'],
    exercise_type: 'reps_only',
    equipment_category: 'machine',
    url: 'https://d2l9nsnmtah87f.cloudfront.net/exercise-assets/18601201-Hyperextension-(VERSION-2)_Hips.mp4',
    media_type: 'video',
    manual_tag: 'hyper extension',
    thumbnail_url: 'https://d2l9nsnmtah87f.cloudfront.net/exercise-thumbnails/18601201-Hyperextension-(VERSION-2)_Hips_thumbnail@3x.jpg',
    is_custom: false,
    is_archived: false,
    hundred_percent_bodyweight_exercise: false,
    instructions:
      '1. Set yourself up on a back extension machine. Have your hips and thighs against the pad and your ankles locked on the foot brace.\n2. Engage your abs, cross your arms in front of your chest, and take a breath.\n3. Lower yourself by bending at the hips and move down until you feel a stretch in your hamstrings and glutes.\n4. Engage your buttocks and lower back to raise your torso to the top position, pausing for a moment and exhaling.',
  },
  {
    id: 'A1B2C3D4',
    title: 'Romanian Deadlift',
    priority: 9,
    muscle_group: 'hamstrings',
    other_muscles: ['glutes', 'lower_back'],
    exercise_type: 'reps_only',
    equipment_category: 'barbell',
    url: null,
    media_type: 'video',
    manual_tag: 'rdl',
    thumbnail_url: null,
    is_custom: false,
    is_archived: false,
    hundred_percent_bodyweight_exercise: false,
    instructions:
      '1. Stand hip-width apart holding a barbell in front of your thighs.\n2. Hinge at the hips, pushing them back while lowering the bar along your legs.\n3. Feel a deep stretch in your hamstrings, keeping your back flat.\n4. Drive your hips forward to return to standing and squeeze your glutes at the top.',
  },
  {
    id: 'E5F6G7H8',
    title: 'Plank Hold',
    priority: 6,
    muscle_group: 'core',
    other_muscles: ['shoulders', 'glutes'],
    exercise_type: 'duration',
    equipment_category: 'bodyweight',
    url: null,
    media_type: null,
    manual_tag: 'plank',
    thumbnail_url: null,
    is_custom: false,
    is_archived: false,
    hundred_percent_bodyweight_exercise: true,
    instructions:
      '1. Start in a push-up position with your forearms on the floor, elbows directly beneath your shoulders.\n2. Keep your body in a straight line from head to heels.\n3. Engage your core, squeeze your glutes, and breathe steadily.\n4. Hold for the prescribed duration without letting your hips drop or rise.',
  },
  {
    id: 'I9J0K1L2',
    title: 'Cable Lat Pulldown',
    priority: 7,
    muscle_group: 'back',
    other_muscles: ['biceps', 'shoulders'],
    exercise_type: 'reps_only',
    equipment_category: 'cable',
    url: null,
    media_type: null,
    manual_tag: 'pulldown',
    thumbnail_url: null,
    is_custom: false,
    is_archived: false,
    hundred_percent_bodyweight_exercise: false,
    instructions:
      '1. Sit at the lat pulldown station and grip the bar slightly wider than shoulder-width.\n2. Lean back slightly and pull the bar down to your upper chest.\n3. Squeeze your lats at the bottom and control the return to the top.\n4. Avoid swinging or using momentum.',
  },
]

// ── Filter tabs ───────────────────────────────────────────────────────────────
const FILTERS = ['All', 'Lower Back', 'Hamstrings', 'Glutes', 'Core', 'Back']

function matchesFilter(workout, filter) {
  if (filter === 'All') return true
  const key = filter.toLowerCase().replace(/\s+/g, '_')
  return (
    workout.muscle_group?.toLowerCase() === key ||
    workout.other_muscles?.some((m) => m.toLowerCase() === key)
  )
}

// ── SortButton ────────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { value: 'priority', label: 'Priority' },
  { value: 'title', label: 'Name (A–Z)' },
]

// ── Empty state ────────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center gap-3 py-16 text-center">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-neutral-300" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6.5 6.5h11M6.5 17.5h11M4 12h16M4 12a2 2 0 01-2-2V8a2 2 0 012-2M20 12a2 2 0 002-2V8a2 2 0 00-2-2M4 12a2 2 0 00-2 2v2a2 2 0 002 2M20 12a2 2 0 012 2v2a2 2 0 01-2 2" />
      </svg>
      <p className="text-body-md text-text-disabled font-semibold">No exercises match this filter.</p>
      <p className="text-body-sm text-text-disabled">Try selecting a different muscle group.</p>
    </div>
  )
}

// ── WorkoutRecommendationsSection ─────────────────────────────────────────────
export function WorkoutRecommendationsSection({ workouts = MOCK_WORKOUTS }) {
  const [activeFilter, setActiveFilter] = useState('All')
  const [sortBy, setSortBy] = useState('priority')
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = useMemo(() => {
    let result = workouts.filter((w) => !w.is_archived)

    // Filter by muscle group
    result = result.filter((w) => matchesFilter(w, activeFilter))

    // Search by title or tag
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (w) =>
          w.title?.toLowerCase().includes(q) ||
          w.manual_tag?.toLowerCase().includes(q) ||
          w.muscle_group?.toLowerCase().includes(q)
      )
    }

    // Sort
    if (sortBy === 'priority') {
      result = [...result].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
    } else {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title))
    }

    return result
  }, [workouts, activeFilter, sortBy, searchQuery])

  return (
    <section
      className="flex flex-col gap-6"
      aria-label="Workout Recommendations"
    >
      {/* Section header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-heading-h4 font-bold text-text-headings">
            Workout Recommendations
          </h2>
          <p className="text-body-md text-text-body">
            Exercises tailored to your plan — tap a card to preview the video.
          </p>
        </div>

        {/* Sort control */}
        <div className="flex items-center gap-2">
          <label htmlFor="workout-sort" className="text-body-sm text-text-disabled font-semibold whitespace-nowrap">
            Sort by
          </label>
          <select
            id="workout-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-body-sm font-semibold text-text-action bg-surface-primary border border-border-action rounded-lg px-3 py-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-border-focus cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-disabled pointer-events-none"
          viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          id="workout-search"
          type="search"
          placeholder="Search exercises…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-body-md text-text-body bg-surface-primary border border-border-primary rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus:border-border-action transition-colors placeholder:text-text-disabled"
          aria-label="Search exercises"
        />
      </div>

      {/* Filter chips */}
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Filter by muscle group"
      >
        {FILTERS.map((f) => (
          <button
            key={f}
            id={`workout-filter-${f.toLowerCase().replace(/\s+/g, '-')}`}
            onClick={() => setActiveFilter(f)}
            className={cn(
              'px-3 py-1.5 rounded-round text-body-sm font-semibold transition-colors border',
              activeFilter === f
                ? 'bg-surface-action text-text-on-action border-transparent'
                : 'bg-surface-primary text-text-body border-border-primary hover:border-border-action hover:text-text-action'
            )}
            aria-pressed={activeFilter === f}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-2">
        <span className="text-body-sm text-text-disabled">
          Showing <strong className="text-text-headings">{filtered.length}</strong> of{' '}
          <strong className="text-text-headings">{workouts.filter((w) => !w.is_archived).length}</strong> exercises
        </span>
      </div>

      {/* Card grid */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
        aria-live="polite"
        aria-label="Exercise list"
      >
        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          filtered.map((workout) => (
            <WorkoutCard key={workout.id} {...workout} />
          ))
        )}
      </div>
    </section>
  )
}
