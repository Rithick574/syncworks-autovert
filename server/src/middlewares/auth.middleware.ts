import jwt from "jsonwebtoken";
import { generateAccessToken } from "../__lib/http/jwt";
import { Request, Response, NextFunction } from "express";

interface UserPayload {
  _id: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { access_token, refresh_token } = req.cookies;

    if (!access_token && !refresh_token) {
      return next();
    }

    let user: UserPayload | null = null;

    if (access_token) {
      try {
        user = jwt.verify(
          access_token,
          process.env.ACCESS_TOKEN_SECRET!
        ) as UserPayload;
      } catch (error) {
        if (
          error instanceof jwt.TokenExpiredError ||
          error instanceof jwt.JsonWebTokenError
        ) {
          console.warn("Access token error:", error);
        } else {
          throw error;
        }
      }
    }

    if (!user && refresh_token) {
      try {
        user = jwt.verify(
          refresh_token,
          process.env.REFRESH_TOKEN_SECRET!
        ) as UserPayload;
        if (user) {
          const newAccessToken = generateAccessToken(user);
          res.cookie("access_token", newAccessToken, {
            httpOnly: true,
          });
        }
      } catch (error) {
        if (
          error instanceof jwt.TokenExpiredError ||
          error instanceof jwt.JsonWebTokenError
        ) {
          console.warn("Refresh token error:", error);
        } else {
          throw error;
        }
      }
    }

    req.user = user || undefined;
    next();
  } catch (error) {
    console.error("Error in JWT middleware:", error);
    next(error);
  }
};

export const protectAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (req.user && req.user.role === "admin") {
      next();
    } else {
      res.status(403).json({ error: "Not authorized as an admin" });
    }
  } catch (error) {
    console.error("Error in protect admin:", error);
    next(error);
  }
};
