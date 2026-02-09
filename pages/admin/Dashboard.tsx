import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, AlertTriangle, Clock, DollarSign, BrainCircuit, Trash2, X, Wallet, CreditCard, Filter
} from 'lucide-react';
import { Order, OrderStatus, StockItem, Expense } from '../../types';
import { generateBusinessReport } from '../../services/gemini.ts';
import { StatCard, OrdersTable, StockWidget } from '../../components/AdminShared';

interface DashboardProps {
  orders: Order[];
  stock: StockItem[];
  expenses: Expense[];
  onUpdateOrderStatus: (id: string, status: OrderStatus) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ orders, stock, expenses, onUpdateOrderStatus }) => {
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [showPendingDetails, setShowPendingDetails] = useState(false);
  const [timeRange, setTimeRange] = useState('today');

  // --- Filtering Logic ---
  const getFilteredOrders = () => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      
      switch (timeRange) {
        case 'today':
          return orderDate >= todayStart;
        case 'yesterday':
          const yesterdayStart = new Date(todayStart);
          yesterdayStart.setDate(todayStart.getDate() - 1);
          return orderDate >= yesterdayStart && orderDate < todayStart;
        case 'week':
           // Last 7 days
           const lastWeek = new Date(todayStart);
           lastWeek.setDate(todayStart.getDate() - 6); 
           return orderDate >= lastWeek;
        case 'month':
           // Current month
           const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
           return orderDate >= thisMonth;
        case 'all':
           return true;
        default:
           return true;
      }
    });
  };

  const filteredOrders = getFilteredOrders();

  // --- Stats Calculations ---

  // 1. Period Stats (Affected by Filter)
  const periodRevenue = filteredOrders.reduce((acc, curr) => acc + curr.total, 0);
  const periodProfit = filteredOrders.reduce((acc, curr) => acc + curr.profit, 0);

  const cashCollected = filteredOrders
    .filter(o => o.paymentMethod === 'Cash' && o.paymentStatus === 'Paid')
    .reduce((acc, o) => acc + o.total, 0);

  const onlineCollected = filteredOrders
    .filter(o => (o.paymentMethod === 'Online' || o.paymentMethod === 'UPI') && o.paymentStatus === 'Paid')
    .reduce((acc, o) => acc + o.total, 0);

  // 2. Live Stats (Global - Not affected by Filter)
  const pendingOrdersList = orders.filter(o => o.status !== OrderStatus.DELIVERED && o.status !== OrderStatus.CANCELLED);
  const pendingCount = pendingOrdersList.length;
  const pendingRevenue = pendingOrdersList.reduce((acc, o) => acc + o.total, 0);
  const pendingProfit = pendingOrdersList.reduce((acc, o) => acc + o.profit, 0);
  const lowStockCount = stock.filter(s => s.quantity <= s.threshold).length;

  // Mock Data for charts (Static for visual layout)
  const salesData = [
    { name: 'Mon', sales: 400 },
    { name: 'Tue', sales: 300 },
    { name: 'Wed', sales: 600 },
    { name: 'Thu', sales: 200 },
    { name: 'Fri', sales: 900 },
    { name: 'Sat', sales: 1200 },
    { name: 'Sun', sales: 800 },
  ];

  const handleGenerateReport = async () => {
    setLoadingAi(true);
    // We pass filteredOrders so the AI analyzes the selected period
    const report = await generateBusinessReport(filteredOrders, stock, expenses);
    setAiReport(report);
    setLoadingAi(false);
  };

  const getPeriodLabel = () => {
    switch(timeRange) {
        case 'today': return "Today's";
        case 'yesterday': return "Yesterday's";
        case 'week': return "This Week's";
        case 'month': return "This Month's";
        case 'all': return "Total";
        default: return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header with Filter */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
            <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold uppercase tracking-wider">
               {getPeriodLabel()} Overview
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
             {/* Date Filter */}
             <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select 
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                >
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="all">All Time</option>
                </select>
             </div>

             <button 
              onClick={handleGenerateReport}
              disabled={loadingAi}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50 text-sm font-bold"
             >
                <BrainCircuit size={18} />
                <span>AI Insight</span>
             </button>
          </div>
      </div>

      {aiReport && (
        <div className="bg-purple-50 border border-purple-100 p-6 rounded-xl animate-fade-in relative">
            <button onClick={() => setAiReport(null)} className="absolute top-2 right-2 text-purple-400 hover:text-purple-700"><Trash2 size={16}/></button>
            <h4 className="text-purple-800 font-bold flex items-center gap-2 mb-2"><BrainCircuit size={16}/> Gemini Analysis ({getPeriodLabel()})</h4>
            <p className="text-slate-700 text-sm whitespace-pre-line">{aiReport}</p>
        </div>
      )}

      {/* Main Stats - Mixed (Period & Global) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Period Stats */}
        <StatCard title="Revenue" value={`₹${periodRevenue}`} icon={TrendingUp} color="blue" />
        <StatCard title="Net Profit" value={`₹${periodProfit}`} icon={DollarSign} color="green" />
        
        {/* Live Stats (Global) */}
        <div 
          onClick={() => setShowPendingDetails(true)} 
          className="cursor-pointer hover:scale-[1.02] transition-transform duration-200"
          title="Click to view details"
        >
          <StatCard title="Pending Queue" value={pendingCount} icon={Clock} color="orange" />
        </div>

        <StatCard title="Low Stock" value={lowStockCount} icon={AlertTriangle} color="red" />
      </div>

      {/* Collection Section - Period Based */}
      <div>
        <h3 className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-3">{getPeriodLabel()} Collection</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-emerald-50 rounded-xl shadow-sm p-6 border border-emerald-100 flex items-center justify-between">
            <div>
                <p className="text-emerald-600 text-sm font-bold uppercase tracking-wider mb-1">Cash Collected</p>
                <h3 className="text-3xl font-bold text-slate-800">₹{cashCollected}</h3>
            </div>
            <div className="p-4 bg-white rounded-full text-emerald-600 shadow-sm">
                <Wallet size={32} />
            </div>
          </div>
          <div className="bg-indigo-50 rounded-xl shadow-sm p-6 border border-indigo-100 flex items-center justify-between">
            <div>
                <p className="text-indigo-600 text-sm font-bold uppercase tracking-wider mb-1">Online / UPI</p>
                <h3 className="text-3xl font-bold text-slate-800">₹{onlineCollected}</h3>
            </div>
            <div className="p-4 bg-white rounded-full text-indigo-600 shadow-sm">
                <CreditCard size={32} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-800 mb-6">Weekly Sales Trend</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(val) => `₹${val}`} />
                <ReTooltip 
                  cursor={{fill: '#f1f5f9'}} 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                  formatter={(value: number) => [`₹${value}`, 'Sales']}
                />
                <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="lg:col-span-1">
            <StockWidget stock={stock} />
        </div>
      </div>

      <div className="space-y-4">
         <h3 className="text-lg font-bold text-slate-800">Activity Log</h3>
         {/* Show filtered orders in the table */}
         <OrdersTable orders={filteredOrders} onStatusUpdate={onUpdateOrderStatus} />
      </div>

      {/* Pending Orders Detail Modal */}
      {showPendingDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowPendingDetails(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
               <div>
                 <h2 className="text-xl font-bold text-slate-800">Pending Orders Analysis</h2>
                 <p className="text-sm text-slate-500">Breakdown of current queue orders.</p>
               </div>
               <button onClick={() => setShowPendingDetails(false)} className="p-2 bg-white rounded-full text-slate-500 hover:bg-slate-200 shadow-sm border border-slate-100">
                 <X size={20} />
               </button>
            </div>
            
            <div className="overflow-y-auto p-6 space-y-8">
              {/* Summary Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                  <p className="text-xs font-bold text-orange-600 uppercase mb-1">Pending Revenue</p>
                  <p className="text-2xl font-bold text-slate-800">₹{pendingRevenue}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                   <p className="text-xs font-bold text-green-600 uppercase mb-1">Expected Profit</p>
                   <p className="text-2xl font-bold text-slate-800">₹{pendingProfit}</p>
                </div>
              </div>

              {/* List */}
              <div>
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                   <Clock size={18} className="text-slate-400" />
                   Current Pending Queue ({pendingCount})
                </h3>
                {pendingCount === 0 ? (
                  <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
                    No pending orders at the moment. Good job!
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-500 font-medium">
                        <tr>
                          <th className="px-4 py-3">Order ID</th>
                          <th className="px-4 py-3">Customer</th>
                          <th className="px-4 py-3">Total</th>
                          <th className="px-4 py-3">Payment</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {pendingOrdersList.map(order => (
                          <tr key={order.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-medium">{order.id}</td>
                            <td className="px-4 py-3">
                              <div className="font-medium text-slate-800">{order.customerName}</div>
                              <div className="text-xs text-slate-500">{order.customerPhone}</div>
                            </td>
                            <td className="px-4 py-3 font-bold text-slate-700">₹{order.total}</td>
                            <td className="px-4 py-3">
                                <span className={`text-xs px-2 py-1 rounded border ${
                                  order.paymentMethod === 'Cash' 
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                  : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                                }`}>
                                  {order.paymentMethod}
                                </span>
                            </td>
                            <td className="px-4 py-3">
                               <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                                ${order.status === OrderStatus.RECEIVED ? 'bg-yellow-100 text-yellow-800' : ''}
                                ${order.status === OrderStatus.PRINTING ? 'bg-blue-100 text-blue-800' : ''}
                                ${order.status === OrderStatus.DELIVERED ? 'bg-green-100 text-green-800' : ''}
                                ${order.status === OrderStatus.CANCELLED ? 'bg-red-100 text-red-800' : ''}
                              `}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <select 
                                value={order.status}
                                onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                                className="bg-white border border-slate-200 text-slate-700 text-xs rounded p-1"
                              >
                                {Object.values(OrderStatus).map(s => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};