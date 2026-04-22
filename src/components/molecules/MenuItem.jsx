import { cn } from '../utils.js'

export function MenuItem({
  label,
  icon,
  disabled = false,
  destructive = false,
  onClick,
  className,
}) {
  function handleClick() {
    if (!disabled) onClick?.()
  }

  return (
    <li
      role="menuitem"
      aria-disabled={disabled ? 'true' : undefined}
      onClick={handleClick}
      className={cn(
        'flex items-center gap-2 px-4 py-2 text-body-md transition-colors cursor-pointer select-none',
        disabled
          ? 'text-text-disabled cursor-not-allowed'
          : destructive
          ? 'text-text-error hover:bg-surface-error'
          : 'text-text-body hover:bg-surface-action-hover2',
        className,
      )}
    >
      {icon && (
        <span className="shrink-0 w-4 h-4 flex items-center justify-center" aria-hidden="true">
          {icon}
        </span>
      )}
      <span>{label}</span>
    </li>
  )
}
