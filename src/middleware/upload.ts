// import multer from "multer";
// import path from "path";
// import { v4 as uuid } from "uuid";
// import { Request } from "express";
// import fs from "fs";

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

import multer from "multer";
import { PutObjectCommand } from "@aws-sdk/client-s3";
// import { v4 as uuid } from "uuid";
import { randomUUID } from "crypto";
import { Request, Response, NextFunction } from "express";
import { s3 } from "../config/s3";

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

const memoryStorage = multer.memoryStorage();

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`));
  }
};

const multerUpload = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter,
});

const uploadToS3 = (module: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) return next();

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const ext = req.file.originalname.split(".").pop();
    const key = `uploads/${module}/${year}/${month}/${randomUUID()}.${ext}`;

    try {
      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME!,
          Key: key,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        }),
      );

      (req.file as any).s3Key = key;
      (req.file as any).s3Url =
        `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const createUploadMiddleware = (module: string) => {
  return [multerUpload.single("file"), uploadToS3(module)];
};

export const uploadInsight = createUploadMiddleware("insights");
export const uploadEvent = createUploadMiddleware("events");
export const uploadPortfolio = createUploadMiddleware("portfolios");
export const uploadMedia = createUploadMiddleware("media");
