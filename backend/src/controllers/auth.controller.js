const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const prisma = require('../utils/prisma')

const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            role: user.role,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '7d',
        }
    )
}

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body

        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'Заповніть всі обов’язкові поля',
            })
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: 'Пароль має містити мінімум 6 символів',
            })
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return res.status(409).json({
                message: 'Користувач з таким email вже існує',
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                createdAt: true,
            },
        })

        const token = generateToken(user)

        return res.status(201).json({
            message: 'Користувача успішно зареєстровано',
            token,
            user,
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Помилка реєстрації',
            error: error.message,
        })
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({
                message: 'Введіть email і пароль',
            })
        }

        const user = await prisma.user.findUnique({
            where: { email },
        })

        if (!user) {
            return res.status(401).json({
                message: 'Невірний email або пароль',
            })
        }

        if (user.status === 'BLOCKED') {
            return res.status(403).json({
                message: 'Ваш акаунт заблоковано',
            })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'Невірний email або пароль',
            })
        }

        const token = generateToken(user)

        return res.json({
            message: 'Вхід виконано успішно',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                createdAt: user.createdAt,
            },
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Помилка входу',
            error: error.message,
        })
    }
}

const getMe = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: req.user.id,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                createdAt: true,
            },
        })

        if (!user) {
            return res.status(404).json({
                message: 'Користувача не знайдено',
            })
        }

        return res.json({
            user,
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Помилка отримання користувача',
            error: error.message,
        })
    }
}

module.exports = {
    register,
    login,
    getMe,
}