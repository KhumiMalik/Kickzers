import { useEffect, useState } from 'react'

/**
 * Replaces jquery.sticky: true once the wrapper's top edge scrolls past the viewport top.
 */
export function useSticky(wrapperRef) {
  const [isSticky, setSticky] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const el = wrapperRef.current
      if (!el) return
      const offsetTop = el.getBoundingClientRect().top + window.scrollY
      setSticky(window.scrollY > offsetTop)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [wrapperRef])

  return isSticky
}
