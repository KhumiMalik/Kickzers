import { Link } from 'react-router-dom'
import { useBlogSidebar } from '../queries'

/** The three category cards above the blog list. */
export default function FeaturedCategories() {
  const { data } = useBlogSidebar()

  return (
    <section className="blog_categorie_area">
      <div className="container">
        <div className="row">
          {data?.featuredCategories.map((category) => (
            <div key={category.name} className="col-lg-4">
              <div className="categories_post">
                <img src={category.image} alt={category.name} />
                <div className="categories_details">
                  <div className="categories_text">
                    <Link to={`/blog?category=${category.slug}`}>
                      <h5>{category.name}</h5>
                    </Link>
                    <div className="border_line"></div>
                    <p>{category.tagline}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
