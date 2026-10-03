import { cx } from '../../lib/format'

const DEFAULT_AVATAR = '/img/blog/c6.jpg'

/** The template's `.review_item` block (product reviews and product comments). */
export default function ReviewItem({ authorName, avatar, body, isReply, children }) {
  return (
    <div className={cx('review_item', isReply && 'reply')}>
      <div className="media">
        <div className="d-flex">
          <img src={avatar ?? DEFAULT_AVATAR} alt={authorName} />
        </div>
        <div className="media-body">
          <h4>{authorName}</h4>
          {children}
        </div>
      </div>
      <p>{body}</p>
    </div>
  )
}
