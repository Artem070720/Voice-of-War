const express = require('express')

const {
    getStories,
    getStoryById,
    getMyStories,
    getMyStoryById,
    createStory,
    updateStory,
    deleteStory,
} = require('../controllers/story.controller')

const { createStoryReport } = require('../controllers/report.controller')

const { authMiddleware } = require('../middlewares/auth.middleware')
const { uploadStoryFiles } = require('../middlewares/upload.middleware')

const router = express.Router()

router.get('/', getStories)

router.get('/my/list', authMiddleware, getMyStories)
router.get('/my/:id', authMiddleware, getMyStoryById)

router.get('/:id', getStoryById)

router.post('/', authMiddleware, uploadStoryFiles, createStory)
router.post('/:id/report', authMiddleware, createStoryReport)

router.patch('/:id', authMiddleware, uploadStoryFiles, updateStory)
router.delete('/:id', authMiddleware, deleteStory)

module.exports = router