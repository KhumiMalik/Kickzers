import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import ErrorState from '../../../components/ui/ErrorState'
import { FieldError, FormAlert } from '../../../components/ui/FormControls'
import Loader from '../../../components/ui/Loader'
import { formatDateTime } from '../../../lib/dates'
import { cx, pad2 } from '../../../lib/format'
import { applyServerErrors } from '../../../lib/forms'
import { useComments, useCreateComment } from '../queries'
import { postCommentFormSchema } from '../schemas'

const FIELDS = ['name', 'email', 'subject', 'body']
const EMPTY = { name: '', email: '', subject: '', body: '' }
const DEFAULT_AVATAR = '/img/blog/c6.jpg'

function Comment({ comment, isReply, onReply }) {
  return (
    <div className={cx('comment-list', isReply && 'left-padding')}>
      <div className="single-comment justify-content-between d-flex">
        <div className="user justify-content-between d-flex">
          <div className="thumb">
            <img src={comment.avatar ?? DEFAULT_AVATAR} alt={comment.authorName} />
          </div>
          <div className="desc">
            <h5>{comment.authorName}</h5>
            <p className="date">{formatDateTime(comment.createdAt)}</p>
            <p className="comment">{comment.body}</p>
          </div>
        </div>
        <div className="reply-btn">
          <button type="button" className="btn-reply text-uppercase" onClick={onReply}>
            reply
          </button>
        </div>
      </div>
    </div>
  )
}

/** Comment thread + "Leave a Reply" form of a blog post. `commentsCount` comes from the post. */
export default function PostComments({ postSlug, commentsCount }) {
  const { data, isPending, isError, refetch } = useComments('posts', postSlug)
  const createComment = useCreateComment('posts', postSlug)
  const [success, setSuccess] = useState(null)
  const [replyTo, setReplyTo] = useState(null)
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(postCommentFormSchema), defaultValues: EMPTY })

  /** Replies always attach to the top-level comment of the thread (one level, like the template). */
  const startReply = (thread, author) => {
    setReplyTo({ id: thread.id, name: author })
    setValue('subject', `Re: ${author}`)
    document.getElementById('comment-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const onSubmit = handleSubmit((values) => {
    setSuccess(null)
    return createComment.mutateAsync({ ...values, parentId: replyTo?.id ?? null }).then(
      () => {
        setSuccess('Thanks! Your comment has been posted.')
        setReplyTo(null)
        reset(EMPTY)
      },
      (error) => applyServerErrors(error, setError, FIELDS),
    )
  })

  return (
    <>
      <div className="comments-area" id="comments">
        <h4>{pad2(commentsCount)} Comments</h4>
        {isPending && <Loader />}
        {isError && <ErrorState message="Comments could not be loaded." onRetry={refetch} />}
        {data?.data.map((thread) => (
          <div key={thread.id}>
            <Comment comment={thread} onReply={() => startReply(thread, thread.authorName)} />
            {thread.replies.map((reply) => (
              <Comment key={reply.id} comment={reply} isReply onReply={() => startReply(thread, reply.authorName)} />
            ))}
          </div>
        ))}
      </div>
      <div className="comment-form" id="comment-form">
        <h4>Leave a Reply</h4>
        {replyTo && (
          <p className="reply-note">
            Replying to {replyTo.name}{' '}
            <button type="button" className="btn-link" onClick={() => setReplyTo(null)}>
              cancel
            </button>
          </p>
        )}
        <FormAlert error={errors.root?.serverError} success={success} />
        <form noValidate onSubmit={onSubmit}>
          <div className="form-group form-inline">
            <div className="form-group col-lg-6 col-md-6 name">
              <input
                type="text"
                className={cx('form-control', errors.name && 'is-invalid')}
                placeholder="Enter Name"
                aria-label="Name"
                {...register('name')}
              />
              <FieldError error={errors.name} />
            </div>
            <div className="form-group col-lg-6 col-md-6 email">
              <input
                type="email"
                className={cx('form-control', errors.email && 'is-invalid')}
                placeholder="Enter email address"
                aria-label="Email address"
                {...register('email')}
              />
              <FieldError error={errors.email} />
            </div>
          </div>
          <div className="form-group">
            <input
              type="text"
              className="form-control"
              placeholder="Subject"
              aria-label="Subject"
              {...register('subject')}
            />
          </div>
          <div className="form-group">
            <textarea
              className={cx('form-control mb-10', errors.body && 'is-invalid')}
              rows="5"
              placeholder="Messege"
              aria-label="Message"
              {...register('body')}
            ></textarea>
            <FieldError error={errors.body} />
          </div>
          <button type="submit" className="primary-btn submit_btn" disabled={isSubmitting}>
            {isSubmitting ? 'Posting…' : 'Post Comment'}
          </button>
        </form>
      </div>
    </>
  )
}
