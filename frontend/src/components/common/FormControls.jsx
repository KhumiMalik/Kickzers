import { cx } from '../../utils/format'

export function FieldError({ error }) {
  return error ? <div className="field-error">{error}</div> : null
}

/**
 * Checkout-style input with the "required" pseudo placeholder (.p_star).
 * The template only hid the placeholder on focus, so typed values were
 * covered again on blur; here it is hidden whenever the field has a value.
 */
export function StarInput({ className, label, error, type = 'text', ...input }) {
  return (
    <div className={cx('form-group p_star', className)}>
      <input type={type} className={cx('form-control', error && 'is-invalid')} aria-label={label} {...input} />
      {!input.value && <span className="placeholder" data-placeholder={label}></span>}
      <FieldError error={error} />
    </div>
  )
}

/** Plain .form-control input/textarea with an inline error. */
export function TextField({ as: Tag = 'input', className, error, wrapperClassName = 'form-group', ...input }) {
  return (
    <div className={wrapperClassName}>
      <Tag className={cx('form-control', className, error && 'is-invalid')} aria-label={input.placeholder} {...input} />
      <FieldError error={error} />
    </div>
  )
}

export function FormAlert({ error, success }) {
  if (error) return <div className="form-alert form-alert-error">{error}</div>
  if (success) return <div className="form-alert form-alert-success">{success}</div>
  return null
}
