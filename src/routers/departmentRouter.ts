import { Router } from "express";
import {
  createDepartment,
  deleteDepartments,
  getAllDepartment,
  getAllDepartmentNoPagination,
  getDepartmentById,
  updateDepartment,
} from "../controllers/department";
import { adminMiddleware } from "../middlewares/auth/adminMiddleware";

export const departmentRouter = Router();

departmentRouter.post("/create", [adminMiddleware], createDepartment);
departmentRouter.put("/update/:id", [adminMiddleware], updateDepartment);
departmentRouter.delete("/delete", [adminMiddleware], deleteDepartments);
departmentRouter.get("/", [adminMiddleware], getAllDepartment);
departmentRouter.get(
  "/no-pagination",
  [adminMiddleware],
  getAllDepartmentNoPagination
);
departmentRouter.get("/:id", [adminMiddleware], getDepartmentById);
