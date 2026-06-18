'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import AdminNavigation from '@/components/AdminNavigation'

export default function AdminPage() {
    const router = useRouter()
    const { loading, isAuthenticated, isAdmin, getAuthHeaders } = useAuth()

    const [statistics, setStatistics] = useState(null)
    const [latestStories, setLatestStories] = useState([])
    const [error, setError] = useState('')
    const [pageLoading, setPageLoading] = useState(true)

    useEffect(() => {
        if (!loading && (!isAuthenticated || !isAdmin)) {
            router.push('/login')
        }
    }, [loading, isAuthenticated, isAdmin, router])

    useEffect(() => {
        const loadStatistics = async () => {
            try {
                if (loading || !isAuthenticated || !isAdmin) return

                setPageLoading(true)
                setError('')

                const data = await apiFetch('/admin/statistics', {
                    headers: getAuthHeaders(),
                })

                setStatistics(data.statistics)
                setLatestStories(data.latestStories || [])
            } catch (error) {
                setError(error.message)
            } finally {
                setPageLoading(false)
            }
        }

        loadStatistics()
    }, [loading, isAuthenticated, isAdmin])

    const formatDate = (date) => {
        if (!date) return 'Не вказано'

        return new Date(date).toLocaleDateString('uk-UA', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        })
    }

    if (loading || pageLoading) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500">
                    Завантаження адмін-панелі...
                </div>
            </div>
        )
    }

    if (!isAuthenticated || !isAdmin) {
        return null
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="rounded-[2rem] bg-slate-950 px-6 py-12 text-white sm:px-10">
                <p className="text-sm font-bold uppercase tracking-wide text-blue-200">
                    Адміністрування
                </p>

                <h1 className="mt-3 text-4xl font-extrabold">
                    Адмін-панель
                </h1>

                <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
                    Керуйте історіями, користувачами, категоріями та переглядайте статистику платформи.
                </p>
            </div>

            <AdminNavigation />

            {error && (
                <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
                    {error}
                </div>
            )}

            {statistics && (
                <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <p className="text-sm font-semibold text-slate-500">Користувачі</p>
                        <p className="mt-3 text-4xl font-extrabold text-slate-900">{statistics.usersCount}</p>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <p className="text-sm font-semibold text-slate-500">Усі історії</p>
                        <p className="mt-3 text-4xl font-extrabold text-slate-900">{statistics.storiesCount}</p>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <p className="text-sm font-semibold text-slate-500">Опубліковано</p>
                        <p className="mt-3 text-4xl font-extrabold text-emerald-600">{statistics.approvedStoriesCount}</p>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <p className="text-sm font-semibold text-slate-500">Категорії</p>
                        <p className="mt-3 text-4xl font-extrabold text-blue-900">{statistics.categoriesCount}</p>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <p className="text-sm font-semibold text-slate-500">Активні користувачі</p>
                        <p className="mt-3 text-4xl font-extrabold text-emerald-600">{statistics.activeUsersCount}</p>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <p className="text-sm font-semibold text-slate-500">Заблоковані</p>
                        <p className="mt-3 text-4xl font-extrabold text-red-600">{statistics.blockedUsersCount}</p>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <p className="text-sm font-semibold text-slate-500">Фото</p>
                        <p className="mt-3 text-4xl font-extrabold text-blue-900">{statistics.imagesCount}</p>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <p className="text-sm font-semibold text-slate-500">Аудіо</p>
                        <p className="mt-3 text-4xl font-extrabold text-blue-900">{statistics.audioCount}</p>
                    </div>
                </div>
            )}

            <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">
                            Останні додані історії
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            Найновіші матеріали, опубліковані користувачами платформи.
                        </p>
                    </div>

                    <Link
                        href="/admin/stories"
                        className="rounded-2xl bg-blue-900 px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-blue-800"
                    >
                        Перейти до історій
                    </Link>
                </div>

                {latestStories.length === 0 ? (
                    <div className="mt-6 rounded-2xl bg-slate-50 p-6 text-center text-slate-500">
                        Історій поки немає.
                    </div>
                ) : (
                    <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[760px] text-left text-sm">
                                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="px-4 py-3">Назва</th>
                                    <th className="px-4 py-3">Автор</th>
                                    <th className="px-4 py-3">Категорія</th>
                                    <th className="px-4 py-3">Статус</th>
                                    <th className="px-4 py-3">Дата</th>
                                </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                {latestStories.map((story) => (
                                    <tr key={story.id} className="bg-white">
                                        <td className="px-4 py-4 font-semibold text-slate-900">
                                            {story.title}
                                        </td>
                                        <td className="px-4 py-4 text-slate-600">
                                            {story.author?.name || 'Невідомо'}
                                        </td>
                                        <td className="px-4 py-4 text-slate-600">
                                            {story.category?.name || 'Без категорії'}
                                        </td>
                                        <td className="px-4 py-4">
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                          {story.status}
                        </span>
                                        </td>
                                        <td className="px-4 py-4 text-slate-600">
                                            {formatDate(story.createdAt)}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}