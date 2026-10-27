import { 
  Startup, 
  JudgeEvaluation as IJudgeEval, 
  PublicVote as IPublicVote, 
  EventConfig as IEventConfig, 
  StartupStatus, 
  BusinessSector, 
  User, 
  Investment 
} from '@/types';
import { initialStartups, initialEventConfig, initialUsers, initialInvestments } from './mockData';
import connectToDatabase from './mongodb';
import { 
  Startup as StartupModel, 
  JudgeEvaluation as JudgeEvalModel, 
  PublicVote as PublicVoteModel, 
  EventConfig as EventConfigModel, 
  AuditLog as AuditLogModel,
  User as UserModel,
  Investment as InvestmentModel
} from '@/models';
import { seedDatabaseIfEmpty } from './dbSeeder';
import { hashPassword, verifyPassword } from './auth';

// In-Memory Fallback State (Active if MongoDB is not reachable)
let memStartups: Startup[] = [...initialStartups];
let memEventConfig: IEventConfig = { ...initialEventConfig };
let memJudgeEvaluations: IJudgeEval[] = [];
let memPublicVotes: IPublicVote[] = [];
let memUsers: (User & { passwordHash: string })[] = initialUsers.map(u => ({
  ...u,
  passwordHash: hashPassword(
    u.role === 'admin' ? 'admin123' :
    u.role === 'judge' ? 'judge123' :
    u.role === 'investor' ? 'investor123' : 'student123'
  )
}));
let memInvestments: Investment[] = [...initialInvestments];

let isDbInitialized = false;

async function initDb(): Promise<boolean> {
  if (isDbInitialized) return true;
  try {
    await connectToDatabase();
    await seedDatabaseIfEmpty();
    isDbInitialized = true;
    console.log('✓ Successfully connected to MongoDB.');
    return true;
  } catch (err) {
    console.warn('⚠️ MongoDB connection not available. Operating in in-memory fallback mode.', (err as Error).message);
    return false;
  }
}

// Convert Mongoose Doc to Startup Type
function toStartupObject(doc: any): Startup {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    id: obj._id ? obj._id.toString() : obj.id,
    name: obj.name,
    tagline: obj.tagline,
    description: obj.description,
    problem: obj.problem || '',
    solution: obj.solution || '',
    sector: obj.sector as BusinessSector,
    logo: obj.logo || '🚀',
    website: obj.website || '',
    contactEmail: obj.contactEmail,
    founders: obj.founders || [],
    boothNumber: obj.boothNumber || '',
    status: obj.status,
    isPublished: !!obj.isPublished,
    
    // Performance & Evaluation Metrics
    publicRating: obj.publicRating || 0,
    totalPublicVotes: obj.totalPublicVotes || 0,
    judgeScore: obj.judgeScore || 0,
    totalJudgeEvaluations: obj.totalJudgeEvaluations || 0,
    
    // Investor Metrics
    investorRating: obj.investorRating || 0,
    totalInvestorRatings: obj.totalInvestorRatings || 0,
    totalInvestedAmount: obj.totalInvestedAmount || 0,
    investorScore: obj.investorScore || 0,

    compositeScore: obj.compositeScore || 0,
    rank: obj.rank,
    submittedBy: obj.submittedBy ? obj.submittedBy.toString() : undefined,
    createdAt: obj.createdAt ? new Date(obj.createdAt).toISOString() : new Date().toISOString(),
  };
}

// Convert Mongoose Doc to User Type
function toUserObject(doc: any): User {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    id: obj._id ? obj._id.toString() : obj.id,
    fullName: obj.fullName,
    email: obj.email,
    role: obj.role,
    isApproved: obj.isApproved ?? (obj.role !== 'investor'),
    companyOrFirm: obj.companyOrFirm,
    investmentCapacity: obj.investmentCapacity,
    bio: obj.bio,
    teamName: obj.teamName,
    institution: obj.institution,
    judgePin: obj.judgePin,
    judgeDesignation: obj.judgeDesignation,
    createdAt: obj.createdAt ? new Date(obj.createdAt).toISOString() : new Date().toISOString(),
  };
}

