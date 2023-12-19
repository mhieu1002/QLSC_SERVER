import { Router } from "express";
import {
  createProblem,
  deleteProblems,
  getAllProblem,
  getProblemById,
  problemReport,
  problemStatistical,
  updateProblem,
} from "../controllers/problem";
import { adminMiddleware } from "../middlewares/auth/adminMiddleware";
import { problemMiddleware } from "../middlewares/auth/problemMiddleware";

export const problemRouter = Router();

problemRouter.post("/create", [problemMiddleware], createProblem);
problemRouter.put("/update/:id", [problemMiddleware], updateProblem);
problemRouter.delete("/delete", [adminMiddleware], deleteProblems);
problemRouter.get("/", [problemMiddleware], getAllProblem);
problemRouter.get("/:id", [problemMiddleware], getProblemById);
problemRouter.get(
  "/report/department-industry",
  [adminMiddleware],
  problemReport
);
problemRouter.get("/report/statistical", [adminMiddleware], problemStatistical);
