import { expect } from '@playwright/test'

/**
 * Shared steps for the e2e specs. They interact the way a user does (roles,
 * labels, visible text) so they survive internal refactors.
 */

/** The toast stack (the loader also uses role="status", so match the container). */
export const toasts = (page) => page.locator('.toast-stack')

/** The header cart link, whose accessible name includes the item count. */
export const cartLink = (page) => page.getByRole('link', { name: /^Shopping cart/ })

/** A product card in any grid, found by its product name. */
export const productCard = (page, name) => page.locator('.single-product').filter({ hasText: name })

/** Opens a product page and adds `qty` of it to the bag with the quantity stepper. */
export async function addFromProductPage(page, slug, qty = 1) {
  await page.goto(`/product/${slug}`)
  const addButton = page.getByRole('button', { name: 'Add to Cart' })
  await expect(addButton).toBeVisible()
  for (let i = 1; i < qty; i++) {
    await page.getByRole('button', { name: 'Increase quantity' }).click()
  }
  await expect(page.locator('.s_product_text').getByTitle('Quantity:')).toHaveValue(String(qty))
  await addButton.click()
  await expect(toasts(page)).toContainText('added to your bag')
}

/** Opens a nice-select dropdown (shown with its current text) and picks an option. */
export async function chooseNiceSelect(page, currentText, optionText, scope = page) {
  // Pages can contain several identical dropdowns (e.g. the top and bottom filter bars),
  // so the option is looked up inside the dropdown that was opened.
  const select = scope.getByRole('listbox').filter({ hasText: currentText }).first()
  await select.click()
  await select.getByRole('option', { name: optionText, exact: true }).click()
}

/** Prices shown on the product cards currently in the grid (waits for the grid to settle). */
export async function cardPrices(page) {
  await expect(page.locator('.single-product').first()).toBeVisible()
  await expect(page.locator('.lattest-product-area')).not.toHaveClass(/is-loading/)
  return (await page.locator('.single-product .price h6:first-child').allTextContents()).map(money)
}

/** Reads a money amount like "$1,234.50" into a number. */
export const money = (text) => Number(text.replace(/[^0-9.-]/g, ''))

/** The value cell (last <h5>) of a cart totals row such as "Subtotal" or "Total". */
export function cartTotalsRow(page, label) {
  return page.locator('.cart_inner tr').filter({ has: page.locator('h5', { hasText: new RegExp(`^${label}$`) }) }).locator('h5').last()
}

/** Fills the checkout billing form with valid data for `email`. */
export async function fillBilling(page, email) {
  const form = page.locator('#checkout-form')
  await form.getByLabel('First name').fill('Jane')
  await form.getByLabel('Last name').fill('Doe')
  await form.getByLabel('Phone number').fill('0300 1234567')
  await form.getByLabel('Email Address').fill(email)
  await chooseNiceSelect(page, 'Country', 'Pakistan', form)
  await form.getByLabel('Address line 01').fill('12 Mall Road')
  await form.getByLabel('Town/City').fill('Lahore')
}

/** Submits checkout (the button text depends on the payment method). */
export const placeOrderButton = (page) => page.getByRole('button', { name: /proceed to paypal|place order/i })

/** A unique email per test run, so orders never collide. */
export const uniqueEmail = (prefix = 'e2e') => `${prefix}+${Date.now()}${Math.floor(Math.random() * 1000)}@example.com`
