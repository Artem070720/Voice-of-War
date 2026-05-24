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

const formatStory = (story) => {
    if (!story) return null

    return {
        ...story,
        author: story.isAnonymous
            ? {
                name: 'Анонімно',
            }
            : story.author,
    }
}

const getStories = async (req, res) => {
    try {
        const {
            search,
            categoryId,
            region,
            hasImages,
            hasAudio,
            sort = 'newest',
            page = 1,
            limit = 9,
        } = req.query

        const pageNumber = Math.max(Number(page), 1)
        const limitNumber = Math.min(Math.max(Number(limit), 1), 30)
        const skip = (pageNumber - 1) * limitNumber

        const where = {
            status: 'APPROVED',
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
                { region: { contains: search, mode: 'insensitive' } },
                { city: { contains: search, mode: 'insensitive' } },
            ]
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

        if (hasImages === 'true') {
            where.images = {
                some: {},
            }
        }

        if (hasAudio === 'true') {
            where.audio = {
                isNot: null,
            }
        }

        let orderBy = {
            publishedAt: 'desc',
        }

        if (sort === 'oldest') {
            orderBy = {
                publishedAt: 'asc',
            }
        }

        if (sort === 'eventDateAsc') {
            orderBy = {
                eventDate: 'asc',
            }
        }

        if (sort === 'eventDateDesc') {
            orderBy = {
                eventDate: 'desc',
            }
        }

        if (sort === 'popular') {
            orderBy = [
                {
                    viewsCount: 'desc',
                },
                {
                    publishedAt: 'desc',
                },
            ]
        }

        const [stories, total] = await Promise.all([
            prisma.story.findMany({
                where,
                orderBy,
                skip,
                take: limitNumber,
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
            prisma.story.count({ where }),
        ])

        return res.json({
            stories: stories.map(formatStory),
            pagination: {
                page: pageNumber,
                limit: limitNumber,
                total,
                pages: Math.ceil(total / limitNumber),
            },
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Помилка отримання історій',
            error: error.message,
        })
    }
}

const getStoryById = async (req, res) => {
    try {
        const { id } = req.params

        const story = await prisma.story.findFirst({
            where: {
                id,
                status: 'APPROVED',
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
        })

        if (!story) {
            return res.status(404).json({
                message: 'Історію не знайдено',
            })
        }

        return res.json({
            story: formatStory(story),
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Помилка отримання історії',
            error: error.message,
        })
    }
}

const incrementStoryView = async (req, res) => {
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

        const updatedStory = await prisma.story.update({
            where: {
                id,
            },
            data: {
                viewsCount: {
                    increment: 1,
                },
            },
            select: {
                id: true,
                viewsCount: true,
            },
        })

        return res.json({
            message: 'Перегляд зараховано',
            viewsCount: updatedStory.viewsCount,
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Помилка оновлення кількості переглядів',
            error: error.message,
        })
    }
}

const getRelatedStories = async (req, res) => {
    try {
        const { id } = req.params

        const story = await prisma.story.findFirst({
            where: {
                id,
                status: 'APPROVED',
            },
            select: {
                id: true,
                categoryId: true,
                region: true,
            },
        })

        if (!story) {
            return res.status(404).json({
                message: 'Історію не знайдено',
            })
        }

        const byCategory = await prisma.story.findMany({
            where: {
                id: {
                    not: id,
                },
                status: 'APPROVED',
                categoryId: story.categoryId,
            },
            take: 3,
            orderBy: [
                {
                    viewsCount: 'desc',
                },
                {
                    publishedAt: 'desc',
                },
            ],
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
        })

        let relatedStories = byCategory

        if (relatedStories.length < 3) {
            const existingIds = relatedStories.map((item) => item.id)

            const byRegion = await prisma.story.findMany({
                where: {
                    id: {
                        notIn: [id, ...existingIds],
                    },
                    status: 'APPROVED',
                    region: {
                        equals: story.region,
                        mode: 'insensitive',
                    },
                },
                take: 3 - relatedStories.length,
                orderBy: [
                    {
                        viewsCount: 'desc',
                    },
                    {
                        publishedAt: 'desc',
                    },
                ],
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
            })

            relatedStories = [...relatedStories, ...byRegion]
        }

        return res.json({
            stories: relatedStories.map(formatStory),
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Помилка отримання схожих історій',
            error: error.message,
        })
    }
}

const getMyStories = async (req, res) => {
    try {
        const stories = await prisma.story.findMany({
            where: {
                authorId: req.user.id,
            },
            orderBy: {
                createdAt: 'desc',
            },
            include: {
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
            message: 'Помилка отримання ваших історій',
            error: error.message,
        })
    }
}

const getMyStoryById = async (req, res) => {
    try {
        const { id } = req.params

        const story = await prisma.story.findUnique({
            where: { id },
            include: {
                category: true,
                images: true,
                audio: true,
            },
        })

        if (!story) {
            return res.status(404).json({
                message: 'Історію не знайдено',
            })
        }

        if (story.authorId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({
                message: 'Ви не можете переглядати цю історію',
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

const createStory = async (req, res) => {
    try {
        const {
            title,
            content,
            region,
            city,
            eventDate,
            isAnonymous,
            categoryId,
        } = req.body

        if (!title || !content || !region || !categoryId) {
            return res.status(400).json({
                message: 'Заповніть назву, текст історії, регіон та категорію',
            })
        }

        const category = await prisma.category.findUnique({
            where: {
                id: categoryId,
            },
        })

        if (!category) {
            return res.status(404).json({
                message: 'Категорію не знайдено',
            })
        }

        const imageFiles = req.files?.images || []
        const audioFile = req.files?.audio?.[0] || null

        const story = await prisma.story.create({
            data: {
                title: title.trim(),
                content: content.trim(),
                region: region.trim(),
                city: city?.trim() || null,
                eventDate: eventDate ? new Date(eventDate) : null,
                isAnonymous: isAnonymous === 'true' || isAnonymous === true,
                status: 'APPROVED',
                publishedAt: new Date(),
                authorId: req.user.id,
                categoryId,
                images: {
                    create: imageFiles.map((file) => ({
                        imageUrl: `uploads/images/${file.filename}`,
                    })),
                },
                audio: audioFile
                    ? {
                        create: {
                            audioUrl: `uploads/audio/${audioFile.filename}`,
                        },
                    }
                    : undefined,
            },
            include: {
                category: true,
                images: true,
                audio: true,
            },
        })

        return res.status(201).json({
            message: 'Історію успішно опубліковано',
            story,
        })
    } catch (error) {
        const imageFiles = req.files?.images || []
        const audioFile = req.files?.audio?.[0] || null

        imageFiles.forEach((file) => {
            deleteFile(`uploads/images/${file.filename}`)
        })

        if (audioFile) {
            deleteFile(`uploads/audio/${audioFile.filename}`)
        }

        return res.status(500).json({
            message: 'Помилка створення історії',
            error: error.message,
        })
    }
}

const updateStory = async (req, res) => {
    const imageFiles = req.files?.images || []
    const audioFile = req.files?.audio?.[0] || null

    try {
        const { id } = req.params

        const {
            title,
            content,
            region,
            city,
            eventDate,
            isAnonymous,
            categoryId,
            replaceImages,
            replaceAudio,
        } = req.body

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

        if (story.authorId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({
                message: 'Ви не можете редагувати цю історію',
            })
        }

        if (!title || !content || !region || !categoryId) {
            return res.status(400).json({
                message: 'Заповніть назву, текст історії, регіон та категорію',
            })
        }

        const category = await prisma.category.findUnique({
            where: {
                id: categoryId,
            },
        })

        if (!category) {
            return res.status(404).json({
                message: 'Категорію не знайдено',
            })
        }

        if (replaceImages === 'true') {
            story.images.forEach((image) => {
                deleteFile(image.imageUrl)
            })

            await prisma.storyImage.deleteMany({
                where: {
                    storyId: id,
                },
            })
        }

        if (replaceAudio === 'true' && story.audio) {
            deleteFile(story.audio.audioUrl)

            await prisma.storyAudio.delete({
                where: {
                    storyId: id,
                },
            })
        }

        await prisma.story.update({
            where: { id },
            data: {
                title: title.trim(),
                content: content.trim(),
                region: region.trim(),
                city: city?.trim() || null,
                eventDate: eventDate ? new Date(eventDate) : null,
                isAnonymous: isAnonymous === 'true' || isAnonymous === true,
                categoryId,
                status: 'APPROVED',
                rejectionReason: null,
                publishedAt: story.publishedAt || new Date(),
            },
        })

        if (replaceImages === 'true' && imageFiles.length > 0) {
            await prisma.storyImage.createMany({
                data: imageFiles.map((file) => ({
                    storyId: id,
                    imageUrl: `uploads/images/${file.filename}`,
                })),
            })
        }

        if (replaceAudio === 'true' && audioFile) {
            await prisma.storyAudio.create({
                data: {
                    storyId: id,
                    audioUrl: `uploads/audio/${audioFile.filename}`,
                },
            })
        }

        const updatedStory = await prisma.story.findUnique({
            where: { id },
            include: {
                category: true,
                images: true,
                audio: true,
            },
        })

        return res.json({
            message: 'Історію успішно оновлено',
            story: updatedStory,
        })
    } catch (error) {
        imageFiles.forEach((file) => {
            deleteFile(`uploads/images/${file.filename}`)
        })

        if (audioFile) {
            deleteFile(`uploads/audio/${audioFile.filename}`)
        }

        return res.status(500).json({
            message: 'Помилка оновлення історії',
            error: error.message,
        })
    }
}

const deleteStory = async (req, res) => {
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

        if (story.authorId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({
                message: 'Ви не можете видалити цю історію',
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
            message: 'Історію успішно видалено',
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Помилка видалення історії',
            error: error.message,
        })
    }
}

module.exports = {
    getStories,
    getStoryById,
    incrementStoryView,
    getMyStories,
    getMyStoryById,
    getRelatedStories,
    createStory,
    updateStory,
    deleteStory,
}