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
  googleFormUrl?: string;
  vendorFormUrl?: string;
  googleSheetUrl?: string;
  sponsors?: { name: string; logoUrl: string }[];
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
    googleFormUrl: {
      type: String,
      default: 'https://docs.google.com/forms/d/e/1FAIpQLSeGFeOX8EYzWRrchT0Wwv96b2imsU1ix5UtOOWgi0gHsfvbVA/viewform?usp=publish-editor',
    },
    vendorFormUrl: {
      type: String,
      default: 'https://docs.google.com/forms/d/e/1FAIpQLSeGFeOX8EYzWRrchT0Wwv96b2imsU1ix5UtOOWgi0gHsfvbVA/viewform?usp=publish-editor',
    },
    googleSheetUrl: {
      type: String,
      default: 'https://docs.google.com/spreadsheets/d/1Lys9DrF2n9Fos_gunDb686GM0cUjRGtTY1vazAMz_QI/edit?usp=sharing',
    },
    sponsors: {
      type: [
        {
          name: { type: String, required: true },
          logoUrl: { type: String, required: true },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

if (mongoose.models && mongoose.models.EventConfig) {
  delete (mongoose.models as any).EventConfig;
}

export const EventConfig: Model<IEventConfig> = mongoose.model<IEventConfig>('EventConfig', EventConfigSchema);
export default EventConfig;
