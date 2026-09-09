import { Router } from 'express';
import { bankController } from '@controllers/bank.controller';
import { authenticate } from '@middleware/auth.middleware';

const router = Router();

router.post('/accounts', authenticate, bankController.createAccount.bind(bankController));
router.get('/accounts', authenticate, bankController.getAccounts.bind(bankController));
router.get('/accounts/:id', authenticate, bankController.getAccount.bind(bankController));
router.post('/transactions', authenticate, bankController.createTransaction.bind(bankController));
router.get('/transactions', authenticate, bankController.getTransactions.bind(bankController));
router.post('/accounts/:bankAccountId/reconcile', authenticate, bankController.reconcile.bind(bankController));

export default router;
