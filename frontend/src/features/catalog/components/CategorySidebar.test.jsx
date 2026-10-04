import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import CategorySidebar from './CategorySidebar'

const categories = [
  {
    slug: 'men-shoes',
    name: "Men's Shoes",
    productsCount: 7,
    children: [
      { slug: 'running', name: 'Running', productsCount: 3 },
      { slug: 'sneakers', name: 'Sneakers', productsCount: 2 },
    ],
  },
  { slug: 'accessories', name: 'Accessories', productsCount: 0, children: [] },
]

describe('CategorySidebar', () => {
  it('shows each category with its product count', () => {
    render(<CategorySidebar categories={categories} active={null} onSelect={vi.fn()} />)

    expect(screen.getByRole('link', { name: /^Men's Shoes\s*\(07\)$/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^Accessories\s*\(00\)$/ })).toBeInTheDocument()
  })

  it('selects a parent category and expands its children', () => {
    const onSelect = vi.fn()
    render(<CategorySidebar categories={categories} active={null} onSelect={onSelect} />)
    const parent = screen.getByRole('link', { name: /Men's Shoes/ })

    expect(parent).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(parent)

    expect(onSelect).toHaveBeenCalledWith('men-shoes')
    expect(parent).toHaveAttribute('aria-expanded', 'true')
  })

  it('selects a sub-category and "All Products"', () => {
    const onSelect = vi.fn()
    render(<CategorySidebar categories={categories} active="running" onSelect={onSelect} />)

    // The active child keeps its parent open and is highlighted.
    expect(screen.getByRole('link', { name: /^Running/ })).toHaveClass('is-current')

    fireEvent.click(screen.getByRole('link', { name: /^Sneakers/ }))
    expect(onSelect).toHaveBeenLastCalledWith('sneakers')

    fireEvent.click(screen.getByRole('link', { name: 'All Products' }))
    expect(onSelect).toHaveBeenLastCalledWith(null)
  })
})
