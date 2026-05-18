import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const verifyToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401).json({ success: false, message: "Unauthorized access. No token found! 🐾" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string; email: string };
    req.user = decoded;
    next(); 
  } catch (error) {
    res.status(403).json({ success: false, message: "Invalid or expired token. Please log in again! 🌸" });
    return;
  }
};