import { Request, Response } from 'express';
import Post from '../models/Post';
import User from '../models/User';
import Comment from '../models/Comment';
import { AuthRequest } from '../middleware/auth';
import { isVideoFile, isImageFile } from '../utils/helpers';

const extractHashtags = (text: string): string[] => {
  const hashtagRegex = /#[a-zA-Z0-9_]+/g;
  const hashtags = text.match(hashtagRegex);
  return hashtags ? hashtags.map(tag => tag.slice(1).toLowerCase()) : [];
};

const calculateTrendingScore = (likeCount: number, commentCount: number, createdAt: Date): number => {
  const ageInHours = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
  const engagementScore = (likeCount * 2) + (commentCount * 3);
  return engagementScore / Math.max(1, ageInHours / 24); // Decay over days
};

export const createPost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Media file is required' });
      return;
    }

    const { caption } = req.body;
    const mediaType = isVideoFile(req.file.mimetype) ? 'video' : 'image';

    // TODO: In production, upload to cloud storage (S3/Cloudinary)
    // For now, using local storage
    const mediaUrl = `/uploads/${req.file.filename}`;

    // Extract hashtags from caption
    const hashtags = caption ? extractHashtags(caption) : [];

    const post = await Post.create({
      author: req.userId,
      caption,
      mediaType,
      mediaUrl,
      hashtags
    });

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'username displayName profileImageUrl');

    res.status(201).json({ post: populatedPost });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getFeed = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Get posts from user and users they follow
    const authorIds = [req.userId, ...user.following];

    const posts = await Post.find({ author: { $in: authorIds } })
      .populate('author', 'username displayName profileImageUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const postsWithLikeStatus = posts.map(post => {
      const postObj = post.toObject();
      return {
        ...postObj,
        isLiked: post.likes.includes(req.userId as any)
      };
    });

    res.json({ posts: postsWithLikeStatus, page, hasMore: posts.length === limit });
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id)
      .populate('author', 'username displayName profileImageUrl');

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    res.json({ post });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const likePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const post = await Post.findById(id);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    const isLiked = post.likes.includes(userId as any);
    if (isLiked) {
      res.status(400).json({ error: 'Post already liked' });
      return;
    }

    await Post.findByIdAndUpdate(id, {
      $push: { likes: userId },
      $inc: { likeCount: 1 }
    });

    res.json({ message: 'Post liked successfully' });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const unlikePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    await Post.findByIdAndUpdate(id, {
      $pull: { likes: userId },
      $inc: { likeCount: -1 }
    });

    res.json({ message: 'Post unliked successfully' });
  } catch (error) {
    console.error('Unlike post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deletePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const post = await Post.findById(id);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    if (post.author.toString() !== userId) {
      res.status(403).json({ error: 'Not authorized to delete this post' });
      return;
    }

    await Comment.deleteMany({ post: id });
    await Post.findByIdAndDelete(id);

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getTrendingPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Update trending scores for recent posts
    const recentPosts = await Post.find({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    });

    for (const post of recentPosts) {
      const newScore = calculateTrendingScore(post.likeCount, post.commentCount, post.createdAt);
      await Post.findByIdAndUpdate(post._id, { trendingScore: newScore });
    }

    const posts = await Post.find()
      .populate('author', 'username displayName profileImageUrl')
      .sort({ trendingScore: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ posts, page, hasMore: posts.length === limit });
  } catch (error) {
    console.error('Get trending posts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const searchPostsByHashtag = async (req: Request, res: Response): Promise<void> => {
  try {
    const { hashtag } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ hashtags: hashtag.toLowerCase() })
      .populate('author', 'username displayName profileImageUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ posts, hashtag, page, hasMore: posts.length === limit });
  } catch (error) {
    console.error('Search hashtag error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getTrendingHashtags = async (req: Request, res: Response): Promise<void> => {
  try {
    const hashtags = await Post.aggregate([
      { $unwind: '$hashtags' },
      { $group: { _id: '$hashtags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
      { $project: { hashtag: '$_id', count: 1, _id: 0 } }
    ]);

    res.json({ hashtags });
  } catch (error) {
    console.error('Get trending hashtags error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getUserPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const posts = await Post.find({ author: user._id })
      .populate('author', 'username displayName profileImageUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ posts, page, hasMore: posts.length === limit });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};