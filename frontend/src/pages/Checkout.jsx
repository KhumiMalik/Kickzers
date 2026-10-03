import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createOrder } from '../api/checkout'
import { FieldError, FormAlert, StarInput } from '../components/common/FormControls'
import NiceSelect from '../components/common/NiceSelect'
import PageBanner from '../components/layout/PageBanner'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { countries, paymentMethods } from '../data/site'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useForm } from '../hooks/useForm'
import { cx, formatPrice, pad2 } from '../utils/format'
import { accepted, email, required } from '../utils/validation'

const countryOptions = countries.map((c) => ({ value: c.value, label: c.label }))
// Billing fields use plain names (firstName); shipping fields are prefixed (shipFirstName).
const fieldKey = (prefix, name) => (prefix ? `${prefix}${name[0].toUpperCase()}${name.slice(1)}` : name)
const addressFields = ['firstName', 'lastName', 'country', 'address1', 'address2', 'city', 'state', 'zip']

const statesOf = (country) => (countries.find((c) => c.value === country)?.states ?? []).map((s) => ({ value: s, label: s }))

function ReturningCustomer() {
  const { login } = useAuth()
  const { notify } = useToast()
  const [open, setOpen] = useState(true)
  const form = useForm({ username: '', password: '' }, { username: [required('Username or email')], password: [required('Password')] })

  const onSubmit = form.submit(async (values) => {
    const user = await login(values)
    notify(`Welcome back, ${user.name}!`)
  })

  return (
    <div className="returning_customer">
      <div className="check_title">
        <h2>
          Returning Customer?{' '}
          <a href="#login" onClick={(e) => (e.preventDefault(), setOpen((o) => !o))}>
            Click here to login
          </a>
        </h2>
      </div>
      {open && (
        <>
          <p>
            If you have shopped with us before, please enter your details in the boxes below. If you are a new customer, please proceed to
            the Billing &amp; Shipping section.
          </p>
          <form className="row contact_form" noValidate onSubmit={onSubmit}>
            <StarInput className="col-md-6" label="Username or Email" error={form.errors.username} {...form.field('username')} />
            <StarInput className="col-md-6" type="password" label="Password" error={form.errors.password} {...form.field('password')} />
            <div className="col-md-12 form-group">
              <FormAlert error={form.errors.form} />
              <button type="submit" className="primary-btn" disabled={form.submitting}>
                login
              </button>
              <div className="creat_account">
                <input type="checkbox" id="remember-me" />{' '}
                <label htmlFor="remember-me">Remember me</label>
              </div>
              <Link className="lost_pass" to="/login">
                Lost your password?
              </Link>
            </div>
          </form>
        </>
      )}
    </div>
  )
}

function CouponArea() {
  const cart = useCart()
  const [open, setOpen] = useState(true)
  const [code, setCode] = useState('')
  const [error, setError] = useState(null)

  const apply = async (e) => {
    e.preventDefault()
    try {
      await cart.applyCoupon(code)
      setError(null)
      setCode('')
    } catch (err) {
      setError(err.errors?.code?.[0] ?? err.message)
    }
  }

  return (
    <div className="cupon_area">
      <div className="check_title">
        <h2>
          Have a coupon?{' '}
          <a href="#coupon" onClick={(e) => (e.preventDefault(), setOpen((o) => !o))}>
            Click here to enter your code
          </a>
        </h2>
      </div>
      {open && (
        <form onSubmit={apply}>
          <input type="text" placeholder="Enter coupon code" aria-label="Coupon code" value={code} onChange={(e) => setCode(e.target.value)} />
          <button type="submit" className="tp_btn">
            Apply Coupon
          </button>
          <FieldError error={error} />
        </form>
      )}
      {cart.coupon && (
        <p className="coupon-note">
          Coupon {cart.coupon.code} applied ({cart.coupon.label}).{' '}
          <a href="#remove-coupon" onClick={(e) => (e.preventDefault(), cart.removeCoupon())}>
            Remove
          </a>
        </p>
      )}
    </div>
  )
}

/**
 * Address fields shared by billing and (optional) shipping. `prefix` namespaces the form keys;
 * `children` render between the name row and the address (billing puts company/contact there).
 */
