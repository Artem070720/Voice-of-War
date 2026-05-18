const fs = require('fs')
const path = require('path')
const prisma = require('../utils/prisma')

const deleteFile = (filePath) => {
    if (!filePath) return

    const fullPath = path.join(__dirname, '../../', filePath)

    if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath)
    }
}

const getStatistics = async (req, res) => {
    try {
        const [
            usersCount,
            activeUsersCount,
            blockedUsersCount,
            storiesCount,
            pendingStoriesCount,
            approvedStoriesCount,
            rejectedStoriesCount,
            hiddenStoriesCount,
            categoriesCount,
            imagesCount,
            audioCount,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { status: 'ACTIVE' } }),
            prisma.user.count({ where: { status: 'BLOCKED' } }),
            prisma.story.count(),
            prisma.story.count({ where: { status: 'PENDING' } }),
            prisma.story.count({ where: { status: 'APPROVED' } }),
            prisma.story.count({ where: { status: 'REJECTED' } }),
            prisma.story.count({ where: { status: 'HIDDEN' } }),
            prisma.category.count(),
            prisma.storyImage.count(),
            prisma.storyAudio.count(),
        ])

        const latestStories = await prisma.story.findMany({
            take: 5,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                category: true,
            },
        })

        return res.json({
            statistics: {
                usersCount,
                activeUsersCount,
                blockedUsersCount,
                storiesCount,
                pendingStoriesCount,
                approvedStoriesCount,
                rejectedStoriesCount,
                hiddenStoriesCount,
                categoriesCount,
                imagesCount,
                audioCount,
            },
            latestStories,
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Помилка отримання статистики',
            error: error.message,
        })
    }
}

const getAdminStories = async (req, res) => {
    try {
        const {
            status,
            search,
            categoryId,
            region,
            page = 1,
            limit = 10,
        } = req.query

        const pageNumber = Math.max(Number(page), 1)
        const limitNumber = Math.min(Math.max(Number(limit), 1), 50)
        const skip = (pageNumber - 1) * limitNumber

        const where = {}

        if (status) {
            where.status = status
        }

        if (categoryId) {
            where.categoryId = categoryId
        }

        if (region) {
            where.region = {
                contains: region,
                mode: 'insensitive',
            }
        }

        if (search) {
            where.OR = [
                {
                    title: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
                {
                    content: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
                {
                    region: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
                {
                    city: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
                {
                    author: {
                        name: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                },
                {
                    author: {
                        email: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                },
            ]
        }

        const [stories, total] = await Promise.all([
            prisma.story.findMany({
                where,
                skip,
                take: limitNumber,
                orderBy: {
                    createdAt: 'desc',
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            status: true,
                        },
                    },
                    category: true,
                    images: true,
                    audio: true,
                },
            }),
            prisma.story.count({ where }),
        ])

        return res.json({
            stories,
            pagination: {
                page: pageNumber,
                limit: limitNumber,
                total,
                pages: Math.ceil(total / limitNumber),
            },
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Помилка отримання історій для адміністратора',
            error: error.message,
        })
    }
}

const getPendingStories = async (req, res) => {
    try {
        const stories = await prisma.story.findMany({
            where: {
                status: 'PENDING',
            },
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        status: true,
                    },
                },
                category: true,
                images: true,
                audio: true,
            },
        })

        return res.json({
            stories,
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Помилка отримання історій на модерації',
            error: error.message,
        })
    }
}

const getAdminStoryById = async (req, res) => {
    try {
        const { id } = req.params

        const story = await prisma.story.findUnique({
            where: { id },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        status: true,
                        createdAt: true,
                    },
                },
                category: true,
                images: true,
                audio: true,
                moderationLogs: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                    include: {
                        admin: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        })

        if (!story) {
            return res.status(404).json({
                message: 'Історію не знайдено',
            })
        }

        return res.json({
            story,
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Помилка отримання історії',
            error: error.message,
        })
    }
}

const approveStory = async (req, res) => {
    try {
        const { id } = req.params
        const { comment } = req.body

        const story = await prisma.story.findUnique({
            where: { id },
        })

        if (!story) {
            return res.status(404).json({
                message: 'Історію не знайдено',
            })
        }

        const updatedStory = await prisma.story.update({
            where: { id },
            data: {
                status: 'APPROVED',
                rejectionReason: null,
                publishedAt: new Date(),
                moderationLogs: {
                    create: {
                        adminId: req.user.id,
                        action: 'APPROVE',
                        comment: comment?.trim() || 'Історію опубліковано',
                    },
                },
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                category: true,
                images: true,
                audio: true,
            },
        })

        return res.json({
            message: 'Історію успішно опубліковано',
            story: updatedStory,
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Помилка публікації історії',
            error: error.message,
        })
    }
}

