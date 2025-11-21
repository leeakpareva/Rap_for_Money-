import { Router } from 'express';
import { createPost, getFeed, getPost, likePost, unlikePost, deletePost, getTrendingPosts, searchPostsByHashtag, getTrendingHashtags } from '../controllers/postController';
import { authenticate } from '../middleware/auth';
import upload from '../middleware/upload';

const router = Router();

router.post('/', authenticate, upload.single('file'), createPost);
router.get('/feed', authenticate, getFeed);
router.get('/trending', getTrendingPosts);
router.get('/hashtags/trending', getTrendingHashtags);
router.get('/hashtag/:hashtag', searchPostsByHashtag);
router.get('/:id', getPost);
router.post('/:id/like', authenticate, likePost);
router.post('/:id/unlike', authenticate, unlikePost);
router.delete('/:id', authenticate, deletePost);

export default router;