// Helper to recalculate composite score and ranks in memory
function recalculateMemLeaderboard(): void {
  const published = memStartups.filter(s => s.status === 'approved' && s.isPublished);

  published.forEach(startup => {
    // 1. Normalized Public Score (0 to 100)
    const normPublic = startup.totalPublicVotes > 0 
      ? (startup.publicRating / 5) * 100 
      : 0;

    // 2. Normalized Investor Score (0 to 100)
    // Rating accounts for up to 75 points; Capital pledged accounts for up to 25 bonus points!
    const ratingComponent = startup.totalInvestorRatings > 0 
      ? (startup.investorRating / 5) * 75 
      : 0;
    // Every 500,000 PKR invested adds 5 points up to 25 points maximum
    const capitalBonus = Math.min(25, (startup.totalInvestedAmount / 500000) * 5);
    const normInvestor = startup.totalInvestorRatings > 0 || startup.totalInvestedAmount > 0
      ? Math.min(100, ratingComponent + capitalBonus)
      : 0;
    startup.investorScore = parseFloat(normInvestor.toFixed(1));

    // 3. Judge Score (0 to 100)
    const normJudge = startup.totalJudgeEvaluations > 0 ? startup.judgeScore : 0;

    // 4. Weighted combination
    let rawComposite = 0;
    let totalWeight = 0;

    if (startup.totalJudgeEvaluations > 0) {
      rawComposite += normJudge * memEventConfig.judgeWeight;
      totalWeight += memEventConfig.judgeWeight;
    }
    if (startup.totalInvestorRatings > 0 || startup.totalInvestedAmount > 0) {
      rawComposite += normInvestor * (memEventConfig.investorWeight || 0.30);
      totalWeight += (memEventConfig.investorWeight || 0.30);
    }
    if (startup.totalPublicVotes > 0) {
      rawComposite += normPublic * memEventConfig.publicWeight;
      totalWeight += memEventConfig.publicWeight;
    }

    startup.compositeScore = totalWeight > 0 
      ? parseFloat((rawComposite / totalWeight).toFixed(1))
      : 0;
  });

  published.sort((a, b) => b.compositeScore - a.compositeScore);
  published.forEach((s, idx) => {
    s.rank = idx + 1;
  });
}

recalculateMemLeaderboard();

