import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { timeAgo } from '../../../lib/dates'
import { pad2 } from '../../../lib/format'
import { SidebarNewsletter } from '../../newsletter'
import { useBlogSidebar } from '../queries'

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
        <input
          type="text"
          className="form-control"
          placeholder="Search Posts"
          aria-label="Search posts"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        />
        <span className="input-group-btn">
          <button className="btn btn-default" type="submit" aria-label="Search posts">
            <i className="lnr lnr-magnifier" aria-hidden="true"></i>
          </button>
        </span>
      </form>
      <div className="br"></div>
    </aside>
  )
}

/** Right-hand sidebar of the blog pages. Widgets that need API data appear once it has loaded. */
export default function BlogSidebar() {
  const { data } = useBlogSidebar()

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
                  <i className={`fa fa-${icon}`} aria-hidden="true"></i>
                </a>
              ))}
            </div>
            <p>{data.author.bio}</p>
            <div className="br"></div>
          </aside>
          <aside className="single_sidebar_widget popular_post_widget">
            <h3 className="widget_title">Popular Posts</h3>
            {data.popular.map((post) => (
              <div key={post.slug} className="media post_item">
                <img src={post.thumbnail} alt={post.title} />
                <div className="media-body">
                  <Link to={`/blog/${post.slug}`}>
                    <h3>{post.title}</h3>
                  </Link>
                  <p>{timeAgo(post.publishedAt)}</p>
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
              {data.categories.map((category) => (
                <li key={category.slug}>
                  <Link to={`/blog?category=${category.slug}`} className="d-flex justify-content-between">
                    <p>{category.name}</p>
                    <p>{pad2(category.postsCount)}</p>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="br"></div>
          </aside>
        </>
      )}
      <SidebarNewsletter />
      {data && (
        <aside className="single-sidebar-widget tag_cloud_widget">
          <h4 className="widget_title">Tag Clouds</h4>
          <ul className="list">
            {data.tags.map((tag) => (
              <li key={tag.slug}>
                <Link to={`/blog?tag=${encodeURIComponent(tag.slug)}`}>{tag.name}</Link>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </div>
  )
}
