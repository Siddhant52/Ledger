import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { TransactionProvider } from '@/contexts/TransactionContext';

export const metadata: Metadata = {
  title: 'Ledger — Personal Finance Tracker',
  description: 'Track your income, expenses, and savings with elegance.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <TransactionProvider>
            {children}
          </TransactionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
