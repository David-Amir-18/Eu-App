import { useState, useRef, useEffect } from 'react'
import { cn } from '../utils.js'

const triggerBase =
  'w-full flex items-center justify-between rounded-md px-4 py-2 text-body-md border transition-colors focus:outline-none'

export function DefinedField({
  options = [],
  value,
  defaultValue,
  placeholder = 'Select...',
  disabled = false,
  error = false,
  label,
  helperText,
  errorMessage,
  required = false,
  id,
  name,
  onChange,
  className,
}) {
  const isControlled = value !== undefined
  const [internalValue, setInternalValue] = useState(defaultValue ?? '')
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)

  const selectedValue = isControlled ? value : internalValue
  const selectedOption = options.find((o) => o.value === selectedValue)

  useEffect(() => {
    function handleMouseDown(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [])

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  function handleToggle() {
    if (!disabled) setOpen((prev) => !prev)
  }

  function handleSelect(option) {
    if (option.disabled) return
    if (!isControlled) setInternalValue(option.value)
    onChange?.(option.value)
    setOpen(false)
  }

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
            <span className="text-text-error ml-1" aria-hidden="true">*</span>
          )}
        </label>
      )}

      <div className={cn('relative', open && 'z-[70]')} ref={wrapperRef}>
        {name && <input type="hidden" name={name} value={selectedValue} />}

        <button
          type="button"
          id={id}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-disabled={disabled}
          aria-describedby={describedById}
          onClick={handleToggle}
          className={cn(
            triggerBase,
            disabled
              ? 'bg-surface-disabled border-border-disabled text-text-disabled cursor-not-allowed'
              : error
              ? 'border-border-error bg-surface-primary text-text-body'
              : open
              ? 'border-border-focus bg-surface-primary text-text-body'
              : 'border-border-primary bg-surface-primary text-text-body hover:border-border-focus',
          )}
        >
          <span className={cn(!selectedOption && 'text-text-disabled')}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('shrink-0 transition-transform duration-200', open && 'rotate-180')}
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {open && (
          <ul
            role="listbox"
            aria-label={label}
            className="absolute z-[80] mt-1 w-full rounded-md border border-border-primary bg-surface-primary shadow-lg max-h-48 overflow-y-auto"
          >
            {options.map((option) => (
              <li
                key={option.value}
                role="option"
                aria-selected={option.value === selectedValue}
                aria-disabled={option.disabled}
                onClick={() => handleSelect(option)}
                className={cn(
                  'px-4 py-2 text-body-md cursor-pointer transition-colors',
                  option.disabled
                    ? 'text-text-disabled cursor-not-allowed'
                    : option.value === selectedValue
                    ? 'bg-surface-action-hover2 text-text-action font-semibold'
                    : 'text-text-body hover:bg-surface-action-hover2',
                )}
              >
                {option.label}
              </li>
            ))}
          </ul>
        )}
      </div>

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
