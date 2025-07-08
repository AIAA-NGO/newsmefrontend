import React, { useState, useEffect, useCallback } from 'react';
import { 
  Table, 
  Card, 
  DatePicker, 
  Button, 
  Typography, 
  Space, 
  Statistic, 
  Row, 
  Col,
  Select,
  message,
  Divider,
  Tag,
  Badge,
  Progress,
  Tooltip
} from 'antd';
import { 
  DownloadOutlined, 
  FilterOutlined, 
  ReloadOutlined,
  EyeOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { getSuppliers } from '../../services/supplierService';
import { getAllPurchases } from '../../services/purchaseService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const SupplierPurchasesReport = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    supplierId: null
  });

  const fetchSuppliers = async () => {
    try {
      const data = await getSuppliers();
      setSuppliers(data);
    } catch (error) {
      message.error('Failed to fetch suppliers');
    }
  };

  const fetchAllPurchases = useCallback(async () => {
    setLoading(true);
    try {
      const allPurchases = await getAllPurchases();
      setPurchases(allPurchases);
    } catch (error) {
      message.error('Failed to fetch purchases');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFilteredPurchases = useCallback(async () => {
    setLoading(true);
    try {
      let allPurchases = await getAllPurchases();
      
      // Apply filters
      if (filters.startDate) {
        allPurchases = allPurchases.filter(p => 
          dayjs(p.orderDate).isSameOrAfter(dayjs(filters.startDate), 'day')
        );
      }
      
      if (filters.endDate) {
        allPurchases = allPurchases.filter(p => 
          dayjs(p.orderDate).isSameOrBefore(dayjs(filters.endDate), 'day')
        );
      }
      
      if (filters.supplierId) {
        allPurchases = allPurchases.filter(p => 
          p.supplier?.id === filters.supplierId
        );
      }
      
      setPurchases(allPurchases);
    } catch (error) {
      message.error('Failed to fetch purchases');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchSuppliers();
    if (filters.startDate || filters.endDate || filters.supplierId) {
      fetchFilteredPurchases();
    } else {
      fetchAllPurchases();
    }
  }, [fetchAllPurchases, fetchFilteredPurchases, filters]);

  // Process data for the report
  const processReportData = () => {
    const supplierMap = {};
    
    purchases.forEach(purchase => {
      const supplierId = purchase.supplier?.id;
      const supplierName = purchase.supplier?.companyName || 'Unknown Supplier';
      
      if (!supplierMap[supplierId]) {
        supplierMap[supplierId] = {
          supplierId,
          supplierName,
          purchaseCount: 0,
          totalAmount: 0,
          purchaseDates: []
        };
      }
      
      supplierMap[supplierId].purchaseCount += 1;
      supplierMap[supplierId].totalAmount += purchase.totalAmount || 0;
      supplierMap[supplierId].purchaseDates.push(purchase.orderDate);
    });
    
    // Convert to array and add date info
    return Object.values(supplierMap).map(supplier => ({
      ...supplier,
      firstPurchaseDate: supplier.purchaseDates.length > 0 
        ? new Date(Math.min(...supplier.purchaseDates.map(d => new Date(d)))) 
        : null,
      lastPurchaseDate: supplier.purchaseDates.length > 0 
        ? new Date(Math.max(...supplier.purchaseDates.map(d => new Date(d)))) 
        : null
    }));
  };

  const reportData = processReportData();

  // Process data for charts
  const monthlyData = purchases.reduce((acc, purchase) => {
    const month = dayjs(purchase.orderDate).format('MMM YYYY');
    if (!acc[month]) {
      acc[month] = { month, count: 0, amount: 0 };
    }
    acc[month].count++;
    acc[month].amount += purchase.totalAmount;
    return acc;
  }, {});

  const chartData = Object.values(monthlyData).sort((a, b) => 
    dayjs(a.month, 'MMM YYYY') - dayjs(b.month, 'MMM YYYY')
  );

  const statusData = purchases.reduce((acc, purchase) => {
    acc[purchase.status] = (acc[purchase.status] || 0) + 1;
    return acc;
  }, {});

  const topSuppliers = [...reportData]
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 5);

  const recentPurchases = [...purchases]
    .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
    .slice(0, 5);

  const supplierPerformanceMetrics = reportData.map(supplier => {
    const avgOrderValue = supplier.totalAmount / supplier.purchaseCount;
    const daysBetweenOrders = supplier.purchaseCount > 1 
      ? (new Date(supplier.lastPurchaseDate) - new Date(supplier.firstPurchaseDate)) / 
        (1000 * 60 * 60 * 24 * (supplier.purchaseCount - 1))
      : null;

    return {
      ...supplier,
      avgOrderValue,
      daysBetweenOrders
    };
  });

  const inventoryImpact = purchases.flatMap(purchase => 
    purchase.items?.map(item => ({
      product: item.product?.name || 'Unknown',
      quantity: item.quantity,
      supplier: purchase.supplier?.companyName || 'Unknown',
      date: purchase.orderDate
    })) || []
  ).reduce((acc, item) => {
    if (!acc[item.product]) {
      acc[item.product] = { product: item.product, quantity: 0, suppliers: new Set() };
    }
    acc[item.product].quantity += item.quantity;
    acc[item.product].suppliers.add(item.supplier);
    return acc;
  }, {});

  const handleDateChange = (dates) => {
    setFilters({
      ...filters,
      startDate: dates ? dates[0] : null,
      endDate: dates ? dates[1] : null
    });
  };

  const handleSupplierChange = (value) => {
    setFilters({
      ...filters,
      supplierId: value
    });
  };

  const handleResetFilters = () => {
    setFilters({
      startDate: null,
      endDate: null,
      supplierId: null
    });
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(reportData.map(item => ({
      'Supplier': item.supplierName,
      'Purchase Count': item.purchaseCount,
      'Total Amount (KES)': item.totalAmount,
      'First Purchase': item.firstPurchaseDate 
        ? dayjs(item.firstPurchaseDate).format('DD MMM YYYY') 
        : '-',
      'Last Purchase': item.lastPurchaseDate 
        ? dayjs(item.lastPurchaseDate).format('DD MMM YYYY') 
        : '-'
    })));
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Supplier Purchases");
    XLSX.writeFile(workbook, "Supplier_Purchases_Report.xlsx");
  };

  const getStatusTag = (status) => {
    const statusMap = {
      'PENDING': { color: 'orange', text: 'Pending' },
      'RECEIVED': { color: 'green', text: 'Received' },
      'CANCELLED': { color: 'red', text: 'Cancelled' },
      default: { color: 'default', text: status }
    };
    
    const statusInfo = statusMap[status] || statusMap.default;
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };

  const columns = [
    {
      title: 'Supplier',
      dataIndex: 'supplierName',
      key: 'supplierName',
      render: (text) => <Text strong>{text}</Text>,
      sorter: (a, b) => a.supplierName.localeCompare(b.supplierName)
    },
    {
      title: 'Purchases',
      dataIndex: 'purchaseCount',
      key: 'purchaseCount',
      render: (count) => (
        <Badge 
          count={count} 
          style={{ backgroundColor: '#1890ff' }} 
        />
      ),
      sorter: (a, b) => a.purchaseCount - b.purchaseCount,
    },
    {
      title: 'Total Amount (KES)',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => (
        <Text strong style={{ color: '#52c41a' }}>
          {amount?.toLocaleString('en-KE', { 
            style: 'currency', 
            currency: 'KES',
            minimumFractionDigits: 2 
          })}
        </Text>
      ),
      sorter: (a, b) => a.totalAmount - b.totalAmount,
    },
    {
      title: 'First Purchase',
      dataIndex: 'firstPurchaseDate',
      key: 'firstPurchaseDate',
      render: (date) => date ? dayjs(date).format('DD MMM YYYY') : '-',
      sorter: (a, b) => new Date(a.firstPurchaseDate) - new Date(b.firstPurchaseDate),
    },
    {
      title: 'Last Purchase',
      dataIndex: 'lastPurchaseDate',
      key: 'lastPurchaseDate',
      render: (date) => date ? dayjs(date).format('DD MMM YYYY') : '-',
      sorter: (a, b) => new Date(a.lastPurchaseDate) - new Date(b.lastPurchaseDate),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button 
          type="link" 
          icon={<EyeOutlined />} 
          onClick={() => {
            // You can implement a modal or navigate to detailed view
            message.info(`Showing purchases for ${record.supplierName}`);
          }}
        />
      ),
    }
  ];

  const summaryData = reportData.reduce((acc, item) => {
    acc.totalSuppliers += 1;
    acc.totalPurchases += item.purchaseCount || 0;
    acc.totalAmount += item.totalAmount || 0;
    return acc;
  }, { totalSuppliers: 0, totalPurchases: 0, totalAmount: 0 });

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Supplier Purchases Report</Title>
      <Text type="secondary">
        Analyze purchases made from suppliers with date range filtering
      </Text>

      <Card 
        style={{ marginTop: '20px', marginBottom: '20px' }}
        bodyStyle={{ padding: '16px' }}
      >
        <Row gutter={16} align="middle">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Filter by Supplier"
              style={{ width: '100%' }}
              allowClear
              onChange={handleSupplierChange}
              value={filters.supplierId}
            >
              {suppliers.map(supplier => (
                <Option key={supplier.id} value={supplier.id}>
                  {supplier.companyName}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <RangePicker
              style={{ width: '100%' }}
              onChange={handleDateChange}
              value={[
                filters.startDate ? dayjs(filters.startDate) : null,
                filters.endDate ? dayjs(filters.endDate) : null
              ]}
              disabledDate={current => current && current > dayjs().endOf('day')}
            />
          </Col>
          <Col xs={24} sm={24} md={8} lg={12} style={{ textAlign: 'right' }}>
            <Space>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={handleResetFilters}
              >
                Reset
              </Button>
              <Button 
                icon={<FilterOutlined />} 
                type="primary" 
                onClick={fetchFilteredPurchases}
              >
                Apply Filters
              </Button>
              <Button 
                icon={<DownloadOutlined />} 
                onClick={exportToExcel}
              >
                Export
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={16} style={{ marginBottom: '16px' }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Suppliers"
              value={summaryData.totalSuppliers}
              precision={0}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Purchases"
              value={summaryData.totalPurchases}
              precision={0}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Amount"
              value={summaryData.totalAmount}
              precision={2}
              prefix="KES"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Visualizations Row 1 */}
      <Row gutter={16} style={{ marginBottom: '16px' }}>
        <Col span={12}>
          <Card title="Monthly Purchase Trends">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value, name) => 
                    name === 'count' ? [value, 'Purchase Count'] : [`KES ${value.toLocaleString()}`, 'Total Amount']
                  }
                />
                <Area 
                  yAxisId="left"
                  type="monotone"
                  dataKey="count"
                  name="Purchase Count"
                  stroke="#8884d8"
                  fill="#8884d8"
                />
                <Area 
                  yAxisId="right"
                  type="monotone"
                  dataKey="amount"
                  name="Total Amount"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Purchase Status Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(statusData).map(([name, value]) => ({ name, value }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Object.entries(statusData).map(([name], index) => (
                    <Cell key={`cell-${index}`} fill={getStatusTag(name).props.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Visualizations Row 2 */}
      <Row gutter={16} style={{ marginBottom: '16px' }}>
        <Col span={12}>
          <Card title="Top 5 Suppliers by Spend">
            {topSuppliers.map((supplier, index) => (
              <div key={supplier.supplierId} style={{ marginBottom: 8 }}>
                <Text strong>{index + 1}. {supplier.supplierName}</Text>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>{supplier.purchaseCount} purchases</Text>
                  <Text strong style={{ color: '#52c41a' }}>
                    KES {supplier.totalAmount.toLocaleString()}
                  </Text>
                </div>
                <Progress 
                  percent={(supplier.totalAmount / summaryData.totalAmount) * 100}
                  showInfo={false}
                  strokeColor="#52c41a"
                />
              </div>
            ))}
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Supplier Performance Metrics">
            <Table
              dataSource={supplierPerformanceMetrics}
              rowKey="supplierId"
              pagination={false}
              columns={[
                {
                  title: 'Supplier',
                  dataIndex: 'supplierName',
                },
                {
                  title: 'Avg Order Value',
                  dataIndex: 'avgOrderValue',
                  render: (value) => `KES ${value.toFixed(2)}`,
                  sorter: (a, b) => a.avgOrderValue - b.avgOrderValue,
                },
                {
                  title: 'Days Between Orders',
                  dataIndex: 'daysBetweenOrders',
                  render: (value) => value ? `${value.toFixed(1)} days` : 'N/A',
                  sorter: (a, b) => (a.daysBetweenOrders || 0) - (b.daysBetweenOrders || 0),
                },
                {
                  title: 'Order Frequency',
                  render: (_, record) => {
                    if (!record.daysBetweenOrders) return 'N/A';
                    return record.daysBetweenOrders <= 7 ? 'Weekly+' : 
                           record.daysBetweenOrders <= 30 ? 'Monthly' : 'Quarterly';
                  },
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Purchases Table */}
      <Card title="Recent Purchases" style={{ marginBottom: '16px' }}>
        <Table
          dataSource={recentPurchases}
          rowKey="id"
          pagination={false}
          columns={[
            {
              title: 'PO Number',
              dataIndex: 'id',
              render: (id) => `PO-${id}`,
            },
            {
              title: 'Supplier',
              dataIndex: ['supplier', 'companyName'],
            },
            {
              title: 'Date',
              dataIndex: 'orderDate',
              render: (date) => dayjs(date).format('DD MMM YYYY'),
            },
            {
              title: 'Amount',
              dataIndex: 'totalAmount',
              render: (amount) => (
                <Text strong>KES {amount.toLocaleString()}</Text>
              ),
            },
            {
              title: 'Status',
              dataIndex: 'status',
              render: (status) => getStatusTag(status),
            },
          ]}
        />
      </Card>

      {/* Inventory Impact Table */}
      <Card title="Inventory Impact">
        <Table
          dataSource={Object.values(inventoryImpact).map(item => ({
            ...item,
            suppliers: [...item.suppliers].join(', ')
          }))}
          rowKey="product"
          pagination={false}
          columns={[
            {
              title: 'Product',
              dataIndex: 'product',
            },
            {
              title: 'Total Quantity',
              dataIndex: 'quantity',
            },
            {
              title: 'Suppliers',
              dataIndex: 'suppliers',
              ellipsis: true,
            },
          ]}
        />
      </Card>

      {/* Main Supplier Purchases Table */}
      <Card style={{ marginTop: '16px' }}>
        <Table
          columns={columns}
          dataSource={reportData}
          rowKey="supplierId"
          loading={loading}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} suppliers`
          }}
          scroll={{ x: 'max-content' }}
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0}>
                  <Text strong>Total</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                  <Badge count={summaryData.totalPurchases} style={{ backgroundColor: '#1890ff' }} />
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2}>
                  <Text strong style={{ color: '#52c41a' }}>
                    {summaryData.totalAmount?.toLocaleString('en-KE', { 
                      style: 'currency', 
                      currency: 'KES',
                      minimumFractionDigits: 2 
                    })}
                  </Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3} colSpan={3} />
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </Card>

      <Divider />

      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <Text type="secondary">
          Report generated on {dayjs().format('MMMM D, YYYY h:mm A')}
        </Text>
      </div>
    </div>
  );
};

export default SupplierPurchasesReport;