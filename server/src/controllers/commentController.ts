import { Request, Response } from 'express';
import Comment from '../models/Comment';
import Post from '../models/Post';
import { AuthRequest } from '../middleware/auth';

export const getComments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: postId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const comments = await Comment.find({ post: postId })
      .populate('author', 'username displayName profileImageUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ comments, page, hasMore: comments.length === limit });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const createComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id: postId } = req.params;
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      res.status(400).json({ error: 'Comment text is required' });
      return;
    }

    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    const comment = await Comment.create({
      post: postId,
      author: req.userId,
      text: text.trim()
    });

    await Post.findByIdAndUpdate(postId, {
      $inc: { commentCount: 1 }
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'username displayName profileImageUrl');

    res.status(201).json({ comment: populatedComment });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);
    if (!comment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    if (comment.author.toString() !== req.userId) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    await Comment.findByIdAndDelete(id);
    await Post.findByIdAndUpdate(comment.post, {
      $inc: { commentCount: -1 }
    });

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};