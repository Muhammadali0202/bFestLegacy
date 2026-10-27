import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IJudgeEvaluation extends Document {
  startupId: mongoose.Types.ObjectId;
  judgeId?: mongoose.Types.ObjectId;
  judgeName: string;
  judgePin?: string;
  innovationScore: number;
  marketScore: number;
  executionScore: number;
  pitchScore: number;
  totalNormalizedScore: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const JudgeEvaluationSchema = new Schema<IJudgeEvaluation>(
  {
    startupId: { type: Schema.Types.ObjectId, ref: 'Startup', required: true, index: true },
    judgeId: { type: Schema.Types.ObjectId, ref: 'User' },
    judgeName: { type: String, required: true, trim: true },
    judgePin: { type: String, trim: true },
    
    // 4 Rubric Criteria (1 to 10 scale)
    innovationScore: { type: Number, required: true, min: 1, max: 10 },
    marketScore: { type: Number, required: true, min: 1, max: 10 },
    executionScore: { type: Number, required: true, min: 1, max: 10 },
    pitchScore: { type: Number, required: true, min: 1, max: 10 },
    
    // Normalized composite score (0 to 100 scale: sum * 2.5)
    totalNormalizedScore: { type: Number, required: true, min: 0, max: 100 },
    notes: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

JudgeEvaluationSchema.index({ startupId: 1, judgeName: 1 });

export const JudgeEvaluation: Model<IJudgeEvaluation> = 
  mongoose.models.JudgeEvaluation || mongoose.model<IJudgeEvaluation>('JudgeEvaluation', JudgeEvaluationSchema);

export default JudgeEvaluation;
