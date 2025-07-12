import { useState, useEffect, useMemo } from 'react';
import { Table, Button, Statistic, Tag, message, Card, Row, Col } from 'antd';
import { Download } from 'lucide-react';
import { InventoryService } from '../../services/InventoryService';
import { getAllProducts } from '../../services/productServices';
import { getAllCategories } from '../../services/categories';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const InventoryValuationReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [categories, setCategories] = useState([]);
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
      dataIndex: 'currentStock', 
      key: 'quantity',
      width: 100,
      render: (val) => <span className="font-medium">{val || 0}</span>,
      sorter: (a, b) => (a.currentStock || 0) - (b.currentStock || 0)
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
      render: status => {
        let color = 'green';
        if (status === 'OUT OF STOCK') color = 'red';
        else if (status === 'LOW') color = 'orange';
        else if (status === 'MEDIUM') color = 'blue';
        return <Tag color={color} className="font-medium">{status || 'N/A'}</Tag>;
      },
      filters: [
        { text: 'HIGH', value: 'HIGH' },
        { text: 'MEDIUM', value: 'MEDIUM' },
        { text: 'LOW', value: 'LOW' },
        { text: 'OUT OF STOCK', value: 'OUT OF STOCK' },
      ],
      onFilter: (value, record) => record.stockStatus === value,
    },
  ], []);

  const fetchCategories = async () => {
    try {
      const categoriesData = await getAllCategories();
      setCategories(categoriesData);
      return categoriesData;
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
      const [categoriesData, products] = await Promise.all([
        fetchCategories(),
        getAllProducts()
      ]);

      // Get inventory status for all products at once if possible
      const inventoryStatus = await InventoryService.getInventoryStatus();
      
      const processedData = products.map(product => {
        // Find inventory item for this product
        const inventoryItem = Array.isArray(inventoryStatus) 
          ? inventoryStatus.find(item => item.productId === product.id) 
          : null;

        // Use inventory quantity if available, otherwise fall back to product quantity
        const currentStock = inventoryItem?.quantity ?? product.quantityInStock ?? 0;
        const reorderLevel = product.lowStockThreshold || 0;
        const unitCost = product.costPrice || 0;
        const totalValue = unitCost * currentStock;
        const stockStatus = getStockStatus(currentStock, reorderLevel);
        
        // Find category name
        const productCategory = categoriesData.find(cat => cat.id === product.categoryId);
        const categoryName = productCategory?.name || product.category?.name || 'Uncategorized';
        
        return {
          ...product,
          ...inventoryItem,
          id: product.id,
          sku: product.sku,
          name: product.name,
          currentStock,
          totalValue,
          stockStatus,
          categoryName,
          costPrice: unitCost,
          lowStockThreshold: reorderLevel
        };
      });

      setData(processedData);
      calculateSummary(processedData);
      updateCategoryFilters(processedData);
      
    } catch (error) {
      console.error('Error fetching inventory report:', error);
      message.error(`Failed to load inventory report: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (inventoryData) => {
    const totalValue = inventoryData.reduce((sum, item) => sum + (item.totalValue || 0), 0);
    const lowStockItems = inventoryData.filter(item => 
      item.stockStatus === 'LOW' || item.stockStatus === 'MEDIUM'
    ).length;
    const outOfStockItems = inventoryData.filter(item => 
      item.stockStatus === 'OUT OF STOCK'
    ).length;

    setSummaryData({
      totalValue,
      totalItems: inventoryData.length,
      lowStockItems,
      outOfStockItems
    });
  };

  const updateCategoryFilters = (inventoryData) => {
    const uniqueCategories = [...new Set(inventoryData.map(item => item.categoryName))];
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
      // Note: In a real component, you would setColumns(updatedColumns) if columns were state
    }
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/reports/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reportType: 'INVENTORY',
          format: 'CSV',
          data: data.map(item => ({
            sku: item.sku,
            name: item.name,
            category: item.categoryName,
            currentStock: item.currentStock,
            unitCost: item.costPrice,
            totalValue: item.totalValue,
            reorderLevel: item.lowStockThreshold,
            status: item.stockStatus
          }))
        })
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `inventory-valuation-${new Date().toISOString().split('T')[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      message.success('Export started successfully');
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
          className="bg-blue-600 hover:bg-blue-700 border-blue-600 text-white w-full md:w-auto"
        >
          <span className="hidden md:inline">Export Report</span>
          <span className="md:hidden">Export</span>
        </Button>
      </div>
      
      {/* Summary Cards */}
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
      
      {/* Inventory Table */}
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
            showTotal: (total) => `Total ${total} items`,
            responsive: true
          }}
          size="small"
          className="responsive-table"
        />
      </Card>
    </div>
  );
};

export default InventoryValuationReport;