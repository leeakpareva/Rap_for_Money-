import { Request, Response } from 'express';
import LiveStream from '../models/LiveStream';
import { AuthRequest } from '../middleware/auth';
import { generateRoomId } from '../utils/helpers';
import { signalingStore } from '../utils/signaling';

export const createLivestream = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Check if user already has an active stream
    const existingStream = await LiveStream.findOne({
      host: req.userId,
      isActive: true
    });

    if (existingStream) {
      res.status(400).json({ error: 'You already have an active stream' });
      return;
    }

    const roomId = generateRoomId();

    const stream = await LiveStream.create({
      host: req.userId,
      roomId,
      startedAt: new Date()
    });

    res.status(201).json({
      stream: {
        id: stream._id,
        roomId: stream.roomId,
        startedAt: stream.startedAt,
        maxDurationSeconds: stream.maxDurationSeconds
      }
    });
  } catch (error) {
    console.error('Create livestream error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const endLivestream = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { roomId } = req.params;

    const stream = await LiveStream.findOne({ roomId });
    if (!stream) {
      res.status(404).json({ error: 'Stream not found' });
      return;
    }

    if (stream.host.toString() !== req.userId) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    await LiveStream.findByIdAndUpdate(stream._id, {
      isActive: false,
      endedAt: new Date()
    });

    // Clear signaling data
    signalingStore.clearRoom(roomId);

    res.json({ message: 'Stream ended successfully' });
  } catch (error) {
    console.error('End livestream error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getActiveStreams = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const streams = await LiveStream.find({ isActive: true })
      .populate('host', 'username displayName profileImageUrl')
      .sort({ startedAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ streams, page, hasMore: streams.length === limit });
  } catch (error) {
    console.error('Get active streams error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getStreamInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { roomId } = req.params;

    const stream = await LiveStream.findOne({ roomId })
      .populate('host', 'username displayName profileImageUrl');

    if (!stream) {
      res.status(404).json({ error: 'Stream not found' });
      return;
    }

    res.json({ stream });
  } catch (error) {
    console.error('Get stream info error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const sendSignal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { roomId } = req.params;
    const { type, data, to } = req.body;

    const stream = await LiveStream.findOne({ roomId, isActive: true });
    if (!stream) {
      res.status(404).json({ error: 'Stream not found or inactive' });
      return;
    }

    const message = {
      type,
      from: req.userId as string,
      to,
      data,
      timestamp: Date.now()
    };

    signalingStore.addMessage(roomId, message);

    res.json({ message: 'Signal sent successfully' });
  } catch (error) {
    console.error('Send signal error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getSignals = async (req: Request, res: Response): Promise<void> => {
  try {
    const { roomId } = req.params;
    const since = req.query.since ? parseInt(req.query.since as string) : undefined;

    const stream = await LiveStream.findOne({ roomId, isActive: true });
    if (!stream) {
      res.status(404).json({ error: 'Stream not found or inactive' });
      return;
    }

    const messages = signalingStore.getMessages(roomId, since);

    res.json({ messages });
  } catch (error) {
    console.error('Get signals error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};