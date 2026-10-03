import { useState } from 'react'
import { cx } from '../../utils/format'

const pad = (n) => `(${String(n).padStart(2, '0')})`

/** "Browse Categories" accordion. Parents both filter and expand their children. */
export default function CategorySidebar({ categories, active, onSelect }) {
  const activeParent = categories.find((c) => c.slug === active || c.children.some((ch) => ch.slug === active))?.slug
  const [expanded, setExpanded] = useState(() => new Set(activeParent ? [activeParent] : []))

  const toggle = (slug) =>
    setExpanded((set) => {
      const next = new Set(set)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })

  return (
    <div className="sidebar-categories">
      <div className="head">Browse Categories</div>
      <ul className="main-categories">
        <li className="main-nav-list">
          <a href="#all" className={cx(!active && 'is-current')} onClick={(e) => (e.preventDefault(), onSelect(null))}>
            All Products
          </a>
        </li>
        {categories.map((cat, i) => {
          const hasChildren = cat.children.length > 0
          const open = expanded.has(cat.slug) || activeParent === cat.slug
          const isLast = i === categories.length - 1
          return (
            <li key={cat.slug} className="main-nav-list">
              <a
                href={`#${cat.slug}`}
                className={cx(isLast && !open && 'border-bottom-0', active === cat.slug && 'is-current')}
                aria-expanded={hasChildren ? open : undefined}
                onClick={(e) => {
                  e.preventDefault()
                  onSelect(cat.slug)
                  if (hasChildren && activeParent !== cat.slug) toggle(cat.slug)
                }}
              >
                {hasChildren && <span className="lnr lnr-arrow-right"></span>}
                {cat.name}
                <span className="number">{pad(cat.count)}</span>
              </a>
              {hasChildren && (
                <ul className={cx('collapse', open && 'show')}>
                  {cat.children.map((child, j) => (
                    <li key={child.slug} className="main-nav-list child">
                      <a
                        href={`#${child.slug}`}
                        className={cx(isLast && j === cat.children.length - 1 && 'border-bottom-0', active === child.slug && 'is-current')}
                        onClick={(e) => (e.preventDefault(), onSelect(child.slug))}
                      >
                        {child.name}
                        <span className="number">{pad(child.count)}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
