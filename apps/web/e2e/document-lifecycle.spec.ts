import { test, expect } from '@playwright/test';

test.describe('Document Lifecycle', () => {

    // Mock Data
    const mockTemplates = [
        {
            id: 'template-1',
            name: 'Contrato de Prueba',
            thumbnail: '',
            structure: { blocks: [] },
            signatureType: 'DIGITAL'
        }
    ];

    test.beforeEach(async ({ page }) => {
        // Mock Login State (Set localStorage or Cookie if possible, or just Login UI)
        // For this test, we'll go through Login UI quickly or reuse logic
        await page.goto('/auth/login');
        await page.getByLabel('Email').fill('admin@latios.com');
        await page.getByLabel('Contraseña').fill('admin123');
        await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
        await expect(page).toHaveURL(/\/dashboard/);
    });

    test('should allow creating and sending a document via Wizard', async ({ page }) => {
        // Mock Auth Me
        await page.route('**/api/auth/me', async route => {
            await route.fulfill({ json: { id: 'user-1', role: 'ADMIN', name: 'Admin' } });
        });

        // Mock Processes (Teams)
        await page.route('**/processes', async route => {
            await route.fulfill({ json: [{ id: 'team-1', name: 'Equipo Prueba', description: 'Test Team' }] });
        });

        // Mock Templates API
        await page.route('**/api/templates', async route => {
            await route.fulfill({ json: mockTemplates });
        });

        // Mock Document Creation API
        await page.route('**/api/documents', async route => {
            await route.fulfill({ json: { publicUrl: '/sign/mock-token' } });
        });

        // Navigate to Create Wizard
        await page.goto('/dashboard/documents/create');

        // Step 1: Team Selector
        // Wait for team to appear and click it
        await expect(page.getByText('Equipo Prueba')).toBeVisible();
        await page.getByText('Equipo Prueba').click();

        // Step 2: Template Selector
        // Should show our mock template
        await expect(page.getByText('Contrato de Prueba')).toBeVisible();
        await page.getByText('Contrato de Prueba').click();

        // Step 3: Configuration
        // Click "Continuar" or "Siguiente"
        await page.getByRole('button', { name: 'Configurar Datos' }).click();

        // Step 4: Compose
        await expect(page.getByText('Datos y Destinatario')).toBeVisible();

        // Fill Form
        await page.getByPlaceholder('email@ejemplo.com').fill('signer@example.com');
        await page.getByPlaceholder('Nombre').fill('Juan Perez');

        // Send
        await page.getByRole('button', { name: 'Enviar Documento' }).click();

        // Expect Success Screen
        await expect(page.getByText('¡Documento Enviado!')).toBeVisible();
        await expect(page.getByText('Volver a Documentos')).toBeVisible();
    });
});
