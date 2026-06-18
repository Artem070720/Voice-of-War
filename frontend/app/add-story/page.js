'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

export default function AddStoryPage() {
    const router = useRouter()
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

    const [images, setImages] = useState([])
    const [audio, setAudio] = useState(null)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [categoriesLoading, setCategoriesLoading] = useState(true)

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/login')
        }
    }, [loading, isAuthenticated, router])

    useEffect(() => {
        const loadCategories = async () => {
            try {
                setCategoriesLoading(true)

                const data = await apiFetch('/categories')

                setCategories(data.categories || [])

                if (data.categories?.length > 0) {
                    setFormData((prev) => ({
                        ...prev,
                        categoryId: prev.categoryId || data.categories[0].id,
                    }))
                }
            } catch (error) {
                setError(error.message)
            } finally {
                setCategoriesLoading(false)
            }
        }

        loadCategories()
    }, [])

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target

        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }))
    }

    const getFileKey = (file) => {
        return `${file.name}-${file.size}-${file.lastModified}`
    }

    const handleImagesChange = (event) => {
        const selectedFiles = Array.from(event.target.files || [])

        if (selectedFiles.length === 0) {
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

        setImages((prevImages) => {
            const existingKeys = new Set(prevImages.map(getFileKey))

            const newUniqueFiles = selectedFiles.filter((file) => !existingKeys.has(getFileKey(file)))

            const combinedFiles = [...prevImages, ...newUniqueFiles]

            if (combinedFiles.length > 5) {
                setError('Можна додати максимум 5 фото')
                return prevImages
            }

            setError('')
            return combinedFiles
        })

        event.target.value = ''
    }

    const removeImage = (imageIndex) => {
        setImages((prevImages) => prevImages.filter((_, index) => index !== imageIndex))
    }

    const handleAudioChange = (event) => {
        const selectedFile = event.target.files?.[0]

        if (!selectedFile) {
            setAudio(null)
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
        setAudio(selectedFile)
    }

    const removeAudio = () => {
        setAudio(null)
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

            images.forEach((image) => {
                requestData.append('images', image)
            })

            if (audio) {
                requestData.append('audio', audio)
            }

            const data = await apiFetch('/stories', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: requestData,
            })

            setSuccess(data.message || 'Історію успішно опубліковано')

            setFormData({
                title: '',
                content: '',
                region: '',
                city: '',
                eventDate: '',
                categoryId: categories[0]?.id || '',
                isAnonymous: false,
            })

            setImages([])
            setAudio(null)

            setTimeout(() => {
                router.push('/stories')
            }, 1200)
        } catch (error) {
            setError(error.message)
        } finally {
            setSubmitting(false)
        }
    }

    if (loading || categoriesLoading) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500">
                    Завантаження форми...
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
                    Додавання історії
                </p>

                <h1 className="mt-3 text-4xl font-extrabold">
                    Поділіться власним спогадом
                </h1>

                <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
                    Додайте текстову історію, оберіть категорію, вкажіть регіон і за бажанням
                    прикріпіть фотографії або аудіозапис. Після збереження історія одразу з’явиться в архіві.
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
                        {success}. Переходимо до архіву...
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
                            placeholder="Наприклад: Дорога з дому під час евакуації"
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
                            placeholder="Опишіть вашу історію, події, спогади, деталі та емоції..."
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
                                placeholder="Наприклад: Хмельницька область"
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
                                placeholder="Наприклад: Хмельницький"
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
                                Фотографії
                            </label>

                            <input
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                multiple
                                onChange={handleImagesChange}
                                className="mt-3 block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-800"
                            />

                            <p className="mt-3 text-xs leading-5 text-slate-500">
                                До 5 фото. Можна вибрати кілька одразу або додавати по одному. Формати: JPG, PNG, WEBP.
                            </p>

                            {images.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    <p className="text-xs font-semibold text-slate-500">
                                        Додано фото: {images.length}/5
                                    </p>

                                    {images.map((image, index) => (
                                        <div
                                            key={getFileKey(image)}
                                            className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600"
                                        >
                      <span className="min-w-0 flex-1 truncate">
                        {index + 1}. {image.name}
                      </span>

                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="rounded-lg bg-red-50 px-2 py-1 font-bold text-red-700 transition hover:bg-red-100"
                                            >
                                                Видалити
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="rounded-3xl border border-slate-200 p-5">
                            <label className="text-sm font-semibold text-slate-700">
                                Аудіозапис
                            </label>

                            <input
                                type="file"
                                accept="audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/mp4,audio/m4a"
                                onChange={handleAudioChange}
                                className="mt-3 block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-800"
                            />

                            <p className="mt-3 text-xs leading-5 text-slate-500">
                                Один аудіофайл. Формати: MP3, WAV, M4A. Максимум 30 MB.
                            </p>

                            {audio && (
                                <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
                  <span className="min-w-0 flex-1 truncate">
                    {audio.name}
                  </span>

                                    <button
                                        type="button"
                                        onClick={removeAudio}
                                        className="rounded-lg bg-red-50 px-2 py-1 font-bold text-red-700 transition hover:bg-red-100"
                                    >
                                        Видалити
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5 text-sm leading-6 text-blue-950">
                        Натискаючи кнопку “Опублікувати історію”, ви підтверджуєте, що маєте право
                        поділитися цими матеріалами та дозволяєте їх публікацію в цифровому архіві.
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={() => router.push('/stories')}
                            className="rounded-2xl bg-slate-100 px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
                        >
                            Скасувати
                        </button>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="rounded-2xl bg-blue-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {submitting ? 'Публікація...' : 'Опублікувати історію'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}