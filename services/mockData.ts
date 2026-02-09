
import { Product, StockItem, Order, OrderStatus, Expense } from '../types';

export const MOCK_PRODUCTS: Product[] = [
  // --- Files Category ---
  {
    id: 'pf-bee',
    name: 'BEEE Practical File',
    category: 'Practical Files',
    description: 'Basic Electrical & Electronics Engineering standard file. Complete with diagrams.',
    price: 150,
    cost: 80,
    quantity: 50,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'pf-chem-45',
    name: 'Chemistry Lab Manual',
    category: 'Practical Files',
    description: 'Chemistry practical file with 45 ruled pages and graph papers.',
    price: 120,
    cost: 60,
    quantity: 15,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1532153975070-2e9ab71f1b14?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'pf-phy',
    name: 'Physics Practical Record',
    category: 'Practical Files',
    description: 'Physics lab record book. 100 Pages.',
    price: 140,
    cost: 70,
    quantity: 20,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'pf-workshop',
    name: 'Workshop Technology File',
    category: 'Practical Files',
    description: 'Standard file for Workshop practice.',
    price: 110,
    cost: 55,
    quantity: 0,
    inStock: false,
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=400&q=80'
  },

  // --- Print Services (Base Items for Logic) ---
  {
    id: 'svc-print-custom',
    name: 'Custom Document Print',
    category: 'Custom Print',
    description: 'Upload PDF, we print and bind. Price per page.',
    price: 2, // Base price for B/W
    cost: 0.5,
    quantity: 9999,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1562564055-71e051d33c19?auto=format&fit=crop&w=400&q=80'
  },

  // --- Binding Category ---
  {
    id: 'bind-spiral',
    name: 'Spiral Binding Only',
    category: 'Spiral Copies',
    description: 'Bring your loose pages, we spiral bind them with transparent sheets.',
    price: 40,
    cost: 10,
    quantity: 200,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'bind-soft',
    name: 'Soft Cover Binding',
    category: 'Spiral Copies',
    description: 'Professional soft cover binding for reports.',
    price: 80,
    cost: 30,
    quantity: 50,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'bind-hard',
    name: 'Thesis Hard Binding',
    category: 'Spiral Copies',
    description: 'Golden emboss print on hard cover. Best for final year projects.',
    price: 250,
    cost: 100,
    quantity: 20,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80'
  },

  // --- Stationery Category ---
  {
    id: 'st-pen-blue',
    name: 'Ball Point Pen (Blue)',
    category: 'Stationery',
    description: 'Smooth writing ball pen.',
    price: 10,
    cost: 4,
    quantity: 100,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'st-a4-rim',
    name: 'A4 Sheet Rim (500 Sheets)',
    category: 'Stationery',
    description: '75 GSM High quality paper.',
    price: 320,
    cost: 280,
    quantity: 10,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=400&q=80'
  }
];

export const MOCK_STOCK: StockItem[] = [
  // Paper
  { id: 's1', name: 'A4 JK Copier 75GSM', unit: 'Ream (500)', quantity: 8, threshold: 10, category: 'Paper' }, // LOW STOCK
  { id: 's2', name: 'A4 Double A 80GSM', unit: 'Ream (500)', quantity: 20, threshold: 5, category: 'Paper' },
  { id: 's3', name: 'A3 Bond Paper', unit: 'Pack (250)', quantity: 2, threshold: 3, category: 'Paper' }, // LOW STOCK
  { id: 's4', name: 'Glossy Photo Paper 180GSM', unit: 'Pack (50)', quantity: 30, threshold: 5, category: 'Paper' },
  
  // Ink & Toner
  { id: 's6', name: 'HP 12A Black Toner', unit: 'Cartridge', quantity: 1, threshold: 2, category: 'Ink' }, // LOW STOCK
  { id: 's7', name: 'Canon 337 Toner', unit: 'Cartridge', quantity: 3, threshold: 2, category: 'Ink' },
  { id: 's8', name: 'Epson 003 Ink Set (CMYK)', unit: 'Set', quantity: 5, threshold: 2, category: 'Ink' },
  
  // Binding
  { id: 's9', name: 'Spiral Coils 6mm', unit: 'Box (100)', quantity: 5, threshold: 2, category: 'Binding' },
  { id: 's10', name: 'Spiral Coils 10mm', unit: 'Box (100)', quantity: 12, threshold: 5, category: 'Binding' },
  { id: 's11', name: 'Spiral Coils 14mm', unit: 'Box (50)', quantity: 8, threshold: 3, category: 'Binding' },
  
  // Covers & Lamination
  { id: 's13', name: 'OHP Transparent Sheet A4', unit: 'Pack (100)', quantity: 15, threshold: 5, category: 'Cover' },
  { id: 's16', name: 'Lamination Pouch A4', unit: 'Pack (100)', quantity: 20, threshold: 5, category: 'Lamination' },

  // Stationery Raw
  { id: 's18', name: 'Stapler Pins 24/6', unit: 'Box', quantity: 50, threshold: 10, category: 'Stationery' },
  { id: 's19', name: 'Glue Stick Box', unit: 'Box', quantity: 4, threshold: 5, category: 'Stationery' }, // LOW STOCK
];

export const MOCK_EXPENSES: Expense[] = [
  { id: 'e1', title: 'Shop Rent (May)', amount: 15000, category: 'Rent', date: '2024-05-01' },
  { id: 'e2', title: 'Electricity Bill (April)', amount: 3200, category: 'Electricity', date: '2024-05-05' },
  { id: 'e3', title: 'JK Paper Bulk Order', amount: 8500, category: 'Raw Material', date: '2024-05-10' },
  { id: 'e4', title: 'Printer Service - Canon', amount: 1200, category: 'Repairs', date: '2024-05-15' },
  { id: 'e5', title: 'Tea & Refreshments', amount: 450, category: 'Other', date: '2024-05-18' },
  { id: 'e6', title: 'Internet Bill', amount: 999, category: 'Other', date: '2024-05-20' },
];

const TODAY = new Date().toISOString();
const YESTERDAY = new Date(Date.now() - 86400000).toISOString();

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-8821',
    customerName: 'Aarav Gupta',
    customerPhone: '9876500001',
    items: [
      { ...MOCK_PRODUCTS[0], quantity: 1, totalPrice: 150 }  // Bee File
    ],
    subtotal: 150,
    urgentFee: 0,
    total: 150,
    costTotal: 80,
    profit: 70,
    status: OrderStatus.RECEIVED,
    createdAt: TODAY,
    paymentStatus: 'Pending',
    paymentMethod: 'Cash'
  },
  {
    id: 'ORD-8820',
    customerName: 'Sanya Malhotra',
    customerPhone: '9876500002',
    items: [
      { 
        ...MOCK_PRODUCTS[4], // Custom Print
        quantity: 1, 
        totalPrice: 140, // 50 pages * 2 + 40 binding
        fileDetails: {
           fileName: 'Lab_Manual_Final.pdf',
           fileUrl: '#',
           pageCount: 50,
           printType: 'BW',
           sideType: 'Double',
           binding: 'Spiral'
        }
      } 
    ],
    subtotal: 140,
    urgentFee: 0,
    total: 140,
    costTotal: 40,
    profit: 100,
    status: OrderStatus.PRINTING,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), 
    paymentStatus: 'Paid',
    paymentMethod: 'Online'
  }
];

// Helper to generate a random ID
export const generateId = () => Math.random().toString(36).substr(2, 9);
