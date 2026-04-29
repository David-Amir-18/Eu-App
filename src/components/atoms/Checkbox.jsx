import { useRef, useEffect } from 'react'
import { cn } from '../utils.js'

export function Checkbox({
  checked,
  defaultChecked,
  disabled = false,
  indeterminate = false,
  label,
  id,
  name,
  onChange,
  className,
}) {
  const inputRef = useRef(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate
    }
  }, [indeterminate])

  const isChecked = checked ?? false
  const isActive = indeterminate || isChecked

  const boxClasses = cn(
    'w-4 h-4 rounded-sm border-2 flex items-center justify-center transition-colors flex-shrink-0',
    disabled
      ? 'border-border-disabled bg-surface-disabled cursor-not-allowed'
      : isActive
      ? 'border-border-action bg-surface-action'
      : 'border-border-primary bg-surface-primary',
  )

  const wrapperClasses = cn(
    'inline-flex items-center gap-2',
    disabled ? 'cursor-not-allowed' : 'cursor-pointer',
    className,
  )

  const labelClasses = cn(
    'text-body-md select-none',
    disabled ? 'text-text-disabled cursor-not-allowed' : 'text-text-body',
  )

  return (
    <label className={wrapperClasses}>
      <input
        ref={inputRef}
        type="checkbox"
        id={id}
        name={name}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        onChange={onChange}
        aria-disabled={disabled ? 'true' : undefined}
        className="sr-only"
      />
      <div className={boxClasses} aria-hidden="true">
        {indeterminate ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <rect x="2" y="5.25" width="8" height="1.5" rx="0.75" fill="white" />
          </svg>
        ) : isChecked ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path
              d="M2 6L4.5 8.5L10 3"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </div>
      {label && <span className={labelClasses}>{label}</span>}
    </label>
  )
}
