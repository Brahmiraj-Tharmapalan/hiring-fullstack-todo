import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { logger } from './middleware/logger';
import todoRoutes from './modules/todo/todo.routes';
import { errorHandler } from './middleware/errorHandler';

export const createApp = (): Application => {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(logger);

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/health', (_req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      message: 'Server is running'
    });
  });

  app.get('/', (_req, res) => {
    res.json({ 
      message: 'Todo API Server',
      version: '1.0.0'
    });
  });

  app.use('/api/todos', todoRoutes);

  app.use(errorHandler);

  return app;
};