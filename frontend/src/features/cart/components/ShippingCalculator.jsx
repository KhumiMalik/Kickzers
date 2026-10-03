import { useState } from 'react'
import NiceSelect from '../../../components/ui/NiceSelect'
import { useToast } from '../../../components/ui/toast/ToastProvider'
import { cx } from '../../../lib/format'
import { useCountries, useSetDestination, useSetShippingMethod } from '../queries'
import { shippingLabel } from '../shipping'

/** Shipping method list + destination calculator (prices come from the API for the chosen destination). */
export default function ShippingCalculator({ cart }) {
  const { notify } = useToast()
  const { data: countries = [] } = useCountries()
  const setShippingMethod = useSetShippingMethod()
  const setDestination = useSetDestination()
  const [destination, setLocalDestination] = useState({
    country: cart.destination.country ?? '',
    state: cart.destination.state ?? '',
    postcode: cart.destination.postcode ?? '',
  })
  const states = countries.find((c) => c.code === destination.country)?.states ?? []

  const save = (e) => {
    e.preventDefault()
    if (!destination.country) return notify('Please choose a country.', 'error')
    setDestination.mutate(destination, {
      onSuccess: () => notify('Shipping details updated.'),
      onError: (error) => notify(Object.values(error.errors ?? {})[0] ?? error.message, 'error'),
    })
  }

  return (
    <div className="shipping_box">
      <ul className="list">
        {cart.shippingMethods.map((method) => (
          <li key={method.code} className={cx(cart.shippingMethod === method.code && 'active')}>
            <a
              href={`#${method.code}`}
              onClick={(e) => {
                e.preventDefault()
                setShippingMethod.mutate(method.code)
              }}
            >
              {shippingLabel(method, cart.currency)}
            </a>
          </li>
        ))}
      </ul>
      <h6>
        Calculate Shipping <i className="fa fa-caret-down" aria-hidden="true"></i>
      </h6>
      <NiceSelect
        className="shipping_select"
        placeholder="Select a Country"
        value={destination.country}
        options={countries.map((c) => ({ value: c.code, label: c.name }))}
        onChange={(country) => setLocalDestination({ ...destination, country, state: '' })}
      />
      <NiceSelect
        className="shipping_select"
        placeholder="Select a State"
        value={destination.state}
        options={states.map((s) => ({ value: s, label: s }))}
        onChange={(state) => setLocalDestination({ ...destination, state })}
        disabled={!states.length}
      />
      <input
        type="text"
        placeholder="Postcode/Zipcode"
        aria-label="Postcode"
        value={destination.postcode}
        onChange={(e) => setLocalDestination({ ...destination, postcode: e.target.value })}
      />
      <a className="gray_btn" href="#update-shipping" onClick={save}>
        Update Details
      </a>
    </div>
  )
}
