import { AdminUser } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { ROLE } from "../../constants/role";
import { prisma } from "../../db";
import { comparePassword, hashPassword } from "../../plugins/auth";

const changePasswordAdminUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user as AdminUser;
    const { currentPassword, newPassword } = req.body;
    const compareHash = comparePassword(currentPassword, user.hash);
    if (compareHash) {
      throw new Error("New password must be different from old password");
    }
    const hash = hashPassword(newPassword);
    await prisma.adminUser.update({
      where: {
        id: user.id,
      },
      data: {
        hash,
      },
    });
  } catch (error) {
    next(error);
  }
};

const changePasswordAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = req.user as any;
    const { currentPassword, newPassword } = req.body;
    const compareHash = comparePassword(currentPassword, user.hash);
    if (compareHash) {
      throw new Error("New password must be different from old password");
    }
    const hash = hashPassword(newPassword);
    if (user.role === ROLE.SUPER_ADMIN) {
      await prisma.admin.update({
        where: {
          id: user.id,
        },
        data: {
          hash,
        },
      });
    }
    await prisma.adminUser.update({
      where: {
        id: user.id,
      },
      data: {
        hash,
      },
    });
    res.status(200).json({
      message: "Change password success",
    });
  } catch (error) {
    next(error);
  }
};

const updateProfileAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = req.user as any;
    const { fullName, userName } = req.body;
    if (user.role === ROLE.SUPER_ADMIN) {
      await prisma.admin.update({
        where: {
          id: user.id,
        },
        data: {
          fullName,
          userName,
        },
      });
    }

    await prisma.adminUser.update({
      where: {
        id: user.id,
      },
      data: {
        fullName,
        userName,
      },
    });
    res.status(200).json({
      message: "Update profile success",
    });
  } catch (error) {
    next(error);
  }
};

const updateProfileAdminUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user as AdminUser;
    const { fullName, userName } = req.body;
    await prisma.adminUser.update({
      where: {
        id: user.id,
      },
      data: {
        fullName,
        userName,
      },
    });
  } catch (error) {
    next(error);
  }
};

export {
  changePasswordAdmin,
  changePasswordAdminUser,
  updateProfileAdmin,
  updateProfileAdminUser,
};