// ============================================================================
// Startup Repository
// ============================================================================
export const StartupRepository = {
  // Get all or filtered startups
  getAll: async (options?: { 
    search?: string; 
    sector?: string; 
    status?: StartupStatus | 'all';
    onlyPublished?: boolean;
    submittedBy?: string;
  }): Promise<Startup[]> => {
    const hasDb = await initDb();

    if (hasDb) {
      try {
        const query: any = {};

        if (options?.onlyPublished) {
          query.status = 'approved';
          query.isPublished = true;
        } else if (options?.status && options.status !== 'all') {
          query.status = options.status;
        }

        if (options?.sector && options.sector !== 'All') {
          query.sector = options.sector;
        }

        if (options?.submittedBy) {
          query.submittedBy = options.submittedBy;
        }

        if (options?.search) {
          const regex = new RegExp(options.search, 'i');
          query.$or = [
            { name: regex },
            { tagline: regex },
            { description: regex },
            { 'founders.name': regex },
          ];
        }

        const docs = await StartupModel.find(query).sort({ compositeScore: -1, createdAt: -1 });
        return docs.map(toStartupObject);
      } catch (e) {
        console.error('Error fetching startups from MongoDB:', e);
      }
    }

    // In-memory Fallback
    let result = [...memStartups];
    if (options?.onlyPublished) {
      result = result.filter(s => s.status === 'approved' && s.isPublished);
    } else if (options?.status && options.status !== 'all') {
      result = result.filter(s => s.status === options.status);
    }
    if (options?.sector && options.sector !== 'All') {
      result = result.filter(s => s.sector === options.sector);
    }
    if (options?.submittedBy) {
      result = result.filter(s => s.submittedBy === options.submittedBy);
    }
    if (options?.search) {
      const q = options.search.toLowerCase();
      result = result.filter(s => 
        s.name.toLowerCase().includes(q) || 
        s.tagline.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.founders.some(f => f.name.toLowerCase().includes(q))
      );
    }
    return result;
  },

  // Get startup by ID
  getById: async (id: string): Promise<Startup | undefined> => {
    const hasDb = await initDb();

    if (hasDb) {
      try {
        let doc: any = null;
        try {
          doc = await StartupModel.findById(id);
        } catch (_) {
          doc = await StartupModel.findOne({ name: new RegExp(id, 'i') });
        }
        if (doc) return toStartupObject(doc);
      } catch (e) {
        console.error('Error fetching startup by id from MongoDB:', e);
      }
    }

    return memStartups.find(s => s.id === id);
  },

  // Register new startup (Student intake pipeline)
  register: async (data: Omit<Startup, 'id' | 'status' | 'isPublished' | 'publicRating' | 'totalPublicVotes' | 'judgeScore' | 'totalJudgeEvaluations' | 'investorRating' | 'totalInvestorRatings' | 'totalInvestedAmount' | 'investorScore' | 'compositeScore' | 'createdAt'> & { submittedBy?: string }): Promise<Startup> => {
    const hasDb = await initDb();

    if (hasDb) {
      try {
        const doc = await StartupModel.create({
          ...data,
          status: 'pending',
          isPublished: false,
          publicRating: 0,
          totalPublicVotes: 0,
          judgeScore: 0,
          totalJudgeEvaluations: 0,
          investorRating: 0,
          totalInvestorRatings: 0,
          totalInvestedAmount: 0,
          investorScore: 0,
          compositeScore: 0,
        });

        await AuditLogModel.create({
          action: 'STARTUP_REGISTERED',
          details: { startupId: doc._id, name: doc.name, submittedBy: data.submittedBy },
        });

        return toStartupObject(doc);
      } catch (e) {
        console.error('Error saving startup registration to MongoDB:', e);
      }
    }

    // In-memory Fallback
    const newStartup: Startup = {
      ...data,
      id: `startup-${Date.now()}`,
      status: 'pending',
      isPublished: false,
      publicRating: 0,
      totalPublicVotes: 0,
      judgeScore: 0,
      totalJudgeEvaluations: 0,
      investorRating: 0,
      totalInvestorRatings: 0,
      totalInvestedAmount: 0,
      investorScore: 0,
      compositeScore: 0,
      createdAt: new Date().toISOString(),
    };
    memStartups.unshift(newStartup);
    return newStartup;
  },

  // Update status (Admin moderation)
  updateStatus: async (id: string, status: StartupStatus, isPublished?: boolean): Promise<Startup | null> => {
    const hasDb = await initDb();

    if (hasDb) {
      try {
        const published = isPublished !== undefined ? isPublished : (status === 'approved');
        let doc: any = null;
        try {
          doc = await StartupModel.findByIdAndUpdate(
            id,
            { status, isPublished: published, reviewedAt: new Date() },
            { new: true }
          );
        } catch (_) {
          doc = await StartupModel.findOneAndUpdate(
            { name: new RegExp(id, 'i') },
            { status, isPublished: published, reviewedAt: new Date() },
            { new: true }
          );
        }

        if (doc) {
          await AuditLogModel.create({
            action: 'STARTUP_STATUS_UPDATED',
            details: { startupId: doc._id, status, isPublished: published },
          });

          // Recalculate ranks in MongoDB
          const allApproved = await StartupModel.find({ status: 'approved', isPublished: true }).sort({ compositeScore: -1 });
          for (let i = 0; i < allApproved.length; i++) {
            await StartupModel.updateOne({ _id: allApproved[i]._id }, { rank: i + 1 });
          }

          const reloaded = await StartupModel.findById(doc._id);
          return toStartupObject(reloaded || doc);
        }
      } catch (e) {
        console.error('Error updating startup status in MongoDB:', e);
      }
    }

    // In-memory Fallback
    const startup = memStartups.find(s => s.id === id);
    if (!startup) return null;

    startup.status = status;
    startup.isPublished = isPublished !== undefined ? isPublished : (status === 'approved');
    recalculateMemLeaderboard();
    return startup;
  },

  // Submit official judge score
  submitJudgeScore: async (evalData: {
    startupId: string;
    judgeName: string;
    judgePin?: string;
    innovationScore: number;
    marketScore: number;
    executionScore: number;
    pitchScore: number;
    notes?: string;
  }): Promise<{ success: boolean; evaluation?: any; message: string }> => {
    const hasDb = await initDb();

    if (hasDb) {
      try {
        const config = await EventConfigModel.findOne({ key: 'ACTIVE_EVENT' }) || memEventConfig;
        if (!config.isJudgeScoringOpen) {
          return { success: false, message: 'Judge scoring is currently closed by the organizers.' };
        }

        let startupDoc: any = null;
        try {
          startupDoc = await StartupModel.findById(evalData.startupId);
        } catch (_) {
          startupDoc = await StartupModel.findOne({ name: new RegExp(evalData.startupId, 'i') });
        }

        if (!startupDoc) {
          return { success: false, message: 'Startup not found.' };
        }

        const totalNormalizedScore = (
          evalData.innovationScore + 
          evalData.marketScore + 
          evalData.executionScore + 
          evalData.pitchScore
        ) * 2.5;

        const evaluation = await JudgeEvalModel.create({
          startupId: startupDoc._id,
          judgeName: evalData.judgeName || 'Official Jury Member',
          judgePin: evalData.judgePin,
          innovationScore: evalData.innovationScore,
          marketScore: evalData.marketScore,
          executionScore: evalData.executionScore,
          pitchScore: evalData.pitchScore,
          totalNormalizedScore,
          notes: evalData.notes,
        });

        // Recalculate average judge score from all evaluations for this startup
        const allEvals = await JudgeEvalModel.find({ startupId: startupDoc._id });
        const avgJudgeScore = parseFloat((allEvals.reduce((acc, curr) => acc + curr.totalNormalizedScore, 0) / allEvals.length).toFixed(1));

        startupDoc.judgeScore = avgJudgeScore;
        startupDoc.totalJudgeEvaluations = allEvals.length;

        // Recalculate composite with Investor + Judge + Public weights
        const normPublic = startupDoc.totalPublicVotes > 0 ? (startupDoc.publicRating / 5) * 100 : 0;
        const ratingComponent = startupDoc.totalInvestorRatings > 0 ? (startupDoc.investorRating / 5) * 75 : 0;
        const capitalBonus = Math.min(25, (startupDoc.totalInvestedAmount / 500000) * 5);
        const normInvestor = startupDoc.totalInvestorRatings > 0 || startupDoc.totalInvestedAmount > 0 
          ? Math.min(100, ratingComponent + capitalBonus) 
          : 0;
        startupDoc.investorScore = parseFloat(normInvestor.toFixed(1));

        let rawComp = avgJudgeScore * config.judgeWeight;
        let totWeight = config.judgeWeight;

        if (startupDoc.totalInvestorRatings > 0 || startupDoc.totalInvestedAmount > 0) {
          rawComp += normInvestor * (config.investorWeight || 0.30);
          totWeight += (config.investorWeight || 0.30);
        }
        if (startupDoc.totalPublicVotes > 0) {
          rawComp += normPublic * config.publicWeight;
          totWeight += config.publicWeight;
        }

        startupDoc.compositeScore = parseFloat((rawComp / totWeight).toFixed(1));
        await startupDoc.save();

        // Update overall ranks
        const published = await StartupModel.find({ status: 'approved', isPublished: true }).sort({ compositeScore: -1 });
        for (let i = 0; i < published.length; i++) {
          await StartupModel.updateOne({ _id: published[i]._id }, { rank: i + 1 });
        }

        await AuditLogModel.create({
          action: 'JUDGE_EVALUATION_SUBMITTED',
          details: { startupId: startupDoc._id, judgeName: evalData.judgeName, totalNormalizedScore },
        });

        return { 
          success: true, 
          evaluation: {
            id: evaluation._id.toString(),
            startupId: evaluation.startupId.toString(),
            judgeName: evaluation.judgeName,
            totalNormalizedScore: evaluation.totalNormalizedScore,
            createdAt: evaluation.createdAt.toISOString(),
          }, 
          message: 'Evaluation submitted successfully to database.' 
        };
      } catch (e) {
        console.error('Error submitting judge score to MongoDB:', e);
      }
    }

    // In-memory Fallback
    if (!memEventConfig.isJudgeScoringOpen) {
      return { success: false, message: 'Judge scoring is currently closed by the organizers.' };
    }
    const startup = memStartups.find(s => s.id === evalData.startupId);
    if (!startup) return { success: false, message: 'Startup not found.' };

    const totalNormalizedScore = (
      evalData.innovationScore + 
      evalData.marketScore + 
      evalData.executionScore + 
      evalData.pitchScore
    ) * 2.5;

    const evaluation: IJudgeEval = {
      id: `eval-${Date.now()}`,
      startupId: evalData.startupId,
      judgeName: evalData.judgeName || 'Official Judge',
      judgePin: evalData.judgePin,
      innovationScore: evalData.innovationScore,
      marketScore: evalData.marketScore,
      executionScore: evalData.executionScore,
      pitchScore: evalData.pitchScore,
      totalNormalizedScore,
      notes: evalData.notes,
      createdAt: new Date().toISOString(),
    };
    memJudgeEvaluations.push(evaluation);

    const startupEvals = memJudgeEvaluations.filter(e => e.startupId === startup.id);
    const avgScore = startupEvals.reduce((acc, curr) => acc + curr.totalNormalizedScore, 0) / startupEvals.length;
    startup.judgeScore = parseFloat(avgScore.toFixed(1));
    startup.totalJudgeEvaluations = startupEvals.length;
    recalculateMemLeaderboard();

    return { success: true, evaluation, message: 'Evaluation submitted successfully.' };
  },

  // Submit public audience rating
  submitPublicVote: async (voteData: {
    startupId: string;
    voterToken: string;
    rating: number;
    feedback?: string;
  }): Promise<{ success: boolean; message: string }> => {
    const hasDb = await initDb();

    if (hasDb) {
      try {
        const config = await EventConfigModel.findOne({ key: 'ACTIVE_EVENT' }) || memEventConfig;
        if (!config.isVotingOpen) {
          return { success: false, message: 'Audience voting is currently closed.' };
        }

        let startupDoc: any = null;
        try {
          startupDoc = await StartupModel.findById(voteData.startupId);
        } catch (_) {
          startupDoc = await StartupModel.findOne({ name: new RegExp(voteData.startupId, 'i') });
        }

        if (!startupDoc) {
          return { success: false, message: 'Startup not found.' };
        }

        const existingVote = await PublicVoteModel.findOne({
          startupId: startupDoc._id,
          voterToken: voteData.voterToken,
        });

        if (existingVote) {
          return { success: false, message: 'You have already voted for this startup.' };
        }

        await PublicVoteModel.create({
          startupId: startupDoc._id,
          voterToken: voteData.voterToken,
          rating: Math.min(5, Math.max(1, voteData.rating)),
          feedback: voteData.feedback,
        });

        const allVotes = await PublicVoteModel.find({ startupId: startupDoc._id });
        const avgPublicRating = parseFloat((allVotes.reduce((acc, curr) => acc + curr.rating, 0) / allVotes.length).toFixed(1));

        startupDoc.publicRating = avgPublicRating;
        startupDoc.totalPublicVotes = allVotes.length;

        // Recalculate composite
        const normPublic = (avgPublicRating / 5) * 100;
        const normJudge = startupDoc.totalJudgeEvaluations > 0 ? startupDoc.judgeScore : 0;
        const normInvestor = startupDoc.investorScore || 0;

        let rawComp = normPublic * config.publicWeight;
        let totWeight = config.publicWeight;

        if (startupDoc.totalJudgeEvaluations > 0) {
          rawComp += normJudge * config.judgeWeight;
          totWeight += config.judgeWeight;
        }
        if (startupDoc.totalInvestorRatings > 0 || startupDoc.totalInvestedAmount > 0) {
          rawComp += normInvestor * (config.investorWeight || 0.30);
          totWeight += (config.investorWeight || 0.30);
        }

        startupDoc.compositeScore = parseFloat((rawComp / totWeight).toFixed(1));
        await startupDoc.save();

        const published = await StartupModel.find({ status: 'approved', isPublished: true }).sort({ compositeScore: -1 });
        for (let i = 0; i < published.length; i++) {
          await StartupModel.updateOne({ _id: published[i]._id }, { rank: i + 1 });
        }

        return { success: true, message: 'Vote recorded! Thank you for participating.' };
      } catch (e: any) {
        if (e.code === 11000) {
          return { success: false, message: 'You have already voted for this startup.' };
        }
        console.error('Error submitting public vote to MongoDB:', e);
      }
    }

    // In-memory Fallback
    if (!memEventConfig.isVotingOpen) {
      return { success: false, message: 'Audience voting is currently closed.' };
    }
    const existing = memPublicVotes.find(
      v => v.startupId === voteData.startupId && v.voterToken === voteData.voterToken
    );
    if (existing) {
      return { success: false, message: 'You have already voted for this startup.' };
    }
    const startup = memStartups.find(s => s.id === voteData.startupId);
    if (!startup) return { success: false, message: 'Startup not found.' };

    const vote: IPublicVote = {
      id: `vote-${Date.now()}`,
      startupId: voteData.startupId,
      voterToken: voteData.voterToken,
      rating: Math.min(5, Math.max(1, voteData.rating)),
      feedback: voteData.feedback,
      createdAt: new Date().toISOString(),
    };
    memPublicVotes.push(vote);

    const currentTotal = startup.publicRating * startup.totalPublicVotes;
    startup.totalPublicVotes += 1;
    startup.publicRating = parseFloat(((currentTotal + vote.rating) / startup.totalPublicVotes).toFixed(1));
    recalculateMemLeaderboard();

    return { success: true, message: 'Vote recorded! Thank you for participating.' };
  },

  // Get current Leaderboard
  getLeaderboard: async (sector?: string) => {
    const hasDb = await initDb();

    if (hasDb) {
      try {
        const config = await EventConfigModel.findOne({ key: 'ACTIVE_EVENT' }) || memEventConfig;
        const query: any = { status: 'approved', isPublished: true };
        if (sector && sector !== 'All') {
          query.sector = sector;
        }

        const docs = await StartupModel.find(query).sort({ compositeScore: -1 });
        return {
          isFrozen: config.isLeaderboardFrozen,
          items: docs.map((s, idx) => ({
            rank: idx + 1,
            id: s._id.toString(),
            name: s.name,
            tagline: s.tagline,
            sector: s.sector as BusinessSector,
            logo: s.logo,
            boothNumber: s.boothNumber,
            compositeScore: s.compositeScore,
            judgeScore: s.judgeScore,
            investorScore: s.investorScore || 0,
            investorRating: s.investorRating || 0,
            totalInvestedAmount: s.totalInvestedAmount || 0,
            publicRating: s.publicRating,
            totalVotes: s.totalPublicVotes,
          })),
          timestamp: new Date().toISOString(),
        };
      } catch (e) {
        console.error('Error fetching leaderboard from MongoDB:', e);
      }
    }

    // In-memory Fallback
    recalculateMemLeaderboard();
    let published = memStartups.filter(s => s.status === 'approved' && s.isPublished);
    if (sector && sector !== 'All') {
      published = published.filter(s => s.sector === sector);
    }
    published.sort((a, b) => b.compositeScore - a.compositeScore);

    return {
      isFrozen: memEventConfig.isLeaderboardFrozen,
      items: published.map((s, idx) => ({
        rank: idx + 1,
        id: s.id,
        name: s.name,
        tagline: s.tagline,
        sector: s.sector,
        logo: s.logo,
        boothNumber: s.boothNumber,
        compositeScore: s.compositeScore,
        judgeScore: s.judgeScore,
        investorScore: s.investorScore || 0,
        investorRating: s.investorRating || 0,
        totalInvestedAmount: s.totalInvestedAmount || 0,
        publicRating: s.publicRating,
        totalVotes: s.totalPublicVotes,
      })),
      timestamp: new Date().toISOString(),
    };
  },

  // Event Config
  getEventConfig: async (): Promise<IEventConfig> => {
    const hasDb = await initDb();

    if (hasDb) {
      try {
        const config = await EventConfigModel.findOne({ key: 'ACTIVE_EVENT' });
        if (config) {
          return {
            eventName: config.eventName,
            edition: config.edition,
            institution: config.institution,
            isVotingOpen: config.isVotingOpen,
            isJudgeScoringOpen: config.isJudgeScoringOpen,
            isLeaderboardFrozen: config.isLeaderboardFrozen,
            resultsAnnounced: config.resultsAnnounced,
            judgeWeight: config.judgeWeight,
            investorWeight: config.investorWeight || 0.30,
            publicWeight: config.publicWeight,
          };
        }
      } catch (e) {
        console.error('Error fetching event config from MongoDB:', e);
      }
    }

    return { ...memEventConfig };
  },

  updateEventConfig: async (newConfig: Partial<IEventConfig>): Promise<IEventConfig> => {
    const hasDb = await initDb();

    if (hasDb) {
      try {
        const updated = await EventConfigModel.findOneAndUpdate(
          { key: 'ACTIVE_EVENT' },
          { $set: newConfig },
          { new: true, upsert: true }
        );

        await AuditLogModel.create({
          action: 'EVENT_CONFIG_UPDATED',
          details: newConfig,
        });

        return {
          eventName: updated.eventName,
          edition: updated.edition,
          institution: updated.institution,
          isVotingOpen: updated.isVotingOpen,
          isJudgeScoringOpen: updated.isJudgeScoringOpen,
          isLeaderboardFrozen: updated.isLeaderboardFrozen,
          resultsAnnounced: updated.resultsAnnounced,
          judgeWeight: updated.judgeWeight,
          investorWeight: updated.investorWeight || 0.30,
          publicWeight: updated.publicWeight,
        };
      } catch (e) {
        console.error('Error updating event config in MongoDB:', e);
      }
    }

    memEventConfig = { ...memEventConfig, ...newConfig };
    recalculateMemLeaderboard();
    return { ...memEventConfig };
  }
};

