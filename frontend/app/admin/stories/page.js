'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { apiFetch, getFileUrl } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import AdminNavigation from '@/components/AdminNavigation'

export default function AdminStoriesPage() {
    const router = useRouter()
    const { loading, isAuthenticated, isAdmin, getAuthHeaders } = useAuth()

    const [stories, setStories] = useState([])
    const [categories, setCategories] = useState([])
    const [pagination, setPagination] = useState(null)

    const [filters, setFilters] = useState({
        search: '',
        status: '',
        categoryId: '',
        region: '',
    })

    const [page, setPage] = useState(1)
    const [pageLoading, setPageLoading] = useState(true)
    const [error, setError] = useState('')
    const [deletingId, setDeletingId] = useState(null)

    useEffect(() => {
        if (!loading && (!isAuthenticated || !isAdmin)) {
            router.push('/login')
        }
    }, [loading, isAuthenticated, isAdmin, router])

    const loadCategories = async () => {
        try {
            const data = await apiFetch('/categories')
            setCategories(data.categories || [])
        } catch (error) {
            setError(error.message)
        }
    }

    const loadStories = async (currentPage = 1, currentFilters = filters) => {
        try {
            if (loading || !isAuthenticated || !isAdmin) return

            setPageLoading(true)
            setError('')

            const params = new URLSearchParams()

            params.set('page', String(currentPage))
            params.set('limit', '10')

            if (currentFilters.search.trim()) {
                params.set('search', currentFilters.search.trim())
            }

            if (currentFilters.status) {
                params.set('status', currentFilters.status)
            }

            if (currentFilters.categoryId) {
                params.set('categoryId', currentFilters.categoryId)
            }

            if (currentFilters.region.trim()) {
                params.set('region', currentFilters.region.trim())
            }

            const data = await apiFetch(`/admin/stories?${params.toString()}`, {
                headers: getAuthHeaders(),
            })

            setStories(data.stories || [])
            setPagination(data.pagination || null)
        } catch (error) {
            setError(error.message)
        } finally {
            setPageLoading(false)
        }
    }

    useEffect(() => {
        if (!loading && isAuthenticated && isAdmin) {
            loadCategories()
            loadStories(1)
        }
    }, [loading, isAuthenticated, isAdmin])

    useEffect(() => {
        if (!loading && isAuthenticated && isAdmin) {
            loadStories(page)
        }
    }, [page])

    const handleChange = (event) => {
        const { name, value } = event.target

        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        setPage(1)
        loadStories(1, filters)
    }

    const handleReset = () => {
        const emptyFilters = {
            search: '',
            status: '',
            categoryId: '',
            region: '',
        }

        setFilters(emptyFilters)
        setPage(1)
        loadStories(1, emptyFilters)
    }

    const handleDelete = async (storyId) => {
        const confirmed = window.confirm('Ви точно хочете видалити цю історію? Цю дію неможливо скасувати.')

        if (!confirmed) return

        try {
            setDeletingId(storyId)
            setError('')

            await apiFetch(`/admin/stories/${storyId}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            })

            setStories((prev) => prev.filter((story) => story.id !== storyId))
        } catch (error) {
            setError(error.message)
        } finally {
            setDeletingId(null)
        }
    }

    const formatDate = (date) => {
        if (!date) return 'Не вказано'

        return new Date(date).toLocaleDateString('uk-UA', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        })
    }

    const getStatusLabel = (status) => {
        const labels = {
            PENDING: 'Очікує',
            APPROVED: 'Опубліковано',
            REJECTED: 'Відхилено',
            HIDDEN: 'Приховано',
        }

        return labels[status] || status
    }

    const getStatusClass = (status) => {
        const classes = {
            PENDING: 'bg-amber-50 text-amber-700',
            APPROVED: 'bg-emerald-50 text-emerald-700',
            REJECTED: 'bg-red-50 text-red-700',
            HIDDEN: 'bg-slate-100 text-slate-700',
        }

        return classes[status] || 'bg-slate-100 text-slate-700'
    }

    const truncateText = (text, maxLength = 45) => {
        if (!text) return ''

        if (text.length <= maxLength) {
            return text
        }

        return `${text.slice(0, maxLength)}...`
    }

    if (loading || pageLoading) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500">
                    Завантаження історій...
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
                    Керування історіями
                </h1>

                <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
                    Перегляд усіх історій платформи, пошук, фільтрація та видалення неприйнятного контенту.
                </p>
            </div>

            <AdminNavigation />

            <form
                onSubmit={handleSubmit}
                className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
            >
                <div className="grid gap-4 lg:grid-cols-4">
                    <input
                        type="text"
                        name="search"
                        value={filters.search}
                        onChange={handleChange}
                        placeholder="Пошук..."
                        className="min-h-12 rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-blue-900"
                    />

                    <select
                        name="status"
                        value={filters.status}
                        onChange={handleChange}
                        className="min-h-12 rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-blue-900"
                    >
                        <option value="">Усі статуси</option>
                        <option value="APPROVED">Опубліковано</option>
                        <option value="PENDING">Очікує</option>
                        <option value="REJECTED">Відхилено</option>
                        <option value="HIDDEN">Приховано</option>
                    </select>

                    <select
                        name="categoryId"
                        value={filters.categoryId}
                        onChange={handleChange}
                        className="min-h-12 rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-blue-900"
                    >
                        <option value="">Усі категорії</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>

                    <input
                        type="text"
                        name="region"
                        value={filters.region}
                        onChange={handleChange}
                        placeholder="Регіон"
                        className="min-h-12 rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-blue-900"
                    />
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="rounded-2xl bg-slate-100 px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
                    >
                        Скинути
                    </button>

                    <button
                        type="submit"
                        className="rounded-2xl bg-blue-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-800"
                    >
                        Застосувати
                    </button>
                </div>
            </form>

            {error && (
                <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
                    {error}
                </div>
            )}

            <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                {stories.length === 0 ? (
                    <div className="p-10 text-center">
                        <h2 className="text-2xl font-bold text-slate-900">
                            Історій не знайдено
                        </h2>

                        <p className="mt-3 text-slate-500">
                            Спробуйте змінити параметри пошуку або фільтрації.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full table-fixed text-left text-sm">
                            <colgroup>
                                <col style={{ width: '80px' }} />
                                <col style={{ width: '34%' }} />
                                <col style={{ width: '17%' }} />
                                <col style={{ width: '12%' }} />
                                <col style={{ width: '10%' }} />
                                <col style={{ width: '10%' }} />
                                <col style={{ width: '9%' }} />
                                <col style={{ width: '128px' }} />
                            </colgroup>

                            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                            <tr>
                                <th className="px-4 py-4">Фото</th>
                                <th className="px-4 py-4">Історія</th>
                                <th className="px-4 py-4">Автор</th>
                                <th className="px-4 py-4">Категорія</th>
                                <th className="px-4 py-4">Регіон</th>
                                <th className="px-4 py-4">Статус</th>
                                <th className="px-4 py-4">Дата</th>
                                <th className="px-4 py-4 text-right">Дії</th>
                            </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                            {stories.map((story) => {
                                const previewImage = story.images?.[0]?.imageUrl
                                const imageUrl = getFileUrl(previewImage)

                                return (
                                    <tr key={story.id} className="bg-white align-top">
                                        <td className="px-4 py-4">
                                            <div className="h-16 w-16 overflow-hidden rounded-2xl bg-slate-100">
                                                {imageUrl ? (
                                                    <img
                                                        src={imageUrl}
                                                        alt={story.title}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center bg-blue-950 text-xs font-bold text-white">
                                                        ГВ
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        <td className="max-w-[260px] px-4 py-4">
                                            <p
                                                title={story.title}
                                                className="block max-w-[220px] overflow-hidden text-ellipsis whitespace-nowrap font-bold text-slate-900"
                                            >
                                                {truncateText(story.title, 20)}
                                            </p>

                                            <p
                                                title={story.content}
                                                className="mt-1 block max-w-[220px] overflow-hidden text-ellipsis whitespace-nowrap text-xs leading-5 text-slate-500"
                                            >
                                                {truncateText(story.content, 15)}
                                            </p>

                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {story.images?.length > 0 && (
                                                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700">
                              Фото: {story.images.length}
                            </span>
                                                )}

                                                {story.audio && (
                                                    <span className="rounded-full bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-700">
                              Аудіо
                            </span>
                                                )}
                                            </div>
                                        </td>

                                        <td className="min-w-0 px-4 py-4">
                                            <p
                                                title={story.title}
                                                className="block max-w-full overflow-hidden text-ellipsis whitespace-nowrap font-bold text-slate-900"
                                            >
                                                {story.title}
                                            </p>

                                            <p
                                                title={story.content}
                                                className="mt-1 block max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-xs leading-5 text-slate-500"
                                            >
                                                {story.content}
                                            </p>
                                        </td>

                                        <td
                                            title={story.category?.name || 'Без категорії'}
                                            className="px-4 py-4 text-slate-600 [overflow-wrap:anywhere]"
                                        >
                                            {truncateText(story.category?.name || 'Без категорії', 22)}
                                        </td>

                                        <td
                                            title={story.region}
                                            className="px-4 py-4 text-slate-600 [overflow-wrap:anywhere]"
                                        >
                                            {truncateText(story.region, 22)}
                                        </td>

                                        <td className="px-4 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(story.status)}`}>
                          {getStatusLabel(story.status)}
                        </span>
                                        </td>

                                        <td className="px-4 py-4 text-slate-600">
                                            {formatDate(story.createdAt)}
                                        </td>

                                        <td className="px-4 py-4">
                                            <div className="flex flex-col items-end gap-2">
                                                {story.status === 'APPROVED' && (
                                                    <Link
                                                        href={`/stories/${story.id}`}
                                                        className="w-[112px] rounded-xl bg-blue-900 px-3 py-2 text-center text-xs font-bold text-white transition hover:bg-blue-800"
                                                    >
                                                        Переглянути
                                                    </Link>
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(story.id)}
                                                    disabled={deletingId === story.id}
                                                    className="w-[112px] rounded-xl bg-red-50 px-3 py-2 text-center text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
                                                >
                                                    {deletingId === story.id ? '...' : 'Видалити'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {pagination && pagination.pages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-3">
                    <button
                        type="button"
                        disabled={page <= 1}
                        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                        className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Назад
                    </button>

                    <span className="text-sm font-semibold text-slate-600">
            Сторінка {pagination.page} з {pagination.pages}
          </span>

                    <button
                        type="button"
                        disabled={page >= pagination.pages}
                        onClick={() => setPage((prev) => Math.min(prev + 1, pagination.pages))}
                        className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Далі
                    </button>
                </div>
            )}
        </div>
    )
}