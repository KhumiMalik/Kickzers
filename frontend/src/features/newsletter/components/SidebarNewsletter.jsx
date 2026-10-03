import { FieldError } from '../../../components/ui/FormControls'
import { useNewsletterForm } from '../useNewsletterForm'

/** Blog sidebar "Newsletter" widget. */
export default function SidebarNewsletter() {
  const { register, onSubmit, error, message, isSubmitting } = useNewsletterForm()

  return (
    <aside className="single-sidebar-widget newsletter_widget">
      <h4 className="widget_title">Newsletter</h4>
      <p>Here, I focus on a range of items and features that we use in life without giving them a second thought.</p>
      <form className="form-group d-flex flex-row" noValidate onSubmit={onSubmit}>
        <div className="input-group">
          <div className="input-group-prepend">
            <div className="input-group-text">
              <i className="fa fa-envelope" aria-hidden="true"></i>
            </div>
          </div>
          <input
            type="email"
            className="form-control"
            placeholder="Enter email"
            aria-label="Email"
            {...register('email')}
          />
        </div>
        <button type="submit" className="bbtns" disabled={isSubmitting}>
          Subcribe
        </button>
      </form>
      <FieldError error={error} />
      <p className="text-bottom">{message ?? 'You can unsubscribe at any time'}</p>
      <div className="br"></div>
    </aside>
  )
}
