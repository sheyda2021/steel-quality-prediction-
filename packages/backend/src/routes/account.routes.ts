import { Router } from 'express';
import { accountController } from '@controllers/account.controller';
import { authenticate, authorize } from '@middleware/auth.middleware';
import { UserRole } from '@shared';

const router = Router();

router.post('/', authenticate, authorize(UserRole.Admin, UserRole.Manager, UserRole.Accountant), accountController.create.bind(accountController));
router.get('/', authenticate, accountController.getAll.bind(accountController));
router.get('/chart', authenticate, accountController.getChart.bind(accountController));
router.get('/:id', authenticate, accountController.getOne.bind(accountController));
router.put('/:id', authenticate, authorize(UserRole.Admin, UserRole.Manager), accountController.update.bind(accountController));
router.delete('/:id', authenticate, authorize(UserRole.Admin, UserRole.Manager), accountController.delete.bind(accountController));

export default router;
