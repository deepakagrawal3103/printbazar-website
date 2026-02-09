import React from 'react';
import { Settings as SettingsIcon, Save } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center space-x-3 text-slate-800 mb-2">
            <SettingsIcon size={24} className="text-slate-400" />
            <h3 className="text-lg font-bold">General Configuration</h3>
          </div>
          <p className="text-sm text-slate-500">Manage basic store settings and notifications.</p>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Store Name</label>
              <input type="text" defaultValue="PrintMaster Pro" className="w-full border border-slate-200 rounded-lg p-2.5" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contact Email</label>
              <input type="email" defaultValue="admin@printmaster.com" className="w-full border border-slate-200 rounded-lg p-2.5" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Currency Symbol</label>
              <select className="w-full border border-slate-200 rounded-lg p-2.5" defaultValue="₹">
                <option value="₹">₹ (INR)</option>
                <option value="$">$ (USD)</option>
                <option value="€">€ (EUR)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp Notification Number</label>
              <input type="tel" defaultValue="+91 98765 43210" className="w-full border border-slate-200 rounded-lg p-2.5" />
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-100">
            <h4 className="font-bold text-slate-800 mb-4">Notification Preferences</h4>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                <span className="text-slate-700">Email me on new orders</span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                <span className="text-slate-700">Send WhatsApp alerts to customers</span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                <span className="text-slate-700">Low stock daily digest</span>
              </label>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
           <button className="bg-slate-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-800 flex items-center space-x-2">
             <Save size={18} />
             <span>Save Changes</span>
           </button>
        </div>
      </div>
    </div>
  );
};