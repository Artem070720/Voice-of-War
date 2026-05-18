const prisma = require('../utils/prisma')

const allowedReasons = [
    'INAPPROPRIATE_CONTENT',
    'FALSE_INFORMATION',
    'OFFENSIVE_CONTENT',
    'COPYRIGHT',
    'SPAM',
    'OTHER',
]

const createStoryReport = async (req, res) => {
    try {
        const { id } = req.params
        const { reason, comment } = req.body

        if (!reason || !allowedReasons.includes(reason)) {
            return res.status(400).json({
                message: 'Оберіть коректну причину скарги',
            })
        }

        const story = await prisma.story.findUnique({
            where: { id },
        })

        if (!story || story.status !== 'APPROVED') {
            return res.status(404).json({
                message: 'Історію не знайдено',
            })
        }

        if (story.authorId === req.user.id) {
            return res.status(400).json({
                message: 'Ви не можете поскаржитися на власну історію',
            })
        }

        const existingReport = await prisma.storyReport.findUnique({
            where: {
                storyId_reporterId: {
                    storyId: id,
                    reporterId: req.user.id,
                },
            },
        })

        if (existingReport) {
            return res.status(409).json({
                message: 'Ви вже надсилали скаргу на цю історію',
            })
        }

        const report = await prisma.storyReport.create({
            data: {
                storyId: id,
                reporterId: req.user.id,
                reason,
                comment: comment?.trim() || null,
            },
            include: {
                story: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
        })

        return res.status(201).json({
            message: 'Скаргу успішно надіслано',
            report,
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Помилка створення скарги',
            error: error.message,
        })
    }
}

const getAdminReports = async (req, res) => {
    try {
        const {
            status,
            reason,
            search,
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

        if (reason) {
            where.reason = reason
        }

        if (search) {
            where.OR = [
                {
                    story: {
                        title: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                },
                {
                    story: {
                        content: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                },
                {
                    reporter: {
                        name: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                },
                {
                    reporter: {
                        email: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                },
            ]
        }

        const [reports, total] = await Promise.all([
            prisma.storyReport.findMany({
                where,
                skip,
                take: limitNumber,
                orderBy: {
                    createdAt: 'desc',
                },
                include: {
                    reporter: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    story: {
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
                    },
                },
            }),
            prisma.storyReport.count({ where }),
        ])

        return res.json({
            reports,
            pagination: {
                page: pageNumber,
                limit: limitNumber,
                total,
                pages: Math.ceil(total / limitNumber),
            },
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Помилка отримання скарг',
            error: error.message,
        })
    }
}

const markReportReviewed = async (req, res) => {
    try {
        const { id } = req.params

        const report = await prisma.storyReport.findUnique({
            where: { id },
        })

        if (!report) {
            return res.status(404).json({
                message: 'Скаргу не знайдено',
            })
        }

        const updatedReport = await prisma.storyReport.update({
            where: { id },
            data: {
                status: 'REVIEWED',
            },
            include: {
                reporter: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                story: true,
            },
        })

        return res.json({
            message: 'Скаргу позначено як розглянуту',
            report: updatedReport,
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Помилка оновлення скарги',
            error: error.message,
        })
    }
}

const rejectReport = async (req, res) => {
    try {
        const { id } = req.params

        const report = await prisma.storyReport.findUnique({
            where: { id },
        })

        if (!report) {
            return res.status(404).json({
                message: 'Скаргу не знайдено',
            })
        }

        const updatedReport = await prisma.storyReport.update({
            where: { id },
            data: {
                status: 'REJECTED',
            },
            include: {
                reporter: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                story: true,
            },
        })

        return res.json({
            message: 'Скаргу відхилено',
            report: updatedReport,
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Помилка відхилення скарги',
            error: error.message,
        })
    }
}

module.exports = {
    createStoryReport,
    getAdminReports,
    markReportReviewed,
    rejectReport,
}