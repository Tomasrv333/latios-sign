import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
    test('should allow user to login with valid credentials', async ({ page }) => {
        // Navigate to login page
        await page.goto('/auth/login');

        // Check for inputs
        await expect(page.getByLabel('Email')).toBeVisible();
        await expect(page.getByLabel('Contraseña')).toBeVisible();

        // Fill credentials (using the test credentials from the UI)
        await page.getByLabel('Email').fill('admin@latios.com');
        await page.getByLabel('Contraseña').fill('admin123');

        // Submit
        await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

        // Expect redirection to dashboard
        // Note: Since we are mocking or running against dev, we expect URL change
        await expect(page).toHaveURL(/\/dashboard/);

        // Expect to see dashboard content (simple check)
        // await expect(page.getByText('Bienvenido')).toBeVisible();
    });

    test('should show error with invalid credentials', async ({ page }) => {
        await page.goto('/auth/login');

        await page.getByLabel('Email').fill('wrong@example.com');
        await page.getByLabel('Contraseña').fill('wrongpass');
        await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

        // Expect error message
        // The component shows error in a div with red text
        await expect(page.getByText('Credenciales inválidas').or(page.getByText('Error al iniciar sesión'))).toBeVisible();
    });
});
