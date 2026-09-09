import { Router } from 'express';
import { billController } from '@controllers/bill.controller';
import { authenticate } from '@middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, billController.create.bind(billController));
router.get('/', authenticate, billController.getAll.bind(billController));
router.get('/:id', authenticate, billController.getOne.bind(billController));
router.put('/:id', authenticate, billController.update.bind(billController));
router.post('/:id/post', authenticate, billController.post.bind(billController));
router.post('/:id/payment', authenticate, billController.makePayment.bind(billController));
router.post('/:id/cancel', authenticate, billController.cancel.bind(billController));

export default router;
