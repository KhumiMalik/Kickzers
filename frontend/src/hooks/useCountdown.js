import { useEffect, useState } from 'react'

function remaining(target) {
  const total = Math.max(0, new Date(target).getTime() - Date.now())
  return {
    total,
    days: Math.floor(total / 864e5),
    hours: Math.floor((total / 36e5) % 24),
    minutes: Math.floor((total / 6e4) % 60),
    seconds: Math.floor((total / 1e3) % 60),
  }
}

export function useCountdown(target) {
  const [time, setTime] = useState(() => remaining(target))

  useEffect(() => {
    const id = setInterval(() => {
      const next = remaining(target)
      setTime(next)
      if (next.total === 0) clearInterval(id)
    }, 1000)
    return () => clearInterval(id)
  }, [target])

  return time
}
