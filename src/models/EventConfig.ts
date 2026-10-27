import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEventConfig extends Document {
  key: string;
  eventName: string;
  edition: string;
  institution: string;
  isVotingOpen: boolean;
  isJudgeScoringOpen: boolean;
  isLeaderboardFrozen: boolean;
  resultsAnnounced: boolean;
  judgeWeight: number;
  investorWeight: number;
  publicWeight: number;
  createdAt: Date;
  updatedAt: Date;
}

const EventConfigSchema = new Schema<IEventConfig>(
  {
    key: { type: String, default: 'ACTIVE_EVENT', unique: true, required: true },
    eventName: { type: String, default: 'Business Fest 2027' },
    edition: { type: String, default: 'Annual Entrepreneurship & Startup Summit 2027' },
    institution: { type: String, default: 'IMSciences Peshawar' },
    isVotingOpen: { type: Boolean, default: true },
    isJudgeScoringOpen: { type: Boolean, default: true },
    isLeaderboardFrozen: { type: Boolean, default: false },
    resultsAnnounced: { type: Boolean, default: false },
    judgeWeight: { type: Number, default: 0.50 },
    investorWeight: { type: Number, default: 0.30 },
    publicWeight: { type: Number, default: 0.20 },
  },
  {
    timestamps: true,
  }
);

export const EventConfig: Model<IEventConfig> = 
  mongoose.models.EventConfig || mongoose.model<IEventConfig>('EventConfig', EventConfigSchema);

export default EventConfig;
