import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { emptyCartResponse, mockApi } from '../../../test/api'
import { renderWithProviders } from '../../../test/render'
import CouponForm from './CouponForm'

const apply = (code) => {
  fireEvent.change(screen.getByRole('textbox', { name: 'Coupon code' }), { target: { value: code } })
  fireEvent.click(screen.getByRole('button', { name: 'Apply' }))
}

describe('CouponForm', () => {
  it('asks for a code before calling the API', async () => {
    const api = mockApi({})
    renderWithProviders(<CouponForm coupon={null} />)

    apply('  ')

    expect(await screen.findByText('Please enter a coupon code.')).toBeInTheDocument()
    expect(api.requests('POST /cart/coupon')).toHaveLength(0)
  })

  it('shows the reason the API rejected the code', async () => {
    mockApi({
      'POST /cart/coupon': [
        422,
        { message: 'This coupon has expired.', errors: { code: ['This coupon has expired.'] } },
      ],
    })
    renderWithProviders(<CouponForm coupon={null} />)

    apply('SPRING')

    expect(await screen.findByText('This coupon has expired.')).toBeInTheDocument()
  })

  it('applies a code and clears the input', async () => {
    const applied = {
      data: { ...emptyCartResponse.data, coupon: { code: 'KICKZERS10', description: '10% off' } },
    }
    const api = mockApi({ 'POST /cart/coupon': applied })
    renderWithProviders(<CouponForm coupon={null} />)

    apply('kickzers10')

    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Coupon code' })).toHaveValue(''))
    expect(api.requests('POST /cart/coupon')[0].body).toEqual({ code: 'kickzers10' })
  })

  it('shows the applied coupon and removes it with "Close Coupon"', async () => {
    const api = mockApi({ 'DELETE /cart/coupon': emptyCartResponse })
    renderWithProviders(<CouponForm coupon={{ code: 'KICKZERS10', description: '10% off' }} />)

    expect(screen.getByText('Coupon KICKZERS10 applied (10% off).')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('link', { name: 'Close Coupon' }))

    await waitFor(() => expect(api.requests('DELETE /cart/coupon')).toHaveLength(1))
  })
})
