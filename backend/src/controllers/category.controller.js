const prisma = require('../utils/prisma')

const getCategories = async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            orderBy: {
                createdAt: 'asc',
            },
            include: {
                _count: {
                    select: {
                        stories: true,
                    },
                },
            },
        })

        return res.json({
            categories,
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Помилка отримання категорій',
            error: error.message,
        })
    }
}

const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params

        const category = await prisma.category.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        stories: true,
                    },
                },
            },
        })

        if (!category) {
            return res.status(404).json({
                message: 'Категорію не знайдено',
            })
        }

        return res.json({
            category,
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Помилка отримання категорії',
            error: error.message,
        })
    }
}

const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: 'Назва категорії є обов’язковою',
            })
        }

        const existingCategory = await prisma.category.findUnique({
            where: {
                name: name.trim(),
            },
        })

        if (existingCategory) {
            return res.status(409).json({
                message: 'Категорія з такою назвою вже існує',
            })
        }

        const category = await prisma.category.create({
            data: {
                name: name.trim(),
                description: description?.trim() || null,
            },
        })

        return res.status(201).json({
            message: 'Категорію успішно створено',
            category,
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Помилка створення категорії',
            error: error.message,
        })
    }
}

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params
        const { name, description } = req.body

        const category = await prisma.category.findUnique({
            where: { id },
        })

        if (!category) {
            return res.status(404).json({
                message: 'Категорію не знайдено',
            })
        }

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: 'Назва категорії є обов’язковою',
            })
        }

        const existingCategory = await prisma.category.findFirst({
            where: {
                name: name.trim(),
                NOT: {
                    id,
                },
            },
        })

        if (existingCategory) {
            return res.status(409).json({
                message: 'Категорія з такою назвою вже існує',
            })
        }

        const updatedCategory = await prisma.category.update({
            where: { id },
            data: {
                name: name.trim(),
                description: description?.trim() || null,
            },
        })

        return res.json({
            message: 'Категорію успішно оновлено',
            category: updatedCategory,
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Помилка оновлення категорії',
            error: error.message,
        })
    }
}

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params

        const category = await prisma.category.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        stories: true,
                    },
                },
            },
        })

        if (!category) {
            return res.status(404).json({
                message: 'Категорію не знайдено',
            })
        }

        if (category._count.stories > 0) {
            return res.status(400).json({
                message: 'Неможливо видалити категорію, оскільки до неї прив’язані історії',
            })
        }

        await prisma.category.delete({
            where: { id },
        })

        return res.json({
            message: 'Категорію успішно видалено',
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Помилка видалення категорії',
            error: error.message,
        })
    }
}

module.exports = {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
}