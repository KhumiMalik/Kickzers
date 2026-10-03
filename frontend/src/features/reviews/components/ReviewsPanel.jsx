import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import ErrorState from '../../../components/ui/ErrorState'
import { FormAlert } from '../../../components/ui/FormControls'
import Loader from '../../../components/ui/Loader'
import ReviewItem from '../../../components/ui/ReviewItem'
import Stars, { StarPicker } from '../../../components/ui/Stars'
import SubmissionFields from '../../../components/ui/SubmissionFields'
import { pad2 } from '../../../lib/format'
import { applyServerErrors } from '../../../lib/forms'
import { useCreateReview, useReviews } from '../queries'
import { reviewFormSchema } from '../schemas'

const FIELDS = ['name', 'email', 'phone', 'rating', 'body']
const EMPTY = { name: '', email: '', phone: '', rating: 5, body: '' }

function RatingSummary({ rating }) {
  return (
    <div className="row total_rate">
      <div className="col-6">
        <div className="box_total">
          <h5>Overall</h5>
          <h4>{rating.average.toFixed(1)}</h4>
          <h6>({pad2(rating.count)} Reviews)</h6>
        </div>
      </div>
      <div className="col-6">
        <div className="rating_list">
          <h3>Based on {rating.count} Reviews</h3>
          <ul className="list">
            {[5, 4, 3, 2, 1].map((stars) => (
              <li key={stars}>
                <span>
                  {stars} Star <Stars value={stars} /> {pad2(rating.breakdown[stars] ?? 0)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function ReviewForm({ slug }) {
  const [success, setSuccess] = useState(null)
  const createReview = useCreateReview(slug)
  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(reviewFormSchema), defaultValues: EMPTY })

  const onSubmit = handleSubmit((values) => {
    setSuccess(null)
    return createReview.mutateAsync(values).then(
      () => {
        setSuccess('Thanks! Your review has been added.')
        reset(EMPTY)
      },
      (error) => applyServerErrors(error, setError, FIELDS),
    )
  })

  return (
    <div className="review_box">
      <h4>Add a Review</h4>
      <p>Your Rating:</p>
      <Controller
        name="rating"
        control={control}
        render={({ field }) => <StarPicker value={field.value} onChange={field.onChange} />}
      />
      <FormAlert error={errors.root?.serverError ?? errors.rating} success={success} />
      <form className="row contact_form" noValidate onSubmit={onSubmit}>
        <SubmissionFields register={register} errors={errors} messageLabel="Review" />
        <div className="col-md-12 text-right">
          <button type="submit" className="primary-btn" disabled={isSubmitting}>
            Submit Now
          </button>
        </div>
      </form>
    </div>
  )
}

/** "Reviews" tab of the product page: rating summary, latest reviews and the review form. */
export default function ReviewsPanel({ product }) {
  const { data, isPending, isError, refetch } = useReviews(product.slug)

  return (
    <div className="row">
      <div className="col-lg-6">
        <RatingSummary rating={product.rating} />
        <div className="review_list">
          {isPending && <Loader />}
          {isError && <ErrorState message="Reviews could not be loaded." onRetry={refetch} />}
          {data?.data.length === 0 && <p>No reviews yet — be the first to review this product.</p>}
          {data?.data.map((review) => (
            <ReviewItem key={review.id} authorName={review.authorName} avatar={review.avatar} body={review.body}>
              <Stars value={review.rating} />
            </ReviewItem>
          ))}
        </div>
      </div>
      <div className="col-lg-6">
        <ReviewForm slug={product.slug} />
      </div>
    </div>
  )
}
