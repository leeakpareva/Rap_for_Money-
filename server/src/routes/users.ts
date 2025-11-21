import { Router } from 'express';
import { getUserProfile, followUser, unfollowUser, searchUsers } from '../controllers/userController';
import { getUserPosts } from '../controllers/postController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/search', searchUsers);
router.get('/:username', getUserProfile);
router.get('/:username/posts', getUserPosts);
router.post('/:id/follow', authenticate, followUser);
router.post('/:id/unfollow', authenticate, unfollowUser);

export default router;