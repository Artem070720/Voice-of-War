const express = require('express')

const {
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
} = require('../controllers/admin.controller')

const {
    authMiddleware,
    adminMiddleware,
} = require('../middlewares/auth.middleware')

const router = express.Router()

router.use(authMiddleware)
router.use(adminMiddleware)

router.get('/statistics', getStatistics)

router.get('/stories', getAdminStories)
router.get('/stories/pending', getPendingStories)
router.get('/stories/:id', getAdminStoryById)
router.patch('/stories/:id/approve', approveStory)
router.patch('/stories/:id/reject', rejectStory)
router.patch('/stories/:id/hide', hideStory)
router.delete('/stories/:id', deleteAdminStory)

router.get('/users', getAdminUsers)
router.patch('/users/:id/block', blockUser)
router.patch('/users/:id/unblock', unblockUser)
router.patch('/users/:id/role', changeUserRole)

module.exports = router