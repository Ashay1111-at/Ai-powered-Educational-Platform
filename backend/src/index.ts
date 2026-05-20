import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import aiRoutes from './routes/ai';
import courseRoutes from './routes/courses';
import userRoutes from './routes/users';
import paymentRoutes from './routes/payments';
import communityRoutes from './routes/community';
import logger from './lib/logger';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(helmet());
// Morgan streams HTTP access logs through Winston
app.use(morgan('combined', {
  stream: { write: (message) => logger.http(message.trim()) }
}));

// Webhook needs raw body, so mount it before express.json()
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'AI Smart Learning API is running' });
});

// Basic user sync route (to be expanded with Firebase Auth)
// This must be ABOVE app.use('/api/users', userRoutes) to be public
app.post('/api/users/sync', async (req, res) => {
  const { email, name, firebaseUid, role } = req.body;
  logger.info('Syncing user', { email, firebaseUid, role });
  try {
    const existingUser = await prisma.user.findUnique({
      where: { firebaseUid }
    });

    const roleHierarchy: Record<string, number> = {
      'STUDENT': 0,
      'INSTRUCTOR': 1,
      'ADMIN': 2
    };

    let finalRole = role;
    if (existingUser && role) {
      const currentLevel = roleHierarchy[existingUser.role] || 0;
      const requestedLevel = roleHierarchy[role] || 0;
      
      // Never downgrade role via sync
      if (requestedLevel < currentLevel) {
        finalRole = existingUser.role;
      }
    }

    const user = await prisma.user.upsert({
      where: { email },
      update: { 
        firebaseUid,
        name,
        role: finalRole || undefined
      },
      create: { 
        email, 
        name, 
        firebaseUid, 
        role: finalRole || 'STUDENT' 
      },
    });
    res.json(user);
  } catch (error) {
    logger.error('Sync error', { error });
    res.status(500).json({ error: 'Failed to sync user' });
  }
});

app.use('/api/ai', aiRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/community', communityRoutes);

app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

export { prisma };
