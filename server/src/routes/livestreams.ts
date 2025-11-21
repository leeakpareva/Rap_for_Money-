import { Router } from 'express';
import {
  createLivestream,
  endLivestream,
  getActiveStreams,
  getStreamInfo,
  sendSignal,
  getSignals
} from '../controllers/livestreamController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, createLivestream);
router.post('/:roomId/end', authenticate, endLivestream);
router.get('/active', getActiveStreams);
router.get('/:roomId', getStreamInfo);
router.post('/:roomId/signal', authenticate, sendSignal);
router.get('/:roomId/signal', getSignals);

export default router;