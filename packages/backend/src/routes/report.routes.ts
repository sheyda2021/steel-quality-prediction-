import { Router } from 'express';
import { reportController } from '@controllers/report.controller';
import { authenticate } from '@middleware/auth.middleware';

const router: Router = Router();

router.get('/:type', authenticate, reportController.generate.bind(reportController));

export default router;
