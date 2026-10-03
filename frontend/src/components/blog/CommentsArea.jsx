import { useState } from 'react'
import { addPostComment } from '../../api/blog'
import { useForm } from '../../hooks/useForm'
import { cx, formatDateTime, pad2 } from '../../utils/format'
import { email, required } from '../../utils/validation'
import { FieldError, FormAlert } from '../common/FormControls'

function Comment({ comment, isReply, onReply }) {
  return (
    <div className={cx('comment-list', isReply && 'left-padding')}>
      <div className="single-comment justify-content-between d-flex">
        <div className="user justify-content-between d-flex">
          <div className="thumb">
            <img src={comment.avatar} alt={comment.name} />
          </div>
          <div className="desc">
            <h5>{comment.name}</h5>
            <p className="date">{formatDateTime(comment.date)}</p>
            <p className="comment">{comment.text}</p>
          </div>
        </div>
        <div className="reply-btn">
          <button type="button" className="btn-reply text-uppercase" onClick={() => onReply(comment.name)}>
            reply
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CommentsArea({ post }) {
  const [comments, setComments] = useState(post.comments)
  const [success, setSuccess] = useState(null)
  const form = useForm(
    { name: '', email: '', subject: '', text: '' },
    { name: [required('Name')], email: [required('Email'), email()], text: [required('Message')] },
  )
  const total = comments.reduce((n, c) => n + 1 + c.replies.length, 0)

  const onSubmit = form.submit(async (values) => {
    const comment = await addPostComment(post.id, values)
    setComments((list) => [...list, comment])
    setSuccess('Thanks! Your comment has been posted.')
    form.reset()
  })

  const replyTo = (name) => {
    form.setValue('subject', `Re: ${name}`)
    document.getElementById('comment-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <>
      <div className="comments-area" id="comments">
        <h4>{pad2(total)} Comments</h4>
        {comments.map((c) => (
          <div key={c.id}>
            <Comment comment={c} onReply={replyTo} />
            {c.replies.map((r) => (
              <Comment key={r.id} comment={r} isReply onReply={replyTo} />
            ))}
          </div>
        ))}
      </div>
      <div className="comment-form" id="comment-form">
        <h4>Leave a Reply</h4>
        <FormAlert error={form.errors.form} success={success} />
        <form noValidate onSubmit={onSubmit}>
          <div className="form-group form-inline">
            <div className="form-group col-lg-6 col-md-6 name">
              <input type="text" className={cx('form-control', form.errors.name && 'is-invalid')} placeholder="Enter Name" {...form.field('name')} />
              <FieldError error={form.errors.name} />
            </div>
            <div className="form-group col-lg-6 col-md-6 email">
              <input type="email" className={cx('form-control', form.errors.email && 'is-invalid')} placeholder="Enter email address" {...form.field('email')} />
              <FieldError error={form.errors.email} />
            </div>
          </div>
          <div className="form-group">
            <input type="text" className="form-control" placeholder="Subject" {...form.field('subject')} />
          </div>
          <div className="form-group">
            <textarea className={cx('form-control mb-10', form.errors.text && 'is-invalid')} rows="5" placeholder="Messege" {...form.field('text')}></textarea>
            <FieldError error={form.errors.text} />
          </div>
          <button type="submit" className="primary-btn submit_btn" disabled={form.submitting}>
            {form.submitting ? 'Posting…' : 'Post Comment'}
          </button>
        </form>
      </div>
    </>
  )
}
