import { Link } from 'react-router-dom'
import { formatCompact, formatShortDate, pad2 } from '../../utils/format'

const countComments = (comments) => comments.reduce((n, c) => n + 1 + c.replies.length, 0)

/** Left-hand tag + meta column used on both blog list items and the single post. */
export default function BlogInfo({ post, children }) {
  return (
    <div className="blog_info text-right">
      <div className="post_tag">
        {post.tags.map((tag, i) => (
          <Link key={tag} to={`/blog?tag=${encodeURIComponent(tag)}`} className={i === 0 ? 'active' : undefined}>
            {tag}
            {i < post.tags.length - 1 && ','}{' '}
          </Link>
        ))}
      </div>
      <ul className="blog_meta list">
        <li>
          <span>
            {post.author}
            <i className="lnr lnr-user"></i>
          </span>
        </li>
        <li>
          <span>
            {formatShortDate(post.date)}
            <i className="lnr lnr-calendar-full"></i>
          </span>
        </li>
        <li>
          <span>
            {formatCompact(post.views)} Views<i className="lnr lnr-eye"></i>
          </span>
        </li>
        <li>
          <Link to={`/blog/${post.slug}#comments`}>
            {pad2(countComments(post.comments))} Comments<i className="lnr lnr-bubble"></i>
          </Link>
        </li>
      </ul>
      {children}
    </div>
  )
}
