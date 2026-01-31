'use client';

import { Sidebar } from "@/components/sidebar";
import { useState } from "react";
import { NavigationGuardContext } from "@/hooks/useNavigationGuard";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [collapsed, setCollapsed] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
    const [showExitModal, setShowExitModal] = useState(false);

    // Auto-collapse on mobile
    useState(() => {
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
            setCollapsed(true);
        }
    });

    const confirmExit = () => {
        setIsDirty(false);
        setShowExitModal(false);
        const targetUrl = pendingNavigation;
        setPendingNavigation(null);
        // Use setTimeout to ensure state update propagates before navigation
        if (targetUrl) {
            setTimeout(() => {
                window.location.href = targetUrl;
            }, 50);
        }
    };

    const cancelExit = () => {
        setShowExitModal(false);
        setPendingNavigation(null);
    };

    return (
        <NavigationGuardContext.Provider value={{
            isDirty,
            setIsDirty,
            pendingNavigation,
            setPendingNavigation,
            showExitModal,
            setShowExitModal,
        }}>
            <div className="min-h-screen bg-bg-main">
                <Sidebar
                    collapsed={collapsed}
                    setCollapsed={setCollapsed}
                    isDirty={isDirty}
                    onNavigationBlocked={(href) => {
                        setPendingNavigation(href);
                        setShowExitModal(true);
                    }}
                />
                <main className={`transition-all duration-300 ease-in-out ${collapsed ? 'ml-20' : 'ml-64'}`}>
                    {children}
                </main>

                {/* Exit Confirmation Modal */}
                {showExitModal && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
                            <div className="p-6">
                                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4 mx-auto">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 text-center mb-2">¿Salir sin guardar?</h3>
                                <p className="text-gray-500 text-center text-sm">
                                    Tienes cambios sin guardar en esta plantilla. Si sales ahora, perderás todo tu trabajo.
                                </p>
                            </div>
                            <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end">
                                <button
                                    onClick={cancelExit}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Seguir editando
                                </button>
                                <button
                                    onClick={confirmExit}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
                                >
                                    Salir sin guardar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </NavigationGuardContext.Provider>
    );
}
