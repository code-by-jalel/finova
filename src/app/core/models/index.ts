
export interface Company {
  id: string;
  name: string;
  industry: string;
  registrationNumber: string;
  address: string;
  phone: string;
  email: string;
  createdAt: string;
  status: 'active' | 'suspended' | 'archived';
  plan: 'starter' | 'standard' | 'premium' | 'enterprise';
}

export type UserRole = 'admin' | 'treasurer' | 'manager' | 'accountant' | 'approver' | 'viewer';

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  companyId: string;
  permissions: string[];
  status: 'active' | 'inactive' | 'suspended' | 'pending';
}

export interface AuthResponse {
  token: string;
  user: User;
}


export type WalletType = 'operational' | 'savings' | 'client_funds' | 'investment' | 'reserve';

export interface Wallet {
  id: string;
  companyId: string;
  name: string;
  type: WalletType;
  currency: string;
  balance: number;
  initialBalance: number;
  creditLimit: number;
  status: 'active' | 'frozen' | 'suspended';
  createdAt: string;
  description: string;
}


export type TransactionType = 'invoice' | 'expense' | 'transfer' | 'income' | 'adjustment';
export type TransactionStatus = 'pending' | 'confirmed' | 'paid' | 'rejected' | 'completed';
export type TransactionCategory = 'salary' | 'subscriptions' | 'purchases' | 'travel' | 'maintenance' | 'other';

export interface Transaction {
  id: string;
  companyId: string;
  walletId: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: string;
  category: string;
  subcategory: string;
  description: string;
  invoiceNumber?: string;
  relatedEntity?: string;
  relatedEntityType?: 'client' | 'supplier' | 'department' | 'bank';
  date: string;
  dueDate?: string;
  paidDate?: string;
  createdBy: string;
  approvedBy?: string;
  tags: string[];
  notes?: string;
  attachmentUrl?: string;
  sourceWallet?: string;
  destinationWallet?: string;
}


export type BudgetStatus = 'healthy' | 'warning' | 'exceeded' | 'pending';

export interface Budget {
  id: string;
  companyId: string;
  walletId: string;
  department: string;
  category: string;
  subcategory: string;
  month: string;
  limit: number;
  spent: number;
  forecast: number;
  status: BudgetStatus;
  notes: string;
}


export interface Supplier {
  id: string;
  companyId: string;
  name: string;
  type: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  registrationNumber: string;
  accountManager: string;
  paymentTerms: string;
  status: 'active' | 'inactive' | 'blocked';
  createdAt: string;
}

export interface Client {
  id: string;
  companyId: string;
  name: string;
  type: 'business' | 'individual';
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  registrationNumber?: string;
  creditLimit: number;
  paymentTerms: string;
  status: 'active' | 'inactive' | 'blocked';
  createdAt: string;
}


export type AlertType = 'low_balance' | 'budget_warning' | 'invoice_pending' | 'invoice_overdue' | 'transaction_anomaly' | 'approval_required';
export type AlertSeverity = 'info' | 'warning' | 'danger';

export interface Alert {
  id: string;
  companyId: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  walletId?: string;
  budgetId?: string;
  transactionId?: string;
  threshold?: number;
  currentValue?: number;
  percentage?: number;
  amount?: number;
  daysOverdue?: number;
  createdAt: string;
  read: boolean;
}


export interface DashboardData {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  pendingApprovals: number;
  overdueBudgets: number;
  growthPercentage: number;
  monthlyExpenses: Array<{ month: string; amount: number }>;
  expensesByCategory: Array<{ category: string; amount: number }>;
  monthlyIncome: Array<{ month: string; amount: number }>;
  walletsSummary: Array<{ walletId: string; name: string; balance: number; percentage: number }>;
  alerts: Alert[];
  topExpenses: Transaction[];
  upcomingPayments: Transaction[];
}


export interface AuditLog {
  id: string;
  companyId: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  changes: any;
  timestamp: string;
  ipAddress: string;
}