function AddressFields({ form, prefix = '', children }) {
  const key = (name) => fieldKey(prefix, name)
  const err = (name) => form.errors[key(name)]
  const country = form.values[key('country')]

  return (
    <>
      <StarInput className="col-md-6" label="First name" error={err('firstName')} {...form.field(key('firstName'))} />
      <StarInput className="col-md-6" label="Last name" error={err('lastName')} {...form.field(key('lastName'))} />
      {children}
      <div className="col-md-12 form-group p_star">
        <NiceSelect
          className="country_select"
          placeholder="Country"
          value={country}
          options={countryOptions}
          invalid={Boolean(err('country'))}
          onChange={(v) => {
            form.setValue(key('country'), v)
            form.setValue(key('state'), '')
          }}
        />
        <FieldError error={err('country')} />
      </div>
      <StarInput className="col-md-12" label="Address line 01" error={err('address1')} {...form.field(key('address1'))} />
      <div className="col-md-12 form-group">
        <input type="text" className="form-control" placeholder="Address line 02" {...form.field(key('address2'))} />
      </div>
      <StarInput className="col-md-12" label="Town/City" error={err('city')} {...form.field(key('city'))} />
      <div className="col-md-12 form-group p_star">
        <NiceSelect
          className="country_select"
          placeholder="District"
          value={form.values[key('state')]}
          options={statesOf(country)}
          disabled={!country}
          onChange={(v) => form.setValue(key('state'), v)}
        />
      </div>
      <div className="col-md-12 form-group">
        <input type="text" className="form-control" placeholder="Postcode/ZIP" {...form.field(key('zip'))} />
      </div>
    </>
  )
}

const addressSchema = (prefix = '') => {
  const k = (name) => fieldKey(prefix, name)
  return {
    [k('firstName')]: [required('First name')],
    [k('lastName')]: [required('Last name')],
    [k('country')]: [required('Country')],
    [k('address1')]: [required('Address')],
    [k('city')]: [required('Town/City')],
  }
}

const pickAddress = (v, prefix = '') => {
  const k = (name) => fieldKey(prefix, name)
  const country = countries.find((c) => c.value === v[k('country')])
  return {
    firstName: v[k('firstName')],
    lastName: v[k('lastName')],
    address1: v[k('address1')],
    address2: v[k('address2')],
    city: v[k('city')],
    state: v[k('state')],
    zip: v[k('zip')],
    country: country?.label ?? '',
  }
}

const emptyAddress = (prefix = '') => Object.fromEntries(addressFields.map((name) => [fieldKey(prefix, name), '']))

