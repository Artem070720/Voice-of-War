'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function RegisterPage() {
    const router = useRouter()
    const { register } = useAuth()

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    })

    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleChange = (event) => {
        const { name, value } = event.target

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()

        try {
            setLoading(true)
            setError('')

            if (formData.password.length < 6) {
                setError('Пароль має містити мінімум 6 символів')
                return
            }

            if (formData.password !== formData.confirmPassword) {
                setError('Паролі не співпадають')
                return
            }

            await register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
            })

            router.push('/profile')
        } catch (error) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="mx-auto flex min-h-[calc(100vh-160px)] max-w-7xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
                <div className="text-center">
                    <p className="text-sm font-bold uppercase tracking-wide text-blue-900">
                        Створення акаунта
                    </p>

                    <h1 className="mt-3 text-3xl font-extrabold text-slate-900">
                        Реєстрація
                    </h1>

                    <p className="mt-3 text-sm text-slate-500">
                        Зареєструйтеся, щоб додавати власні спогади до цифрового архіву.
                    </p>
                </div>

                {error && (
                    <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                    <div>
                        <label className="text-sm font-semibold text-slate-700">
                            Ім’я
                        </label>

                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Ваше ім’я"
                            className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-blue-900"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-slate-700">
                            Email
                        </label>

                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="example@email.com"
                            className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-blue-900"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-slate-700">
                            Пароль
                        </label>

                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Мінімум 6 символів"
                            className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-blue-900"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-slate-700">
                            Підтвердження пароля
                        </label>

                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Повторіть пароль"
                            className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-blue-900"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="min-h-12 w-full rounded-2xl bg-blue-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {loading ? 'Створення акаунта...' : 'Зареєструватися'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-500">
                    Вже маєте акаунт?{' '}
                    <Link href="/login" className="font-semibold text-blue-900 hover:underline">
                        Увійти
                    </Link>
                </p>
            </div>
        </div>
    )
}