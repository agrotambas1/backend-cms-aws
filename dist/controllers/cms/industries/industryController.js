"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteIndustry = exports.updateIndustry = exports.createIndustry = exports.getIndustryById = exports.getIndustries = void 0;
const db_1 = require("../../../config/db");
const industry_1 = require("../../../utils/queryBuilder/cms/industries/industry");
const industryValidator_1 = require("../../../validators/industries/industryValidator");
const generateSlug_1 = require("../../../utils/generateSlug");
const getIndustries = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { page = "1", limit = "10", search, isActive, sortBy, order, } = req.query;
        const where = (0, industry_1.buildCMSIndustryWhereCondition)({
            search: search,
            isActive: isActive,
        });
        const pagination = (0, industry_1.buildCMSIndustryPaginationParams)(page, limit);
        const orderBy = (0, industry_1.buildCMSIndustrySortParams)(sortBy, order);
        const [industries, total] = await Promise.all([
            db_1.prisma.industry.findMany({
                where,
                orderBy,
                ...pagination,
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    description: true,
                    isActive: true,
                    createdAt: true,
                    // _count: {
                    //   select: {
                    //     caseStudies: true,
                    //     events: true,
                    //     articles: true,
                    //   },
                    // },
                },
            }),
            db_1.prisma.industry.count({ where }),
        ]);
        return res.status(200).json({
            data: industries,
            meta: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        console.error("Error fetching industries:", error);
        const message = process.env.NODE_ENV === "production"
            ? "Failed to fetch industries"
            : error.message;
        res.status(500).json({ message });
    }
};
exports.getIndustries = getIndustries;
const getIndustryById = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Industry ID is required" });
        }
        const industry = await db_1.prisma.industry.findFirst({
            where: {
                id,
                deletedAt: null,
            },
            // include: {
            //   _count: {
            //     select: {
            //       caseStudies: true,
            //       events: true,
            //       articles: true,
            //     },
            //   },
            // },
        });
        if (!industry) {
            return res.status(404).json({ message: "Industry not found" });
        }
        return res.status(200).json({
            data: industry,
        });
    }
    catch (error) {
        console.error("Error fetching industry:", error);
        const message = process.env.NODE_ENV === "production"
            ? "Failed to fetch industry"
            : error.message;
        res.status(500).json({ message });
    }
};
exports.getIndustryById = getIndustryById;
const createIndustry = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        // Validate for CREATE (isUpdate = false)
        const errors = (0, industryValidator_1.validateIndustryData)(req.body, false);
        if (errors.length > 0) {
            return res.status(400).json({
                message: "Validation failed",
                errors,
            });
        }
        const { name, slug, description, isActive } = req.body;
        const finalSlug = slug?.trim() ? slug : (0, generateSlug_1.generateSlug)(name);
        const existing = await db_1.prisma.industry.findFirst({
            where: {
                slug: finalSlug,
                deletedAt: null,
            },
        });
        if (existing) {
            return res.status(409).json({
                message: "Industry with the same slug already exists",
            });
        }
        const industry = await db_1.prisma.industry.create({
            data: {
                name,
                slug: finalSlug,
                description: description || null,
                isActive: isActive ?? true,
            },
        });
        res.status(201).json({
            status: "success",
            data: { industry },
            message: "Industry created successfully",
        });
    }
    catch (error) {
        console.error("Error creating industry:", error);
        res.status(500).json({
            message: "Failed to create industry",
            error: error instanceof Error ? error.message : error,
        });
    }
};
exports.createIndustry = createIndustry;
const updateIndustry = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Industry ID is required" });
        }
        const errors = (0, industryValidator_1.validateIndustryData)(req.body, true);
        if (errors.length > 0) {
            return res.status(400).json({
                message: "Validation failed",
                errors,
            });
        }
        const existingIndustry = await db_1.prisma.industry.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existingIndustry) {
            return res.status(404).json({ message: "Industry not found" });
        }
        const { name, slug, description, isActive } = req.body;
        const updateData = {};
        if (name !== undefined)
            updateData.name = name;
        if (description !== undefined)
            updateData.description = description;
        if (isActive !== undefined)
            updateData.isActive = isActive;
        if (slug !== undefined || name !== undefined) {
            const finalSlug = slug?.trim()
                ? slug
                : name
                    ? (0, generateSlug_1.generateSlug)(name)
                    : existingIndustry.slug;
            const slugConflict = await db_1.prisma.industry.findFirst({
                where: {
                    slug: finalSlug,
                    deletedAt: null,
                    NOT: { id },
                },
            });
            if (slugConflict) {
                return res.status(409).json({
                    message: "Industry with the same slug already exists",
                });
            }
            updateData.slug = finalSlug;
        }
        const industry = await db_1.prisma.industry.update({
            where: { id },
            data: updateData,
        });
        res.status(200).json({
            status: "success",
            data: { industry },
            message: "Industry updated successfully",
        });
    }
    catch (error) {
        console.error("Error updating industry:", error);
        res.status(500).json({
            message: "Failed to update industry",
            error: error instanceof Error ? error.message : error,
        });
    }
};
exports.updateIndustry = updateIndustry;
const deleteIndustry = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Industry ID is required" });
        }
        const industry = await db_1.prisma.industry.findFirst({
            where: {
                id,
                deletedAt: null,
            },
            include: {
                _count: {
                    select: {
                        caseStudies: true,
                        articles: true,
                    },
                },
            },
        });
        if (!industry) {
            return res.status(404).json({ message: "Industry not found" });
        }
        const totalUsage = industry._count.caseStudies + industry._count.articles;
        if (totalUsage > 0) {
            return res.status(409).json({
                message: `Cannot delete industry. It is being used in ${totalUsage} content item(s).`,
                usage: {
                    caseStudies: industry._count.caseStudies,
                    articles: industry._count.articles,
                },
            });
        }
        await db_1.prisma.industry.update({
            where: { id },
            data: {
                deletedAt: new Date(),
            },
        });
        res.status(200).json({
            status: "success",
            message: "Industry deleted successfully",
        });
    }
    catch (error) {
        console.error("Error deleting industry:", error);
        res.status(500).json({ message: "Failed to delete industry" });
    }
};
exports.deleteIndustry = deleteIndustry;
//# sourceMappingURL=industryController.js.map