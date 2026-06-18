'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function Header() {
    const router = useRouter()
    const pathname = usePathname()

    const {
        user,
        isAuthenticated,
        isAdmin,
        loading,
        logout,
    } = useAuth()

    const [isMenuOpen, setIsMenuOpen] = useState(false)

    useEffect(() => {
        setIsMenuOpen(false)
    }, [pathname])

    const handleLogout = () => {
        logout()
        setIsMenuOpen(false)
        router.push('/')
    }

    const isActive = (href) => {
        if (href === '/') {
            return pathname === '/'
        }

        return pathname.startsWith(href)
    }

    const navLinkClass = (href) => {
        return `text-sm font-semibold transition ${
            isActive(href)
                ? 'text-blue-900'
                : 'text-slate-600 hover:text-blue-900'
        }`
    }

    const mobileNavLinkClass = (href) => {
        return `rounded-2xl px-4 py-3 text-sm font-bold transition ${
            isActive(href)
                ? 'bg-blue-900 text-white'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
        }`
    }

    return (
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-20 items-center justify-between gap-4">
                    <Link href="/" className="flex shrink-0 items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-900 text-lg font-bold text-white">
                            ГВ
                        </div>

                        <div>
                            <p className="text-lg font-bold text-slate-900">
                                Голос війни
                            </p>
                            <p className="text-xs text-slate-500">
                                Цифровий архів спогадів
                            </p>
                        </div>
                    </Link>

                    <nav className="desktop-header-nav flex-1 items-center justify-center gap-6">
                        <Link href="/" className={navLinkClass('/')}>
                            Головна
                        </Link>

                        <Link href="/stories" className={navLinkClass('/stories')}>
                            Архів
                        </Link>

                        <Link href="/about" className={navLinkClass('/about')}>
                            Про платформу
                        </Link>

                        {isAuthenticated && (
                            <Link href="/profile/my-stories" className={navLinkClass('/profile/my-stories')}>
                                Мої історії
                            </Link>
                        )}

                        {isAuthenticated && (
                            <Link href="/profile/favorites" className={navLinkClass('/profile/favorites')}>
                                Обране
                            </Link>
                        )}

                        {isAdmin && (
                            <Link href="/admin" className={navLinkClass('/admin')}>
                                Адмін-панель
                            </Link>
                        )}
                    </nav>

                    <div className="desktop-header-actions shrink-0 items-center gap-2">
                        {loading ? (
                            <div className="h-10 w-28 rounded-xl bg-slate-100" />
                        ) : isAuthenticated ? (
                            <>
                                <Link
                                    href="/profile"
                                    className="max-w-[130px] truncate rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                                    title={user?.name}
                                >
                                    {user?.name}
                                </Link>

                                <Link
                                    href="/add-story"
                                    className="rounded-xl bg-blue-900 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
                                >
                                    Поділитися
                                </Link>

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                                >
                                    Вийти
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                                >
                                    Увійти
                                </Link>

                                <Link
                                    href="/register"
                                    className="rounded-xl bg-blue-900 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
                                >
                                    Реєстрація
                                </Link>
                            </>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsMenuOpen((prev) => !prev)}
                        className="mobile-header-button h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-2xl font-bold text-slate-800 transition hover:bg-slate-200"
                        aria-label="Відкрити меню"
                    >
                        {isMenuOpen ? '×' : '☰'}
                    </button>
                </div>

                {isMenuOpen && (
                    <div className="mobile-header-panel border-t border-slate-200 py-4">
                        <nav className="grid gap-2">
                            <Link href="/" className={mobileNavLinkClass('/')}>
                                Головна
                            </Link>

                            <Link href="/stories" className={mobileNavLinkClass('/stories')}>
                                Архів історій
                            </Link>

                            <Link href="/about" className={mobileNavLinkClass('/about')}>
                                Про платформу
                            </Link>

                            <Link href="/profile/favorites" className={mobileNavLinkClass('/profile/favorites')}>
                                Обрані історії
                            </Link>

                            {loading ? (
                                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-400">
                                    Завантаження...
                                </div>
                            ) : isAuthenticated ? (
                                <>
                                    <div className="my-2 border-t border-slate-200" />

                                    <Link href="/profile" className={mobileNavLinkClass('/profile')}>
                                        Профіль: {user?.name}
                                    </Link>

                                    <Link href="/profile/my-stories" className={mobileNavLinkClass('/profile/my-stories')}>
                                        Мої історії
                                    </Link>

                                    <Link href="/profile/settings" className={mobileNavLinkClass('/profile/settings')}>
                                        Налаштування профілю
                                    </Link>

                                    <Link href="/add-story" className={mobileNavLinkClass('/add-story')}>
                                        Поділитися історією
                                    </Link>

                                    {isAdmin && (
                                        <Link href="/admin" className={mobileNavLinkClass('/admin')}>
                                            Адмін-панель
                                        </Link>
                                    )}

                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="rounded-2xl bg-red-50 px-4 py-3 text-left text-sm font-bold text-red-700 transition hover:bg-red-100"
                                    >
                                        Вийти
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="my-2 border-t border-slate-200" />

                                    <Link href="/login" className={mobileNavLinkClass('/login')}>
                                        Увійти
                                    </Link>

                                    <Link
                                        href="/register"
                                        className="rounded-2xl bg-blue-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-800"
                                    >
                                        Реєстрація
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    )
}