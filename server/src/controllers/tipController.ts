import { Request, Response } from 'express';
import Tip from '../models/Tip';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

export const createTip = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { toUserId, amount, message, postId } = req.body;
    const fromUserId = req.userId;

    if (fromUserId === toUserId) {
      res.status(400).json({ error: 'Cannot tip yourself' });
      return;
    }

    if (amount < 1 || amount > 1000) {
      res.status(400).json({ error: 'Amount must be between $0.01 and $10.00' });
      return;
    }

    const toUser = await User.findById(toUserId);
    if (!toUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // For MVP, we'll simulate payment processing
    // In production, integrate with Stripe, PayPal, or similar
    const tip = await Tip.create({
      from: fromUserId,
      to: toUserId,
      amount,
      message,
      post: postId,
      status: 'completed' // Simulating successful payment
    });

    const populatedTip = await Tip.findById(tip._id)
      .populate('from', 'username displayName profileImageUrl')
      .populate('to', 'username displayName profileImageUrl')
      .populate('post', 'caption mediaUrl');

    res.status(201).json({
      tip: populatedTip,
      message: 'Tip sent successfully!'
    });
  } catch (error) {
    console.error('Create tip error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getUserTips = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type } = req.query; // 'sent' or 'received'
    const userId = req.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const filter = type === 'sent' ? { from: userId } : { to: userId };

    const tips = await Tip.find(filter)
      .populate('from', 'username displayName profileImageUrl')
      .populate('to', 'username displayName profileImageUrl')
      .populate('post', 'caption mediaUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalEarnings = type === 'received'
      ? await Tip.aggregate([
          { $match: { to: userId, status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ])
      : [];

    res.json({
      tips,
      page,
      hasMore: tips.length === limit,
      totalEarnings: totalEarnings[0]?.total || 0
    });
  } catch (error) {
    console.error('Get user tips error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getPostTips = async (req: Request, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;

    const tips = await Tip.find({ post: postId, status: 'completed' })
      .populate('from', 'username displayName profileImageUrl')
      .sort({ createdAt: -1 })
      .limit(10);

    const totalAmount = await Tip.aggregate([
      { $match: { post: postId, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      tips,
      totalAmount: totalAmount[0]?.total || 0,
      tipCount: tips.length
    });
  } catch (error) {
    console.error('Get post tips error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getTopEarners = async (req: Request, res: Response): Promise<void> => {
  try {
    const timeframe = req.query.timeframe as string || 'all'; // 'week', 'month', 'all'
    let dateFilter = {};

    if (timeframe === 'week') {
      dateFilter = { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } };
    } else if (timeframe === 'month') {
      dateFilter = { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } };
    }

    const topEarners = await Tip.aggregate([
      { $match: { status: 'completed', ...dateFilter } },
      { $group: { _id: '$to', totalEarnings: { $sum: '$amount' }, tipCount: { $sum: 1 } } },
      { $sort: { totalEarnings: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          user: {
            _id: '$user._id',
            username: '$user.username',
            displayName: '$user.displayName',
            profileImageUrl: '$user.profileImageUrl'
          },
          totalEarnings: 1,
          tipCount: 1
        }
      }
    ]);

    res.json({ topEarners, timeframe });
  } catch (error) {
    console.error('Get top earners error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};