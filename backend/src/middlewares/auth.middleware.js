const jwt = require('jsonwebtoken')
const prisma = require('../utils/prisma')

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'Немає токена авторизації',
            })
        }

        const token = authHeader.split(' ')[1]

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const user = await prisma.user.findUnique({
            where: {
                id: decoded.id,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
            },
        })

        if (!user) {
            return res.status(401).json({
                message: 'Користувача не знайдено',
            })
        }

        if (user.status === 'BLOCKED') {
            return res.status(403).json({
                message: 'Ваш акаунт заблоковано',
            })
        }

        req.user = user

        next()
    } catch (error) {
        return res.status(401).json({
            message: 'Недійсний або прострочений токен',
        })
    }
}

const adminMiddleware = (req, res, next) => {
    if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({
            message: 'Доступ дозволено тільки адміністратору',
        })
    }

    next()
}

module.exports = {
    authMiddleware,
    adminMiddleware,
}