'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { apiFetch, getFileUrl } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

export default function EditStoryPage() {
    const router = useRouter()
    const params = useParams()

    const { loading, isAuthenticated, getAuthHeaders } = useAuth()

    const [categories, setCategories] = useState([])
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        region: '',
        city: '',
        eventDate: '',
        categoryId: '',
        isAnonymous: false,
    })

    const [oldImages, setOldImages] = useState([])
    const [oldAudio, setOldAudio] = useState(null)

    const [newImages, setNewImages] = useState([])
    const [newAudio, setNewAudio] = useState(null)

    const [pageLoading, setPageLoading] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/login')
        }
    }, [loading, isAuthenticated, router])

    useEffect(() => {
        const loadData = async () => {
            try {
                if (loading || !isAuthenticated || !params.id) return

                setPageLoading(true)
                setError('')

                const [categoriesData, storyData] = await Promise.all([
                    apiFetch('/categories'),
                    apiFetch(`/stories/my/${params.id}`, {
                        headers: getAuthHeaders(),
                    }),
                ])

                const story = storyData.story

                setCategories(categoriesData.categories || [])

                setFormData({
                    title: story.title || '',
                    content: story.content || '',
                    region: story.region || '',
                    city: story.city || '',
                    eventDate: story.eventDate ? story.eventDate.slice(0, 10) : '',
                    categoryId: story.categoryId || '',
                    isAnonymous: Boolean(story.isAnonymous),
                })

                setOldImages(story.images || [])
                setOldAudio(story.audio || null)
            } catch (error) {
                setError(error.message)
            } finally {
                setPageLoading(false)
            }
        }

        loadData()
    }, [loading, isAuthenticated, params.id])

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target

        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }))
    }

    const handleImagesChange = (event) => {
        const selectedFiles = Array.from(event.target.files || [])

        if (selectedFiles.length > 5) {
            setError('Можна додати максимум 5 фото')
            event.target.value = ''
            return
        }

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        const invalidFile = selectedFiles.find((file) => !allowedTypes.includes(file.type))

        if (invalidFile) {
            setError('Фото мають бути у форматі JPG, PNG або WEBP')
            event.target.value = ''
            return
        }

        const tooLargeFile = selectedFiles.find((file) => file.size > 5 * 1024 * 1024)

        if (tooLargeFile) {
            setError('Розмір одного фото не має перевищувати 5 MB')
            event.target.value = ''
            return
        }

        setError('')
        setNewImages(selectedFiles)
    }

    const handleAudioChange = (event) => {
        const selectedFile = event.target.files?.[0]

        if (!selectedFile) {
            setNewAudio(null)
            return
        }

        const allowedTypes = [
            'audio/mpeg',
            'audio/mp3',
            'audio/wav',
            'audio/x-wav',
            'audio/mp4',
            'audio/m4a',
        ]

        if (!allowedTypes.includes(selectedFile.type)) {
            setError('Аудіо має бути у форматі MP3, WAV або M4A')
            event.target.value = ''
            return
        }

        if (selectedFile.size > 30 * 1024 * 1024) {
            setError('Розмір аудіофайлу не має перевищувати 30 MB')
            event.target.value = ''
            return
        }

        setError('')
        setNewAudio(selectedFile)
    }

    const validateForm = () => {
        if (!formData.title.trim()) {
            return 'Введіть назву історії'
        }

        if (formData.title.trim().length < 5) {
            return 'Назва історії має містити мінімум 5 символів'
        }

        if (!formData.content.trim()) {
            return 'Введіть текст історії'
        }

        if (formData.content.trim().length < 30) {
            return 'Текст історії має містити мінімум 30 символів'
        }

        if (!formData.region.trim()) {
            return 'Вкажіть регіон'
        }

        if (!formData.categoryId) {
            return 'Оберіть категорію'
        }

        return ''
    }

    const handleSubmit = async (event) => {
        event.preventDefault()

        try {
            setSubmitting(true)
            setError('')
            setSuccess('')

            const validationError = validateForm()

            if (validationError) {
                setError(validationError)
                return
            }

            const requestData = new FormData()

            requestData.append('title', formData.title.trim())
            requestData.append('content', formData.content.trim())
            requestData.append('region', formData.region.trim())
            requestData.append('city', formData.city.trim())
            requestData.append('eventDate', formData.eventDate)
            requestData.append('categoryId', formData.categoryId)
            requestData.append('isAnonymous', String(formData.isAnonymous))

            if (newImages.length > 0) {
                requestData.append('replaceImages', 'true')

                newImages.forEach((image) => {
                    requestData.append('images', image)
                })
            } else {
                requestData.append('replaceImages', 'false')
            }

            if (newAudio) {
                requestData.append('replaceAudio', 'true')
                requestData.append('audio', newAudio)
            } else {
                requestData.append('replaceAudio', 'false')
            }

            const data = await apiFetch(`/stories/${params.id}`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: requestData,
            })

            setSuccess(data.message || 'Історію успішно оновлено')

            setTimeout(() => {
                router.push('/profile/my-stories')
            }, 1000)
        } catch (error) {
            setError(error.message)
        } finally {
            setSubmitting(false)
        }
    }

    if (loading || pageLoading) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500">
                    Завантаження форми редагування...
                </div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return null
    }

    return (
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="rounded-[2rem] bg-slate-950 px-6 py-12 text-white sm:px-10">
                <p className="text-sm font-bold uppercase tracking-wide text-blue-200">
                    Редагування історії
                </p>

                <h1 className="mt-3 text-4xl font-extrabold">
                    Оновіть свій спогад
                </h1>

                <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
                    Ви можете змінити текст, категорію, регіон, дату, а також замінити фото чи аудіозапис.
                </p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
            >
                {error && (
                    <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        {success}. Повертаємося до списку...
                    </div>
                )}

                <div className="grid gap-6">
                    <div>
                        <label className="text-sm font-semibold text-slate-700">
                            Назва історії *
                        </label>

                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-blue-900"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-slate-700">
                            Текст історії *
                        </label>

                        <textarea
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            rows={9}
                            className="mt-2 w-full resize-y rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-900"
                            required
                        />

                        <p className="mt-2 text-xs text-slate-500">
                            Мінімум 30 символів. Поточна кількість: {formData.content.trim().length}
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <label className="text-sm font-semibold text-slate-700">
                                Категорія *
                            </label>

                            <select
                                name="categoryId"
                                value={formData.categoryId}
                                onChange={handleChange}
                                className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-blue-900"
                                required
                            >
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-slate-700">
                                Дата події
                            </label>

                            <input
                                type="date"
                                name="eventDate"
                                value={formData.eventDate}
                                onChange={handleChange}
                                className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-blue-900"
                            />
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <label className="text-sm font-semibold text-slate-700">
                                Регіон *
                            </label>

                            <input
                                type="text"
                                name="region"
                                value={formData.region}
                                onChange={handleChange}
                                className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-blue-900"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-slate-700">
                                Населений пункт
                            </label>

                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-blue-900"
                            />
                        </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                        <label className="flex cursor-pointer items-start gap-3">
                            <input
                                type="checkbox"
                                name="isAnonymous"
                                checked={formData.isAnonymous}
                                onChange={handleChange}
                                className="mt-1 h-4 w-4 rounded border-slate-300"
                            />

                            <span>
                <span className="block text-sm font-semibold text-slate-800">
                  Опублікувати анонімно
                </span>

                <span className="mt-1 block text-sm leading-6 text-slate-500">
                  Якщо увімкнути цю опцію, в архіві замість вашого імені буде показано “Анонімно”.
                </span>
              </span>
                        </label>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="rounded-3xl border border-slate-200 p-5">
                            <label className="text-sm font-semibold text-slate-700">
                                Поточні фотографії
                            </label>

                            {oldImages.length > 0 ? (
                                <div className="mt-4 grid grid-cols-2 gap-3">
                                    {oldImages.map((image) => (
                                        <img
                                            key={image.id}
                                            src={getFileUrl(image.imageUrl)}
                                            alt="Фото історії"
                                            className="h-32 w-full rounded-2xl object-cover"
                                        />
                                    ))}
                                </div>
                            ) : (
                                <p className="mt-3 text-sm text-slate-500">
                                    Фото не додано.
                                </p>
                            )}

                            <label className="mt-6 block text-sm font-semibold text-slate-700">
                                Замінити фотографії
                            </label>

                            <input
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                multiple
                                onChange={handleImagesChange}
                                className="mt-3 block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-800"
                            />

                            <p className="mt-3 text-xs leading-5 text-slate-500">
                                Якщо вибрати нові фото, вони повністю замінять старі. Максимум 5 фото.
                            </p>

                            {newImages.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    {newImages.map((image) => (
                                        <div
                                            key={`${image.name}-${image.size}`}
                                            className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600"
                                        >
                                            {image.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="rounded-3xl border border-slate-200 p-5">
                            <label className="text-sm font-semibold text-slate-700">
                                Поточний аудіозапис
                            </label>

                            {oldAudio ? (
                                <audio
                                    controls
                                    src={getFileUrl(oldAudio.audioUrl)}
                                    className="mt-4 w-full"
                                >
                                    Ваш браузер не підтримує аудіоплеєр.
                                </audio>
                            ) : (
                                <p className="mt-3 text-sm text-slate-500">
                                    Аудіо не додано.
                                </p>
                            )}

                            <label className="mt-6 block text-sm font-semibold text-slate-700">
                                Замінити аудіозапис
                            </label>

                            <input
                                type="file"
                                accept="audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/mp4,audio/m4a"
                                onChange={handleAudioChange}
                                className="mt-3 block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-800"
                            />

                            <p className="mt-3 text-xs leading-5 text-slate-500">
                                Якщо вибрати нове аудіо, воно замінить старе. Максимум 30 MB.
                            </p>

                            {newAudio && (
                                <div className="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
                                    {newAudio.name}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={() => router.push('/profile/my-stories')}
                            className="rounded-2xl bg-slate-100 px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
                        >
                            Скасувати
                        </button>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="rounded-2xl bg-blue-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {submitting ? 'Збереження...' : 'Зберегти зміни'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}