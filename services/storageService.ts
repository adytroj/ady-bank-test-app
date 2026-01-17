import { FinancialState, Transaction, RecurringPayment, TransactionType } from '../types';

const STORAGE_KEY = 'cashtrack_data_v1';

const DEFAULT_STATE: FinancialState = {
  bankBalance: 0,
  cashBalance: 0,
  transactions: [],
  recurringPayments: []
};

export const loadData = (): FinancialState => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : DEFAULT_STATE;
  } catch (e) {
    console.error("Failed to load data", e);
    return DEFAULT_STATE;
  }
};

export const saveData = (state: FinancialState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save data", e);
  }
};

export const calculateBalances = (transactions: Transaction[]) => {
  let bank = 0;
  let cash = 0;

  transactions.forEach(t => {
    const amount = Number(t.amount);
    switch (t.type) {
      case TransactionType.DEPOSIT:
        bank += amount;
        break;
      case TransactionType.WITHDRAWAL:
        bank -= amount;
        cash += amount;
        break;
      case TransactionType.CASH_SPEND:
        cash -= amount;
        break;
      case TransactionType.BANK_SPEND:
        bank -= amount;
        break;
    }
  });

  return { bank, cash };
};