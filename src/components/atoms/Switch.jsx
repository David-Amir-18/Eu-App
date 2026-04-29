import { useState } from 'react'
import { cn } from '../utils.js'

export function Switch({
  checked,
  defaultChecked = false,
  disabled = false,
  label,
  id,
  onChange,
  className,
}) {
  const isControlled = checked !== undefined
  const [internalChecked, setInternalChecked] = useState(defaultChecked)

  const isChecked = isControlled ? checked : internalChecked

  function handleClick() {
    if (disabled) return
    const next = !isChecked
    if (!isControlled) setInternalChecked(next)
    onChange?.(next)
  }

  const trackClasses = cn(
    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none',
    disabled
      ? 'bg-surface-disabled cursor-not-allowed'
      : isChecked
      ? 'bg-surface-action'
      : 'bg-neutral-300',
  )

  const thumbClasses = cn(
    'inline-block h-4 w-4 transform rounded-full bg-neutral-white transition-transform',
    isChecked ? 'translate-x-6' : 'translate-x-1',
    disabled && 'bg-neutral-200',
  )

  const labelClasses = cn(
    'text-body-md text-text-body ml-2 select-none',
    disabled && 'text-text-disabled cursor-not-allowed',
  )

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <button
        type="button"
        role="switch"
        id={id}
        aria-checked={isChecked ? 'true' : 'false'}
        aria-disabled={disabled ? 'true' : undefined}
        disabled={disabled}
        onClick={handleClick}
        className={trackClasses}
      >
        <span className={thumbClasses} />
      </button>
      {label && <span className={labelClasses}>{label}</span>}
    </div>
  )
}
