import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    email: string;
    name?: string;
  };
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401).json({ message: 'Unauthorized access. No token provided.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { email: string; name?: string };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Forbidden access. Invalid or expired token.' });
    return;
  }
};