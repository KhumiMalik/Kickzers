import { expect, test } from '@playwright/test'
import { toasts } from './support/helpers'

test.describe('Login', () => {
  test('rejects bad credentials, then logs in and can log out', async ({ page }) => {
    await page.goto('/login')
    const form = page.locator('.login_form')

    await form.getByRole('button', { name: 'Log In' }).click()
    await expect(form.getByText('Password is required.')).toBeVisible()

    await form.getByPlaceholder('Username').fill('jane')
    await form.getByPlaceholder('Password').fill('123')
    await form.getByRole('button', { name: 'Log In' }).click()
    await expect(form.getByText('These credentials do not match our records.')).toBeVisible()

    await form.getByPlaceholder('Password').fill('password')
    await form.getByRole('button', { name: 'Log In' }).click()
    await expect(page).toHaveURL('/')
    await expect(toasts(page)).toContainText('Welcome back')

    // The Pages menu (opened on hover, like a mouse user) now offers Logout instead of Login.
    const pagesMenu = page.locator('.menu_nav .submenu').filter({ hasText: 'Pages' })
    await pagesMenu.hover()
    await pagesMenu.getByRole('link', { name: /^Logout/ }).click()
    await pagesMenu.hover()
    await expect(pagesMenu.getByRole('link', { name: 'Login', exact: true })).toBeVisible()
  })
})
