import { Link } from 'react-router-dom'
import { formatShortDate } from '../../../lib/dates'
import { formatCompact, pad2 } from '../../../lib/format'

/** Left-hand tag + meta column used on both blog list items and the single post. */
export default function BlogInfo({ post, children }) {
  return (
    <div className="blog_info text-right">
      <div className="post_tag">
        {post.tags.map((tag, i) => (
          <Link
            key={tag.slug}
            to={`/blog?tag=${encodeURIComponent(tag.slug)}`}
            className={i === 0 ? 'active' : undefined}
          >
            {tag.name}
            {i < post.tags.length - 1 && ','}{' '}
          </Link>
        ))}
      </div>
      <ul className="blog_meta list">
        <li>
          <span>
            {post.author.name}
            <i className="lnr lnr-user" aria-hidden="true"></i>
          </span>
        </li>
        <li>
          <span>
            {formatShortDate(post.publishedAt)}
            <i className="lnr lnr-calendar-full" aria-hidden="true"></i>
          </span>
        </li>
        <li>
          <span>
            {formatCompact(post.views)} Views<i className="lnr lnr-eye" aria-hidden="true"></i>
          </span>
        </li>
        <li>
          <Link to={`/blog/${post.slug}#comments`}>
            {pad2(post.commentsCount)} Comments<i className="lnr lnr-bubble" aria-hidden="true"></i>
          </Link>
        </li>
      </ul>
      {children}
    </div>
  )
}
