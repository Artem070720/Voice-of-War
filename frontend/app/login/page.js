'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
    const router = useRouter()
    const { login } = useAuth()

    const [formData, setFormData] = useState({
        email: '',
        password: '',
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

            const data = await login(formData)

            if (data.user.role === 'ADMIN') {
                router.push('/admin')
            } else {
                router.push('/profile')
            }
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
                        Авторизація
                    </p>

                    <h1 className="mt-3 text-3xl font-extrabold text-slate-900">
                        Вхід до акаунта
                    </h1>

                    <p className="mt-3 text-sm text-slate-500">
                        Увійдіть, щоб додавати власні історії та переглядати свій кабінет.
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
                            placeholder="Ваш пароль"
                            className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-blue-900"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="min-h-12 w-full rounded-2xl bg-blue-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {loading ? 'Вхід...' : 'Увійти'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-500">
                    Немає акаунта?{' '}
                    <Link href="/register" className="font-semibold text-blue-900 hover:underline">
                        Зареєструватися
                    </Link>
                </p>

                <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-xs leading-6 text-slate-500">
                    <p className="font-semibold text-slate-700">Тестовий адміністратор:</p>
                    <p>Email: admin@voiceofwar.com</p>
                    <p>Пароль: admin123</p>
                </div>
            </div>
        </div>
    )
}