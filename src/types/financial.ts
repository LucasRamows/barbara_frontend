export type TransactionType = "income" | "expense" | "credit";

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  timestamp: string;
  dateDisplay: string;
  date?: string; // from backend
}

export interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  createdAt?: string;
}

export type InvestmentType = "REAL_ESTATE" | "STOCKS" | "REITS";

export interface Investment {
  id: string;
  name: string;
  type: InvestmentType;
  investedAmount: number;
  currentValue: number;
  createdAt?: string;
}
