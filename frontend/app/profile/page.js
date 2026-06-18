'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function ProfilePage() {
    const router = useRouter()
    const { user, loading, isAuthenticated, isAdmin } = useAuth()

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/login')
        }
    }, [loading, isAuthenticated, router])

    if (loading) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500">
                    Завантаження профілю...
                </div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return null
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="rounded-[2rem] bg-slate-950 px-6 py-12 text-white sm:px-10">
                <p className="text-sm font-bold uppercase tracking-wide text-blue-200">
                    Особистий кабінет
                </p>

                <h1 className="mt-3 text-4xl font-extrabold">
                    Вітаємо, {user.name}
                </h1>

                <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
                    Тут ви зможете переглядати власні історії, їхні статуси модерації,
                    а також додавати нові спогади до цифрового архіву.
                </p>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-1">
                    <h2 className="text-xl font-bold text-slate-900">
                        Дані користувача
                    </h2>

                    <div className="mt-6 space-y-4 text-sm">
                        <div>
                            <p className="font-semibold text-slate-500">Ім’я</p>
                            <p className="mt-1 text-slate-900">{user.name}</p>
                        </div>

                        <div>
                            <p className="font-semibold text-slate-500">Email</p>
                            <p className="mt-1 text-slate-900">{user.email}</p>
                        </div>

                        <div>
                            <p className="font-semibold text-slate-500">Роль</p>
                            <p className="mt-1 text-slate-900">
                                {user.role === 'ADMIN' ? 'Адміністратор' : 'Користувач'}
                            </p>
                        </div>

                        <div>
                            <p className="font-semibold text-slate-500">Статус</p>
                            <p className="mt-1 text-slate-900">
                                {user.status === 'ACTIVE' ? 'Активний' : 'Заблокований'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
                    <h2 className="text-xl font-bold text-slate-900">
                        Швидкі дії
                    </h2>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <Link
                            href="/add-story"
                            className="rounded-3xl border border-slate-200 bg-slate-50 p-6 transition hover:border-blue-900 hover:bg-blue-50"
                        >
                            <h3 className="text-lg font-bold text-slate-900">
                                Додати історію
                            </h3>

                            <p className="mt-3 text-sm leading-6 text-slate-600">
                                Створіть новий спогад, додайте текст, фото або аудіозапис.
                            </p>
                        </Link>

                        <Link
                            href="/profile/my-stories"
                            className="rounded-3xl border border-slate-200 bg-slate-50 p-6 transition hover:border-blue-900 hover:bg-blue-50"
                        >
                            <h3 className="text-lg font-bold text-slate-900">
                                Мої історії
                            </h3>

                            <p className="mt-3 text-sm leading-6 text-slate-600">
                                Перегляньте статуси ваших історій: очікує, опубліковано або відхилено.
                            </p>
                        </Link>

                        <Link
                            href="/profile/settings"
                            className="rounded-3xl border border-slate-200 bg-slate-50 p-6 transition hover:border-blue-900 hover:bg-blue-50"
                        >
                            <h3 className="text-lg font-bold text-slate-900">
                                Налаштування профілю
                            </h3>

                            <p className="mt-3 text-sm leading-6 text-slate-600">
                                Оновіть ім’я акаунта або змініть пароль для входу.
                            </p>
                        </Link>

                        <Link
                            href="/profile/favorites"
                            className="rounded-3xl border border-slate-200 bg-slate-50 p-6 transition hover:border-blue-900 hover:bg-blue-50"
                        >
                            <h3 className="text-lg font-bold text-slate-900">
                                Обрані історії
                            </h3>

                            <p className="mt-3 text-sm leading-6 text-slate-600">
                                Перегляньте історії, які ви зберегли для швидкого доступу.
                            </p>
                        </Link>

                        {isAdmin && (
                            <Link
                                href="/admin"
                                className="rounded-3xl border border-blue-200 bg-blue-50 p-6 transition hover:border-blue-900"
                            >
                                <h3 className="text-lg font-bold text-blue-950">
                                    Адмін-панель
                                </h3>

                                <p className="mt-3 text-sm leading-6 text-blue-900">
                                    Перейдіть до керування історіями, користувачами, категоріями та статистикою.
                                </p>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}