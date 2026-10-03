import PriceRangeSlider from './PriceRangeSlider'

function RadioGroup({ title, name, options, value, onChange }) {
  return (
    <div className="common-filter">
      <div className="head">{title}</div>
      <ul>
        {options.map((o) => (
          <li key={o.slug} className="filter-list">
            <input
              className="pixel-radio"
              type="radio"
              id={`${name}-${o.slug}`}
              name={name}
              checked={value === o.slug}
              onChange={() => onChange(o.slug)}
              // A second click on the selected option clears the filter.
              onClick={() => value === o.slug && onChange(null)}
            />
            <label htmlFor={`${name}-${o.slug}`}>
              {o.name}
              <span>({o.count})</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function ProductFilters({ filters, values, onChange, onReset }) {
  const { brands, colors, priceRange } = filters
  const price = [values.min ?? priceRange.min, values.max ?? priceRange.max]
  const hasFilters = values.brand || values.color || values.min != null || values.max != null

  return (
    <div className="sidebar-filter mt-50">
      <div className="top-filter-head d-flex justify-content-between align-items-center">
        Product Filters
        {hasFilters && (
          <button type="button" className="filter-reset" onClick={onReset}>
            Reset
          </button>
        )}
      </div>
      <RadioGroup title="Brands" name="brand" options={brands} value={values.brand} onChange={(brand) => onChange({ brand })} />
      <RadioGroup title="Color" name="color" options={colors} value={values.color} onChange={(color) => onChange({ color })} />
      <div className="common-filter">
        <div className="head">Price</div>
        <PriceRangeSlider
          min={priceRange.min}
          max={priceRange.max}
          value={price}
          onChange={([min, max]) =>
            onChange({ min: min > priceRange.min ? min : null, max: max < priceRange.max ? max : null })
          }
        />
      </div>
    </div>
  )
}
