const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const FILE_URL = process.env.NEXT_PUBLIC_FILE_URL || 'http://localhost:5000'

export const getFileUrl = (filePath) => {
    if (!filePath) return null

    if (filePath.startsWith('http')) {
        return filePath
    }

    return `${FILE_URL}/${filePath}`
}

export const apiFetch = async (endpoint, options = {}) => {
    const isFormData = options.body instanceof FormData

    const headers = {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...options.headers,
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
        throw new Error(data?.message || 'Помилка запиту до сервера')
    }

    return data
}