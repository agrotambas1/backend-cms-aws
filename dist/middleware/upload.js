"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMedia = exports.createUploadMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const fs_1 = __importDefault(require("fs"));
const ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "video/mp4",
    "video/webm",
    "application/pdf",
];
const getUploadPath = (module) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const uploadPath = path_1.default.join("uploads", module, String(year), month);
    if (!fs_1.default.existsSync(uploadPath)) {
        fs_1.default.mkdirSync(uploadPath, { recursive: true });
    }
    return uploadPath;
};
const createStorage = (module) => {
    return multer_1.default.diskStorage({
        destination: (_req, _file, cb) => {
            const uploadPath = getUploadPath(module);
            cb(null, uploadPath);
        },
        filename: (_req, file, cb) => {
            const ext = path_1.default.extname(file.originalname);
            const filename = `${(0, uuid_1.v4)()}${ext}`;
            cb(null, filename);
        },
    });
};
const fileFilter = (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error(`File type ${file.mimetype} is not allowed`));
    }
};
const createUploadMiddleware = (module) => {
    return (0, multer_1.default)({
        storage: createStorage(module),
        limits: {
            fileSize: 10 * 1024 * 1024,
        },
        fileFilter,
    });
};
exports.createUploadMiddleware = createUploadMiddleware;
exports.uploadMedia = (0, exports.createUploadMiddleware)("media");
// import multer from "multer";
// import { PutObjectCommand } from "@aws-sdk/client-s3";
// import { v4 as uuid } from "uuid";
// import { Request, Response, NextFunction } from "express";
// import { s3 } from "../config/s3";
// const ALLOWED_MIME_TYPES = [
//   "image/jpeg",
//   "image/jpg",
//   "image/png",
//   "image/gif",
//   "image/webp",
//   "video/mp4",
//   "video/webm",
//   "application/pdf",
// ];
// const memoryStorage = multer.memoryStorage();
// const fileFilter = (
//   _req: Request,
//   file: Express.Multer.File,
//   cb: multer.FileFilterCallback,
// ) => {
//   if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error(`File type ${file.mimetype} is not allowed`));
//   }
// };
// const multerUpload = multer({
//   storage: memoryStorage,
//   limits: { fileSize: 10 * 1024 * 1024 },
//   fileFilter,
// });
// const uploadToS3 = (module: string) => {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     if (!req.file) return next();
//     const now = new Date();
//     const year = now.getFullYear();
//     const month = String(now.getMonth() + 1).padStart(2, "0");
//     const ext = req.file.originalname.split(".").pop();
//     const key = `uploads/${module}/${year}/${month}/${uuid()}.${ext}`;
//     try {
//       await s3.send(
//         new PutObjectCommand({
//           Bucket: process.env.AWS_BUCKET_NAME!,
//           Key: key,
//           Body: req.file.buffer,
//           ContentType: req.file.mimetype,
//         }),
//       );
//       (req.file as any).s3Key = key;
//       (req.file as any).s3Url =
//         `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
//       next();
//     } catch (error) {
//       next(error);
//     }
//   };
// };
// export const createUploadMiddleware = (module: string) => {
//   return [multerUpload.single("file"), uploadToS3(module)];
// };
// export const uploadInsight = createUploadMiddleware("insights");
// export const uploadEvent = createUploadMiddleware("events");
// export const uploadPortfolio = createUploadMiddleware("portfolios");
// export const uploadMedia = createUploadMiddleware("media");
//# sourceMappingURL=upload.js.map