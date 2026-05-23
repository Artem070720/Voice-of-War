const prisma = require('../utils/prisma')

const getStoryComments = async (req, res) => {
    try {
        const { storyId } = req.params

        const story = await prisma.story.findFirst({
            where: {
                id: storyId,
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

        const comments = await prisma.storyComment.findMany({
            where: {
                storyId,
            },
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                    },
                },
            },
        })

        return res.json({
            comments,
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Помилка отримання коментарів',
            error: error.message,
        })
    }
}

const createStoryComment = async (req, res) => {
    try {
        const { storyId } = req.params
        const { content } = req.body

        if (!content || !content.trim()) {
            return res.status(400).json({
                message: 'Введіть текст коментаря',
            })
        }

        if (content.trim().length < 2) {
            return res.status(400).json({
                message: 'Коментар має містити мінімум 2 символи',
            })
        }

        if (content.trim().length > 1000) {
            return res.status(400).json({
                message: 'Коментар не може бути довшим за 1000 символів',
            })
        }

        const story = await prisma.story.findFirst({
            where: {
                id: storyId,
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

        const comment = await prisma.storyComment.create({
            data: {
                storyId,
                authorId: req.user.id,
                content: content.trim(),
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                    },
                },
            },
        })

        return res.status(201).json({
            message: 'Коментар успішно додано',
            comment,
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Помилка створення коментаря',
            error: error.message,
        })
    }
}

const deleteStoryComment = async (req, res) => {
    try {
        const { storyId, commentId } = req.params

        const comment = await prisma.storyComment.findUnique({
            where: {
                id: commentId,
            },
            include: {
                story: {
                    select: {
                        id: true,
                        authorId: true,
                    },
                },
            },
        })

        if (!comment || comment.storyId !== storyId) {
            return res.status(404).json({
                message: 'Коментар не знайдено',
            })
        }

        const isCommentAuthor = comment.authorId === req.user.id
        const isStoryOwner = comment.story.authorId === req.user.id
        const isAdmin = req.user.role === 'ADMIN'

        if (!isCommentAuthor && !isStoryOwner && !isAdmin) {
            return res.status(403).json({
                message: 'Ви не можете видалити цей коментар',
            })
        }

        await prisma.storyComment.delete({
            where: {
                id: commentId,
            },
        })

        return res.json({
            message: 'Коментар успішно видалено',
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Помилка видалення коментаря',
            error: error.message,
        })
    }
}

module.exports = {
    getStoryComments,
    createStoryComment,
    deleteStoryComment,
}