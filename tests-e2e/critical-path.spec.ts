import { test, expect } from '@playwright/test'

// Critical-path E2E coverage per the platform spec (section 53): browsing
// the menu, adding a product to the cart, and completing checkout as a
// guest. Run with `pnpm test:e2e` against a running dev server (seeded DB).

test('guest can browse the menu, add a product, and reach checkout', async ({ page }) => {
  await page.goto('/menu')
  await expect(page.getByRole('heading', { name: /menu/i }).first()).toBeVisible()

  const firstProduct = page.locator('a[href^="/product/"]').first()
  await expect(firstProduct).toBeVisible()
  await firstProduct.click()

  await expect(page).toHaveURL(/\/product\//)
  await page.getByRole('button', { name: /ajouter au panier/i }).click()
  // addItem() is async (server action round-trip + client cart refresh) —
  // wait for the Navbar's cart badge to reflect the new item count before
  // navigating away, rather than racing the request.
  await expect(page.locator('button[aria-label="Panier"] span')).toHaveText('1', { timeout: 10000 })

  await page.goto('/cart')
  await expect(page.getByRole('heading', { name: /panier/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /passer au checkout/i })).toBeVisible()

  await page.getByRole('link', { name: /passer au checkout/i }).click()
  await expect(page).toHaveURL(/\/checkout/)
  await expect(page.getByText(/type de commande/i).first()).toBeVisible()
})

test('reservation form is reachable and submits', async ({ page }) => {
  await page.goto('/reservation')
  await expect(page.getByRole('heading', { name: /réserv/i }).first()).toBeVisible()
})

test('homepage renders the hero and signature grills', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /grill experience/i })).toBeVisible()
  await expect(page.getByText(/signature/i).first()).toBeVisible()
})
