import { z } from "zod";

const VALID_STATUSES = [
  "draft",
  "in technical review",
  "in marketing review",
  "approved",
  "published",
  "archived",
] as const;

const caseStudySchema = z.object({
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
  overview: z
    .string()
    .max(15000, "Overview description is too long (max 15000 characters)"),
  problem: z
    .string()
    .max(15000, "Problem description is too long (max 15000 characters)"),
  solution: z
    .string()
    .max(15000, "Solution description is too long (max 15000 characters)"),
  outcomesDesc: z
    .string()
    .max(15000, "Outcomes description is too long (max 15000 characters)")
    .optional(),
  outcomes: z.array(
    z.object({
      metric: z.string().nullable().optional(),
      value: z.string().nullable().optional(),
    }),
  ),

  client: z.string().optional(),
  status: z.enum(VALID_STATUSES, {
    message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
  }),
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
    .refine((keywords) => keywords.every((k) => k.trim().length > 0), {
      message: "SEO keyword cannot be empty",
    })
    .refine((keywords) => keywords.every((k) => k.length <= 50), {
      message: "SEO keyword is too long (max 50 characters)",
    })
    .optional()
    .nullable(),
  serviceId: z.string(),
  industryId: z.string(),
});

export const validateCaseStudyData = (
  data: {
    title?: string;
    slug?: string;
    overview?: string;
    problem?: string;
    solution?: string;
    outcomesDesc?: string;
    outcomes?: any;
    client?: string;
    status?: string;
    metaTitle?: string;
    metaDescription?: string;
    seoKeywords?: any;
    serviceId: string;
    industryId: string;
  },
  isUpdate = false,
) => {
  const errors: string[] = [];

  if (!isUpdate) {
    if (!data.title) errors.push("Title is required");
    if (!data.slug) errors.push("Slug is required");
    if (!data.overview) errors.push("Overview is required");
    if (!data.problem) errors.push("Problem is required");
    if (!data.solution) errors.push("Solution is required");
    if (!data.outcomes) errors.push("Outcomes is required");
    // if (!data.metaTitle) errors.push("Meta title is required");
    // if (!data.metaDescription) errors.push("Meta description is required");
    if (!data.status) errors.push("Status is required");

    if (errors.length > 0) return errors;
  }

  const result = caseStudySchema.safeParse(data);

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

      if (issue.path[0] === "outcomes" && typeof issue.path[1] === "number") {
        const idx = issue.path[1] + 1;
        errors.push(
          `Outcome #${idx} must have 'metric' and 'value' properties`,
        );
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
