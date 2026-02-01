import { render, screen, fireEvent, renderHook } from '@testing-library/react';
import { useNavigationGuard, NavigationGuardContext } from '../useNavigationGuard';
import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import '@testing-library/jest-dom';

// Wrapper component to provide context
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
    const [isDirty, setIsDirty] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
    const [showExitModal, setShowExitModal] = useState(false);

    return (
        <NavigationGuardContext.Provider value={{
            isDirty,
            setIsDirty,
            pendingNavigation,
            setPendingNavigation,
            showExitModal,
            setShowExitModal,
        }}>
            {children}
        </NavigationGuardContext.Provider>
    );
};

describe('useNavigationGuard', () => {
    it('provides default context values', () => {
        // Tests that the hook consumes the context correctly
        const { result } = renderHook(() => useNavigationGuard(), { wrapper: TestWrapper });

        expect(result.current.isDirty).toBe(false);
        expect(result.current.showExitModal).toBe(false);
    });

    it('allows updating dirty state', () => {
        // We need to access the setter from the component inside the provider
        // Use a test component
        const TestComponent = () => {
            const { isDirty, setIsDirty } = useNavigationGuard();
            return (
                <button onClick={() => setIsDirty(true)} data-testid="set-dirty">
                    {isDirty ? 'Dirty' : 'Clean'}
                </button>
            );
        };

        render(
            <TestWrapper>
                <TestComponent />
            </TestWrapper>
        );

        expect(screen.getByTestId('set-dirty')).toHaveTextContent('Clean');
        fireEvent.click(screen.getByTestId('set-dirty'));
        expect(screen.getByTestId('set-dirty')).toHaveTextContent('Dirty');
    });
});
