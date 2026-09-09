import { Router } from 'express';
import { aiController } from '@controllers/ai.controller';
import { authenticate } from '@middleware/auth.middleware';

const router: Router = Router();

router.get('/forecast', authenticate, aiController.getCashFlowForecast.bind(aiController));
router.get('/anomalies', authenticate, aiController.getAnomalies.bind(aiController));
router.get('/tax-optimization', authenticate, aiController.getTaxOptimization.bind(aiController));
router.post('/categorize', authenticate, aiController.getCategorizationSuggestion.bind(aiController));
router.get('/suggestions', authenticate, aiController.getSuggestions.bind(aiController));
router.post('/suggestions/:id/apply', authenticate, aiController.applySuggestion.bind(aiController));

export default router;
