import noUiSlider from 'nouislider'
import { useEffect, useRef, useState } from 'react'

/** noUiSlider wrapper. Calls `onChange([min, max])` when the user releases a handle. */
export default function PriceRangeSlider({ min, max, value, onChange }) {
  const elRef = useRef(null)
  const sliderRef = useRef(null)
  const onChangeRef = useRef(onChange)
  const valueRef = useRef(value)
  const [display, setDisplay] = useState(value)

  useEffect(() => {
    onChangeRef.current = onChange
    valueRef.current = value
  })

  useEffect(() => {
    const slider = noUiSlider.create(elRef.current, {
      connect: true,
      behaviour: 'tap',
      start: valueRef.current,
      step: 1,
      range: { min, max },
    })
    slider.on('update', (values) => setDisplay(values.map(Number)))
    slider.on('change', (values) => onChangeRef.current(values.map((v) => Math.round(Number(v)))))
    sliderRef.current = slider
    return () => slider.destroy()
    // Re-create only when the bounds change; the selected range is synced by the effect below.
  }, [min, max])

  const [low, high] = value
  useEffect(() => {
    sliderRef.current?.set([low, high])
  }, [low, high])

  return (
    <div className="price-range-area">
      <div ref={elRef}></div>
      <div className="value-wrapper d-flex">
        <div className="price">Price:</div>
        <span>$</span>
        <div>{Math.round(display[0])}</div>
        <div className="to">to</div>
        <span>$</span>
        <div>{Math.round(display[1])}</div>
      </div>
    </div>
  )
}
