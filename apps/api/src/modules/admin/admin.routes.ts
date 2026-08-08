import { Router } from 'express';
import { AdminController } from './admin.controller';
import { authenticateToken, requireRole } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createProductSchema } from '../products/products.schema';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticateToken);
router.use(requireRole(Role.ADMIN, Role.STAFF));

router.get('/dashboard', AdminController.getDashboardMetrics);
router.get('/inventory', AdminController.getInventory);
router.post('/inventory', AdminController.createInventoryItem);
router.put('/inventory/:id/status', AdminController.updateInventoryStatus);

router.get('/repairs', AdminController.getRepairs);
router.put('/repairs/:id', AdminController.updateRepair);

router.post('/products', validate(createProductSchema), AdminController.createProduct);

export default router;
