'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(null)
    const [loading, setLoading] = useState(true)

    const saveAuthData = (authToken, authUser) => {
        localStorage.setItem('voice_of_war_token', authToken)
        setToken(authToken)
        setUser(authUser)
    }

    const clearAuthData = () => {
        localStorage.removeItem('voice_of_war_token')
        setToken(null)
        setUser(null)
    }

    const checkAuth = async () => {
        try {
            const savedToken = localStorage.getItem('voice_of_war_token')

            if (!savedToken) {
                setLoading(false)
                return
            }

            const data = await apiFetch('/auth/me', {
                headers: {
                    Authorization: `Bearer ${savedToken}`,
                },
            })

            setToken(savedToken)
            setUser(data.user)
        } catch (error) {
            clearAuthData()
        } finally {
            setLoading(false)
        }
    }

    const register = async ({ name, email, password }) => {
        const data = await apiFetch('/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                name,
                email,
                password,
            }),
        })

        saveAuthData(data.token, data.user)

        return data
    }

    const login = async ({ email, password }) => {
        const data = await apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                email,
                password,
            }),
        })

        saveAuthData(data.token, data.user)

        return data
    }

    const logout = () => {
        clearAuthData()
    }

    const getAuthHeaders = () => {
        if (!token) return {}

        return {
            Authorization: `Bearer ${token}`,
        }
    }

    useEffect(() => {
        checkAuth()
    }, [])

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                isAuthenticated: Boolean(user && token),
                isAdmin: user?.role === 'ADMIN',
                register,
                login,
                logout,
                getAuthHeaders,
                checkAuth,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error('useAuth must be used inside AuthProvider')
    }

    return context
}