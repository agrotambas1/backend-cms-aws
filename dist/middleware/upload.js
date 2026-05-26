"use strict";
// import multer from "multer";
// import path from "path";
// import { v4 as uuid } from "uuid";
// import { Request } from "express";
// import fs from "fs";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMedia = exports.uploadPortfolio = exports.uploadEvent = exports.uploadInsight = exports.createUploadMiddleware = void 0;
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
// const getUploadPath = (module: string): string => {
//   const now = new Date();
//   const year = now.getFullYear();
//   const month = String(now.getMonth() + 1).padStart(2, "0");
//   const uploadPath = path.join("uploads", module, String(year), month);
//   if (!fs.existsSync(uploadPath)) {
//     fs.mkdirSync(uploadPath, { recursive: true });
//   }
//   return uploadPath;
// };
// const createStorage = (module: string) => {
//   return multer.diskStorage({
//     destination: (_req, _file, cb) => {
//       const uploadPath = getUploadPath(module);
//       cb(null, uploadPath);
//     },
//     filename: (_req, file, cb) => {
//       const ext = path.extname(file.originalname);
//       const filename = `${uuid()}${ext}`;
//       cb(null, filename);
//     },
//   });
// };
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
// export const createUploadMiddleware = (module: string) => {
//   return multer({
//     storage: createStorage(module),
//     limits: {
//       fileSize: 10 * 1024 * 1024,
//     },
//     fileFilter,
//   });
// };
// export const uploadMedia = createUploadMiddleware("media");
const multer_1 = __importDefault(require("multer"));
const client_s3_1 = require("@aws-sdk/client-s3");
const uuid_1 = require("uuid");
const s3_1 = require("../config/s3");
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
const memoryStorage = multer_1.default.memoryStorage();
const fileFilter = (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error(`File type ${file.mimetype} is not allowed`));
    }
};
const multerUpload = (0, multer_1.default)({
    storage: memoryStorage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter,
});
const uploadToS3 = (module) => {
    return async (req, res, next) => {
        if (!req.file)
            return next();
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const ext = req.file.originalname.split(".").pop();
        const key = `uploads/${module}/${year}/${month}/${(0, uuid_1.v4)()}.${ext}`;
        try {
            await s3_1.s3.send(new client_s3_1.PutObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: key,
                Body: req.file.buffer,
                ContentType: req.file.mimetype,
            }));
            req.file.s3Key = key;
            req.file.s3Url =
                `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
const createUploadMiddleware = (module) => {
    return [multerUpload.single("file"), uploadToS3(module)];
};
exports.createUploadMiddleware = createUploadMiddleware;
exports.uploadInsight = (0, exports.createUploadMiddleware)("insights");
exports.uploadEvent = (0, exports.createUploadMiddleware)("events");
exports.uploadPortfolio = (0, exports.createUploadMiddleware)("portfolios");
exports.uploadMedia = (0, exports.createUploadMiddleware)("media");
//# sourceMappingURL=upload.js.map