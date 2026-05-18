const multer = require('multer')
const path = require('path')
const fs = require('fs')

const imagesDir = path.join(__dirname, '../../uploads/images')
const audioDir = path.join(__dirname, '../../uploads/audio')

if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true })
}

if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true })
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'images') {
            cb(null, imagesDir)
        } else if (file.fieldname === 'audio') {
            cb(null, audioDir)
        } else {
            cb(new Error('Невідоме поле файлу'), null)
        }
    },

    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`
        cb(null, uniqueName)
    },
})

const fileFilter = (req, file, cb) => {
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const allowedAudioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/mp4', 'audio/m4a']

    if (file.fieldname === 'images' && allowedImageTypes.includes(file.mimetype)) {
        return cb(null, true)
    }

    if (file.fieldname === 'audio' && allowedAudioTypes.includes(file.mimetype)) {
        return cb(null, true)
    }

    return cb(new Error('Недопустимий тип файлу'), false)
}

const uploadStoryFiles = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 30 * 1024 * 1024,
    },
}).fields([
    { name: 'images', maxCount: 5 },
    { name: 'audio', maxCount: 1 },
])

module.exports = {
    uploadStoryFiles,
}