import { useState, useEffect } from 'react';
import { 
  Form, 
  Button, 
  Select, 
  Table, 
  message, 
  Card, 
  Row, 
  Col, 
  InputNumber, 
  DatePicker,
  Typography,
  Divider,
  Space,
  Statistic,
  ConfigProvider,
  Spin
} from 'antd';
import { createPurchase } from '../../services/purchaseService';
import { getSuppliers } from '../../services/supplierService';
import { getAllProducts } from '../../services/productServices';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const CreatePurchase = () => {
  const [form] = Form.useForm();
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingProducts, setFetchingProducts] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    fetchSuppliers();
    fetchProducts();
  }, []);

  useEffect(() => {
    const total = items.reduce((sum, item) => {
      return sum + ((item.quantity || 0) * (item.unitPrice || 0));
    }, 0);
    setTotalAmount(total);
  }, [items]);

  const fetchSuppliers = async () => {
    try {
      const data = await getSuppliers();
      setSuppliers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
      message.error('Failed to fetch suppliers');
    }
  };

  const fetchProducts = async () => {
    setFetchingProducts(true);
    try {
      const data = await getAllProducts();
      if (!Array.isArray(data)) {
        throw new Error('Products data is not an array');
      }
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      message.error('Failed to fetch products');
      setProducts([]);
    } finally {
      setFetchingProducts(false);
    }
  };

  const handleAddItem = () => {
    setItems([...items, { 
      id: Date.now(),
      productId: null, 
      quantity: 1, 
      unitPrice: 0 
    }]);
  };

  const handleRemoveItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2
    }).format(value);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (items.length === 0) {
        message.error('Please add at least one item');
        return;
      }
      
      // Validate all items have product selected
      const invalidItems = items.filter(item => !item.productId);
      if (invalidItems.length > 0) {
        message.error('Please select a product for all items');
        return;
      }
      
      const purchaseData = {
        supplierId: values.supplierId,
        orderDate: values.orderDate.format('YYYY-MM-DDTHH:mm:ss'),
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        totalAmount: totalAmount
      };
      
      setLoading(true);
      const result = await createPurchase(purchaseData);
      message.success('Purchase created successfully');
      form.resetFields();
      setItems([]);
      setTotalAmount(0);
    } catch (error) {
      console.error('Failed to create purchase:', error);
      message.error(error.message || 'Failed to create purchase');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#52c41a',
          colorText: '#000000',
        },
      }}
    >
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <Title level={2}>Create New Purchase</Title>
        
        <Card>
          <Form form={form} layout="vertical">
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  name="supplierId"
                  label="Supplier"
                  rules={[{ required: true, message: 'Please select a supplier' }]}
                >
                  <Select 
                    placeholder="Select supplier" 
                    showSearch 
                    optionFilterProp="children"
                    style={{ width: '100%' }}
                    loading={!suppliers.length}
                  >
                    {suppliers.map(supplier => (
                      <Option key={supplier.id} value={supplier.id}>
                        {supplier.companyName}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="orderDate"
                  label="Order Date"
                  rules={[{ required: true, message: 'Please select order date' }]}
                >
                  <DatePicker 
                    showTime 
                    format="YYYY-MM-DD HH:mm" 
                    style={{ width: '100%' }} 
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">Items</Divider>
            
            <Spin spinning={fetchingProducts} tip="Loading products...">
              <Table
                dataSource={items}
                rowKey="id"
                pagination={false}
                columns={[
                  {
                    title: 'Product',
                    dataIndex: 'productId',
                    render: (value, _, index) => (
                      <Select
                        placeholder={fetchingProducts ? "Loading products..." : "Select product"}
                        value={value}
                        style={{ width: '100%' }}
                        onChange={(val) => handleItemChange(index, 'productId', val)}
                        showSearch
                        optionFilterProp="children"
                        loading={fetchingProducts}
                        notFoundContent={fetchingProducts ? null : "No products found"}
                      >
                        {products.map(product => (
                          <Option key={product.id} value={product.id}>
                            {product.name} ({product.sku})
                          </Option>
                        ))}
                      </Select>
                    ),
                    align: 'center'
                  },
                  {
                    title: 'Quantity',
                    dataIndex: 'quantity',
                    render: (value, _, index) => (
                      <InputNumber
                        min={1}
                        value={value}
                        onChange={(val) => handleItemChange(index, 'quantity', val)}
                        style={{ width: '100%' }}
                      />
                    ),
                    width: '15%'
                  },
                  {
                    title: 'Unit Price (KSH)',
                    dataIndex: 'unitPrice',
                    render: (value, _, index) => (
                      <InputNumber
                        min={0}
                        value={value}
                        onChange={(val) => handleItemChange(index, 'unitPrice', val)}
                        style={{ width: '100%' }}
                        formatter={value => `KSh ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value.replace(/KSh\s?|(,*)/g, '')}
                      />
                    ),
                    width: '20%'
                  },
                  {
                    title: 'Total (KSH)',
                    render: (_, record) => (
                      <Text>{formatCurrency((record.quantity || 0) * (record.unitPrice || 0))}</Text>
                    ),
                    align: 'right',
                    width: '20%'
                  },
                  {
                    title: 'Action',
                    render: (_, __, index) => (
                      <Button
                        danger
                        type="text"
                        icon={<MinusOutlined />}
                        onClick={() => handleRemoveItem(index)}
                      />
                    ),
                    width: '10%'
                  },
                ]}
                footer={() => (
                  <Button
                    type="dashed"
                    onClick={handleAddItem}
                    icon={<PlusOutlined />}
                    block
                  >
                    Add Item
                  </Button>
                )}
                locale={{
                  emptyText: 'No items added yet'
                }}
                style={{ width: '100%' }}
              />
            </Spin>

            <Divider />

            <div style={{ 
              backgroundColor: '#fafafa',
              padding: '16px',
              borderRadius: '4px',
              margin: '16px 0',
              textAlign: 'right'
            }}>
              <Statistic 
                title="Total Amount" 
                value={totalAmount} 
                precision={2}
                valueStyle={{ fontSize: '24px', fontWeight: 'bold' }}
                prefix="KSh"
                formatter={value => new Intl.NumberFormat('en-KE').format(value)}
              />
            </div>

            <div style={{ marginTop: 24, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => { form.resetFields(); setItems([]); setTotalAmount(0); }}>
                  Reset
                </Button>
                <Button 
                  type="primary" 
                  onClick={handleSubmit} 
                  loading={loading}
                  style={{ 
                    backgroundColor: '#52c41a',
                    borderColor: '#52c41a',
                    color: '#000000',
                    fontWeight: 'bold',
                    width: '150px'
                  }}
                >
                  Make Purchase
                </Button>
              </Space>
            </div>
          </Form>
        </Card>
      </div>
    </ConfigProvider>
  );
};

export default CreatePurchase;