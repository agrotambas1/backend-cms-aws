"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategories = void 0;
const db_1 = require("../../../config/db");
const categories_1 = require("../../../utils/queryBuilder/cms/articles/categories");
const generateSlug_1 = require("../../../utils/generateSlug");
const getCategories = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { page = "1", limit = "10", search, isActive, sortBy, order, } = req.query;
        const where = (0, categories_1.buildCMSArticleCategoryWhereCondition)({
            search: search,
            isActive: isActive,
        });
        const pagination = (0, categories_1.buildCMSArticleCategoryPaginationParams)(page, limit);
        const orderBy = (0, categories_1.buildCMSArticleCategorySortParams)(sortBy, order);
        const [categories, total] = await Promise.all([
            db_1.prisma.articleCategory.findMany({
                where,
                orderBy,
                ...pagination,
            }),
            db_1.prisma.articleCategory.count({ where }),
        ]);
        return res.status(200).json({
            data: categories,
            meta: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        console.error("Error fetching article categories:", error);
        const message = process.env.NODE_ENV === "production"
            ? "Failed to fetch article categories"
            : error.message;
        res.status(500).json({ message });
    }
};
exports.getCategories = getCategories;
const createCategory = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { name, slug, description } = req.body;
        if (!name) {
            return res.status(400).json({ message: "Category name is required" });
        }
        // const slug = generateSlug(name);
        const finalSlug = slug?.trim() ? slug : (0, generateSlug_1.generateSlug)(name);
        const existing = await db_1.prisma.articleCategory.findFirst({
            where: {
                slug: finalSlug,
                deletedAt: null,
            },
        });
        if (existing) {
            return res.status(409).json({
                message: "Category with the same name already exists",
            });
        }
        const category = await db_1.prisma.articleCategory.create({
            data: {
                name,
                slug: finalSlug,
                description,
                isActive: true,
            },
        });
        res.status(201).json({
            status: "success",
            data: {
                category,
            },
            message: "Category created successfully",
        });
    }
    catch (error) {
        console.error("Error creating category:", error);
        if (error instanceof Error) {
            console.error("Error message:", error.message);
        }
        res.status(500).json({
            message: "Failed to create category",
            error: error instanceof Error ? error.message : error,
        });
    }
};
exports.createCategory = createCategory;
const updateCategory = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { id } = req.params;
        const { name, slug, description, isActive } = req.body;
        if (!id) {
            return res.status(400).json({ message: "Category ID is required" });
        }
        if (!name) {
            return res.status(400).json({ message: "Category name is required" });
        }
        const finalSlug = slug?.trim() ? slug : (0, generateSlug_1.generateSlug)(name);
        const existing = await db_1.prisma.articleCategory.findFirst({
            where: {
                slug: finalSlug,
                NOT: { id },
            },
        });
        if (existing) {
            return res.status(409).json({
                message: "Category with the same name already exists",
            });
        }
        const category = await db_1.prisma.articleCategory.update({
            where: { id },
            data: {
                name,
                slug: finalSlug,
                description,
                isActive: typeof isActive === "boolean" ? isActive : true,
                // updatedAt: new Date(),
            },
        });
        res.status(200).json({
            status: "success",
            data: { category },
            message: "Category updated successfully",
        });
    }
    catch (error) {
        console.error("Error updating category:", error);
        if (error instanceof Error) {
            console.error("Error message:", error.message);
        }
        res.status(500).json({
            message: "Failed to update category",
            error: error instanceof Error ? error.message : error,
        });
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Category ID is required" });
        }
        const category = await db_1.prisma.articleCategory.findFirst({
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
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        if (category._count.articles > 0) {
            return res.status(409).json({
                message: `Cannot delete category. It is being used in ${category._count.articles} article(s).`,
                usage: {
                    articles: category._count.articles,
                },
            });
        }
        await db_1.prisma.articleCategory.update({
            where: { id },
            data: {
                deletedAt: new Date(),
            },
        });
        res.status(200).json({
            status: "success",
            message: "Category deleted successfully",
        });
    }
    catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json({ message: "Failed to delete category" });
    }
};
exports.deleteCategory = deleteCategory;
//# sourceMappingURL=categoryController.js.map