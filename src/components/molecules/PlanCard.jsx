import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { cn } from '../utils.js'
import { Button } from '../atoms/Button'

// ── Plan type config ───────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  Diet: {
    progress:      'bg-meals-prim',
    gradient:      'var(--gradient-meals)',
    image:         'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80',
    badge:         'bg-meals-prim-100 text-meals-prim',
    detail:        'bg-meals-prim',
    btnPrimary:    'meals-primary',
    btnOutline:    'meals-outline',
  },
  Workout: {
    progress:      'bg-workout-prim',
    gradient:      'var(--gradient-workout)',
    image:         'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=400&q=80',
    badge:         'bg-workout-prim-100 text-workout-prim',
    detail:        'bg-workout-prim',
    btnPrimary:    'workout-primary',
    btnOutline:    'workout-outline',
  },
  Rehab: {
    progress:      'bg-rehab-prim',
    gradient:      'var(--gradient-rehab)',
    image:         'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80',
    badge:         'bg-rehab-prim-100 text-rehab-prim',
    detail:        'bg-rehab-prim',
    btnPrimary:    'rehab-primary',
    btnOutline:    'rehab-outline',
  },
}

// ── Progress bar ───────────────────────────────────────────────────────────────
function ProgressBar({ value, max, color = 'bg-surface-action' }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div className="w-full h-2 bg-neutral-100 rounded-round overflow-hidden">
      <div
        className={cn('h-full rounded-round transition-all duration-500', color)}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

// ── Closest item preview ───────────────────────────────────────────────────────
function ClosestPreview({ planId, planType, slots, routines, planImage, onToggleSlotTaken, onToggleExerciseDone, fallbackLabel }) {
  if (planType === 'Workout') {
    const todayStr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()]
    const todayRoutine = routines?.find(r => (r.assignedDays || []).includes(todayStr))

    if (!todayRoutine) {
      // If routines array is empty, we're on the list view (detail not loaded yet)
      const noRoutinesLoaded = !routines || routines.length === 0
      return (
        <div className="flex flex-col items-center justify-center w-full h-full text-center px-4 gap-2 min-w-[14rem]">
          <div className="w-12 h-12 rounded-full bg-workout-prim/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-workout-prim" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6.5 6.5h11M6.5 17.5h11M4 12h16M4 12a2 2 0 01-2-2V8a2 2 0 012-2M20 12a2 2 0 002-2V8a2 2 0 00-2-2M4 12a2 2 0 00-2 2v2a2 2 0 002 2M20 12a2 2 0 012 2v2a2 2 0 01-2 2"/>
            </svg>
          </div>
          <p className="text-body-md font-bold text-text-headings">
            {noRoutinesLoaded ? 'Today\'s Workout' : 'Rest Day'}
          </p>
          <p className="text-body-sm text-text-disabled">
            {noRoutinesLoaded ? 'Open the plan to see your schedule.' : 'Time to recover and recharge.'}
          </p>
        </div>
      )
    }

    if (!todayRoutine.exercises || todayRoutine.exercises.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center w-full h-full text-center px-4 min-w-[14rem]">
          <p className="text-body-md font-bold text-text-headings">No Exercises</p>
          <p className="text-body-sm text-text-disabled">This routine has no exercises yet.</p>
        </div>
      )
    }

    return (
      <div className="flex gap-3 min-w-[8rem] overflow-x-auto pb-2 scrollbar-hide flex-1">
        {todayRoutine.exercises.map((ex, idx) => {
          const title = typeof ex === 'string' ? ex : ex.title
          const taken = typeof ex === 'object' ? !!ex.taken : false
          const imageUrl = (typeof ex === 'object' && ex.thumbnail_url) ? ex.thumbnail_url : planImage
          
          return (
            <div key={idx} className="relative w-36 h-36 rounded-xl overflow-hidden shrink-0 border border-border-primary group">
              <img src={imageUrl} alt={title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              
              {taken && (
                <div className="absolute inset-0 bg-workout-prim/60 flex items-center justify-center pb-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-neutral-white opacity-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-neutral-black/90 via-neutral-black/40 to-neutral-black/10" />

              <div className="absolute inset-0 p-3 flex flex-col justify-end">
                <p className="text-[10px] font-bold text-neutral-white/90 uppercase leading-none mb-1 truncate drop-shadow-sm">Exercise {idx + 1}</p>
                <p className="text-body-sm font-semibold text-neutral-white leading-tight truncate mb-2 drop-shadow-sm" title={title}>
                  {title}
                </p>
                {taken ? (
                  <Button 
                    variant="workout-primary" size="sm"
                    onClick={(e) => { e.stopPropagation(); e.preventDefault(); onToggleExerciseDone?.(planId, todayRoutine.id, idx); }}
                    className="w-full py-1.5 shadow-lg border border-white/20 bg-workout-prim/80 text-neutral-white hover:bg-workout-prim"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Done
                  </Button>
                ) : (
                  <Button 
                    variant="workout-primary" size="sm"
                    onClick={(e) => { e.stopPropagation(); e.preventDefault(); onToggleExerciseDone?.(planId, todayRoutine.id, idx); }}
                    className="w-full py-1.5 shadow-lg border border-white/10"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Mark Done
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  if (planType !== 'Diet' || !slots || slots.length === 0) {
    if (planType === 'Diet') {
      // Diet plan on list view — no embedded meal data, show informational summary
      return (
        <div className="flex flex-col items-center justify-center w-full h-full text-center px-4 gap-3 min-w-[14rem]">
          <div className="w-12 h-12 rounded-full bg-meals-prim/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-meals-prim" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 11l19-9-9 19-2-8-8-2z"/>
            </svg>
          </div>
          <div>
            <p className="text-body-md font-bold text-text-headings">Closest Meal</p>
            <p className="text-body-sm text-text-disabled mt-0.5">
              Open the plan to see your meal schedule.
            </p>
          </div>
        </div>
      )
    }
    // Workout/Rehab with no slot data
    return (
      <div className="flex flex-col items-center gap-1 min-w-[4.5rem]">
        <p className="text-body-sm text-text-disabled font-semibold text-center leading-tight">{fallbackLabel}</p>
        <div className="w-full h-10 rounded-md bg-neutral-100" />
        <div className="w-6 h-6 rounded-md border border-border-primary flex items-center justify-center text-text-disabled">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      </div>
    )
  }

  const parseTimeToDate = (timeStr) => {
    if (!timeStr) return new Date(0)
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i)
    if (!match) return new Date(0)
    let [, hours, minutes, modifier] = match
    hours = parseInt(hours, 10)
    if (hours === 12) {
      hours = modifier.toUpperCase() === 'PM' ? 12 : 0
    } else if (modifier.toUpperCase() === 'PM') {
      hours += 12
    }
    const d = new Date()
    d.setHours(hours, parseInt(minutes, 10), 0, 0)
    return d
  }

  const now = new Date()
  
  // Sort all slots by time
  const sortedSlots = [...slots].sort((a, b) => parseTimeToDate(a.time) - parseTimeToDate(b.time))
  
  // Find bounding meals
  let pastMeal = null
  let futureMeal = null

  for (let i = 0; i < sortedSlots.length; i++) {
    if (parseTimeToDate(sortedSlots[i].time) <= now) {
      pastMeal = sortedSlots[i]
    } else {
      futureMeal = sortedSlots[i]
      break
    }
  }

  const displaySlots = []
  if (pastMeal) displaySlots.push(pastMeal)
  if (futureMeal) displaySlots.push(futureMeal)
  
  if (displaySlots.length === 1 && sortedSlots.length >= 2) {
    if (!pastMeal && sortedSlots[1]) displaySlots.push(sortedSlots[1])
    else if (!futureMeal && sortedSlots.length > 1) {
      const earlier = sortedSlots.find(s => s.id !== pastMeal.id)
      if (earlier) displaySlots.unshift(earlier)
    }
  }

  return (
    <div className="flex gap-3 min-w-[8rem]">
      {displaySlots.map(slot => {
        const meal = slot.meals?.find(m => m.id === slot.selectedMealId) || slot.meals?.[0]
        const imageUrl = meal?.image || meal?.image_url || planImage
        const mealName = meal?.name || meal?.title || 'No meal'

        return (
          <div key={slot.id} className="relative w-36 h-36 rounded-xl overflow-hidden shrink-0 border border-border-primary group">
            {/* Background Image */}
            <img src={imageUrl} alt={mealName} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />

            {/* Taken overlay — pointer-events-none so button underneath stays clickable */}
            {slot.taken && (
              <div className="absolute inset-0 bg-meals-prim/50 flex items-center justify-center pb-8 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-neutral-white drop-shadow-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            )}

            {/* Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-black/90 via-neutral-black/40 to-neutral-black/10" />

            {/* Content */}
            <div className="absolute inset-0 p-3 flex flex-col justify-end">
              <p className="text-[10px] font-bold text-neutral-white/90 uppercase leading-none mb-1 truncate drop-shadow-sm">{slot.label} • {slot.time}</p>
              <p className="text-body-sm font-semibold text-neutral-white leading-tight truncate mb-2 drop-shadow-sm" title={mealName}>
                {mealName}
              </p>
              {/* Single toggle — green when taken, dark-glass otherwise */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  onToggleSlotTaken?.(planId, slot.id)
                }}
                className={cn(
                  'w-full py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-lg border',
                  slot.taken
                    ? 'bg-meals-prim border-white/20 text-neutral-white hover:bg-meals-prim/70'
                    : 'bg-neutral-black/50 border-white/20 text-neutral-white hover:bg-meals-prim'
                )}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                {slot.taken ? 'Taken' : 'Mark Taken'}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Enrollment status badge ───────────────────────────────────────────────────
const STATUS_STYLES = {
  active:    'bg-success-100 text-success-700 border-success-200',
  paused:    'bg-warning-100 text-warning-700 border-warning-200',
  completed: 'bg-information-100 text-information-700 border-information-200',
  dropped:   'bg-error-100 text-error-600 border-error-200',
}
const STATUS_ICONS = {
  active:    '●',
  paused:    '⏸',
  completed: '✓',
  dropped:   '✕',
}
function EnrollmentBadge({ status }) {
  if (!status) return null
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLES[status] || ''}`}>
      <span>{STATUS_ICONS[status]}</span>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

// ── PlanCard ──────────────────────────────────────────────────────────────────
export function PlanCard({
  id,
  backendId,
  name,
  defaultTab = 'Diet',
  dateRange = 'Jan 01, 2026 → Feb 01, 2026 · 4 weeks',
  detail = 'Daily calorie target: kcal / day · Goal: Lose Weight',
  progress = 10,
  progressMax = 30,
  sessions,
  sessionsMax,
  ctaLabel = 'Log a meal',
  image,
  status,
  slots,
  slotCount,
  routines,
  onToggleSlotTaken,
  onToggleExerciseDone,
  // Preserved raw fields
  rawType,
  rawLevel,
  rawStartDate,
  rawEndDate,
  rawEquipment,
  rawWorkoutDays,
  rawDietPref,
  rawCalorieTarget,
  rawMealSlots,
  rawInjury,
  rawRehabDays,
  onDelete,
  // ── Enrollment props ────────────────────────────────────────────────────────
  enrollment,        // EnrollmentResponse object | undefined
  enrolling = false, // boolean — loading state for this card
  onEnroll,          // () => void
  onPauseEnrollment,
  onResumeEnrollment,
  onDropEnrollment,
  onCompleteEnrollment,
}) {
  const navigate = useNavigate()
  const planType = defaultTab
  const cfg = TYPE_CONFIG[planType] || TYPE_CONFIG.Diet
  const bgImage = image || cfg.image
  const closestLabel = planType === 'Diet' ? 'Closest\nMeal' : 'Closest\nWorkout'
  const isDraft = status === 'draft'
  const isCustomPlan = id !== 'diabetes-friendly' && id !== 'full-body' && id !== 'acl-injury'

  // Enrollment derived state
  const enrollStatus = enrollment?.status  // 'active'|'paused'|'completed'|'dropped'|undefined
  const isEnrolled   = !!enrollStatus
  const canEnroll    = !isEnrolled || enrollStatus === 'dropped' || enrollStatus === 'completed'
  const canPause     = enrollStatus === 'active'
  const canResume    = enrollStatus === 'paused'
  const canDrop      = enrollStatus === 'active' || enrollStatus === 'paused'
  const isTerminal   = enrollStatus === 'completed' || enrollStatus === 'dropped'

  return (
    <div className={cn(
      "flex flex-col xl:flex-row border border-border-primary rounded-xl overflow-hidden bg-surface-primary hover:shadow-md transition-all duration-300",
      isDraft && "bg-neutral-100/60 border-dashed",
      enrollStatus === 'active' && "ring-1 ring-success-300",
      enrollStatus === 'paused' && "ring-1 ring-warning-300",
    )}>

      {/* Left panel — fixed width, image background */}
      <div
        className={cn(
          "relative shrink-0 w-full h-40 xl:w-40 xl:h-auto flex items-end justify-start p-4 overflow-hidden transition-opacity duration-300",
          isDraft && "opacity-50 saturate-50"
        )}
        style={{
          backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 60%, transparent 100%), url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
         }}
       >
        {/* Type badge top-right */}
        <span className={cn('absolute top-2 right-2 text-body-sm font-bold px-2 py-0.5 rounded-round', cfg.badge)}>
          {planType}
        </span>
        {/* Enrollment status badge top-left */}
        {enrollStatus && (
          <span className="absolute top-2 left-2">
            <EnrollmentBadge status={enrollStatus} />
          </span>
        )}
        {/* Plan name bottom-left */}
        <span className="text-body-md font-bold text-neutral-white leading-tight">{name}</span>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 px-5 py-4 gap-3 min-w-0">

        {/* Date range */}
        <p className="text-body-sm text-text-disabled">{dateRange}</p>

        {/* Highlighted detail */}
        <div className={cn('px-3 py-1.5 rounded-md text-body-sm font-semibold text-neutral-white w-fit max-w-full', cfg.detail)}>
          {detail}
        </div>

        {/* Progress */}
        <div className="flex flex-col gap-1">
          <ProgressBar value={progress} max={progressMax} color={cfg.progress} />
          {planType === 'Diet' && slots ? (
            <p className="text-body-sm text-text-disabled">
              {progress} / {progressMax} meals taken today
            </p>
          ) : planType === 'Diet' && slotCount !== undefined ? (
            <p className="text-body-sm text-text-disabled">
              {slotCount} meal{slotCount !== 1 ? 's' : ''} assigned to this plan
            </p>
          ) : planType === 'Workout' && routines ? (
            <p className="text-body-sm text-text-disabled">
              {progress} / {progressMax} exercises completed today
            </p>
          ) : sessions !== undefined ? (
            <p className="text-body-sm text-text-disabled">
              {sessions} / {sessionsMax} {planType === 'Diet' ? 'days on track' : 'sessions completed'}
            </p>
          ) : null}
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap gap-2 mt-1">
          {isDraft ? (
            <Button
              variant={cfg.btnPrimary}
              size="sm"
              onClick={() => {
                navigate('/plans/create', {
                  state: {
                    draftPlan: {
                      id, name, defaultTab, dateRange, detail, progress, progressMax,
                      sessions, sessionsMax, ctaLabel, image, status,
                      rawType, rawLevel, rawStartDate, rawEndDate, rawEquipment,
                      rawWorkoutDays, rawDietPref, rawCalorieTarget, rawMealSlots,
                      rawInjury, rawRehabDays,
                    }
                  }
                })
              }}
            >
              Continue Editing Plan
            </Button>
          ) : (
            <>
              <Button
                variant={cfg.btnOutline}
                size="sm"
                onClick={() => {
                  const type = planType.toLowerCase()
                  const planId = backendId || id || name.replace(/\s+/g, '-').toLowerCase()
                  navigate(`/plans/${type}/${planId}`)
                }}
              >
                View Plan
              </Button>
              {planType !== 'Rehab' && (
                <Button variant={cfg.btnPrimary} size="sm">
                  {ctaLabel}
                </Button>
              )}
            </>
          )}

          {/* ── Enrollment actions ────────────────────────────────────────── */}
          {!isDraft && (
            <>
              {canEnroll && (
                <button
                  id={`enroll-btn-${id}`}
                  onClick={(e) => { e.stopPropagation(); onEnroll?.() }}
                  disabled={enrolling}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-body-sm font-bold transition-all border shadow-sm',
                    enrolling
                      ? 'opacity-50 cursor-not-allowed border-border-primary text-text-disabled'
                      : 'bg-success-600 border-success-700 text-neutral-white hover:bg-success-700'
                  )}
                  title={isTerminal ? 'Re-enroll in this plan' : 'Enroll in this plan'}
                >
                  {enrolling ? '…' : isTerminal ? '↩ Re-enroll' : '+ Enroll'}
                </button>
              )}
              {canPause && (
                <button
                  id={`pause-enroll-btn-${id}`}
                  onClick={(e) => { e.stopPropagation(); onPauseEnrollment?.() }}
                  disabled={enrolling}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-body-sm font-bold border border-warning-300 text-warning-700 bg-warning-50 hover:bg-warning-100 transition-colors disabled:opacity-50"
                  title="Pause enrollment"
                >
                  {enrolling ? '…' : '⏸ Pause'}
                </button>
              )}
              {canResume && (
                <button
                  id={`resume-enroll-btn-${id}`}
                  onClick={(e) => { e.stopPropagation(); onResumeEnrollment?.() }}
                  disabled={enrolling}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-body-sm font-bold border border-success-300 text-success-700 bg-success-50 hover:bg-success-100 transition-colors disabled:opacity-50"
                  title="Resume enrollment"
                >
                  {enrolling ? '…' : '▶ Resume'}
                </button>
              )}
              {canDrop && (
                <button
                  id={`drop-enroll-btn-${id}`}
                  onClick={(e) => { e.stopPropagation(); onDropEnrollment?.() }}
                  disabled={enrolling}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-body-sm font-bold border border-error-200 text-error-500 bg-error-50 hover:bg-error-100 transition-colors disabled:opacity-50"
                  title="Drop this enrollment"
                >
                  {enrolling ? '…' : '✕ Drop'}
                </button>
              )}
            </>
          )}

          {/* Sleek Trash Delete button for custom user plans */}
          {isCustomPlan && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete?.(id)
              }}
              className="p-2 text-text-disabled hover:text-error-500 rounded-xl bg-neutral-100 hover:bg-error-100/30 border border-border-primary transition-all shadow-sm shrink-0 ml-auto"
              title="Delete Plan"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Closest preview column */}
      <div className="border-t xl:border-t-0 xl:border-l border-border-primary px-4 py-4 flex items-center overflow-x-auto w-full xl:w-auto xl:min-w-[22rem]">
        <ClosestPreview 
          planId={id}  
          planType={planType} 
          slots={slots} 
          routines={routines}
          planImage={cfg.image}
          onToggleSlotTaken={onToggleSlotTaken} 
          onToggleExerciseDone={onToggleExerciseDone}
          fallbackLabel={closestLabel} 
        />
      </div>
    </div>
  )
}
