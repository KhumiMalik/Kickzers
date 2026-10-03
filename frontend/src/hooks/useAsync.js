import { useEffect, useRef, useState } from 'react'

/**
 * Runs an async loader whenever `deps` (primitives) change.
 * While a new request is in flight the previous `data` is kept, so lists
 * can dim instead of flashing empty; `loading` tells the two states apart.
 */
export function useAsync(loader, deps) {
  const key = JSON.stringify(deps)
  const [state, setState] = useState({ key: null, data: undefined, error: null })
  const loaderRef = useRef(loader)

  useEffect(() => {
    loaderRef.current = loader
  })

  useEffect(() => {
    let active = true
    loaderRef.current().then(
      (data) => active && setState({ key, data, error: null }),
      (error) => active && setState({ key, data: undefined, error }),
    )
    return () => {
      active = false
    }
  }, [key])

  return { data: state.data, error: state.error, loading: state.key !== key }
}
