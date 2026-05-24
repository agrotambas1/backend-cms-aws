"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateArticleData = void 0;
const zod_1 = require("zod");
const VALID_STATUSES = ["draft", "published", "scheduled", "archived"];
const articleSchema = zod_1.z.object({
    title: zod_1.z
        .string()
        .min(1, "Title cannot be empty")
        .max(255, "Title is too long (max 255 characters)"),
    slug: zod_1.z
        .string()
        .min(1, "Slug cannot be empty")
        .max(255, "Slug is too long (max 255 characters)")
        .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
    excerpt: zod_1.z.string().min(1, "Excerpt cannot be empty"),
    content: zod_1.z.string().min(1, "Content cannot be empty"),
    metaTitle: zod_1.z
        .string()
        .max(60, "Meta title is too long (max 60 characters for SEO)")
        .optional()
        .nullable(),
    metaDescription: zod_1.z
        .string()
        .max(160, "Meta description is too long (max 160 characters for SEO)")
        .optional()
        .nullable(),
    seoKeywords: zod_1.z
        .array(zod_1.z.string({ error: "SEO keywords must be an array" }))
        .max(10, "Maximum 10 SEO keywords allowed")
        .optional()
        .nullable(),
    categoryId: zod_1.z.string(),
    tags: zod_1.z.any(),
    status: zod_1.z.enum(VALID_STATUSES, {
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
    }),
    serviceId: zod_1.z.preprocess((val) => (val === "none" || val === "" ? null : val), zod_1.z.string().uuid("Invalid solution ID").optional().nullable()),
    industryId: zod_1.z.preprocess((val) => (val === "none" || val === "" ? null : val), zod_1.z.string().uuid("Invalid industry ID").optional().nullable()),
});
const validateArticleData = (data, isUpdate = false) => {
    const errors = [];
    if (!isUpdate) {
        if (!data.title)
            errors.push("Title is required");
        if (!data.slug)
            errors.push("Slug is required");
        if (!data.excerpt)
            errors.push("Excerpt is required");
        if (!data.content)
            errors.push("Content is required");
        // if (!data.metaTitle) errors.push("Meta title is required");
        // if (!data.metaDescription) errors.push("Meta description is required");
        if (!data.categoryId)
            errors.push("Category is required");
        // if (!data.tags || data.tags.length === 0) errors.push("Tags are required");
        if (!data.status)
            errors.push("Status is required");
        if (errors.length > 0)
            return errors;
    }
    const result = articleSchema.safeParse(data);
    if (!result.success) {
        result.error.issues.forEach((issue) => {
            if (issue.path[0] === "seoKeywords" &&
                typeof issue.path[1] === "number") {
                const idx = issue.path[1] + 1;
                if (issue.code === "invalid_type") {
                    errors.push(`SEO keyword #${idx} must be a string`);
                }
                else if (issue.message.includes("empty")) {
                    errors.push(`SEO keyword #${idx} cannot be empty`);
                }
                else if (issue.message.includes("too long")) {
                    errors.push(`SEO keyword #${idx} is too long (max 50 characters)`);
                }
                return;
            }
            errors.push(issue.message);
        });
    }
    if (Array.isArray(data.seoKeywords)) {
        data.seoKeywords.forEach((keyword, index) => {
            if (typeof keyword !== "string")
                return;
            if (keyword.trim().length === 0) {
                errors.push(`SEO keyword #${index + 1} cannot be empty`);
            }
            else if (keyword.length > 50) {
                errors.push(`SEO keyword #${index + 1} is too long (max 50 characters)`);
            }
        });
    }
    return errors;
};
exports.validateArticleData = validateArticleData;
//# sourceMappingURL=articleValidator.js.map