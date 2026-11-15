import connectToDatabase from './mongodb';
import { EventConfig, Sector, User } from '@/models';
import { initialEventConfig } from './mockData';
import { hashPassword } from './auth';
import { UserRole } from '@/types';

const initialSectors = [
  { name: 'FinTech & Banking', icon: '💳', description: 'Financial technology, digital wallets, micro-payments, and financial inclusion.' },
  { name: 'AgriTech & Food', icon: '🌱', description: 'Smart agriculture, precision irrigation, crop analytics, and supply chain.' },
  { name: 'HealthTech & Med', icon: '🩺', description: 'Digital health, telemedicine, medical AI diagnostics, and rural clinics.' },
  { name: 'EdTech & Learning', icon: '📚', description: 'Educational platforms, gamified curriculum, offline learning, and simulations.' },
  { name: 'AI & Smart Systems', icon: '🤖', description: 'Artificial intelligence, computer vision, robotics, and smart IoT.' },
  { name: 'Green & CleanTech', icon: '☀️', description: 'Renewable energy, clean technology, solar automation, and recycling.' },
  { name: 'E-Commerce & Logistics', icon: '🚚', description: 'Freight brokerage, direct-to-consumer marketplaces, and delivery.' },
];

export async function seedDatabaseIfEmpty() {
  await connectToDatabase();

  // 1. Seed Event Config if missing
  const existingConfig = await EventConfig.findOne({ key: 'ACTIVE_EVENT' });
  if (!existingConfig) {
    await EventConfig.create({
      key: 'ACTIVE_EVENT',
      eventName: initialEventConfig.eventName,
      edition: initialEventConfig.edition,
      institution: initialEventConfig.institution,
      isVotingOpen: initialEventConfig.isVotingOpen,
      isJudgeScoringOpen: initialEventConfig.isJudgeScoringOpen,
      isLeaderboardFrozen: initialEventConfig.isLeaderboardFrozen,
      resultsAnnounced: initialEventConfig.resultsAnnounced,
      judgeWeight: initialEventConfig.judgeWeight,
      investorWeight: initialEventConfig.investorWeight || 0.30,
      publicWeight: initialEventConfig.publicWeight,
    });
    console.log('[DB Seeder] Seeded default EventConfig.');
  }

  // 2. Seed Sectors if missing
  const sectorCount = await Sector.countDocuments();
  if (sectorCount === 0) {
    await Sector.insertMany(initialSectors);
    console.log('[DB Seeder] Seeded initial Sectors.');
  }

  // 3. Seed Users (Admin, Student, Approved Investor, Pending Investor, Judge)
  interface SeedUserItem {
    fullName: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    isApproved: boolean;
    institution?: string;
    judgePin?: string;
    judgeDesignation?: string;
    companyOrFirm?: string;
    investmentCapacity?: string;
    bio?: string;
    teamName?: string;
  }

  const seedUsersList: SeedUserItem[] = [
    {
      fullName: 'Business Fest Administrator',
      email: 'admin@bfest2027.org',
      passwordHash: hashPassword('BFest@Admin2027!'),
      role: 'admin',
      isApproved: true,
      institution: 'IMSciences Peshawar',
    },
    {
      fullName: "Bfest's Officials",
      email: 'officials@bfest2027.org',
      passwordHash: hashPassword('BFest@Officials2027!'),
      role: 'student_affairs',
      isApproved: true,
      institution: "IMSciences Peshawar - Bfest's Officials",
    },
    {
      fullName: 'Registration Team',
      email: 'registration@bfest2027.org',
      passwordHash: hashPassword('BFest@Reg2027!'),
      role: 'registration_team',
      isApproved: true,
      institution: 'IMSciences Peshawar - Registration Desk',
    },
    {
      fullName: 'TV Display Administrator',
      email: 'tv@bfest2027.org',
      passwordHash: hashPassword('BFest@TV2027!'),
      role: 'tv_admin',
      isApproved: true,
      institution: 'IMSciences Peshawar - Campus AV & TV Screens',
    },
  ];

  for (const u of seedUsersList) {
    const existing = await User.findOne({ email: u.email });
    if (!existing) {
      await User.create(u);
    }
  }
}
