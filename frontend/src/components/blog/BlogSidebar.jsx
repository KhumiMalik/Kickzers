import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getBlogSidebar } from '../../api/blog'
import { subscribeNewsletter } from '../../api/site'
import { useAsync } from '../../hooks/useAsync'
import { useForm } from '../../hooks/useForm'
import { pad2, timeAgo } from '../../utils/format'
import { email, required } from '../../utils/validation'
import { FieldError } from '../common/FormControls'

function SearchWidget() {
  const navigate = useNavigate()
  const [term, setTerm] = useState('')
  const search = (e) => {
    e.preventDefault()
    navigate(term.trim() ? `/blog?q=${encodeURIComponent(term.trim())}` : '/blog')
  }
  return (
    <aside className="single_sidebar_widget search_widget">
      <form className="input-group" onSubmit={search}>
        <input type="text" className="form-control" placeholder="Search Posts" value={term} onChange={(e) => setTerm(e.target.value)} />
        <span className="input-group-btn">
          <button className="btn btn-default" type="submit" aria-label="Search posts">
            <i className="lnr lnr-magnifier"></i>
          </button>
        </span>
      </form>
      <div className="br"></div>
    </aside>
  )
}

function NewsletterWidget() {
  const [message, setMessage] = useState(null)
  const form = useForm({ email: '' }, { email: [required('Email'), email()] })
  const onSubmit = form.submit(async (values) => {
    const res = await subscribeNewsletter(values.email)
    setMessage(res.message)
    form.reset()
  })

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
          <input type="email" className="form-control" placeholder="Enter email" aria-label="Email" {...form.field('email')} />
        </div>
        <button type="submit" className="bbtns" disabled={form.submitting}>
          Subcribe
        </button>
      </form>
      <FieldError error={form.errors.email} />
      <p className="text-bottom">{message ?? 'You can unsubscribe at any time'}</p>
      <div className="br"></div>
    </aside>
  )
}

export default function BlogSidebar() {
  const { data } = useAsync(getBlogSidebar, [])

  return (
    <div className="blog_right_sidebar">
      <SearchWidget />
      {data && (
        <>
          <aside className="single_sidebar_widget author_widget">
            <img className="author_img rounded-circle" src={data.author.avatar} alt={data.author.name} />
            <h4>{data.author.name}</h4>
            <p>{data.author.role}</p>
            <div className="social_icon">
              {['facebook', 'twitter', 'github', 'behance'].map((icon) => (
                <a key={icon} href="#social" aria-label={icon}>
                  <i className={`fa fa-${icon}`}></i>
                </a>
              ))}
            </div>
            <p>{data.author.bio}</p>
            <div className="br"></div>
          </aside>
          <aside className="single_sidebar_widget popular_post_widget">
            <h3 className="widget_title">Popular Posts</h3>
            {data.popular.map((post) => (
              <div key={post.id} className="media post_item">
                <img src={post.thumb} alt={post.title} />
                <div className="media-body">
                  <Link to={`/blog/${post.slug}`}>
                    <h3>{post.title}</h3>
                  </Link>
                  <p>{timeAgo(post.date)}</p>
                </div>
              </div>
            ))}
            <div className="br"></div>
          </aside>
          <aside className="single_sidebar_widget ads_widget">
            <Link to="/shop">
              <img className="img-fluid" src="/img/blog/add.jpg" alt="Shop now" />
            </Link>
            <div className="br"></div>
          </aside>
          <aside className="single_sidebar_widget post_category_widget">
            <h4 className="widget_title">Post Catgories</h4>
            <ul className="list cat-list">
              {data.categories.map((c) => (
                <li key={c.slug}>
                  <Link to={`/blog?category=${c.slug}`} className="d-flex justify-content-between">
                    <p>{c.name}</p>
                    <p>{pad2(c.count)}</p>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="br"></div>
          </aside>
        </>
      )}
      <NewsletterWidget />
      {data && (
        <aside className="single-sidebar-widget tag_cloud_widget">
          <h4 className="widget_title">Tag Clouds</h4>
          <ul className="list">
            {data.tags.map((tag) => (
              <li key={tag}>
                <Link to={`/blog?tag=${encodeURIComponent(tag)}`}>{tag}</Link>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </div>
  )
}
