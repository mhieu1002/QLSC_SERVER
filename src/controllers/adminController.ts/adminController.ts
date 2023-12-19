import { NextFunction, Request, Response } from "express";
import { prisma } from "../../db";
import { hashPassword } from "../../plugins/auth";
import { BadRequest } from "../../middlewares/request-handlers";

const createAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userName, fullName, password, role } = req.body;

    const admin = await prisma.admin.findFirst({
      where: {
        userName,
      },
    });
    if (admin) {
      throw new BadRequest({
        message: "User name already exists",
      });
    }
    const hash = hashPassword(password);
    const newAdmin = await prisma.admin.create({
      data: {
        userName,
        fullName,
        hash,
        role,
      },
    });

    res.status(201).json({
      message: "Admin created",
      data: newAdmin,
    });
  } catch (error) {
    next(error);
  }
};

export { createAdmin };
