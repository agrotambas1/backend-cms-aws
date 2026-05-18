import { Request, Response } from "express";
import { prisma } from "../../../config/db";
import {
  buildCMSServicePaginationParams,
  buildCMSServiceSortParams,
  buildCMSServiceWhereCondition,
} from "../../../utils/queryBuilder/cms/service/service";
import { validateServiceData } from "../../../validators/service/serviceValidator";
import { generateSlug } from "../../../utils/generateSlug";

export const getServices = async (req: Request, res: Response) => {
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

    const where = buildCMSServiceWhereCondition({
      search: search as string,
      isActive: isActive as string,
    });

    const pagination = buildCMSServicePaginationParams(
      page as string,
      limit as string,
    );

    const orderBy = buildCMSServiceSortParams(
      sortBy as string,
      order as string,
    );

    const [services, total] = await Promise.all([
      prisma.service.findMany({
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
      prisma.service.count({ where }),
    ]);

    return res.status(200).json({
      data: services,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching services:", error);

    const message =
      process.env.NODE_ENV === "production"
        ? "Failed to fetch services"
        : (error as Error).message;

    res.status(500).json({ message });
  }
};

export const getServiceById = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Service ID is required" });
    }

    const service = await prisma.service.findFirst({
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

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    return res.status(200).json({
      data: service,
    });
  } catch (error) {
    console.error("Error fetching service:", error);

    const message =
      process.env.NODE_ENV === "production"
        ? "Failed to fetch service"
        : (error as Error).message;

    res.status(500).json({ message });
  }
};

export const createService = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const errors = validateServiceData(req.body, false);
    if (errors.length > 0) {
      return res.status(400).json({
        message: "Validation failed",
        errors,
      });
    }

    const { name, slug, description, isActive } = req.body;

    const finalSlug = slug?.trim() ? slug : generateSlug(name);

    const existing = await prisma.service.findFirst({
      where: {
        slug: finalSlug,
        deletedAt: null,
      },
    });

    if (existing) {
      return res.status(409).json({
        message: "Service with the same slug already exists",
      });
    }

    const service = await prisma.service.create({
      data: {
        name,
        slug: finalSlug,
        description: description || null,
        isActive: isActive ?? true,
      },
    });

    res.status(201).json({
      status: "success",
      data: { service },
      message: "Service created successfully",
    });
  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({
      message: "Failed to create service",
      error: error instanceof Error ? error.message : error,
    });
  }
};

export const updateService = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Service ID is required" });
    }

    const errors = validateServiceData(req.body, true);
    if (errors.length > 0) {
      return res.status(400).json({
        message: "Validation failed",
        errors,
      });
    }

    const existingService = await prisma.service.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingService) {
      return res.status(404).json({ message: "Service not found" });
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
          : existingService.slug;

      const slugConflict = await prisma.service.findFirst({
        where: {
          slug: finalSlug,
          deletedAt: null,
          NOT: { id },
        },
      });

      if (slugConflict) {
        return res.status(409).json({
          message: "Service with the same slug already exists",
        });
      }

      updateData.slug = finalSlug;
    }

    const service = await prisma.service.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json({
      status: "success",
      data: { service },
      message: "Service updated successfully",
    });
  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({
      message: "Failed to update service",
      error: error instanceof Error ? error.message : error,
    });
  }
};

export const deleteService = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Service ID is required" });
    }

    const service = await prisma.service.findFirst({
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

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    const totalUsage = service._count.caseStudies;

    if (totalUsage > 0) {
      return res.status(409).json({
        message: `Cannot delete service. It is being used in ${totalUsage} content item(s)`,
        usage: {
          caseStudies: service._count.caseStudies,
          articles: service._count.articles,
        },
      });
    }

    await prisma.service.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    res.status(200).json({
      status: "success",
      message: "Service deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({ message: "Failed to delete service" });
  }
};
