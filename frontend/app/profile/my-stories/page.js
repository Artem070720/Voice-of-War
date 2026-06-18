'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { apiFetch, getFileUrl } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

export default function MyStoriesPage() {
    const router = useRouter()
    const { loading, isAuthenticated, getAuthHeaders } = useAuth()

    const [stories, setStories] = useState([])
    const [pageLoading, setPageLoading] = useState(true)
    const [error, setError] = useState('')
    const [deletingId, setDeletingId] = useState(null)

    const loadStories = async () => {
        try {
            setPageLoading(true)
            setError('')

            const data = await apiFetch('/stories/my/list', {
                headers: getAuthHeaders(),
            })

            setStories(data.stories || [])
        } catch (error) {
            setError(error.message)
        } finally {
            setPageLoading(false)
        }
    }

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/login')
        }
    }, [loading, isAuthenticated, router])

    useEffect(() => {
        if (!loading && isAuthenticated) {
            loadStories()
        }
    }, [loading, isAuthenticated])

    const formatDate = (date) => {
        if (!date) return 'Не вказано'

        return new Date(date).toLocaleDateString('uk-UA', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        })
    }

    const getStatusLabel = (status) => {
        const labels = {
            PENDING: 'Очікує модерації',
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

    const handleDelete = async (storyId) => {
        const confirmed = window.confirm('Ви точно хочете видалити цю історію? Цю дію неможливо скасувати.')

        if (!confirmed) return

        try {
            setDeletingId(storyId)
            setError('')

            await apiFetch(`/stories/${storyId}`, {
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

    if (loading || pageLoading) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500">
                    Завантаження ваших історій...
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
                    Мої історії
                </h1>

                <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
                    Тут зібрані всі історії, які ви додали до цифрового архіву “Голос війни”.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Link
                        href="/add-story"
                        className="rounded-2xl bg-white px-6 py-3 text-center text-sm font-bold text-slate-950 transition hover:bg-slate-100"
                    >
                        Додати нову історію
                    </Link>

                    <Link
                        href="/profile"
                        className="rounded-2xl border border-white/25 px-6 py-3 text-center text-sm font-bold text-white transition hover:bg-white/10"
                    >
                        Назад до профілю
                    </Link>
                </div>
            </div>

            {error && (
                <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
                    {error}
                </div>
            )}

            {stories.length === 0 ? (
                <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                    <h2 className="text-2xl font-bold text-slate-900">
                        Ви ще не додали жодної історії
                    </h2>

                    <p className="mt-3 text-slate-600">
                        Натисніть кнопку нижче, щоб поділитися першим спогадом.
                    </p>

                    <Link
                        href="/add-story"
                        className="mt-6 inline-flex rounded-2xl bg-blue-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-800"
                    >
                        Додати історію
                    </Link>
                </div>
            ) : (
                <div className="mt-8 grid gap-6">
                    {stories.map((story) => {
                        const previewImage = story.images?.[0]?.imageUrl
                        const imageUrl = getFileUrl(previewImage)

                        return (
                            <article
                                key={story.id}
                                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                            >
                                <div className="grid gap-0 lg:grid-cols-[280px_1fr]">
                                    <div className="h-64 bg-slate-100 lg:h-full">
                                        {imageUrl ? (
                                            <img
                                                src={imageUrl}
                                                alt={story.title}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-950 to-slate-800 px-6 text-center text-sm font-semibold text-white">
                                                Голос війни
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-6">
                                        <div className="flex flex-wrap gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(story.status)}`}>
                        {getStatusLabel(story.status)}
                      </span>

                                            {story.category?.name && (
                                                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-900">
                          {story.category.name}
                        </span>
                                            )}

                                            {story.images?.length > 0 && (
                                                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                          Фото: {story.images.length}
                        </span>
                                            )}

                                            {story.audio && (
                                                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                          Є аудіо
                        </span>
                                            )}
                                        </div>

                                        <h2 className="mt-4 text-2xl font-bold text-slate-900">
                                            {story.title}
                                        </h2>

                                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                                            {story.content}
                                        </p>

                                        <div className="mt-5 grid gap-3 text-sm text-slate-500 sm:grid-cols-3">
                                            <div>
                                                <p className="font-semibold text-slate-700">Регіон</p>
                                                <p className="mt-1">{story.region}</p>
                                            </div>

                                            <div>
                                                <p className="font-semibold text-slate-700">Місто</p>
                                                <p className="mt-1">{story.city || 'Не вказано'}</p>
                                            </div>

                                            <div>
                                                <p className="font-semibold text-slate-700">Дата створення</p>
                                                <p className="mt-1">{formatDate(story.createdAt)}</p>
                                            </div>
                                        </div>

                                        {story.rejectionReason && (
                                            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                                                <p className="font-semibold">Причина відхилення:</p>
                                                <p className="mt-1">{story.rejectionReason}</p>
                                            </div>
                                        )}

                                        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                            {story.status === 'APPROVED' && (
                                                <Link
                                                    href={`/stories/${story.id}`}
                                                    className="rounded-2xl bg-blue-900 px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-blue-800"
                                                >
                                                    Переглянути
                                                </Link>
                                            )}

                                            <Link
                                                href={`/profile/my-stories/${story.id}/edit`}
                                                className="rounded-2xl bg-slate-100 px-5 py-3 text-center text-sm font-bold text-slate-700 transition hover:bg-slate-200"
                                            >
                                                Редагувати
                                            </Link>

                                            <button
                                                type="button"
                                                onClick={() => handleDelete(story.id)}
                                                disabled={deletingId === story.id}
                                                className="rounded-2xl bg-red-50 px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
                                            >
                                                {deletingId === story.id ? 'Видалення...' : 'Видалити'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        )
                    })}
                </div>
            )}
        </div>
    )
}