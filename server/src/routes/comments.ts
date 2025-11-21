import { Router } from 'express';
import { getComments, createComment, deleteComment } from '../controllers/commentController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/:id/comments', getComments);
router.post('/:id/comments', authenticate, createComment);
router.delete('/:id', authenticate, deleteComment);

export default router;