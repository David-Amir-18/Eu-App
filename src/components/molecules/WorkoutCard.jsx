import { useState } from 'react'
import { cn } from '../utils.js'

// ── Muscle group colour mapping ────────────────────────────────────────────────
const MUSCLE_COLORS = {
  lower_back:   { bg: 'bg-secondary-100', text: 'text-secondary-600', label: 'Lower Back' },
  hamstrings:   { bg: 'bg-warning-100',   text: 'text-warning-500',   label: 'Hamstrings'  },
  glutes:       { bg: 'bg-error-100',     text: 'text-error-600',     label: 'Glutes'      },
  chest:        { bg: 'bg-information-100', text: 'text-information-600', label: 'Chest'   },
  back:         { bg: 'bg-primary-100',   text: 'text-primary-500',   label: 'Back'        },
  shoulders:    { bg: 'bg-success-100',   text: 'text-success-700',   label: 'Shoulders'   },
  biceps:       { bg: 'bg-custard-100',   text: 'text-custard-600',   label: 'Biceps'      },
  triceps:      { bg: 'bg-fern-100',      text: 'text-fern-500',      label: 'Triceps'     },
  core:         { bg: 'bg-blackberry-100',text: 'text-blackberry-500',label: 'Core'        },
  quads:        { bg: 'bg-ash-100',       text: 'text-ash-600',       label: 'Quads'       },
  calves:       { bg: 'bg-sandy-flame-100', text: 'text-sandy-flame-500', label: 'Calves' },
}

const DEFAULT_MUSCLE = { bg: 'bg-neutral-100', text: 'text-neutral-500', label: null }

function getMuscle(key) {
  if (!key) return DEFAULT_MUSCLE
  const found = MUSCLE_COLORS[key.toLowerCase().replace(/\s+/g, '_')]
  return found || { ...DEFAULT_MUSCLE, label: key }
}

// ── Equipment badge ────────────────────────────────────────────────────────────
const EQUIPMENT_ICONS = {
  machine:     '🏋️',
  barbell:     '🪝',
  dumbbell:    '💪',
  bodyweight:  '🤸',
  cable:       '⚙️',
  kettlebell:  '🔔',
  band:        '🪢',
  default:     '🏅',
}

function equipmentIcon(cat) {
  if (!cat) return EQUIPMENT_ICONS.default
  return EQUIPMENT_ICONS[cat.toLowerCase()] || EQUIPMENT_ICONS.default
}

// ── Priority pill ──────────────────────────────────────────────────────────────
function PriorityPill({ priority }) {
  const color =
    priority >= 8  ? 'bg-error-100 text-error-600' :
    priority >= 5  ? 'bg-warning-100 text-warning-500' :
    'bg-success-100 text-success-700'

  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-round text-body-sm font-semibold', color)}>
      <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24"
        fill="currentColor" aria-hidden="true">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      Priority {priority}
    </span>
  )
}

// ── Thumbnail / video preview ─────────────────────────────────────────────────
function MediaPreview({ thumbnailUrl, videoUrl, title }) {
  const [playing, setPlaying] = useState(false)

  return (
    <div
      className="relative w-full aspect-video rounded-lg overflow-hidden bg-neutral-100 cursor-pointer group"
      onClick={() => setPlaying(true)}
      role="button"
      aria-label={`Play video for ${title}`}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && setPlaying(true)}
    >
      {playing ? (
        <video
          src={videoUrl}
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          controls
        />
      ) : (
        <>
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-neutral-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-neutral-400" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
          )}
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-black/20 group-hover:bg-neutral-black/30 transition-colors">
            <div className="w-12 h-12 rounded-round bg-surface-primary/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-text-action ml-0.5" viewBox="0 0 24 24"
                fill="currentColor" aria-hidden="true">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ── Instructions expander ─────────────────────────────────────────────────────
function Instructions({ text }) {
  const [expanded, setExpanded] = useState(false)

  if (!text) return null

  const lines = text.split('\n').filter(Boolean)

  return (
    <div className="flex flex-col gap-2">
      <button
        id="workout-card-instructions-toggle"
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-1.5 text-body-sm font-semibold text-text-action hover:text-text-action-hover transition-colors w-fit"
        aria-expanded={expanded}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={cn('w-4 h-4 transition-transform duration-200', expanded && 'rotate-90')}
          viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
        {expanded ? 'Hide' : 'Show'} instructions
      </button>

      {expanded && (
        <ol className="flex flex-col gap-2 pl-1">
          {lines.map((line, i) => (
            <li key={i} className="flex gap-2 text-body-sm text-text-body leading-relaxed">
              <span className="shrink-0 w-5 h-5 rounded-round bg-primary-100 text-text-action text-body-sm font-bold flex items-center justify-center mt-px">
                {i + 1}
              </span>
              <span>{line.replace(/^\d+\.\s*/, '')}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

// ── WorkoutCard ───────────────────────────────────────────────────────────────
export function WorkoutCard({
  id,
  title,
  priority,
  muscle_group,
  other_muscles = [],
  exercise_type,
  equipment_category,
  url,
  media_type,
  thumbnail_url,
  instructions,
  manual_tag,
}) {
  const primary = getMuscle(muscle_group)

  return (
    <article
      id={`workout-card-${id}`}
      className="flex flex-col gap-4 bg-surface-primary border border-border-primary rounded-lg p-4 hover:shadow-md transition-shadow"
      aria-label={`Exercise: ${title}`}
    >
      {/* Media */}
      {url && media_type === 'video' && (
        <MediaPreview thumbnailUrl={thumbnail_url} videoUrl={url} title={title} />
      )}

      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <h3 className="text-body-lg font-semibold text-text-headings leading-snug flex-1">
            {title}
          </h3>
          {priority !== undefined && <PriorityPill priority={priority} />}
        </div>

        {/* Muscle group badges */}
        <div className="flex flex-wrap gap-1.5">
          {/* Primary muscle */}
          <span className={cn('px-2 py-0.5 rounded-round text-body-sm font-semibold', primary.bg, primary.text)}>
            {primary.label || muscle_group}
          </span>
          {/* Secondary muscles */}
          {other_muscles.map((m) => {
            const s = getMuscle(m)
            return (
              <span key={m} className={cn('px-2 py-0.5 rounded-round text-body-sm', s.bg, s.text)}>
                {s.label || m}
              </span>
            )
          })}
        </div>

        {/* Equipment & type row */}
        <div className="flex items-center gap-3 flex-wrap">
          {equipment_category && (
            <span className="flex items-center gap-1 text-body-sm text-text-disabled">
              <span aria-hidden="true">{equipmentIcon(equipment_category)}</span>
              <span className="capitalize">{equipment_category.replace(/_/g, ' ')}</span>
            </span>
          )}
          {exercise_type && (
            <span className="flex items-center gap-1 text-body-sm text-text-disabled">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {exercise_type.replace(/_/g, ' ')}
            </span>
          )}
          {manual_tag && (
            <span className="text-body-sm text-text-disabled italic">#{manual_tag}</span>
          )}
        </div>
      </div>

      {/* Instructions */}
      <Instructions text={instructions} />
    </article>
  )
}
