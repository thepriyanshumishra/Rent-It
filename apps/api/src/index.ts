import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './modules/auth/auth.routes';
import productsRoutes from './modules/products/products.routes';
import cartRoutes from './modules/cart/cart.routes';
import rentalsRoutes from './modules/rentals/rentals.routes';
import adminRoutes from './modules/admin/admin.routes';
import quotationsRoutes from './modules/quotations/quotations.routes';

const app = express();

// Global Middlewares
app.use(helmet());
app.use(
  cors({
    origin: config.CORS_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json());
app.use(morgan(config.NODE_ENV === 'development' ? 'dev' : 'combined'));

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'rentit-api', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/rentals', rentalsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/quotations', quotationsRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { message: `Route '${req.originalUrl}' not found`, code: 'NOT_FOUND' },
  });
});

// Error Handling Middleware
app.use(errorHandler);

app.listen(config.PORT, () => {
  console.log(`🚀 RentIt API Server running at http://localhost:${config.PORT}`);
});

export default app;
