import { NextFunction, Request, Response } from "express";
import { prisma } from "../../db";
import slugify from "slugify";
import { BadRequest } from "../../middlewares/request-handlers";

const createDepartment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, code } = req.body;
    const department = await prisma.department.create({
      data: {
        name,
        code,
        slug: slugify(name, { lower: true }),
      },
    });
    res.status(201).json({
      message: "Department created successfully",
      data: department,
    });
  } catch (error) {
    next(error);
  }
};

const updateDepartment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { name, code } = req.body;
    const department = await prisma.department.update({
      where: {
        id: parseInt(id),
      },
      data: {
        name,
        code,
        slug: slugify(name, { lower: true }),
      },
    });
    res.status(200).json({
      message: "Department updated successfully",
      data: department,
    });
  } catch (error) {
    next(error);
  }
};

const deleteDepartments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { ids } = req.query;
    const idArray = Array.isArray(ids) ? ids.map(Number) : [Number(ids)];

    const departments = await prisma.department.deleteMany({
      where: {
        id: {
          in: idArray,
        },
      },
    });
    res.status(200).json({
      message: "Departments deleted successfully",
      data: departments,
    });
  } catch (error) {
    next(error);
  }
};

const getAllDepartment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const departments = await prisma.department.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });
    const totalDepartment = await prisma.department.count();

    res.status(200).json({
      message: "Departments fetched successfully",
      data: {
        departments,
        meta: {
          page,
          limit,
          total: totalDepartment,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getDepartmentById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const department = await prisma.department.findFirst({
      where: {
        id: parseInt(id),
      },
    });
    if (!department) {
      throw new BadRequest({
        message: "Department not found",
      });
    }
    res.status(200).json({
      message: "Department fetched",
      data: department,
    });
  } catch (error) {
    next(error);
  }
};

const getAllDepartmentNoPagination = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const departments = await prisma.department.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    res.status(200).json({
      message: "Departments fetched successfully",
      data: departments,
    });
  } catch (error) {
    next(error);
  }
};

export {
  createDepartment,
  updateDepartment,
  deleteDepartments,
  getAllDepartment,
  getDepartmentById,
  getAllDepartmentNoPagination,
};
