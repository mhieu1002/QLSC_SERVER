import { Router } from "express";
import { adminUserRouter } from "./adminUserRouter";
import { adminRouter } from "./adminRouter";
import { authRouter } from "./authRouter";
import { departmentRouter } from "./departmentRouter";
import { problemRouter } from "./problemRouter";
import { prinfRouter } from "./prinfRouter";

export const rootRouter = Router();

rootRouter.use("/admin-user", adminUserRouter);
rootRouter.use("/admin", adminRouter);
rootRouter.use("/auth", authRouter);
rootRouter.use("/department", departmentRouter);
rootRouter.use("/problem", problemRouter);
rootRouter.use("/prinf", prinfRouter);
