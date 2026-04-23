import { useState, useRef, useEffect } from 'react'
import { cn } from '../utils.js'

function formatDate(date) {
  if (!date) return ''
  const d = String(date.getDate()).padStart(2, '0')
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const y = date.getFullYear()
  return `${d}/${m}/${y}`
}

function isSameDay(a, b) {
  return a && b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

function isDisabledDay(date, minDate, maxDate) {
  if (minDate && date < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())) return true
  if (maxDate && date > new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate())) return true
  return false
}

function getCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  let startDow = firstDay.getDay()
  startDow = startDow === 0 ? 6 : startDow - 1

  const days = []
  for (let i = startDow - 1; i >= 0; i--) {
    days.push({ date: new Date(year, month, -i), currentMonth: false })
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push({ date: new Date(year, month, d), currentMonth: true })
  }
  let trailing = 1
  while (days.length % 7 !== 0) {
    days.push({ date: new Date(year, month + 1, trailing++), currentMonth: false })
  }
  return days
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 1v3M11 1v3M2 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function DatePicker({
  value,
  defaultValue = null,
  minDate,
  maxDate,
  disabled = false,
  error = false,
  label,
  helperText,
  errorMessage,
  required = false,
  placeholder = 'DD/MM/YYYY',
  id,
  onChange,
  className,
}) {
  const isControlled = value !== undefined
  const [internalValue, setInternalValue] = useState(defaultValue)
  const selectedDate = isControlled ? value : internalValue

  const today = new Date()
  const [open, setOpen] = useState(false)
  const [viewYear, setViewYear] = useState(
    selectedDate ? selectedDate.getFullYear() : today.getFullYear()
  )
  const [viewMonth, setViewMonth] = useState(
    selectedDate ? selectedDate.getMonth() : today.getMonth()
  )
  const containerRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function handleMouseDown(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [open])

  useEffect(() => {
    if (!open) return
    function handleKeyDown(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  function handleToggle() {
    if (disabled) return
    if (!open) {
      const d = selectedDate || today
      setViewYear(d.getFullYear())
      setViewMonth(d.getMonth())
    }
    setOpen(prev => !prev)
  }

  function handleSelectDay(date) {
    if (!isControlled) setInternalValue(date)
    onChange?.(date)
    setOpen(false)
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const days = getCalendarDays(viewYear, viewMonth)
  const hasValue = !!selectedDate

  const triggerBase = 'w-full flex items-center justify-between rounded-md px-4 py-2 text-body-md border transition-colors focus:outline-none'
  const triggerState = disabled
    ? 'bg-surface-disabled border-border-disabled text-text-disabled cursor-not-allowed'
    : error
      ? 'border-border-error bg-surface-primary text-text-body'
      : 'border-border-primary bg-surface-primary text-text-body hover:border-border-focus'

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {label && (
        <label htmlFor={id} className="block text-body-sm font-semibold text-text-body mb-1">
          {label}
          {required && <span className="text-text-error ml-1" aria-hidden="true">*</span>}
        </label>
      )}

      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(triggerBase, triggerState)}
      >
        <span className={cn(!hasValue && 'text-text-disabled')}>
          {hasValue ? formatDate(selectedDate) : placeholder}
        </span>
        <CalendarIcon />
      </button>

      {errorMessage && (
        <p className="mt-1 text-body-sm text-text-error">{errorMessage}</p>
      )}
      {!errorMessage && helperText && (
        <p className="mt-1 text-body-sm text-text-disabled">{helperText}</p>
      )}

      {open && (
        <div
          role="dialog"
          aria-label="Date picker calendar"
          className="absolute z-50 mt-1 rounded-md border border-border-primary bg-surface-primary shadow-lg p-4"
          style={{ minWidth: '280px' }}
        >
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 rounded-md text-text-action hover:bg-surface-action-hover2 transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft />
            </button>
            <span className="text-body-md font-semibold text-text-headings">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1 rounded-md text-text-action hover:bg-surface-action-hover2 transition-colors"
              aria-label="Next month"
            >
              <ChevronRight />
            </button>
          </div>

          <div className="grid grid-cols-7 mb-1">
            {DAY_HEADERS.map(day => (
              <div key={day} className="text-center text-body-sm font-semibold text-text-disabled py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map(({ date, currentMonth }, idx) => {
              const isToday = isSameDay(date, today)
              const isSelected = isSameDay(date, selectedDate)
              const isDisabled = isDisabledDay(date, minDate, maxDate)

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => !isDisabled && handleSelectDay(date)}
                  aria-label={formatDate(date)}
                  aria-pressed={isSelected}
                  className={cn(
                    'w-8 h-8 rounded-md text-body-sm flex items-center justify-center transition-colors',
                    isDisabled
                      ? 'text-text-disabled cursor-not-allowed opacity-50'
                      : isSelected
                        ? 'bg-surface-action text-text-on-action font-semibold cursor-pointer'
                        : isToday
                          ? 'border border-border-action text-text-action hover:bg-surface-action-hover2 cursor-pointer'
                          : !currentMonth
                            ? 'text-text-disabled hover:bg-surface-action-hover2 cursor-pointer'
                            : 'text-text-body hover:bg-surface-action-hover2 cursor-pointer'
                  )}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
