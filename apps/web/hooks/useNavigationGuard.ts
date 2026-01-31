'use client';

import { createContext, useContext } from 'react';

// Context for navigation guard
interface NavigationGuardContextType {
    isDirty: boolean;
    setIsDirty: (dirty: boolean) => void;
    pendingNavigation: string | null;
    setPendingNavigation: (href: string | null) => void;
    showExitModal: boolean;
    setShowExitModal: (show: boolean) => void;
}

export const NavigationGuardContext = createContext<NavigationGuardContextType>({
    isDirty: false,
    setIsDirty: () => { },
    pendingNavigation: null,
    setPendingNavigation: () => { },
    showExitModal: false,
    setShowExitModal: () => { },
});

export const useNavigationGuard = () => useContext(NavigationGuardContext);
