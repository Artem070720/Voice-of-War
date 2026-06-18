'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import AdminNavigation from '@/components/AdminNavigation'

const reasonLabels = {
    INAPPROPRIATE_CONTENT: 'Неприйнятний контент',
    FALSE_INFORMATION: 'Недостовірна інформація',
    OFFENSIVE_CONTENT: 'Образливий зміст',
    COPYRIGHT: 'Порушення авторських прав',
    SPAM: 'Спам або реклама',
    OTHER: 'Інше',
}

const statusLabels = {
    NEW: 'Нова',
    REVIEWED: 'Розглянута',
    REJECTED: 'Відхилена',
}

export default function AdminReportsPage() {
    const router = useRouter()
    const { loading, isAuthenticated, isAdmin, getAuthHeaders } = useAuth()

    const [reports, setReports] = useState([])
    const [pagination, setPagination] = useState(null)

    const [filters, setFilters] = useState({
        search: '',
        status: '',
        reason: '',
    })

    const [page, setPage] = useState(1)
    const [pageLoading, setPageLoading] = useState(true)
    const [error, setError] = useState('')
    const [actionLoadingId, setActionLoadingId] = useState(null)

    useEffect(() => {
        if (!loading && (!isAuthenticated || !isAdmin)) {
            router.push('/login')
        }
    }, [loading, isAuthenticated, isAdmin, router])

    const loadReports = async (currentPage = 1, currentFilters = filters) => {
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

            if (currentFilters.reason) {
                params.set('reason', currentFilters.reason)
            }

            const data = await apiFetch(`/admin/reports?${params.toString()}`, {
                headers: getAuthHeaders(),
            })

            setReports(data.reports || [])
            setPagination(data.pagination || null)
        } catch (error) {
            setError(error.message)
        } finally {
            setPageLoading(false)
        }
    }

    useEffect(() => {
        if (!loading && isAuthenticated && isAdmin) {
            loadReports(1)
        }
    }, [loading, isAuthenticated, isAdmin])

    useEffect(() => {
        if (!loading && isAuthenticated && isAdmin) {
            loadReports(page)
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
        loadReports(1, filters)
    }

    const handleReset = () => {
        const emptyFilters = {
            search: '',
            status: '',
            reason: '',
        }

        setFilters(emptyFilters)
        setPage(1)
        loadReports(1, emptyFilters)
    }

    const updateReportInList = (updatedReport) => {
        setReports((prev) =>
            prev.map((report) =>
                report.id === updatedReport.id
                    ? {
                        ...report,
                        status: updatedReport.status,
                    }
                    : report
            )
        )
    }

    const handleReview = async (reportId) => {
        try {
            setActionLoadingId(reportId)
            setError('')

            const data = await apiFetch(`/admin/reports/${reportId}/review`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
            })

            updateReportInList(data.report)
        } catch (error) {
            setError(error.message)
        } finally {
            setActionLoadingId(null)
        }
    }

    const handleReject = async (reportId) => {
        try {
            setActionLoadingId(reportId)
            setError('')

            const data = await apiFetch(`/admin/reports/${reportId}/reject`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
            })

            updateReportInList(data.report)
        } catch (error) {
            setError(error.message)
        } finally {
            setActionLoadingId(null)
        }
    }

    const handleHideStory = async (storyId, reportId) => {
        const confirmed = window.confirm('Приховати історію з публічного архіву?')

        if (!confirmed) return

        try {
            setActionLoadingId(reportId)
            setError('')

            await apiFetch(`/admin/stories/${storyId}/hide`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    comment: 'Історію приховано після скарги користувача',
                }),
            })

            const data = await apiFetch(`/admin/reports/${reportId}/review`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
            })

            updateReportInList(data.report)
        } catch (error) {
            setError(error.message)
        } finally {
            setActionLoadingId(null)
        }
    }

    const handleDeleteStory = async (storyId, reportId) => {
        const confirmed = window.confirm('Видалити історію назавжди? Цю дію неможливо скасувати.')

        if (!confirmed) return

        try {
            setActionLoadingId(reportId)
            setError('')

            await apiFetch(`/admin/stories/${storyId}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            })

            setReports((prev) => prev.filter((report) => report.id !== reportId))
        } catch (error) {
            setError(error.message)
        } finally {
            setActionLoadingId(null)
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

    const getStatusClass = (status) => {
        const classes = {
            NEW: 'bg-amber-50 text-amber-700',
            REVIEWED: 'bg-emerald-50 text-emerald-700',
            REJECTED: 'bg-slate-100 text-slate-700',
        }

        return classes[status] || 'bg-slate-100 text-slate-700'
    }

    if (loading || pageLoading) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500">
                    Завантаження скарг...
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
                    Скарги на історії
                </h1>

                <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
                    Переглядайте скарги користувачів на опубліковані історії та приймайте рішення щодо контенту.
                </p>
            </div>

            <AdminNavigation />

            <form
                onSubmit={handleSubmit}
                className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
            >
                <div className="grid gap-4 md:grid-cols-3">
                    <input
                        type="text"
                        name="search"
                        value={filters.search}
                        onChange={handleChange}
                        placeholder="Пошук за історією або користувачем..."
                        className="min-h-12 rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-blue-900"
                    />

                    <select
                        name="status"
                        value={filters.status}
                        onChange={handleChange}
                        className="min-h-12 rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-blue-900"
                    >
                        <option value="">Усі статуси</option>
                        <option value="NEW">Нові</option>
                        <option value="REVIEWED">Розглянуті</option>
                        <option value="REJECTED">Відхилені</option>
                    </select>

                    <select
                        name="reason"
                        value={filters.reason}
                        onChange={handleChange}
                        className="min-h-12 rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-blue-900"
                    >
                        <option value="">Усі причини</option>
                        {Object.entries(reasonLabels).map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
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

            <div className="mt-8 grid gap-5">
                {reports.length === 0 ? (
                    <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                        <h2 className="text-2xl font-bold text-slate-900">
                            Скарг не знайдено
                        </h2>

                        <p className="mt-3 text-slate-500">
                            Наразі немає скарг за вибраними параметрами.
                        </p>
                    </div>
                ) : (
                    reports.map((report) => {
                        const isLoading = actionLoadingId === report.id

                        return (
                            <article
                                key={report.id}
                                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                            >
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                    <div>
                                        <div className="flex flex-wrap gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(report.status)}`}>
                        {statusLabels[report.status] || report.status}
                      </span>

                                            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                        {reasonLabels[report.reason] || report.reason}
                      </span>
                                        </div>

                                        <h2 className="mt-4 text-2xl font-bold text-slate-900">
                                            {report.story?.title || 'Історію видалено'}
                                        </h2>

                                        {report.comment && (
                                            <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                                                <p className="font-bold text-slate-900">
                                                    Коментар скарги:
                                                </p>
                                                <p className="mt-1">
                                                    {report.comment}
                                                </p>
                                            </div>
                                        )}

                                        <div className="mt-5 grid gap-3 text-sm text-slate-500 md:grid-cols-3">
                                            <div>
                                                <p className="font-semibold text-slate-700">Поскаржився</p>
                                                <p className="mt-1">{report.reporter?.name}</p>
                                                <p className="mt-1 break-all text-xs">{report.reporter?.email}</p>
                                            </div>

                                            <div>
                                                <p className="font-semibold text-slate-700">Автор історії</p>
                                                <p className="mt-1">{report.story?.author?.name || 'Невідомо'}</p>
                                                <p className="mt-1 break-all text-xs">{report.story?.author?.email || 'Невідомо'}</p>
                                            </div>

                                            <div>
                                                <p className="font-semibold text-slate-700">Дата скарги</p>
                                                <p className="mt-1">{formatDate(report.createdAt)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 lg:min-w-[190px]">
                                        {report.story?.status === 'APPROVED' && (
                                            <Link
                                                href={`/stories/${report.story.id}`}
                                                className="rounded-xl bg-blue-900 px-4 py-2 text-center text-xs font-bold text-white transition hover:bg-blue-800"
                                            >
                                                Переглянути історію
                                            </Link>
                                        )}

                                        <button
                                            type="button"
                                            disabled={isLoading}
                                            onClick={() => handleReview(report.id)}
                                            className="rounded-xl bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {isLoading ? '...' : 'Позначити розглянутою'}
                                        </button>

                                        <button
                                            type="button"
                                            disabled={isLoading}
                                            onClick={() => handleReject(report.id)}
                                            className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {isLoading ? '...' : 'Відхилити скаргу'}
                                        </button>

                                        {report.story && (
                                            <>
                                                <button
                                                    type="button"
                                                    disabled={isLoading}
                                                    onClick={() => handleHideStory(report.story.id, report.id)}
                                                    className="rounded-xl bg-amber-50 px-4 py-2 text-xs font-bold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    {isLoading ? '...' : 'Приховати історію'}
                                                </button>

                                                <button
                                                    type="button"
                                                    disabled={isLoading}
                                                    onClick={() => handleDeleteStory(report.story.id, report.id)}
                                                    className="rounded-xl bg-red-50 px-4 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    {isLoading ? '...' : 'Видалити історію'}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </article>
                        )
                    })
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