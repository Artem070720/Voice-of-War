'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import StoryCard from '@/components/StoryCard'

export default function FavoriteStoriesPage() {
    const router = useRouter()
    const { loading, isAuthenticated, getAuthHeaders } = useAuth()

    const [stories, setStories] = useState([])
    const [pageLoading, setPageLoading] = useState(true)
    const [error, setError] = useState('')
    const [removingId, setRemovingId] = useState(null)

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/login')
        }
    }, [loading, isAuthenticated, router])

    const loadFavorites = async () => {
        try {
            setPageLoading(true)
            setError('')

            const data = await apiFetch('/stories/favorites/list', {
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
        if (!loading && isAuthenticated) {
            loadFavorites()
        }
    }, [loading, isAuthenticated])

    const handleRemoveFavorite = async (storyId) => {
        try {
            setRemovingId(storyId)
            setError('')

            await apiFetch(`/stories/${storyId}/favorite`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            })

            setStories((prev) => prev.filter((story) => story.id !== storyId))
        } catch (error) {
            setError(error.message)
        } finally {
            setRemovingId(null)
        }
    }

    if (loading || pageLoading) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500">
                    Завантаження обраних історій...
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
                    Обрані історії
                </h1>

                <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
                    Тут зберігаються історії, які вам сподобались або які ви хочете швидко знайти пізніше.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Link
                        href="/stories"
                        className="rounded-2xl bg-white px-6 py-3 text-center text-sm font-bold text-slate-950 transition hover:bg-slate-100"
                    >
                        Перейти до архіву
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
                        Обраних історій поки немає
                    </h2>

                    <p className="mt-3 text-slate-600">
                        Відкрийте будь-яку історію та натисніть “Додати в обране”.
                    </p>

                    <Link
                        href="/stories"
                        className="mt-6 inline-flex rounded-2xl bg-blue-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-800"
                    >
                        Переглянути архів
                    </Link>
                </div>
            ) : (
                <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {stories.map((story) => (
                        <div key={story.id} className="relative">
                            <StoryCard story={story} />

                            <button
                                type="button"
                                onClick={() => handleRemoveFavorite(story.id)}
                                disabled={removingId === story.id}
                                className="absolute right-4 top-4 rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-700 shadow-sm transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {removingId === story.id ? '...' : 'Прибрати'}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}