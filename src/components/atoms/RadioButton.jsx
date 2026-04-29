import { cn } from '../utils.js'

export function RadioButton({
  checked,
  defaultChecked,
  disabled = false,
  label,
  id,
  name,
  value,
  onChange,
  className,
}) {
  const isChecked = checked ?? false

  const ringClasses = cn(
    'w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0',
    disabled
      ? 'border-border-disabled bg-surface-disabled cursor-not-allowed'
      : isChecked
      ? 'border-border-action bg-surface-primary'
      : 'border-border-primary bg-surface-primary',
  )

  const dotClasses = cn(
    'w-2 h-2 rounded-full',
    disabled ? 'bg-border-disabled' : 'bg-surface-action',
  )

  const wrapperClasses = cn(
    'inline-flex items-center gap-2 cursor-pointer',
    disabled && 'cursor-not-allowed',
    className,
  )

  const labelClasses = cn(
    'text-body-md text-text-body ml-2 select-none',
    disabled && 'text-text-disabled cursor-not-allowed',
  )

  return (
    <label className={wrapperClasses}>
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        onChange={onChange}
        aria-disabled={disabled ? 'true' : undefined}
        className="sr-only"
      />
      <div className={ringClasses} aria-hidden="true">
        {isChecked && <div className={dotClasses} />}
      </div>
      {label && <span className={labelClasses}>{label}</span>}
    </label>
  )
}
