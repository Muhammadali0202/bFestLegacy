import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInvestment extends Document {
  startupId: mongoose.Types.ObjectId;
  startupName: string;
  investorId: mongoose.Types.ObjectId;
  investorName: string;
  firmName?: string;
  amount: number; // In PKR
  dealType: string;
  rating: number; // 1-5 scale
  review?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvestmentSchema = new Schema<IInvestment>(
  {
    startupId: { type: Schema.Types.ObjectId, ref: 'Startup', required: true, index: true },
    startupName: { type: String, required: true },
    investorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    investorName: { type: String, required: true },
    firmName: { type: String },
    amount: { type: Number, required: true, min: 0 },
    dealType: { 
      type: String, 
      enum: ['Seed Equity', 'SAFE Note', 'Grant Pledge', 'Convertible'],
      default: 'Seed Equity'
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

InvestmentSchema.index({ startupId: 1, investorId: 1 });

export const Investment: Model<IInvestment> = 
  mongoose.models.Investment || mongoose.model<IInvestment>('Investment', InvestmentSchema);

export default Investment;
