import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import QuantityInput from './QuantityInput'

describe('QuantityInput', () => {
  it('increments and decrements within bounds', () => {
    const onChange = vi.fn()
    render(<QuantityInput value={1} onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: 'Increase quantity' }))
    expect(onChange).toHaveBeenLastCalledWith(2)

    // Already at the minimum (1), so decreasing keeps it at 1.
    fireEvent.click(screen.getByRole('button', { name: 'Decrease quantity' }))
    expect(onChange).toHaveBeenLastCalledWith(1)
  })

  it('ignores non-digit input', () => {
    const onChange = vi.fn()
    render(<QuantityInput value={3} onChange={onChange} />)

    fireEvent.change(screen.getByTitle('Quantity:'), { target: { value: '4a' } })
    expect(onChange).toHaveBeenLastCalledWith(4)
  })
})
