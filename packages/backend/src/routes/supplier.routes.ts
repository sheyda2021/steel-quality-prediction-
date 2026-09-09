import { Router } from 'express';
import { supplierController } from '@controllers/supplier.controller';
import { authenticate } from '@middleware/auth.middleware';

const router: Router = Router();

router.post('/', authenticate, supplierController.create.bind(supplierController));
router.get('/', authenticate, supplierController.getAll.bind(supplierController));
router.get('/:id', authenticate, supplierController.getOne.bind(supplierController));
router.put('/:id', authenticate, supplierController.update.bind(supplierController));
router.delete('/:id', authenticate, supplierController.delete.bind(supplierController));

export default router;
