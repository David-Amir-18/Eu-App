import { cn } from '../utils.js'

const variantClasses = {
  primary: 'bg-surface-action text-text-on-action hover:bg-surface-action-hover',
  outline: 'border border-border-action text-text-action hover:bg-surface-action-hover2',
  ghost: 'text-text-action hover:bg-surface-action-hover2',
  danger: 'bg-error-500 text-neutral-white hover:bg-error-600',
}

const sizeClasses = {
  sm: 'p-1',
  md: 'p-2',
  lg: 'p-3',
}

const spinnerColorClasses = {
  primary: 'text-neutral-white',
  danger: 'text-neutral-white',
  outline: 'text-text-action',
  ghost: 'text-text-action',
}

function Spinner({ variant }) {
  return (
    <svg
      className={cn('animate-spin h-4 w-4', spinnerColorClasses[variant])}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}

export function IconButton({
  icon,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  'aria-label': ariaLabel,
  className,
}) {
  const isDisabled = disabled || loading

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      aria-label={ariaLabel}
      aria-disabled={isDisabled ? 'true' : undefined}
      aria-busy={loading ? 'true' : undefined}
      className={cn(
        'inline-flex items-center justify-center rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2',
        variantClasses[variant],
        sizeClasses[size],
        isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className,
      )}
    >
      {loading ? <Spinner variant={variant} /> : icon}
    </button>
  )
}
