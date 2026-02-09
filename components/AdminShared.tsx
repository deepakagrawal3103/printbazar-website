import React from 'react';
import { 
  AlertTriangle, CheckCircle, Phone, MessageCircle, Edit2, Trash2, Clock, DollarSign, Eye, MoreHorizontal
} from 'lucide-react';
import { Order, OrderStatus, StockItem } from '../types';

// --- Stat Card ---
export const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100 flex items-start justify-between">
    <div>
      <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      {trend && <p className={`text-xs mt-2 font-medium ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{trend} from last week</p>}
    </div>
    <div className={`p-3 rounded-lg bg-${color}-50 text-${color}-600`}>
      <Icon size={24} />
    </div>
  </div>
);

// --- Orders Table ---
interface OrdersTableProps {
  orders: Order[];
  onStatusUpdate: (id: string, status: OrderStatus) => void; // Used for "Mark Complete"
  onPaymentUpdate?: (id: string, status: 'Paid' | 'Pending') => void;
  onWhatsApp?: (order: Order) => void;
  onEdit?: (order: Order) => void; // Opens Edit Modal
  onView?: (order: Order) => void; // Opens View Modal
  onDelete?: (id: string) => void;
}

export const OrdersTable = ({ orders, onStatusUpdate, onPaymentUpdate, onWhatsApp, onEdit, onView, onDelete }: OrdersTableProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
            <tr>
              <th className="px-6 py-3 w-16">#</th>
              <th className="px-6 py-3">Customer</th>
              <th className="px-6 py-3">Order Summary</th>
              <th className="px-6 py-3">Total</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order, index) => {
               // Calculate Item Summary
               const firstItem = order.items[0];
               const remainingCount = order.items.length - 1;
               const itemSummary = firstItem 
                 ? `${firstItem.name} ${remainingCount > 0 ? `+ ${remainingCount} more` : ''}`
                 : 'No items';

               const isCompleted = order.status === OrderStatus.DELIVERED;

               return (
                <tr key={order.id} className={`hover:bg-slate-50 transition-colors ${isCompleted ? 'bg-slate-50/50' : ''}`}>
                  {/* Serial Number */}
                  <td className="px-6 py-4 font-mono text-slate-400">
                    {index + 1}
                  </td>

                  {/* Customer Name */}
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">{order.customerName}</div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1">
                       <Phone size={10} /> {order.customerPhone}
                    </div>
                  </td>

                  {/* Order Summary */}
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-700">{itemSummary}</div>
                    <div className="flex gap-2 mt-1">
                      {/* Status Badge */}
                      <span className={`text-[10px] px-2 py-0.5 rounded border ${
                        order.status === OrderStatus.DELIVERED ? 'bg-green-100 text-green-700 border-green-200' :
                        order.status === OrderStatus.CANCELLED ? 'bg-red-100 text-red-700 border-red-200' :
                        'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {order.status}
                      </span>
                      
                      {/* Payment Badge */}
                      <span className={`text-[10px] px-2 py-0.5 rounded border ${
                        order.paymentStatus === 'Paid' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-orange-50 text-orange-700 border-orange-200'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                  </td>

                  {/* Total */}
                  <td className="px-6 py-4 font-bold text-slate-800">
                    ₹{order.total}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      
                      {/* View Details Button */}
                      {onView && (
                        <button 
                          onClick={() => onView(order)}
                          className="p-2 text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition"
                          title="View Whole Order"
                        >
                          <Eye size={16} />
                        </button>
                      )}

                      {/* Complete / Revert Action */}
                      {!isCompleted ? (
                        <button 
                          onClick={() => onStatusUpdate(order.id, OrderStatus.DELIVERED)}
                          className="p-2 text-white bg-green-600 hover:bg-green-700 rounded-lg transition shadow-sm flex items-center gap-1"
                          title="Mark as Complete"
                        >
                          <CheckCircle size={16} />
                          <span className="text-xs font-bold hidden sm:inline">Complete</span>
                        </button>
                      ) : (
                        // If completed, allow editing to revert or change details
                         onEdit && (
                           <button onClick={() => onEdit(order)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition border border-blue-100" title="Edit / Revert">
                             <Edit2 size={16}/>
                           </button>
                         )
                      )}

                      {/* Delete */}
                      {onDelete && (
                         <button onClick={() => onDelete(order.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition" title="Delete Order"><Trash2 size={16}/></button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Stock Widget ---
export const StockWidget = ({ stock }: { stock: StockItem[] }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
    <div className="flex justify-between items-center mb-6">
      <h3 className="font-semibold text-slate-800">Low Stock Alerts</h3>
      <button className="text-blue-600 text-xs font-medium hover:underline">Manage Stock</button>
    </div>
    <div className="space-y-4">
      {stock.filter(s => s.quantity <= s.threshold).map(item => (
        <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-2 rounded-full shadow-sm text-red-500">
              <AlertTriangle size={16} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">{item.name}</p>
              <p className="text-xs text-red-600">Only {item.quantity} {item.unit} left</p>
            </div>
          </div>
          <button className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-md hover:bg-red-700 transition">Restock</button>
        </div>
      ))}
      {stock.filter(s => s.quantity <= s.threshold).length === 0 && (
        <div className="text-center py-8 text-slate-400">
          <CheckCircle className="mx-auto mb-2 opacity-50" size={32} />
          <p>All stock levels are healthy.</p>
        </div>
      )}
    </div>
  </div>
);