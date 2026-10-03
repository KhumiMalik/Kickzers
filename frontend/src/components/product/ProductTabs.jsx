import { useState } from 'react'
import { addProductComment, addProductReview } from '../../api/products'
import { useForm } from '../../hooks/useForm'
import { cx, formatDateTime, pad2 } from '../../utils/format'
import { email, required } from '../../utils/validation'
import { FormAlert, TextField } from '../common/FormControls'
import Stars, { StarPicker } from '../common/Stars'

const tabs = [
  { id: 'description', label: 'Description' },
  { id: 'specification', label: 'Specification' },
  { id: 'comments', label: 'Comments' },
  { id: 'reviews', label: 'Reviews' },
]

function ReviewItem({ item, isReply, children }) {
  return (
    <div className={cx('review_item', isReply && 'reply')}>
      <div className="media">
        <div className="d-flex">
          <img src={item.avatar} alt={item.name} />
        </div>
        <div className="media-body">
          <h4>{item.name}</h4>
          {children}
        </div>
      </div>
      <p>{item.text}</p>
    </div>
  )
}

/** Name / email / phone / message fields shared by the comment and review forms. */
function ContactFields({ form, messageLabel }) {
  return (
    <>
      <div className="col-md-12">
        <TextField type="text" placeholder="Your Full name" error={form.errors.name} {...form.field('name')} />
      </div>
      <div className="col-md-12">
        <TextField type="email" placeholder="Email Address" error={form.errors.email} {...form.field('email')} />
      </div>
      <div className="col-md-12">
        <TextField type="text" placeholder="Phone Number" {...form.field('phone')} />
      </div>
      <div className="col-md-12">
        <TextField as="textarea" rows="1" placeholder={messageLabel} error={form.errors.text} {...form.field('text')} />
      </div>
    </>
  )
}

const contactSchema = (messageLabel) => ({
  name: [required('Name')],
  email: [required('Email'), email()],
  text: [required(messageLabel)],
})

function CommentsTab({ product }) {
  const [comments, setComments] = useState(product.comments)
  const [success, setSuccess] = useState(null)
  const form = useForm({ name: '', email: '', phone: '', text: '' }, contactSchema('Message'))

  const onSubmit = form.submit(async (values) => {
    const comment = await addProductComment(product.id, values)
    setComments((list) => [...list, comment])
    setSuccess('Thanks! Your comment has been posted.')
    form.reset()
  })

  return (
    <div className="row">
      <div className="col-lg-6">
        <div className="comment_list">
          {comments.map((c) => (
            <div key={c.id}>
              <ReviewItem item={c}>
                <h5>{formatDateTime(c.date)}</h5>
              </ReviewItem>
              {c.replies.map((r) => (
                <ReviewItem key={r.id} item={r} isReply>
                  <h5>{formatDateTime(r.date)}</h5>
                </ReviewItem>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="col-lg-6">
        <div className="review_box">
          <h4>Post a comment</h4>
          <FormAlert error={form.errors.form} success={success} />
          <form className="row contact_form" noValidate onSubmit={onSubmit}>
            <ContactFields form={form} messageLabel="Message" />
            <div className="col-md-12 text-right">
              <button type="submit" className="btn primary-btn" disabled={form.submitting}>
                Submit Now
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function ReviewsTab({ product }) {
  const [reviews, setReviews] = useState(product.reviews)
  const [rating, setRating] = useState(5)
  const [success, setSuccess] = useState(null)
  const form = useForm({ name: '', email: '', phone: '', text: '' }, contactSchema('Review'))

  const average = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0
  const countFor = (stars) => reviews.filter((r) => r.rating === stars).length

  const onSubmit = form.submit(async (values) => {
    const review = await addProductReview(product.id, { ...values, rating })
    setReviews((list) => [...list, review])
    setSuccess('Thanks! Your review has been added.')
    form.reset()
  })

  return (
    <div className="row">
      <div className="col-lg-6">
        <div className="row total_rate">
          <div className="col-6">
            <div className="box_total">
              <h5>Overall</h5>
              <h4>{average.toFixed(1)}</h4>
              <h6>({pad2(reviews.length)} Reviews)</h6>
            </div>
          </div>
          <div className="col-6">
            <div className="rating_list">
              <h3>Based on {reviews.length} Reviews</h3>
              <ul className="list">
                {[5, 4, 3, 2, 1].map((stars) => (
                  <li key={stars}>
                    <span>
                      {stars} Star <Stars value={stars} /> {pad2(countFor(stars))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="review_list">
          {reviews.map((r) => (
            <ReviewItem key={r.id} item={r}>
              <Stars value={r.rating} />
            </ReviewItem>
          ))}
        </div>
      </div>
      <div className="col-lg-6">
        <div className="review_box">
          <h4>Add a Review</h4>
          <p>Your Rating:</p>
          <StarPicker value={rating} onChange={setRating} />
          <FormAlert error={form.errors.form} success={success} />
          <form className="row contact_form" noValidate onSubmit={onSubmit}>
            <ContactFields form={form} messageLabel="Review" />
            <div className="col-md-12 text-right">
              <button type="submit" className="primary-btn" disabled={form.submitting}>
                Submit Now
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function ProductTabs({ product }) {
  const [active, setActive] = useState('reviews')

  return (
    <section className="product_description_area">
      <div className="container">
        <ul className="nav nav-tabs" role="tablist">
          {tabs.map((tab) => (
            <li key={tab.id} className="nav-item">
              <a
                className={cx('nav-link', active === tab.id && 'active')}
                id={`${tab.id}-tab`}
                href={`#${tab.id}`}
                role="tab"
                aria-controls={tab.id}
                aria-selected={active === tab.id}
                onClick={(e) => {
                  e.preventDefault()
                  setActive(tab.id)
                }}
              >
                {tab.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="tab-content">
          <div className="tab-pane fade show active" id={active} role="tabpanel" aria-labelledby={`${active}-tab`}>
            {active === 'description' && product.description.map((p, i) => <p key={i}>{p}</p>)}
            {active === 'specification' && (
              <div className="table-responsive">
                <table className="table">
                  <tbody>
                    {product.specs.map((s) => (
                      <tr key={s.label}>
                        <td>
                          <h5>{s.label}</h5>
                        </td>
                        <td>
                          <h5>{s.value}</h5>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {active === 'comments' && <CommentsTab product={product} />}
            {active === 'reviews' && <ReviewsTab product={product} />}
          </div>
        </div>
      </div>
    </section>
  )
}
