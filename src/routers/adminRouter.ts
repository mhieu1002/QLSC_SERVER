import { Router } from "express";
import { createAdmin } from "../controllers/adminController.ts";

export const adminRouter = Router();

adminRouter.post("/create", createAdmin);
