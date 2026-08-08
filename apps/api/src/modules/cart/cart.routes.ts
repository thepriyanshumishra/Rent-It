import { Router } from 'express';
import { CartController } from './cart.controller';
import { validate } from '../../middleware/validate';
import { authenticateToken } from '../../middleware/auth';
import { addToCartSchema, updateCartItemSchema } from './cart.schema';

const router = Router();

router.use(authenticateToken);

router.get('/', CartController.getCart);
router.post('/items', validate(addToCartSchema), CartController.addItem);
router.put('/items/:itemId', validate(updateCartItemSchema), CartController.updateItem);
router.delete('/items/:itemId', CartController.removeItem);
router.delete('/', CartController.clearCart);

export default router;
