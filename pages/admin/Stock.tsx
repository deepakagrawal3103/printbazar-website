import React, { useState } from 'react';
import { 
  AlertTriangle, CheckCircle, Plus, Minus, Trash2, Search, Package, Edit2, X
} from 'lucide-react';
import { StockItem } from '../../types';

interface StockPageProps { 
  stock: StockItem[], 
  onAdd: (item: Omit<StockItem, 'id'>) => void,
  onUpdate: (id: string, updates: Partial<StockItem>) => void,
  onDelete: (id: string) => void
}

export const StockPage: React.FC<StockPageProps> = ({ 
  stock, 
  onAdd, 
  onUpdate, 
  onDelete 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newItem, setNewItem] = useState<Partial<StockItem>>({
    name: '', category: 'Paper', quantity: 0, threshold: 5, unit: 'Unit'
  });

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);

  const categories = ['All', 'Paper', 'Ink', 'Binding', 'Cover', 'Lamination', 'Stationery', 'Other'];

  const filteredStock = stock.filter(item => 
    (selectedCategory === 'All' || item.category === selectedCategory) &&
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.name && newItem.quantity !== undefined) {
      onAdd({
        name: newItem.name,
        category: newItem.category as any,
        quantity: Number(newItem.quantity),
        threshold: Number(newItem.threshold),
        unit: newItem.unit || 'Unit'
      });
      setIsAddModalOpen(false);
      setNewItem({ name: '', category: 'Paper', quantity: 0, threshold: 5, unit: 'Unit' });
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      onUpdate(editingItem.id, {
        name: editingItem.name,
        category: editingItem.category,
        quantity: Number(editingItem.quantity),
        threshold: Number(editingItem.threshold),
        unit: editingItem.unit
      });
      setEditingItem(null);
    }
  };

  const handleQuickAdjust = (item: StockItem, amount: number) => {
      const newQuantity = Math.max(0, item.quantity + amount);
      onUpdate(item.id, { quantity: newQuantity });
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
         <h2 className="text-2xl font-bold text-slate-800">Raw Stock Inventory</h2>
         <button 
           onClick={() => setIsAddModalOpen(true)}
           className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
         >
           <Plus size={18} />
           <span>Add New Item</span>
         </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto no-scrollbar">
          {categories.map(cat => (
             <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat 
                  ? 'bg-slate-800 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
            placeholder="Search stock..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-600">Item Name</th>
              <th className="px-6 py-4 font-semibold text-slate-600">Category</th>
              <th className="px-6 py-4 font-semibold text-slate-600">Quantity</th>
              <th className="px-6 py-4 font-semibold text-slate-600">Threshold</th>
              <th className="px-6 py-4 font-semibold text-slate-600">Status</th>
              <th className="px-6 py-4 font-semibold text-slate-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStock.map(item => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                   <div className="font-medium text-slate-800">{item.name}</div>
                   <div className="text-xs text-slate-400">{item.unit}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                    {item.category}
                  </span>
                </td>
                <td className="px-6 py-4 font-mono font-medium text-slate-800">
                  {item.quantity}
                </td>
                <td className="px-6 py-4 font-mono text-slate-500">
                  {item.threshold}
                </td>
                <td className="px-6 py-4">
                  {item.quantity <= item.threshold ? (
                    <div className="flex items-center text-red-600 text-xs font-bold bg-red-50 px-2 py-1 rounded-full w-fit">
                      <AlertTriangle size={14} className="mr-1" /> Low Stock
                    </div>
                  ) : (
                    <div className="flex items-center text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-full w-fit">
                       <CheckCircle size={14} className="mr-1" /> OK
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-1">
                    <button 
                      onClick={() => handleQuickAdjust(item, -1)}
                      className="p-1.5 text-slate-500 hover:bg-slate-100 rounded transition-colors"
                      title="Decrease (-1)"
                    >
                      <Minus size={16} />
                    </button>
                    <button 
                      onClick={() => handleQuickAdjust(item, 1)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" 
                      title="Increase (+1)"
                    >
                      <Plus size={16} />
                    </button>
                    
                    <div className="w-px h-4 bg-slate-200 mx-1"></div>

                    <button 
                      onClick={() => setEditingItem(item)}
                      className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors"
                      title="Edit Item"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => onDelete(item.id)}
                      className="p-1.5 text-red-400 hover:bg-red-50 rounded transition-colors"
                      title="Delete Item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredStock.length === 0 && (
          <div className="p-12 text-center text-slate-400">
            <Package size={48} className="mx-auto mb-3 opacity-20" />
            <p>No stock items found.</p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Add New Stock Item</h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Item Name</label>
                <input 
                  required
                  type="text" 
                  className="w-full border border-slate-200 rounded-lg p-2"
                  value={newItem.name}
                  onChange={e => setNewItem({...newItem, name: e.target.value})}
                  placeholder="e.g. A4 Paper Ream"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select 
                    className="w-full border border-slate-200 rounded-lg p-2"
                    value={newItem.category}
                    onChange={e => setNewItem({...newItem, category: e.target.value as any})}
                  >
                    {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                 <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
                  <input 
                    type="text" 
                    className="w-full border border-slate-200 rounded-lg p-2"
                    value={newItem.unit}
                    onChange={e => setNewItem({...newItem, unit: e.target.value})}
                    placeholder="e.g. Box, Ream"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Initial Qty</label>
                  <input 
                    required
                    type="number" 
                    className="w-full border border-slate-200 rounded-lg p-2"
                    value={newItem.quantity}
                    onChange={e => setNewItem({...newItem, quantity: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Low Alert At</label>
                  <input 
                    required
                    type="number" 
                    className="w-full border border-slate-200 rounded-lg p-2"
                    value={newItem.threshold}
                    onChange={e => setNewItem({...newItem, threshold: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2 text-slate-600 hover:bg-slate-50 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-sm"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-slate-800">Edit Stock Item</h3>
                <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Item Name</label>
                <input 
                  required
                  type="text" 
                  className="w-full border border-slate-200 rounded-lg p-2"
                  value={editingItem.name}
                  onChange={e => setEditingItem({...editingItem, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select 
                    className="w-full border border-slate-200 rounded-lg p-2"
                    value={editingItem.category}
                    onChange={e => setEditingItem({...editingItem, category: e.target.value as any})}
                  >
                    {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                 <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
                  <input 
                    type="text" 
                    className="w-full border border-slate-200 rounded-lg p-2"
                    value={editingItem.unit}
                    onChange={e => setEditingItem({...editingItem, unit: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                  <input 
                    required
                    type="number" 
                    className="w-full border border-slate-200 rounded-lg p-2"
                    value={editingItem.quantity}
                    onChange={e => setEditingItem({...editingItem, quantity: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Low Alert At</label>
                  <input 
                    required
                    type="number" 
                    className="w-full border border-slate-200 rounded-lg p-2"
                    value={editingItem.threshold}
                    onChange={e => setEditingItem({...editingItem, threshold: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setEditingItem(null)}
                  className="flex-1 py-2 text-slate-600 hover:bg-slate-50 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};