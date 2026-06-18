'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import StoryCard from '@/components/StoryCard'
import { apiFetch } from '@/lib/api'

export default function HomePage() {
  const [statistics, setStatistics] = useState({
    storiesCount: 0,
    authorsCount: 0,
    categoriesCount: 0,
    imagesCount: 0,
    audioCount: 0,
  })

  const [latestStories, setLatestStories] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true)
        setError('')

        const data = await apiFetch('/public/home')

        setStatistics(data.statistics || {
          storiesCount: 0,
          authorsCount: 0,
          categoriesCount: 0,
          imagesCount: 0,
          audioCount: 0,
        })

        setLatestStories(data.latestStories || [])
        setCategories(data.categories || [])
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    loadHomeData()
  }, [])

  return (
      <div>
        <section className="relative overflow-hidden bg-slate-950 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.35),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.25),_transparent_30%)]" />

          <div className="relative mx-auto grid min-h-[640px] max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div>
              <div className="mb-6 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-slate-200">
                Цифровий архів національної пам’яті
              </div>

              <h1 className="max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
                Голос війни — архів людських історій, які не мають бути забуті
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                Вебплатформа для збереження текстових, фото- та аудіоспогадів людей про події війни,
                евакуацію, окупацію, волонтерство, втрати, допомогу та силу українців.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                    href="/add-story"
                    className="rounded-2xl bg-white px-6 py-3 text-center text-sm font-bold text-slate-950 shadow-lg transition hover:bg-slate-100"
                >
                  Поділитися історією
                </Link>

                <Link
                    href="/stories"
                    className="rounded-2xl border border-white/25 px-6 py-3 text-center text-sm font-bold text-white transition hover:bg-white/10"
                >
                  Переглянути архів
                </Link>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur">
              <div className="rounded-[1.5rem] bg-white p-6 text-slate-900">
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-900">
                  Місія платформи
                </p>

                <h2 className="mt-3 text-3xl font-bold">
                  Зберегти пам’ять через особисті свідчення
                </h2>

                <p className="mt-4 leading-7 text-slate-600">
                  Кожна історія — це частина історії країни. Платформа дозволяє зберігати спогади
                  у вигляді тексту, фотографій та аудіозаписів, щоб ці свідчення були доступними
                  для майбутніх поколінь.
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-2xl font-bold text-blue-900">Текст</p>
                    <p className="mt-2 text-sm text-slate-500">Особисті спогади</p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-2xl font-bold text-blue-900">Фото</p>
                    <p className="mt-2 text-sm text-slate-500">Візуальні свідчення</p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-2xl font-bold text-blue-900">Аудіо</p>
                    <p className="mt-2 text-sm text-slate-500">Голоси очевидців</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {error && (
            <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
                {error}
              </div>
            </section>
        )}

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">Історій</p>
              <p className="mt-3 text-4xl font-extrabold text-blue-900">
                {loading ? '...' : statistics.storiesCount}
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">Авторів</p>
              <p className="mt-3 text-4xl font-extrabold text-blue-900">
                {loading ? '...' : statistics.authorsCount}
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">Категорій</p>
              <p className="mt-3 text-4xl font-extrabold text-blue-900">
                {loading ? '...' : statistics.categoriesCount}
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">Фото</p>
              <p className="mt-3 text-4xl font-extrabold text-blue-900">
                {loading ? '...' : statistics.imagesCount}
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">Аудіо</p>
              <p className="mt-3 text-4xl font-extrabold text-blue-900">
                {loading ? '...' : statistics.audioCount}
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-wide text-blue-900">
                Можливості системи
              </p>

              <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
                Платформа поєднує архів, особистий кабінет та адміністративне керування
              </h2>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-7">
                <h3 className="text-xl font-bold text-slate-900">Додавання історій</h3>
                <p className="mt-4 leading-7 text-slate-600">
                  Користувач може додати власну історію, обрати категорію, вказати регіон,
                  прикріпити фото та аудіофайл.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-7">
                <h3 className="text-xl font-bold text-slate-900">Публічний архів</h3>
                <p className="mt-4 leading-7 text-slate-600">
                  Відвідувачі можуть переглядати опубліковані історії, шукати їх за темами,
                  регіонами, ключовими словами та типами матеріалів.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-7">
                <h3 className="text-xl font-bold text-slate-900">Адмін-панель</h3>
                <p className="mt-4 leading-7 text-slate-600">
                  Адміністратор може керувати користувачами, категоріями, історіями та переглядати
                  статистику роботи платформи.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-blue-900">
                Останні історії
              </p>

              <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
                Нові спогади в архіві
              </h2>

              <p className="mt-4 max-w-2xl leading-7 text-slate-600">
                Найновіші історії, якими поділилися користувачі платформи.
              </p>
            </div>

            <Link
                href="/stories"
                className="rounded-2xl bg-blue-900 px-6 py-3 text-center text-sm font-bold text-white transition hover:bg-blue-800"
            >
              Усі історії
            </Link>
          </div>

          {loading ? (
              <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500">
                Завантаження історій...
              </div>
          ) : latestStories.length === 0 ? (
              <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-10 text-center">
                <h3 className="text-2xl font-bold text-slate-900">
                  Історій поки немає
                </h3>

                <p className="mt-3 text-slate-600">
                  Станьте першим, хто поділиться власним спогадом.
                </p>

                <Link
                    href="/add-story"
                    className="mt-6 inline-flex rounded-2xl bg-blue-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-800"
                >
                  Додати історію
                </Link>
              </div>
          ) : (
              <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {latestStories.map((story) => (
                    <StoryCard key={story.id} story={story} />
                ))}
              </div>
          )}
        </section>

        <section className="bg-slate-950 text-white">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-blue-200">
                  Категорії
                </p>

                <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                  Теми, за якими зберігаються історії
                </h2>

                <p className="mt-4 max-w-2xl leading-7 text-slate-300">
                  Категорії допомагають структурувати архів і швидше знаходити спогади за темами.
                </p>
              </div>

              <Link
                  href="/stories"
                  className="rounded-2xl bg-white px-6 py-3 text-center text-sm font-bold text-slate-950 transition hover:bg-slate-100"
              >
                Перейти до архіву
              </Link>
            </div>

            {loading ? (
                <div className="mt-10 rounded-3xl border border-white/10 bg-white/10 p-10 text-center text-slate-300">
                  Завантаження категорій...
                </div>
            ) : categories.length === 0 ? (
                <div className="mt-10 rounded-3xl border border-white/10 bg-white/10 p-10 text-center text-slate-300">
                  Категорії поки не створені.
                </div>
            ) : (
                <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  {categories.slice(0, 10).map((category) => (
                      <div
                          key={category.id}
                          className="rounded-3xl border border-white/10 bg-white/10 p-5"
                      >
                        <h3 className="font-bold text-white">
                          {category.name}
                        </h3>

                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-300">
                          {category.description || 'Опис категорії відсутній.'}
                        </p>

                        <p className="mt-4 text-xs font-semibold text-blue-200">
                          Історій: {category._count?.stories || 0}
                        </p>
                      </div>
                  ))}
                </div>
            )}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] bg-blue-900 px-6 py-12 text-center text-white sm:px-10">
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              Ваша історія також важлива
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-blue-100">
              Поділіться власним спогадом, фотографіями або аудіозаписом, щоб зберегти частинку
              пам’яті для майбутніх поколінь.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                  href="/add-story"
                  className="rounded-2xl bg-white px-6 py-3 text-sm font-bold text-blue-950 transition hover:bg-slate-100"
              >
                Поділитися історією
              </Link>

              <Link
                  href="/stories"
                  className="rounded-2xl border border-white/30 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Переглянути архів
              </Link>
            </div>
          </div>
        </section>
      </div>
  )
}