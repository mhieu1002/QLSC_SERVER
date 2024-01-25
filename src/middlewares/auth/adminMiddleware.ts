import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../../db";
import { BadRequest } from "../request-handlers";
import { omit } from "lodash";

const adminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const accessToken = req.headers?.authorization?.split(" ")[1] || "";
    const { id } = jwt.decode(accessToken) as { id: number };
    const user = await prisma.admin.findUnique({
      where: {
        id,
      },
    });
    console.log(user)
    if (!user) {
      throw new BadRequest({
        message: "Unauthorized",
      });
    }
    req.user = omit(user, ["hash"]);
    return next();
  } catch (error) {
    return res.status(401).send({ error: "Unauthenticated!" });
  }
};

export { adminMiddleware };
