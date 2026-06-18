'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
    {
        href: '/admin',
        label: 'Статистика',
    },
    {
        href: '/admin/stories',
        label: 'Історії',
    },
    {
        href: '/admin/reports',
        label: 'Скарги',
    },
    {
        href: '/admin/users',
        label: 'Користувачі',
    },
    {
        href: '/admin/categories',
        label: 'Категорії',
    },
]

export default function AdminNavigation() {
    const pathname = usePathname()

    return (
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
            <nav className="flex flex-col gap-2 sm:flex-row">
                {links.map((link) => {
                    const isActive = pathname === link.href

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`rounded-2xl px-5 py-3 text-center text-sm font-bold transition ${
                                isActive
                                    ? 'bg-blue-900 text-white'
                                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                            }`}
                        >
                            {link.label}
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}