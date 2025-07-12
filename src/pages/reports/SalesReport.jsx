import React, { useState, useEffect } from 'react';
import { 
  Table, Card, Statistic, DatePicker, Button, Select, Input, 
  Tabs, Spin, Tag, Divider, Row, Col, Affix, message
} from 'antd';
import { 
  DownloadOutlined, SearchOutlined,
  FileTextOutlined, BarChartOutlined,
  ShoppingCartOutlined, CalendarOutlined, 
  ArrowUpOutlined, TagOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { 
  getSales, getSalesByDateRange, exportSalesToCSV, 
  getSalesReport, getProfitLossReport, 
  getProductPerformanceReport
} from '../../services/salesService';

dayjs.extend(customParseFormat);

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

// Custom color palette
const colors = {
  primary: '#1890ff',
  success: '#52c41a',
  warning: '#faad14',
  error: '#f5222d',
  info: '#13c2c2',
  purple: '#722ed1',
  background: '#f8f9fa',
  cardHeader: '#f0f2f5'
};

const SalesReport = () => {
  // State management
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([
    dayjs().startOf('month'),
    dayjs().endOf('day')
  ]);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('transactions');
  const [reportLoading, setReportLoading] = useState(false);
  const [salesReportData, setSalesReportData] = useState([]);
  const [profitLossData, setProfitLossData] = useState(null);
  const [productPerformance, setProductPerformance] = useState([]);
  const [todaySalesTotal, setTodaySalesTotal] = useState(0);
  const [allTimeSalesTotal, setAllTimeSalesTotal] = useState(0);
  const [filteredSalesTotal, setFilteredSalesTotal] = useState({
    subtotal: 0,
    discount: 0,
    total: 0
  });

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount || 0);
  };

  // Status colors
  const statusColors = {
    COMPLETED: colors.success,
    PENDING: colors.warning,
    CANCELLED: colors.error
  };

  // Calculate totals from sales data
  const calculateTotals = (salesData) => {
    return salesData.reduce((totals, sale) => {
      const subtotal = sale.subtotal || 0;
      const discount = sale.discountAmount || 0;
      const total = subtotal - discount;
      
      return {
        subtotal: totals.subtotal + subtotal,
        discount: totals.discount + discount,
        total: totals.total + total
      };
    }, { subtotal: 0, discount: 0, total: 0 });
  };

  // Calculate individual sale total
  const calculateSaleTotal = (sale) => {
    const subtotal = sale.subtotal || 0;
    const discount = sale.discountAmount || 0;
    return subtotal - discount;
  };

  // Fetch all sales data
  const fetchSalesData = async () => {
    setLoading(true);
    try {
      let data;
      if (dateRange[0] && dateRange[1]) {
        data = await getSalesByDateRange(dateRange[0].toDate(), dateRange[1].toDate());
      } else {
        data = await getSales();
      }
      
      setSales(data);
      setFilteredSales(data);
      
      // Calculate all totals
      const allTimeTotals = calculateTotals(data);
      setAllTimeSalesTotal(allTimeTotals.total);
      
      // Calculate today's total if viewing today's data
      const today = dayjs().format('YYYY-MM-DD');
      const todaySales = data.filter(sale => 
        dayjs(sale.saleDate).format('YYYY-MM-DD') === today
      );
      const todayTotals = calculateTotals(todaySales);
      setTodaySalesTotal(todayTotals.total);
      
      // Calculate filtered totals
      const filteredTotals = calculateTotals(data);
      setFilteredSalesTotal(filteredTotals);
      
    } catch (error) {
      message.error('Failed to fetch sales data');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch sales report data
  const fetchSalesReport = async () => {
    setReportLoading(true);
    try {
      const [salesReport, profitLoss, productPerf] = await Promise.all([
        getSalesReport(dateRange[0]?.toDate(), dateRange[1]?.toDate()),
        getProfitLossReport(dateRange[0]?.toDate(), dateRange[1]?.toDate()),
        getProductPerformanceReport(dateRange[0]?.toDate(), dateRange[1]?.toDate())
      ]);
      
      setSalesReportData(salesReport);
      setProfitLossData(profitLoss);
      setProductPerformance(productPerf);
    } catch (error) {
      message.error('Failed to fetch sales report');
      console.error('Error:', error);
    } finally {
      setReportLoading(false);
    }
  };

  // Handle search and filters
  const handleSearch = () => {
    let result = [...sales];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(sale => 
        (sale.customerName && sale.customerName.toLowerCase().includes(term)) ||
        (sale.id && sale.id.toString().includes(term))
      );
    }
    
    if (statusFilter) {
      result = result.filter(sale => sale.status === statusFilter);
    }
    
    setFilteredSales(result);
    setFilteredSalesTotal(calculateTotals(result));
  };

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Columns for transactions table
  const transactionColumns = [
    {
      title: 'Sale ID',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <span style={{ fontWeight: 600 }}>#{id}</span>,
      sorter: (a, b) => a.id - b.id,
      fixed: 'left',
      width: 100
    },
    {
      title: 'Date',
      dataIndex: 'saleDate',
      key: 'date',
      render: (date) => <span style={{ color: colors.primary }}>{dayjs(date).format('DD MMM YYYY HH:mm')}</span>,
      sorter: (a, b) => new Date(a.saleDate) - new Date(b.saleDate),
      width: 150
    },
    {
      title: 'Customer',
      dataIndex: 'customerName',
      key: 'customer',
      render: (text) => <span style={{ color: colors.purple }}>{text || 'Walk-in'}</span>,
      responsive: ['md'],
      width: 150
    },
    {
      title: 'Subtotal',
      dataIndex: 'subtotal',
      key: 'subtotal',
      align: 'right',
      render: (amount) => <span style={{ fontWeight: 500 }}>{formatCurrency(amount)}</span>,
      width: 120
    },
    {
      title: 'Discount',
      dataIndex: 'discountAmount',
      key: 'discount',
      align: 'right',
      render: (amount) => <span style={{ color: colors.success }}>{formatCurrency(amount)}</span>,
      responsive: ['lg'],
      width: 120
    },
    {
      title: 'Total',
      key: 'total',
      align: 'right',
      render: (_, record) => (
        <span style={{ fontWeight: 600, color: colors.primary }}>
          {formatCurrency(calculateSaleTotal(record))}
        </span>
      ),
      sorter: (a, b) => calculateSaleTotal(a) - calculateSaleTotal(b),
      fixed: 'right',
      width: 120
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={statusColors[status]} style={{ fontWeight: 500 }}>{status}</Tag>,
      width: 120
    }
  ];

  // Product performance columns
  const productColumns = [
    {
      title: 'Product',
      dataIndex: 'productName',
      key: 'product',
      render: (text) => <span style={{ color: colors.purple }}>{text}</span>
    },
    {
      title: 'Quantity Sold',
      dataIndex: 'quantitySold',
      key: 'quantity',
      align: 'right',
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>
    },
    {
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      align: 'right',
      render: (price) => formatCurrency(price),
      responsive: ['md']
    },
    {
      title: 'Total Revenue',
      dataIndex: 'totalRevenue',
      key: 'revenue',
      align: 'right',
      render: (amount) => <span style={{ fontWeight: 600, color: colors.primary }}>{formatCurrency(amount)}</span>
    }
  ];

  // Load data on component mount and when date range changes
  useEffect(() => {
    fetchSalesData();
  }, [dateRange]);

  // Apply filters when they change
  useEffect(() => {
    handleSearch();
  }, [searchTerm, statusFilter, sales]);

  // Fetch report data when tab changes
  useEffect(() => {
    if (activeTab === 'report') {
      fetchSalesReport();
    }
  }, [activeTab]);

  return (
    <div className="p-4 md:p-6" style={{ background: colors.background, minHeight: '100vh' }}>
      {/* Scroll to top button */}
      <Affix style={{ position: 'fixed', bottom: 50, right: 20, zIndex: 1000 }}>
        <Button
          type="primary"
          shape="circle"
          icon={<ArrowUpOutlined />}
          onClick={scrollToTop}
          style={{
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}
        />
      </Affix>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-xl md:text-2xl font-bold" style={{ color: colors.primary }}>Sales Report</h1>
        <div className="flex gap-2 md:gap-4 w-full md:w-auto">
          <Button 
            type="primary" 
            icon={<DownloadOutlined />}
            onClick={() => exportSalesToCSV(filteredSales)}
            style={{ 
              background: colors.purple, 
              borderColor: colors.purple,
              fontWeight: 500,
              width: '100%'
            }}
          >
            <span className="hidden md:inline">Export Data</span>
            <span className="md:hidden">Export</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card 
        className="mb-6" 
        style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}
        bodyStyle={{ padding: 16 }}
      >
        <div className="flex flex-col md:flex-row gap-4">
          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            className="w-full"
            disabledDate={(current) => current && current > dayjs().endOf('day')}
            style={{ borderRadius: 6 }}
            suffixIcon={<CalendarOutlined style={{ color: colors.primary }} />}
          />
          
          <Input
            placeholder="Search by customer or ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
            prefix={<SearchOutlined style={{ color: colors.primary }} />}
            style={{ borderRadius: 6 }}
          />
          
          <Select
            placeholder="Filter by status"
            value={statusFilter}
            onChange={setStatusFilter}
            className="w-full"
            allowClear
            suffixIcon={<TagOutlined style={{ color: colors.primary }} />}
            style={{ borderRadius: 6 }}
          >
            <Option value="COMPLETED">Completed</Option>
            <Option value="PENDING">Pending</Option>
            <Option value="CANCELLED">Cancelled</Option>
          </Select>
        </div>
      </Card>

      {/* Summary Cards - Responsive layout */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card 
            bordered={false} 
            style={{ borderRadius: 8, background: `linear-gradient(135deg, ${colors.info} 0%, ${colors.primary} 100%)` }}
          >
            <Statistic
              title={<span style={{ color: 'white' }}>All Time Sales</span>}
              value={formatCurrency(allTimeSalesTotal)}
              valueStyle={{ color: 'white', fontWeight: 600 }}
              prefix={<ShoppingCartOutlined style={{ color: 'rgba(255,255,255,0.8)' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card 
            bordered={false} 
            style={{ borderRadius: 8, background: `linear-gradient(135deg, ${colors.success} 0%, #a0d911 100%)` }}
          >
            <Statistic
              title={<span style={{ color: 'white' }}>Today's Sales</span>}
              value={formatCurrency(todaySalesTotal)}
              valueStyle={{ color: 'white', fontWeight: 600 }}
              prefix={<CalendarOutlined style={{ color: 'rgba(255,255,255,0.8)' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card 
            bordered={false} 
            style={{ borderRadius: 8, background: `linear-gradient(135deg, ${colors.warning} 0%, #fa8c16 100%)` }}
          >
            <Statistic
              title={<span style={{ color: 'white' }}>Subtotal</span>}
              value={formatCurrency(filteredSalesTotal.subtotal)}
              valueStyle={{ color: 'white', fontWeight: 600 }}
              prefix={<FileTextOutlined style={{ color: 'rgba(255,255,255,0.8)' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card 
            bordered={false} 
            style={{ borderRadius: 8, background: `linear-gradient(135deg, ${colors.success} 0%, #52c41a 100%)` }}
          >
            <Statistic
              title={<span style={{ color: 'white' }}>Discounts</span>}
              value={formatCurrency(filteredSalesTotal.discount)}
              valueStyle={{ color: 'white', fontWeight: 600 }}
              prefix={<FileTextOutlined style={{ color: 'rgba(255,255,255,0.8)' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Card 
        style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}
        bodyStyle={{ padding: 0 }}
      >
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          tabBarStyle={{ padding: '0 16px', margin: 0 }}
          style={{ background: 'white' }}
        >
          <TabPane
            tab={
              <span style={{ fontWeight: 500 }}>
                <FileTextOutlined style={{ color: colors.primary }} /> Transactions
              </span>
            }
            key="transactions"
          >
            <div style={{ overflowX: 'auto' }}>
              <Table
                columns={transactionColumns}
                dataSource={filteredSales}
                loading={loading}
                rowKey="id"
                pagination={{ 
                  pageSize: 10,
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '20', '50', '100']
                }}
                style={{ padding: 16 }}
                scroll={{ x: 'max-content' }}
                summary={() => (
                  <Table.Summary fixed>
                    <Table.Summary.Row style={{ background: colors.cardHeader }}>
                      <Table.Summary.Cell index={0} colSpan={3} align="right">
                        <strong style={{ color: colors.primary }}>Totals:</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right">
                        <strong>{formatCurrency(filteredSalesTotal.subtotal)}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2} align="right">
                        <strong style={{ color: colors.success }}>{formatCurrency(filteredSalesTotal.discount)}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={3} align="right">
                        <strong style={{ color: colors.primary }}>{formatCurrency(filteredSalesTotal.total)}</strong>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
              />
            </div>
          </TabPane>
          
          <TabPane
            tab={
              <span style={{ fontWeight: 500 }}>
                
              </span>
            }
            key="report"
          >
            <Spin spinning={reportLoading}>
              {profitLossData && (
                <div style={{ padding: 16 }}>
                  <Row gutter={16} className="mb-6">
                    <Col xs={24} md={8}>
                      <Card>
                        <Statistic
                          title="Total Revenue"
                          value={formatCurrency(profitLossData.totalRevenue)}
                          prefix={<FileTextOutlined />}
                          valueStyle={{ color: colors.success }}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} md={8}>
                      <Card>
                        <Statistic
                          title="Total Cost"
                          value={formatCurrency(profitLossData.totalCost)}
                          prefix={<FileTextOutlined />}
                          valueStyle={{ color: colors.error }}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} md={8}>
                      <Card>
                        <Statistic
                          title="Net Profit"
                          value={formatCurrency(profitLossData.netProfit)}
                          prefix={<FileTextOutlined />}
                          valueStyle={{ color: profitLossData.netProfit >= 0 ? colors.success : colors.error }}
                        />
                      </Card>
                    </Col>
                  </Row>

                  <Divider orientation="left">Product Performance</Divider>
                  <Table
                    columns={productColumns}
                    dataSource={productPerformance}
                    rowKey="productId"
                    pagination={{ pageSize: 10 }}
                    style={{ marginBottom: 24 }}
                    scroll={{ x: true }}
                  />
                </div>
              )}
            </Spin>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default SalesReport;