import { useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'

/**
 * Replaces magnific-popup's `.img-pop-up` gallery.
 * Usage: const lightbox = useLightbox(images); <a onClick={lightbox.openAt(i)} /> … {lightbox.element}
 */
export function useLightbox(images) {
  const [index, setIndex] = useState(-1)

  return {
    openAt: (i) => (e) => {
      e.preventDefault()
      setIndex(i)
    },
    element: (
      <Lightbox
        open={index >= 0}
        index={Math.max(0, index)}
        close={() => setIndex(-1)}
        slides={images.map((src) => ({ src }))}
      />
    ),
  }
}
