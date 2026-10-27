import mongoose, { Schema, Document, Model } from 'mongoose';

export type StartupStatus = 'pending' | 'approved' | 'rejected' | 'correction_requested';

export interface IFounder {
  name: string;
  role: string;
  avatar?: string;
}

export interface IStartup extends Document {
  name: string;
  tagline: string;
  description: string;
  problem?: string;
  solution?: string;
  sector: string;
  logo: string;
  website?: string;
  contactEmail: string;
  founders: IFounder[];
  boothNumber?: string;
  status: StartupStatus;
  isPublished: boolean;
  submittedBy?: mongoose.Types.ObjectId;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  
  // Aggregate Performance Metrics
  publicRating: number;
  totalPublicVotes: number;
  judgeScore: number;
  totalJudgeEvaluations: number;
  
  // Investor Metrics
  investorRating: number;
  totalInvestorRatings: number;
  totalInvestedAmount: number;
  investorScore: number;

  compositeScore: number;
  rank?: number;

  createdAt: Date;
  updatedAt: Date;
}

const FounderSchema = new Schema<IFounder>(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    avatar: { type: String },
  },
  { _id: false }
);

const StartupSchema = new Schema<IStartup>(
  {
    name: { type: String, required: true, trim: true },
    tagline: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    problem: { type: String },
    solution: { type: String },
    sector: { type: String, required: true, index: true },
    logo: { type: String, default: '🚀' },
    website: { type: String, trim: true },
    contactEmail: { type: String, required: true, trim: true, lowercase: true },
    founders: { type: [FounderSchema], default: [] },
    boothNumber: { type: String, trim: true },
    
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'correction_requested'],
      default: 'pending',
      index: true,
    },
    isPublished: { type: Boolean, default: false, index: true },
    submittedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },

    publicRating: { type: Number, default: 0 },
    totalPublicVotes: { type: Number, default: 0 },
    judgeScore: { type: Number, default: 0 },
    totalJudgeEvaluations: { type: Number, default: 0 },
    
    // Investor Metrics
    investorRating: { type: Number, default: 0 },
    totalInvestorRatings: { type: Number, default: 0 },
    totalInvestedAmount: { type: Number, default: 0 },
    investorScore: { type: Number, default: 0 },

    compositeScore: { type: Number, default: 0, index: true },
    rank: { type: Number },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for leaderboard and directory filtering
StartupSchema.index({ isPublished: 1, status: 1, compositeScore: -1 });
StartupSchema.index({ sector: 1, isPublished: 1 });

if (mongoose.models && mongoose.models.Startup) {
  delete (mongoose.models as any).Startup;
}

export const Startup: Model<IStartup> = mongoose.model<IStartup>('Startup', StartupSchema);
export default Startup;
