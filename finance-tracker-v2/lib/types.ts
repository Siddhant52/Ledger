export type TransactionType = 'income' | 'expense';

export type Category =
  | 'salary' | 'freelance' | 'investment' | 'gift' | 'other_income'
  | 'food' | 'transport' | 'housing' | 'utilities' | 'healthcare'
  | 'entertainment' | 'shopping' | 'education' | 'travel' | 'other_expense';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: Category;
  description: string;
  date: string;
  createdAt: string;
}

export interface FilterOptions {
  type?: TransactionType | 'all';
  category?: Category | 'all';
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}
