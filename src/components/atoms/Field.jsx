import { cn } from '../utils.js'

const inputBase =
  'w-full rounded-md px-4 py-2 text-body-md text-text-body bg-surface-primary border transition-colors focus:outline-none'

export function Field({
  type = 'text',
  value,
  defaultValue,
  placeholder,
  disabled = false,
  error = false,
  label,
  helperText,
  errorMessage,
  required = false,
  id,
  name,
  onChange,
  onBlur,
  className,
}) {
  const describedById = errorMessage
    ? `${id}-error`
    : helperText
    ? `${id}-helper`
    : undefined

  return (
    <div className={cn('flex flex-col w-full', className)}>
      {label && (
        <label htmlFor={id} className="block text-body-sm font-semibold text-text-body mb-1">
          {label}
          {required && (
            <span className="text-text-error ml-1" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <input
        type={type}
        id={id}
        name={name}
        value={value}
        defaultValue={defaultValue}
        placeholder={placeholder}
        disabled={disabled}
        onChange={onChange}
        onBlur={onBlur}
        aria-invalid={error ? 'true' : undefined}
        aria-required={required ? 'true' : undefined}
        aria-describedby={describedById}
        className={cn(
          inputBase,
          error
            ? 'border-border-error focus:border-border-error'
            : 'border-border-primary focus:border-border-focus',
          disabled && 'bg-surface-disabled border-border-disabled text-text-disabled cursor-not-allowed',
        )}
      />

      {errorMessage && (
        <span id={`${id}-error`} className="mt-1 text-body-sm text-text-error">
          {errorMessage}
        </span>
      )}

      {!errorMessage && helperText && (
        <span id={`${id}-helper`} className="mt-1 text-body-sm text-text-disabled">
          {helperText}
        </span>
      )}
    </div>
  )
}
