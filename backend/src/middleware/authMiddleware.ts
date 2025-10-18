import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface DecodedToken {
  _id: string; // ✅ Updated from 'id' to '_id'
  email: string;
  role: 'admin' | 'doctor' | 'patient';
}

// ✅ Extend Express Request type to include `user`
declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}

// ✅ Auth middleware
export const protect = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// ✅ Role-based access control
export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role || '')) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};
