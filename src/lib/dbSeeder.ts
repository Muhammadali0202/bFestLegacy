import connectToDatabase from './mongodb';
import { Startup, EventConfig, Sector, User, Investment } from '@/models';
import { initialStartups, initialEventConfig, initialInvestments } from './mockData';
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
      email: 'admin@imsciences.edu.pk',
      passwordHash: hashPassword('admin123'),
      role: 'admin',
      isApproved: true,
      institution: 'IMSciences Peshawar',
    },
    {
      fullName: 'Prof. Dr. Irfanullah (IMSciences Jury)',
      email: 'jury.irfan@imsciences.edu.pk',
      passwordHash: hashPassword('judge123'),
      role: 'judge',
      isApproved: true,
      judgePin: '2027',
      judgeDesignation: 'Professor & Dean of Entrepreneurship, IMSciences',
      institution: 'IMSciences Peshawar',
    },
    {
      fullName: 'Malik Jahangir Khan',
      email: 'investor@venturekp.com',
      passwordHash: hashPassword('investor123'),
      role: 'investor',
      isApproved: true,
      companyOrFirm: 'Khyber Angel Syndicate & VC',
      investmentCapacity: 'PKR 1M - 5M',
      bio: 'Venture Partner backing climate tech, FinTech, and frontier Pakistani startups.',
    },
    {
      fullName: 'Naveed Akhtar (Peshawar Angels)',
      email: 'angel@peshawarcap.pk',
      passwordHash: hashPassword('investor123'),
      role: 'investor',
      isApproved: false, // Pending admin approval
      companyOrFirm: 'Peshawar Seed Network',
      investmentCapacity: 'PKR 500k - 2M',
      bio: 'Early-stage tech angel focused on Agritech and health logistics.',
    },
    {
      fullName: 'Hamza Khattak',
      email: 'student@imsciences.edu.pk',
      passwordHash: hashPassword('student123'),
      role: 'student',
      isApproved: true,
      teamName: 'Khyber Innovators Team',
      institution: 'IMSciences Peshawar (BS Software Engineering)',
    },
  ];

  for (const u of seedUsersList) {
    const existing = await User.findOne({ email: u.email });
    if (!existing) {
      await User.create(u);
    } else if (existing.passwordHash === 'admin_secure_hash' || existing.passwordHash === 'jury_secure_hash') {
      existing.passwordHash = u.passwordHash;
      if (u.role) existing.role = u.role;
      await existing.save();
    }
  }

  // 4. Seed Startups if missing
  const startupCount = await Startup.countDocuments();
  if (startupCount === 0) {
    const startupDocs = initialStartups.map((s) => ({
      name: s.name,
      tagline: s.tagline,
      description: s.description,
      problem: s.problem,
      solution: s.solution,
      sector: s.sector,
      logo: s.logo,
      website: s.website,
      contactEmail: s.contactEmail,
      founders: s.founders,
      boothNumber: s.boothNumber,
      status: s.status,
      isPublished: s.isPublished,
      publicRating: s.publicRating,
      totalPublicVotes: s.totalPublicVotes,
      judgeScore: s.judgeScore,
      totalJudgeEvaluations: s.totalJudgeEvaluations,
      investorRating: s.investorRating || 0,
      totalInvestorRatings: s.totalInvestorRatings || 0,
      totalInvestedAmount: s.totalInvestedAmount || 0,
      investorScore: s.investorScore || 0,
      compositeScore: s.compositeScore,
      rank: s.rank,
      createdAt: new Date(s.createdAt),
    }));

    await Startup.insertMany(startupDocs);
    console.log(`[DB Seeder] Seeded ${startupDocs.length} initial startups.`);
  }

  // 5. Seed Investments if missing
  const invCount = await Investment.countDocuments();
  if (invCount === 0) {
    const investorUser = await User.findOne({ email: 'investor@venturekp.com' });
    const startups = await Startup.find();
    if (investorUser && startups.length > 0) {
      const invDocs = initialInvestments.map(inv => {
        const matchingStartup = startups.find(s => s.name === inv.startupName) || startups[0];
        return {
          startupId: matchingStartup._id,
          startupName: matchingStartup.name,
          investorId: investorUser._id,
          investorName: investorUser.fullName,
          firmName: investorUser.companyOrFirm,
          amount: inv.amount,
          dealType: inv.dealType,
          rating: inv.rating,
          review: inv.review,
        };
      });
      await Investment.insertMany(invDocs);
      console.log(`[DB Seeder] Seeded initial investments.`);
    }
  }
}
