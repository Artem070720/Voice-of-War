const prisma = require('../utils/prisma')

const getHomeData = async (req, res) => {
    try {
        const [
            storiesCount,
            authorsCount,
            categoriesCount,
            imagesCount,
            audioCount,
            latestStories,
            categories,
        ] = await Promise.all([
            prisma.story.count({
                where: {
                    status: 'APPROVED',
                },
            }),

            prisma.user.count({
                where: {
                    stories: {
                        some: {
                            status: 'APPROVED',
                        },
                    },
                },
            }),

            prisma.category.count(),

            prisma.storyImage.count({
                where: {
                    story: {
                        status: 'APPROVED',
                    },
                },
            }),

            prisma.storyAudio.count({
                where: {
                    story: {
                        status: 'APPROVED',
                    },
                },
            }),

            prisma.story.findMany({
                where: {
                    status: 'APPROVED',
                },
                take: 3,
                orderBy: {
                    publishedAt: 'desc',
                },
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
            }),

            prisma.category.findMany({
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
            }),
        ])

        const formattedLatestStories = latestStories.map((story) => ({
            ...story,
            author: story.isAnonymous
                ? {
                    name: 'Анонімно',
                }
                : story.author,
        }))

        return res.json({
            statistics: {
                storiesCount,
                authorsCount,
                categoriesCount,
                imagesCount,
                audioCount,
            },
            latestStories: formattedLatestStories,
            categories,
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Помилка отримання даних головної сторінки',
            error: error.message,
        })
    }
}

module.exports = {
    getHomeData,
}