// Auth Types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
}

// Transaction Types
export interface Transaction {
  _id: string;
  transactionId: string;
  transactionTime: string;
  ccNum: string;
  transactionType: string;
  amount: number;
  city?: string;
  userLocation?: {
    lat: number;
    lon: number;
  };
  merchantLocation?: {
    lat: number;
    lon: number;
  };
  isFraud?: boolean;
  fraudReason?: string[];
  fraudConfidence?: number;
  userId?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface DashboardData {
  totalTransactions: number;
  recentTransactions: Transaction[];
  user: User;
}

export interface TransactionFormData {
  transactionId: string;
  transactionTime: string;
  ccNum: string;
  transactionType: string;
  amount: number;
  city?: string;
  userLocation?: {
    lat: number | null;
    lon: number | null;
  };
  merchantLocation?: {
    lat: number | null;
    lon: number | null;
  };
}

// Admin Types
export interface UserProfile extends User {
  createdAt: string;
  updatedAt: string;
}

export interface TransactionFilter {
  email?: string;
  firstName?: string;
  lastName?: string;
  userId?: string;
  transactionType?: string;
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
  isFraud?: boolean;
  city?: string;
}

export interface Statistics {
  totalUsers: number;
  totalTransactions: number;
  fraudTransactions: number;
  fraudRate: number;
}