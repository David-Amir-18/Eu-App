import { useState, useRef, useEffect } from 'react'
import { cn } from '../utils.js'
import { MenuItem } from './MenuItem.jsx'

const placementClasses = {
  'bottom-start': 'top-full left-0 mt-1',
  'bottom-end': 'top-full right-0 mt-1',
  'top-start': 'bottom-full left-0 mb-1',
  'top-end': 'bottom-full right-0 mb-1',
}

export function Menu({
  trigger,
  items = [],
  placement = 'bottom-start',
  open: controlledOpen,
  onOpenChange,
  className,
}) {
  const isControlled = controlledOpen !== undefined
  const [internalOpen, setInternalOpen] = useState(false)
  const wrapperRef = useRef(null)

  const isOpen = isControlled ? controlledOpen : internalOpen

  function setOpen(next) {
    if (!isControlled) setInternalOpen(next)
    onOpenChange?.(next)
  }

  function handleTriggerClick() {
    setOpen(!isOpen)
  }

  // Close on outside click
  useEffect(() => {
    function handleMouseDown(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        setOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  return (
    <div className={cn('relative inline-block', className)} ref={wrapperRef}>
      {/* Trigger */}
      <div onClick={handleTriggerClick} className="cursor-pointer">
        {trigger}
      </div>

      {/* Dropdown panel */}
      {isOpen && (
        <ul
          role="menu"
          className={cn(
            'absolute z-50 min-w-[10rem] rounded-md border border-border-primary bg-surface-primary shadow-lg overflow-hidden py-1',
            placementClasses[placement],
          )}
        >
          {items.map((item, index) => (
            <MenuItem
              key={index}
              label={item.label}
              icon={item.icon}
              disabled={item.disabled}
              destructive={item.destructive}
              onClick={() => {
                item.onClick?.()
                setOpen(false)
              }}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
