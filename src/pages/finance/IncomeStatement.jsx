import React, { useState, useEffect } from 'react';
import { 
  getProfitLossReport,
  getSalesReport,
  getDailySummary,
  getInventoryValuationReport
} from '../../services/financialServices';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const IncomeStatement = () => {
  const [reportData, setReportData] = useState({
    grossSales: 0,
    returnsAndAllowances: 0,
    netSales: 0,
    beginningInventory: 0,
    purchases: 0,
    endingInventory: 0,
    totalCOGS: 0,
    grossProfit: 0,
    expenses: [],
    totalExpenses: 0,
    netIncome: 0,
    taxes: 0,
    operatingIncome: 0,
    otherIncome: 0,
    otherExpenses: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(new Date(new Date().setFullYear(new Date().getFullYear() - 1)));
  const [endDate, setEndDate] = useState(new Date());

  const fetchIncomeStatementData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all required data in parallel
      const [
        profitLossData, 
        salesData, 
        dailySummaryData,
        inventoryData
      ] = await Promise.all([
        getProfitLossReport(startDate, endDate),
        getSalesReport(startDate, endDate),
        getDailySummary(endDate),
        getInventoryValuationReport()
      ]);

      // Calculate derived values
      const netSales = (profitLossData.grossSales || 0) - (profitLossData.returnsAndAllowances || 0);
      const totalCOGS = (profitLossData.beginningInventory || 0) + 
                       (profitLossData.purchases || 0) - 
                       (profitLossData.endingInventory || 0);
      const grossProfit = netSales - totalCOGS;
      const operatingIncome = grossProfit - (profitLossData.totalExpenses || 0);
      const netIncome = operatingIncome + 
                       (profitLossData.otherIncome || 0) - 
                       (profitLossData.otherExpenses || 0) - 
                       (profitLossData.taxes || 0);

      // Calculate total sales returns from sales data
      const totalReturns = salesData.reduce((sum, sale) => sum + (sale.returnsAmount || 0), 0);

      setReportData({
        grossSales: profitLossData.grossSales || 0,
        returnsAndAllowances: totalReturns || profitLossData.returnsAndAllowances || 0,
        netSales,
        beginningInventory: profitLossData.beginningInventory || inventoryData.beginningValue || 0,
        purchases: profitLossData.purchases || 0,
        endingInventory: profitLossData.endingInventory || inventoryData.endingValue || 0,
        totalCOGS,
        grossProfit,
        expenses: Array.isArray(profitLossData.expenses) ? profitLossData.expenses : [],
        totalExpenses: profitLossData.totalExpenses || 0,
        taxes: profitLossData.taxes || 0,
        operatingIncome,
        otherIncome: profitLossData.otherIncome || 0,
        otherExpenses: profitLossData.otherExpenses || 0,
        netIncome,
        inventoryData
      });
    } catch (err) {
      setError('Failed to fetch income statement data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomeStatementData();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchIncomeStatementData();
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value || 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Income Statement</h1>
        
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Generate Report'}
              </button>
            </div>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {!loading && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h2 className="text-lg font-semibold text-gray-800">
                Income Statement: {startDate.toLocaleDateString()} to {endDate.toLocaleDateString()}
              </h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {/* Revenue Section */}
              <div className="p-4">
                <h3 className="font-medium text-gray-800 mb-2">Revenue</h3>
                <div className="ml-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gross Sales</span>
                    <span className="font-medium">{formatCurrency(reportData.grossSales)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Returns & Allowances</span>
                    <span className="font-medium">-{formatCurrency(reportData.returnsAndAllowances)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Net Sales</span>
                    <span className="font-medium">{formatCurrency(reportData.netSales)}</span>
                  </div>
                </div>
              </div>

              {/* COGS Section */}
              <div className="p-4">
                <h3 className="font-medium text-gray-800 mb-2">Cost of Goods Sold</h3>
                <div className="ml-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Beginning Inventory</span>
                    <span className="font-medium">{formatCurrency(reportData.beginningInventory)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Purchases</span>
                    <span className="font-medium">{formatCurrency(reportData.purchases)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ending Inventory</span>
                    <span className="font-medium">-{formatCurrency(reportData.endingInventory)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Total COGS</span>
                    <span className="font-medium">{formatCurrency(reportData.totalCOGS)}</span>
                  </div>
                </div>
              </div>

              {/* Gross Profit */}
              <div className="p-4 bg-gray-50">
                <div className="flex justify-between">
                  <span className="font-semibold">Gross Profit</span>
                  <span className="font-semibold">{formatCurrency(reportData.grossProfit)}</span>
                </div>
              </div>

              {/* Expenses */}
              <div className="p-4">
                <h3 className="font-medium text-gray-800 mb-2">Operating Expenses</h3>
                <div className="ml-4 space-y-2">
                  {reportData.expenses.map((expense, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-gray-600">{expense.name || `Expense ${index + 1}`}</span>
                      <span className="font-medium">{formatCurrency(expense.amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Total Operating Expenses</span>
                    <span className="font-medium">{formatCurrency(reportData.totalExpenses)}</span>
                  </div>
                </div>
              </div>

              {/* Operating Income */}
              <div className="p-4 bg-blue-50">
                <div className="flex justify-between">
                  <span className="font-semibold text-blue-800">Operating Income</span>
                  <span className="font-semibold text-blue-800">{formatCurrency(reportData.operatingIncome)}</span>
                </div>
              </div>

              {/* Other Income/Expenses */}
              <div className="p-4">
                <h3 className="font-medium text-gray-800 mb-2">Other Income & Expenses</h3>
                <div className="ml-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Other Income</span>
                    <span className="font-medium">{formatCurrency(reportData.otherIncome)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Other Expenses</span>
                    <span className="font-medium">-{formatCurrency(reportData.otherExpenses)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Taxes</span>
                    <span className="font-medium">-{formatCurrency(reportData.taxes)}</span>
                  </div>
                </div>
              </div>

              {/* Net Income */}
              <div className="p-4 bg-green-50 border-t-2 border-green-200">
                <div className="flex justify-between">
                  <span className="font-semibold text-green-800">Net Income</span>
                  <span className="font-semibold text-green-800">{formatCurrency(reportData.netIncome)}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t flex justify-end">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Print Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncomeStatement;