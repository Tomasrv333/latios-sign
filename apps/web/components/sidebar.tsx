import Link from 'next/link';

export function Sidebar() {
    const menuItems = [
        { name: 'Dashboard', href: '/dashboard', icon: '📊' },
        { name: 'Documentos', href: '/documents', icon: '📄' },
        { name: 'Plantillas', href: '/templates', icon: '📝' },
        { name: 'Ajustes', href: '/settings', icon: '⚙️' },
    ];

    return (
        <aside className="w-64 h-screen bg-bg-surface border-r border-gray-100 flex flex-col fixed left-0 top-0">
            <div className="p-6">
                <h1 className="text-2xl font-bold text-brand-500 flex items-center gap-2">
                    <span className="w-8 h-8 bg-brand-500 rounded-lg block"></span>
                    Latios
                </h1>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1">
                {menuItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-3 px-4 py-3 text-gray-600 rounded-lg hover:bg-brand-50 hover:text-brand-600 transition-colors"
                    >
                        <span>{item.icon}</span>
                        <span className="font-medium">{item.name}</span>
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-100">
                <div className="flex items-center gap-3 px-4 py-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                    <div>
                        <p className="text-sm font-medium text-gray-900">Usuario</p>
                        <p className="text-xs text-gray-500">Admin</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
