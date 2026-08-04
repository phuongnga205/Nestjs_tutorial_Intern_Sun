import { diskStorage } from 'multer';
import { extname } from 'path';

export const multerOptions = {
    // Cấu hình nơi lưu trữ
    storage: diskStorage({
        // Đường dẫn trỏ tới thư mục uploads 
        destination: './public/uploads',

        // Quy tắc đổi tên file
        filename: (req, file, cb) => {
            // 1. Lấy đuôi file (.jpg, .png)
            const extension = extname(file.originalname);

            // 2. Tạo một chuỗi ngẫu nhiên + thời gian hiện tại để tên file duy nhất
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);

            // 3. Ghép lại thành tên mới (avatar-169123456789-123456.jpg)
            cb(null, `avatar-${uniqueSuffix}${extension}`);
        },
    }),

    // Chặn không cho upload các file nguy hiểm (như .exe, .sh), chỉ cho phép file ảnh
    fileFilter: (req, file, cb) => {
        const ext = extname(file.originalname).toLowerCase();
        // Postman đôi khi gửi mimetype là application/octet-stream nên ta kiểm tra cả extension
        if (file.mimetype.match(/^image\//) || file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/i) || ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
            cb(null, true); // Cho phép qua
        } else {
            cb(new Error(`Chỉ chấp nhận file ảnh! (Nhận được: ${file.mimetype} - ${ext})`), false); // Chặn lại và báo lỗi kèm thông tin
        }
    },

    // Giới hạn dung lượng file tối đa là 5MB để tránh bị nhồi data sập server
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
};