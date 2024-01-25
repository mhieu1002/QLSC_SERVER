import { NextFunction, Request, Response } from "express";
import { BadRequest } from "../request-handlers";
import { prisma } from "../../db";
import jwt from "jsonwebtoken";
import { omit } from "lodash";

const problemMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const accessToken = req.headers?.authorization?.split(" ")[1] || "";

    const { id, role } = jwt.decode(accessToken) as {
      id: number;
      role: string;
    };

    const adminUser = await prisma.adminUser.findUnique({
      where: {
        id,
        role : {
          contains: role,
          mode: "insensitive"
        },
      },
    });
    if (adminUser) {
      req.user = omit(adminUser, ["hash"]);
      return next();
    }

    const admin = await prisma.admin.findUnique({
      where: {
        id,
      },
    });

    if (admin) {
      req.user = omit(
        {
          ...admin,
          role: "superAdmin",
        },
        ["hash"]
      );
      return next();
    }
    throw new BadRequest({
      message: "Unauthorized",
    });
  } catch (error) {
    return res.status(401).send({ error: "Unauthenticated!" });
  }
};

export { problemMiddleware };
