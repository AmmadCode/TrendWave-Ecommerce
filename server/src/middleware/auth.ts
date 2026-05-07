import { getAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { User } from "../models/User";
import { asyncHandler } from "../utils/asyncHandler";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const { userId } = getAuth(req);

  if (!userId) {
    return next(
      new AppError(401, "User is not logged in. Measns unauth user!"),
    );
  }

  next();
}
// helper function
export async function getDbUserFromReq(req: Request) {
  const { userId } = getAuth(req);

  if (!userId) {
    throw new AppError(401, "User is not logged in. Means unauth user");
  }

  const dbUser = await User.findOne({ clerkUserId: userId });

  if (!dbUser) {
    throw new AppError(404, "User not found in db");
  }

  return dbUser;
}

// admin gate
// logged in + admin access

export const requireAdmin = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const extractCurrentDbUser = await getDbUserFromReq(req);
    if (extractCurrentDbUser.role !== "admin") {
      throw new AppError(403, "Admin access only");
    }

    next();
  },
);
