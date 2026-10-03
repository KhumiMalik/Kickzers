import { useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { navigation } from '../../data/site'
import { useSticky } from '../../hooks/useSticky'
import { cx } from '../../utils/format'

function isActive(item, pathname) {
  if (item.to) return item.to === '/' ? pathname === '/' : pathname.startsWith(item.to.split('/').slice(0, 2).join('/'))
  return item.children.some((child) => isActive(child, pathname))
}

export default function Header() {
  const wrapperRef = useRef(null)
  const isSticky = useSticky(wrapperRef)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { count } = useCart()
  const { user, logout } = useAuth()

  // Menu state remembers the page it was opened on, so navigating closes it.
  const [menu, setMenu] = useState({ path: null, dropdown: null })
  const menuOpen = menu.path === pathname
  const openDropdown = menuOpen ? menu.dropdown : null
  const toggleMenu = () => setMenu(menuOpen ? { path: null, dropdown: null } : { path: pathname, dropdown: null })
  const toggleDropdown = (label) => setMenu({ path: pathname, dropdown: openDropdown === label ? null : label })

  const [searchOpen, setSearchOpen] = useState(false)
  const [term, setTerm] = useState('')

  const submitSearch = (e) => {
    e.preventDefault()
    if (!term.trim()) return
    navigate(`/shop?q=${encodeURIComponent(term.trim())}`)
    setSearchOpen(false)
    setTerm('')
  }

  const renderChild = (child) => {
    if (child.to === '/login' && user) {
      return (
        <li key="logout" className="nav-item">
          <a href="#logout" className="nav-link" onClick={(e) => (e.preventDefault(), logout())}>
            Logout ({user.name})
          </a>
        </li>
      )
    }
    return (
      <li key={child.to} className={cx('nav-item', pathname === child.to && 'active')}>
        <Link className="nav-link" to={child.to}>
          {child.label}
        </Link>
      </li>
    )
  }

  return (
    <div ref={wrapperRef} className={cx('sticky-wrapper', isSticky && 'is-sticky')}>
      <header className="header_area sticky-header" style={isSticky ? { position: 'fixed', top: 0, width: '100%' } : undefined}>
        <div className="main_menu">
          <nav className="navbar navbar-expand-lg navbar-light main_box">
            <div className="container">
              <Link className="navbar-brand logo_h" to="/">
                <img src="/img/logo.png" alt="Karma Shop" />
              </Link>
              <button
                className="navbar-toggler"
                type="button"
                aria-controls="navbarSupportedContent"
                aria-expanded={menuOpen}
                aria-label="Toggle navigation"
                onClick={toggleMenu}
              >
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
              </button>
              <div className={cx('collapse navbar-collapse offset', menuOpen && 'show')} id="navbarSupportedContent">
                <ul className="nav navbar-nav menu_nav ml-auto">
                  {navigation.map((item) =>
                    item.children ? (
                      <li key={item.label} className={cx('nav-item submenu dropdown', isActive(item, pathname) && 'active')}>
                        <a
                          href="#menu"
                          className="nav-link dropdown-toggle"
                          role="button"
                          aria-haspopup="true"
                          aria-expanded={openDropdown === item.label}
                          onClick={(e) => {
                            e.preventDefault()
                            toggleDropdown(item.label)
                          }}
                        >
                          {item.label}
                        </a>
                        <ul className={cx('dropdown-menu', openDropdown === item.label && 'show')}>{item.children.map(renderChild)}</ul>
                      </li>
                    ) : (
                      <li key={item.label} className={cx('nav-item', isActive(item, pathname) && 'active')}>
                        <NavLink className="nav-link" to={item.to} end>
                          {item.label}
                        </NavLink>
                      </li>
                    ),
                  )}
                </ul>
                <ul className="nav navbar-nav navbar-right">
                  <li className="nav-item">
                    <Link to="/cart" className="cart" aria-label={`Shopping cart, ${count} items`}>
                      <span className="ti-bag"></span>
                      {count > 0 && <span className="cart-count">{count}</span>}
                    </Link>
                  </li>
                  <li className="nav-item">
                    <button className="search" type="button" aria-label="Search" onClick={() => setSearchOpen((o) => !o)}>
                      <span className="lnr lnr-magnifier" id="search"></span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </nav>
        </div>
        {searchOpen && (
          <div className="search_input" id="search_input_box">
            <div className="container">
              <form className="d-flex justify-content-between" onSubmit={submitSearch}>
                <input
                  type="text"
                  className="form-control"
                  id="search_input"
                  placeholder="Search Here"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="btn"></button>
                <span className="lnr lnr-cross" id="close_search" title="Close Search" onClick={() => setSearchOpen(false)}></span>
              </form>
            </div>
          </div>
        )}
      </header>
    </div>
  )
}
