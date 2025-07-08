import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  message, 
  Table, 
  Input, 
  Button, 
  Space, 
  Card, 
  DatePicker, 
  Tag,
  Select,
  Tooltip,
  Statistic
} from 'antd';
import { 
  SearchOutlined, 
  RollbackOutlined, 
  ArrowLeftOutlined,
  ReloadOutlined,
  FilterOutlined,
  ShoppingOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://inventorymanagementsystem-latest-37zl.onrender.com/api';

export default function SalesReturnPage() {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState([]);
  const [statusFilter, setStatusFilter] = useState('COMPLETED');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [stats, setStats] = useState({
    totalAmount: 0,
    totalSales: 0,
    returnableSales: 0
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchSales();
  }, [pagination.current, pagination.pageSize, statusFilter]);

  useEffect(() => {
    filterSales();
    calculateStats();
  }, [sales, searchTerm, dateRange]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_BASE_URL}/sales`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          status: statusFilter,
          page: pagination.current - 1,
          size: pagination.pageSize,
        }
      });

      const salesData = response.data.content || response.data;
      setSales(salesData);
      setPagination({
        ...pagination,
        total: response.data.totalElements || response.data.length || 0,
      });
    } catch (err) {
      console.error('Failed to load sales', err);
      message.error('Failed to load sales data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const returnable = sales.filter(s => s.status === 'COMPLETED');
    const totalAmount = returnable.reduce((sum, sale) => sum + (sale.total || 0), 0);
    
    setStats({
      totalAmount,
      totalSales: sales.length,
      returnableSales: returnable.length
    });
  };

  const filterSales = () => {
    let result = [...sales];
    
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(sale =>
        (sale.customerName && sale.customerName.toLowerCase().includes(lower)) ||
        (sale.customer?.name?.toLowerCase().includes(lower)) ||
        (sale.id.toString().includes(searchTerm))
      );
    }

    if (dateRange && dateRange.length === 2) {
      const start = dayjs(dateRange[0]).startOf('day');
      const end = dayjs(dateRange[1]).endOf('day');
      result = result.filter(sale => {
        const saleDate = dayjs(sale.saleDate);
        return saleDate.isAfter(start) && saleDate.isBefore(end);
      });
    }

    setFilteredSales(result);
  };

  const handleReturnSale = async (saleId) => {
    if (!window.confirm('Are you sure you want to return this sale? This will cancel the sale.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/sales/${saleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      message.success('Sale returned successfully');
      fetchSales(); // Refresh the sales list
    } catch (error) {
      console.error('Failed to return sale', error);
      message.error(error.response?.data?.message || 'Failed to return sale');
    }
  };

  const columns = [
    {
      title: 'Sale ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.id - b.id,
      width: 100,
      fixed: 'left',
      render: (id) => <span className="font-mono text-gray-700">#{id}</span>
    },
    {
      title: 'Customer',
      dataIndex: ['customer', 'name'],
      key: 'customer',
      render: (_, record) => (
        <div className="flex items-center">
          <span className="font-medium text-gray-800">
            {record.customerName || record.customer?.name || 'Walk-in Customer'}
          </span>
        </div>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'saleDate',
      key: 'date',
      render: (date) => (
        <div className="flex flex-col">
          <span className="text-gray-600 font-medium">
            {dayjs(date).format('MMM D, YYYY')}
          </span>
          <span className="text-xs text-gray-400">
            {dayjs(date).format('h:mm A')}
          </span>
        </div>
      ),
      sorter: (a, b) => new Date(a.saleDate) - new Date(b.saleDate),
      width: 150,
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: (items) => (
        <div className="flex items-center justify-center">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-medium">
            {items?.length || 0}
          </span>
        </div>
      ),
      width: 100,
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total) => (
        <span className="font-bold text-blue-600">
          Ksh {total?.toFixed(2) || '0.00'}
        </span>
      ),
      sorter: (a, b) => a.total - b.total,
      width: 120,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag 
          color={
            status === 'COMPLETED' ? 'green' : 
            status === 'CANCELLED' ? 'red' : 
            status === 'PENDING' ? 'orange' : 'gray'
          }
          className="font-medium px-2 py-0.5 rounded-md"
        >
          {status}
        </Tag>
      ),
      filters: [
        { text: 'Completed', value: 'COMPLETED' },
        { text: 'Cancelled', value: 'CANCELLED' },
        { text: 'Pending', value: 'PENDING' },
      ],
      onFilter: (value, record) => record.status === value,
      width: 120,
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Return this sale">
            <Button 
              type="primary" 
              icon={<RollbackOutlined />} 
              onClick={() => handleReturnSale(record.id)}
              disabled={record.status === 'CANCELLED'}
              className="bg-blue-500 hover:bg-blue-600 border-blue-500 flex items-center"
              size="small"
            >
              Return
            </Button>
          </Tooltip>
        </Space>
      ),
      width: 120,
    },
  ];

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <Card
        title={
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
                <ShoppingOutlined className="text-blue-500" />
                Sales Returns Management
              </h2>
              <p className="text-sm text-gray-500 mt-1">Process returns and manage cancelled sales</p>
            </div>
            <Button
              type="default"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/sales')} // Updated to navigate to sales list
              className="flex items-center border-gray-300 text-gray-700 hover:text-gray-900 hover:border-gray-400"
              size="large"
            >
              Back to Sales List
            </Button>
          </div>
        }
        className="shadow-lg rounded-lg border-0"
        headStyle={{ borderBottom: '1px solid #e5e7eb' }}
        bodyStyle={{ padding: 0 }}
      >
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-white border-b">
          <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Total Sales"
              value={stats.totalSales}
              prefix={<ShoppingOutlined className="text-blue-400" />}
              valueStyle={{ color: '#3b82f6' }}
            />
          </Card>
          <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Returnable Sales"
              value={stats.returnableSales}
              prefix={<RollbackOutlined className="text-green-400" />}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
          <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Total Amount"
              value={stats.totalAmount}
              precision={2}
              prefix="Ksh"
              valueStyle={{ color: '#6366f1' }}
            />
          </Card>
        </div>

        {/* Filters */}
        <div className="p-6 bg-gray-50 border-b">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search by customer, ID..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
              className="rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500 h-10"
            />
            
            <DatePicker.RangePicker
              style={{ width: '100%' }}
              onChange={(dates) => setDateRange(dates)}
              disabledDate={(current) => current && current > dayjs().endOf('day')}
              className="rounded-lg border-gray-300 hover:border-blue-400 h-10"
              placeholder={['Start Date', 'End Date']}
            />
            
            <Select
              style={{ width: '100%' }}
              placeholder="Filter by status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'COMPLETED', label: 'Completed' },
                { value: 'PENDING', label: 'Pending' },
                { value: 'CANCELLED', label: 'Cancelled' },
              ]}
              allowClear
              suffixIcon={<FilterOutlined className="text-gray-400" />}
              className="rounded-lg border-gray-300 hover:border-blue-400 h-10"
            />
            
            <Button 
              type="primary" 
              onClick={fetchSales}
              loading={loading}
              icon={<ReloadOutlined />}
              className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 border-blue-600 rounded-lg h-10"
            >
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Sales Table */}
        <div className="p-4 md:p-6">
          <Table
            columns={columns}
            dataSource={filteredSales}
            rowKey="id"
            loading={loading}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
              onChange: (page, pageSize) => {
                setPagination({ ...pagination, current: page, pageSize });
              },
              className: "px-4 py-2 bg-white rounded-b-lg",
            }}
            scroll={{ x: 1200 }}
            className="rounded-lg overflow-hidden border border-gray-200"
            expandable={{
              expandedRowRender: (record) => (
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-3 text-lg">Sale Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h5 className="font-medium text-gray-700 mb-2">Customer Information</h5>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <p className="text-gray-600">
                            <span className="font-medium">Name:</span> {record.customerName || record.customer?.name || 'Walk-in Customer'}
                          </p>
                          {record.customer?.phone && (
                            <p className="text-gray-600 mt-1">
                              <span className="font-medium">Phone:</span> {record.customer.phone}
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-700 mb-2">Sale Summary</h5>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <p className="text-gray-600">
                            <span className="font-medium">Date:</span> {dayjs(record.saleDate).format('MMMM D, YYYY h:mm A')}
                          </p>
                          <p className="text-gray-600 mt-1">
                            <span className="font-medium">Status:</span> 
                            <Tag 
                              color={
                                record.status === 'COMPLETED' ? 'green' : 
                                record.status === 'CANCELLED' ? 'red' : 'orange'
                              }
                              className="ml-2"
                            >
                              {record.status}
                            </Tag>
                          </p>
                        </div>
                      </div>
                    </div>

                    <h5 className="font-medium text-gray-700 mb-3">Items ({record.items?.length || 0})</h5>
                    <Table
                      columns={[
                        { 
                          title: 'Product', 
                          dataIndex: ['product', 'name'], 
                          key: 'product',
                          render: (text) => <span className="font-medium text-gray-800">{text}</span>
                        },
                        { 
                          title: 'Qty', 
                          dataIndex: 'quantity', 
                          key: 'quantity',
                          render: (text) => <span className="text-gray-700">{text}</span>,
                          width: 80,
                        },
                        { 
                          title: 'Unit Price', 
                          dataIndex: 'unitPrice', 
                          key: 'price', 
                          render: (price) => <span className="text-blue-600 font-medium">Ksh {price?.toFixed(2) || '0.00'}</span>,
                          width: 120,
                        },
                        { 
                          title: 'Total', 
                          dataIndex: 'totalPrice', 
                          key: 'total', 
                          render: (total) => <span className="text-green-600 font-bold">Ksh {total?.toFixed(2) || '0.00'}</span>,
                          width: 120,
                        },
                      ]}
                      dataSource={record.items || []}
                      rowKey={(item) => item.product?.id || item.productId}
                      pagination={false}
                      size="small"
                      className="bg-white rounded-lg border border-gray-200"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                      <h5 className="font-medium text-gray-700 mb-3">Payment Summary</h5>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal:</span>
                          <span className="font-medium">Ksh {record.subtotal?.toFixed(2) || '0.00'}</span>
                        </div>
                        {record.taxAmount > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tax:</span>
                            <span className="font-medium">Ksh {record.taxAmount?.toFixed(2) || '0.00'}</span>
                          </div>
                        )}
                        {record.discountAmount > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Discount:</span>
                            <span className="font-medium text-red-500">- Ksh {record.discountAmount?.toFixed(2) || '0.00'}</span>
                          </div>
                        )}
                        <div className="flex justify-between pt-2 border-t border-gray-200 mt-2">
                          <span className="text-gray-800 font-bold">Total:</span>
                          <span className="text-blue-600 font-bold text-lg">Ksh {record.total?.toFixed(2) || '0.00'}</span>
                        </div>
                      </div>
                    </div>

                    {record.notes && (
                      <div className="md:col-span-2 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <h5 className="font-medium text-gray-700 mb-2">Additional Notes</h5>
                        <p className="text-gray-600 whitespace-pre-line">{record.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ),
              rowExpandable: (record) => record.items?.length > 0,
            }}
          />
        </div>
      </Card>
    </div>
  );
}