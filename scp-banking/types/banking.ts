// types/banking.ts

export type AccountType = 'PERSONAL' | 'FACTION';
export type TransactionType = 'TRANSFER' | 'DEPOSIT' | 'WITHDRAWAL' | 'TAX' | 'FINE';

export interface Account {
  id: string; // UUID
  ownerName: string; 
  type: AccountType;
  balance: number;
  isFrozen: boolean;
  accountNumber: string; 
}

export interface Transaction {
  id: string;
  sourceAccountId: string | null; // Null si es emisión administrativa
  destinationAccountId: string;
  amount: number;
  type: TransactionType;
  timestamp: string;
  description?: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
}