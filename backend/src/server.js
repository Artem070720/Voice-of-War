const express = require('express')
const cors = require('cors')
const path = require('path')
require('dotenv').config()

const prisma = require('./utils/prisma')
const authRoutes = require('./routes/auth.routes')
const categoryRoutes = require('./routes/category.routes')
const storyRoutes = require('./routes/story.routes')
const adminRoutes = require('./routes/admin.routes')
const publicRoutes = require('./routes/public.routes')
const profileRoutes = require('./routes/profile.routes')

const app = express()

const allowedOrigins = [
    'http://localhost:3000',
    process.env.CLIENT_URL,
].filter(Boolean)

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true)
            }

            return callback(new Error('Not allowed by CORS'))
        },
        credentials: true,
    })
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

app.use('/api/public', publicRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/stories', storyRoutes)
app.use('/api/admin', adminRoutes)

app.get('/', (req, res) => {
    res.json({
        message: 'Voice of War API is running',
    })
})

app.get('/db-test', async (req, res) => {
    try {
        const users = await prisma.user.findMany()

        res.json({
            message: 'Database connection works',
            users,
        })
    } catch (error) {
        res.status(500).json({
            message: 'Database connection error',
            error: error.message,
        })
    }
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})