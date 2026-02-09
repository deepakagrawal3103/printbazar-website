
import React, { useState, useRef, useEffect } from 'react';
import { Product, CartItem, Order, OrderStatus, CurrentUser } from '../types';
import { 
  ShoppingCart, Plus, Minus, Search, Star, Heart, Share2, 
  MapPin, ChevronRight, Truck, ShieldCheck, Zap, ArrowLeft, 
  Filter, X, CheckCircle, FileText, Upload, Printer, BookOpen, Layers
} from 'lucide-react';

interface UserPageProps {
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, delta: number) => void;
  placeOrder: (details: { name: string, phone: string, urgent: boolean }) => Promise<void>;
  activeTab: string;
  onNavigate: (tab: string) => void;
  onAddCustomItem?: (item: CartItem) => void;
  currentUser: CurrentUser;
}

export const UserPage: React.FC<UserPageProps> = ({ 
  products, cart, orders, addToCart, removeFromCart, updateCartQuantity, placeOrder, activeTab, onNavigate, onAddCustomItem, currentUser
}) => {
  // --- State ---
  const [viewState, setViewState] = useState<'grid' | 'detail' | 'custom-print'>('grid');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Cart Popup State
  const [addedItem, setAddedItem] = useState<Product | CartItem | null>(null);
  
  // Custom Print State
  const [fileData, setFileData] = useState<{name: string, url: string, size: string} | null>(null);
  const [isCounting, setIsCounting] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [printConfig, setPrintConfig] = useState<{
    printType: 'BW' | 'Color',
    sideType: 'Single' | 'Double',
    binding: 'None' | 'Spiral' | 'Hard' | 'Wire'
  }>({ printType: 'BW', sideType: 'Double', binding: 'Spiral' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Checkout State
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'address' | 'payment' | 'success'>('cart');
  const [customerDetails, setCustomerDetails] = useState({ 
      name: currentUser.name, 
      phone: currentUser.phone || '', 
      urgent: false, 
      address: '' 
  });

  // Sync user details if they change (e.g. login)
  useEffect(() => {
    setCustomerDetails(prev => ({
        ...prev,
        name: currentUser.name,
        phone: currentUser.phone || prev.phone
    }));
  }, [currentUser]);

  // Derived Data
  const displayCategories = ['All', 'Practical Files', 'Spiral Copies', 'Stationery'];
  
  const filteredProducts = products.filter(p => 
    (selectedCategory === 'All' || p.category === selectedCategory) &&
    p.category !== 'Custom Print' && // Hide base custom print item from grid
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Cart Calculations
  const cartTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const deliveryCharge = 0; 
  const urgentFee = customerDetails.urgent ? 50 : 0;
  const finalTotal = cartTotal + deliveryCharge + urgentFee;

  // --- Handlers ---

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setViewState('detail');
    window.scrollTo(0,0);
  };

  const handleBackToGrid = () => {
    setViewState('grid');
    setSelectedProduct(null);
    setFileData(null);
    setPageCount(0);
  };

  // Centralized Add Logic to trigger Popup
  const handleAddToCartWrapper = (product: Product | CartItem) => {
    addToCart(product); // Updates Global State in App.tsx
    setAddedItem(product); // Triggers Local Popup
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCounting(true);
      const url = URL.createObjectURL(file);
      const size = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
      
      setFileData({ name: file.name, url, size });

      // Simulate PDF parsing delay
      setTimeout(() => {
        const randomPages = Math.floor(Math.random() * 95) + 5;
        setPageCount(randomPages);
        setIsCounting(false);
      }, 1500);
    }
  };

  const calculateCustomPrice = () => {
    let rate = printConfig.printType === 'BW' ? 2 : 10; 
    
    let bindingCost = 0;
    if (printConfig.binding === 'Spiral') bindingCost = 40;
    if (printConfig.binding === 'Wire') bindingCost = 60;
    if (printConfig.binding === 'Hard') bindingCost = 200;

    return (pageCount * rate) + bindingCost;
  };

  const handleAddCustomToCart = () => {
    if (!fileData || pageCount === 0) return;

    const baseProduct = products.find(p => p.category === 'Custom Print') || products[0];
    const price = calculateCustomPrice();

    const customItem: CartItem = {
      ...baseProduct,
      id: `custom-${Date.now()}`,
      name: `Print: ${fileData.name}`,
      price: price,
      quantity: 1,
      totalPrice: price,
      image: 'https://images.unsplash.com/photo-1562564055-71e051d33c19?auto=format&fit=crop&w=400&q=80',
      fileDetails: {
        fileName: fileData.name,
        fileUrl: fileData.url,
        pageCount: pageCount,
        printType: printConfig.printType,
        sideType: printConfig.sideType,
        binding: printConfig.binding
      }
    };

    // Trigger Popup
    handleAddToCartWrapper(customItem);
    
    // Reset Form (stay on page so popup is visible in context)
    setFileData(null);
    setPageCount(0);
  };

  const handleQuantityDec = (productId: string, currentQty: number) => {
    if (currentQty <= 1) {
      removeFromCart(productId);
    } else {
      updateCartQuantity(productId, -1);
    }
  };

  const handlePlaceOrder = async () => {
    if (!customerDetails.name || !customerDetails.phone) return;
    await placeOrder(customerDetails);
    setCheckoutStep('success');
  };

  const resetFlow = () => {
    setCheckoutStep('cart');
    // Keep user details populated
    setCustomerDetails(prev => ({ ...prev, urgent: false, address: '' }));
    onNavigate('home');
    setViewState('grid');
  };

  // --- Sub-Components ---

  const ServiceCard = ({ title, icon: Icon, desc, color, onClick }: any) => (
    <div 
      onClick={onClick}
      className={`bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition cursor-pointer flex flex-col items-center text-center group h-full`}
    >
      <div className={`p-4 rounded-full ${color} mb-3 group-hover:scale-110 transition-transform`}>
        <Icon size={32} className="text-slate-800" />
      </div>
      <h3 className="font-bold text-slate-800 text-lg mb-1">{title}</h3>
      <p className="text-sm text-slate-500">{desc}</p>
    </div>
  );

  // --- Added to Cart Popup (Amazon Style) ---
  const AddedToCartPopup = () => {
    if (!addedItem) return null;
    
    // We calculate count based on global cart, as the item is already added
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
             {/* Backdrop */}
             <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setAddedItem(null)} />
             
             {/* Modal */}
             <div className="bg-white rounded-lg shadow-2xl w-full max-w-[90%] md:max-w-md relative z-10 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-slate-50 p-4 flex items-start justify-between border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-500 text-white rounded-full p-1">
                            <CheckCircle size={20} />
                        </div>
                        <div>
                             <h3 className="font-bold text-slate-900 text-lg">Added to Cart</h3>
                        </div>
                    </div>
                    <button onClick={() => setAddedItem(null)}><X className="text-slate-400 hover:text-slate-600" /></button>
                </div>
                
                {/* Body */}
                <div className="p-6">
                    <div className="flex gap-4 mb-6">
                         <div className="w-20 h-20 shrink-0 bg-white border border-slate-200 p-2 rounded-md flex items-center justify-center">
                             {addedItem.category === 'Custom Print' ? (
                                <FileText className="text-blue-500" size={32} />
                             ) : (
                                <img src={addedItem.image} className="w-full h-full object-contain" />
                             )}
                         </div>
                         <div>
                             <h4 className="font-medium text-slate-800 line-clamp-2">{addedItem.name}</h4>
                             <p className="font-bold text-xl text-slate-900 mt-1">₹{addedItem.price}</p>
                             {addedItem.category === 'Custom Print' && (
                               <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold mt-1 inline-block">Custom Order</span>
                             )}
                         </div>
                    </div>

                    <div className="text-center mb-6">
                        <span className="text-slate-600">Cart Subtotal ({itemCount} items): </span>
                        <span className="text-red-700 font-bold text-lg">₹{cartTotal}</span>
                    </div>

                    <div className="grid gap-3">
                        <button 
                            onClick={() => { setAddedItem(null); onNavigate('cart'); }}
                            className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 w-full py-3 rounded-full font-medium shadow-sm border border-transparent transition-colors"
                        >
                            Proceed to Checkout ({itemCount} items)
                        </button>
                        <button 
                            onClick={() => setAddedItem(null)}
                            className="bg-white hover:bg-slate-50 text-slate-800 w-full py-3 rounded-full font-medium border border-slate-300 shadow-sm transition-colors"
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
             </div>
        </div>
    );
  };

  // --- Views ---

  // 1. HOME / GRID
  if (activeTab === 'home' && viewState === 'grid') {
    return (
      <div className="bg-slate-50 min-h-screen pb-20">
        <AddedToCartPopup />
        {/* Banner/Hero */}
        <div className="bg-slate-900 text-white p-6 md:p-10 mb-6">
           <div className="max-w-7xl mx-auto">
             <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome to <span className="text-blue-400">Print Bazar</span></h1>
             <p className="text-slate-400 mb-8 max-w-xl">
               Hi <span className="text-white font-bold">{currentUser.name}</span>, order practical files, spiral binding, or upload your PDFs for instant printing.
             </p>
             
             {/* Service Selection Cards */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ServiceCard 
                  title="Practical Files" 
                  icon={BookOpen} 
                  desc="Ready-made files for B.Tech, BSc & more."
                  color="bg-blue-100"
                  onClick={() => { setSelectedCategory('Practical Files'); window.scrollTo({top: 600, behavior: 'smooth'}); }}
                />
                <ServiceCard 
                  title="Custom Printing" 
                  icon={Upload} 
                  desc="Upload PDF -> Auto Count -> Print."
                  color="bg-green-100"
                  onClick={() => setViewState('custom-print')}
                />
                <ServiceCard 
                  title="Spiral Copies" 
                  icon={Layers} 
                  desc="Notes binding & soft covers."
                  color="bg-yellow-100"
                  onClick={() => { setSelectedCategory('Spiral Copies'); window.scrollTo({top: 600, behavior: 'smooth'}); }}
                />
             </div>
           </div>
        </div>

        <div className="max-w-7xl mx-auto px-4">
           {/* Filters Row */}
           <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 sticky top-16 bg-slate-50 z-10 py-2">
             <div className="flex gap-2 overflow-x-auto w-full md:w-auto no-scrollbar">
                {displayCategories.map(cat => (
                   <button 
                     key={cat}
                     onClick={() => setSelectedCategory(cat)}
                     className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap border transition-colors ${
                       selectedCategory === cat ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                     }`}
                   >
                     {cat}
                   </button>
                ))}
             </div>
             
             <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
             </div>
           </div>

           {/* Product Grid */}
           <h2 className="text-lg font-bold text-slate-800 mb-4 px-1">{selectedCategory}</h2>
           
           {filteredProducts.length === 0 ? (
             <div className="text-center py-20 text-slate-400">
                <p>No products found in this category.</p>
             </div>
           ) : (
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                {filteredProducts.map(product => (
                  <div 
                    key={product.id}
                    onClick={() => handleProductClick(product)} 
                    className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-lg transition cursor-pointer flex flex-col"
                  >
                     <div className="aspect-[4/3] bg-slate-100 relative">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover mix-blend-multiply" />
                        {!product.inStock && (
                          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                            <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">Out of Stock</span>
                          </div>
                        )}
                     </div>
                     <div className="p-3 flex-1 flex flex-col">
                        <h3 className="font-bold text-slate-800 text-sm md:text-base line-clamp-2 mb-1">{product.name}</h3>
                        <p className="text-xs text-slate-500 mb-3">{product.category}</p>
                        
                        <div className="mt-auto flex items-center justify-between">
                           <span className="text-lg font-bold text-slate-900">₹{product.price}</span>
                           <button 
                             onClick={(e) => { e.stopPropagation(); handleAddToCartWrapper(product); }}
                             disabled={!product.inStock}
                             className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:bg-slate-300 shadow-sm shadow-blue-200 active:scale-95 transition-transform"
                           >
                              <Plus size={18} />
                           </button>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
           )}
        </div>
      </div>
    );
  }

  // 2. CUSTOM PRINT BUILDER
  if (activeTab === 'home' && viewState === 'custom-print') {
    return (
      <div className="bg-slate-50 min-h-screen pb-20">
         <AddedToCartPopup />
         <div className="bg-white sticky top-0 z-20 shadow-sm border-b border-slate-200">
           <div className="max-w-3xl mx-auto px-4 py-3 flex items-center">
             <button onClick={handleBackToGrid} className="mr-3 p-1 hover:bg-slate-100 rounded-full"><ArrowLeft size={20}/></button>
             <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Upload size={18} className="text-blue-600"/> Custom Print Order</h1>
           </div>
         </div>

         <div className="max-w-3xl mx-auto p-4 space-y-6 mt-4">
            {/* Step 1: Upload */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
               <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                 <span className="bg-slate-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                 Upload Document
               </h3>
               
               {!fileData ? (
                 <div 
                   onClick={() => fileInputRef.current?.click()}
                   className="border-2 border-dashed border-blue-200 bg-blue-50 rounded-xl p-8 text-center cursor-pointer hover:bg-blue-100 transition"
                 >
                    <input type="file" accept="application/pdf" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500 shadow-sm">
                       <FileText size={32} />
                    </div>
                    <p className="font-bold text-blue-900">Click to Upload PDF</p>
                    <p className="text-sm text-blue-400 mt-1">We will count the pages automatically</p>
                 </div>
               ) : (
                 <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center"><FileText size={20}/></div>
                       <div>
                          <p className="font-bold text-slate-800 text-sm truncate max-w-[200px]">{fileData.name}</p>
                          <p className="text-xs text-slate-500">{fileData.size}</p>
                       </div>
                    </div>
                    <button onClick={() => { setFileData(null); setPageCount(0); }} className="text-red-500 font-bold text-xs uppercase hover:bg-red-50 px-2 py-1 rounded">Remove</button>
                 </div>
               )}
            </div>

            {/* Step 2: Configuration */}
            {fileData && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4">
                 <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="bg-slate-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                    Print Settings
                 </h3>

                 {isCounting ? (
                    <div className="py-8 text-center">
                       <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
                       <p className="text-sm font-bold text-slate-500">Calculating pages...</p>
                    </div>
                 ) : (
                    <div className="space-y-6">
                       <div className="flex items-center gap-2 bg-green-50 text-green-800 p-3 rounded-lg border border-green-100 text-sm font-medium">
                          <CheckCircle size={16} />
                          <span>Detected <strong>{pageCount} Pages</strong> in your document.</span>
                       </div>

                       {/* Options Grid */}
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                             <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Color Mode</label>
                             <div className="flex bg-slate-100 p-1 rounded-lg">
                                <button 
                                  onClick={() => setPrintConfig({...printConfig, printType: 'BW'})}
                                  className={`flex-1 py-2 text-sm font-bold rounded-md transition ${printConfig.printType === 'BW' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}
                                >B/W (₹2/pg)</button>
                                <button 
                                  onClick={() => setPrintConfig({...printConfig, printType: 'Color'})}
                                  className={`flex-1 py-2 text-sm font-bold rounded-md transition ${printConfig.printType === 'Color' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}
                                >Color (₹10/pg)</button>
                             </div>
                          </div>
                          
                          <div>
                             <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Sides</label>
                             <div className="flex bg-slate-100 p-1 rounded-lg">
                                <button 
                                  onClick={() => setPrintConfig({...printConfig, sideType: 'Single'})}
                                  className={`flex-1 py-2 text-sm font-bold rounded-md transition ${printConfig.sideType === 'Single' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}
                                >Single Side</button>
                                <button 
                                  onClick={() => setPrintConfig({...printConfig, sideType: 'Double'})}
                                  className={`flex-1 py-2 text-sm font-bold rounded-md transition ${printConfig.sideType === 'Double' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}
                                >Back-to-Back</button>
                             </div>
                          </div>

                           <div className="md:col-span-2">
                             <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Binding</label>
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {['None', 'Spiral', 'Wire', 'Hard'].map((b) => (
                                   <button 
                                     key={b}
                                     onClick={() => setPrintConfig({...printConfig, binding: b as any})}
                                     className={`py-3 px-4 border rounded-xl text-sm font-medium text-left transition ${
                                       printConfig.binding === b 
                                         ? 'border-blue-600 bg-blue-50 text-blue-700' 
                                         : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                     }`}
                                   >
                                     <div className="font-bold">{b === 'Wire' ? 'Wire-O' : b} Binding</div>
                                     <div className="text-xs opacity-70">
                                       {b === 'None' ? '₹0' : b === 'Spiral' ? '+₹40' : b === 'Wire' ? '+₹60' : '+₹200'}
                                     </div>
                                   </button>
                                ))}
                             </div>
                          </div>
                       </div>
                    </div>
                 )}
              </div>
            )}
         </div>

         {/* Bottom Price Bar for Custom Print */}
         {fileData && !isCounting && (
           <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-lg z-30">
              <div className="max-w-3xl mx-auto flex items-center justify-between">
                 <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">Total Estimate</p>
                    <p className="text-2xl font-bold text-slate-900">₹{calculateCustomPrice()}</p>
                 </div>
                 <button 
                   onClick={handleAddCustomToCart}
                   className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 shadow-lg flex items-center gap-2"
                 >
                    <ShoppingCart size={18} /> Add Order
                 </button>
              </div>
           </div>
         )}
      </div>
    );
  }

  // 3. PRODUCT DETAILS (Standard Items)
  if (activeTab === 'home' && viewState === 'detail' && selectedProduct) {
    return (
      <div className="bg-white min-h-screen pb-20">
         <AddedToCartPopup />
         <div className="max-w-4xl mx-auto px-4 py-6">
            <button onClick={handleBackToGrid} className="mb-6 flex items-center text-slate-500 hover:text-blue-600 font-medium">
               <ArrowLeft size={18} className="mr-2"/> Back
            </button>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-slate-50 rounded-xl overflow-hidden border border-slate-100 aspect-square">
                  <img src={selectedProduct.image} className="w-full h-full object-contain mix-blend-multiply" />
               </div>
               
               <div className="space-y-6">
                  <div>
                    <span className="text-blue-600 font-bold text-xs uppercase tracking-wider">{selectedProduct.category}</span>
                    <h1 className="text-3xl font-bold text-slate-900 mt-1">{selectedProduct.name}</h1>
                  </div>
                  
                  <div className="flex items-center gap-3">
                     <span className="text-4xl font-bold text-slate-900">₹{selectedProduct.price}</span>
                     {selectedProduct.inStock ? (
                       <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">In Stock</span>
                     ) : (
                       <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded">Out of Stock</span>
                     )}
                  </div>

                  <p className="text-slate-600 leading-relaxed text-sm">
                    {selectedProduct.description}
                  </p>

                  <div className="pt-6 border-t border-slate-100">
                     {cart.find(i => i.id === selectedProduct.id) ? (
                        <div className="flex items-center gap-4">
                           <div className="flex items-center border border-slate-200 rounded-lg">
                              <button onClick={() => handleQuantityDec(selectedProduct.id, cart.find(i => i.id === selectedProduct.id)!.quantity)} className="p-3 hover:bg-slate-50"><Minus size={18}/></button>
                              <span className="w-10 text-center font-bold">{cart.find(i => i.id === selectedProduct.id)!.quantity}</span>
                              <button onClick={() => updateCartQuantity(selectedProduct.id, 1)} className="p-3 hover:bg-slate-50"><Plus size={18}/></button>
                           </div>
                           <button onClick={() => onNavigate('cart')} className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700">Go to Cart</button>
                        </div>
                     ) : (
                        <button 
                          onClick={() => handleAddToCartWrapper(selectedProduct)}
                          disabled={!selectedProduct.inStock}
                          className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 disabled:bg-slate-300 shadow-md shadow-blue-200"
                        >
                          Add to Cart
                        </button>
                     )}
                  </div>
               </div>
            </div>
         </div>
      </div>
    );
  }

  // 4. CART & CHECKOUT (Refined)
  if (activeTab === 'cart' || activeTab === 'checkout') {
     if (checkoutStep === 'success') {
       return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
             <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="text-green-600" size={48} />
             </div>
             <h2 className="text-2xl font-bold text-slate-800 mb-2">Order Placed!</h2>
             <p className="text-slate-500 mb-8">Order ID: #{Math.floor(Math.random()*10000)}<br/>We will contact you on <span className="font-bold text-slate-800">{customerDetails.phone}</span>.</p>
             <button onClick={resetFlow} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800">Done</button>
          </div>
        </div>
       );
    }

    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
         <h1 className="text-2xl font-bold text-slate-800 mb-6">Your Cart ({cart.length})</h1>
         
         {cart.length === 0 ? (
           <div className="text-center py-20 bg-white rounded-xl border border-slate-100">
             <p className="text-slate-400 mb-4">Your cart is empty</p>
             <button onClick={() => onNavigate('home')} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">Start Shopping</button>
           </div>
         ) : (
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                 {/* Cart Items */}
                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {cart.map(item => (
                       <div key={item.id} className="p-4 border-b border-slate-100 flex gap-4 last:border-0">
                          {/* Differentiate Custom vs Normal Image */}
                          <div className="w-20 h-20 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100 text-slate-300">
                             {item.category === 'Custom Print' ? <FileText size={32}/> : <img src={item.image} className="w-full h-full object-cover mix-blend-multiply" />}
                          </div>
                          <div className="flex-1">
                             <div className="flex justify-between items-start">
                                <div>
                                   <h4 className="font-bold text-slate-800">{item.name}</h4>
                                   {item.fileDetails && (
                                     <div className="text-xs text-slate-500 mt-1">
                                        {item.fileDetails.pageCount} Pages • {item.fileDetails.printType} • {item.fileDetails.binding}
                                     </div>
                                   )}
                                   {!item.fileDetails && <p className="text-xs text-slate-500">{item.category}</p>}
                                </div>
                                <p className="font-bold text-slate-900">₹{item.totalPrice}</p>
                             </div>
                             
                             <div className="flex justify-between items-center mt-3">
                                <div className="flex items-center gap-3">
                                   <button onClick={() => handleQuantityDec(item.id, item.quantity)} className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"><Minus size={14}/></button>
                                   <span className="text-sm font-bold">{item.quantity}</span>
                                   <button onClick={() => updateCartQuantity(item.id, 1)} className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"><Plus size={14}/></button>
                                </div>
                                <button onClick={() => removeFromCart(item.id)} className="text-xs text-red-500 font-bold hover:underline">Remove</button>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
                 
                 {/* Address Form (Simplified for Bazar) */}
                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><MapPin size={18}/> Delivery / Pickup Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                       <input 
                         placeholder="Your Name" 
                         className="border border-slate-200 rounded-lg p-2.5 outline-none focus:border-blue-500 bg-slate-50"
                         value={customerDetails.name}
                         onChange={e => setCustomerDetails({...customerDetails, name: e.target.value})}
                       />
                       <input 
                         placeholder="Mobile Number" 
                         type="tel"
                         className="border border-slate-200 rounded-lg p-2.5 outline-none focus:border-blue-500 bg-slate-50"
                         value={customerDetails.phone}
                         onChange={e => setCustomerDetails({...customerDetails, phone: e.target.value})}
                       />
                    </div>
                    <textarea 
                      placeholder="Address or Pickup Instructions (e.g. Coming to shop at 5 PM)"
                      className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:border-blue-500"
                      rows={2}
                      value={customerDetails.address}
                      onChange={e => setCustomerDetails({...customerDetails, address: e.target.value})}
                    />
                 </div>
              </div>

              {/* Summary */}
              <div className="md:col-span-1">
                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 sticky top-24">
                    <h3 className="font-bold text-slate-800 mb-4 text-lg">Bill Summary</h3>
                    <div className="space-y-2 text-sm text-slate-600 mb-4 border-b border-slate-100 pb-4">
                       <div className="flex justify-between"><span>Item Total</span><span>₹{cartTotal}</span></div>
                       <div className="flex justify-between"><span>Delivery</span><span className="text-green-600 font-bold">Free</span></div>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold text-slate-900 mb-6">
                       <span>To Pay</span>
                       <span>₹{finalTotal}</span>
                    </div>

                    <button 
                      onClick={handlePlaceOrder} 
                      disabled={!customerDetails.name || !customerDetails.phone}
                      className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 shadow-lg disabled:bg-slate-300"
                    >
                      Place Order
                    </button>
                    <p className="text-xs text-center text-slate-400 mt-3 flex items-center justify-center gap-1"><ShieldCheck size={12}/> Pay Cash or Online on Delivery</p>
                 </div>
              </div>
           </div>
         )}
      </div>
    );
  }

  // 5. MY ORDERS (Simple)
  if (activeTab === 'orders') {
    return (
       <div className="max-w-3xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-6">My Orders</h1>
          <div className="space-y-4">
             {orders.map(order => (
                <div key={order.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                   <div className="flex justify-between items-start border-b border-slate-100 pb-3 mb-3">
                      <div>
                         <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">#{order.id}</span>
                         <p className="text-xs text-slate-400 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                         {order.status}
                      </span>
                   </div>
                   <div className="space-y-2 mb-4">
                      {order.items.map((item, idx) => (
                         <div key={idx} className="flex justify-between text-sm">
                            <span className="text-slate-600">{item.quantity}x {item.name}</span>
                            <span className="font-bold">₹{item.totalPrice}</span>
                         </div>
                      ))}
                   </div>
                   <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                      <span className="text-sm font-bold text-slate-900">Total Bill: ₹{order.total}</span>
                   </div>
                </div>
             ))}
             {orders.length === 0 && <p className="text-center text-slate-400">No orders found.</p>}
          </div>
       </div>
    );
  }

  return null;
};
