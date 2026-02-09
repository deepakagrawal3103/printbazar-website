
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Filter, Plus, X, MessageCircle, Send, ShoppingCart, 
  Trash2, PackagePlus, Eye, Edit2, CreditCard, Tag, Mic, Check, Clock, Phone, CheckCircle, Calendar, Minus, FileText, Printer
} from 'lucide-react';
import { Order, OrderStatus, Product, CartItem } from '../../types';

interface OrdersPageProps {
  orders: Order[];
  products: Product[];
  onUpdateOrder: (id: string, updates: Partial<Order>) => void;
  onDeleteOrder: (id: string) => void;
  categories: string[];
  onAddCategory: (category: string) => void;
  onAddOrder?: (order: any) => void;
}

const DEFAULT_MSG_TEMPLATE = `Namaste from Print Bazar,
Your order #{{id}} is ready. ✅

Please confirm whether you will be coming tomorrow or not.

💰 Total Bill: ₹{{total}}

📍 Collection Address:
Bus route board jha bus routes likhe hote hai and driver bethte hai uske just pass pani ki tanki hai vha.

Thank you,
Print Bazar`;

interface TabButtonProps {
  id: string;
  label: string;
  count: number;
  isActive: boolean;
  onClick: (id: string) => void;
}

const TabButton: React.FC<TabButtonProps> = ({ 
  id, 
  label, 
  count, 
  isActive, 
  onClick 
}) => (
  <button
    onClick={() => onClick(id)}
    className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
      isActive 
        ? 'bg-slate-800 text-white shadow-md' 
        : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
    }`}
  >
    {label}
    <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-slate-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
      {count}
    </span>
  </button>
);

export const OrdersPage: React.FC<OrdersPageProps> = ({ orders, products, onUpdateOrder, onDeleteOrder, categories, onAddCategory, onAddOrder }) => {
  // --- State ---
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Completed Filter State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterDate, setFilterDate] = useState<'all' | 'today' | 'yesterday' | 'week' | 'month'>('all');

  // Modals
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // Order Operations State
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [orderForm, setOrderForm] = useState({
    customerName: '',
    customerPhone: '',
    urgent: false,
    status: OrderStatus.RECEIVED,
    paymentStatus: 'Pending' as 'Paid' | 'Pending' | 'Partial',
  });
  const [orderItems, setOrderItems] = useState<CartItem[]>([]);
  
  // Item Adding State
  const [selectedProductId, setSelectedProductId] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [customItemForm, setCustomItemForm] = useState({
    name: '', category: '', price: '', cost: '', quantity: '1'
  });

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState<Order | null>(null);
  const [paymentSelection, setPaymentSelection] = useState<'Paid' | 'Unpaid'>('Paid');
  const [paymentForm, setPaymentForm] = useState({ cash: '', online: '' });

  // Reset filter when tab changes
  useEffect(() => {
    if (activeTab !== 'completed') {
      setFilterDate('all');
      setIsFilterOpen(false);
    }
  }, [activeTab]);

  // --- Calculations & Filtering ---

  const counts = useMemo(() => {
    return {
      all: orders.length,
      pending: orders.filter(o => o.status !== OrderStatus.DELIVERED && o.status !== OrderStatus.CANCELLED).length,
      unpaid: orders.filter(o => o.paymentStatus !== 'Paid').length,
      completed: orders.filter(o => o.status === OrderStatus.DELIVERED).length
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    let result = orders;

    // 1. Tab Filtering
    if (activeTab === 'pending') {
      result = result.filter(o => o.status !== OrderStatus.DELIVERED && o.status !== OrderStatus.CANCELLED);
    } else if (activeTab === 'unpaid') {
      result = result.filter(o => o.paymentStatus !== 'Paid');
    } else if (activeTab === 'completed') {
      result = result.filter(o => o.status === OrderStatus.DELIVERED);
      
      // Apply Date Filter ONLY for Completed Tab
      if (filterDate !== 'all') {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        result = result.filter(order => {
          const orderDate = new Date(order.createdAt);
          switch (filterDate) {
            case 'today':
              return orderDate >= todayStart;
            case 'yesterday':
              const yesterdayStart = new Date(todayStart);
              yesterdayStart.setDate(todayStart.getDate() - 1);
              return orderDate >= yesterdayStart && orderDate < todayStart;
            case 'week':
              const lastWeek = new Date(todayStart);
              lastWeek.setDate(todayStart.getDate() - 6); 
              return orderDate >= lastWeek;
            case 'month':
              const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
              return orderDate >= thisMonth;
            default:
              return true;
          }
        });
      }

    } else if (activeTab !== 'all') {
      // Dynamic Category Filtering (Filter orders containing items of this category)
      result = result.filter(o => o.items.some(i => i.category === activeTab));
    }
    // 'all' returns everything

    // 2. Search Filtering
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(o => 
        o.customerName.toLowerCase().includes(lowerTerm) ||
        o.id.toLowerCase().includes(lowerTerm) ||
        o.customerPhone.includes(searchTerm)
      );
    }

    // 3. Sorting (Newest First)
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, activeTab, searchTerm, filterDate]);

  // Real-time totals for the modal
  const modalTotals = useMemo(() => {
    const subtotal = orderItems.reduce((acc, i) => acc + i.totalPrice, 0);
    const urgentFee = orderForm.urgent ? 50 : 0;
    const total = subtotal + urgentFee;
    const totalCost = orderItems.reduce((acc, i) => acc + (i.cost * i.quantity), 0);
    const profit = total - totalCost;
    return { subtotal, urgentFee, total, totalCost, profit };
  }, [orderItems, orderForm.urgent]);


  // --- Handlers ---

  const handleStatusQuickToggle = (order: Order) => {
    if (order.status === OrderStatus.RECEIVED) {
      onUpdateOrder(order.id, { status: OrderStatus.PRINTING });
    } else if (order.status === OrderStatus.PRINTING) {
      setPaymentOrder(order);
      setPaymentSelection('Paid');
      setPaymentForm({ cash: order.total.toString(), online: '0' });
      setIsPaymentModalOpen(true);
    }
  };

  const handlePaymentClick = (order: Order) => {
    setPaymentOrder(order);
    setPaymentSelection(order.paymentStatus === 'Paid' ? 'Paid' : 'Unpaid');
    if (order.paymentStatus === 'Paid') {
       setPaymentForm({ 
         cash: order.paymentSplit?.cash.toString() || (order.paymentMethod === 'Cash' ? order.total.toString() : '0'), 
         online: order.paymentSplit?.online.toString() || (order.paymentMethod === 'Online' || order.paymentMethod === 'UPI' ? order.total.toString() : '0') 
       });
    } else {
       setPaymentForm({ cash: order.total.toString(), online: '0' });
    }
    setIsPaymentModalOpen(true);
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
      onAddCategory(newCategoryName.trim());
      setNewCategoryName('');
      setIsAddCategoryModalOpen(false);
    }
  };

  const resetOrderForm = () => {
    setOrderForm({ customerName: '', customerPhone: '', urgent: false, status: OrderStatus.RECEIVED, paymentStatus: 'Pending' });
    setOrderItems([]);
    setIsEditMode(false);
    setIsViewMode(false);
    setEditingOrderId(null);
    setCustomItemForm({ name: '', category: '', price: '', cost: '', quantity: '1' });
    setItemQuantity(1);
    setSelectedProductId('');
  };

  const openNewOrderModal = () => {
    resetOrderForm();
    setIsOrderModalOpen(true);
  };

  const openEditOrderModal = (order: Order) => {
    setOrderForm({
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        urgent: order.urgentFee > 0,
        status: order.status,
        paymentStatus: order.paymentStatus
    });
    setOrderItems([...order.items]);
    setEditingOrderId(order.id);
    setIsEditMode(true);
    setIsViewMode(false);
    setIsOrderModalOpen(true);
  };

  const openViewOrderModal = (order: Order) => {
    setOrderForm({
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        urgent: order.urgentFee > 0,
        status: order.status,
        paymentStatus: order.paymentStatus
    });
    setOrderItems([...order.items]);
    setEditingOrderId(order.id);
    setIsViewMode(true);
    setIsEditMode(false);
    setIsOrderModalOpen(true);
  };

  const handleSubmitOrder = () => {
     if (!orderForm.customerName || orderItems.length === 0) return;
     const { subtotal, urgentFee, total, totalCost, profit } = modalTotals;

     if ((isEditMode || isViewMode) && editingOrderId) {
        onUpdateOrder(editingOrderId, {
            customerName: orderForm.customerName,
            customerPhone: orderForm.customerPhone,
            items: orderItems,
            urgentFee,
            subtotal,
            total,
            profit,
            costTotal: totalCost,
            status: orderForm.status,
            paymentStatus: orderForm.paymentStatus
        });
     } else if (onAddOrder) {
        onAddOrder({ ...orderForm, items: orderItems });
     }
     setIsOrderModalOpen(false);
     resetOrderForm();
  };

  const confirmPaymentUpdate = () => {
    if (!paymentOrder) return;
    if (paymentSelection === 'Unpaid') {
      onUpdateOrder(paymentOrder.id, { 
        paymentStatus: 'Pending', 
        status: paymentOrder.status === OrderStatus.DELIVERED ? OrderStatus.DELIVERED : paymentOrder.status 
      });
    } else {
       const cash = parseFloat(paymentForm.cash) || 0;
       const online = parseFloat(paymentForm.online) || 0;
       let method: 'Cash' | 'Online' | 'Split' = 'Cash';
       if (online > 0 && cash > 0) method = 'Split';
       else if (online > 0) method = 'Online';
       
       onUpdateOrder(paymentOrder.id, {
         status: OrderStatus.DELIVERED,
         paymentStatus: 'Paid',
         paymentMethod: method,
         paymentSplit: { cash, online }
       });
    }
    setIsPaymentModalOpen(false);
    setPaymentOrder(null);
  };

  const handleAddCatalogItem = () => {
     const product = products.find(p => p.id === selectedProductId);
     if (product && itemQuantity > 0) {
       setOrderItems(prev => {
          const existing = prev.find(i => i.id === product.id);
          if (existing) {
              return prev.map(i => i.id === product.id 
                  ? { ...i, quantity: i.quantity + itemQuantity, totalPrice: (i.quantity + itemQuantity) * i.price } 
                  : i
              );
          }
          return [...prev, { ...product, quantity: itemQuantity, totalPrice: product.price * itemQuantity }];
       });
       setSelectedProductId('');
       setItemQuantity(1);
     }
  };

  const handleAddCustomItem = () => {
     const { name, price, cost, quantity } = customItemForm;
     const qty = parseInt(quantity) || 1;
     const priceVal = parseFloat(price) || 0;
     const costVal = parseFloat(cost) || 0;

     if(name && qty > 0) {
       setOrderItems(prev => [...prev, { 
          id: `custom-${Date.now()}`, 
          name, 
          category: customItemForm.category || 'Custom', 
          description: '', 
          price: priceVal, 
          cost: costVal, 
          quantity: qty, 
          inStock: true, 
          image: 'https://placehold.co/50?text=Custom', 
          totalPrice: priceVal * qty 
       }]);
       setCustomItemForm({ name: '', category: '', price: '', cost: '', quantity: '1' });
     }
  };

  const handleUpdateItemQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setOrderItems(prev => prev.map(item => 
        item.id === id 
            ? { ...item, quantity: newQuantity, totalPrice: item.price * newQuantity } 
            : item
    ));
  };

  const handleRemoveItem = (id: string) => setOrderItems(prev => prev.filter(i => i.id !== id));

  const getWhatsAppLink = (order: Order) => {
    const message = DEFAULT_MSG_TEMPLATE
      .replace('{{total}}', order.total.toString())
      .replace('{{id}}', order.id.slice(-5));
    return `https://wa.me/91${order.customerPhone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="min-h-screen pb-20">
      
      {/* Sticky Header Section */}
      <div className="sticky top-0 bg-gray-50/95 backdrop-blur-sm z-10 space-y-4 pb-2 pt-2">
         {/* Search & Actions Bar */}
         <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-sm" 
              />
            </div>
            
            {activeTab === 'completed' && (
              <div className="relative">
                <button 
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`p-3 rounded-xl border transition-colors shadow-sm ${
                    filterDate !== 'all' || isFilterOpen
                      ? 'bg-blue-50 border-blue-200 text-blue-600' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Filter size={20} />
                </button>
                {/* Filter Dropdown */}
                {isFilterOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-20 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Date Range</div>
                    {[
                      { id: 'all', label: 'All Time' },
                      { id: 'today', label: 'Today' },
                      { id: 'yesterday', label: 'Yesterday' },
                      { id: 'week', label: 'This Week' },
                      { id: 'month', label: 'This Month' },
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => { setFilterDate(opt.id as any); setIsFilterOpen(false); }}
                        className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-slate-50 flex items-center justify-between ${
                          filterDate === opt.id ? 'text-blue-600' : 'text-slate-700'
                        }`}
                      >
                        {opt.label}
                        {filterDate === opt.id && <Check size={14} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button 
              onClick={openNewOrderModal}
              className="bg-blue-500 hover:bg-blue-600 text-white px-5 rounded-xl font-bold shadow-sm shadow-blue-200 flex items-center gap-2 transition-colors whitespace-nowrap"
            >
               <Plus size={20} />
               <span className="hidden sm:inline">New</span>
            </button>
         </div>

         {/* Pills / Tabs */}
         <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 items-center">
            <TabButton id="all" label="All" count={counts.all} isActive={activeTab === 'all'} onClick={setActiveTab} />
            <TabButton id="pending" label="Pending" count={counts.pending} isActive={activeTab === 'pending'} onClick={setActiveTab} />
            <TabButton id="unpaid" label="Unpaid" count={counts.unpaid} isActive={activeTab === 'unpaid'} onClick={setActiveTab} />
            <TabButton id="completed" label="Completed" count={counts.completed} isActive={activeTab === 'completed'} onClick={setActiveTab} />
            
            <div className="w-px h-6 bg-slate-300 mx-1 flex-shrink-0" />
            
            {/* Dynamic Tabs */}
            {categories.map(cat => (
              <TabButton 
                key={cat} 
                id={cat} 
                label={cat} 
                count={orders.filter(o => o.items.some(i => i.category === cat)).length} 
                isActive={activeTab === cat}
                onClick={setActiveTab}
              />
            ))}
         </div>
      </div>

      {/* Orders List (Cards) */}
      <div className="space-y-4 mt-2">
        {filteredOrders.map((order) => {
           const timeStr = new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
           const hasCustomPrint = order.items.some(i => i.fileDetails);
           const itemSummary = order.items.length > 0 
              ? `${order.items[0].quantity}x ${order.items[0].name}${order.items.length > 1 ? ` +${order.items.length - 1} more` : ''}`
              : 'No Items';
           const isCompleted = order.status === OrderStatus.DELIVERED;
           
           return (
            <div key={order.id} className={`bg-white rounded-2xl p-5 shadow-sm border ${hasCustomPrint ? 'border-blue-100 ring-1 ring-blue-50' : 'border-slate-100'} flex flex-col gap-3 transition-all hover:shadow-md`}>
              {/* Header Row: ID, Status, Amount */}
              <div className="flex justify-between items-start">
                 <div className="flex gap-2 items-center flex-wrap">
                    <span className="text-xs font-mono font-medium text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">#{order.id.slice(-5)}</span>
                    
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${
                       isCompleted ? 'bg-green-100 text-green-700' : 
                       order.status === OrderStatus.CANCELLED ? 'bg-red-100 text-red-700' :
                       'bg-blue-50 text-blue-600'
                    }`}>
                       {isCompleted ? 'COMPLETED' : order.status}
                    </span>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide border ${
                        order.paymentStatus === 'Paid' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                        : 'bg-orange-50 text-orange-700 border-orange-100'
                    }`}>
                        {order.paymentStatus}
                    </span>
                 </div>
                 <div className="text-right">
                    <div className="text-xl font-bold text-slate-800">₹{order.total}</div>
                    <div className="text-[10px] text-slate-400 font-medium">{timeStr}</div>
                 </div>
              </div>

              {/* Customer Row */}
              <div className="flex justify-between items-center">
                 <div>
                   <h3 className="text-lg font-bold text-slate-800 leading-tight">{order.customerName}</h3>
                   <p className="text-xs text-slate-400 font-medium mt-0.5">{order.customerPhone}</p>
                 </div>
                 {hasCustomPrint && <div className="text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><FileText size={12}/> PDF</div>}
              </div>

              {/* Items Summary */}
              <div className="bg-slate-50 rounded-lg px-3 py-2 text-sm text-slate-600 font-medium border border-slate-50 truncate">
                 {itemSummary}
              </div>

              {/* Actions Row */}
              <div className="flex justify-between items-center pt-3 mt-1 border-t border-slate-50 text-slate-400">
                 {/* Left: Communication */}
                 <div className="flex gap-1">
                    <a href={`tel:${order.customerPhone}`} className="p-2 hover:bg-green-50 hover:text-green-600 rounded-full transition-colors" title="Call Customer">
                        <Phone size={18} />
                    </a>
                    <a 
                        href={getWhatsAppLink(order)}
                        target="_blank" 
                        rel="noreferrer"
                        className="p-2 hover:bg-green-50 hover:text-green-600 rounded-full transition-colors"
                        title="WhatsApp"
                    >
                        <MessageCircle size={18} />
                    </a>
                 </div>

                 {/* Right: Management */}
                 <div className="flex gap-1">
                     <button onClick={() => openViewOrderModal(order)} className="p-2 hover:bg-slate-50 hover:text-blue-600 rounded-full transition-colors" title="View"><Eye size={18} /></button>
                     
                     {!isCompleted && (
                       <button 
                          onClick={() => handlePaymentClick(order)} 
                          className="p-2 bg-slate-50 text-green-600 hover:bg-green-100 rounded-full transition-colors shadow-sm border border-slate-100" 
                          title="Mark Complete & Pay"
                       >
                          <CheckCircle size={18} />
                       </button>
                     )}

                     <button onClick={() => openEditOrderModal(order)} className="p-2 hover:bg-slate-50 hover:text-slate-800 rounded-full transition-colors" title="Edit"><Edit2 size={18} /></button>
                     <button onClick={() => onDeleteOrder(order.id)} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors" title="Delete"><Trash2 size={18} /></button>
                 </div>
              </div>
            </div>
           );
        })}
      </div>

      {/* New/Edit/View Order Modal */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsOrderModalOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-blue-50 rounded-t-xl">
               <h3 className="text-xl font-bold text-slate-800">
                   {isViewMode ? 'Order Details' : isEditMode ? 'Edit Order' : 'Create New Order'}
                   {editingOrderId && <span className="ml-2 text-sm font-mono text-slate-400">#{editingOrderId.slice(-5)}</span>}
               </h3>
               <button onClick={() => setIsOrderModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Name</label>
                     <input type="text" disabled={isViewMode} value={orderForm.customerName} onChange={(e) => setOrderForm({...orderForm, customerName: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50" />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone</label>
                     <input type="tel" disabled={isViewMode} value={orderForm.customerPhone} onChange={(e) => setOrderForm({...orderForm, customerPhone: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50" />
                   </div>
                </div>

                {!isViewMode && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                       {/* Catalog Add Row */}
                       <div className="flex gap-2">
                           <select 
                             value={selectedProductId} 
                             onChange={(e) => setSelectedProductId(e.target.value)} 
                             className="flex-[2] border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-blue-500"
                           >
                             <option value="">Select Catalog Item...</option>
                             {products.map(p => <option key={p.id} value={p.id}>{p.name} - ₹{p.price}</option>)}
                           </select>
                           <input 
                              type="number" 
                              min="1" 
                              value={itemQuantity} 
                              onChange={(e) => setItemQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                              className="w-20 border border-slate-200 rounded-lg p-2 text-sm text-center font-bold outline-none focus:border-blue-500"
                              placeholder="Qty"
                           />
                           <button onClick={handleAddCatalogItem} disabled={!selectedProductId} className="bg-slate-800 hover:bg-slate-900 text-white px-5 rounded-lg font-bold text-sm transition-colors">Add</button>
                       </div>
                       
                       <div className="flex items-center gap-4 my-2">
                          <div className="h-px bg-slate-200 flex-1"></div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">OR Custom Item</span>
                          <div className="h-px bg-slate-200 flex-1"></div>
                       </div>

                       {/* Custom Add Row */}
                       <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                           <input placeholder="Item Name" value={customItemForm.name} onChange={e => setCustomItemForm({...customItemForm, name: e.target.value})} className="flex-[2] border border-slate-200 rounded-lg p-2 text-sm min-w-[120px]" />
                           <input placeholder="Qty" type="number" value={customItemForm.quantity} onChange={e => setCustomItemForm({...customItemForm, quantity: e.target.value})} className="w-16 border border-slate-200 rounded-lg p-2 text-sm" />
                           <input placeholder="Cost" type="number" value={customItemForm.cost} onChange={e => setCustomItemForm({...customItemForm, cost: e.target.value})} className="w-20 border border-slate-200 rounded-lg p-2 text-sm" />
                           <input placeholder="Price" type="number" value={customItemForm.price} onChange={e => setCustomItemForm({...customItemForm, price: e.target.value})} className="w-20 border border-slate-200 rounded-lg p-2 text-sm" />
                           <button onClick={handleAddCustomItem} className="bg-blue-600 hover:bg-blue-700 text-white px-5 rounded-lg font-bold text-sm transition-colors">Add</button>
                       </div>
                    </div>
                )}

                <div className="space-y-3">
                    {orderItems.map(item => (
                        <div key={item.id} className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm text-sm">
                           <div className="flex justify-between items-start mb-2">
                              <div className="flex items-start gap-3">
                                  {item.fileDetails ? (
                                    <div className="w-10 h-10 bg-red-100 text-red-600 rounded flex items-center justify-center shrink-0">
                                      <FileText size={20} />
                                    </div>
                                  ) : (
                                    <span className="font-bold text-slate-800 pt-1">{item.quantity}x</span>
                                  )}
                                  
                                  <div className="flex flex-col">
                                      <span className="font-medium text-slate-800">{item.name}</span>
                                      
                                      {/* Custom Print Details Section */}
                                      {item.fileDetails ? (
                                        <div className="text-xs text-slate-500 mt-1 space-y-1">
                                           <p className="flex items-center gap-1"><Printer size={10}/> {item.fileDetails.pageCount} Pages • {item.fileDetails.printType} • {item.fileDetails.sideType}</p>
                                           <p className="font-medium text-blue-600">{item.fileDetails.binding} Binding</p>
                                           <a href={item.fileDetails.fileUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline flex items-center gap-1 mt-1 font-bold">
                                             Download PDF
                                           </a>
                                        </div>
                                      ) : (
                                        <span className="text-[10px] text-slate-400">₹{item.price}/unit</span>
                                      )}
                                  </div>
                              </div>

                              <div className="flex flex-col items-end gap-2">
                                  <span className="font-bold text-slate-900">₹{item.totalPrice}</span>
                                  {!isViewMode && <button onClick={() => handleRemoveItem(item.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={16}/></button>}
                              </div>
                           </div>
                           
                           {!isViewMode && !item.fileDetails && (
                              <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 w-fit">
                                  <button onClick={() => handleUpdateItemQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} className="px-2 py-1 hover:bg-slate-200 rounded-l-lg"><Minus size={12} /></button>
                                  <span className="w-8 text-center font-bold text-slate-800 text-xs">{item.quantity}</span>
                                  <button onClick={() => handleUpdateItemQuantity(item.id, item.quantity + 1)} className="px-2 py-1 hover:bg-slate-200 rounded-r-lg"><Plus size={12} /></button>
                              </div>
                           )}
                        </div>
                    ))}
                </div>
                
                {/* Total Section */}
                <div className="pt-4 border-t border-slate-100 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Subtotal:</span>
                        <span className="font-medium">₹{modalTotals.subtotal}</span>
                    </div>
                    {orderForm.urgent && (
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Urgent Fee:</span>
                            <span className="font-medium">₹{modalTotals.urgentFee}</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center pt-2">
                        <span className="text-lg font-bold text-slate-800">Total:</span>
                        <span className="text-2xl font-bold text-slate-800">₹{modalTotals.total}</span>
                    </div>
                </div>
             </div>

             <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
                <button onClick={() => setIsOrderModalOpen(false)} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-lg">Close</button>
                {!isViewMode && (
                    <button onClick={handleSubmitOrder} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Save</button>
                )}
             </div>
          </div>
        </div>
      )}

      {/* Payment/Status Modal */}
      {isPaymentModalOpen && paymentOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsPaymentModalOpen(false)} />
              <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm animate-in fade-in zoom-in-95">
                  <div className="p-5 border-b border-slate-100 bg-green-50 rounded-t-xl">
                      <h3 className="text-lg font-bold text-green-900 flex items-center gap-2"><Check size={20}/> Payment & Completion</h3>
                  </div>
                  <div className="p-6 space-y-4">
                      <div className="text-center">
                          <p className="text-3xl font-extrabold text-slate-800">₹{paymentOrder.total}</p>
                      </div>
                      <div className="flex bg-slate-100 p-1 rounded-lg">
                          <button onClick={() => setPaymentSelection('Paid')} className={`flex-1 py-2 text-sm font-bold rounded-md transition ${paymentSelection === 'Paid' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500'}`}>Paid</button>
                          <button onClick={() => setPaymentSelection('Unpaid')} className={`flex-1 py-2 text-sm font-bold rounded-md transition ${paymentSelection === 'Unpaid' ? 'bg-white text-red-500 shadow-sm' : 'text-slate-500'}`}>Unpaid</button>
                      </div>
                      {paymentSelection === 'Paid' && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-3"><span className="text-sm font-bold w-12 text-slate-600">CASH</span><input type="number" value={paymentForm.cash} onChange={(e) => { const v = parseFloat(e.target.value)||0; setPaymentForm({ cash: e.target.value, online: (Math.max(0, paymentOrder.total - v)).toString() }) }} className="flex-1 border border-slate-200 rounded-lg p-2 font-bold text-right" /></div>
                            <div className="flex items-center gap-3"><span className="text-sm font-bold w-12 text-slate-600">UPI</span><input type="number" value={paymentForm.online} onChange={(e) => setPaymentForm({...paymentForm, online: e.target.value})} className="flex-1 border border-slate-200 rounded-lg p-2 font-bold text-right" /></div>
                        </div>
                      )}
                  </div>
                  <div className="p-4 border-t border-slate-100 flex gap-3">
                      <button onClick={() => setIsPaymentModalOpen(false)} className="flex-1 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg">Cancel</button>
                      <button onClick={confirmPaymentUpdate} className="flex-1 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700">Confirm</button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};
