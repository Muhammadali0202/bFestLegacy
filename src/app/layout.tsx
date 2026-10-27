import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'Business Fest 2027 | IMSciences Peshawar',
  description: 'Official centralized platform for Business Fest 2027 at the Institute of Management Sciences (IMSciences) Peshawar. Explore innovative startups, view live leaderboards, and evaluate business pitches.',
  keywords: ['Business Fest 2027', 'IMSciences Peshawar', 'Startups Peshawar', 'Khyber Pakhtunkhwa Entrepreneurship', 'Business Competition', 'Live Leaderboard'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🏆</text></svg>" />
      </head>
      <body>
        <AuthProvider>
          <Navbar />
          <main className="main-content">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
