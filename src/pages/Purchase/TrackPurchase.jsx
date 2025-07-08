import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllPurchases, deletePurchase, receivePurchase } from '../../services/purchaseService';
import { formatDate } from '../../components/utils/formatUtils';
import { Table, Button, Dropdown, Modal, message, Tag, Space, Card, Typography } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, MoreOutlined, CheckOutlined, TruckOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

// KES currency formatter with better styling
const formatCurrencyKES = (amount) => {
  if (amount === null || amount === undefined) return <Text type="secondary">KES 0.00</Text>;
  return (
    <Text strong>
      {new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount)}
    </Text>
  );
};

const PurchaseList = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isReceiving, setIsReceiving] = useState(false);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const data = await getAllPurchases();
      setPurchases(data);
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deletePurchase(selectedPurchase.id);
      message.success('Purchase order deleted successfully');
      fetchPurchases();
    } catch (error) {
      message.error(error.message);
    } finally {
      setIsDeleteModalVisible(false);
    }
  };

  const handleReceive = async (purchaseId) => {
    setIsReceiving(true);
    try {
      await receivePurchase(purchaseId);
      message.success('Order received and inventory updated!');
      fetchPurchases();
    } catch (error) {
      message.error(error.message || 'Failed to confirm receipt');
    } finally {
      setIsReceiving(false);
    }
  };

  const getStatusTag = (status) => {
    let color = '';
    let icon = null;
    
    switch (status) {
      case 'CANCELLED':
        color = 'red';
        icon = <DeleteOutlined />;
        break;
      case 'PENDING':
        color = 'orange';
        icon = <TruckOutlined />;
        break;
      case 'RECEIVED':
        color = 'green';
        icon = <CheckOutlined />;
        break;
      default:
        color = 'default';
    }
    
    return (
      <Tag 
        color={color} 
        icon={icon}
        style={{ 
          borderRadius: '12px',
          padding: '0 10px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        {status}
      </Tag>
    );
  };

  const columns = [
    {
      title: 'TRACKING #',
      dataIndex: 'id',
      key: 'id',
      render: (id) => (
        <Text strong style={{ fontFamily: 'monospace' }}>
          TRK-{id.toString().padStart(5, '0')}
        </Text>
      ),
      sorter: (a, b) => a.id - b.id,
      responsive: ['xs', 'sm'],
    },
    {
      title: 'SUPPLIER',
      dataIndex: ['supplier', 'companyName'],
      key: 'supplier',
      render: (text) => <Text strong>{text}</Text>,
      responsive: ['sm'],
    },
    {
      title: 'ORDER DATE',
      dataIndex: 'orderDate',
      key: 'orderDate',
      render: (date) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Text>{formatDate(date)}</Text>
          <Text type="secondary" style={{ fontSize: '0.75rem' }}>
            {new Date(date).toLocaleTimeString()}
          </Text>
        </div>
      ),
      sorter: (a, b) => new Date(a.orderDate) - new Date(b.orderDate),
      responsive: ['md'],
    },
    {
      title: 'DELIVERY DATE',
      dataIndex: 'receivedDate',
      key: 'receivedDate',
      render: (date) => date ? (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Text strong>{formatDate(date)}</Text>
          <Text type="success" style={{ fontSize: '0.75rem' }}>
            Delivered
          </Text>
        </div>
      ) : (
        <Tag color="default" style={{ borderRadius: '12px' }}>Pending</Tag>
      ),
      responsive: ['lg'],
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
      filters: [
        { text: 'CANCELLED', value: 'CANCELLED' },
        { text: 'PENDING', value: 'PENDING' },
        { text: 'RECEIVED', value: 'RECEIVED' },
      ],
      onFilter: (value, record) => record.status === value,
      responsive: ['xs', 'sm'],
    },
    {
      title: 'TOTAL',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => formatCurrencyKES(amount),
      sorter: (a, b) => a.totalAmount - b.totalAmount,
      responsive: ['md'],
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type={record.status === 'PENDING' ? 'primary' : 'default'}
            icon={<CheckOutlined />}
            onClick={() => record.status === 'PENDING' && handleReceive(record.id)}
            disabled={record.status !== 'PENDING'}
            loading={isReceiving && selectedPurchase?.id === record.id}
            size="small"
            style={{ 
              borderRadius: '6px',
              backgroundColor: record.status === 'PENDING' ? '#13c2c2' : '#f5f5f5',
              color: record.status === 'PENDING' ? '#fff' : 'rgba(0, 0, 0, 0.25)',
              border: record.status === 'PENDING' ? '1px solid #13c2c2' : 'none',
              fontWeight: 500
            }}
          >
            {record.status === 'PENDING' ? 'Confirm Receipt' : 'Received'}
          </Button>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'view',
                  label: (
                    <Link to={`/purchases/${record.id}`}>
                      <Space>
                        <EyeOutlined /> Order Details
                      </Space>
                    </Link>
                  ),
                },
                {
                  key: 'edit',
                  label: (
                    <Link to={`/purchases/edit/${record.id}`}>
                      <Space>
                        <EditOutlined /> Modify Order
                      </Space>
                    </Link>
                  ),
                  disabled: record.status === 'CANCELLED' || record.status === 'RECEIVED',
                },
                {
                  key: 'delete',
                  danger: true,
                  label: (
                    <Space onClick={() => {
                      setSelectedPurchase(record);
                      setIsDeleteModalVisible(true);
                    }}>
                      <DeleteOutlined /> Cancel Order
                    </Space>
                  ),
                },
              ],
            }}
            trigger={['click']}
          >
            <Button 
              type="text" 
              icon={<MoreOutlined />} 
              size="small" 
              style={{ borderRadius: '6px' }}
            />
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <Card 
      className="purchase-list" 
      style={{ 
        margin: '16px', 
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.09)'
      }}
      bodyStyle={{ padding: 0 }}
    >
      <div style={{ padding: '24px 24px 0' }}>
        <div className="page-header" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <Space size="middle">
            <TruckOutlined style={{ fontSize: '24px', color: '#13c2c2' }} />
            <Title level={3} style={{ margin: 0 }}>Order Tracking & Receiving</Title>
          </Space>
          <Link to="/purchases/create">
            <Button type="primary" size="large" style={{ borderRadius: '6px' }}>
              + New Purchase Order
            </Button>
          </Link>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={purchases}
        rowKey="id"
        loading={loading}
        pagination={{ 
          pageSize: 10,
          showSizeChanger: false,
          responsive: true,
          style: { marginRight: '24px' }
        }}
        scroll={{ x: true }}
        style={{ width: '100%' }}
        size="middle"
      />

      <Modal
        title={<Space><DeleteOutlined /> Confirm Order Cancellation</Space>}
        open={isDeleteModalVisible}
        onOk={handleDelete}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText="Confirm Cancellation"
        cancelText="Keep Order"
        okButtonProps={{ 
          danger: true,
          style: { borderRadius: '6px' }
        }}
        cancelButtonProps={{
          style: { borderRadius: '6px' }
        }}
      >
        <p>Are you sure you want to cancel tracking #TRK-{selectedPurchase?.id.toString().padStart(5, '0')}?</p>
        {selectedPurchase?.status === 'RECEIVED' && (
          <p style={{ color: 'red' }}>
            <strong>Warning:</strong> This order has already been received and inventory updated.
          </p>
        )}
      </Modal>
    </Card>
  );
};

export default PurchaseList;