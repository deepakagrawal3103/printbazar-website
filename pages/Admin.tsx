import React, { useState } from 'react';
import { Order, OrderStatus, Product, StockItem, Expense } from '../types';
import { Dashboard } from './admin/Dashboard';
import { OrdersPage } from './admin/Orders';
import { ProductsPage } from './admin/Products';
import { StockPage } from './admin/Stock';
import { ExpensesPage } from './admin/Expenses';
import { SettingsPage } from './admin/Settings';

interface AdminPageProps {
  products: Product[];
  stock: StockItem[];
  orders: Order[];
  expenses: Expense[];
  categories: string[];
  // Replaced specific status update with generic update
  onUpdateOrder?: (id: string, updates: Partial<Order>) => void;
  // Kept for backward compat if Dashboard uses it, but logic should move to onUpdateOrder
  onUpdateOrderStatus?: (id: string, status: OrderStatus) => void;
  onDeleteOrder?: (id: string) => void;
  onToggleProductStock: (id: string) => void;
  onAddStock?: (item: Omit<StockItem, 'id'>) => void;
  onUpdateStock?: (id: string, updates: Partial<StockItem>) => void;
  onDeleteStock?: (id: string) => void;
  onAddCategory: (category: string) => void;
  onAddOrder?: (order: any) => void;
}

export const AdminPage: React.FC<AdminPageProps> = (props) => {
  return (
    <AdminPageContent 
      activeTab="dashboard" 
      {...props} 
    />
  );
};

// Internal component to handle the switch
export const AdminPageContent = ({ 
  activeTab,
  products, stock, orders, expenses, categories,
  onUpdateOrder, onUpdateOrderStatus, onDeleteOrder,
  onToggleProductStock,
  onAddStock, onUpdateStock, onDeleteStock, onAddCategory, onAddOrder
}: AdminPageProps & { activeTab: string }) => {
  
  // Helper to bridge old dashboard prop to new generic handler
  const handleStatusUpdate = (id: string, status: OrderStatus) => {
    if (onUpdateOrder) {
      onUpdateOrder(id, { status });
    } else if (onUpdateOrderStatus) {
        onUpdateOrderStatus(id, status);
    }
  };

  switch(activeTab) {
    case 'dashboard':
      return <Dashboard orders={orders} stock={stock} expenses={expenses} onUpdateOrderStatus={handleStatusUpdate} />;
    case 'orders':
      return (
        <OrdersPage 
          orders={orders} 
          products={products}
          onUpdateOrder={onUpdateOrder!} 
          onDeleteOrder={onDeleteOrder!}
          categories={categories} 
          onAddCategory={onAddCategory} 
          onAddOrder={onAddOrder}
        />
      );
    case 'products':
      return <ProductsPage products={products} onToggleStock={onToggleProductStock} />;
    case 'stock':
      return <StockPage stock={stock} onAdd={onAddStock!} onUpdate={onUpdateStock!} onDelete={onDeleteStock!} />;
    case 'expenses':
      return <ExpensesPage expenses={expenses} />;
    case 'settings':
      return <SettingsPage />;
    default:
      return <Dashboard orders={orders} stock={stock} expenses={expenses} onUpdateOrderStatus={handleStatusUpdate} />;
  }
};