import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { StarInput } from '../../../components/ui/FormControls'
import { applyServerErrors } from '../../../lib/forms'
import { usePlaceOrder } from '../queries'
import { checkoutFormSchema, emptyAddress, toCheckoutPayload } from '../schemas'
import AddressFields from './AddressFields'
import OrderReview from './OrderReview'

const FORM_ID = 'checkout-form'
const addressPaths = (prefix) => Object.keys(emptyAddress).map((key) => `${prefix}.${key}`)
const FIELDS = [
  ...addressPaths('billing'),
  'billing.phone',
  'billing.email',
  ...addressPaths('shippingAddress'),
  'notes',
  'paymentMethod',
  'password',
  'acceptTerms',
]

/**
 * Billing/shipping form plus the order box. Totals are never computed here:
 * the server recalculates everything when the order is placed.
 */
export default function CheckoutForm({ cart, paymentMethods, user }) {
  const navigate = useNavigate()
  const placeOrder = usePlaceOrder()
  // One key per checkout attempt: retries and double clicks reuse it (see API contract §1.10).
  const [idempotencyKey] = useState(() => crypto.randomUUID())

  const form = useForm({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      billing: { ...emptyAddress, phone: '', email: user?.email ?? '' },
      shipToDifferentAddress: false,
      shippingAddress: emptyAddress,
      notes: '',
      paymentMethod: paymentMethods[0]?.code ?? '',
      createAccount: false,
      password: '',
      acceptTerms: false,
    },
  })
  const { register, control, handleSubmit, setError, formState } = form
  const [shipToDifferentAddress, createAccount] = useWatch({
    control,
    name: ['shipToDifferentAddress', 'createAccount'],
  })

  const onSubmit = handleSubmit((values) =>
    placeOrder.mutateAsync({ payload: toCheckoutPayload(values), idempotencyKey }).then(
      (order) => navigate(`/confirmation?order=${encodeURIComponent(order.number)}`),
      (error) => applyServerErrors(error, setError, FIELDS),
    ),
  )

  return (
    <FormProvider {...form}>
      <div className="billing_details">
        <div className="row">
          <div className="col-lg-8">
            <h3>Billing Details</h3>
            <form id={FORM_ID} className="row contact_form" noValidate onSubmit={onSubmit}>
              <AddressFields prefix="billing">
                <div className="col-md-12 form-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Company name"
                    aria-label="Company name"
                    {...register('billing.company')}
                  />
                </div>
                <StarInput
                  className="col-md-6"
                  label="Phone number"
                  error={formState.errors.billing?.phone}
                  {...register('billing.phone')}
                />
                <StarInput
                  className="col-md-6"
                  type="email"
                  label="Email Address"
                  error={formState.errors.billing?.email}
                  {...register('billing.email')}
                />
              </AddressFields>
              {!user && (
                <div className="col-md-12 form-group">
                  <div className="creat_account">
                    <input type="checkbox" id="create-account" {...register('createAccount')} />{' '}
                    <label htmlFor="create-account">Create an account?</label>
                  </div>
                </div>
              )}
              {!user && createAccount && (
                <StarInput
                  className="col-md-12"
                  type="password"
                  label="Account password"
                  autoComplete="new-password"
                  error={formState.errors.password}
                  {...register('password')}
                />
              )}
              <div className="col-md-12 form-group">
                <div className="creat_account">
                  <h3>Shipping Details</h3>
                  <input type="checkbox" id="ship-different" {...register('shipToDifferentAddress')} />{' '}
                  <label htmlFor="ship-different">Ship to a different address?</label>
                </div>
              </div>
              {shipToDifferentAddress && <AddressFields prefix="shippingAddress" />}
              <div className="col-md-12 form-group">
                <textarea
                  className="form-control"
                  rows="1"
                  placeholder="Order Notes"
                  aria-label="Order notes"
                  {...register('notes')}
                ></textarea>
              </div>
            </form>
          </div>
          <div className="col-lg-4">
            <OrderReview cart={cart} paymentMethods={paymentMethods} formId={FORM_ID} />
          </div>
        </div>
      </div>
    </FormProvider>
  )
}
