import { expect, test } from '@playwright/test'
import { uniqueEmail } from './support/helpers'

test.describe('Contact', () => {
  test('validates and shows the success popup', async ({ page }) => {
    await page.goto('/contact')
    const form = page.locator('.contact_form')

    await form.getByRole('button', { name: 'Send Message' }).click()
    await expect(form.getByText('Name is required.')).toBeVisible()

    await form.getByPlaceholder('Enter your name').fill('Jane')
    await form.getByPlaceholder('Enter email address').fill(uniqueEmail('contact'))
    await form.getByPlaceholder('Enter Subject').fill('Order question')
    await form.getByPlaceholder('Enter Message').fill('Hello there!')
    await form.getByRole('button', { name: 'Send Message' }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Thank you' })).toBeVisible()
    await dialog.getByRole('button', { name: 'Close' }).click()
    await expect(dialog).toBeHidden()
    await expect(form.getByPlaceholder('Enter your name')).toHaveValue('')
  })
})

test.describe('Newsletter', () => {
  test('subscribes from the footer', async ({ page }) => {
    await page.goto('/')
    const footer = page.locator('footer')
    await footer.getByPlaceholder('Enter Email').fill(uniqueEmail('news'))
    await footer.getByRole('button', { name: 'Subscribe' }).click()
    await expect(footer.locator('.info')).toHaveText('Thank you for subscribing!')
  })
})

test.describe('Blog', () => {
  test('filters posts by category from the sidebar', async ({ page }) => {
    await page.goto('/blog')
    await expect(page.locator('.blog_item')).toHaveCount(5)

    await page.locator('.post_category_widget').getByRole('link', { name: /Technology/ }).click()
    await expect(page).toHaveURL(/category=technology/)
    await expect(page.locator('.search-summary')).toContainText('Technology')
    await expect(page.locator('.blog_item')).toHaveCount(4)

    await page.locator('.search-summary').getByRole('link', { name: 'Show all posts' }).click()
    await expect(page).toHaveURL(/\/blog$/)
  })

  test('searches posts from the sidebar', async ({ page }) => {
    await page.goto('/blog')
    await page.getByPlaceholder('Search Posts').fill('hubble')
    await page.getByRole('button', { name: 'Search posts' }).click()

    await expect(page).toHaveURL(/q=hubble/)
    await expect(page.locator('.blog_item h2')).toHaveText(['The Amazing Hubble'])
  })

  test('posts a comment on an article', async ({ page }) => {
    await page.goto('/blog/the-night-sky')
    const comments = page.locator('.comments-area h4').first()
    await expect(comments).toHaveText(/\d+ Comments/)
    const before = parseInt(await comments.textContent(), 10)

    const form = page.locator('.comment-form')
    await form.getByRole('button', { name: 'Post Comment' }).click()
    await expect(form.getByText('Message is required.')).toBeVisible()

    await form.getByPlaceholder('Enter Name').fill('Jane')
    await form.getByPlaceholder('Enter email address').fill(uniqueEmail('comment'))
    await form.getByPlaceholder('Messege').fill('Great article, thanks!')
    await form.getByRole('button', { name: 'Post Comment' }).click()

    await expect(form.getByText('Thanks! Your comment has been posted.')).toBeVisible()
    await expect(comments).toHaveText(`${String(before + 1).padStart(2, '0')} Comments`)
    await expect(page.locator('.comments-area')).toContainText('Great article, thanks!')
  })
})

test.describe('Product reviews', () => {
  test('adds a review that appears in the list', async ({ page }) => {
    await page.goto('/product/zoom-flight-basketball-shoe')
    const form = page.locator('.review_box form')

    await page.getByRole('button', { name: '4 stars' }).click()
    await form.getByPlaceholder('Your Full name').fill('Jane Reviewer')
    await form.getByPlaceholder('Email Address').fill(uniqueEmail('review'))
    await form.getByPlaceholder('Review').fill('Comfortable and light.')
    await form.getByRole('button', { name: 'Submit Now' }).click()

    await expect(page.getByText('Thanks! Your review has been added.')).toBeVisible()
    await expect(page.locator('.review_list')).toContainText('Jane Reviewer')
  })
})

test.describe('Not found', () => {
  test('shows the 404 page for an unknown product and an unknown URL', async ({ page }) => {
    await page.goto('/product/does-not-exist')
    await expect(page.getByRole('heading', { name: 'Page Not Found' })).toBeVisible()

    await page.goto('/no-such-page')
    await expect(page.getByRole('heading', { name: 'Page Not Found' })).toBeVisible()
  })
})
