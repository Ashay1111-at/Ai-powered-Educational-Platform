import { Request, Response, NextFunction } from 'express';
// import admin from './firebase-admin'; // To be configured with service account

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split('Bearer ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // const decodedToken = await admin.auth().verifyIdToken(token);
    // (req as any).user = decodedToken;
    
    // For now, allow all if in development and no token check is needed
    // In production, uncomment the above
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
