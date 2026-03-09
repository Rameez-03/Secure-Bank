import express from 'express';
import mainRoutes from "./routes/mainRoutes.js"
import { connectDB } from './config/db.js';
import dotenv from "dotenv"
/*
import helmet from 'helmet';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import config from './src/config';
import { connectDatabase } from './src/config/database';
import { connectRedis } from './src/config/redis';
import logger from './src/utils/logger';
*/

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001

connectDB();

app.use("/api/main", mainRoutes);

app.listen(PORT, () => {
  console.log("server started");
})



/*



// ==========================================
// MIDDLEWARE
// ==========================================


// Security headers
app.use(helmet());

// CORS
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitize MongoDB queries
app.use(mongoSanitize());

// HTTP request logger
if (config.env === 'development') {
  app.use(morgan('dev'));
}

// =====================================
// BASIC ROUTES (For testing)
// =====================================

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: config.env,
  });
});

// API info
app.get('/api', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Secure Banking API',
    version: config.apiVersion,
    endpoints: {
      health: '/health',
      api: '/api',
    },
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
    path: req.path,
  });
});

// ==========================================
// ERROR HANDLER
// ==========================================

app.use((err: any, req: Request, res: Response, next: any) => {
  logger.error('Server error:', err);
  
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Internal server error',
    ...(config.env === 'development' && { stack: err.stack }),
  });
});

// ==========================================
// START SERVER
// ==========================================

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();
    logger.info('✅ MongoDB connected successfully');

    // Connect to Redis
    await connectRedis();
    logger.info('✅ Redis connected successfully');

    // Start Express server
    app.listen(config.port, () => {
      logger.info(`🚀 Server running on port ${config.port}`);
      logger.info(`📍 Environment: ${config.env}`);
      logger.info(`🔗 Health check: http://localhost:${config.port}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled Rejection:', error);
  process.exit(1);
});

// Start the server
startServer();

export default app;

*/