import { Request, Response } from 'express';
import User from '../models/User';
import Post from '../models/Post';
import { AuthRequest } from '../middleware/auth';

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username: username.toLowerCase() })
      .select('-passwordHash');

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const postsCount = await Post.countDocuments({ author: user._id });

    res.json({
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        bio: user.bio,
        location: user.location,
        profileImageUrl: user.profileImageUrl,
        bannerImageUrl: user.bannerImageUrl,
        genres: user.genres,
        socialLinks: user.socialLinks,
        roles: user.roles,
        followersCount: user.followers.length,
        followingCount: user.following.length,
        postsCount,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const followUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.userId;

    if (targetUserId === currentUserId) {
      res.status(400).json({ error: 'Cannot follow yourself' });
      return;
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const isFollowing = currentUser.following.includes(targetUserId as any);

    if (isFollowing) {
      res.status(400).json({ error: 'Already following this user' });
      return;
    }

    // Update both users
    await User.findByIdAndUpdate(currentUserId, {
      $push: { following: targetUserId }
    });

    await User.findByIdAndUpdate(targetUserId, {
      $push: { followers: currentUserId }
    });

    res.json({ message: 'User followed successfully' });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const unfollowUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.userId;

    if (targetUserId === currentUserId) {
      res.status(400).json({ error: 'Cannot unfollow yourself' });
      return;
    }

    // Update both users
    await User.findByIdAndUpdate(currentUserId, {
      $pull: { following: targetUserId }
    });

    await User.findByIdAndUpdate(targetUserId, {
      $pull: { followers: currentUserId }
    });

    res.json({ message: 'User unfollowed successfully' });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const searchUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      res.status(400).json({ error: 'Search query required' });
      return;
    }

    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { displayName: { $regex: q, $options: 'i' } }
      ]
    })
      .select('username displayName profileImageUrl bio')
      .limit(20);

    res.json({ users });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { displayName, bio, location, link1, link2 } = req.body;

    const updateData: any = {};

    if (displayName !== undefined) updateData.displayName = displayName;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;

    if (link1 !== undefined || link2 !== undefined) {
      // Get current user to preserve existing social links
      const currentUser = await User.findById(userId);
      updateData.socialLinks = {
        link1: link1 !== undefined ? link1 : currentUser?.socialLinks?.link1 || '',
        link2: link2 !== undefined ? link2 : currentUser?.socialLinks?.link2 || ''
      };
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('-passwordHash');

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        bio: user.bio,
        location: user.location,
        profileImageUrl: user.profileImageUrl,
        socialLinks: user.socialLinks
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateProfilePicture = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    if (!req.file) {
      res.status(400).json({ error: 'No image file provided' });
      return;
    }

    const profileImageUrl = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      userId,
      { profileImageUrl },
      { new: true }
    ).select('-passwordHash');

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      message: 'Profile picture updated successfully',
      profileImageUrl
    });
  } catch (error) {
    console.error('Update profile picture error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};