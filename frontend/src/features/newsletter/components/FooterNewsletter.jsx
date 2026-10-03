import { useNewsletterForm } from '../useNewsletterForm'

/** Footer "Newsletter" widget (the template's Mailchimp form). */
export default function FooterNewsletter() {
  const { register, onSubmit, error, message, isSubmitting } = useNewsletterForm()

  return (
    <div id="mc_embed_signup">
      <form noValidate className="form-inline" onSubmit={onSubmit}>
        <div className="d-flex flex-row">
          <input
            className="form-control"
            type="email"
            placeholder="Enter Email"
            aria-label="Email address"
            {...register('email')}
          />
          <button className="click-btn btn btn-default" disabled={isSubmitting} aria-label="Subscribe">
            <i className="fa fa-long-arrow-right" aria-hidden="true"></i>
          </button>
        </div>
        <div className="info">{error?.message ?? message}</div>
      </form>
    </div>
  )
}
