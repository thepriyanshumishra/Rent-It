import { Router } from 'express';
import { ProductsController } from './products.controller';
import { validate } from '../../middleware/validate';
import { getProductsSchema, checkAvailabilitySchema } from './products.schema';

const router = Router();

router.get('/', validate(getProductsSchema), ProductsController.getProducts);
router.get('/categories', ProductsController.getCategories);
router.get('/:id', ProductsController.getProductById);
router.get('/:id/availability', validate(checkAvailabilitySchema), ProductsController.checkAvailability);

export default router;
