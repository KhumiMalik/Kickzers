import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import ErrorState from '../../../components/ui/ErrorState'
import { FormAlert } from '../../../components/ui/FormControls'
import Loader from '../../../components/ui/Loader'
import ReviewItem from '../../../components/ui/ReviewItem'
import SubmissionFields from '../../../components/ui/SubmissionFields'
import { formatDateTime } from '../../../lib/dates'
import { applyServerErrors } from '../../../lib/forms'
import { useComments, useCreateComment } from '../queries'
import { productCommentFormSchema } from '../schemas'

const FIELDS = ['name', 'email', 'phone', 'body']
const EMPTY = { name: '', email: '', phone: '', body: '' }

/** "Comments" tab of the product page. */
export default function ProductComments({ productSlug }) {
  const { data, isPending, isError, refetch } = useComments('products', productSlug)
  const createComment = useCreateComment('products', productSlug)
  const [success, setSuccess] = useState(null)
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(productCommentFormSchema), defaultValues: EMPTY })

  const onSubmit = handleSubmit((values) => {
    setSuccess(null)
    return createComment.mutateAsync(values).then(
      () => {
        setSuccess('Thanks! Your comment has been posted.')
        reset(EMPTY)
      },
      (error) => applyServerErrors(error, setError, FIELDS),
    )
  })

  return (
    <div className="row">
      <div className="col-lg-6">
        <div className="comment_list">
          {isPending && <Loader />}
          {isError && <ErrorState message="Comments could not be loaded." onRetry={refetch} />}
          {data?.data.length === 0 && <p>No comments yet.</p>}
          {data?.data.map((thread) => (
            <div key={thread.id}>
              <ReviewItem authorName={thread.authorName} avatar={thread.avatar} body={thread.body}>
                <h5>{formatDateTime(thread.createdAt)}</h5>
              </ReviewItem>
              {thread.replies.map((reply) => (
                <ReviewItem
                  key={reply.id}
                  authorName={reply.authorName}
                  avatar={reply.avatar}
                  body={reply.body}
                  isReply
                >
                  <h5>{formatDateTime(reply.createdAt)}</h5>
                </ReviewItem>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="col-lg-6">
        <div className="review_box">
          <h4>Post a comment</h4>
          <FormAlert error={errors.root?.serverError} success={success} />
          <form className="row contact_form" noValidate onSubmit={onSubmit}>
            <SubmissionFields register={register} errors={errors} messageLabel="Message" />
            <div className="col-md-12 text-right">
              <button type="submit" className="btn primary-btn" disabled={isSubmitting}>
                Submit Now
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
