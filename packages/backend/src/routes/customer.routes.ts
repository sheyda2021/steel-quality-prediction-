import { Router } from 'express';
import { customerController } from '@controllers/customer.controller';
import { authenticate } from '@middleware/auth.middleware';

const router: Router = Router();

router.post('/', authenticate, customerController.create.bind(customerController));
router.get('/', authenticate, customerController.getAll.bind(customerController));
router.get('/:id', authenticate, customerController.getOne.bind(customerController));
router.put('/:id', authenticate, customerController.update.bind(customerController));
router.delete('/:id', authenticate, customerController.delete.bind(customerController));

export default router;
