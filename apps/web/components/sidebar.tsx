'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, FileText, FileCog, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SidebarProps {
    collapsed: boolean;
    setCollapsed: (value: boolean) => void;
}

export function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    // const [collapsed, setCollapsed] = useState(false); // Removed internal state
    const [user, setUser] = useState<{ name: string; email: string } | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            fetch('/api/auth/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    if (data && !data.error) setUser(data);
                })
                .catch(err => console.error("Sidebar user fetch error:", err));
        }
    }, []);

    const menuItems = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, exact: true },
        { name: 'Documentos', href: '/dashboard/documents', icon: FileText },
        { name: 'Plantillas', href: '/dashboard/templates', icon: FileCog },
        { name: 'Ajustes', href: '/dashboard/settings', icon: Settings },
    ];

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        router.push('/auth/login');
    };

    const userInitial = user?.name ? user.name[0].toUpperCase() : 'U';

    return (
        <aside
            className={`${collapsed ? 'w-20' : 'w-64'} h-screen bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 z-30 transition-all duration-300 ease-in-out`}
        >
            {/* Toggle Button */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-8 bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:bg-gray-50 text-gray-500 z-50"
            >
                {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            <div className={`p-6 ${collapsed ? 'flex justify-center px-2' : ''}`}>
                <Link href="/dashboard" className="cursor-pointer overflow-hidden whitespace-nowrap">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <div className="w-8 h-8 min-w-[32px] bg-brand-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-lg font-bold">L</span>
                        </div>
                        <span className={`text-brand-600 transition-opacity duration-200 ${collapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>
                            Latios
                        </span>
                    </h1>
                </Link>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1 overflow-x-hidden">
                {menuItems.map((item) => {
                    const isActive = item.exact
                        ? pathname === item.href
                        : pathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={collapsed ? item.name : undefined}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors whitespace-nowrap ${isActive
                                ? 'bg-brand-50 text-brand-600 font-medium'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                } ${collapsed ? 'justify-center px-2' : ''}`}
                        >
                            <item.icon size={20} className={`min-w-[20px] ${isActive ? 'text-brand-600' : 'text-gray-400'}`} />
                            <span className={`${collapsed ? 'hidden' : 'block'}`}>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-100 overflow-hidden">
                <button
                    onClick={handleLogout}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 rounded-lg cursor-pointer transition-colors group text-left whitespace-nowrap ${collapsed ? 'justify-center px-1' : ''}`}
                    title={collapsed ? "Cerrar Sesión" : undefined}
                >
                    <div className="w-10 h-10 min-w-[40px] rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-medium group-hover:bg-white group-hover:shadow-sm">
                        {userInitial}
                    </div>

                    {!collapsed && (
                        <>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-medium text-gray-900 group-hover:text-red-700 truncate">
                                    {user?.name || 'Usuario'}
                                </p>
                                <p className="text-xs text-gray-500 group-hover:text-red-500 truncate">
                                    Cerrar Sesión
                                </p>
                            </div>
                            <LogOut size={16} className="text-gray-400 group-hover:text-red-500 transition-colors min-w-[16px]" />
                        </>
                    )}
                </button>
            </div>
        </aside>
    );
}
