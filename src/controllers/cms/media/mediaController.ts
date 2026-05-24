import { Request, Response } from "express";
import { prisma } from "../../../config/db";
import fs from "fs";
import {
  buildCMSMediaPaginationParams,
  buildCMSMediaSortParams,
  buildCMSMediaWhereCondition,
} from "../../../utils/queryBuilder/cms/media/media";
import path from "path";
import multer from "multer";

export const getMedia = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { page = "1", limit = "20", search, type, sortBy, order } = req.query;

    const where = buildCMSMediaWhereCondition({
      search: search as string,
      type: type as string,
    });

    const pagination = buildCMSMediaPaginationParams(
      page as string,
      limit as string,
    );

    const orderBy = buildCMSMediaSortParams(sortBy as string, order as string);

    const [mediaItems, total] = await Promise.all([
      prisma.media.findMany({
        where,
        orderBy,
        ...pagination,
      }),
      prisma.media.count({ where }),
    ]);

    return res.status(200).json({
      data: mediaItems,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching media:", error);

    const message =
      process.env.NODE_ENV === "production"
        ? "Failed to fetch media"
        : (error as Error).message;

    res.status(500).json({ message });
  }
};

export const getMediaById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Media ID is required" });
    }

    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const media = await prisma.media.findUnique({
      where: { id },
    });

    if (!media || media.deletedAt) {
      return res.status(404).json({ message: "Media not found" });
    }

    res.json({
      status: "success",
      data: { media },
    });
  } catch (error) {
    console.error("Error fetching media:", error);

    const message =
      process.env.NODE_ENV === "production"
        ? "Failed to fetch media"
        : (error as Error).message;

    res.status(500).json({ message });
  }
};

export const uploadMedia = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }

    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const file = req.file;
    const { title, description, alt_text, caption } = req.body;

    const pathParts = file.path.split(path.sep);
    const module = pathParts[1];
    const year = pathParts[2];
    const month = pathParts[3];

    const media = await prisma.media.create({
      data: {
        title,
        description,
        fileName: file.filename,
        filePath: file.path,
        mimeType: file.mimetype,
        fileSize: file.size,
        url: `/uploads/${module}/${year}/${month}/${file.filename}`,
        altText: alt_text,
        caption: caption,
        createdBy: req.user.id,
      },
    });

    res.status(201).json(media);
  } catch (error) {
    console.error("Error uploading media:", error);
    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          message: "File size exceeds maximum limit of 10MB",
        });
      }
      return res.status(400).json({
        message: error.message,
      });
    }
    res.status(500).json({ message: "Failed to upload media" });
  }
};

export const updateMedia = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Media ID is required" });
    }

    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { title, description, altText, caption } = req.body;

    const mediaExists = await prisma.media.findUnique({
      where: { id },
    });

    if (!mediaExists || mediaExists.deletedAt) {
      return res.status(404).json({ message: "Media not found" });
    }

    const updateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (altText !== undefined) updateData.altText = altText;
    if (caption !== undefined) updateData.caption = caption;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        message:
          "No data to update. Provide title, description, altText, or caption.",
      });
    }

    const media = await prisma.media.update({
      where: { id },
      data: updateData,
    });

    res.json({
      status: "success",
      data: { media },
    });
  } catch (error) {
    console.error("Error updating media:", error);

    const message =
      process.env.NODE_ENV === "production"
        ? "Failed to update media"
        : (error as Error).message;

    res.status(500).json({ message });
  }
};

const checkMediaUsage = async (mediaId: string) => {
  const [articleThumb, caseStudyThumb] = await Promise.all([
    prisma.article.count({ where: { thumbnailId: mediaId } }),
    prisma.caseStudy.count({ where: { thumbnailId: mediaId } }),
  ]);

  return {
    articleThumb,
    caseStudyThumb,

    total: articleThumb + caseStudyThumb,
  };
};

export const deleteMedia = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Media ID is required" });
    }

    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const mediaExists = await prisma.media.findUnique({
      where: { id },
    });

    if (!mediaExists || mediaExists.deletedAt) {
      return res.status(404).json({ message: "Media not found" });
    }

    if (mediaExists.createdBy !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Forbidden: You don't have permission to update this media",
      });
    }

    // const media = await prisma.media.update({
    //   where: { id },
    //   data: { deletedAt: new Date() },
    // });

    const usage = await checkMediaUsage(id);

    if (usage.total > 0) {
      return res.status(400).json({
        message: "Media is in use and cannot be deleted",
        usage,
      });
    }

    await prisma.media.delete({
      where: { id },
    });

    try {
      if (fs.existsSync(mediaExists.filePath)) {
        fs.unlinkSync(mediaExists.filePath);
      }
    } catch (fileError) {
      console.error("Error deleting file:", fileError);
    }

    res.json({
      status: "success",
      message: "Media deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting media:", error);
    res.status(500).json({ message: "Failed to delete media" });
  }
};

export const bulkDeleteMedia = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Media IDs are required" });
    }

    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const medias = await prisma.media.findMany({
      where: { id: { in: ids } },
    });

    if (medias.length === 0) {
      return res.status(404).json({ message: "No media found" });
    }

    const blocked: string[] = [];
    const deletable: typeof medias = [];

    for (const media of medias) {
      const usage = await checkMediaUsage(media.id);
      if (usage.total > 0) {
        blocked.push(media.id);
      } else {
        deletable.push(media);
      }
    }

    if (deletable.length === 0) {
      return res.status(400).json({
        message: "Media is in use and cannot be deleted",
        blocked,
      });
    }

    await prisma.media.deleteMany({
      where: {
        id: { in: deletable.map((m) => m.id) },
      },
    });

    for (const media of deletable) {
      try {
        if (media.filePath && fs.existsSync(media.filePath)) {
          fs.unlinkSync(media.filePath);
        }
      } catch (err) {
        console.warn("File delete failed:", media.filePath);
      }
    }

    return res.json({
      status: "success",
      deleted: deletable.length,
      blocked,
    });
  } catch (error) {
    console.error("Error bulk deleting media:", error);
    return res.status(500).json({
      message: "Failed to bulk delete media",
    });
  }
};

export const downloadMedia = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Media ID is required" });
    }

    const media = await prisma.media.findUnique({
      where: { id },
    });

    if (!media) {
      return res.status(404).json({ message: "Media not found" });
    }

    if (!fs.existsSync(media.filePath)) {
      return res.status(404).json({ message: "File not found on server" });
    }

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${media.fileName}"`,
    );
    res.setHeader("Content-Type", media.mimeType);
    res.setHeader("Content-Length", media.fileSize.toString());

    res.download(media.filePath, media.fileName, (err) => {
      if (err) {
        console.error("Download error:", err);
        if (!res.headersSent) {
          res.status(500).json({ message: "Failed to download file" });
        }
      }
    });
  } catch (error) {
    console.error("Download media error:", error);
    res.status(500).json({ message: "Failed to download media" });
  }
};
