import { Router } from "express";
import {
  createPrinf,
  deletePrinf,
  getAllPrinf,
  getPrinfById,
  updatePrinf,
} from "../controllers/prinf";
import { adminMiddleware } from "../middlewares/auth/adminMiddleware";
import { problemMiddleware } from "../middlewares/auth/problemMiddleware";

export const prinfRouter = Router();

prinfRouter.post("/create", [problemMiddleware], createPrinf);
prinfRouter.put("/update/:id", [problemMiddleware], updatePrinf);
prinfRouter.delete("/delete", [adminMiddleware], deletePrinf);
prinfRouter.get("/", [problemMiddleware], getAllPrinf);
prinfRouter.get("/:id", [problemMiddleware], getPrinfById);
