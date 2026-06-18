'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import AdminNavigation from '@/components/AdminNavigation'

export default function AdminUsersPage() {
    const router = useRouter()
    const { user, loading, isAuthenticated, isAdmin, getAuthHeaders } = useAuth()

    const [users, setUsers] = useState([])
    const [pagination, setPagination] = useState(null)

    const [filters, setFilters] = useState({
        search: '',
        status: '',
        role: '',
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

    const loadUsers = async (currentPage = 1, currentFilters = filters) => {
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

            if (currentFilters.role) {
                params.set('role', currentFilters.role)
            }

            const data = await apiFetch(`/admin/users?${params.toString()}`, {
                headers: getAuthHeaders(),
            })

            setUsers(data.users || [])
            setPagination(data.pagination || null)
        } catch (error) {
            setError(error.message)
        } finally {
            setPageLoading(false)
        }
    }

    useEffect(() => {
        if (!loading && isAuthenticated && isAdmin) {
            loadUsers(1)
        }
    }, [loading, isAuthenticated, isAdmin])

    useEffect(() => {
        if (!loading && isAuthenticated && isAdmin) {
            loadUsers(page)
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
        loadUsers(1, filters)
    }

    const handleReset = () => {
        const emptyFilters = {
            search: '',
            status: '',
            role: '',
        }

        setFilters(emptyFilters)
        setPage(1)
        loadUsers(1, emptyFilters)
    }

    const updateUserInList = (updatedUser) => {
        setUsers((prev) =>
            prev.map((item) =>
                item.id === updatedUser.id
                    ? {
                        ...item,
                        ...updatedUser,
                    }
                    : item
            )
        )
    }

    const handleBlock = async (userId) => {
        const confirmed = window.confirm('Ви точно хочете заблокувати цього користувача?')

        if (!confirmed) return

        try {
            setActionLoadingId(userId)
            setError('')

            const data = await apiFetch(`/admin/users/${userId}/block`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
            })

            updateUserInList(data.user)
        } catch (error) {
            setError(error.message)
        } finally {
            setActionLoadingId(null)
        }
    }

    const handleUnblock = async (userId) => {
        try {
            setActionLoadingId(userId)
            setError('')

            const data = await apiFetch(`/admin/users/${userId}/unblock`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
            })

            updateUserInList(data.user)
        } catch (error) {
            setError(error.message)
        } finally {
            setActionLoadingId(null)
        }
    }

    const handleRoleChange = async (userId, role) => {
        const confirmed = window.confirm(`Змінити роль користувача на ${role}?`)

        if (!confirmed) return

        try {
            setActionLoadingId(userId)
            setError('')

            const data = await apiFetch(`/admin/users/${userId}/role`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    role,
                }),
            })

            updateUserInList(data.user)
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

    const getRoleLabel = (role) => {
        const labels = {
            USER: 'Користувач',
            ADMIN: 'Адміністратор',
        }

        return labels[role] || role
    }

    const getStatusLabel = (status) => {
        const labels = {
            ACTIVE: 'Активний',
            BLOCKED: 'Заблокований',
        }

        return labels[status] || status
    }

    const getRoleClass = (role) => {
        if (role === 'ADMIN') {
            return 'bg-blue-50 text-blue-900'
        }

        return 'bg-slate-100 text-slate-700'
    }

    const getStatusClass = (status) => {
        if (status === 'BLOCKED') {
            return 'bg-red-50 text-red-700'
        }

        return 'bg-emerald-50 text-emerald-700'
    }

    if (loading || pageLoading) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500">
                    Завантаження користувачів...
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
                    Керування користувачами
                </h1>

                <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
                    Переглядайте користувачів платформи, змінюйте ролі та блокуйте акаунти за потреби.
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
                        placeholder="Пошук за іменем або email..."
                        className="min-h-12 rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-blue-900"
                    />

                    <select
                        name="role"
                        value={filters.role}
                        onChange={handleChange}
                        className="min-h-12 rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-blue-900"
                    >
                        <option value="">Усі ролі</option>
                        <option value="USER">Користувач</option>
                        <option value="ADMIN">Адміністратор</option>
                    </select>

                    <select
                        name="status"
                        value={filters.status}
                        onChange={handleChange}
                        className="min-h-12 rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-blue-900"
                    >
                        <option value="">Усі статуси</option>
                        <option value="ACTIVE">Активний</option>
                        <option value="BLOCKED">Заблокований</option>
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

            <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                {users.length === 0 ? (
                    <div className="p-10 text-center">
                        <h2 className="text-2xl font-bold text-slate-900">
                            Користувачів не знайдено
                        </h2>

                        <p className="mt-3 text-slate-500">
                            Спробуйте змінити параметри пошуку або фільтрації.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1000px] text-left text-sm">
                            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                            <tr>
                                <th className="px-4 py-4">Користувач</th>
                                <th className="px-4 py-4">Email</th>
                                <th className="px-4 py-4">Роль</th>
                                <th className="px-4 py-4">Статус</th>
                                <th className="px-4 py-4">Історій</th>
                                <th className="px-4 py-4">Дата реєстрації</th>
                                <th className="px-4 py-4 text-right">Дії</th>
                            </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                            {users.map((item) => {
                                const isCurrentUser = item.id === user?.id
                                const isActionLoading = actionLoadingId === item.id

                                return (
                                    <tr key={item.id} className="bg-white align-middle">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-900 text-sm font-bold text-white">
                                                    {item.name?.slice(0, 1)?.toUpperCase() || 'К'}
                                                </div>

                                                <div>
                                                    <p className="font-bold text-slate-900">
                                                        {item.name}
                                                    </p>

                                                    {isCurrentUser && (
                                                        <p className="mt-1 text-xs font-semibold text-blue-900">
                                                            Це ви
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-4 py-4">
                                            <p className="max-w-[220px] break-all text-slate-600">
                                                {item.email}
                                            </p>
                                        </td>

                                        <td className="px-4 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${getRoleClass(item.role)}`}>
                          {getRoleLabel(item.role)}
                        </span>
                                        </td>

                                        <td className="px-4 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(item.status)}`}>
                          {getStatusLabel(item.status)}
                        </span>
                                        </td>

                                        <td className="px-4 py-4 text-slate-600">
                                            {item._count?.stories || 0}
                                        </td>

                                        <td className="px-4 py-4 text-slate-600">
                                            {formatDate(item.createdAt)}
                                        </td>

                                        <td className="px-4 py-4">
                                            <div className="flex justify-end gap-2">
                                                <select
                                                    value={item.role}
                                                    disabled={isCurrentUser || isActionLoading}
                                                    onChange={(event) => handleRoleChange(item.id, event.target.value)}
                                                    className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-blue-900 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <option value="USER">USER</option>
                                                    <option value="ADMIN">ADMIN</option>
                                                </select>

                                                {item.status === 'ACTIVE' ? (
                                                    <button
                                                        type="button"
                                                        disabled={isCurrentUser || isActionLoading}
                                                        onClick={() => handleBlock(item.id)}
                                                        className="rounded-xl bg-red-50 px-4 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        {isActionLoading ? '...' : 'Блок'}
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        disabled={isActionLoading}
                                                        onClick={() => handleUnblock(item.id)}
                                                        className="rounded-xl bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        {isActionLoading ? '...' : 'Розблок'}
                                                    </button>
                                                )}
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