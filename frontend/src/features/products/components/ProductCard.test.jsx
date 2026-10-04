import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { emptyCartResponse, mockApi } from '../../../test/api'
import { renderWithProviders } from '../../../test/render'
import ProductCard from './ProductCard'

/** A ProductSummary as the frontend sees it (camelCase, after the api-client). */
const product = {
  id: 5,
  slug: 'suede-classic-low',
  name: 'Suede Classic Low',
  image: 'http://localhost:8000/storage/product/p5.jpg',
  price: 7500,
  compareAtPrice: 9500,
  currency: 'USD',
  isInStock: true,
  isComingSoon: false,
  category: { slug: 'women-sneakers', name: 'Sneakers' },
  brand: { slug: 'puma', name: 'Puma' },
}

describe('ProductCard', () => {
  it('shows the name, price, old price and links to the product page', () => {
    mockApi({ 'GET /cart': emptyCartResponse, 'GET /auth/user': [401, { message: 'Unauthenticated.' }] })
    renderWithProviders(<ProductCard product={product} />)

    // Both the image and the title link to the product page.
    const links = screen.getAllByRole('link', { name: 'Suede Classic Low' })
    expect(links).toHaveLength(2)
    for (const link of links) expect(link).toHaveAttribute('href', '/product/suede-classic-low')
    expect(screen.getByText('$75.00')).toBeInTheDocument()
    expect(screen.getByText('$95.00')).toHaveClass('l-through')
    expect(screen.queryByText('Coming soon')).not.toBeInTheDocument()
  })

  it('marks coming-soon products', () => {
    mockApi({ 'GET /cart': emptyCartResponse, 'GET /auth/user': [401, { message: 'Unauthenticated.' }] })
    renderWithProviders(<ProductCard product={{ ...product, compareAtPrice: null, isComingSoon: true }} />)

    expect(screen.getByText('Coming soon')).toBeInTheDocument()
  })

  it('adds one to the bag through the API and confirms with a toast', async () => {
    const api = mockApi({
      'GET /cart': emptyCartResponse,
      'GET /auth/user': [401, { message: 'Unauthenticated.' }],
      'POST /cart/items': emptyCartResponse,
    })
    renderWithProviders(<ProductCard product={product} />)

    fireEvent.click(screen.getByRole('link', { name: 'add to bag' }))

    expect(await screen.findByText('Suede Classic Low added to your bag.')).toBeInTheDocument()
    const [request] = api.requests('POST /cart/items')
    expect(request.body).toEqual({ product_id: 5, quantity: 1 })
    expect(request.headers['X-XSRF-TOKEN']).toBe('test-token')
  })

  it('shows the API message when the product cannot be added', async () => {
    mockApi({
      'GET /cart': emptyCartResponse,
      'GET /auth/user': [401, { message: 'Unauthenticated.' }],
      'POST /cart/items': [
        422,
        {
          message: 'Only 2 of Suede Classic Low left in stock.',
          errors: { quantity: ['Only 2 of Suede Classic Low left in stock.'] },
        },
      ],
    })
    renderWithProviders(<ProductCard product={product} />)

    fireEvent.click(screen.getByRole('link', { name: 'add to bag' }))

    expect(await screen.findByText('Only 2 of Suede Classic Low left in stock.')).toBeInTheDocument()
  })

  it("keeps a guest's wishlist in the browser", async () => {
    mockApi({ 'GET /cart': emptyCartResponse, 'GET /auth/user': [401, { message: 'Unauthenticated.' }] })
    renderWithProviders(<ProductCard product={product} />)
    // Wait until the app knows the visitor is a guest.
    await waitFor(() => expect(screen.getByRole('link', { name: 'Add to wishlist' })).toBeInTheDocument())

    fireEvent.click(screen.getByRole('link', { name: 'Add to wishlist' }))

    expect(await screen.findByRole('link', { name: 'Remove from wishlist' })).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('kickzers.guest-wishlist'))).toEqual([5])
  })
})
