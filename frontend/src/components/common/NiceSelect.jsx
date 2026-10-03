import { useCallback, useRef, useState } from 'react'
import { useClickOutside } from '../../hooks/useClickOutside'
import { cx } from '../../utils/format'

/**
 * React port of jquery.nice-select. Renders the plugin's markup so the
 * existing nice-select.css / theme styles apply unchanged.
 * Like the plugin, `className` is copied onto the widget (e.g. "country_select").
 */
export default function NiceSelect({ value, options, onChange, className, placeholder, disabled, id, invalid }) {
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(-1)
  const ref = useRef(null)

  const close = useCallback(() => setOpen(false), [])
  useClickOutside(ref, close, open)

  const selected = options.find((o) => String(o.value) === String(value))

  const choose = (option) => {
    onChange(option.value)
    setOpen(false)
  }

  const toggle = () => {
    if (disabled) return
    setFocused(options.indexOf(selected))
    setOpen((o) => !o)
  }

  const onKeyDown = (e) => {
    if (disabled) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (open && focused >= 0) choose(options[focused])
      else toggle()
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (!open) return toggle()
      const step = e.key === 'ArrowDown' ? 1 : -1
      setFocused((i) => Math.min(options.length - 1, Math.max(0, i + step)))
    } else if (e.key === 'Escape' || e.key === 'Tab') {
      setOpen(false)
    }
  }

  return (
    <div
      ref={ref}
      id={id}
      className={cx('nice-select', className, open && 'open', disabled && 'disabled', invalid && 'is-invalid')}
      tabIndex={disabled ? undefined : 0}
      role="listbox"
      aria-expanded={open}
      onClick={toggle}
      onKeyDown={onKeyDown}
    >
      <span className="current">{selected?.label ?? placeholder ?? ''}</span>
      <ul className="list">
        {options.map((option, i) => (
          <li
            key={option.value}
            role="option"
            aria-selected={option === selected}
            className={cx('option', option === selected && 'selected', i === focused && 'focus')}
            onClick={(e) => {
              e.stopPropagation()
              choose(option)
            }}
            onMouseEnter={() => setFocused(i)}
          >
            {option.label}
          </li>
        ))}
      </ul>
    </div>
  )
}
