'use client';

import { Sidebar } from "@/components/sidebar";
import { useState } from "react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [collapsed, setCollapsed] = useState(false);

    // Auto-collapse on mobile
    useState(() => {
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
            setCollapsed(true);
        }
    });

    return (
        <div className="min-h-screen bg-bg-main">
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            <main className={`transition-all duration-300 ease-in-out ${collapsed ? 'ml-20' : 'ml-64'}`}>
                {children}
            </main>
        </div>
    );
}
