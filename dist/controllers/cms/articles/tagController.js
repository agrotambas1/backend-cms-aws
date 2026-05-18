"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTag = exports.updateTag = exports.createTag = exports.getTags = void 0;
const db_1 = require("../../../config/db");
const tags_1 = require("../../../utils/queryBuilder/cms/articles/tags");
const generateSlug_1 = require("../../../utils/generateSlug");
const getTags = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { page = "1", limit = "10", search, isActive, sortBy, order, } = req.query;
        const where = (0, tags_1.buildCMSArticleTagWhereCondition)({
            search: search,
            isActive: isActive,
        });
        const pagination = (0, tags_1.buildCMSArticleTagPaginationParams)(page, limit);
        const orderBy = (0, tags_1.buildCMSArticleTagSortParams)(sortBy, order);
        const [tags, total] = await Promise.all([
            db_1.prisma.articleTag.findMany({
                where,
                orderBy,
                ...pagination,
            }),
            db_1.prisma.articleTag.count({ where }),
        ]);
        return res.status(200).json({
            data: tags,
            meta: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        console.error("Error fetching article tags:", error);
        const message = process.env.NODE_ENV === "production"
            ? "Failed to fetch article tags"
            : error.message;
        res.status(500).json({ message });
    }
};
exports.getTags = getTags;
const createTag = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { name, slug } = req.body;
        if (!name) {
            return res.status(400).json({ message: "Tag name is required" });
        }
        // const slug = generateSlug(name);
        const finalSlug = slug?.trim() ? slug : (0, generateSlug_1.generateSlug)(name);
        const exisiting = await db_1.prisma.articleTag.findFirst({
            where: {
                slug: finalSlug,
                deletedAt: null,
            },
        });
        if (exisiting) {
            return res.status(409).json({
                message: "Tag with the same name already exists",
            });
        }
        const tag = await db_1.prisma.articleTag.create({
            data: {
                name,
                slug: finalSlug,
                isActive: true,
            },
        });
        res.status(201).json({
            status: "success",
            data: {
                tag,
            },
            message: "Tag created successfully",
        });
    }
    catch (error) {
        console.error("Error creating tag:", error);
        if (error instanceof Error) {
            console.error("Error message:", error.message);
        }
        res.status(500).json({
            message: "Failed to create tag",
            error: error instanceof Error ? error.message : error,
        });
    }
};
exports.createTag = createTag;
const updateTag = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { id } = req.params;
        const { name, slug, isActive } = req.body;
        if (!id) {
            return res.status(400).json({ message: "Tag ID is required" });
        }
        if (!name) {
            return res.status(400).json({ message: "Tag name is required" });
        }
        // const slug = generateSlug(name);
        const finalSlug = slug?.trim() ? slug : (0, generateSlug_1.generateSlug)(name);
        const existing = await db_1.prisma.articleTag.findFirst({
            where: {
                slug: finalSlug,
                deletedAt: null,
                NOT: { id },
            },
        });
        if (existing) {
            return res.status(409).json({
                message: "Tag with the same name already exists",
            });
        }
        const tag = await db_1.prisma.articleTag.update({
            where: { id },
            data: {
                name,
                slug: finalSlug,
                isActive: typeof isActive === "boolean" ? isActive : true,
            },
        });
        res.status(200).json({
            status: "Success",
            data: {
                tag,
            },
            message: "Tag updated successfully",
        });
    }
    catch (error) {
        console.error("Error updating tag:", error);
        if (error instanceof Error) {
            console.error("Error message:", error.message);
        }
        res.status(500).json({
            message: "Failed to update tag",
            error: error instanceof Error ? error.message : error,
        });
    }
};
exports.updateTag = updateTag;
const deleteTag = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Tag ID is required" });
        }
        const tag = await db_1.prisma.articleTag.findFirst({
            where: {
                id,
                deletedAt: null,
            },
            include: {
                _count: {
                    select: {
                        articles: true,
                    },
                },
            },
        });
        if (!tag) {
            return res.status(404).json({ message: "Tag not found" });
        }
        if (tag._count.articles > 0) {
            return res.status(409).json({
                message: `Cannot delete tag. It is being used in ${tag._count.articles} article(s).`,
                usage: {
                    articles: tag._count.articles,
                },
            });
        }
        await db_1.prisma.articleTag.update({
            where: { id },
            data: {
                deletedAt: new Date(),
            },
        });
        res.status(200).json({
            status: "success",
            message: "Tag deleted successfully",
        });
    }
    catch (error) {
        console.error("Error deleting tag:", error);
        res.status(500).json({ message: "Failed to delete tag" });
    }
};
exports.deleteTag = deleteTag;
//# sourceMappingURL=tagController.js.map