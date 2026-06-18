'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

export default function ProfileSettingsPage() {
    const router = useRouter()

    const {
        user,
        loading,
        isAuthenticated,
        getAuthHeaders,
        checkAuth,
    } = useAuth()

    const [profileForm, setProfileForm] = useState({
        name: '',
    })

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    })

    const [profileError, setProfileError] = useState('')
    const [profileSuccess, setProfileSuccess] = useState('')
    const [passwordError, setPasswordError] = useState('')
    const [passwordSuccess, setPasswordSuccess] = useState('')

    const [profileSubmitting, setProfileSubmitting] = useState(false)
    const [passwordSubmitting, setPasswordSubmitting] = useState(false)

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/login')
        }
    }, [loading, isAuthenticated, router])

    useEffect(() => {
        if (user) {
            setProfileForm({
                name: user.name || '',
            })
        }
    }, [user])

    const handleProfileChange = (event) => {
        const { name, value } = event.target

        setProfileForm((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handlePasswordChange = (event) => {
        const { name, value } = event.target

        setPasswordForm((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleProfileSubmit = async (event) => {
        event.preventDefault()

        try {
            setProfileSubmitting(true)
            setProfileError('')
            setProfileSuccess('')

            if (!profileForm.name.trim()) {
                setProfileError('Введіть ім’я')
                return
            }

            if (profileForm.name.trim().length < 2) {
                setProfileError('Ім’я має містити мінімум 2 символи')
                return
            }

            const data = await apiFetch('/profile', {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    name: profileForm.name.trim(),
                }),
            })

            setProfileSuccess(data.message || 'Профіль успішно оновлено')
            await checkAuth()
        } catch (error) {
            setProfileError(error.message)
        } finally {
            setProfileSubmitting(false)
        }
    }

    const handlePasswordSubmit = async (event) => {
        event.preventDefault()

        try {
            setPasswordSubmitting(true)
            setPasswordError('')
            setPasswordSuccess('')

            if (
                !passwordForm.currentPassword ||
                !passwordForm.newPassword ||
                !passwordForm.confirmPassword
            ) {
                setPasswordError('Заповніть всі поля')
                return
            }

            if (passwordForm.newPassword.length < 6) {
                setPasswordError('Новий пароль має містити мінімум 6 символів')
                return
            }

            if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                setPasswordError('Новий пароль і підтвердження не співпадають')
                return
            }

            const data = await apiFetch('/profile/password', {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: JSON.stringify(passwordForm),
            })

            setPasswordSuccess(data.message || 'Пароль успішно змінено')

            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            })
        } catch (error) {
            setPasswordError(error.message)
        } finally {
            setPasswordSubmitting(false)
        }
    }

    const formatDate = (date) => {
        if (!date) return 'Не вказано'

        return new Date(date).toLocaleDateString('uk-UA', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        })
    }

    if (loading) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500">
                    Завантаження налаштувань...
                </div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return null
    }

    return (
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="rounded-[2rem] bg-slate-950 px-6 py-12 text-white sm:px-10">
                <p className="text-sm font-bold uppercase tracking-wide text-blue-200">
                    Особистий кабінет
                </p>

                <h1 className="mt-3 text-4xl font-extrabold">
                    Налаштування профілю
                </h1>

                <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
                    Оновіть особисті дані акаунта або змініть пароль для входу в систему.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Link
                        href="/profile"
                        className="rounded-2xl bg-white px-6 py-3 text-center text-sm font-bold text-slate-950 transition hover:bg-slate-100"
                    >
                        Назад до профілю
                    </Link>


                </div>
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-[360px_1fr]">
                <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-2xl font-bold text-slate-900">
                        Дані акаунта
                    </h2>

                    <div className="mt-6 space-y-5 text-sm">
                        <div>
                            <p className="font-semibold text-slate-500">
                                Ім’я
                            </p>
                            <p className="mt-1 text-slate-900">
                                {user?.name}
                            </p>
                        </div>

                        <div>
                            <p className="font-semibold text-slate-500">
                                Email
                            </p>
                            <p className="mt-1 break-all text-slate-900">
                                {user?.email}
                            </p>
                        </div>

                        <div>
                            <p className="font-semibold text-slate-500">
                                Роль
                            </p>
                            <p className="mt-1 text-slate-900">
                                {user?.role === 'ADMIN' ? 'Адміністратор' : 'Користувач'}
                            </p>
                        </div>

                        <div>
                            <p className="font-semibold text-slate-500">
                                Статус
                            </p>
                            <p className="mt-1 text-slate-900">
                                {user?.status === 'ACTIVE' ? 'Активний' : 'Заблокований'}
                            </p>
                        </div>

                        <div>
                            <p className="font-semibold text-slate-500">
                                Дата реєстрації
                            </p>
                            <p className="mt-1 text-slate-900">
                                {formatDate(user?.createdAt)}
                            </p>
                        </div>
                    </div>
                </aside>

                <div className="grid gap-8">
                    <form
                        onSubmit={handleProfileSubmit}
                        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                    >
                        <h2 className="text-2xl font-bold text-slate-900">
                            Особисті дані
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            Тут можна змінити ім’я, яке відображається у профілі та біля ваших історій.
                        </p>

                        {profileError && (
                            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {profileError}
                            </div>
                        )}

                        {profileSuccess && (
                            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                                {profileSuccess}
                            </div>
                        )}

                        <div className="mt-6">
                            <label className="text-sm font-semibold text-slate-700">
                                Ім’я
                            </label>

                            <input
                                type="text"
                                name="name"
                                value={profileForm.name}
                                onChange={handleProfileChange}
                                placeholder="Ваше ім’я"
                                className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-blue-900"
                                required
                            />
                        </div>

                        <div className="mt-6">
                            <label className="text-sm font-semibold text-slate-700">
                                Email
                            </label>

                            <input
                                type="email"
                                value={user?.email || ''}
                                disabled
                                className="mt-2 min-h-12 w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-500 outline-none"
                            />

                            <p className="mt-2 text-xs text-slate-500">
                                Email використовується для входу в акаунт і наразі не редагується.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={profileSubmitting}
                            className="mt-6 rounded-2xl bg-blue-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {profileSubmitting ? 'Збереження...' : 'Зберегти профіль'}
                        </button>
                    </form>

                    <form
                        onSubmit={handlePasswordSubmit}
                        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                    >
                        <h2 className="text-2xl font-bold text-slate-900">
                            Зміна пароля
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            Для зміни пароля введіть поточний пароль, а потім новий пароль.
                        </p>

                        {passwordError && (
                            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {passwordError}
                            </div>
                        )}

                        {passwordSuccess && (
                            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                                {passwordSuccess}
                            </div>
                        )}

                        <div className="mt-6 grid gap-5">
                            <div>
                                <label className="text-sm font-semibold text-slate-700">
                                    Поточний пароль
                                </label>

                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={passwordForm.currentPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Введіть поточний пароль"
                                    className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-blue-900"
                                    required
                                />
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <label className="text-sm font-semibold text-slate-700">
                                        Новий пароль
                                    </label>

                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={passwordForm.newPassword}
                                        onChange={handlePasswordChange}
                                        placeholder="Мінімум 6 символів"
                                        className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-blue-900"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-slate-700">
                                        Підтвердження нового пароля
                                    </label>

                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={passwordForm.confirmPassword}
                                        onChange={handlePasswordChange}
                                        placeholder="Повторіть новий пароль"
                                        className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-blue-900"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={passwordSubmitting}
                            className="mt-6 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {passwordSubmitting ? 'Зміна пароля...' : 'Змінити пароль'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}