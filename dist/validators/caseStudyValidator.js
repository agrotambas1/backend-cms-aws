"use strict";
// const VALID_STATUSES = ["draft", "published", "scheduled", "archived"];
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCaseStudyData = void 0;
// export const validateCaseStudyData = (
//   data: {
//     title?: string;
//     slug?: string;
//     problem?: string;
//     solution?: string;
//     outcomesDesc?: string;
//     outcomes?: any;
//     client?: string;
//     status?: string;
//     metaTitle?: string;
//     metaDescription?: string;
//     seoKeywords?: any;
//     serviceId: string;
//     industryId: string;
//   },
//   isUpdate = false,
// ) => {
//   const errors: string[] = [];
//   if (!isUpdate) {
//     if (!data.title) errors.push("Title is required");
//     if (!data.slug) errors.push("Slug is required");
//     if (!data.problem) errors.push("Problem is required");
//     if (!data.solution) errors.push("Solution is required");
//     if (!data.outcomes) errors.push("Outcomes is required");
//     if (!data.metaTitle) errors.push("Meta title is required");
//     if (!data.metaDescription) errors.push("Meta description is required");
//     if (!data.status) errors.push("Status is required");
//   }
//   if (data.title !== undefined) {
//     if (data.title.trim().length === 0) {
//       errors.push("Title cannot be empty");
//     }
//     if (data.title.length > 255) {
//       errors.push("Title is too long (max 255 characters)");
//     }
//   }
//   if (data.slug !== undefined && data.slug.trim()) {
//     if (data.slug.length > 255) {
//       errors.push("Slug is too long (max 255 characters)");
//     }
//     if (!/^[a-z0-9-]*$/.test(data.slug)) {
//       errors.push(
//         "Slug must contain only lowercase letters, numbers, and hyphens",
//       );
//     }
//   }
//   if (data.status && !VALID_STATUSES.includes(data.status)) {
//     errors.push(`Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`);
//   }
//   if (data.metaTitle !== undefined) {
//     if (!isUpdate && data.metaTitle.trim().length === 0) {
//       errors.push("Meta title cannot be empty");
//     }
//     if (data.metaTitle.length > 60) {
//       errors.push("Meta title is too long (max 60 characters for SEO)");
//     }
//   }
//   if (data.metaDescription !== undefined) {
//     if (!isUpdate && data.metaDescription.trim().length === 0) {
//       errors.push("Meta description cannot be empty");
//     }
//     if (data.metaDescription.length > 160) {
//       errors.push("Meta description is too long (max 160 characters for SEO)");
//     }
//   }
//   if (data.seoKeywords !== undefined && data.seoKeywords !== null) {
//     if (!Array.isArray(data.seoKeywords)) {
//       errors.push("SEO keywords must be an array");
//     } else {
//       if (data.seoKeywords.length > 10) {
//         errors.push("Maximum 10 SEO keywords allowed");
//       }
//       data.seoKeywords.forEach((keyword: any, index: number) => {
//         if (typeof keyword !== "string") {
//           errors.push(`SEO keyword #${index + 1} must be a string`);
//         } else if (keyword.trim().length === 0) {
//           errors.push(`SEO keyword #${index + 1} cannot be empty`);
//         } else if (keyword.length > 50) {
//           errors.push(
//             `SEO keyword #${index + 1} is too long (max 50 characters)`,
//           );
//         }
//       });
//     }
//   }
//   if (data.problem !== undefined && data.problem.trim()) {
//     if (data.problem.length > 5000) {
//       errors.push("Problem description is too long (max 5000 characters)");
//     }
//   }
//   if (data.solution !== undefined && data.solution.trim()) {
//     if (data.solution.length > 5000) {
//       errors.push("Solution description is too long (max 5000 characters)");
//     }
//   }
//   if (data.outcomesDesc !== undefined && data.outcomesDesc.trim()) {
//     if (data.outcomesDesc.length > 5000) {
//       errors.push("Solution description is too long (max 5000 characters)");
//     }
//   }
//   if (data.outcomes !== undefined) {
//     if (!Array.isArray(data.outcomes)) {
//       errors.push("Outcomes must be an array");
//     } else {
//       if (!isUpdate && data.outcomes.length === 0) {
//         errors.push("At least one outcome is required");
//       }
//       data.outcomes.forEach((outcome: any, index: number) => {
//         if (!outcome.metric || !outcome.value) {
//           errors.push(
//             `Outcome #${index + 1} must have 'metric' and 'value' properties`,
//           );
//         }
//       });
//     }
//   }
//   return errors;
// };
const zod_1 = require("zod");
const VALID_STATUSES = [
    "draft",
    "in technical review",
    "in marketing review",
    "approved",
    "published",
    "archived",
];
const caseStudySchema = zod_1.z.object({
    title: zod_1.z
        .string()
        .min(1, "Title cannot be empty")
        .max(255, "Title is too long (max 255 characters)"),
    slug: zod_1.z
        .string()
        .min(1, "Slug cannot be empty")
        .max(255, "Slug is too long (max 255 characters)")
        .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
    overview: zod_1.z
        .string()
        .max(15000, "Overview description is too long (max 15000 characters)"),
    problem: zod_1.z
        .string()
        .max(15000, "Problem description is too long (max 15000 characters)"),
    solution: zod_1.z
        .string()
        .max(15000, "Solution description is too long (max 15000 characters)"),
    outcomesDesc: zod_1.z
        .string()
        .max(15000, "Outcomes description is too long (max 15000 characters)")
        .optional(),
    outcomes: zod_1.z.array(zod_1.z.object({
        metric: zod_1.z.string().nullable().optional(),
        value: zod_1.z.string().nullable().optional(),
    })),
    client: zod_1.z.string().optional(),
    status: zod_1.z.enum(VALID_STATUSES, {
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
    }),
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
        .refine((keywords) => keywords.every((k) => k.trim().length > 0), {
        message: "SEO keyword cannot be empty",
    })
        .refine((keywords) => keywords.every((k) => k.length <= 50), {
        message: "SEO keyword is too long (max 50 characters)",
    })
        .optional()
        .nullable(),
    serviceId: zod_1.z.string(),
    industryId: zod_1.z.string(),
});
const validateCaseStudyData = (data, isUpdate = false) => {
    const errors = [];
    if (!isUpdate) {
        if (!data.title)
            errors.push("Title is required");
        if (!data.slug)
            errors.push("Slug is required");
        if (!data.overview)
            errors.push("Overview is required");
        if (!data.problem)
            errors.push("Problem is required");
        if (!data.solution)
            errors.push("Solution is required");
        if (!data.outcomes)
            errors.push("Outcomes is required");
        // if (!data.metaTitle) errors.push("Meta title is required");
        // if (!data.metaDescription) errors.push("Meta description is required");
        if (!data.status)
            errors.push("Status is required");
        if (errors.length > 0)
            return errors;
    }
    const result = caseStudySchema.safeParse(data);
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
            if (issue.path[0] === "outcomes" && typeof issue.path[1] === "number") {
                const idx = issue.path[1] + 1;
                errors.push(`Outcome #${idx} must have 'metric' and 'value' properties`);
                return;
            }
            errors.push(issue.message);
        });
    }
    if (!isUpdate && Array.isArray(data.outcomes) && data.outcomes.length === 0) {
        errors.push("At least one outcome is required");
    }
    return errors;
};
exports.validateCaseStudyData = validateCaseStudyData;
//# sourceMappingURL=caseStudyValidator.js.map