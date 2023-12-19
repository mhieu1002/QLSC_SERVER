import { NextFunction, Request, Response } from "express";
import { prisma } from "../../db";
import { BadRequest } from "../../middlewares/request-handlers";
import { hashPassword } from "../../plugins/auth";
import { omit } from "lodash";

const createAdminUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code, userName, fullName, password, role, departmentId, adminId } =
      req.body;
    const adminUser = await prisma.adminUser.findFirst({
      where: {
        userName,
      },
    });
    if (adminUser) {
      throw new BadRequest({
        message: "User name already exists",
      });
    }
    const hash = hashPassword(password);
    const newAdminUser = await prisma.adminUser.create({
      data: {
        code,
        userName,
        fullName,
        hash,
        role,
        departmentId,
        adminId,
      },
    });

    res.status(201).json({
      message: "Admin user created",
      data: omit(newAdminUser, ["hash"]),
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log("🚀 ~ file: adminUserController.ts:42 ~ error:", error);
    next(error);
  }
};

const updateAdminUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { code, userName, fullName, role, departmentId, adminId } = req.body;
    const adminUser = await prisma.adminUser.findUnique({
      where: {
        id: parseInt(id),
      },
    });
    if (!adminUser) {
      throw new BadRequest({
        message: "Admin user not found",
      });
    }
    const updatedAdminUser = await prisma.adminUser.update({
      where: {
        id: parseInt(id),
      },
      data: {
        code,
        userName,
        fullName,
        role,
        departmentId,
        adminId,
      },
    });
    res.status(200).json({
      message: "Admin user updated",
      data: omit(updatedAdminUser, ["hash"]),
    });
  } catch (error) {
    next(error);
  }
};

const getAllAdminUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const take = limit;
    const skip = (page - 1) * limit;
    const adminUsers = await prisma.adminUser.findMany({
      take,
      skip,
      orderBy: {
        createdAt: "desc",
      },
    });
    const totalAdminUser = await prisma.adminUser.count();
    const adminUsersPromise = await Promise.all(
      adminUsers.map(async (adminUser) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { hash, ...rest } = adminUser;
        const department = await prisma.department.findUnique({
          where: {
            id: adminUser.departmentId,
          },
          select: {
            name: true,
          },
        });
        return {
          ...rest,
          departmentName: department?.name,
        };
      })
    );
    res.status(200).json({
      message: "Admin users fetched",
      data: {
        adminUsers: adminUsersPromise,
        meta: {
          page,
          limit,
          total: totalAdminUser,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAdminUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const adminUser = await prisma.adminUser.findUnique({
      where: {
        id: parseInt(id),
      },
    });
    if (!adminUser) {
      throw new BadRequest({
        message: "Admin user not found",
      });
    }
    res.status(200).json({
      message: "Admin user fetched",
      data: omit(adminUser, ["hash"]),
    });
  } catch (error) {
    next(error);
  }
};

const deleteAdminUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { ids } = req.query;

    const idArray = Array.isArray(ids) ? ids.map(Number) : [Number(ids)];

    await prisma.adminUser.deleteMany({
      where: {
        id: {
          in: idArray,
        },
      },
    });
    res.status(200).json({
      message: "Admin user deleted",
    });
  } catch (error) {
    next(error);
  }
};

const getAllAdminUsersNoPagination = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const adminUsers = await prisma.adminUser.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    const adminUsersPromise = await Promise.all(
      adminUsers.map(async (adminUser) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { hash, ...rest } = adminUser;
        const department = await prisma.department.findUnique({
          where: {
            id: adminUser.departmentId,
          },
          select: {
            name: true,
          },
        });
        return {
          ...rest,
          departmentName: department?.name,
        };
      })
    );
    res.status(200).json({
      message: "Admin users fetched",
      data: adminUsersPromise,
    });
  } catch (error) {
    next(error);
  }
};

export {
  createAdminUser,
  getAllAdminUsers,
  getAdminUserById,
  updateAdminUser,
  deleteAdminUsers,
  getAllAdminUsersNoPagination,
};
