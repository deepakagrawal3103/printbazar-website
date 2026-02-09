
// Domain Entities

export enum Role {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  CUSTOMER = 'CUSTOMER'
}

export interface CurrentUser {
  name: string;
  role: Role;
  phone?: string; // For customers
  email?: string; // For admin
}

export enum OrderStatus {
  RECEIVED = 'Pending',
  PRINTING = 'Printing',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled'
}

export interface Product {
  id: string;
  name: string;
  category: string; // Changed to string to allow dynamic categories
  description: string;
  price: number; // Selling price
  cost: number; // Cost price (hidden from user)
  quantity: number; // Inventory Count
  inStock: boolean; // Computed from quantity > 0
  image: string;
}

export interface CartItem extends Product {
  quantity: number;
  options?: {
    pages?: number;
    color?: boolean; // true = color, false = b&w
    binding?: boolean;
  };
  // New fields for Custom Print
  fileDetails?: {
    fileName: string;
    fileUrl: string;
    pageCount: number;
    printType: 'BW' | 'Color';
    sideType: 'Single' | 'Double';
    binding: 'None' | 'Spiral' | 'Hard' | 'Wire';
  };
  totalPrice: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  items: CartItem[];
  subtotal: number;
  urgentFee: number;
  total: number;
  costTotal: number; // For profit calc
  profit: number;
  status: OrderStatus;
  createdAt: string; // ISO date
  paymentStatus: 'Paid' | 'Pending' | 'Partial';
  paymentMethod: 'Cash' | 'Online' | 'UPI' | 'Split';
  paymentSplit?: {
    cash: number;
    online: number;
  };
}

export interface StockItem {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  threshold: number; // Low stock alert level
  category: 'Paper' | 'Ink' | 'Binding' | 'Cover' | 'Lamination' | 'Stationery' | 'Other';
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: 'Rent' | 'Electricity' | 'Raw Material' | 'Repairs' | 'Other';
  date: string;
}

export interface DailyStats {
  date: string;
  sales: number;
  orders: number;
  profit: number;
}
