import mongoose, { Document, Schema } from 'mongoose';

export interface ITip extends Document {
  from: mongoose.Types.ObjectId;
  to: mongoose.Types.ObjectId;
  amount: number;
  message?: string;
  post?: mongoose.Types.ObjectId;
  status: 'pending' | 'completed' | 'failed';
  paymentIntentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const tipSchema = new Schema<ITip>({
  from: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  to: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1,
    max: 1000 // Max $10 for MVP
  },
  message: {
    type: String,
    maxlength: 200
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: 'Post'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  paymentIntentId: String
}, {
  timestamps: true
});

tipSchema.index({ from: 1, createdAt: -1 });
tipSchema.index({ to: 1, createdAt: -1 });
tipSchema.index({ post: 1 });

export default mongoose.model<ITip>('Tip', tipSchema);