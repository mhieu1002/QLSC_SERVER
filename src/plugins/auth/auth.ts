import { Admin, AdminUser } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const hashPassword = (password: string) => {
  return bcrypt.hashSync(password, 10);
};

const comparePassword = (password: string, hash: string) => {
  return bcrypt.compareSync(password, hash);
};

const createTokenAdmin = (user: Admin) => {
  return jwt.sign(
    { id: user.id, fullName: user.fullName, role: "superAdmin" },
    process.env.JWT_SECRET,
    {
      expiresIn: "24d",
    }
  );
};

const createTokenAdminUser = (user: AdminUser) => {
  return jwt.sign(
    { id: user.id, fullName: user.fullName, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: "24d",
    }
  );
};

export {
  comparePassword,
  createTokenAdmin,
  hashPassword,
  createTokenAdminUser,
};
