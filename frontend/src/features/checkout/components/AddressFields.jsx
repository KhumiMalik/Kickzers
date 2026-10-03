import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { FieldError, StarInput } from '../../../components/ui/FormControls'
import NiceSelect from '../../../components/ui/NiceSelect'
import { useCountries } from '../../cart'

/**
 * Address inputs for `prefix` ("billing" or "shippingAddress"). Must be rendered
 * inside a react-hook-form <FormProvider>. `children` render after the name row
 * (billing puts company, phone and email there, like the template).
 */
export default function AddressFields({ prefix, children }) {
  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = useFormContext()
  const { data: countries = [] } = useCountries()
  const country = useWatch({ control, name: `${prefix}.country` })
  const fieldErrors = errors[prefix] ?? {}
  const name = (field) => `${prefix}.${field}`
  const states = countries.find((c) => c.code === country)?.states ?? []

  return (
    <>
      <StarInput
        className="col-md-6"
        label="First name"
        error={fieldErrors.firstName}
        {...register(name('firstName'))}
      />
      <StarInput className="col-md-6" label="Last name" error={fieldErrors.lastName} {...register(name('lastName'))} />
      {children}
      <div className="col-md-12 form-group p_star">
        <Controller
          control={control}
          name={name('country')}
          render={({ field }) => (
            <NiceSelect
              className="country_select"
              placeholder="Country"
              value={field.value}
              options={countries.map((c) => ({ value: c.code, label: c.name }))}
              invalid={Boolean(fieldErrors.country)}
              onChange={(value) => {
                field.onChange(value)
                setValue(name('state'), '')
              }}
            />
          )}
        />
        <FieldError error={fieldErrors.country} />
      </div>
      <StarInput
        className="col-md-12"
        label="Address line 01"
        error={fieldErrors.addressLine1}
        {...register(name('addressLine1'))}
      />
      <div className="col-md-12 form-group">
        <input
          type="text"
          className="form-control"
          placeholder="Address line 02"
          aria-label="Address line 02"
          {...register(name('addressLine2'))}
        />
      </div>
      <StarInput className="col-md-12" label="Town/City" error={fieldErrors.city} {...register(name('city'))} />
      <div className="col-md-12 form-group p_star">
        <Controller
          control={control}
          name={name('state')}
          render={({ field }) => (
            <NiceSelect
              className="country_select"
              placeholder="District"
              value={field.value}
              options={states.map((s) => ({ value: s, label: s }))}
              disabled={!states.length}
              onChange={field.onChange}
            />
          )}
        />
      </div>
      <div className="col-md-12 form-group">
        <input
          type="text"
          className="form-control"
          placeholder="Postcode/ZIP"
          aria-label="Postcode/ZIP"
          {...register(name('postcode'))}
        />
      </div>
    </>
  )
}
