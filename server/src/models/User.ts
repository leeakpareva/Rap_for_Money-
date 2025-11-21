import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  username: string;
  displayName: string;
  email: string;
  passwordHash: string;
  bio?: string;
  location?: string;
  roles: string[];
  profileImageUrl?: string;
  bannerImageUrl?: string;
  genres?: string[];
  followers: mongoose.Types.ObjectId[];
  following: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    maxlength: 500
  },
  location: {
    type: String,
    maxlength: 100
  },
  roles: {
    type: [String],
    default: ['rapper']
  },
  profileImageUrl: String,
  bannerImageUrl: String,
  genres: [String],
  followers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ createdAt: -1 });

export default mongoose.model<IUser>('User', userSchema);