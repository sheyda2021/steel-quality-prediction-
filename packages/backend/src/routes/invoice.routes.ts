import { Router } from 'express';
import { invoiceController } from '@controllers/invoice.controller';
import { authenticate } from '@middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, invoiceController.create.bind(invoiceController));
router.get('/', authenticate, invoiceController.getAll.bind(invoiceController));
router.get('/:id', authenticate, invoiceController.getOne.bind(invoiceController));
router.put('/:id', authenticate, invoiceController.update.bind(invoiceController));
router.post('/:id/post', authenticate, invoiceController.post.bind(invoiceController));
router.post('/:id/payment', authenticate, invoiceController.makePayment.bind(invoiceController));
router.post('/:id/cancel', authenticate, invoiceController.cancel.bind(invoiceController));
router.get('/customer/:customerId/balance', authenticate, invoiceController.getCustomerBalance.bind(invoiceController));

export default router;
