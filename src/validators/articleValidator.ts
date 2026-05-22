// const VALID_STATUSES = ["draft", "published", "scheduled", "archived"];

// export const validateArticleData = (
//   data: {
//     title?: string;
//     slug?: string;
//     excerpt?: string;
//     content?: string;
//     metaTitle?: string;
//     metaDescription?: string;
//     seoKeywords?: any;
//     categoryId?: string;
//     tags?: any;
//     status?: string;
//     serviceId?: string;
//     industryId?: string;
//   },
//   isUpdate = false,
// ) => {
//   const errors: string[] = [];
//   if (!isUpdate) {
//     if (!data.title) errors.push("Title is required");
//     if (!data.slug) errors.push("Slug is required");
//     if (!data.excerpt) errors.push("Excerpt is required");
//     if (!data.content) errors.push("Content is required");
//     if (!data.metaTitle) errors.push("Meta title is required");
//     if (!data.metaDescription) errors.push("Meta description is required");
//     if (!data.categoryId) errors.push("Category is required");
//     if (!data.tags || data.tags.length === 0) errors.push("Tags are required");
//     if (!data.status) errors.push("Status is required");
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

//   return errors;
// };

import { z } from "zod";

const VALID_STATUSES = ["draft", "published", "scheduled", "archived"] as const;

const articleSchema = z.object({
  title: z
    .string()
    .min(1, "Title cannot be empty")
    .max(255, "Title is too long (max 255 characters)"),
  slug: z
    .string()
    .min(1, "Slug cannot be empty")
    .max(255, "Slug is too long (max 255 characters)")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens",
    ),
  excerpt: z.string().min(1, "Excerpt cannot be empty"),
  content: z.string().min(1, "Content cannot be empty"),
  metaTitle: z
    .string()
    .max(60, "Meta title is too long (max 60 characters for SEO)")
    .optional()
    .nullable(),
  metaDescription: z
    .string()
    .max(160, "Meta description is too long (max 160 characters for SEO)")
    .optional()
    .nullable(),
  seoKeywords: z
    .array(z.string({ error: "SEO keywords must be an array" }))
    .max(10, "Maximum 10 SEO keywords allowed")
    .optional()
    .nullable(),
  categoryId: z.string(),
  tags: z.any(),
  status: z.enum(VALID_STATUSES, {
    message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
  }),
  serviceId: z.preprocess(
    (val) => (val === "none" || val === "" ? null : val),
    z.string().uuid("Invalid solution ID").optional().nullable(),
  ),
  industryId: z.preprocess(
    (val) => (val === "none" || val === "" ? null : val),
    z.string().uuid("Invalid industry ID").optional().nullable(),
  ),
});

export const validateArticleData = (
  data: {
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    metaTitle?: string;
    metaDescription?: string;
    seoKeywords?: any;
    categoryId?: string;
    tags?: any;
    status?: string;
    serviceId?: string;
    industryId?: string;
  },
  isUpdate = false,
) => {
  const errors: string[] = [];

  if (!isUpdate) {
    if (!data.title) errors.push("Title is required");
    if (!data.slug) errors.push("Slug is required");
    if (!data.excerpt) errors.push("Excerpt is required");
    if (!data.content) errors.push("Content is required");
    // if (!data.metaTitle) errors.push("Meta title is required");
    // if (!data.metaDescription) errors.push("Meta description is required");
    if (!data.categoryId) errors.push("Category is required");
    // if (!data.tags || data.tags.length === 0) errors.push("Tags are required");
    if (!data.status) errors.push("Status is required");

    if (errors.length > 0) return errors;
  }

  const result = articleSchema.safeParse(data);

  if (!result.success) {
    result.error.issues.forEach((issue) => {
      if (
        issue.path[0] === "seoKeywords" &&
        typeof issue.path[1] === "number"
      ) {
        const idx = issue.path[1] + 1;
        if (issue.code === "invalid_type") {
          errors.push(`SEO keyword #${idx} must be a string`);
        } else if (issue.message.includes("empty")) {
          errors.push(`SEO keyword #${idx} cannot be empty`);
        } else if (issue.message.includes("too long")) {
          errors.push(`SEO keyword #${idx} is too long (max 50 characters)`);
        }
        return;
      }

      errors.push(issue.message);
    });
  }

  if (Array.isArray(data.seoKeywords)) {
    data.seoKeywords.forEach((keyword: any, index: number) => {
      if (typeof keyword !== "string") return;
      if (keyword.trim().length === 0) {
        errors.push(`SEO keyword #${index + 1} cannot be empty`);
      } else if (keyword.length > 50) {
        errors.push(
          `SEO keyword #${index + 1} is too long (max 50 characters)`,
        );
      }
    });
  }

  return errors;
};
