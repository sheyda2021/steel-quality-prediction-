import { Router } from 'express';
import { journalController } from '@controllers/journal.controller';
import { authenticate, authorize } from '@middleware/auth.middleware';
import { UserRole } from '@shared';

const router = Router();

router.post('/', authenticate, authorize(UserRole.Admin, UserRole.Manager, UserRole.Accountant), journalController.create.bind(journalController));
router.get('/', authenticate, journalController.getAll.bind(journalController));
router.get('/:id', authenticate, journalController.getOne.bind(journalController));
router.post('/:id/post', authenticate, authorize(UserRole.Admin, UserRole.Manager), journalController.post.bind(journalController));
router.delete('/:id', authenticate, authorize(UserRole.Admin, UserRole.Manager), journalController.delete.bind(journalController));

export default router;
