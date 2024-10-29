import { decode } from "@auth/core/jwt";
import { TryCatch } from "./error";
import ErrorHandler from "../utils/errorHandler";

const isAuthenticated = TryCatch(async (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) return next(new ErrorHandler(401, "Unauthorized"));

  const user = await decode({
    token: token,
    secret: process.env.AUTH_SECRET!,
    salt: process.env.AUTH_SALT!,
  });

  if (!user) return next(new ErrorHandler(401, "Unauthorized"));
  req.user = user;
  next();
});

export { isAuthenticated };
