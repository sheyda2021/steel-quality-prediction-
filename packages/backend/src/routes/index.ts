import { Router } from 'express';
import authRoutes from './auth.routes';
import accountRoutes from './account.routes';
import journalRoutes from './journal.routes';
import customerRoutes from './customer.routes';
import supplierRoutes from './supplier.routes';
import invoiceRoutes from './invoice.routes';
import billRoutes from './bill.routes';
import bankRoutes from './bank.routes';
import reportRoutes from './report.routes';
import aiRoutes from './ai.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/accounts', accountRoutes);
router.use('/journals', journalRoutes);
router.use('/customers', customerRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/bills', billRoutes);
router.use('/bank', bankRoutes);
router.use('/reports', reportRoutes);
router.use('/ai', aiRoutes);

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
