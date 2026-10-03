import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { cx } from '../utils/format'

const ToastContext = createContext(null)

let nextToastId = 1

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), [])

  const notify = useCallback(
    (message, type = 'success') => {
      const id = nextToastId++
      setToasts((list) => [...list.slice(-2), { id, message, type }])
      setTimeout(() => dismiss(id), 3000)
    },
    [dismiss],
  )

  const value = useMemo(() => ({ notify }), [notify])

  return (
    <ToastContext value={value}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={cx('toast-item', `toast-${t.type}`)} onClick={() => dismiss(t.id)}>
            <span className={cx('lnr', t.type === 'error' ? 'lnr-warning' : 'lnr-checkmark-circle')}></span>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext>
  )
}

export const useToast = () => useContext(ToastContext)
