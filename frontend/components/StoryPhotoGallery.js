'use client'

import { useEffect, useState } from 'react'
import { getFileUrl } from '@/lib/api'

export default function StoryPhotoGallery({ images = [], title = 'Фото історії' }) {
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const selectedImage = images[selectedIndex]

    const goToPrevious = () => {
        setSelectedIndex((prev) => {
            if (prev === 0) return images.length - 1
            return prev - 1
        })
    }

    const goToNext = () => {
        setSelectedIndex((prev) => {
            if (prev === images.length - 1) return 0
            return prev + 1
        })
    }

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (!isModalOpen) return

            if (event.key === 'Escape') {
                setIsModalOpen(false)
            }

            if (event.key === 'ArrowLeft') {
                goToPrevious()
            }

            if (event.key === 'ArrowRight') {
                goToNext()
            }
        }

        window.addEventListener('keydown', handleKeyDown)

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [isModalOpen, images.length])

    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }

        return () => {
            document.body.style.overflow = ''
        }
    }, [isModalOpen])

    if (!images.length || !selectedImage) {
        return null
    }

    return (
        <section>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                        Фотоматеріали
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                        Натисніть на фото, щоб переглянути його у збільшеному форматі.
                    </p>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
          {selectedIndex + 1} / {images.length}
        </span>
            </div>

            <div className="mt-5 overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 shadow-sm">
                <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="group relative block h-[280px] w-full bg-slate-950 sm:h-[420px]"
                >
                    <img
                        src={getFileUrl(selectedImage.imageUrl)}
                        alt={title}
                        className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.01]"
                    />

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-5 py-4 text-left">
                        <p className="text-sm font-semibold text-white">
                            Натисніть для збільшення
                        </p>
                    </div>
                </button>
            </div>

            {images.length > 1 && (
                <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
                    {images.map((image, index) => {
                        const isActive = index === selectedIndex

                        return (
                            <button
                                key={image.id}
                                type="button"
                                onClick={() => setSelectedIndex(index)}
                                className={`overflow-hidden rounded-2xl border-2 bg-slate-100 transition ${
                                    isActive
                                        ? 'border-blue-900 ring-4 ring-blue-100'
                                        : 'border-transparent hover:border-slate-300'
                                }`}
                            >
                                <img
                                    src={getFileUrl(image.imageUrl)}
                                    alt={`${title} ${index + 1}`}
                                    className="h-24 w-full object-cover sm:h-28"
                                />
                            </button>
                        )
                    })}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 px-4 py-6">
                    <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="absolute right-4 top-4 rounded-2xl bg-white px-4 py-2 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
                    >
                        Закрити
                    </button>

                    {images.length > 1 && (
                        <button
                            type="button"
                            onClick={goToPrevious}
                            className="absolute left-4 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/90 px-4 py-3 text-2xl font-bold text-slate-950 transition hover:bg-white sm:block"
                            aria-label="Попереднє фото"
                        >
                            ‹
                        </button>
                    )}

                    <div className="max-h-[86vh] max-w-6xl">
                        <img
                            src={getFileUrl(selectedImage.imageUrl)}
                            alt={title}
                            className="max-h-[86vh] max-w-full rounded-3xl object-contain"
                        />

                        <p className="mt-4 text-center text-sm font-semibold text-white">
                            Фото {selectedIndex + 1} з {images.length}
                        </p>
                    </div>

                    {images.length > 1 && (
                        <button
                            type="button"
                            onClick={goToNext}
                            className="absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/90 px-4 py-3 text-2xl font-bold text-slate-950 transition hover:bg-white sm:block"
                            aria-label="Наступне фото"
                        >
                            ›
                        </button>
                    )}

                    {images.length > 1 && (
                        <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-2 sm:hidden">
                            <button
                                type="button"
                                onClick={goToPrevious}
                                className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950"
                            >
                                Назад
                            </button>

                            <button
                                type="button"
                                onClick={goToNext}
                                className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950"
                            >
                                Далі
                            </button>
                        </div>
                    )}
                </div>
            )}
        </section>
    )
}