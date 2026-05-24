const express = require('express')

const {
    getStories,
    getStoryById,
    incrementStoryView,
    getMyStories,
    getMyStoryById,
    getRelatedStories,
    createStory,
    updateStory,
    deleteStory,
} = require('../controllers/story.controller')

const { createStoryReport } = require('../controllers/report.controller')

const {
    getStoryComments,
    createStoryComment,
    deleteStoryComment,
} = require('../controllers/comment.controller')

const {
    getMyFavoriteStories,
    getFavoriteStatus,
    addStoryToFavorites,
    removeStoryFromFavorites,
} = require('../controllers/favorite.controller')

const { authMiddleware } = require('../middlewares/auth.middleware')
const { uploadStoryFiles } = require('../middlewares/upload.middleware')

const router = express.Router()

router.get('/', getStories)

router.get('/my/list', authMiddleware, getMyStories)
router.get('/my/:id', authMiddleware, getMyStoryById)

router.get('/favorites/list', authMiddleware, getMyFavoriteStories)

router.get('/:storyId/comments', getStoryComments)
router.post('/:storyId/comments', authMiddleware, createStoryComment)
router.delete('/:storyId/comments/:commentId', authMiddleware, deleteStoryComment)

router.get('/:id/favorite', authMiddleware, getFavoriteStatus)
router.post('/:id/favorite', authMiddleware, addStoryToFavorites)
router.delete('/:id/favorite', authMiddleware, removeStoryFromFavorites)

router.get('/:id/related', getRelatedStories)
router.get('/:id', getStoryById)

router.post('/', authMiddleware, uploadStoryFiles, createStory)
router.post('/:id/view', incrementStoryView)
router.post('/:id/report', authMiddleware, createStoryReport)

router.patch('/:id', authMiddleware, uploadStoryFiles, updateStory)
router.delete('/:id', authMiddleware, deleteStory)

module.exports = router