export type StartupStatus = 'pending' | 'approved' | 'rejected';

export type UserRole = 'admin' | 'student' | 'investor' | 'judge';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  isApproved?: boolean; // For investors, requires admin approval
  companyOrFirm?: string; // For investors
  investmentCapacity?: string; // For investors (e.g. PKR 500k - 2M)
  bio?: string;
  teamName?: string; // For students
  institution?: string; // University or institution name
  judgePin?: string; // For judges
  judgeDesignation?: string; // For judges
  createdAt: string;
}

export type BusinessSector = 
  | 'FinTech & Banking'
  | 'AgriTech & Food'
  | 'HealthTech & Med'
  | 'EdTech & Learning'
  | 'AI & Smart Systems'
  | 'Green & CleanTech'
  | 'E-Commerce & Logistics';

export interface Startup {
  id: string;
  name: string;
  tagline: string;
  description: string;
  problem: string;
  solution: string;
  sector: BusinessSector;
  logo: string;
  website?: string;
  contactEmail: string;
  founders: {
    name: string;
    role: string;
    avatar?: string;
  }[];
  boothNumber?: string;
  status: StartupStatus;
  isPublished: boolean;
  publicRating: number;      // 1-5 scale
  totalPublicVotes: number;
  judgeScore: number;        // 1-100 scale composite
  totalJudgeEvaluations: number;
  
  // Investor Metrics
  investorRating: number;    // 1-5 scale
  totalInvestorRatings: number;
  totalInvestedAmount: number; // In PKR
  investorScore: number;     // 0-100 scale normalized
  
  // Overall Composite & Ranking
  compositeScore: number;    // Weighted combination of Judge + Investor + Public
  rank?: number;
  submittedBy?: string;      // Student User ID
  createdAt: string;
}

export interface Investment {
  id: string;
  startupId: string;
  startupName: string;
  investorId: string;
  investorName: string;
  firmName?: string;
  amount: number;            // Amount in PKR
  dealType?: 'Seed Equity' | 'SAFE Note' | 'Grant Pledge' | 'Convertible';
  rating: number;            // 1-5 scale
  review?: string;
  createdAt: string;
}

export interface JudgeEvaluation {
  id: string;
  startupId: string;
  judgeName: string;
  judgePin?: string;
  innovationScore: number;   // 1-10
  marketScore: number;       // 1-10
  executionScore: number;    // 1-10
  pitchScore: number;        // 1-10
  totalNormalizedScore: number; // 0-100
  notes?: string;
  createdAt: string;
}

export interface PublicVote {
  id: string;
  startupId: string;
  voterToken: string;
  rating: number; // 1-5
  feedback?: string;
  createdAt: string;
}

export interface EventConfig {
  eventName: string;
  edition: string;
  institution: string;
  isVotingOpen: boolean;
  isJudgeScoringOpen: boolean;
  isLeaderboardFrozen: boolean;
  resultsAnnounced: boolean;
  judgeWeight: number;    // default: 0.50
  investorWeight: number; // default: 0.30
  publicWeight: number;   // default: 0.20
}
