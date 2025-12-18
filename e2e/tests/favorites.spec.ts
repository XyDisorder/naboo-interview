import { test, expect } from '@playwright/test'

test.describe('Favorites Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should add activity to favorites', async ({ page }) => {
    // Navigate to activities page
    await page.goto('/')
    
    // Find first activity card
    const activityCard = page.locator('[data-testid="activity-card"]').first()
    await expect(activityCard).toBeVisible()
    
    // Find favorite button within the card
    const favoriteButton = activityCard.locator('[data-testid^="favorite-button-"]').first()
    await expect(favoriteButton).toBeVisible()
    
    // Click favorite button
    await favoriteButton.click()
    
    // Verify button is now favorited
    await expect(favoriteButton).toHaveAttribute('data-favorited', 'true', { timeout: 5000 })
    
    // Verify success notification
    await expect(page.getByText(/ajoutée aux favoris/i)).toBeVisible({ timeout: 5000 })
  })

  test('should display favorites section on profile page', async ({ page }) => {
    // Navigate to profile
    await page.goto('/profil')
    
    // Check if favorites section exists
    await expect(page.getByText(/mes favoris/i)).toBeVisible()
  })

  test('should remove activity from favorites', async ({ page }) => {
    // Navigate to profile
    await page.goto('/profil')
    
    // Wait for favorites list to load
    const favoritesList = page.locator('[data-testid="favorites-list"]')
    await expect(favoritesList).toBeVisible({ timeout: 5000 })
    
    // Find first favorite item
    const favoriteItem = page.locator('[data-testid="favorite-item"]').first()
    
    if (await favoriteItem.isVisible()) {
      // Find favorite button within the item (should be favorited)
      const favoriteButton = favoriteItem.locator('[data-testid^="favorite-button-"]').first()
      await expect(favoriteButton).toHaveAttribute('data-favorited', 'true')
      
      // Click to remove from favorites
      await favoriteButton.click()
      
      // Verify button is no longer favorited
      await expect(favoriteButton).toHaveAttribute('data-favorited', 'false', { timeout: 5000 })
      
      // Verify success notification
      await expect(page.getByText(/retirée des favoris/i)).toBeVisible({ timeout: 5000 })
    }
  })
})

