import React, { useState, useEffect } from 'react';
import { 
  getProfitLossReport,
  getDailySummary,
  getSalesReport
} from '../../services/financialServices';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CashFlow = () => {
  const [cashFlowData, setCashFlowData] = useState({
    operatingActivities: {
      netIncome: 0,
      adjustments: [],
      total: 0
    },
    investingActivities: [],
    financingActivities: [],
    netCashFlow: 0,
    cashAtBeginning: 0,
    cashAtEnd: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(new Date(new Date().setFullYear(new Date().getFullYear() - 1)));
  const [endDate, setEndDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('statement');

  const fetchCashFlowData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all required data in parallel
      const [profitLossData, dailySummaryData, salesData] = await Promise.all([
        getProfitLossReport(startDate, endDate),
        getDailySummary(endDate),
        getSalesReport(startDate, endDate)
      ]);

      // Calculate total cash received from sales
      const totalSalesCash = salesData.reduce((sum, sale) => sum + (sale.amountPaid || 0), 0);

      // Transform data into cash flow format
      const operatingActivities = {
        netIncome: profitLossData.netIncome || 0,
        adjustments: [
          { name: 'Depreciation', amount: dailySummaryData.depreciation || 0 },
          { name: 'Accounts Receivable', amount: -(dailySummaryData.accountsReceivableChange || 0) },
          { name: 'Inventory', amount: -(dailySummaryData.inventoryChange || 0) },
          { name: 'Accounts Payable', amount: dailySummaryData.accountsPayableChange || 0 },
          { name: 'Cash from Sales', amount: totalSalesCash }
        ],
        total: 0
      };

      const investingActivities = [
        { name: 'Equipment Purchases', amount: -(dailySummaryData.equipmentPurchases || 0) },
        { name: 'Property Investments', amount: -(dailySummaryData.propertyInvestments || 0) },
      ];

      const financingActivities = [
        { name: 'Loans Received', amount: dailySummaryData.loansReceived || 0 },
        { name: 'Dividends Paid', amount: -(dailySummaryData.dividendsPaid || 0) },
      ];

      // Calculate totals
      operatingActivities.total = operatingActivities.netIncome + 
        operatingActivities.adjustments.reduce((sum, item) => sum + item.amount, 0);
      
      const investingTotal = investingActivities.reduce((sum, item) => sum + item.amount, 0);
      const financingTotal = financingActivities.reduce((sum, item) => sum + item.amount, 0);
      
      const netCashFlow = operatingActivities.total + investingTotal + financingTotal;

      setCashFlowData({
        operatingActivities,
        investingActivities,
        financingActivities,
        netCashFlow,
        cashAtBeginning: dailySummaryData.cashAtBeginning || 0,
        cashAtEnd: dailySummaryData.cashAtEnd || 0
      });
    } catch (err) {
      setError('Failed to fetch cash flow data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCashFlowData();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchCashFlowData();
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
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Cash Flow Statement</h1>
        
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

          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('statement')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'statement' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Cash Flow Statement
              </button>
              <button
                onClick={() => setActiveTab('chart')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'chart' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Visualization
              </button>
            </nav>
          </div>
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

        {!loading && activeTab === 'statement' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h2 className="text-lg font-semibold text-gray-800">
                Cash Flow Statement: {startDate.toLocaleDateString()} to {endDate.toLocaleDateString()}
              </h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {/* Operating Activities */}
              <div className="p-4">
                <h3 className="font-medium text-gray-800 mb-2">Cash Flows from Operating Activities</h3>
                <div className="ml-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Net Income</span>
                    <span className="font-medium">{formatCurrency(cashFlowData.operatingActivities.netIncome)}</span>
                  </div>
                  
                  <div className="ml-4 mt-2">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Adjustments to reconcile net income:</h4>
                    {cashFlowData.operatingActivities.adjustments.map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-gray-600">{item.name}</span>
                        <span className="font-medium">{formatCurrency(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Net Cash from Operating Activities</span>
                    <span className="font-medium">{formatCurrency(cashFlowData.operatingActivities.total)}</span>
                  </div>
                </div>
              </div>

              {/* Investing Activities */}
              <div className="p-4">
                <h3 className="font-medium text-gray-800 mb-2">Cash Flows from Investing Activities</h3>
                <div className="ml-4 space-y-2">
                  {cashFlowData.investingActivities.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-gray-600">{item.name}</span>
                      <span className="font-medium">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Net Cash from Investing Activities</span>
                    <span className="font-medium">
                      {formatCurrency(cashFlowData.investingActivities.reduce((sum, item) => sum + item.amount, 0))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Financing Activities */}
              <div className="p-4">
                <h3 className="font-medium text-gray-800 mb-2">Cash Flows from Financing Activities</h3>
                <div className="ml-4 space-y-2">
                  {cashFlowData.financingActivities.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-gray-600">{item.name}</span>
                      <span className="font-medium">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Net Cash from Financing Activities</span>
                    <span className="font-medium">
                      {formatCurrency(cashFlowData.financingActivities.reduce((sum, item) => sum + item.amount, 0))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Net Increase */}
              <div className="p-4 bg-blue-50 border-t-2 border-blue-200">
                <div className="flex justify-between">
                  <span className="font-semibold text-blue-800">Net Increase in Cash</span>
                  <span className="font-semibold text-blue-800">{formatCurrency(cashFlowData.netCashFlow)}</span>
                </div>
              </div>

              {/* Cash at Beginning/End */}
              <div className="p-4 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Cash at Beginning of Period</div>
                  <div className="font-medium">{formatCurrency(cashFlowData.cashAtBeginning)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Cash at End of Period</div>
                  <div className="font-medium">{formatCurrency(cashFlowData.cashAtEnd)}</div>
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

        {!loading && activeTab === 'chart' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Cash Flow Visualization</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">Operating Activities</h3>
                <div className="h-4 bg-blue-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500" 
                    style={{ width: `${Math.min(100, (cashFlowData.operatingActivities.total / Math.max(1, Math.abs(cashFlowData.netCashFlow))) * 100)}%` }}
                  ></div>
                </div>
                <div className="mt-2 text-right font-medium text-blue-800">
                  {formatCurrency(cashFlowData.operatingActivities.total)}
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-800 mb-2">Investing Activities</h3>
                <div className="h-4 bg-green-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500" 
                    style={{ width: `${Math.min(100, (cashFlowData.investingActivities.reduce((sum, item) => sum + item.amount, 0) / Math.max(1, Math.abs(cashFlowData.netCashFlow))) * 100)}%` }}
                  ></div>
                </div>
                <div className="mt-2 text-right font-medium text-green-800">
                  {formatCurrency(cashFlowData.investingActivities.reduce((sum, item) => sum + item.amount, 0))}
                </div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-medium text-purple-800 mb-2">Financing Activities</h3>
                <div className="h-4 bg-purple-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500" 
                    style={{ width: `${Math.min(100, (cashFlowData.financingActivities.reduce((sum, item) => sum + item.amount, 0) / Math.max(1, Math.abs(cashFlowData.netCashFlow))) * 100)}%` }}
                  ></div>
                </div>
                <div className="mt-2 text-right font-medium text-purple-800">
                  {formatCurrency(cashFlowData.financingActivities.reduce((sum, item) => sum + item.amount, 0))}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">Net Cash Flow</h3>
              <div className={`h-8 ${cashFlowData.netCashFlow >= 0 ? 'bg-green-100' : 'bg-red-100'} rounded-full overflow-hidden`}>
                <div 
                  className={`h-full ${cashFlowData.netCashFlow >= 0 ? 'bg-green-500' : 'bg-red-500'}`} 
                  style={{ width: `${Math.min(100, Math.abs(cashFlowData.netCashFlow) / Math.max(1, Math.max(
                    Math.abs(cashFlowData.operatingActivities.total),
                    Math.abs(cashFlowData.investingActivities.reduce((sum, item) => sum + item.amount, 0)),
                    Math.abs(cashFlowData.financingActivities.reduce((sum, item) => sum + item.amount, 0))
                  ))) * 100}%` }}
                ></div>
              </div>
              <div className={`mt-2 text-right font-medium ${cashFlowData.netCashFlow >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                {formatCurrency(cashFlowData.netCashFlow)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashFlow;