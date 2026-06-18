import Link from 'next/link'

export default function AboutPage() {
    return (
        <div>
            <section className="bg-slate-950 text-white">
                <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                    <div className="max-w-4xl">
                        <p className="text-sm font-bold uppercase tracking-wide text-blue-200">
                            Про платформу
                        </p>

                        <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
                            “Голос війни” — цифровий архів спогадів про події війни
                        </h1>

                        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
                            Вебплатформа створена для збереження особистих історій, свідчень,
                            фотографій та аудіоспогадів людей, які пережили події війни.
                            Мета проєкту — зберегти національну пам’ять через людські голоси,
                            емоції та реальні життєві історії.
                        </p>

                        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                            <Link
                                href="/stories"
                                className="rounded-2xl bg-white px-6 py-3 text-center text-sm font-bold text-slate-950 transition hover:bg-slate-100"
                            >
                                Переглянути архів
                            </Link>

                            <Link
                                href="/add-story"
                                className="rounded-2xl border border-white/25 px-6 py-3 text-center text-sm font-bold text-white transition hover:bg-white/10"
                            >
                                Поділитися історією
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                <div className="grid gap-10 lg:grid-cols-[1fr_420px] lg:items-start">
                    <div>
                        <p className="text-sm font-bold uppercase tracking-wide text-blue-900">
                            Ідея проєкту
                        </p>

                        <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
                            Чому важливо зберігати особисті свідчення
                        </h2>

                        <div className="mt-6 space-y-5 text-lg leading-8 text-slate-700">
                            <p>
                                Війна складається не лише з офіційних повідомлень, дат і подій.
                                Вона також складається з особистих переживань людей: евакуації,
                                втрати дому, волонтерства, служби, допомоги цивільним, життя в
                                тилу та спогадів про близьких.
                            </p>

                            <p>
                                Саме такі історії часто залишаються поза межами формальних
                                джерел, але вони мають велику цінність для суспільства,
                                істориків, дослідників, родин та майбутніх поколінь.
                            </p>

                            <p>
                                “Голос війни” дозволяє систематизувати ці свідчення у зручному
                                цифровому архіві, де кожна історія може бути збережена у вигляді
                                тексту, фотографій або аудіозапису.
                            </p>
                        </div>
                    </div>

                    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-2xl font-bold text-slate-900">
                            Мета дипломного проєкту
                        </h3>

                        <p className="mt-4 leading-7 text-slate-600">
                            Розробити вебплатформу для збереження, систематизації та публікації
                            цифрового архіву спогадів про події війни з підтримкою текстових,
                            фото- та аудіоматеріалів.
                        </p>

                        <div className="mt-6 grid gap-3">
                            <div className="rounded-2xl bg-blue-50 p-4">
                                <p className="font-bold text-blue-950">Текстові історії</p>
                                <p className="mt-1 text-sm text-blue-900">
                                    Особисті спогади та свідчення користувачів.
                                </p>
                            </div>

                            <div className="rounded-2xl bg-blue-50 p-4">
                                <p className="font-bold text-blue-950">Фотоматеріали</p>
                                <p className="mt-1 text-sm text-blue-900">
                                    Візуальні докази, сімейні фото, місця та події.
                                </p>
                            </div>

                            <div className="rounded-2xl bg-blue-50 p-4">
                                <p className="font-bold text-blue-950">Аудіоспогади</p>
                                <p className="mt-1 text-sm text-blue-900">
                                    Голоси очевидців і живі свідчення людей.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-white">
                <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                    <div className="max-w-3xl">
                        <p className="text-sm font-bold uppercase tracking-wide text-blue-900">
                            Функціональні можливості
                        </p>

                        <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
                            Що дозволяє робити система
                        </h2>

                        <p className="mt-4 text-lg leading-8 text-slate-600">
                            Платформа має публічну частину для перегляду історій, особистий
                            кабінет користувача та адміністративну панель для керування системою.
                        </p>
                    </div>

                    <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-7">
                            <h3 className="text-xl font-bold text-slate-900">
                                Додавання історій
                            </h3>

                            <p className="mt-4 leading-7 text-slate-600">
                                Авторизований користувач може створити історію, додати опис,
                                регіон, дату події, категорію, фото та аудіофайл.
                            </p>
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-7">
                            <h3 className="text-xl font-bold text-slate-900">
                                Публічний архів
                            </h3>

                            <p className="mt-4 leading-7 text-slate-600">
                                Відвідувачі можуть переглядати історії, відкривати повну сторінку
                                матеріалу, слухати аудіо та переглядати фотографії.
                            </p>
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-7">
                            <h3 className="text-xl font-bold text-slate-900">
                                Пошук і фільтрація
                            </h3>

                            <p className="mt-4 leading-7 text-slate-600">
                                Архів підтримує пошук за текстом, фільтрацію за категорією,
                                регіоном, наявністю фото або аудіо та сортування.
                            </p>
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-7">
                            <h3 className="text-xl font-bold text-slate-900">
                                Особистий кабінет
                            </h3>

                            <p className="mt-4 leading-7 text-slate-600">
                                Користувач може переглядати власні історії, редагувати їх,
                                видаляти, а також змінювати ім’я та пароль у налаштуваннях.
                            </p>
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-7">
                            <h3 className="text-xl font-bold text-slate-900">
                                Адміністрування
                            </h3>

                            <p className="mt-4 leading-7 text-slate-600">
                                Адміністратор може керувати історіями, користувачами,
                                категоріями та переглядати статистику роботи платформи.
                            </p>
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-7">
                            <h3 className="text-xl font-bold text-slate-900">
                                Статистика
                            </h3>

                            <p className="mt-4 leading-7 text-slate-600">
                                На головній сторінці та в адмін-панелі відображаються кількість
                                історій, авторів, категорій, фото та аудіозаписів.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="rounded-[2rem] bg-blue-900 p-8 text-white">
                        <p className="text-sm font-bold uppercase tracking-wide text-blue-200">
                            Для користувачів
                        </p>

                        <h3 className="mt-3 text-2xl font-bold">
                            Можливість поділитися власним досвідом
                        </h3>

                        <p className="mt-4 leading-7 text-blue-100">
                            Людина може зберегти свою історію, додати фото або аудіо та зробити
                            свій спогад частиною загального архіву.
                        </p>
                    </div>

                    <div className="rounded-[2rem] bg-slate-900 p-8 text-white">
                        <p className="text-sm font-bold uppercase tracking-wide text-slate-300">
                            Для суспільства
                        </p>

                        <h3 className="mt-3 text-2xl font-bold">
                            Збереження національної пам’яті
                        </h3>

                        <p className="mt-4 leading-7 text-slate-300">
                            Архів допомагає зберегти живі людські свідчення та зробити їх
                            доступними для майбутніх поколінь.
                        </p>
                    </div>

                    <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
                        <p className="text-sm font-bold uppercase tracking-wide text-blue-900">
                            Для досліджень
                        </p>

                        <h3 className="mt-3 text-2xl font-bold text-slate-900">
                            Структурований цифровий матеріал
                        </h3>

                        <p className="mt-4 leading-7 text-slate-600">
                            Історії впорядковуються за категоріями, регіонами та датами,
                            що робить архів зручним для пошуку й аналізу.
                        </p>
                    </div>
                </div>
            </section>

            <section className="bg-slate-950 text-white">
                <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                    <div className="grid gap-10 lg:grid-cols-[420px_1fr] lg:items-center">
                        <div>
                            <p className="text-sm font-bold uppercase tracking-wide text-blue-200">
                                Як працює платформа
                            </p>

                            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                                Простий шлях від особистої історії до цифрового архіву
                            </h2>

                            <p className="mt-5 leading-8 text-slate-300">
                                Користувач реєструється, додає історію, прикріплює матеріали,
                                а система зберігає ці дані в базі та відображає їх у публічному архіві.
                            </p>
                        </div>

                        <div className="grid gap-4">
                            <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
                                <p className="text-sm font-bold text-blue-200">
                                    Крок 1
                                </p>
                                <h3 className="mt-2 text-xl font-bold">
                                    Реєстрація або вхід
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-slate-300">
                                    Користувач створює акаунт або входить у вже існуючий профіль.
                                </p>
                            </div>

                            <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
                                <p className="text-sm font-bold text-blue-200">
                                    Крок 2
                                </p>
                                <h3 className="mt-2 text-xl font-bold">
                                    Додавання історії
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-slate-300">
                                    Заповнюється форма з назвою, текстом, регіоном, категорією,
                                    фото або аудіофайлом.
                                </p>
                            </div>

                            <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
                                <p className="text-sm font-bold text-blue-200">
                                    Крок 3
                                </p>
                                <h3 className="mt-2 text-xl font-bold">
                                    Публікація в архіві
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-slate-300">
                                    Історія зберігається в базі даних і стає доступною на сторінці
                                    публічного архіву.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                <div className="rounded-[2rem] bg-blue-900 px-6 py-12 text-center text-white sm:px-10">
                    <h2 className="text-3xl font-extrabold sm:text-4xl">
                        Кожна історія має значення
                    </h2>

                    <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-blue-100">
                        Поділіться власним спогадом або перегляньте історії інших людей,
                        щоб краще зрозуміти особистий вимір війни.
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