// ============================================================================
// User Repository
// ============================================================================
export const UserRepository = {
  findByEmail: async (email: string): Promise<(User & { passwordHash?: string }) | null> => {
    const normalizedEmail = email.toLowerCase().trim();
    const hasDb = await initDb();

    if (hasDb) {
      try {
        const doc = await UserModel.findOne({ email: normalizedEmail });
        if (doc) {
          const userObj = toUserObject(doc);
          return { ...userObj, passwordHash: doc.passwordHash };
        }
      } catch (e) {
        console.error('Error finding user by email in MongoDB:', e);
      }
    }

    const memUser = memUsers.find(u => u.email.toLowerCase() === normalizedEmail);
    return memUser ? { ...memUser } : null;
  },

  findById: async (id: string): Promise<User | null> => {
    const hasDb = await initDb();

    if (hasDb) {
      try {
        let doc: any = null;
        try {
          doc = await UserModel.findById(id);
        } catch (_) {
          doc = await UserModel.findOne({ email: new RegExp(id, 'i') });
        }
        if (doc) return toUserObject(doc);
      } catch (e) {
        console.error('Error finding user by id in MongoDB:', e);
      }
    }

    const memUser = memUsers.find(u => u.id === id);
    return memUser ? toUserObject(memUser) : null;
  },

  register: async (userData: {
    fullName: string;
    email: string;
    password: string;
    role: User['role'];
    companyOrFirm?: string;
    investmentCapacity?: string;
    bio?: string;
    teamName?: string;
    institution?: string;
    judgePin?: string;
    judgeDesignation?: string;
  }): Promise<{ success: boolean; user?: User; error?: string }> => {
    const normalizedEmail = userData.email.toLowerCase().trim();
    const hasDb = await initDb();
    const isApproved = userData.role !== 'investor'; // Investors require admin approval

    const passwordHash = hashPassword(userData.password);

    if (hasDb) {
      try {
        const existing = await UserModel.findOne({ email: normalizedEmail });
        if (existing) {
          return { success: false, error: 'An account with this email already exists.' };
        }

        const doc = await UserModel.create({
          fullName: userData.fullName.trim(),
          email: normalizedEmail,
          passwordHash,
          role: userData.role,
          isApproved,
          companyOrFirm: userData.companyOrFirm,
          investmentCapacity: userData.investmentCapacity,
          bio: userData.bio,
          teamName: userData.teamName,
          institution: userData.institution,
          judgePin: userData.judgePin,
          judgeDesignation: userData.judgeDesignation,
        });

        await AuditLogModel.create({
          action: 'USER_REGISTERED',
          details: { userId: doc._id, email: doc.email, role: doc.role, isApproved },
        });

        return { success: true, user: toUserObject(doc) };
      } catch (e: any) {
        console.error('Error registering user in MongoDB:', e);
        return { success: false, error: e.message || 'Registration failed.' };
      }
    }

    // In-memory fallback
    const existing = memUsers.find(u => u.email.toLowerCase() === normalizedEmail);
    if (existing) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const newUser: User & { passwordHash: string } = {
      id: `user-${Date.now()}`,
      fullName: userData.fullName.trim(),
      email: normalizedEmail,
      passwordHash,
      role: userData.role,
      isApproved,
      companyOrFirm: userData.companyOrFirm,
      investmentCapacity: userData.investmentCapacity,
      bio: userData.bio,
      teamName: userData.teamName,
      institution: userData.institution,
      judgePin: userData.judgePin,
      judgeDesignation: userData.judgeDesignation,
      createdAt: new Date().toISOString(),
    };

    memUsers.unshift(newUser);
    return { success: true, user: toUserObject(newUser) };
  },

  getAllInvestors: async (status?: 'all' | 'pending' | 'approved'): Promise<User[]> => {
    const hasDb = await initDb();

    if (hasDb) {
      try {
        const query: any = { role: 'investor' };
        if (status === 'pending') query.isApproved = false;
        if (status === 'approved') query.isApproved = true;

        const docs = await UserModel.find(query).sort({ createdAt: -1 });
        return docs.map(toUserObject);
      } catch (e) {
        console.error('Error fetching investors from MongoDB:', e);
      }
    }

    let investors = memUsers.filter(u => u.role === 'investor');
    if (status === 'pending') investors = investors.filter(u => u.isApproved === false);
    if (status === 'approved') investors = investors.filter(u => u.isApproved === true);
    return investors.map(toUserObject);
  },

  updateInvestorApproval: async (id: string, isApproved: boolean): Promise<{ success: boolean; user?: User; error?: string }> => {
    const hasDb = await initDb();

    if (hasDb) {
      try {
        const doc = await UserModel.findByIdAndUpdate(
          id,
          { isApproved },
          { new: true }
        );
        if (doc) {
          await AuditLogModel.create({
            action: 'INVESTOR_APPROVAL_UPDATED',
            details: { investorId: doc._id, isApproved },
          });
          return { success: true, user: toUserObject(doc) };
        }
      } catch (e: any) {
        console.error('Error updating investor approval in MongoDB:', e);
      }
    }

    const user = memUsers.find(u => u.id === id);
    if (!user) return { success: false, error: 'Investor not found.' };

    user.isApproved = isApproved;
    return { success: true, user: toUserObject(user) };
  },

  getAllJudges: async (): Promise<User[]> => {
    const hasDb = await initDb();

    if (hasDb) {
      try {
        const docs = await UserModel.find({ role: 'judge' }).sort({ createdAt: -1 });
        return docs.map(toUserObject);
      } catch (e) {
        console.error('Error fetching judges from MongoDB:', e);
      }
    }

    return memUsers.filter(u => u.role === 'judge').map(toUserObject);
  }
};

