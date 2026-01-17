export enum TransactionType {
  DEPOSIT = 'DEPOSIT',       // Income -> Bank
  WITHDRAWAL = 'WITHDRAWAL', // Bank -> Cash (Transfer)
  CASH_SPEND = 'CASH_SPEND', // Cash -> Expense
  BANK_SPEND = 'BANK_SPEND'  // Bank -> Expense (e.g. Recurring bills)
}

export enum RecurrenceFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY'
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  description: string;
  category: string;
  date: string; // ISO string
  receipt?: string; // Base64 Data URL
}

export interface RecurringPayment {
  id: string;
  name: string;
  amount: number;
  frequency: RecurrenceFrequency;
  interval: number; // e.g. Every 2 months
  category: string;
  nextDueDate: string; // ISO string
  active: boolean;
}

export interface FinancialState {
  bankBalance: number;
  cashBalance: number;
  transactions: Transaction[];
  recurringPayments: RecurringPayment[];
}