export default function Checkout() {
  useDocumentTitle('Checkout')
  const cart = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [shipDifferent, setShipDifferent] = useState(false)

  const form = useForm(
    {
      ...emptyAddress(),
      ...emptyAddress('ship'),
      company: '',
      phone: '',
      email: user?.email ?? '',
      notes: '',
      createAccount: false,
      payment: 'paypal',
      terms: false,
    },
    {
      ...addressSchema(),
      ...(shipDifferent ? addressSchema('ship') : {}),
      phone: [required('Phone number')],
      email: [required('Email address'), email()],
      terms: [accepted('Please accept the terms & conditions.')],
    },
  )

  const hasFieldErrors = Object.values(form.errors).some(Boolean)

  const placeOrder = form.submit(async (v) => {
    const billing = { ...pickAddress(v), company: v.company, phone: v.phone, email: v.email }
    const order = await createOrder({
      billing,
      shipping: shipDifferent ? pickAddress(v, 'ship') : billing,
      items: cart.items.map(({ id, name, price, qty }) => ({ id, name, price, qty, total: price * qty })),
      subtotal: cart.subtotal,
      discount: cart.discount,
      coupon: cart.coupon?.code ?? null,
      shippingMethod: { label: cart.shipping.label, cost: cart.shippingCost },
      total: cart.total,
      payment: paymentMethods.find((p) => p.id === v.payment).label,
      notes: v.notes,
      createAccount: v.createAccount,
    })
    cart.clearCart()
    navigate(`/confirmation?order=${order.id}`)
  })

  if (!cart.items.length) {
    return (
      <>
        <PageBanner title="Checkout" crumbs={[{ label: 'Checkout', to: '/checkout' }]} />
        <section className="checkout_area section_gap">
          <div className="container empty-state">
            <p>Your cart is empty — add something before checking out.</p>
            <Link className="primary-btn" to="/shop">
              Go to shop
            </Link>
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      <PageBanner title="Checkout" crumbs={[{ label: 'Checkout', to: '/checkout' }]} />
      <section className="checkout_area section_gap">
        <div className="container">
          {!user && <ReturningCustomer />}
          <CouponArea />
          <div className="billing_details">
            <div className="row">
              <div className="col-lg-8">
                <h3>Billing Details</h3>
                <form id="checkout-form" className="row contact_form" noValidate onSubmit={placeOrder}>
                  <AddressFields form={form}>
                    <div className="col-md-12 form-group">
                      <input type="text" className="form-control" placeholder="Company name" {...form.field('company')} />
                    </div>
                    <StarInput className="col-md-6" label="Phone number" error={form.errors.phone} {...form.field('phone')} />
                    <StarInput className="col-md-6" type="email" label="Email Address" error={form.errors.email} {...form.field('email')} />
                  </AddressFields>
                  {!user && (
                    <div className="col-md-12 form-group">
                      <div className="creat_account">
                        <input type="checkbox" id="create-account" {...form.checkbox('createAccount')} />{' '}
                        <label htmlFor="create-account">Create an account?</label>
                      </div>
                    </div>
                  )}
                  <div className="col-md-12 form-group">
                    <div className="creat_account">
                      <h3>Shipping Details</h3>
                      <input type="checkbox" id="ship-different" checked={shipDifferent} onChange={(e) => setShipDifferent(e.target.checked)} />{' '}
                      <label htmlFor="ship-different">Ship to a different address?</label>
                    </div>
                  </div>
                  {shipDifferent && <AddressFields form={form} prefix="ship" />}
                  <div className="col-md-12 form-group">
                    <textarea className="form-control" rows="1" placeholder="Order Notes" {...form.field('notes')}></textarea>
                  </div>
                </form>
              </div>
              <div className="col-lg-4">
                <div className="order_box">
                  <h2>Your Order</h2>
                  <ul className="list">
                    <li>
                      <span>
                        Product <span>Total</span>
                      </span>
                    </li>
                    {cart.items.map((item) => (
                      <li key={item.id}>
                        <span>
                          {item.name} <span className="middle">x {pad2(item.qty)}</span>{' '}
                          <span className="last">{formatPrice(item.price * item.qty)}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                  <ul className="list list_2">
                    <li>
                      <span>
                        Subtotal <span>{formatPrice(cart.subtotal)}</span>
                      </span>
                    </li>
                    {cart.discount > 0 && (
                      <li>
                        <span>
                          Discount <span>-{formatPrice(cart.discount)}</span>
                        </span>
                      </li>
                    )}
                    <li>
                      <Link to="/cart">
                        Shipping <span>{cart.shipping.label}</span>
                      </Link>
                    </li>
                    <li>
                      <span>
                        Total <span>{formatPrice(cart.total)}</span>
                      </span>
                    </li>
                  </ul>
                  {paymentMethods.map((method) => (
                    <div key={method.id} className={cx('payment_item', form.values.payment === method.id && 'active')}>
                      <div className="radion_btn">
                        <input
                          type="radio"
                          id={`pay-${method.id}`}
                          name="payment"
                          checked={form.values.payment === method.id}
                          onChange={() => form.setValue('payment', method.id)}
                        />
                        <label htmlFor={`pay-${method.id}`}>{method.label}</label>
                        {method.image && <img src={method.image} alt="" />}
                        <div className="check"></div>
                      </div>
                      {form.values.payment === method.id && <p>{method.text}</p>}
                    </div>
                  ))}
                  <div className="creat_account">
                    <input type="checkbox" id="accept-terms" {...form.checkbox('terms')} />{' '}
                    <label htmlFor="accept-terms">I’ve read and accept the </label>{' '}
                    <a href="#terms">terms &amp; conditions*</a>
                    <FieldError error={form.errors.terms} />
                  </div>
                  <FormAlert error={form.errors.form ?? (hasFieldErrors ? 'Please fix the highlighted fields.' : null)} />
                  <button type="submit" form="checkout-form" className="primary-btn" disabled={form.submitting}>
                    {form.submitting ? 'Placing order…' : form.values.payment === 'paypal' ? 'Proceed to Paypal' : 'Place Order'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
