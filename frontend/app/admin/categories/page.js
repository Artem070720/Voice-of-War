'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import AdminNavigation from '@/components/AdminNavigation'

export default function AdminCategoriesPage() {
    const router = useRouter()
    const { loading, isAuthenticated, isAdmin, getAuthHeaders } = useAuth()

    const [categories, setCategories] = useState([])
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    })

    const [editingId, setEditingId] = useState(null)
    const [pageLoading, setPageLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [deletingId, setDeletingId] = useState(null)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    useEffect(() => {
        if (!loading && (!isAuthenticated || !isAdmin)) {
            router.push('/login')
        }
    }, [loading, isAuthenticated, isAdmin, router])

    const loadCategories = async () => {
        try {
            setPageLoading(true)
            setError('')

            const data = await apiFetch('/categories')

            setCategories(data.categories || [])
        } catch (error) {
            setError(error.message)
        } finally {
            setPageLoading(false)
        }
    }

    useEffect(() => {
        if (!loading && isAuthenticated && isAdmin) {
            loadCategories()
        }
    }, [loading, isAuthenticated, isAdmin])

    const handleChange = (event) => {
        const { name, value } = event.target

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
        })
        setEditingId(null)
        setError('')
        setSuccess('')
    }

    const handleEdit = (category) => {
        setEditingId(category.id)

        setFormData({
            name: category.name || '',
            description: category.description || '',
        })

        setError('')
        setSuccess('')
    }

    const handleSubmit = async (event) => {
        event.preventDefault()

        try {
            setSubmitting(true)
            setError('')
            setSuccess('')

            if (!formData.name.trim()) {
                setError('Введіть назву категорії')
                return
            }

            if (editingId) {
                const data = await apiFetch(`/categories/${editingId}`, {
                    method: 'PATCH',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        name: formData.name.trim(),
                        description: formData.description.trim(),
                    }),
                })

                setCategories((prev) =>
                    prev.map((category) =>
                        category.id === editingId
                            ? {
                                ...category,
                                ...data.category,
                            }
                            : category
                    )
                )

                setSuccess('Категорію успішно оновлено')
            } else {
                const data = await apiFetch('/categories', {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        name: formData.name.trim(),
                        description: formData.description.trim(),
                    }),
                })

                setCategories((prev) => [
                    ...prev,
                    {
                        ...data.category,
                        _count: {
                            stories: 0,
                        },
                    },
                ])

                setSuccess('Категорію успішно створено')
            }

            resetForm()
        } catch (error) {
            setError(error.message)
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (category) => {
        const storiesCount = category._count?.stories || 0

        if (storiesCount > 0) {
            setError('Неможливо видалити категорію, оскільки до неї прив’язані історії')
            return
        }

        const confirmed = window.confirm(`Ви точно хочете видалити категорію "${category.name}"?`)

        if (!confirmed) return

        try {
            setDeletingId(category.id)
            setError('')
            setSuccess('')

            await apiFetch(`/categories/${category.id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            })

            setCategories((prev) => prev.filter((item) => item.id !== category.id))
            setSuccess('Категорію успішно видалено')

            if (editingId === category.id) {
                resetForm()
            }
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

    if (loading || pageLoading) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500">
                    Завантаження категорій...
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
                    Керування категоріями
                </h1>

                <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
                    Створюйте, редагуйте та видаляйте категорії, які використовуються для систематизації історій.
                </p>
            </div>

            <AdminNavigation />

            <div className="mt-8 grid gap-8 lg:grid-cols-[420px_1fr]">
                <form
                    onSubmit={handleSubmit}
                    className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                    <h2 className="text-2xl font-bold text-slate-900">
                        {editingId ? 'Редагування категорії' : 'Нова категорія'}
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        Категорії допомагають користувачам швидко знаходити історії за темами.
                    </p>

                    {error && (
                        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                            {success}
                        </div>
                    )}

                    <div className="mt-6">
                        <label className="text-sm font-semibold text-slate-700">
                            Назва категорії *
                        </label>

                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Наприклад: Евакуація"
                            className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-blue-900"
                            required
                        />
                    </div>

                    <div className="mt-5">
                        <label className="text-sm font-semibold text-slate-700">
                            Опис категорії
                        </label>

                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Короткий опис категорії..."
                            rows={5}
                            className="mt-2 w-full resize-y rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-900"
                        />
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="rounded-2xl bg-blue-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {submitting
                                ? 'Збереження...'
                                : editingId
                                    ? 'Зберегти зміни'
                                    : 'Створити категорію'}
                        </button>

                        {editingId && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="rounded-2xl bg-slate-100 px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
                            >
                                Скасувати
                            </button>
                        )}
                    </div>
                </form>

                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    {categories.length === 0 ? (
                        <div className="p-10 text-center">
                            <h2 className="text-2xl font-bold text-slate-900">
                                Категорій поки немає
                            </h2>

                            <p className="mt-3 text-slate-500">
                                Створіть першу категорію за допомогою форми.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[760px] text-left text-sm">
                                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="px-4 py-4">Назва</th>
                                    <th className="px-4 py-4">Опис</th>
                                    <th className="px-4 py-4">Історій</th>
                                    <th className="px-4 py-4">Дата</th>
                                    <th className="px-4 py-4 text-right">Дії</th>
                                </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                {categories.map((category) => {
                                    const storiesCount = category._count?.stories || 0
                                    const isDeleting = deletingId === category.id
                                    const isEditing = editingId === category.id

                                    return (
                                        <tr
                                            key={category.id}
                                            className={isEditing ? 'bg-blue-50/50' : 'bg-white'}
                                        >
                                            <td className="px-4 py-4">
                                                <p className="font-bold text-slate-900">
                                                    {category.name}
                                                </p>
                                            </td>

                                            <td className="max-w-[360px] px-4 py-4">
                                                <p className="line-clamp-2 text-slate-600">
                                                    {category.description || 'Опис не додано'}
                                                </p>
                                            </td>

                                            <td className="px-4 py-4">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                            {storiesCount}
                          </span>
                                            </td>

                                            <td className="px-4 py-4 text-slate-600">
                                                {formatDate(category.createdAt)}
                                            </td>

                                            <td className="px-4 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEdit(category)}
                                                        className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-200"
                                                    >
                                                        Редагувати
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(category)}
                                                        disabled={isDeleting || storiesCount > 0}
                                                        title={
                                                            storiesCount > 0
                                                                ? 'Не можна видалити категорію, до якої прив’язані історії'
                                                                : 'Видалити категорію'
                                                        }
                                                        className="rounded-xl bg-red-50 px-4 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        {isDeleting ? '...' : 'Видалити'}
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
            </div>
        </div>
    )
}