import { cx } from '../../lib/format'

/** Inline validation message under a field. */
export function FieldError({ error, className }) {
  const message = typeof error === 'string' ? error : error?.message
  return message ? <div className={cx('field-error', className)}>{message}</div> : null
}

/**
 * Checkout-style input with the template's "required" pseudo placeholder (.p_star).
 * Works with react-hook-form's `register()` props. The template only hid the
 * placeholder on focus; here CSS hides it whenever the input has a value
 * (`:not(:placeholder-shown)`), so no JavaScript state is needed.
 */
export function StarInput({ className, label, error, type = 'text', ...input }) {
  return (
    <div className={cx('form-group p_star', className)}>
      <input
        type={type}
        className={cx('form-control', error && 'is-invalid')}
        aria-label={label}
        placeholder=" "
        {...input}
      />
      <span className="placeholder" data-placeholder={label} aria-hidden="true"></span>
      <FieldError error={error} />
    </div>
  )
}

/** Plain .form-control input/textarea with an inline error. Spread `register('field')` into it. */
export function TextField({ as: Tag = 'input', className, error, wrapperClassName = 'form-group', ...input }) {
  return (
    <div className={wrapperClassName}>
      <Tag className={cx('form-control', className, error && 'is-invalid')} aria-label={input.placeholder} {...input} />
      <FieldError error={error} />
    </div>
  )
}

/** Form-level message (server errors, success confirmations). */
export function FormAlert({ error, success }) {
  const message = typeof error === 'string' ? error : error?.message
  if (message) return <div className="form-alert form-alert-error">{message}</div>
  if (success) return <div className="form-alert form-alert-success">{success}</div>
  return null
}
