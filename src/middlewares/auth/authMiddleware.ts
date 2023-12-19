import passport from "passport";

const authMiddleware = passport.authenticate("jwt", { session: false });

const authLocalMiddleware = passport.authenticate("local", { session: false });

export { authMiddleware, authLocalMiddleware };
