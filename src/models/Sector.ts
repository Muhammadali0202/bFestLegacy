import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISector extends Document {
  name: string;
  description?: string;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SectorSchema = new Schema<ISector>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
    icon: { type: String, default: '💡' },
  },
  {
    timestamps: true,
  }
);

export const Sector: Model<ISector> = mongoose.models.Sector || mongoose.model<ISector>('Sector', SectorSchema);
export default Sector;
