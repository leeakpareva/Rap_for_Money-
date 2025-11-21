import { Router } from 'express';
import { getUserProfile, followUser, unfollowUser, searchUsers, updateProfile, updateProfilePicture } from '../controllers/userController';
import { getUserPosts } from '../controllers/postController';
import { authenticate } from '../middleware/auth';
import upload from '../middleware/upload';

const router = Router();

router.get('/search', searchUsers);
router.get('/:username', getUserProfile);
router.get('/:username/posts', getUserPosts);
router.post('/:id/follow', authenticate, followUser);
router.post('/:id/unfollow', authenticate, unfollowUser);
router.put('/profile', authenticate, updateProfile);
router.put('/profile/picture', authenticate, upload.single('profilePicture'), updateProfilePicture);

export default router;