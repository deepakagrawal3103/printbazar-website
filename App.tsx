
import React, { useState, useEffect } from 'react';
import { 
  MOCK_PRODUCTS, MOCK_ORDERS, MOCK_STOCK, MOCK_EXPENSES, generateId 
} from './services/mockData';
import { 
  Product, CartItem, Order, StockItem, Expense, OrderStatus, Role, CurrentUser 
} from './types';
import { AdminLayout, UserLayout } from './components/Layouts';
import { AdminPageContent } from './pages/Admin'; 
import { UserPage } from './pages/User';
import { Printer, Lock, User, Phone, ArrowRight, Loader, Mail } from 'lucide-react';

// --- Auth Component ---
const AuthScreen = ({ onLogin }: { onLogin: (user: CurrentUser) => void }) => {
  const [activeTab, setActiveTab] = useState<'customer' | 'admin'>('customer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form States
  const [customerForm, setCustomerForm] = useState({ name: '', phone: '' });
  const [adminForm, setAdminForm] = useState({ email: '', password: '' });

  const handleCustomerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!customerForm.name || !customerForm.phone) {
      setError('Please enter both name and phone number.');
      return;
    }

    if (customerForm.phone.length < 10) {
      setError('Please enter a valid phone number.');
      return;
    }

    setLoading(true);
    // Simulate Network Request
    setTimeout(() => {
      onLogin({
        name: customerForm.name,
        phone: customerForm.phone,
        role: Role.CUSTOMER
      });
      setLoading(false);
    }, 800);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!adminForm.email || !adminForm.password) {
      setError('Please enter credentials.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      // Mock Credential Check
      if (adminForm.email === 'admin@printmaster.com' && adminForm.password === 'admin') {
        onLogin({
          name: 'Administrator',
          email: adminForm.email,
          role: Role.ADMIN
        });
      } else {
        setError('Invalid email or password.');
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 p-8 text-center">
          <div className="mx-auto bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-900/50">
            <Printer size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">PrintMaster Pro</h1>
          <p className="text-slate-400 text-sm mt-1">Digital Printing Management System</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          <button 
            onClick={() => { setActiveTab('customer'); setError(''); }}
            className={`flex-1 py-4 text-sm font-bold transition-colors ${activeTab === 'customer' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Customer Login
          </button>
          <button 
             onClick={() => { setActiveTab('admin'); setError(''); }}
             className={`flex-1 py-4 text-sm font-bold transition-colors ${activeTab === 'admin' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Admin Portal
          </button>
        </div>

        {/* Forms */}
        <div className="p-8">
          {error && (
            <div className="mb-6 bg-red-50 text-red-600 text-sm p-3 rounded-lg font-medium animate-in fade-in slide-in-from-top-1">
              {error}
            </div>
          )}

          {activeTab === 'customer' ? (
            <form onSubmit={handleCustomerLogin} className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Enter your name"
                    value={customerForm.name}
                    onChange={(e) => setCustomerForm({...customerForm, name: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="tel" 
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm({...customerForm, phone: e.target.value.replace(/\D/g,'')})}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
              >
                {loading ? <Loader className="animate-spin" size={20}/> : <span className="flex items-center gap-2">Start Shopping <ArrowRight size={18}/></span>}
              </button>
              <p className="text-center text-xs text-slate-400 mt-4">By continuing, you agree to our Terms of Service.</p>
            </form>
          ) : (
            <form onSubmit={handleAdminLogin} className="space-y-4 animate-in fade-in slide-in-from-left-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="email" 
                    placeholder="admin@printmaster.com"
                    value={adminForm.email}
                    onChange={(e) => setAdminForm({...adminForm, email: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={adminForm.password}
                    onChange={(e) => setAdminForm({...adminForm, password: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
              >
                {loading ? <Loader className="animate-spin" size={20}/> : 'Login to Dashboard'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

const App = () => {
  // --- Global State ---
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  
  // Admin Data
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('pm_orders');
    return saved ? JSON.parse(saved) : MOCK_ORDERS;
  });
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [stock, setStock] = useState<StockItem[]>(MOCK_STOCK);
  const [expenses, setExpenses] = useState<Expense[]>(MOCK_EXPENSES);
  const [activeAdminTab, setActiveAdminTab] = useState('dashboard');
  
  // Dynamic Categories State
  const [categories, setCategories] = useState<string[]>([]);

  // User Data
  const [activeUserTab, setActiveUserTab] = useState('home');
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('pm_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // --- Persistence Effects ---
  
  // Check for stored session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('pm_user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('pm_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('pm_cart', JSON.stringify(cart));
  }, [cart]);

  // --- Actions ---

  const handleLogin = (user: CurrentUser) => {
    setCurrentUser(user);
    localStorage.setItem('pm_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('pm_user');
    setActiveAdminTab('dashboard');
    setActiveUserTab('home');
  };

  // Stock Management Actions
  const handleAddStock = (newItem: Omit<StockItem, 'id'>) => {
    const item: StockItem = { ...newItem, id: generateId() };
    setStock(prev => [item, ...prev]);
  };

  const handleUpdateStock = (id: string, updates: Partial<StockItem>) => {
    setStock(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const handleDeleteStock = (id: string) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      setStock(prev => prev.filter(s => s.id !== id));
    }
  };

  // Category Actions
  const handleAddCategory = (newCategory: string) => {
    if (!categories.includes(newCategory)) {
      setCategories(prev => [...prev, newCategory]);
    }
  };

  // Cart Logic
  const addToCart = (product: Product | CartItem) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { 
                ...item, 
                quantity: item.quantity + 1, 
                totalPrice: (item.quantity + 1) * item.price 
              } 
            : item
        );
      }
      
      const newItem: CartItem = 'totalPrice' in product 
        ? (product as CartItem)
        : { ...product, quantity: 1, totalPrice: product.price };

      return [...prev, newItem];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty, totalPrice: newQty * item.price };
      }
      return item;
    }));
  };

  const placeOrder = async (details: { name: string, phone: string, urgent: boolean }) => {
    const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
    const urgentFee = details.urgent ? 50 : 0;
    const total = subtotal + urgentFee;
    
    // Simple cost calculation mock
    const costTotal = cart.reduce((sum, item) => sum + (item.cost * item.quantity), 0);

    const newOrder: Order = {
      id: `ORD-${Math.floor(Math.random() * 10000)}`,
      customerName: details.name,
      customerPhone: details.phone,
      items: [...cart],
      subtotal,
      urgentFee,
      total,
      costTotal,
      profit: total - costTotal,
      status: OrderStatus.RECEIVED,
      createdAt: new Date().toISOString(),
      paymentStatus: 'Pending',
      paymentMethod: 'UPI' // Default for online portal orders
    };

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Update State
    setOrders(prev => [newOrder, ...prev]);
    setCart([]);
    
    // Deduct stock (Simulated logic: 1 unit stock per 10 items for now, simplified)
    setStock(prev => prev.map(s => {
       if (s.category === 'Paper') return { ...s, quantity: Math.max(0, s.quantity - 1) };
       return s;
    }));
  };

  // Admin Actions
  
  const handleUpdateOrder = (id: string, updates: Partial<Order>) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
  };

  const handleDeleteOrder = (id: string) => {
    if(window.confirm("Are you sure you want to delete this order entirely?")) {
      setOrders(prev => prev.filter(o => o.id !== id));
    }
  };

  const toggleProductStock = (id: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, inStock: !p.inStock } : p));
  };

  const handleAdminCreateOrder = (orderData: any) => {
    const { customerName, customerPhone, items, urgent } = orderData;
    const subtotal = items.reduce((sum: any, item: any) => sum + item.totalPrice, 0);
    const urgentFee = urgent ? 50 : 0;
    const total = subtotal + urgentFee;
    const costTotal = items.reduce((sum: any, item: any) => sum + (item.cost * item.quantity), 0);
    
    const newOrder: Order = {
      id: `ORD-${Math.floor(Math.random() * 10000)}`,
      customerName,
      customerPhone,
      items,
      subtotal,
      urgentFee,
      total,
      costTotal,
      profit: total - costTotal,
      status: OrderStatus.RECEIVED,
      createdAt: new Date().toISOString(),
      paymentStatus: 'Pending', 
      paymentMethod: 'Cash' 
    };

    setOrders(prev => [newOrder, ...prev]);
    
    // Deduct stock
    setStock(prev => prev.map(s => {
       if (s.category === 'Paper') return { ...s, quantity: Math.max(0, s.quantity - 1) };
       return s;
    }));
  };

  // --- Auth Render ---
  if (!currentUser) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  // --- Routing ---
  if (currentUser.role === Role.ADMIN) {
    return (
      <AdminLayout 
        userType="admin" 
        activeTab={activeAdminTab} 
        onTabChange={setActiveAdminTab} 
        onLogout={handleLogout}
      >
        <AdminPageContent 
          activeTab={activeAdminTab}
          products={products}
          stock={stock}
          orders={orders}
          expenses={expenses}
          categories={categories}
          onUpdateOrder={handleUpdateOrder} 
          onDeleteOrder={handleDeleteOrder} 
          onToggleProductStock={toggleProductStock}
          onAddStock={handleAddStock}
          onUpdateStock={handleUpdateStock}
          onDeleteStock={handleDeleteStock}
          onAddCategory={handleAddCategory}
          onAddOrder={handleAdminCreateOrder}
        />
      </AdminLayout>
    );
  }

  return (
    <UserLayout 
      userType="user" 
      activeTab={activeUserTab} 
      onTabChange={setActiveUserTab}
      onLogout={handleLogout}
      cartCount={cart.length}
      onCartClick={() => setActiveUserTab('cart')}
    >
      <UserPage 
        key={activeUserTab} 
        products={products}
        cart={cart}
        orders={orders} // Pass orders to UserPage
        addToCart={addToCart}
        removeFromCart={removeFromCart}
        updateCartQuantity={updateCartQuantity}
        placeOrder={placeOrder}
        activeTab={activeUserTab}
        onNavigate={setActiveUserTab}
        currentUser={currentUser}
      />
    </UserLayout>
  );
};

export default App;
