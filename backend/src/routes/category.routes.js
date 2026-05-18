const express = require('express')

const {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
} = require('../controllers/category.controller')

const {
    authMiddleware,
    adminMiddleware,
} = require('../middlewares/auth.middleware')

const router = express.Router()

router.get('/', getCategories)
router.get('/:id', getCategoryById)

router.post('/', authMiddleware, adminMiddleware, createCategory)
router.patch('/:id', authMiddleware, adminMiddleware, updateCategory)
router.delete('/:id', authMiddleware, adminMiddleware, deleteCategory)

module.exports = router