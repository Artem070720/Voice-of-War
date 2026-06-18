'use client'

import { useEffect, useState } from 'react'
import StoryCard from '@/components/StoryCard'
import { apiFetch } from '@/lib/api'

const defaultFilters = {
    search: '',
    categoryId: '',
    region: '',
    hasImages: false,
    hasAudio: false,
    sort: 'newest',
    limit: '9',
}

export default function StoriesPage() {
    const [stories, setStories] = useState([])
    const [categories, setCategories] = useState([])
    const [pagination, setPagination] = useState(null)

    const [filters, setFilters] = useState(defaultFilters)
    const [appliedFilters, setAppliedFilters] = useState(defaultFilters)

    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [categoriesLoading, setCategoriesLoading] = useState(true)
    const [error, setError] = useState('')

    const loadCategories = async () => {
        try {
            setCategoriesLoading(true)

            const data = await apiFetch('/categories')

            setCategories(data.categories || [])
        } catch (error) {
            setError(error.message)
        } finally {
            setCategoriesLoading(false)
        }
    }

    const loadStories = async (currentPage = 1, currentFilters = appliedFilters) => {
        try {
            setLoading(true)
            setError('')

            const params = new URLSearchParams()

            params.set('page', String(currentPage))
            params.set('limit', currentFilters.limit || '9')

            if (currentFilters.search.trim()) {
                params.set('search', currentFilters.search.trim())
            }

            if (currentFilters.categoryId) {
                params.set('categoryId', currentFilters.categoryId)
            }

            if (currentFilters.region.trim()) {
                params.set('region', currentFilters.region.trim())
            }

            if (currentFilters.hasImages) {
                params.set('hasImages', 'true')
            }

            if (currentFilters.hasAudio) {
                params.set('hasAudio', 'true')
            }

            if (currentFilters.sort) {
                params.set('sort', currentFilters.sort)
            }

            const data = await apiFetch(`/stories?${params.toString()}`)

            setStories(data.stories || [])
            setPagination(data.pagination || null)
        } catch (error) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadCategories()
    }, [])

    useEffect(() => {
        loadStories(page, appliedFilters)
    }, [page, appliedFilters])

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target

        setFilters((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }))
    }

    const handleSubmit = (event) => {
        event.preventDefault()

        setPage(1)
        setAppliedFilters(filters)
    }

    const handleReset = () => {
        setFilters(defaultFilters)
        setAppliedFilters(defaultFilters)
        setPage(1)
    }

    const getSortLabel = (sort) => {
        const labels = {
            newest: 'Найновіші публікації',
            oldest: 'Найстаріші публікації',
            popular: 'Найпопулярніші',
            eventDateDesc: 'Дата події: новіші спочатку',
            eventDateAsc: 'Дата події: старіші спочатку',
        }

        return labels[sort] || 'Найновіші публікації'
    }

    const hasActiveFilters =
        appliedFilters.search ||
        appliedFilters.categoryId ||
        appliedFilters.region ||
        appliedFilters.hasImages ||
        appliedFilters.hasAudio ||
        appliedFilters.sort !== 'newest' ||
        appliedFilters.limit !== '9'

    return (
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="rounded-[2rem] bg-slate-950 px-6 py-12 text-white sm:px-10">
                <p className="text-sm font-bold uppercase tracking-wide text-blue-200">
                    Публічний архів
                </p>

                <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl">
                    Історії, що зберігають пам’ять
                </h1>

                <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
                    Тут відображаються опубліковані історії користувачів.
                    Кожен матеріал може містити текст, фотографії та аудіозапис.
                </p>
            </div>

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
                        placeholder="Пошук за назвою, текстом, містом..."
                        className="min-h-12 rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-blue-900"
                    />

                    <select
                        name="categoryId"
                        value={filters.categoryId}
                        onChange={handleChange}
                        className="min-h-12 rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-blue-900"
                        disabled={categoriesLoading}
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

                    <select
                        name="sort"
                        value={filters.sort}
                        onChange={handleChange}
                        className="min-h-12 rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-blue-900"
                    >
                        <option value="newest">Найновіші публікації</option>
                        <option value="oldest">Найстаріші публікації</option>
                        <option value="popular">Найпопулярніші</option>
                        <option value="eventDateDesc">Дата події: новіші спочатку</option>
                        <option value="eventDateAsc">Дата події: старіші спочатку</option>
                    </select>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr_220px]">
                    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <input
                            type="checkbox"
                            name="hasImages"
                            checked={filters.hasImages}
                            onChange={handleChange}
                            className="h-4 w-4 rounded border-slate-300"
                        />

                        <span className="text-sm font-semibold text-slate-700">
              Тільки історії з фото
            </span>
                    </label>

                    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <input
                            type="checkbox"
                            name="hasAudio"
                            checked={filters.hasAudio}
                            onChange={handleChange}
                            className="h-4 w-4 rounded border-slate-300"
                        />

                        <span className="text-sm font-semibold text-slate-700">
              Тільки історії з аудіо
            </span>
                    </label>

                    <select
                        name="limit"
                        value={filters.limit}
                        onChange={handleChange}
                        className="min-h-12 rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-blue-900"
                    >
                        <option value="6">6 на сторінці</option>
                        <option value="9">9 на сторінці</option>
                        <option value="12">12 на сторінці</option>
                        <option value="18">18 на сторінці</option>
                    </select>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm text-slate-500">
                        {pagination ? (
                            <span>
                Знайдено історій: <strong className="text-slate-900">{pagination.total}</strong>
              </span>
                        ) : (
                            <span>Пошук історій</span>
                        )}
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
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
                            Застосувати фільтри
                        </button>
                    </div>
                </div>
            </form>

            {hasActiveFilters && (
                <div className="mt-6 rounded-3xl border border-blue-100 bg-blue-50 p-5 text-sm text-blue-950">
                    <p className="font-bold">
                        Активні параметри архіву:
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                        {appliedFilters.search && (
                            <span className="rounded-full bg-white px-3 py-1 font-semibold">
                Пошук: {appliedFilters.search}
              </span>
                        )}

                        {appliedFilters.region && (
                            <span className="rounded-full bg-white px-3 py-1 font-semibold">
                Регіон: {appliedFilters.region}
              </span>
                        )}

                        {appliedFilters.categoryId && (
                            <span className="rounded-full bg-white px-3 py-1 font-semibold">
                Категорія: {
                                categories.find((category) => category.id === appliedFilters.categoryId)?.name || 'Обрана категорія'
                            }
              </span>
                        )}

                        {appliedFilters.hasImages && (
                            <span className="rounded-full bg-white px-3 py-1 font-semibold">
                Є фото
              </span>
                        )}

                        {appliedFilters.hasAudio && (
                            <span className="rounded-full bg-white px-3 py-1 font-semibold">
                Є аудіо
              </span>
                        )}

                        <span className="rounded-full bg-white px-3 py-1 font-semibold">
              Сортування: {getSortLabel(appliedFilters.sort)}
            </span>
                    </div>
                </div>
            )}

            {loading && (
                <div className="mt-12 rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500">
                    Завантаження історій...
                </div>
            )}

            {!loading && error && (
                <div className="mt-12 rounded-3xl border border-red-200 bg-red-50 p-10 text-center text-red-700">
                    {error}
                </div>
            )}

            {!loading && !error && stories.length === 0 && (
                <div className="mt-12 rounded-3xl border border-slate-200 bg-white p-10 text-center">
                    <h2 className="text-2xl font-bold text-slate-900">
                        Історій не знайдено
                    </h2>

                    <p className="mt-3 text-slate-600">
                        Спробуйте змінити параметри пошуку або фільтрації.
                    </p>
                </div>
            )}

            {!loading && !error && stories.length > 0 && (
                <>
                    <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {stories.map((story) => (
                            <StoryCard key={story.id} story={story} />
                        ))}
                    </div>

                    {pagination && pagination.pages > 1 && (
                        <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row">
                            <button
                                type="button"
                                disabled={page <= 1}
                                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                className="w-full rounded-2xl bg-slate-100 px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                            >
                                ← Попередня
                            </button>

                            <div className="text-center text-sm text-slate-600">
                                <p className="font-semibold text-slate-900">
                                    Сторінка {pagination.page} з {pagination.pages}
                                </p>

                                <p className="mt-1">
                                    Показано {stories.length} з {pagination.total} історій
                                </p>
                            </div>

                            <button
                                type="button"
                                disabled={page >= pagination.pages}
                                onClick={() => setPage((prev) => Math.min(prev + 1, pagination.pages))}
                                className="w-full rounded-2xl bg-blue-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                            >
                                Наступна →
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}