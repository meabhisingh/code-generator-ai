import { JWT } from "@auth/core/jwt";
import { Request } from "express";

declare module "express-serve-static-core" {
  interface Request {
    user?: JWT; // You can replace `any` with a specific type if you have one
  }
}
