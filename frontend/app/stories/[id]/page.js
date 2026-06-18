'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { apiFetch, getFileUrl } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import StoryPhotoGallery from '@/components/StoryPhotoGallery'
import RelatedStories from '@/components/RelatedStories'

const reportReasons = [
    {
        value: 'INAPPROPRIATE_CONTENT',
        label: 'Неприйнятний контент',
    },
    {
        value: 'FALSE_INFORMATION',
        label: 'Недостовірна інформація',
    },
    {
        value: 'OFFENSIVE_CONTENT',
        label: 'Образливий зміст',
    },
    {
        value: 'COPYRIGHT',
        label: 'Порушення авторських прав',
    },
    {
        value: 'SPAM',
        label: 'Спам або реклама',
    },
    {
        value: 'OTHER',
        label: 'Інше',
    },
]

export default function StoryDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const viewTrackedRef = useRef(false)

    const { user, isAuthenticated, isAdmin, getAuthHeaders } = useAuth()

    const [story, setStory] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [shareMessage, setShareMessage] = useState('')

    const [isReportOpen, setIsReportOpen] = useState(false)
    const [reportForm, setReportForm] = useState({
        reason: 'INAPPROPRIATE_CONTENT',
        comment: '',
    })
    const [reportMessage, setReportMessage] = useState('')
    const [reportError, setReportError] = useState('')
    const [reportSubmitting, setReportSubmitting] = useState(false)

    const [comments, setComments] = useState([])
    const [commentsLoading, setCommentsLoading] = useState(true)
    const [commentText, setCommentText] = useState('')
    const [commentError, setCommentError] = useState('')
    const [commentSuccess, setCommentSuccess] = useState('')
    const [commentSubmitting, setCommentSubmitting] = useState(false)
    const [deletingCommentId, setDeletingCommentId] = useState(null)

    const [isFavorite, setIsFavorite] = useState(false)
    const [favoriteMessage, setFavoriteMessage] = useState('')
    const [favoriteLoading, setFavoriteLoading] = useState(false)

    const [relatedStories, setRelatedStories] = useState([])

    useEffect(() => {
        const trackView = async (storyId) => {
            if (viewTrackedRef.current) return

            try {
                viewTrackedRef.current = true

                const data = await apiFetch(`/stories/${storyId}/view`, {
                    method: 'POST',
                })

                if (typeof data.viewsCount === 'number') {
                    setStory((prev) =>
                        prev
                            ? {
                                ...prev,
                                viewsCount: data.viewsCount,
                            }
                            : prev
                    )
                }
            } catch (error) {
                viewTrackedRef.current = false
            }
        }

        const loadStory = async () => {
            try {
                setLoading(true)
                setError('')

                const data = await apiFetch(`/stories/${params.id}`)

                setStory(data.story)

                await Promise.all([
                    trackView(params.id),
                    loadComments(params.id),
                    loadFavoriteStatus(params.id),
                    loadRelatedStories(params.id),
                ])
            } catch (error) {
                setError(error.message)
            } finally {
                setLoading(false)
            }
        }

        if (params.id) {
            viewTrackedRef.current = false
            loadStory()
        }
    }, [params.id])

    const formatDate = (date) => {
        if (!date) return 'Дата не вказана'

        return new Date(date).toLocaleDateString('uk-UA', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        })
    }

    const copyToClipboardFallback = (text) => {
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.setAttribute('readonly', '')
        textarea.style.position = 'absolute'
        textarea.style.left = '-9999px'

        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
    }

    const handleShare = async () => {
        try {
            const storyUrl = window.location.href

            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(storyUrl)
            } else {
                copyToClipboardFallback(storyUrl)
            }

            setShareMessage('Посилання скопійовано')

            setTimeout(() => {
                setShareMessage('')
            }, 2500)
        } catch (error) {
            setShareMessage('Не вдалося скопіювати посилання')

            setTimeout(() => {
                setShareMessage('')
            }, 2500)
        }
    }

    const handleReportChange = (event) => {
        const { name, value } = event.target

        setReportForm((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleReportSubmit = async (event) => {
        event.preventDefault()

        try {
            setReportSubmitting(true)
            setReportError('')
            setReportMessage('')

            if (!isAuthenticated) {
                setReportError('Щоб поскаржитися на історію, потрібно увійти в акаунт')
                return
            }

            const data = await apiFetch(`/stories/${params.id}/report`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(reportForm),
            })

            setReportMessage(data.message || 'Скаргу успішно надіслано')

            setReportForm({
                reason: 'INAPPROPRIATE_CONTENT',
                comment: '',
            })

            setTimeout(() => {
                setIsReportOpen(false)
                setReportMessage('')
            }, 1800)
        } catch (error) {
            setReportError(error.message)
        } finally {
            setReportSubmitting(false)
        }
    }

    const loadComments = async (storyId) => {
        try {
            setCommentsLoading(true)
            setCommentError('')

            const data = await apiFetch(`/stories/${storyId}/comments`)

            setComments(data.comments || [])
        } catch (error) {
            setCommentError(error.message)
        } finally {
            setCommentsLoading(false)
        }
    }

    const loadRelatedStories = async (storyId) => {
        try {
            const data = await apiFetch(`/stories/${storyId}/related`)

            setRelatedStories(data.stories || [])
        } catch (error) {
            setRelatedStories([])
        }
    }

    const handleCommentSubmit = async (event) => {
        event.preventDefault()

        try {
            setCommentSubmitting(true)
            setCommentError('')
            setCommentSuccess('')

            if (!isAuthenticated) {
                setCommentError('Щоб залишити коментар, потрібно увійти в акаунт')
                return
            }

            if (!commentText.trim()) {
                setCommentError('Введіть текст коментаря')
                return
            }

            const data = await apiFetch(`/stories/${params.id}/comments`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    content: commentText.trim(),
                }),
            })

            setComments((prev) => [data.comment, ...prev])
            setCommentText('')
            setCommentSuccess('Коментар додано')

            setTimeout(() => {
                setCommentSuccess('')
            }, 2000)
        } catch (error) {
            setCommentError(error.message)
        } finally {
            setCommentSubmitting(false)
        }
    }

    const handleDeleteComment = async (commentId) => {
        const confirmed = window.confirm('Видалити цей коментар?')

        if (!confirmed) return

        try {
            setDeletingCommentId(commentId)
            setCommentError('')

            await apiFetch(`/stories/${params.id}/comments/${commentId}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            })

            setComments((prev) => prev.filter((comment) => comment.id !== commentId))
        } catch (error) {
            setCommentError(error.message)
        } finally {
            setDeletingCommentId(null)
        }
    }

    const canDeleteComment = (comment) => {
        if (!user) return false

        const isCommentAuthor = comment.authorId === user.id
        const isStoryOwner = story?.author?.id === user.id

        return isCommentAuthor || isStoryOwner || isAdmin
    }

    const loadFavoriteStatus = async (storyId) => {
        try {
            if (!isAuthenticated) return

            const data = await apiFetch(`/stories/${storyId}/favorite`, {
                headers: getAuthHeaders(),
            })

            setIsFavorite(Boolean(data.isFavorite))
        } catch (error) {
            setIsFavorite(false)
        }
    }

    const handleToggleFavorite = async () => {
        try {
            setFavoriteLoading(true)
            setFavoriteMessage('')

            if (!isAuthenticated) {
                setFavoriteMessage('Щоб додати історію в обране, потрібно увійти в акаунт')
                return
            }

            if (isFavorite) {
                const data = await apiFetch(`/stories/${params.id}/favorite`, {
                    method: 'DELETE',
                    headers: getAuthHeaders(),
                })

                setIsFavorite(false)
                setFavoriteMessage(data.message || 'Історію видалено з обраного')
            } else {
                const data = await apiFetch(`/stories/${params.id}/favorite`, {
                    method: 'POST',
                    headers: getAuthHeaders(),
                })

                setIsFavorite(true)
                setFavoriteMessage(data.message || 'Історію додано до обраного')
            }

            setTimeout(() => {
                setFavoriteMessage('')
            }, 2500)
        } catch (error) {
            setFavoriteMessage(error.message)
        } finally {
            setFavoriteLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500">
                    Завантаження історії...
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="rounded-3xl border border-red-200 bg-red-50 p-10 text-center">
                    <h1 className="text-2xl font-bold text-red-700">
                        Історію не знайдено
                    </h1>

                    <p className="mt-3 text-red-600">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() => router.push('/stories')}
                        className="mt-6 rounded-2xl bg-red-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-red-800"
                    >
                        Повернутися до архіву
                    </button>
                </div>
            </div>
        )
    }

    if (!story) {
        return null
    }

    return (
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Link
                    href="/stories"
                    className="inline-flex rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
                >
                    ← До архіву
                </Link>

                <div className="flex flex-col gap-2 sm:items-end">
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <button
                            type="button"
                            onClick={handleShare}
                            className="rounded-2xl bg-blue-900 px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800"
                        >
                            Поділитися
                        </button>

                        <button
                            type="button"
                            onClick={handleToggleFavorite}
                            disabled={favoriteLoading}
                            className={`rounded-2xl px-5 py-2 text-sm font-bold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                isFavorite
                                    ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                        >
                            {favoriteLoading
                                ? 'Збереження...'
                                : isFavorite
                                    ? 'В обраному'
                                    : 'Додати в обране'}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setIsReportOpen((prev) => !prev)
                                setReportError('')
                                setReportMessage('')
                            }}
                            className="rounded-2xl bg-red-50 px-5 py-2 text-sm font-bold text-red-700 shadow-sm transition hover:bg-red-100"
                        >
                            Поскаржитися
                        </button>
                    </div>

                    {shareMessage && (
                        <p className="text-sm font-semibold text-blue-900">
                            {shareMessage}
                        </p>
                    )}
                    {favoriteMessage && (
                        <p className="text-sm font-semibold text-amber-700">
                            {favoriteMessage}
                        </p>
                    )}
                </div>
            </div>

            {isReportOpen && (
                <div className="mt-4 rounded-3xl border border-red-100 bg-white p-5 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900">
                        Скарга на історію
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        Якщо ви вважаєте, що історія містить неприйнятний або недостовірний матеріал,
                        надішліть скаргу адміністратору.
                    </p>

                    {!isAuthenticated && (
                        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                            Щоб поскаржитися, потрібно увійти в акаунт.
                        </div>
                    )}

                    {reportError && (
                        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {reportError}
                        </div>
                    )}

                    {reportMessage && (
                        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                            {reportMessage}
                        </div>
                    )}

                    <form onSubmit={handleReportSubmit} className="mt-5 grid gap-4">
                        <div>
                            <label className="text-sm font-semibold text-slate-700">
                                Причина скарги
                            </label>

                            <select
                                name="reason"
                                value={reportForm.reason}
                                onChange={handleReportChange}
                                className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-red-500"
                            >
                                {reportReasons.map((reason) => (
                                    <option key={reason.value} value={reason.value}>
                                        {reason.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-slate-700">
                                Коментар
                            </label>

                            <textarea
                                name="comment"
                                value={reportForm.comment}
                                onChange={handleReportChange}
                                rows={4}
                                placeholder="Опишіть деталі скарги..."
                                className="mt-2 w-full resize-y rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-red-500"
                            />
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsReportOpen(false)
                                    setReportError('')
                                    setReportMessage('')
                                }}
                                className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
                            >
                                Скасувати
                            </button>

                            <button
                                type="submit"
                                disabled={reportSubmitting || !isAuthenticated}
                                className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {reportSubmitting ? 'Надсилання...' : 'Надіслати скаргу'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <article className="mt-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                <div className="bg-slate-950 px-6 py-12 text-white sm:px-10">
                    <div className="flex flex-wrap gap-2">
                        {story.category?.name && (
                            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-950">
                {story.category.name}
              </span>
                        )}

                        {story.audio && (
                            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                Є аудіозапис
              </span>
                        )}

                        {story.images?.length > 0 && (
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                Фото: {story.images.length}
              </span>
                        )}
                    </div>

                    <h1 className="mt-6 max-w-4xl text-4xl font-extrabold leading-tight sm:text-5xl">
                        {story.title}
                    </h1>

                    <div className="mt-8 grid gap-4 text-sm text-slate-300 sm:grid-cols-2 lg:grid-cols-5">
                        <div className="rounded-2xl bg-white/10 p-4">
                            <p className="font-semibold text-white">Автор</p>
                            <p className="mt-1">{story.author?.name || 'Анонімно'}</p>
                        </div>

                        <div className="rounded-2xl bg-white/10 p-4">
                            <p className="font-semibold text-white">Регіон</p>
                            <p className="mt-1">{story.region}</p>
                        </div>

                        <div className="rounded-2xl bg-white/10 p-4">
                            <p className="font-semibold text-white">Населений пункт</p>
                            <p className="mt-1">{story.city || 'Не вказано'}</p>
                        </div>

                        <div className="rounded-2xl bg-white/10 p-4">
                            <p className="font-semibold text-white">Дата події</p>
                            <p className="mt-1">{formatDate(story.eventDate)}</p>
                        </div>

                        <div className="rounded-2xl bg-white/10 p-4">
                            <p className="font-semibold text-white">Переглядів</p>
                            <p className="mt-1">{story.viewsCount || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 sm:p-10">
                    {story.images?.length > 0 && (
                        <StoryPhotoGallery
                            images={story.images}
                            title={story.title}
                        />
                    )}

                    {story.audio && (
                        <section className="mt-10 rounded-3xl border border-slate-200 bg-slate-50 p-6">
                            <h2 className="text-2xl font-bold text-slate-900">
                                Аудіоспогад
                            </h2>

                            <audio
                                controls
                                src={getFileUrl(story.audio.audioUrl)}
                                className="mt-5 w-full"
                            >
                                Ваш браузер не підтримує аудіоплеєр.
                            </audio>
                        </section>
                    )}

                    <section className="mt-10">
                        <h2 className="text-2xl font-bold text-slate-900">
                            Текст історії
                        </h2>

                        <div className="mt-5 whitespace-pre-line text-lg leading-9 text-slate-700">
                            {story.content}
                        </div>
                    </section>

                    <div className="mt-10 flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-slate-500">
                            Опубліковано: {formatDate(story.publishedAt || story.createdAt)}
                        </p>

                    </div>
                </div>
                <section className="mt-10 border-t border-slate-200 pt-8">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">
                                Коментарі
                            </h2>

                            <p className="mt-2 text-sm text-slate-500">
                                Обговорення історії користувачами платформи.
                            </p>
                        </div>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
      Усього: {comments.length}
    </span>
                    </div>

                    {commentError && (
                        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {commentError}
                        </div>
                    )}

                    {commentSuccess && (
                        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                            {commentSuccess}
                        </div>
                    )}

                    {isAuthenticated ? (
                        <form onSubmit={handleCommentSubmit} className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                            <label className="text-sm font-semibold text-slate-700">
                                Ваш коментар
                            </label>

                            <textarea
                                value={commentText}
                                onChange={(event) => setCommentText(event.target.value)}
                                rows={4}
                                maxLength={1000}
                                placeholder="Напишіть коментар до історії..."
                                className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-900"
                            />

                            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-xs text-slate-500">
                                    {commentText.trim().length}/1000 символів
                                </p>

                                <button
                                    type="submit"
                                    disabled={commentSubmitting}
                                    className="rounded-2xl bg-blue-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {commentSubmitting ? 'Надсилання...' : 'Додати коментар'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
                            Щоб залишити коментар, потрібно увійти в акаунт.
                        </div>
                    )}

                    {commentsLoading ? (
                        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 text-center text-slate-500">
                            Завантаження коментарів...
                        </div>
                    ) : comments.length === 0 ? (
                        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 text-center">
                            <h3 className="text-lg font-bold text-slate-900">
                                Коментарів поки немає
                            </h3>

                            <p className="mt-2 text-sm text-slate-500">
                                Станьте першим, хто прокоментує цю історію.
                            </p>
                        </div>
                    ) : (
                        <div className="mt-6 grid gap-4">
                            {comments.map((comment) => (
                                <article
                                    key={comment.id}
                                    className="rounded-3xl border border-slate-200 bg-white p-5"
                                >
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-900 text-sm font-bold text-white">
                                                    {comment.author?.name?.slice(0, 1)?.toUpperCase() || 'К'}
                                                </div>

                                                <div>
                                                    <p className="font-bold text-slate-900">
                                                        {comment.author?.name || 'Користувач'}
                                                    </p>

                                                    <p className="text-xs text-slate-500">
                                                        {formatDate(comment.createdAt)}
                                                    </p>
                                                </div>
                                            </div>

                                            <p className="mt-4 whitespace-pre-line leading-7 text-slate-700">
                                                {comment.content}
                                            </p>
                                        </div>

                                        {canDeleteComment(comment) && (
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteComment(comment.id)}
                                                disabled={deletingCommentId === comment.id}
                                                className="rounded-xl bg-red-50 px-4 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {deletingCommentId === comment.id ? 'Видалення...' : 'Видалити'}
                                            </button>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </article>
            <RelatedStories stories={relatedStories} />
        </div>
    )
}