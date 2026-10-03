import { TextField } from './FormControls'

/**
 * Name / email / phone / message inputs shared by the product review and
 * product comment forms. Pass react-hook-form's `register` and `errors`.
 */
export default function SubmissionFields({ register, errors, messageLabel }) {
  return (
    <>
      <div className="col-md-12">
        <TextField type="text" placeholder="Your Full name" error={errors.name} {...register('name')} />
      </div>
      <div className="col-md-12">
        <TextField type="email" placeholder="Email Address" error={errors.email} {...register('email')} />
      </div>
      <div className="col-md-12">
        <TextField type="text" placeholder="Phone Number" error={errors.phone} {...register('phone')} />
      </div>
      <div className="col-md-12">
        <TextField as="textarea" rows="1" placeholder={messageLabel} error={errors.body} {...register('body')} />
      </div>
    </>
  )
}
