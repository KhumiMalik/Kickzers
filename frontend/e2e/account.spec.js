import { expect, test } from '@playwright/test'
import { addFromProductPage, fillBilling, placeOrderButton, productCard, toasts, uniqueEmail } from './support/helpers'

test.describe('Login', () => {
  test('rejects bad credentials, then logs in and can log out', async ({ page }) => {
    await page.goto('/login')
    const form = page.locator('.login_form')

    await form.getByRole('button', { name: 'Log In' }).click()
    await expect(form.getByText('Password is required.')).toBeVisible()

    // The seeded demo customer (backend DemoUserSeeder).
    await form.getByPlaceholder('Email Address').fill('jane@example.com')
    await form.getByPlaceholder('Password').fill('wrong-password')
    await form.getByRole('button', { name: 'Log In' }).click()
    await expect(form.getByText('These credentials do not match our records.')).toBeVisible()

    await form.getByPlaceholder('Password').fill('password')
    await form.getByRole('button', { name: 'Log In' }).click()
    await expect(page).toHaveURL('/')
    await expect(toasts(page)).toContainText('Welcome back')

    // The Pages menu (opened on hover, like a mouse user) now offers My Account and Logout instead of Login.
    const pagesMenu = page.locator('.menu_nav .submenu').filter({ hasText: 'Pages' })
    await pagesMenu.hover()
    await expect(pagesMenu.getByRole('link', { name: 'My Account' })).toBeVisible()
    await pagesMenu.getByRole('link', { name: /^Logout/ }).click()
    await pagesMenu.hover()
    await expect(pagesMenu.getByRole('link', { name: 'Login', exact: true })).toBeVisible()
  })
})

test.describe('Wishlist', () => {
  test('keeps a guest wishlist in the browser and moves it to the account on login', async ({ page }) => {
    await page.goto('/shop')
    const card = productCard(page, 'Gel Blaze Running Shoe')
    await card.getByRole('link', { name: 'Add to wishlist' }).click()
    await expect(card.getByRole('link', { name: 'Remove from wishlist' })).toBeVisible()

    await page.goto('/login')
    const form = page.locator('.login_form')
    await form.getByPlaceholder('Email Address').fill('jane@example.com')
    await form.getByPlaceholder('Password').fill('password')
    await form.getByRole('button', { name: 'Log In' }).click()
    await expect(page).toHaveURL('/')

    // The heart is now filled from the account's wishlist (merged once, browser copy cleared).
    await page.goto('/shop')
    await expect(card.getByRole('link', { name: 'Remove from wishlist' })).toBeVisible()
    await expect.poll(() => page.evaluate(() => localStorage.getItem('kickzers.guest-wishlist'))).toBe('[]')

    // Clean up so the shared demo account starts every test with the same wishlist.
    await card.getByRole('link', { name: 'Remove from wishlist' }).click()
    await expect(card.getByRole('link', { name: 'Add to wishlist' })).toBeVisible()
  })
})

test.describe('My Account', () => {
  test('sends guests to the login page', async ({ page }) => {
    await page.goto('/account')
    await expect(page).toHaveURL(/\/login$/)
  })

  test('creates an account at checkout and lists the order under My Account', async ({ page }) => {
    const email = uniqueEmail('account')

    await addFromProductPage(page, 'suede-classic-low')
    await page.goto('/cart')
    // The billing country is Pakistan, where Local Delivery is not offered.
    await page.getByRole('link', { name: 'Flat Rate: $10.00' }).click()
    await page.getByRole('link', { name: 'Proceed to checkout' }).click()

    await fillBilling(page, email)
    await page.getByLabel('Create an account?').check()
    await page.getByLabel('Account password').fill('secret-password')
    await page.getByLabel(/accept the/).check()
    await placeOrderButton(page).click()

    await expect(page).toHaveURL(/\/confirmation\?order=/)
    const orderNumber = new URL(page.url()).searchParams.get('order')

    // The new account is logged in and owns the order.
    await page.goto('/account')
    await expect(page.locator('.details_item')).toContainText(email)
    const history = page.locator('.order_details_table')
    await expect(history.getByRole('row', { name: new RegExp(orderNumber) })).toContainText('$85.00')

    await history.getByRole('link', { name: `View order ${orderNumber}` }).click()
    await expect(page.getByRole('heading', { name: 'Thank you. Your order has been received.' })).toBeVisible()
  })
})