const rejectStory = async (req, res) => {
    try {
        const { id } = req.params
        const { reason } = req.body

        const story = await prisma.story.findUnique({
            where: { id },
        })

        if (!story) {
            return res.status(404).json({
                message: 'Історію не знайдено',
            })
        }

        if (!reason || !reason.trim()) {
            return res.status(400).json({
                message: 'Вкажіть причину відхилення історії',
            })
        }

        const updatedStory = await prisma.story.update({
            where: { id },
            data: {
                status: 'REJECTED',
                rejectionReason: reason.trim(),
                publishedAt: null,
                moderationLogs: {
                    create: {
                        adminId: req.user.id,
                        action: 'REJECT',
                        comment: reason.trim(),
                    },
                },
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                category: true,
                images: true,
                audio: true,
            },
        })

        return res.json({
            message: 'Історію відхилено',
            story: updatedStory,
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Помилка відхилення історії',
            error: error.message,
        })
    }
}

const hideStory = async (req, res) => {
    try {
        const { id } = req.params
        const { comment } = req.body

        const story = await prisma.story.findUnique({
            where: { id },
        })

        if (!story) {
            return res.status(404).json({
                message: 'Історію не знайдено',
            })
        }

        const updatedStory = await prisma.story.update({
            where: { id },
            data: {
                status: 'HIDDEN',
                publishedAt: null,
                moderationLogs: {
                    create: {
                        adminId: req.user.id,
                        action: 'HIDE',
                        comment: comment?.trim() || 'Історію приховано адміністратором',
                    },
                },
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                category: true,
                images: true,
                audio: true,
            },
        })

        return res.json({
            message: 'Історію приховано',
            story: updatedStory,
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Помилка приховування історії',
            error: error.message,
        })
    }
}

const deleteAdminStory = async (req, res) => {
    try {
        const { id } = req.params

        const story = await prisma.story.findUnique({
            where: { id },
            include: {
                images: true,
                audio: true,
            },
        })

        if (!story) {
            return res.status(404).json({
                message: 'Історію не знайдено',
            })
        }

        story.images.forEach((image) => {
            deleteFile(image.imageUrl)
        })

        if (story.audio) {
            deleteFile(story.audio.audioUrl)
        }

        await prisma.story.delete({
            where: { id },
        })

        return res.json({
            message: 'Історію успішно видалено адміністратором',
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Помилка видалення історії',
            error: error.message,
        })
    }
}

const getAdminUsers = async (req, res) => {
    try {
        const { search, status, role, page = 1, limit = 10 } = req.query

        const pageNumber = Math.max(Number(page), 1)
        const limitNumber = Math.min(Math.max(Number(limit), 1), 50)
        const skip = (pageNumber - 1) * limitNumber

        const where = {}

        if (status) {
            where.status = status
        }

        if (role) {
            where.role = role
        }

        if (search) {
            where.OR = [
                {
                    name: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
                {
                    email: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
            ]
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: limitNumber,
                orderBy: {
                    createdAt: 'desc',
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true,
                    _count: {
                        select: {
                            stories: true,
                        },
                    },
                },
            }),
            prisma.user.count({ where }),
        ])

        return res.json({
            users,
            pagination: {
                page: pageNumber,
                limit: limitNumber,
                total,
                pages: Math.ceil(total / limitNumber),
            },
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Помилка отримання користувачів',
            error: error.message,
        })
    }
}

const blockUser = async (req, res) => {
    try {
        const { id } = req.params

        if (id === req.user.id) {
            return res.status(400).json({
                message: 'Адміністратор не може заблокувати сам себе',
            })
        }

        const user = await prisma.user.findUnique({
            where: { id },
        })

        if (!user) {
            return res.status(404).json({
                message: 'Користувача не знайдено',
            })
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                status: 'BLOCKED',
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
            },
        })

        return res.json({
            message: 'Користувача заблоковано',
            user: updatedUser,
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Помилка блокування користувача',
            error: error.message,
        })
    }
}

const unblockUser = async (req, res) => {
    try {
        const { id } = req.params

        const user = await prisma.user.findUnique({
            where: { id },
        })

        if (!user) {
            return res.status(404).json({
                message: 'Користувача не знайдено',
            })
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                status: 'ACTIVE',
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
            },
        })

        return res.json({
            message: 'Користувача розблоковано',
            user: updatedUser,
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Помилка розблокування користувача',
            error: error.message,
        })
    }
}

const changeUserRole = async (req, res) => {
    try {
        const { id } = req.params
        const { role } = req.body

        if (!['USER', 'ADMIN'].includes(role)) {
            return res.status(400).json({
                message: 'Некоректна роль користувача',
            })
        }

        const user = await prisma.user.findUnique({
            where: { id },
        })

        if (!user) {
            return res.status(404).json({
                message: 'Користувача не знайдено',
            })
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                role,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
            },
        })

        return res.json({
            message: 'Роль користувача оновлено',
            user: updatedUser,
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Помилка зміни ролі користувача',
            error: error.message,
        })
    }
}

module.exports = {
    getStatistics,
    getAdminStories,
    getPendingStories,
    getAdminStoryById,
    approveStory,
    rejectStory,
    hideStory,
    deleteAdminStory,
    getAdminUsers,
    blockUser,
    unblockUser,
    changeUserRole,
}