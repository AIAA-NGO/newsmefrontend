import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Space 
} from 'antd';
import { 
  getPurchaseById, 
  updatePurchase 
} from '../../services/purchaseService';
import { 
  getSuppliers as getAllSuppliers 
} from '../../services/supplierService';
import { 
  getAllProducts 
} from '../../services/productServices';
import { 
  PlusOutlined, 
  MinusOutlined,
  ArrowLeftOutlined,
  SaveOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const { Title } = Typography;

const EditPurchase = () => {
  const [form] = Form.useForm();
  const { id } = useParams();
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [purchase, setPurchase] = useState(null);

  useEffect(() => {
    fetchPurchase();
    fetchSuppliers();
    fetchProducts();
  }, [id]);

  const fetchPurchase = async () => {
    setLoading(true);
    try {
      const data = await getPurchaseById(id);
      setPurchase(data);
      setItems(data.items || []);
      
      form.setFieldsValue({
        supplierId: data.supplier?.id,
        orderDate: data.orderDate ? dayjs(data.orderDate) : null
      });
    } catch (error) {
      message.error(error.message);
      navigate('/purchases');
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const data = await getAllSuppliers();
      setSuppliers(data);
    } catch (error) {
      message.error('Failed to fetch suppliers');
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await getAllProducts();
      setProducts(data);
    } catch (error) {
      message.error('Failed to fetch products');
    }
  };

  const handleAddItem = () => {
    setItems([...items, { 
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
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (items.length === 0) {
        message.error('Please add at least one item');
        return;
      }

      if (items.some(item => !item.productId)) {
        message.error('Please select a product for all items');
        return;
      }
      
      const purchaseData = {
        supplierId: values.supplierId,
        orderDate: values.orderDate ? values.orderDate.toISOString() : new Date().toISOString(),
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        }))
      };
      
      setLoading(true);
      await updatePurchase(id, purchaseData);
      message.success('Purchase order updated successfully');
      navigate(`/purchases/${id}`);
    } catch (error) {
      console.error('Update error:', error);
      message.error(error.response?.data?.message || error.message || 'Failed to update purchase');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/purchases');
  };

  if (!purchase) return <div style={{ textAlign: 'center', padding: '24px' }}>Loading purchase data...</div>;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={handleCancel}
          style={{ marginBottom: 16 }}
        >
          Back to Purchases
        </Button>

        <Title level={3} style={{ marginBottom: 24 }}>
          Edit Purchase Order #{purchase.id.toString().padStart(5, '0')}
        </Title>

        <Form form={form} layout="vertical">
          <Card title="Basic Information" style={{ marginBottom: 24 }}>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="supplierId"
                  label="Supplier"
                  rules={[{ required: true, message: 'Please select a supplier' }]}
                >
                  <Select 
                    placeholder="Select supplier" 
                    showSearch 
                    optionFilterProp="children"
                    disabled={loading}
                  >
                    {suppliers.map(supplier => (
                      <Option key={supplier.id} value={supplier.id}>
                        {supplier.companyName}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="orderDate"
                  label="Order Date"
                  rules={[{ required: true, message: 'Please select order date' }]}
                >
                  <DatePicker 
                    showTime 
                    format="YYYY-MM-DD HH:mm" 
                    style={{ width: '100%' }} 
                    disabled={loading}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card 
            title={
              <Space>
                <span>Items</span>
                <Button
                  type="dashed"
                  onClick={handleAddItem}
                  icon={<PlusOutlined />}
                  size="small"
                  disabled={loading}
                >
                  Add Item
                </Button>
              </Space>
            } 
            style={{ marginBottom: 24 }}
          >
            <Table
              dataSource={items}
              rowKey={(record, index) => index}
              pagination={false}
              loading={loading}
              columns={[
                {
                  title: 'Product',
                  dataIndex: 'productId',
                  render: (value, _, index) => (
                    <Select
                      placeholder="Select product"
                      value={value}
                      style={{ width: '100%' }}
                      onChange={(val) => handleItemChange(index, 'productId', val)}
                      disabled={loading}
                    >
                      {products.map(product => (
                        <Option key={product.id} value={product.id}>
                          {product.name}
                        </Option>
                      ))}
                    </Select>
                  ),
                },
                {
                  title: 'Quantity',
                  dataIndex: 'quantity',
                  width: 120,
                  render: (value, _, index) => (
                    <InputNumber
                      min={1}
                      value={value}
                      onChange={(val) => handleItemChange(index, 'quantity', val)}
                      disabled={loading}
                      style={{ width: '100%' }}
                    />
                  ),
                },
                {
                  title: 'Unit Price (KES)',
                  dataIndex: 'unitPrice',
                  width: 150,
                  render: (value, _, index) => (
                    <InputNumber
                      min={0}
                      step={0.01}
                      value={value}
                      onChange={(val) => handleItemChange(index, 'unitPrice', val)}
                      formatter={(value) => `KES ${value}`}
                      parser={(value) => value.replace(/KES\s?|(,*)/g, '')}
                      disabled={loading}
                      style={{ width: '100%' }}
                    />
                  ),
                },
                {
                  title: 'Action',
                  width: 80,
                  render: (_, __, index) => (
                    <Button
                      danger
                      type="text"
                      icon={<MinusOutlined />}
                      onClick={() => handleRemoveItem(index)}
                      disabled={loading}
                    />
                  ),
                },
              ]}
              scroll={{ x: true }}
            />
          </Card>

          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Space>
              <Button 
                onClick={handleCancel}
                disabled={loading}
                style={{ minWidth: 100 }}
              >
                Cancel
              </Button>
              <Button 
                type="primary" 
                onClick={handleSubmit} 
                loading={loading}
                icon={<SaveOutlined />}
                style={{ 
                  minWidth: 150,
                  background: '#1890ff',
                  borderColor: '#1890ff',
                  fontWeight: 500
                }}
              >
                Update Purchase
              </Button>
            </Space>
          </div>
        </Form>
      </Space>
    </div>
  );
};

export default EditPurchase;