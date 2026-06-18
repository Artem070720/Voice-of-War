'use client'

import Link from 'next/link'
import StoryCard from '@/components/StoryCard'

export default function RelatedStories({ stories = [] }) {
    if (!stories.length) {
        return null
    }

    return (
        <section className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-sm font-bold uppercase tracking-wide text-blue-900">
                        Схожі матеріали
                    </p>

                    <h2 className="mt-2 text-3xl font-bold text-slate-900">
                        Схожі історії
                    </h2>

                    <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                        Інші історії з подібною категорією або регіоном, які можуть бути цікавими для перегляду.
                    </p>
                </div>

                <Link
                    href="/stories"
                    className="rounded-2xl bg-blue-900 px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-blue-800"
                >
                    До архіву
                </Link>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {stories.map((story) => (
                    <StoryCard key={story.id} story={story} />
                ))}
            </div>
        </section>
    )
}