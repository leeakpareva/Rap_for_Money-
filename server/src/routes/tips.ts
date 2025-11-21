import { Router } from 'express';
import { createTip, getUserTips, getPostTips, getTopEarners } from '../controllers/tipController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, createTip);
router.get('/user', authenticate, getUserTips);
router.get('/post/:postId', getPostTips);
router.get('/leaderboard', getTopEarners);

export default router;