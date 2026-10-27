import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPublicVote extends Document {
  startupId: mongoose.Types.ObjectId;
  voterToken: string;
  userId?: mongoose.Types.ObjectId;
  rating: number; // 1 to 5
  feedback?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PublicVoteSchema = new Schema<IPublicVote>(
  {
    startupId: { type: Schema.Types.ObjectId, ref: 'Startup', required: true, index: true },
    voterToken: { type: String, required: true, trim: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    feedback: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

// Strictly prevent duplicate voting by the same voterToken on the same startup
PublicVoteSchema.index({ startupId: 1, voterToken: 1 }, { unique: true });

export const PublicVote: Model<IPublicVote> = 
  mongoose.models.PublicVote || mongoose.model<IPublicVote>('PublicVote', PublicVoteSchema);

export default PublicVote;
