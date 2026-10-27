import mongoose, { Schema, Document, Model } from 'mongoose';

export type UserRole = 'admin' | 'student' | 'investor' | 'judge';

export interface IUser extends Document {
  fullName: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isApproved: boolean; // Investors must be approved by admin
  companyOrFirm?: string;
  investmentCapacity?: string;
  bio?: string;
  teamName?: string;
  institution?: string;
  judgePin?: string;
  judgeDesignation?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { 
      type: String, 
      enum: ['admin', 'student', 'investor', 'judge'], 
      default: 'student',
      required: true 
    },
    isApproved: { 
      type: Boolean, 
      default: function(this: IUser) {
        return this.role !== 'investor'; // Investors default to pending approval
      }
    },
    companyOrFirm: { type: String, trim: true },
    investmentCapacity: { type: String, trim: true },
    bio: { type: String, trim: true },
    teamName: { type: String, trim: true },
    institution: { type: String, trim: true },
    judgePin: { type: String, trim: true },
    judgeDesignation: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
