/**
 * Quantity stepper. The template uses two different markups:
 *  - "count":  .product_count (product details, cart)
 *  - "arrows": .quantity-container (quick view)
 */
export default function QuantityInput({ value, onChange, min = 1, max = 99, variant = 'count', label, id = 'qty' }) {
  const set = (n) => onChange(Math.min(max, Math.max(min, Number.isNaN(n) ? min : n)))
  const handleInput = (e) => set(parseInt(e.target.value.replace(/\D/g, ''), 10))

  if (variant === 'arrows') {
    return (
      <div className="quantity-container d-flex align-items-center mt-15">
        {label}
        <input type="text" className="quantity-amount ml-15" value={value} onChange={handleInput} aria-label="Quantity" />
        <div className="arrow-btn d-inline-flex flex-column">
          {/* aria-label: the icon glyph would otherwise become the button's accessible name */}
          <button className="increase arrow" type="button" title="Increase Quantity" aria-label="Increase quantity" onClick={() => set(value + 1)}>
            <span className="lnr lnr-chevron-up" aria-hidden="true"></span>
          </button>
          <button className="decrease arrow" type="button" title="Decrease Quantity" aria-label="Decrease quantity" onClick={() => set(value - 1)}>
            <span className="lnr lnr-chevron-down" aria-hidden="true"></span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="product_count">
      {label && <label htmlFor={id}>{label}</label>}
      <input type="text" id={id} maxLength={2} value={value} onChange={handleInput} title="Quantity:" className="input-text qty" />
      <button className="increase items-count" type="button" aria-label="Increase quantity" onClick={() => set(value + 1)}>
        <i className="lnr lnr-chevron-up"></i>
      </button>
      <button className="reduced items-count" type="button" aria-label="Decrease quantity" onClick={() => set(value - 1)}>
        <i className="lnr lnr-chevron-down"></i>
      </button>
    </div>
  )
}
