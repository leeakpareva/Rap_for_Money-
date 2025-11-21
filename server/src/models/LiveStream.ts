import mongoose, { Document, Schema } from 'mongoose';

export interface ILiveStream extends Document {
  host: mongoose.Types.ObjectId;
  isActive: boolean;
  roomId: string;
  startedAt: Date;
  endedAt?: Date;
  maxDurationSeconds: number;
  createdAt: Date;
  updatedAt: Date;
}

const liveStreamSchema = new Schema<ILiveStream>({
  host: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  roomId: {
    type: String,
    required: true
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  endedAt: Date,
  maxDurationSeconds: {
    type: Number,
    default: 240
  }
}, {
  timestamps: true
});

liveStreamSchema.index({ isActive: 1, startedAt: -1 });
liveStreamSchema.index({ roomId: 1 }, { unique: true });

export default mongoose.model<ILiveStream>('LiveStream', liveStreamSchema);