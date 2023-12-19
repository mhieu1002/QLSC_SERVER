import { Router } from "express";
import {
  createAdminUser,
  deleteAdminUsers,
  getAdminUserById,
  getAllAdminUsers,
  getAllAdminUsersNoPagination,
  updateAdminUser,
} from "../controllers/adminUserController";
import { adminMiddleware } from "../middlewares/auth/adminMiddleware";

export const adminUserRouter = Router();
adminUserRouter.get("/", [adminMiddleware], getAllAdminUsers);
adminUserRouter.get(
  "/no-pagination",
  [adminMiddleware],
  getAllAdminUsersNoPagination
);
adminUserRouter.get("/:id", [adminMiddleware], getAdminUserById);
adminUserRouter.post("/create", [adminMiddleware], createAdminUser);
adminUserRouter.put("/update/:id", [adminMiddleware], updateAdminUser);
adminUserRouter.delete("/delete", [adminMiddleware], deleteAdminUsers);
