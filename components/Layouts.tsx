import React from 'react';
import { 
  ShoppingBag, 
  LayoutDashboard, 
  Package, 
  FileText, 
  DollarSign, 
  Settings, 
  LogOut,
  Menu,
  X,
  Printer
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  userType: 'admin' | 'user';
  onLogout?: () => void;
  cartCount?: number;
  onCartClick?: () => void;
}

export const AdminLayout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  onTabChange, 
  onLogout 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const NavItem = ({ id, icon: Icon, label }: { id: string, icon: any, label: string }) => (
    <button
      onClick={() => {
        if (onTabChange) onTabChange(id);
        setIsMobileMenuOpen(false);
      }}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
        activeTab === id 
          ? 'bg-blue-600 text-white shadow-md' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white h-screen sticky top-0 shadow-xl z-20">
        <div 
          className="p-6 border-b border-slate-700 flex items-center space-x-2 cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => onTabChange && onTabChange('dashboard')}
        >
          <Printer className="text-blue-500" size={28} />
          <h1 className="text-xl font-bold tracking-tight">PrintMaster<span className="text-blue-500">Pro</span></h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem id="orders" icon={FileText} label="Orders" />
          <NavItem id="products" icon={ShoppingBag} label="Products" />
          <NavItem id="stock" icon={Package} label="Raw Stock" />
          <NavItem id="expenses" icon={DollarSign} label="Expenses" />
          <NavItem id="settings" icon={Settings} label="Settings" />
        </nav>

        <div className="p-4 border-t border-slate-700">
          <button 
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center shadow-md z-30 sticky top-0">
         <div className="flex items-center space-x-2" onClick={() => onTabChange && onTabChange('dashboard')}>
          <Printer className="text-blue-500" size={24} />
          <h1 className="text-lg font-bold">PrintMaster</h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-slate-900 z-20 pt-16 px-4 pb-4 overflow-y-auto">
          <nav className="space-y-2">
            <NavItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavItem id="orders" icon={FileText} label="Orders" />
            <NavItem id="products" icon={ShoppingBag} label="Products" />
            <NavItem id="stock" icon={Package} label="Raw Stock" />
            <NavItem id="expenses" icon={DollarSign} label="Expenses" />
            <button 
              onClick={onLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-400 mt-8"
            >
              <LogOut size={20} />
              <span>Sign Out</span>
            </button>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen p-4 md:p-8">
        {children}
      </main>
    </div>
  );
};

export const UserLayout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  onTabChange, 
  onLogout,
  cartCount = 0,
  onCartClick
}) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div 
              className="flex items-center cursor-pointer hover:opacity-75 transition-opacity group" 
              onClick={() => onTabChange && onTabChange('home')}
              title="Go to Home"
            >
              <Printer className="text-blue-600 mr-2 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-xl text-slate-800 group-hover:text-blue-600 transition-colors">PrintShop</span>
            </div>
            
            <div className="flex items-center space-x-4">
               <button 
                onClick={() => onTabChange && onTabChange('orders')}
                className={`text-sm font-medium ${activeTab === 'orders' ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'}`}
              >
                My Orders
              </button>
              
              <button 
                onClick={onCartClick}
                className="relative p-2 text-slate-600 hover:text-blue-600 transition-colors"
              >
                <ShoppingBag size={24} />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>

              <button 
                onClick={onLogout}
                className="text-sm font-medium text-slate-500 hover:text-slate-800"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 overflow-hidden sm:px-6 lg:px-8">
          <p className="mt-1 text-center text-sm text-slate-500">
            &copy; 2024 PrintShop Local. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};