import { Request, Response } from "express";
import { prisma } from "../../../config/db";
import {
  buildCMSIndustryPaginationParams,
  buildCMSIndustrySortParams,
  buildCMSIndustryWhereCondition,
} from "../../../utils/queryBuilder/cms/industries/industry";
import { validateIndustryData } from "../../../validators/industries/industryValidator";
import { generateSlug } from "../../../utils/generateSlug";

export const getIndustries = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const {
      page = "1",
      limit = "10",
      search,
      isActive,
      sortBy,
      order,
    } = req.query;

    const where = buildCMSIndustryWhereCondition({
      search: search as string,
      isActive: isActive as string,
    });

    const pagination = buildCMSIndustryPaginationParams(
      page as string,
      limit as string,
    );

    const orderBy = buildCMSIndustrySortParams(
      sortBy as string,
      order as string,
    );

    const [industries, total] = await Promise.all([
      prisma.industry.findMany({
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
      prisma.industry.count({ where }),
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
  } catch (error) {
    console.error("Error fetching industries:", error);

    const message =
      process.env.NODE_ENV === "production"
        ? "Failed to fetch industries"
        : (error as Error).message;

    res.status(500).json({ message });
  }
};

export const getIndustryById = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Industry ID is required" });
    }

    const industry = await prisma.industry.findFirst({
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
  } catch (error) {
    console.error("Error fetching industry:", error);

    const message =
      process.env.NODE_ENV === "production"
        ? "Failed to fetch industry"
        : (error as Error).message;

    res.status(500).json({ message });
  }
};

export const createIndustry = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Validate for CREATE (isUpdate = false)
    const errors = validateIndustryData(req.body, false);
    if (errors.length > 0) {
      return res.status(400).json({
        message: "Validation failed",
        errors,
      });
    }

    const { name, slug, description, isActive } = req.body;

    const finalSlug = slug?.trim() ? slug : generateSlug(name);

    const existing = await prisma.industry.findFirst({
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

    const industry = await prisma.industry.create({
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
  } catch (error) {
    console.error("Error creating industry:", error);
    res.status(500).json({
      message: "Failed to create industry",
      error: error instanceof Error ? error.message : error,
    });
  }
};

export const updateIndustry = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Industry ID is required" });
    }

    const errors = validateIndustryData(req.body, true);
    if (errors.length > 0) {
      return res.status(400).json({
        message: "Validation failed",
        errors,
      });
    }

    const existingIndustry = await prisma.industry.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingIndustry) {
      return res.status(404).json({ message: "Industry not found" });
    }

    const { name, slug, description, isActive } = req.body;

    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;

    if (slug !== undefined || name !== undefined) {
      const finalSlug = slug?.trim()
        ? slug
        : name
          ? generateSlug(name)
          : existingIndustry.slug;

      const slugConflict = await prisma.industry.findFirst({
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

    const industry = await prisma.industry.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json({
      status: "success",
      data: { industry },
      message: "Industry updated successfully",
    });
  } catch (error) {
    console.error("Error updating industry:", error);
    res.status(500).json({
      message: "Failed to update industry",
      error: error instanceof Error ? error.message : error,
    });
  }
};

export const deleteIndustry = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Industry ID is required" });
    }

    const industry = await prisma.industry.findFirst({
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

    await prisma.industry.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    res.status(200).json({
      status: "success",
      message: "Industry deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting industry:", error);
    res.status(500).json({ message: "Failed to delete industry" });
  }
};
