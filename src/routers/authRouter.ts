import { Request, Response, Router } from "express";
import { omit } from "lodash";
import passport from "passport";
import {
  changePasswordAdmin,
  updateProfileAdmin,
} from "../controllers/authController";
import { authCommonMiddleware } from "../middlewares/auth";

export const authRouter = Router();

authRouter.post(
  "/login",
  [passport.authenticate("local", { session: false })],
  (req: Request, res: Response) => {
    res.status(200).json({ message: "Success", data: req.user });
  }
);
authRouter.get(
  "/profile",
  [authCommonMiddleware],
  (req: Request, res: Response) => {
    res
      .status(200)
      .json({ message: "Success", data: omit(req.user, ["hash"]) });
  }
);
authRouter.put("/change-password", [authCommonMiddleware], changePasswordAdmin);

authRouter.put("/update-profile", [authCommonMiddleware], updateProfileAdmin);
