import Link from 'next/link'

export default function Footer() {
    return (
        <footer className="border-t border-slate-200 bg-slate-950 text-white">
            <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
                <div>
                    <h3 className="text-lg font-bold">Голос війни</h3>
                    <p className="mt-3 max-w-sm text-sm leading-6 text-slate-300">
                        Вебплатформа для збереження текстових, фото- та аудіоспогадів про події війни.
                    </p>
                </div>

                <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                        Навігація
                    </h4>

                    <div className="mt-4 flex flex-col gap-2 text-sm text-slate-300">
                        <Link href="/" className="hover:text-white">
                            Головна
                        </Link>
                        <Link href="/stories" className="hover:text-white">
                            Архів історій
                        </Link>
                        <Link href="/about" className="hover:text-white">
                            Про платформу
                        </Link>
                    </div>
                </div>

                <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                        Мета проєкту
                    </h4>
                    <p className="mt-4 text-sm leading-6 text-slate-300">
                        Зберегти людські свідчення, особисті історії та національну пам’ять для майбутніх поколінь.
                    </p>
                </div>
            </div>

            <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
                © 2026 Голос війни. Дипломний проєкт.
            </div>
        </footer>
    )
}