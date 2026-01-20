'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, FileText, FileCog, Settings, LogOut } from 'lucide-react';

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const menuItems = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, exact: true },
        { name: 'Documentos', href: '/dashboard/documents', icon: FileText },
        { name: 'Plantillas', href: '/dashboard/templates', icon: FileCog },
        { name: 'Ajustes', href: '/dashboard/settings', icon: Settings },
    ];

    const handleLogout = () => {
        // Clear local storage
        localStorage.removeItem('accessToken');
        // Clear cookie
        document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        // Redirect
        router.push('/auth/login');
    };

    return (
        <aside className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 z-30">
            <div className="p-6">
                <Link href="/dashboard" className="cursor-pointer">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-lg font-bold">L</span>
                        </div>
                        <span className="text-brand-600">Latios</span>
                    </h1>
                </Link>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1">
                {menuItems.map((item) => {
                    const isActive = item.exact
                        ? pathname === item.href
                        : pathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                ? 'bg-brand-50 text-brand-600 font-medium'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <item.icon size={20} className={isActive ? 'text-brand-600' : 'text-gray-400'} />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 rounded-lg cursor-pointer transition-colors group text-left"
                >
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-medium group-hover:bg-white group-hover:shadow-sm">
                        U
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 group-hover:text-red-700">Usuario</p>
                        <p className="text-xs text-gray-500 group-hover:text-red-500">Cerrar Sesión</p>
                    </div>
                    <LogOut size={16} className="text-gray-400 group-hover:text-red-500 transition-colors" />
                </button>
            </div>
        </aside>
    );
}
