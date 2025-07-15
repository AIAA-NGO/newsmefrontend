import { useState, useEffect, useMemo } from 'react';
import { Table, Button, Statistic, Tag, message, Card, Row, Col, Spin } from 'antd';
import { Download } from 'lucide-react';
import { InventoryService } from '../../services/InventoryService';
import { getAllProducts } from '../../services/productServices';
import { getAllCategories } from '../../services/categories';

const InventoryValuationReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [summaryData, setSummaryData] = useState({
    totalValue: 0,
    totalItems: 0,
    lowStockItems: 0,
    outOfStockItems: 0
  });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value || 0);
  };

  const columns = useMemo(() => [
    { 
      title: 'SKU', 
      dataIndex: 'sku', 
      key: 'sku',
      width: 120,
      fixed: 'left',
      sorter: (a, b) => a.sku?.localeCompare(b.sku || ''),
      responsive: ['md']
    },
    { 
      title: 'Product Name', 
      dataIndex: 'name', 
      key: 'name',
      fixed: 'left',
      sorter: (a, b) => a.name?.localeCompare(b.name || '')
    },
    { 
      title: 'Category', 
      dataIndex: 'categoryName', 
      key: 'category',
      width: 150,
      filters: [],
      onFilter: (value, record) => record.categoryName === value,
      sorter: (a, b) => a.categoryName?.localeCompare(b.categoryName || ''),
      responsive: ['md']
    },
    { 
      title: 'Stock', 
      dataIndex: 'quantityInStock', 
      key: 'quantity',
      width: 100,
      render: (val) => <span className="font-medium">{val || 0}</span>,
      sorter: (a, b) => (a.quantityInStock || 0) - (b.quantityInStock || 0)
    },
    { 
      title: 'Unit Cost', 
      dataIndex: 'costPrice', 
      key: 'unitCost', 
      render: val => formatCurrency(val || 0),
      width: 120,
      sorter: (a, b) => (a.costPrice || 0) - (b.costPrice || 0),
      responsive: ['lg']
    },
    { 
      title: 'Total Value', 
      dataIndex: 'totalValue', 
      key: 'totalValue', 
      render: val => formatCurrency(val || 0),
      width: 140,
      sorter: (a, b) => (a.totalValue || 0) - (b.totalValue || 0)
    },
    { 
      title: 'Reorder Level', 
      dataIndex: 'lowStockThreshold', 
      key: 'reorderLevel',
      width: 100,
      render: val => <span className="font-medium">{val || 0}</span>,
      responsive: ['lg']
    },
    { 
      title: 'Status', 
      dataIndex: 'stockStatus', 
      key: 'status',
      width: 120,
      render: (status, record) => {
        const currentStatus = getStockStatus(
          record.quantityInStock,
          record.lowStockThreshold
        );
        let color = 'green';
        if (currentStatus === 'OUT OF STOCK') color = 'red';
        else if (currentStatus === 'LOW') color = 'orange';
        else if (currentStatus === 'MEDIUM') color = 'blue';
        return <Tag color={color} className="font-medium">{currentStatus || 'N/A'}</Tag>;
      },
      filters: [
        { text: 'HIGH', value: 'HIGH' },
        { text: 'MEDIUM', value: 'MEDIUM' },
        { text: 'LOW', value: 'LOW' },
        { text: 'OUT OF STOCK', value: 'OUT OF STOCK' },
      ],
      onFilter: (value, record) => 
        getStockStatus(record.quantityInStock, record.lowStockThreshold) === value,
    },
  ], []);

  const fetchCategories = async () => {
    try {
      const categoriesData = await getAllCategories();
      return Array.isArray(categoriesData?.content) 
        ? categoriesData.content 
        : Array.isArray(categoriesData)
          ? categoriesData
          : [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      message.error('Failed to load categories');
      return [];
    }
  };

  const getStockStatus = (currentStock, reorderLevel) => {
    if (currentStock === 0) return 'OUT OF STOCK';
    if (currentStock <= reorderLevel * 0.5) return 'LOW';
    if (currentStock <= reorderLevel) return 'MEDIUM';
    return 'HIGH';
  };

  const fetchInventoryReport = async () => {
    setLoading(true);
    try {
      const [categoriesData, productsResponse] = await Promise.all([
        fetchCategories(),
        getAllProducts()
      ]);

      // Extract products array from response
      const products = Array.isArray(productsResponse?.content) 
        ? productsResponse.content 
        : Array.isArray(productsResponse)
          ? productsResponse
          : [];

      console.log('Products data:', products); // Debug log

      const processedData = products.map(product => {
        const totalValue = (product.costPrice || 0) * (product.quantityInStock || 0);
        const stockStatus = getStockStatus(
          product.quantityInStock,
          product.lowStockThreshold
        );
        
        return {
          ...product,
          id: product.id,
          sku: product.sku || '',
          name: product.name || 'Unknown Product',
          quantityInStock: product.quantityInStock || 0,
          totalValue,
          stockStatus,
          categoryName: product.categoryName || 'Uncategorized',
          costPrice: product.costPrice || 0,
          lowStockThreshold: product.lowStockThreshold || 0
        };
      });

      console.log('Processed data:', processedData); // Debug log

      setData(processedData);
      calculateSummary(processedData);
      updateCategoryFilters(processedData);
    } catch (error) {
      console.error('Error fetching inventory report:', error);
      message.error(`Failed to load inventory report: ${error.message}`);
      setData([]);
      setSummaryData({
        totalValue: 0,
        totalItems: 0,
        lowStockItems: 0,
        outOfStockItems: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (inventoryData) => {
    const totalValue = inventoryData.reduce((sum, item) => sum + (item.totalValue || 0), 0);
    const lowStockItems = inventoryData.filter(item => {
      const status = getStockStatus(item.quantityInStock, item.lowStockThreshold);
      return status === 'LOW' || status === 'MEDIUM';
    }).length;
    const outOfStockItems = inventoryData.filter(item => {
      return getStockStatus(item.quantityInStock, item.lowStockThreshold) === 'OUT OF STOCK';
    }).length;

    setSummaryData({
      totalValue,
      totalItems: inventoryData.length,
      lowStockItems,
      outOfStockItems
    });
  };

  const updateCategoryFilters = (inventoryData) => {
    const uniqueCategories = [...new Set(inventoryData.map(item => item.categoryName))].filter(Boolean);
    const categoryColumnIndex = columns.findIndex(col => col.key === 'category');
    if (categoryColumnIndex >= 0) {
      const updatedColumns = [...columns];
      updatedColumns[categoryColumnIndex] = {
        ...updatedColumns[categoryColumnIndex],
        filters: uniqueCategories.map(category => ({
          text: category,
          value: category
        }))
      };
    }
  };

  const handleExport = async () => {
    if (data.length === 0) {
      message.warning('No data available to export');
      return;
    }

    setExportLoading(true);
    try {
      const headers = columns.map(col => col.title);
      const rows = data.map(item => ({
        SKU: item.sku || '',
        'Product Name': item.name || '',
        Category: item.categoryName || '',
        Stock: item.quantityInStock || 0,
        'Unit Cost': item.costPrice || 0,
        'Total Value': item.totalValue || 0,
        'Reorder Level': item.lowStockThreshold || 0,
        Status: getStockStatus(item.quantityInStock, item.lowStockThreshold) || ''
      }));

      const csvContent = [
        headers.join(','),
        ...rows.map(row => Object.values(row).map(val => 
          `"${String(val).replace(/"/g, '""')}"`
        ).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `inventory-valuation-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      message.success('Export completed successfully');
    } catch (error) {
      console.error('Export error:', error);
      message.error(`Failed to export report: ${error.message}`);
    } finally {
      setExportLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryReport();
  }, []);

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6 gap-4">
        <h1 className="text-xl md:text-2xl font-bold">Inventory Valuation Report</h1>
        <Button 
          type="primary" 
          icon={<Download size={16} />} 
          onClick={handleExport}
          loading={exportLoading}
          disabled={data.length === 0}
          className="bg-blue-600 hover:bg-blue-700 border-blue-600 text-white w-full md:w-auto"
        >
          Export Report
        </Button>
      </div>
      
      <Row gutter={[16, 16]} className="mb-4 md:mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="Total Value" 
              value={formatCurrency(summaryData.totalValue)}
              valueStyle={{ fontSize: '18px', fontWeight: 'bold', color: '#1d4ed8' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="Total Items" 
              value={summaryData.totalItems}
              valueStyle={{ fontSize: '18px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="Low/Medium Stock" 
              value={summaryData.lowStockItems}
              valueStyle={{ fontSize: '18px', fontWeight: 'bold', color: '#ea580c' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="Out of Stock" 
              value={summaryData.outOfStockItems}
              valueStyle={{ fontSize: '18px', fontWeight: 'bold', color: '#dc2626' }}
            />
          </Card>
        </Col>
      </Row>
      
      <Card>
        <Table 
          columns={columns} 
          dataSource={data} 
          loading={loading}
          rowKey="id"
          scroll={{ x: true }}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total) => `Total ${total} items`
          }}
          size="small"
          locale={{
            emptyText: loading ? <Spin size="large" /> : 'No inventory data available'
          }}
        />
      </Card>
    </div>
  );
};

export default InventoryValuationReport;