import React from 'react';
import { Plus, Edit2, Trash2, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';
import { Product } from '../../types';

interface ProductsPageProps {
  products: Product[];
  onToggleStock: (id: string) => void;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({ products, onToggleStock }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Product Stock & Management</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center space-x-2">
          <Plus size={18} />
          <span>Add Product</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map(product => {
          const profit = product.price - product.cost;
          const totalValue = product.quantity * product.cost; // Asset value
          
          return (
            <div key={product.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-200">
              {/* Product Header */}
              <div className="p-4 border-b border-slate-50">
                <div className="flex justify-between items-start mb-1">
                   <div>
                      <h4 className="font-bold text-slate-800 line-clamp-1" title={product.name}>{product.name}</h4>
                      <span className="text-[10px] uppercase font-bold text-slate-400">{product.category}</span>
                   </div>
                   <button className="text-slate-400 hover:text-blue-600">
                      <Edit2 size={16} />
                   </button>
                </div>
              </div>

              {/* Stock Details */}
              <div className="p-4 bg-slate-50/50 flex-1 space-y-3">
                 {/* Qty & Status */}
                 <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100">
                    <div>
                       <span className="text-xs text-slate-500 font-medium uppercase">Quantity</span>
                       <div className={`text-xl font-bold font-mono ${product.quantity === 0 ? 'text-red-500' : 'text-slate-800'}`}>
                         {product.quantity}
                       </div>
                    </div>
                    {product.quantity === 0 ? (
                       <div className="flex flex-col items-end text-red-500">
                         <AlertTriangle size={16} />
                         <span className="text-[10px] font-bold">Low Stock</span>
                       </div>
                    ) : (
                       <div className="flex flex-col items-end text-green-500">
                         <span className="text-[10px] font-bold bg-green-100 px-2 py-0.5 rounded-full">In Stock</span>
                       </div>
                    )}
                 </div>

                 {/* Price Stats */}
                 <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-white p-2 rounded border border-slate-100">
                       <p className="text-[10px] text-slate-400 uppercase">Price (Cost/Sell)</p>
                       <p className="font-medium text-slate-700">₹{product.cost} / ₹{product.price}</p>
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-100">
                       <p className="text-[10px] text-slate-400 uppercase">Profit / Unit</p>
                       <p className="font-bold text-green-600">+₹{profit}</p>
                    </div>
                 </div>
                 
                 {/* Asset Value */}
                 <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-100">
                    <span className="text-slate-500">Total Asset Value:</span>
                    <span className="font-bold text-slate-700">₹{totalValue}</span>
                 </div>
              </div>

              {/* Actions */}
              <div className="p-3 border-t border-slate-100 flex gap-2">
                 <button 
                  onClick={() => onToggleStock(product.id)}
                  className="flex-1 py-1.5 text-xs font-bold text-center rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                 >
                   {product.quantity > 0 ? 'EDIT STOCK' : 'RESTOCK'}
                 </button>
                 <button className="p-1.5 text-red-400 hover:bg-red-50 rounded transition">
                   <Trash2 size={16} />
                 </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};