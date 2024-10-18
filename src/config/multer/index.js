import multer, { diskStorage } from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../cloudinary/index.js';

// Cấu hình lưu trữ của Cloudinary
const cloudinaryStorageConfig = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'courses',
        allowed_formats: ['jpg', 'png', 'jpeg'],
    },
});

// Cấu hình lưu trữ trên đĩa
const diskStorageConfig = new diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})

export const uploadCloud = multer({ storage: cloudinaryStorageConfig });
export const uploadDisk = multer({ storage: diskStorageConfig })
