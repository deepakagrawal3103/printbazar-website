import { GoogleGenAI } from "@google/genai";
import { Order, StockItem, Expense } from "../types";

// Initialize Gemini Client
// Note: In a real app, ensure process.env.API_KEY is available.
// The component using this will handle the missing key gracefully.
const apiKey = process.env.API_KEY || '';
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const generateBusinessReport = async (
  orders: Order[],
  stock: StockItem[],
  expenses: Expense[]
) => {
  if (!ai) {
    return "API Key not configured. Unable to generate AI report.";
  }

  // Calculate some basic stats to feed the model
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalProfit = orders.reduce((sum, o) => sum + o.profit, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalProfit - totalExpenses;
  const lowStockItems = stock.filter(s => s.quantity <= s.threshold).map(s => s.name).join(', ');

  const prompt = `
    Act as a business analyst for a print shop in India. Analyze the following data snapshot and provide a concise, actionable summary (max 150 words).
    
    Data:
    - Total Revenue: ₹${totalRevenue}
    - Gross Profit: ₹${totalProfit}
    - Total Expenses: ₹${totalExpenses}
    - Net Profit: ₹${netProfit}
    - Critical Low Stock: ${lowStockItems || 'None'}
    
    Provide:
    1. Financial health check.
    2. One specific recommendation for improvement.
    3. A motivational quote for the staff.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to generate report due to an API error.";
  }
};