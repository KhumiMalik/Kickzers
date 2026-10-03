import { expect, test } from '@playwright/test'
import { addFromProductPage, cartLink, cartTotalsRow, money, productCard, toasts } from './support/helpers'

test.describe('Bag and cart', () => {
  test('adds a product from its card and updates the header count', async ({ page }) => {
    await page.goto('/shop')
    await productCard(page, 'Suede Classic Low').getByRole('link', { name: 'add to bag' }).click()

    await expect(toasts(page)).toContainText('Suede Classic Low added to your bag.')
    await expect(cartLink(page)).toHaveAccessibleName('Shopping cart, 1 items')
  })

  test('adds a product with a quantity from the quick view', async ({ page }) => {
    await page.goto('/shop')
    await productCard(page, 'Aero Knit Running Shoe').getByRole('link', { name: 'view more' }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Aero Knit Running Shoe' })).toBeVisible()
    await dialog.getByRole('button', { name: 'Increase quantity' }).click()
    await dialog.getByRole('button', { name: 'Add to Cart' }).click()

    await expect(dialog).toBeHidden()
    await expect(cartLink(page)).toHaveAccessibleName('Shopping cart, 2 items')
  })

  test('rejects an invalid coupon and applies KARMA10', async ({ page }) => {
    await addFromProductPage(page, 'aero-knit-running-shoe', 2)
    await page.goto('/cart')
    const coupon = page.getByPlaceholder('Coupon Code')

    await coupon.fill('BADCODE')
    await page.getByRole('button', { name: 'Apply' }).click()
    await expect(page.locator('.cart_inner')).toContainText('This coupon code is not valid.')

    await coupon.fill('karma10')
    await page.getByRole('button', { name: 'Apply' }).click()
    await expect(page.locator('.coupon-note')).toContainText('KARMA10')
    await expect(cartTotalsRow(page, 'Subtotal')).toHaveText('$300.00')
    await expect(cartTotalsRow(page, 'Discount')).toHaveText('-$30.00')
  })

  test('changing the shipping method updates the total', async ({ page }) => {
    await addFromProductPage(page, 'suede-classic-low')
    await page.goto('/cart')

    const subtotal = money(await cartTotalsRow(page, 'Subtotal').textContent())
    await page.getByRole('link', { name: 'Flat Rate: $10.00' }).click()
    await expect(page.locator('.shipping_box li.active')).toHaveText('Flat Rate: $10.00')
    await expect(cartTotalsRow(page, 'Total')).toHaveText(`$${(subtotal + 10).toFixed(2)}`)

    await page.getByRole('link', { name: 'Free Shipping' }).click()
    await expect(cartTotalsRow(page, 'Total')).toHaveText(`$${subtotal.toFixed(2)}`)
  })

  test('updates quantities and removes items', async ({ page }) => {
    await addFromProductPage(page, 'suede-classic-low')
    await page.goto('/cart')

    await page.getByRole('button', { name: 'Increase quantity' }).click()
    await expect(cartTotalsRow(page, 'Subtotal')).toHaveText('$150.00')

    await page.getByRole('button', { name: 'Remove' }).click()
    await expect(page.getByText('Your cart is currently empty.')).toBeVisible()
    await expect(cartLink(page)).toHaveAccessibleName('Shopping cart, 0 items')
  })
})
