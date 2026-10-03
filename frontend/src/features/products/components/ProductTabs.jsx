import { useState } from 'react'
import { cx } from '../../../lib/format'

const tabs = [
  { id: 'description', label: 'Description' },
  { id: 'specification', label: 'Specification' },
  { id: 'comments', label: 'Comments' },
  { id: 'reviews', label: 'Reviews' },
]

/**
 * Product description tabs. The Comments and Reviews panels belong to other
 * features, so the page passes them in (`commentsPanel`, `reviewsPanel`).
 */
export default function ProductTabs({ product, commentsPanel, reviewsPanel }) {
  const [active, setActive] = useState('reviews')

  return (
    <section className="product_description_area">
      <div className="container">
        <ul className="nav nav-tabs" role="tablist">
          {tabs.map((tab) => (
            <li key={tab.id} className="nav-item">
              <a
                className={cx('nav-link', active === tab.id && 'active')}
                id={`${tab.id}-tab`}
                href={`#${tab.id}`}
                role="tab"
                aria-controls={tab.id}
                aria-selected={active === tab.id}
                onClick={(e) => {
                  e.preventDefault()
                  setActive(tab.id)
                }}
              >
                {tab.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="tab-content">
          <div className="tab-pane fade show active" id={active} role="tabpanel" aria-labelledby={`${active}-tab`}>
            {active === 'description' && product.description.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
            {active === 'specification' && (
              <div className="table-responsive">
                <table className="table">
                  <tbody>
                    {product.specifications.map((spec) => (
                      <tr key={spec.label}>
                        <td>
                          <h5>{spec.label}</h5>
                        </td>
                        <td>
                          <h5>{spec.value}</h5>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {active === 'comments' && commentsPanel}
            {active === 'reviews' && reviewsPanel}
          </div>
        </div>
      </div>
    </section>
  )
}
