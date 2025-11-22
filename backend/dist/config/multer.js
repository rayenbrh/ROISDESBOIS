"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFields = exports.uploadMultiple = exports.uploadSingle = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Ensure upload directories exist
const ensureUploadDirs = () => {
    const dirs = [
        'uploads/products',
        'uploads/subproducts',
        'uploads/composites',
        'uploads/logos',
        'uploads/temp'
    ];
    dirs.forEach((dir) => {
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
    });
};
ensureUploadDirs();
// Storage configuration
const storage = multer_1.default.diskStorage({
    destination: (req, _file, cb) => {
        const uploadType = req.body.uploadType || 'temp';
        let uploadPath = 'uploads/temp';
        switch (uploadType) {
            case 'product':
                uploadPath = 'uploads/products';
                break;
            case 'subproduct':
                uploadPath = 'uploads/subproducts';
                break;
            case 'composite':
                uploadPath = 'uploads/composites';
                break;
            case 'logo':
                uploadPath = 'uploads/logos';
                break;
        }
        cb(null, uploadPath);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path_1.default.extname(file.originalname);
        const name = path_1.default.basename(file.originalname, ext).replace(/\s+/g, '-');
        cb(null, `${name}-${uniqueSuffix}${ext}`);
    }
});
// File filter
const fileFilter = (_req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
    }
};
// Multer configuration
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB default
    }
});
// Single file upload
const uploadSingle = (fieldName) => exports.upload.single(fieldName);
exports.uploadSingle = uploadSingle;
// Multiple files upload
const uploadMultiple = (fieldName, maxCount = 10) => exports.upload.array(fieldName, maxCount);
exports.uploadMultiple = uploadMultiple;
// Fields upload
const uploadFields = (fields) => exports.upload.fields(fields);
exports.uploadFields = uploadFields;
//# sourceMappingURL=multer.js.map