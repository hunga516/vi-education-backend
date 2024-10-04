import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../cloudinary/index.js'; // Sửa đổi đường dẫn nhập

// Cấu hình lưu trữ của Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'courses', // Thư mục trên Cloudinary để lưu ảnh
        allowed_formats: ['jpg', 'png', 'jpeg'], // Các định dạng cho phép
    },
});

// Cấu hình Multer sử dụng CloudinaryStorage
const upload = multer({ storage });

export default upload;