// ============================================================================
// Investment Repository
// ============================================================================
export const InvestmentRepository = {
  create: async (data: {
    startupId: string;
    startupName?: string;
    investorId: string;
    investorName: string;
    firmName?: string;
    amount: number;
    dealType?: string;
    rating: number; // 1-5 scale
    review?: string;
  }): Promise<{ success: boolean; investment?: Investment; error?: string }> => {
    const hasDb = await initDb();

    if (hasDb) {
      try {
        let startupDoc: any = null;
        try {
          startupDoc = await StartupModel.findById(data.startupId);
        } catch (_) {
          startupDoc = await StartupModel.findOne({ name: new RegExp(data.startupId, 'i') });
        }

        if (!startupDoc) {
          return { success: false, error: 'Target startup not found.' };
        }

        const invDoc = await InvestmentModel.create({
          startupId: startupDoc._id,
          startupName: startupDoc.name,
          investorId: data.investorId,
          investorName: data.investorName,
          firmName: data.firmName,
          amount: data.amount,
          dealType: data.dealType || 'Seed Equity',
          rating: Math.min(5, Math.max(1, data.rating)),
          review: data.review,
        });

        // Recalculate startup investor metrics
        const allInvestments = await InvestmentModel.find({ startupId: startupDoc._id });
        const totalAmount = allInvestments.reduce((acc, curr) => acc + curr.amount, 0);
        const avgRating = parseFloat(
          (allInvestments.reduce((acc, curr) => acc + curr.rating, 0) / allInvestments.length).toFixed(1)
        );

        startupDoc.totalInvestedAmount = totalAmount;
        startupDoc.investorRating = avgRating;
        startupDoc.totalInvestorRatings = allInvestments.length;

        // Investor Score (up to 75 pts from rating + up to 25 pts from amount)
        const ratingComponent = (avgRating / 5) * 75;
        const capitalBonus = Math.min(25, (totalAmount / 500000) * 5);
        startupDoc.investorScore = parseFloat(Math.min(100, ratingComponent + capitalBonus).toFixed(1));

        // Update overall composite score & rank
        const config = await EventConfigModel.findOne({ key: 'ACTIVE_EVENT' }) || memEventConfig;
        const normPublic = startupDoc.totalPublicVotes > 0 ? (startupDoc.publicRating / 5) * 100 : 0;
        const normJudge = startupDoc.totalJudgeEvaluations > 0 ? startupDoc.judgeScore : 0;
        const normInvestor = startupDoc.investorScore;

        let rawComp = normInvestor * (config.investorWeight || 0.30);
        let totWeight = config.investorWeight || 0.30;

        if (startupDoc.totalJudgeEvaluations > 0) {
          rawComp += normJudge * config.judgeWeight;
          totWeight += config.judgeWeight;
        }
        if (startupDoc.totalPublicVotes > 0) {
          rawComp += normPublic * config.publicWeight;
          totWeight += config.publicWeight;
        }

        startupDoc.compositeScore = parseFloat((rawComp / totWeight).toFixed(1));
        await startupDoc.save();

        // Recalculate leaderboard ranks
        const published = await StartupModel.find({ status: 'approved', isPublished: true }).sort({ compositeScore: -1 });
        for (let i = 0; i < published.length; i++) {
          await StartupModel.updateOne({ _id: published[i]._id }, { rank: i + 1 });
        }

        await AuditLogModel.create({
          action: 'INVESTMENT_RECORDED',
          details: { 
            startupId: startupDoc._id, 
            investorId: data.investorId, 
            amount: data.amount, 
            rating: data.rating 
          },
        });

        return {
          success: true,
          investment: {
            id: invDoc._id.toString(),
            startupId: invDoc.startupId.toString(),
            startupName: invDoc.startupName,
            investorId: invDoc.investorId.toString(),
            investorName: invDoc.investorName,
            firmName: invDoc.firmName,
            amount: invDoc.amount,
            dealType: invDoc.dealType as any,
            rating: invDoc.rating,
            review: invDoc.review,
            createdAt: invDoc.createdAt.toISOString(),
          }
        };
      } catch (e: any) {
        console.error('Error recording investment in MongoDB:', e);
        return { success: false, error: e.message || 'Failed to record investment.' };
      }
    }

    // In-memory Fallback
    const startup = memStartups.find(s => s.id === data.startupId);
    if (!startup) {
      return { success: false, error: 'Target startup not found.' };
    }

    const newInv: Investment = {
      id: `inv-${Date.now()}`,
      startupId: data.startupId,
      startupName: startup.name,
      investorId: data.investorId,
      investorName: data.investorName,
      firmName: data.firmName,
      amount: data.amount,
      dealType: (data.dealType as any) || 'Seed Equity',
      rating: Math.min(5, Math.max(1, data.rating)),
      review: data.review,
      createdAt: new Date().toISOString(),
    };

    memInvestments.unshift(newInv);

    // Recalculate startup's investor score
    const startupInvs = memInvestments.filter(i => i.startupId === startup.id);
    const totalAmount = startupInvs.reduce((acc, curr) => acc + curr.amount, 0);
    const avgRating = parseFloat((startupInvs.reduce((acc, curr) => acc + curr.rating, 0) / startupInvs.length).toFixed(1));

    startup.totalInvestedAmount = totalAmount;
    startup.investorRating = avgRating;
    startup.totalInvestorRatings = startupInvs.length;

    recalculateMemLeaderboard();

    return { success: true, investment: newInv };
  },

  getByStartup: async (startupId: string): Promise<Investment[]> => {
    const hasDb = await initDb();

    if (hasDb) {
      try {
        let docs = await InvestmentModel.find({ startupId }).sort({ createdAt: -1 });
        if (docs.length === 0) {
          // Try string match
          const s = await StartupModel.findOne({ name: new RegExp(startupId, 'i') });
          if (s) {
            docs = await InvestmentModel.find({ startupId: s._id }).sort({ createdAt: -1 });
          }
        }
        return docs.map(doc => ({
          id: doc._id.toString(),
          startupId: doc.startupId.toString(),
          startupName: doc.startupName,
          investorId: doc.investorId.toString(),
          investorName: doc.investorName,
          firmName: doc.firmName,
          amount: doc.amount,
          dealType: doc.dealType as any,
          rating: doc.rating,
          review: doc.review,
          createdAt: doc.createdAt.toISOString(),
        }));
      } catch (e) {
        console.error('Error fetching investments by startup from MongoDB:', e);
      }
    }

    return memInvestments.filter(i => i.startupId === startupId);
  },

  getByInvestor: async (investorId: string): Promise<Investment[]> => {
    const hasDb = await initDb();

    if (hasDb) {
      try {
        const docs = await InvestmentModel.find({ investorId }).sort({ createdAt: -1 });
        return docs.map(doc => ({
          id: doc._id.toString(),
          startupId: doc.startupId.toString(),
          startupName: doc.startupName,
          investorId: doc.investorId.toString(),
          investorName: doc.investorName,
          firmName: doc.firmName,
          amount: doc.amount,
          dealType: doc.dealType as any,
          rating: doc.rating,
          review: doc.review,
          createdAt: doc.createdAt.toISOString(),
        }));
      } catch (e) {
        console.error('Error fetching investments by investor from MongoDB:', e);
      }
    }

    return memInvestments.filter(i => i.investorId === investorId);
  },

  getAll: async (): Promise<Investment[]> => {
    const hasDb = await initDb();

    if (hasDb) {
      try {
        const docs = await InvestmentModel.find().sort({ createdAt: -1 });
        return docs.map(doc => ({
          id: doc._id.toString(),
          startupId: doc.startupId.toString(),
          startupName: doc.startupName,
          investorId: doc.investorId.toString(),
          investorName: doc.investorName,
          firmName: doc.firmName,
          amount: doc.amount,
          dealType: doc.dealType as any,
          rating: doc.rating,
          review: doc.review,
          createdAt: doc.createdAt.toISOString(),
        }));
      } catch (e) {
        console.error('Error fetching all investments from MongoDB:', e);
      }
    }

    return [...memInvestments];
  }
};
