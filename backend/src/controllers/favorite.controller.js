const prisma = require('../utils/prisma')

const getMyFavoriteStories = async (req, res) => {
    try {
        const favorites = await prisma.storyFavorite.findMany({
            where: {
                userId: req.user.id,
            },
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                story: {
                    include: {
                        category: true,
                        author: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                        images: true,
                        audio: true,
                    },
                },
            },
        })

        const stories = favorites
            .map((favorite) => favorite.story)
            .filter((story) => story && story.status === 'APPROVED')
            .map((story) => ({
                ...story,
                author: story.isAnonymous
                    ? {
                        name: 'Анонімно',
                    }
                    : story.author,
            }))

        return res.json({
            stories,
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Помилка отримання обраних історій',
            error: error.message,
        })
    }
}

const getFavoriteStatus = async (req, res) => {
    try {
        const { id } = req.params

        const favorite = await prisma.storyFavorite.findUnique({
            where: {
                storyId_userId: {
                    storyId: id,
                    userId: req.user.id,
                },
            },
        })

        return res.json({
            isFavorite: Boolean(favorite),
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Помилка перевірки обраного',
            error: error.message,
        })
    }
}

const addStoryToFavorites = async (req, res) => {
    try {
        const { id } = req.params

        const story = await prisma.story.findFirst({
            where: {
                id,
                status: 'APPROVED',
            },
            select: {
                id: true,
            },
        })

        if (!story) {
            return res.status(404).json({
                message: 'Історію не знайдено',
            })
        }

        const favorite = await prisma.storyFavorite.upsert({
            where: {
                storyId_userId: {
                    storyId: id,
                    userId: req.user.id,
                },
            },
            update: {},
            create: {
                storyId: id,
                userId: req.user.id,
            },
        })

        return res.status(201).json({
            message: 'Історію додано до обраного',
            favorite,
            isFavorite: true,
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Помилка додавання до обраного',
            error: error.message,
        })
    }
}

const removeStoryFromFavorites = async (req, res) => {
    try {
        const { id } = req.params

        const favorite = await prisma.storyFavorite.findUnique({
            where: {
                storyId_userId: {
                    storyId: id,
                    userId: req.user.id,
                },
            },
        })

        if (!favorite) {
            return res.status(404).json({
                message: 'Історії немає в обраному',
            })
        }

        await prisma.storyFavorite.delete({
            where: {
                id: favorite.id,
            },
        })

        return res.json({
            message: 'Історію видалено з обраного',
            isFavorite: false,
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Помилка видалення з обраного',
            error: error.message,
        })
    }
}

module.exports = {
    getMyFavoriteStories,
    getFavoriteStatus,
    addStoryToFavorites,
    removeStoryFromFavorites,
}