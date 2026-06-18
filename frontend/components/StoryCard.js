import Link from 'next/link'
import { getFileUrl } from '@/lib/api'

export default function StoryCard({ story }) {
    const previewImage = story?.images?.[0]?.imageUrl
    const imageUrl = getFileUrl(previewImage)

    return (
        <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <div className="h-48 bg-slate-100">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={story.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-950 to-slate-800 px-6 text-center text-sm font-medium text-white">
                        Голос війни
                    </div>
                )}
            </div>

            <div className="p-6">
                <div className="mb-4 flex flex-wrap gap-2">
                    {story.category?.name && (
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-900">
      {story.category.name}
    </span>
                    )}

                    {story.audio && (
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
      Є аудіо
    </span>
                    )}

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
    Переглядів: {story.viewsCount || 0}
  </span>
                </div>

                <h3 className="line-clamp-2 text-xl font-bold text-slate-900">
                    {story.title}
                </h3>

                <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                    {story.content}
                </p>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                    <div className="text-xs text-slate-500">
                        <p>{story.region}</p>
                        {story.city && <p>{story.city}</p>}
                    </div>

                    <Link
                        href={`/stories/${story.id}`}
                        className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-900"
                    >
                        Читати
                    </Link>
                </div>
            </div>
        </article>
    )
}