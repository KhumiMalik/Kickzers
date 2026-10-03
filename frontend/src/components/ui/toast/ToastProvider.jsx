import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { cx } from '../../../lib/format'

const ToastContext = createContext(null)

let nextToastId = 1
const VISIBLE_MS = 3000

/** Short-lived feedback messages (client state, so a context is the right tool). */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), [])

  const notify = useCallback(
    (message, type = 'success') => {
      const id = nextToastId++
      setToasts((list) => [...list.slice(-2), { id, message, type }])
      setTimeout(() => dismiss(id), VISIBLE_MS)
    },
    [dismiss],
  )

  const value = useMemo(() => ({ notify }), [notify])

  return (
    <ToastContext value={value}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map((t) => (
          <button
            key={t.id}
            type="button"
            className={cx('toast-item', `toast-${t.type}`)}
            onClick={() => dismiss(t.id)}
          >
            <span
              className={cx('lnr', t.type === 'error' ? 'lnr-warning' : 'lnr-checkmark-circle')}
              aria-hidden="true"
            ></span>
            {t.message}
          </button>
        ))}
      </div>
    </ToastContext>
  )
}

/** @returns {{ notify: (message: string, type?: 'success'|'error') => void }} */
export const useToast = () => useContext(ToastContext)
