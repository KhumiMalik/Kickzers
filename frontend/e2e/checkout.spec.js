import { expect, test } from '@playwright/test'
import { addFromProductPage, cartLink, fillBilling, placeOrderButton, uniqueEmail } from './support/helpers'

test.describe('Checkout, confirmation and tracking', () => {
  test('shows validation errors when required fields are missing', async ({ page }) => {
    await addFromProductPage(page, 'suede-classic-low')
    await page.goto('/checkout')
    await placeOrderButton(page).click()

    const form = page.locator('#checkout-form')
    await expect(form.getByText('First name is required.')).toBeVisible()
    await expect(form.getByText('Email address is required.')).toBeVisible()
    await expect(page.getByText('Please accept the terms & conditions.')).toBeVisible()
    await expect(page).toHaveURL(/\/checkout$/)
  })

  test('places an order with the correct totals, then tracks it', async ({ page }) => {
    const email = uniqueEmail()

    // 2 × $75 + 3 × $150 = $600, KICKZERS10 = -$60, Flat Rate $10 → $550
    await addFromProductPage(page, 'suede-classic-low', 2)
    await addFromProductPage(page, 'aero-knit-running-shoe', 3)
    await page.goto('/cart')
    await page.getByPlaceholder('Coupon Code').fill('KICKZERS10')
    await page.getByRole('button', { name: 'Apply' }).click()
    await expect(page.locator('.coupon-note')).toContainText('KICKZERS10')
    await page.getByRole('link', { name: 'Flat Rate: $10.00' }).click()
    await page.getByRole('link', { name: 'Proceed to checkout' }).click()

    await fillBilling(page, email)
    // The theme hides the real radio input, so click its label like a user would.
    await page.locator('label', { hasText: 'Check payments' }).click()
    await page.getByLabel(/accept the/).check()
    await placeOrderButton(page).click()

    await expect(page).toHaveURL(/\/confirmation\?order=/)
    await expect(page.getByRole('heading', { name: 'Thank you. Your order has been received.' })).toBeVisible()
    const details = page.locator('.order_details_table')
    await expect(details.getByRole('row', { name: /Subtotal/ })).toContainText('$600.00')
    await expect(details.getByRole('row', { name: /Discount/ })).toContainText('-$60.00')
    await expect(details.getByRole('row', { name: /Shipping/ })).toContainText('$10.00')
    await expect(details.getByRole('row', { name: /^Total/ })).toContainText('$550.00')
    await expect(cartLink(page)).toHaveAccessibleName('Shopping cart, 0 items')

    const orderInfo = await page.locator('.details_item').first().locator('li').first().textContent()
    const orderNumber = orderInfo.split(':')[1].trim()

    // Tracking: a wrong email is rejected, the right one shows the status.
    await page.goto('/tracking')
    await page.getByPlaceholder('Order ID').fill(orderNumber)
    await page.getByPlaceholder('Billing Email Address').fill('someone-else@example.com')
    await page.getByRole('button', { name: 'Track Order' }).click()
    await expect(page.getByText(/No order matches/)).toBeVisible()

    await page.getByPlaceholder('Billing Email Address').fill(email)
    await page.getByRole('button', { name: 'Track Order' }).click()
    await expect(page.locator('.tracking-result')).toContainText(`Order #${orderNumber}`)
    await expect(page.locator('.tracking-result')).toContainText('Processing')
  })
})
