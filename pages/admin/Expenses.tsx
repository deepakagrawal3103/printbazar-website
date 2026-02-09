import React from 'react';
import { Expense } from '../../types';

interface ExpensesPageProps {
  expenses: Expense[];
}

export const ExpensesPage: React.FC<ExpensesPageProps> = ({ expenses }) => {
  return (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800">Expenses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-lg mb-4">Add New Expense</h3>
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                        <input type="text" className="w-full border border-slate-200 rounded-lg p-2" placeholder="e.g. Shop Rent" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
                            <input type="number" className="w-full border border-slate-200 rounded-lg p-2" placeholder="₹ 0.00" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                            <input type="date" className="w-full border border-slate-200 rounded-lg p-2" />
                        </div>
                    </div>
                    <button className="w-full bg-slate-900 text-white py-2 rounded-lg font-medium hover:bg-slate-800">Save Expense</button>
                </form>
            </div>
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-lg mb-4">Recent Expenses</h3>
                 <div className="space-y-3">
                    {expenses.map(e => (
                        <div key={e.id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-lg transition">
                            <div>
                                <p className="font-medium text-slate-800">{e.title}</p>
                                <p className="text-xs text-slate-500">
                                  {new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • {e.category}
                                </p>
                            </div>
                            <span className="font-bold text-slate-700">-₹{e.amount}</span>
                        </div>
                    ))}
                 </div>
             </div>
        </div>
    </div>
  );
};