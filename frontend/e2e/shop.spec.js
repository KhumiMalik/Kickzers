import { expect, test } from '@playwright/test'
import { cardPrices, chooseNiceSelect } from './support/helpers'

test.describe('Shop listing', () => {
  test('filters by brand through the sidebar and keeps it in the URL', async ({ page }) => {
    await page.goto('/shop')
    await page.locator('label', { hasText: /^Puma/ }).click()
    await expect(page.getByRole('radio', { name: /^Puma/ })).toBeChecked()

    await expect(page).toHaveURL(/brand=puma/)
    const titles = page.locator('.single-product .product-title')
    await expect(titles).toHaveText(['Suede Classic Low', 'Suede Heritage Sneaker', 'Suede Pastel Low'])

    await page.getByRole('button', { name: 'Reset' }).click()
    await expect(page).not.toHaveURL(/brand=/)
  })

  test('filters by category, including its sub-categories', async ({ page }) => {
    await page.goto('/shop')
    await page.locator('.sidebar-categories').getByRole('link', { name: /^Women's Shoes/ }).click()

    await expect(page).toHaveURL(/category=women-shoes/)
    await expect(page.locator('.single-product')).toHaveCount(3)
    await expect(page.locator('.banner-area')).toContainText("Women's Shoes")
  })

  test('filters by price range from the URL', async ({ page }) => {
    await page.goto('/shop?min=100&max=140')
    const prices = await cardPrices(page)

    expect(prices.length).toBeGreaterThan(0)
    for (const price of prices) {
      expect(price).toBeGreaterThanOrEqual(100)
      expect(price).toBeLessThanOrEqual(140)
    }
  })

  test('sorts by price, high to low', async ({ page }) => {
    await page.goto('/shop')
    await chooseNiceSelect(page, 'Default sorting', 'Price: high to low')

    await expect(page).toHaveURL(/sort=price-desc/)
    // Poll: the grid re-renders once the sorted page arrives.
    await expect
      .poll(async () => {
        const prices = await cardPrices(page)
        return prices.length > 1 && prices.every((p, i) => i === 0 || prices[i - 1] >= p)
      })
      .toBe(true)
  })

  test('paginates with a smaller page size', async ({ page }) => {
    await page.goto('/shop')
    await chooseNiceSelect(page, 'Show 12', 'Show 6')

    await expect(page).toHaveURL(/perPage=6/)
    await expect(page.locator('.single-product')).toHaveCount(6)

    await page.locator('.filter-bar').first().getByRole('link', { name: '2', exact: true }).click()
    await expect(page).toHaveURL(/page=2/)
    await expect(page.locator('.single-product')).toHaveCount(6)
  })

  test('searches from the header search box', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Search' }).click()
    await page.getByPlaceholder('Search Here').fill('jersey')
    await page.getByPlaceholder('Search Here').press('Enter')

    await expect(page).toHaveURL(/\/shop\?q=jersey/)
    await expect(page.locator('.single-product .product-title')).toHaveText(['Away Football Jersey', 'Red Training Jersey'])
    await expect(page.locator('.search-summary')).toContainText('jersey')
  })
})
