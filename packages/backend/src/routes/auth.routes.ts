import { Router } from 'express';
import { authController } from '@controllers/auth.controller';

const router: Router = Router();

router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
router.post('/refresh-token', authController.refreshToken.bind(authController));
router.post('/change-password/:userId', authController.changePassword.bind(authController));
router.get('/profile/:userId', authController.getProfile.bind(authController));

export default router;
