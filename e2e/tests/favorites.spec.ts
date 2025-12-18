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
    
    // Check if button exists (only visible if user is logged in)
    const buttonCount = await favoriteButton.count()
    if (buttonCount === 0) {
      test.skip()
      return
    }
    
    await expect(favoriteButton).toBeVisible()
    
    // Get initial state
    const initialFavorited = await favoriteButton.getAttribute('data-favorited')
    const isCurrentlyFavorited = initialFavorited === 'true'
    
    // Click favorite button to toggle
    await favoriteButton.click()
    
    // Verify button state changed
    const expectedState = isCurrentlyFavorited ? 'false' : 'true'
    await expect(favoriteButton).toHaveAttribute('data-favorited', expectedState, { timeout: 5000 })
    
    // Verify success notification
    const expectedMessage = isCurrentlyFavorited 
      ? /retirée des favoris/i 
      : /ajoutée aux favoris/i
    await expect(page.getByText(expectedMessage)).toBeVisible({ timeout: 5000 })
  })

  test('should display favorites section on profile page', async ({ page }) => {
    // Navigate to profile
    await page.goto('/profil')
    
    // Check if favorites section exists
    await expect(page.getByText(/mes favoris/i)).toBeVisible()
    
    // Check if favorites list container exists (might be empty)
    const favoritesList = page.locator('[data-testid="favorites-list"]')
    const emptyState = page.getByText(/aucun favori pour le moment/i)
    
    // Either list is visible or empty state is shown
    const listVisible = await favoritesList.isVisible().catch(() => false)
    const emptyVisible = await emptyState.isVisible().catch(() => false)
    
    expect(listVisible || emptyVisible).toBe(true)
  })

  test('should remove activity from favorites', async ({ page }) => {
    // Navigate to profile
    await page.goto('/profil')
    
    // Wait for favorites list to load
    const favoritesList = page.locator('[data-testid="favorites-list"]')
    
    // Check if there are any favorites
    const favoriteItems = page.locator('[data-testid="favorite-item"]')
    const count = await favoriteItems.count()
    
    if (count > 0) {
      // Find first favorite item
      const firstFavoriteItem = favoriteItems.first()
      await expect(firstFavoriteItem).toBeVisible()
      
      // Find favorite button within the item (should be favorited)
      const favoriteButton = firstFavoriteItem.locator('[data-testid^="favorite-button-"]').first()
      await expect(favoriteButton).toHaveAttribute('data-favorited', 'true')
      
      // Click to remove from favorites
      await favoriteButton.click()
      
      // Verify button is no longer favorited
      await expect(favoriteButton).toHaveAttribute('data-favorited', 'false', { timeout: 5000 })
      
      // Verify success notification
      await expect(page.getByText(/retirée des favoris/i)).toBeVisible({ timeout: 5000 })
    }
  })

  test('should reorder favorites with drag and drop', async ({ page }) => {
    // Navigate to profile
    await page.goto('/profil')
    
    // Wait for favorites list to load
    const favoritesList = page.locator('[data-testid="favorites-list"]')
    await expect(favoritesList).toBeVisible({ timeout: 5000 })
    
    // Get favorite items
    const favoriteItems = page.locator('[data-testid="favorite-item"]')
    const count = await favoriteItems.count()
    
    // Need at least 2 items to reorder
    if (count >= 2) {
      const firstItem = favoriteItems.first()
      const secondItem = favoriteItems.nth(1)
      
      await expect(firstItem).toBeVisible()
      await expect(secondItem).toBeVisible()
      
      // Get initial text of first item
      const firstItemText = await firstItem.textContent()
      
      // Drag first item to second position
      await firstItem.dragTo(secondItem)
      
      // Wait for reorder to complete
      await page.waitForTimeout(1000)
      
      // Verify success notification
      await expect(page.getByText(/ordre.*mis à jour/i)).toBeVisible({ timeout: 5000 })
    }
  })
})
