"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkDeleteCaseStudy = exports.deleteCaseStudy = exports.updateCaseStudy = exports.createCaseStudy = exports.getCaseStudyById = exports.getCaseStudies = void 0;
const db_1 = require("../../../config/db");
const caseStudiesInclude_1 = require("../../../includes/cms/caseStudiesInclude");
const caseStudyValidator_1 = require("../../../validators/caseStudyValidator");
const caseStudies_1 = require("../../../utils/queryBuilder/cms/caseStudies/caseStudies");
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const generateSlug_1 = require("../../../utils/generateSlug");
const getCaseStudies = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { page = "1", limit = "10", sortBy, order, search, status, isFeatured, serviceId, industryId, client, } = req.query;
        const where = (0, caseStudies_1.buildCMSCaseStudyWhereCondition)({
            search: search,
            status: status,
            isFeatured: isFeatured,
            serviceId: serviceId,
            industryId: industryId,
            client: client,
        });
        const pagination = (0, caseStudies_1.buildCMSCaseStudyPaginationParams)(page, limit);
        const orderByParams = (0, caseStudies_1.buildCMSCaseStudySortParams)(sortBy, order);
        const [caseStudies, total] = await Promise.all([
            db_1.prisma.caseStudy.findMany({
                where,
                include: caseStudiesInclude_1.caseStudyInclude,
                orderBy: orderByParams,
                ...pagination,
            }),
            db_1.prisma.caseStudy.count({ where }),
        ]);
        res.set({
            "Cache-Control": "private, no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
        });
        return res.status(200).json({
            data: caseStudies.map(caseStudiesInclude_1.transformCaseStudy),
            meta: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        console.error("Error fetching case studies:", error);
        const message = process.env.NODE_ENV === "production"
            ? "Failed to fetch case studies"
            : error.message;
        res.status(500).json({ message });
    }
};
exports.getCaseStudies = getCaseStudies;
const getCaseStudyById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Case study ID is required" });
        }
        if (!req.user?.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const caseStudy = await db_1.prisma.caseStudy.findUnique({
            where: { id },
            include: caseStudiesInclude_1.caseStudyInclude,
        });
        if (!caseStudy || caseStudy.deletedAt) {
            return res.status(404).json({ message: "Case study not found" });
        }
        res.set({
            "Cache-Control": "private, no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
        });
        return res.status(200).json({
            status: "success",
            data: (0, caseStudiesInclude_1.transformCaseStudy)(caseStudy),
        });
    }
    catch (error) {
        console.error("Error fetching case study:", error);
        const message = process.env.NODE_ENV === "production"
            ? "Failed to fetch case study"
            : error.message;
        res.status(500).json({ message });
    }
};
exports.getCaseStudyById = getCaseStudyById;
const resolveCreateCaseStudySlug = (slug, title) => {
    if (slug && slug.trim()) {
        return slug.trim().toLowerCase();
    }
    if (title) {
        return (0, generateSlug_1.generateSlug)(title).toLowerCase();
    }
    return null;
};
const createCaseStudy = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { title, slug, overview, problem, solution, outcomesDesc, outcomes, client, year, status, metaTitle, metaDescription, seoKeywords, publishedAt, isFeatured, thumbnailId, publicationId, serviceId, industryId, } = req.body;
        const cleanOverview = typeof overview === "string"
            ? (0, sanitize_html_1.default)(overview, {
                allowedTags: sanitize_html_1.default.defaults.allowedTags.concat([
                    "h1",
                    "h2",
                    "h3",
                    "h4",
                    "h5",
                    "h6",
                    "img",
                    "span",
                ]),
                allowedAttributes: false,
                allowedSchemes: ["http", "https", "data"],
                disallowedTagsMode: "discard",
                nonBooleanAttributes: ["style"],
            })
            : "";
        const cleanProblem = typeof problem === "string"
            ? (0, sanitize_html_1.default)(problem, {
                allowedTags: sanitize_html_1.default.defaults.allowedTags.concat([
                    "h1",
                    "h2",
                    "h3",
                    "h4",
                    "h5",
                    "h6",
                    "img",
                    "span",
                ]),
                allowedAttributes: false,
                allowedSchemes: ["http", "https", "data"],
                disallowedTagsMode: "discard",
                nonBooleanAttributes: ["style"],
            })
            : "";
        const cleanSolution = typeof solution === "string"
            ? (0, sanitize_html_1.default)(solution, {
                allowedTags: sanitize_html_1.default.defaults.allowedTags.concat([
                    "h1",
                    "h2",
                    "h3",
                    "h4",
                    "h5",
                    "h6",
                    "img",
                    "span",
                ]),
                allowedAttributes: false,
                allowedSchemes: ["http", "https", "data"],
                disallowedTagsMode: "discard",
                nonBooleanAttributes: ["style"],
            })
            : "";
        const cleanOutcomesDesc = typeof outcomesDesc === "string"
            ? (0, sanitize_html_1.default)(outcomesDesc, {
                allowedTags: sanitize_html_1.default.defaults.allowedTags.concat([
                    "h1",
                    "h2",
                    "h3",
                    "h4",
                    "h5",
                    "h6",
                    "img",
                    "span",
                ]),
                allowedAttributes: false,
                allowedSchemes: ["http", "https", "data"],
                disallowedTagsMode: "discard",
                nonBooleanAttributes: ["style"],
            })
            : "";
        let parsedSeoKeywords = [];
        if (seoKeywords) {
            try {
                if (typeof seoKeywords === "string") {
                    parsedSeoKeywords = JSON.parse(seoKeywords);
                }
                else if (Array.isArray(seoKeywords)) {
                    parsedSeoKeywords = seoKeywords;
                }
                else {
                    return res.status(400).json({
                        message: "seoKeywords must be an array of strings",
                    });
                }
                if (!parsedSeoKeywords.every((k) => typeof k === "string")) {
                    return res.status(400).json({
                        message: "All SEO keywords must be strings",
                    });
                }
            }
            catch (error) {
                return res.status(400).json({
                    message: "Invalid seoKeywords format",
                });
            }
        }
        let parsedOutcomes = [];
        if (outcomes) {
            try {
                if (typeof outcomes === "string") {
                    parsedOutcomes = JSON.parse(outcomes);
                }
                else if (Array.isArray(outcomes)) {
                    parsedOutcomes = outcomes;
                }
                else {
                    return res.status(400).json({
                        message: "outcomes must be an array of objects",
                    });
                }
                const isValid = parsedOutcomes.every((o) => typeof o === "object" &&
                    (o.metric === null || typeof o.metric === "string") &&
                    (o.value === null || typeof o.value === "string"));
                if (!isValid) {
                    return res.status(400).json({
                        message: "Each outcome must have 'metric' and 'value' properties",
                    });
                }
            }
            catch (error) {
                return res.status(400).json({
                    message: "Invalid outcomes format",
                });
            }
        }
        const validationErrors = (0, caseStudyValidator_1.validateCaseStudyData)({
            title,
            slug,
            overview: cleanOverview,
            problem: cleanProblem,
            solution: cleanSolution,
            outcomesDesc: cleanOutcomesDesc,
            outcomes: parsedOutcomes,
            client,
            status,
            metaTitle,
            metaDescription,
            seoKeywords: parsedSeoKeywords,
            serviceId,
            industryId,
        });
        if (validationErrors.length > 0) {
            return res.status(400).json({
                message: validationErrors[0],
            });
        }
        const serviceExists = await db_1.prisma.service.findUnique({
            where: { id: serviceId },
        });
        if (!serviceExists) {
            return res.status(400).json({ message: "Service does not exist" });
        }
        const industryExists = await db_1.prisma.industry.findUnique({
            where: { id: industryId },
        });
        if (!industryExists) {
            return res.status(400).json({ message: "Industry does not exist" });
        }
        const finalSlug = resolveCreateCaseStudySlug(slug, title);
        if (!finalSlug) {
            return res.status(400).json({ message: "Slug is required" });
        }
        const existingCaseStudy = await db_1.prisma.caseStudy.findFirst({
            where: { slug: finalSlug, deletedAt: null },
        });
        if (existingCaseStudy) {
            return res.status(409).json({
                message: "Case study with the same slug already exists",
            });
        }
        let selectedThumbnailId = null;
        if (thumbnailId) {
            const mediaExists = await db_1.prisma.media.findUnique({
                where: { id: thumbnailId },
            });
            if (!mediaExists) {
                return res.status(400).json({
                    message: `Media with ID ${thumbnailId} not found`,
                });
            }
            selectedThumbnailId = thumbnailId;
        }
        let selectedPublicationId = null;
        if (publicationId) {
            const mediaExists = await db_1.prisma.media.findUnique({
                where: { id: publicationId },
            });
            if (!mediaExists) {
                return res.status(400).json({
                    message: `Publication media with ID ${publicationId} not found`,
                });
            }
            selectedPublicationId = publicationId;
        }
        const caseStudyData = {
            title,
            slug: finalSlug,
            overview: cleanOverview,
            problem: cleanProblem,
            solution: cleanSolution,
            outcomesDesc: cleanOutcomesDesc,
            outcomes: parsedOutcomes,
            client,
            year,
            status,
            metaTitle,
            metaDescription,
            serviceId,
            industryId,
            seoKeywords: parsedSeoKeywords.length > 0 ? parsedSeoKeywords : null,
            publishedAt: publishedAt ? new Date(publishedAt) : null,
            isFeatured: isFeatured ?? false,
            thumbnailId: selectedThumbnailId,
            publicationId: selectedPublicationId,
            createdBy: req.user.id,
            updatedBy: req.user.id,
        };
        const caseStudy = await db_1.prisma.caseStudy.create({
            data: caseStudyData,
            include: caseStudiesInclude_1.caseStudyInclude,
        });
        return res.status(201).json({
            status: "success",
            message: "Case study created successfully",
            data: {
                caseStudy: (0, caseStudiesInclude_1.transformCaseStudy)(caseStudy),
            },
        });
    }
    catch (error) {
        console.error("Error creating case study:", error);
        return res.status(500).json({
            message: "Failed to create case study",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.createCaseStudy = createCaseStudy;
const updateCaseStudy = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Case study ID is required" });
        }
        const { title, slug, overview, problem, solution, outcomesDesc, outcomes, client, year, status, metaTitle, metaDescription, seoKeywords, publishedAt, isFeatured, thumbnailId, publicationId, serviceId, industryId, } = req.body;
        const existingCaseStudy = await db_1.prisma.caseStudy.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existingCaseStudy) {
            return res.status(404).json({ message: "Case study not found" });
        }
        const cleanOverview = typeof overview === "string"
            ? (0, sanitize_html_1.default)(overview, {
                allowedTags: sanitize_html_1.default.defaults.allowedTags.concat([
                    "h1",
                    "h2",
                    "h3",
                    "h4",
                    "h5",
                    "h6",
                    "img",
                    "span",
                ]),
                allowedAttributes: false,
                allowedSchemes: ["http", "https", "data"],
                disallowedTagsMode: "discard",
                nonBooleanAttributes: ["style"],
            })
            : existingCaseStudy.overview;
        const cleanProblem = typeof problem === "string"
            ? (0, sanitize_html_1.default)(problem, {
                allowedTags: sanitize_html_1.default.defaults.allowedTags.concat([
                    "h1",
                    "h2",
                    "h3",
                    "h4",
                    "h5",
                    "h6",
                    "img",
                    "span",
                ]),
                allowedAttributes: false,
                allowedSchemes: ["http", "https", "data"],
                disallowedTagsMode: "discard",
                nonBooleanAttributes: ["style"],
            })
            : existingCaseStudy.problem;
        const cleanSolution = typeof solution === "string"
            ? (0, sanitize_html_1.default)(solution, {
                allowedTags: sanitize_html_1.default.defaults.allowedTags.concat([
                    "h1",
                    "h2",
                    "h3",
                    "h4",
                    "h5",
                    "h6",
                    "img",
                    "span",
                ]),
                allowedAttributes: false,
                allowedSchemes: ["http", "https", "data"],
                disallowedTagsMode: "discard",
                nonBooleanAttributes: ["style"],
            })
            : existingCaseStudy.solution;
        const cleanOutcomesDesc = typeof outcomesDesc === "string"
            ? (0, sanitize_html_1.default)(outcomesDesc, {
                allowedTags: sanitize_html_1.default.defaults.allowedTags.concat([
                    "h1",
                    "h2",
                    "h3",
                    "h4",
                    "h5",
                    "h6",
                    "img",
                    "span",
                ]),
                allowedAttributes: false,
                allowedSchemes: ["http", "https", "data"],
                disallowedTagsMode: "discard",
                nonBooleanAttributes: ["style"],
            })
            : existingCaseStudy.outcomesDesc;
        let parsedSeoKeywords = [];
        if (seoKeywords) {
            try {
                if (typeof seoKeywords === "string") {
                    parsedSeoKeywords = JSON.parse(seoKeywords);
                }
                else if (Array.isArray(seoKeywords)) {
                    parsedSeoKeywords = seoKeywords;
                }
                else {
                    return res.status(400).json({
                        message: "seoKeywords must be an array of strings",
                    });
                }
                if (!parsedSeoKeywords.every((k) => typeof k === "string")) {
                    return res.status(400).json({
                        message: "All SEO keywords must be strings",
                    });
                }
            }
            catch (error) {
                return res.status(400).json({
                    message: "Invalid seoKeywords format",
                });
            }
        }
        let parsedOutcomes = [];
        if (Array.isArray(existingCaseStudy.outcomes)) {
            parsedOutcomes = existingCaseStudy.outcomes;
        }
        if (outcomes !== undefined) {
            try {
                if (typeof outcomes === "string") {
                    parsedOutcomes = JSON.parse(outcomes);
                }
                else if (Array.isArray(outcomes)) {
                    parsedOutcomes = outcomes;
                }
                else {
                    return res.status(400).json({
                        message: "outcomes must be an array of objects",
                    });
                }
                parsedOutcomes = parsedOutcomes.map((o) => ({
                    metric: typeof o?.metric === "string" && o.metric.trim() !== ""
                        ? o.metric.trim()
                        : null,
                    value: typeof o?.value === "string" && o.value.trim() !== ""
                        ? o.value.trim()
                        : null,
                }));
                const isValid = parsedOutcomes.every((o) => o &&
                    (o.metric === null || typeof o.metric === "string") &&
                    (o.value === null || typeof o.value === "string"));
                if (!isValid) {
                    return res.status(400).json({
                        message: "Invalid outcome format",
                    });
                }
            }
            catch (error) {
                return res.status(400).json({
                    message: "Invalid outcomes format",
                });
            }
        }
        const validationErrors = (0, caseStudyValidator_1.validateCaseStudyData)({
            title,
            slug,
            overview: cleanOverview,
            problem: cleanProblem,
            solution: cleanSolution,
            outcomesDesc: cleanOutcomesDesc,
            outcomes: parsedOutcomes,
            client,
            status,
            metaTitle,
            metaDescription,
            serviceId,
            industryId,
            seoKeywords: parsedSeoKeywords,
        }, true);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                message: validationErrors[0],
            });
        }
        if (serviceId) {
            const serviceExists = await db_1.prisma.service.findUnique({
                where: { id: serviceId },
            });
            if (!serviceExists) {
                return res.status(404).json({ message: "Service not found" });
            }
        }
        if (industryId) {
            const industryExists = await db_1.prisma.industry.findUnique({
                where: { id: industryId },
            });
            if (!industryExists) {
                return res.status(404).json({ message: "Industry not found" });
            }
        }
        const finalSlug = slug?.trim()
            ? slug.trim().toLowerCase()
            : existingCaseStudy.slug;
        if (slug) {
            const slugExists = await db_1.prisma.caseStudy.findFirst({
                where: {
                    slug: finalSlug,
                    NOT: { id },
                    deletedAt: null,
                },
            });
            if (slugExists) {
                return res.status(409).json({
                    message: "Case study with the same slug already exists",
                });
            }
        }
        let selectedThumbnailId = existingCaseStudy.thumbnailId;
        if (thumbnailId) {
            const mediaExists = await db_1.prisma.media.findUnique({
                where: { id: thumbnailId },
            });
            if (!mediaExists) {
                return res.status(400).json({
                    message: "Selected media does not exist",
                });
            }
            selectedThumbnailId = thumbnailId;
        }
        let selectedPublicationId = existingCaseStudy.publicationId;
        if (publicationId) {
            const mediaExists = await db_1.prisma.media.findUnique({
                where: { id: publicationId },
            });
            if (!mediaExists) {
                return res.status(400).json({
                    message: `Publication media with ID ${publicationId} not found`,
                });
            }
            selectedPublicationId = publicationId;
        }
        const caseStudyData = {
            title,
            slug: finalSlug,
            overview: cleanOverview,
            problem: cleanProblem,
            solution: cleanSolution,
            outcomesDesc: cleanOutcomesDesc,
            outcomes: parsedOutcomes,
            client,
            year,
            status,
            metaTitle,
            metaDescription,
            seoKeywords: parsedSeoKeywords.length > 0 ? parsedSeoKeywords : null,
            publishedAt: publishedAt ? new Date(publishedAt) : null,
            isFeatured: isFeatured ?? existingCaseStudy.isFeatured,
            thumbnailId: selectedThumbnailId,
            publicationId: selectedPublicationId,
            updatedBy: req.user.id,
            serviceId: serviceId ?? existingCaseStudy.serviceId,
            industryId: industryId ?? existingCaseStudy.industryId,
        };
        const caseStudy = await db_1.prisma.caseStudy.update({
            where: { id },
            data: caseStudyData,
            include: caseStudiesInclude_1.caseStudyInclude,
        });
        return res.status(200).json({
            status: "success",
            message: "Case study updated successfully",
            data: {
                caseStudy: (0, caseStudiesInclude_1.transformCaseStudy)(caseStudy),
            },
        });
    }
    catch (error) {
        console.error("Error updating case study:", error);
        return res.status(500).json({
            message: "Failed to update case study",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.updateCaseStudy = updateCaseStudy;
const deleteCaseStudy = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Case study ID is required" });
        }
        const existingCaseStudy = await db_1.prisma.caseStudy.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existingCaseStudy) {
            return res.status(404).json({ message: "Case study not found" });
        }
        await db_1.prisma.caseStudy.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                updatedBy: req.user.id,
            },
        });
        return res.status(200).json({
            status: "success",
            message: "Case study deleted successfully",
        });
    }
    catch (error) {
        console.error("Error deleting case study:", error);
        return res.status(500).json({
            message: "Failed to delete case study",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.deleteCaseStudy = deleteCaseStudy;
const bulkDeleteCaseStudy = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                message: "Case study IDs are required",
            });
        }
        const caseStudies = await db_1.prisma.caseStudy.findMany({
            where: {
                id: { in: ids },
                deletedAt: null,
            },
            select: { id: true },
        });
        if (caseStudies.length === 0) {
            return res.status(404).json({
                message: "No case studies found or already deleted",
            });
        }
        await db_1.prisma.caseStudy.updateMany({
            where: {
                id: { in: caseStudies.map((c) => c.id) },
            },
            data: {
                deletedAt: new Date(),
                updatedBy: req.user.id,
            },
        });
        return res.status(200).json({
            status: "success",
            message: `${caseStudies.length} case study(ies) deleted successfully`,
            deletedCount: caseStudies.length,
        });
    }
    catch (error) {
        console.error("Error bulk deleting case study:", error);
        return res.status(500).json({
            message: "Failed to bulk delete case studies",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.bulkDeleteCaseStudy = bulkDeleteCaseStudy;
//# sourceMappingURL=caseStudyController.js.map