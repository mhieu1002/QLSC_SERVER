import passport from "passport";
import { ExtractJwt, Strategy as JWTStrategy } from "passport-jwt";
import { Strategy as LocalStrategy } from "passport-local";
import { prisma } from "../../db";
import {
  comparePassword,
  createTokenAdmin,
  createTokenAdminUser,
} from "./auth";

passport.use(
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
      passReqToCallback: true,
      session: false,
    },
    async (req, username, password, done) => {
      if (!username || !password) {
        return done(null, false, { message: "Invalid credentials" });
      }
      const admin = await prisma.admin.findFirst({
        where: {
          userName: username,
        },
      });

      if (admin) {
        if (!comparePassword(password, admin.hash)) {
          return done(null, false, { message: "Invalid credentials" });
        }

        return done(null, {
          token: createTokenAdmin(admin),
          admin: {
            id: admin.id,
            fullName: admin.fullName,
            role: "superAdmin",
          },
        });
      }

      const adminUser = await prisma.adminUser.findFirst({
        where: {
          userName: username,
        },
      });

      if (adminUser) {
        if (!comparePassword(password, adminUser.hash)) {
          return done(null, false, { message: "Invalid credentials" });
        }
        return done(null, {
          token: createTokenAdminUser(adminUser),
          adminUser: {
            id: adminUser.id,
            fullName: adminUser.fullName,
            role: adminUser.role,
          },
        });
      }

      return done(null, false, { message: "Invalid credentials" });
    }
  )
);

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    async (payload, done) => {
      const admin = await prisma.admin.findUnique({
        where: {
          id: payload.id,
        },
      });

      if (admin) {
        return done(null, {
          token: createTokenAdmin(admin),
          admin: {
            id: admin.id,
            fullName: admin.fullName,
            role: "superAdmin",
          },
        });
      }

      const adminUser = await prisma.adminUser.findUnique({
        where: {
          id: payload.id,
        },
      });

      if (adminUser) {
        return done(null, {
          token: createTokenAdminUser(adminUser),
          adminUser: {
            id: adminUser.id,
            fullName: adminUser.fullName,
            role: adminUser.role,
          },
        });
      }

      return done(null, false, { message: "Invalid credentials" });
    }
  )
);

export default passport;
