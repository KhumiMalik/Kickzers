/** Read-only star row (Font Awesome 4). */
export default function Stars({ value, max = 5 }) {
  return Array.from({ length: max }, (_, i) => (
    <i key={i} className={i < Math.round(value) ? 'fa fa-star' : 'fa fa-star-o'}></i>
  ))
}

const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Outstanding']

/** Clickable rating picker used by the "Add a Review" form. */
export function StarPicker({ value, onChange }) {
  return (
    <>
      <ul className="list star-picker">
        {[1, 2, 3, 4, 5].map((n) => (
          <li key={n}>
            <button type="button" aria-label={`${n} star${n > 1 ? 's' : ''}`} onClick={() => onChange(n)}>
              <i className={n <= value ? 'fa fa-star' : 'fa fa-star-o'}></i>
            </button>
          </li>
        ))}
      </ul>
      <p>{ratingLabels[value]}</p>
    </>
  )
}
