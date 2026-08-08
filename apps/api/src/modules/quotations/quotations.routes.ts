import { Router } from 'express';
import { QuotationsController } from './quotations.controller';
import { authenticateToken } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createQuotationSchema } from './quotations.schema';

const router = Router();
router.use(authenticateToken);

router.get('/', QuotationsController.getQuotations);
router.post('/', validate(createQuotationSchema), QuotationsController.createQuotation);

export default router;
