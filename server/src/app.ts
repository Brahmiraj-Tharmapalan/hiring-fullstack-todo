import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';

export const createApp = (): Application => {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(cors());

  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      message: 'Server is running'
    });
  });

  // Welcome route
  app.get('/', (_req, res) => {
    res.json({ 
      message: 'Todo API Server',
      version: '1.0.0'
    });
  });

  return app;
};