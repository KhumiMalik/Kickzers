import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { cx } from '../../utils/format'

/** Bootstrap 4 modal markup driven by React instead of bootstrap.js. */
export default function Modal({ onClose, className, dialogClassName, children, labelledBy }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.classList.add('modal-open')
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.classList.remove('modal-open')
    }
  }, [onClose])

  return createPortal(
    <>
      <div
        className={cx('modal fade show', className)}
        style={{ display: 'block' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className={cx('modal-dialog', dialogClassName)} role="document">
          {children}
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>,
    document.body,
  )
}
