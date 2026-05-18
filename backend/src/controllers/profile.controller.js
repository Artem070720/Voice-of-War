const bcrypt = require('bcrypt')
const prisma = require('../utils/prisma')

const updateProfile = async (req, res) => {
    try {
        const { name } = req.body

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: 'Ім’я є обов’язковим',
            })
        }

        if (name.trim().length < 2) {
            return res.status(400).json({
                message: 'Ім’я має містити мінімум 2 символи',
            })
        }

        if (name.trim().length > 50) {
            return res.status(400).json({
                message: 'Ім’я не може бути довшим за 50 символів',
            })
        }

        const updatedUser = await prisma.user.update({
            where: {
                id: req.user.id,
            },
            data: {
                name: name.trim(),
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

        return res.json({
            message: 'Профіль успішно оновлено',
            user: updatedUser,
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Помилка оновлення профілю',
            error: error.message,
        })
    }
}

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                message: 'Заповніть всі поля для зміни пароля',
            })
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                message: 'Новий пароль має містити мінімум 6 символів',
            })
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                message: 'Новий пароль і підтвердження не співпадають',
            })
        }

        const user = await prisma.user.findUnique({
            where: {
                id: req.user.id,
            },
        })

        if (!user) {
            return res.status(404).json({
                message: 'Користувача не знайдено',
            })
        }

        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)

        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                message: 'Поточний пароль введено неправильно',
            })
        }

        const isSamePassword = await bcrypt.compare(newPassword, user.password)

        if (isSamePassword) {
            return res.status(400).json({
                message: 'Новий пароль має відрізнятися від поточного',
            })
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)

        await prisma.user.update({
            where: {
                id: req.user.id,
            },
            data: {
                password: hashedPassword,
            },
        })

        return res.json({
            message: 'Пароль успішно змінено',
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Помилка зміни пароля',
            error: error.message,
        })
    }
}

module.exports = {
    updateProfile,
    changePassword,
}