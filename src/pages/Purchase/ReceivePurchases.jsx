import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, 
  Button, 
  Tag, 
  Modal, 
  message, 
  Card, 
  Space, 
  Typography,
  Badge,
  Descriptions,
  Divider
} from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  EyeOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { 
  getPendingPurchases,
  receivePurchase,
  cancelPurchase
} from '../../services/purchaseService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const ReceivePurchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [actionType, setActionType] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPendingPurchases();
  }, []);

  const fetchPendingPurchases = async () => {
    setLoading(true);
    try {
      const data = await getPendingPurchases();
      setPurchases(data);
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (purchase) => {
    setSelectedPurchase(purchase);
    setActionType(null);
    setIsModalVisible(true);
  };

  const handleAction = (type, purchase) => {
    setActionType(type);
    setSelectedPurchase(purchase);
    setIsModalVisible(true);
  };

  const confirmAction = async () => {
    try {
      setLoading(true);
      if (actionType === 'receive') {
        await receivePurchase(selectedPurchase.id);
        message.success('Purchase received successfully and inventory updated!');
      } else {
        await cancelPurchase(selectedPurchase.id);
        message.success('Purchase cancelled successfully!');
      }
      fetchPendingPurchases();
      setIsModalVisible(false);
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status) => {
    const statusMap = {
      'PENDING': { color: 'orange', text: 'Pending' },
      'RECEIVED': { color: 'green', text: 'Received' },
      'CANCELLED': { color: 'red', text: 'Cancelled' }
    };
    const statusConfig = statusMap[status] || { color: 'default', text: status };
    return <Tag color={statusConfig.color}>{statusConfig.text}</Tag>;
  };

  const columns = [
    {
      title: 'PO Number',
      dataIndex: 'id',
      key: 'id',
      render: (id) => `PO-${id.toString().padStart(5, '0')}`,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Supplier',
      dataIndex: ['supplier', 'companyName'],
      key: 'supplier',
    },
    {
      title: 'Order Date',
      dataIndex: 'orderDate',
      key: 'orderDate',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
      sorter: (a, b) => new Date(a.orderDate) - new Date(b.orderDate),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => `KES ${amount?.toFixed(2) || '0.00'}`,
      sorter: (a, b) => a.totalAmount - b.totalAmount,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => handleViewDetails(record)}
          >
            View
          </Button>
          <Button 
            type="primary" 
            icon={<CheckCircleOutlined />}
            onClick={() => handleAction('receive', record)}
            disabled={record.status !== 'PENDING'}
            style={{
              backgroundColor: record.status === 'PENDING' ? '#52c41a' : undefined,
              borderColor: record.status === 'PENDING' ? '#52c41a' : undefined,
              fontWeight: 'bold',
              boxShadow: '0 2px 0 rgba(82, 196, 26, 0.1)'
            }}
          >
            RECEIVE
          </Button>
          <Button 
            danger 
            icon={<CloseCircleOutlined />}
            onClick={() => handleAction('cancel', record)}
            disabled={record.status !== 'PENDING'}
          >
            Cancel
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/purchases')}
          style={{ marginBottom: 16 }}
        >
          Back to Purchases
        </Button>

        <Title level={3}>Receive Purchases</Title>
        
        <Card>
          <Badge.Ribbon text={`${purchases.length} Pending`} color="orange">
            <Table
              columns={columns}
              dataSource={purchases}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
              scroll={{ x: true }}
            />
          </Badge.Ribbon>
        </Card>

        {/* Purchase Details Modal */}
        <Modal
          title={`Purchase Order - PO-${selectedPurchase?.id?.toString().padStart(5, '0')}`}
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          width={800}
        >
          {selectedPurchase && (
            <>
              <Descriptions bordered column={1}>
                <Descriptions.Item label="Supplier">
                  {selectedPurchase.supplier?.companyName}
                </Descriptions.Item>
                <Descriptions.Item label="Order Date">
                  {dayjs(selectedPurchase.orderDate).format('DD/MM/YYYY HH:mm')}
                </Descriptions.Item>
                {selectedPurchase.receivedDate && (
                  <Descriptions.Item label="Received Date">
                    {dayjs(selectedPurchase.receivedDate).format('DD/MM/YYYY HH:mm')}
                  </Descriptions.Item>
                )}
                {selectedPurchase.cancellationDate && (
                  <Descriptions.Item label="Cancellation Date">
                    {dayjs(selectedPurchase.cancellationDate).format('DD/MM/YYYY HH:mm')}
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="Status">
                  {getStatusTag(selectedPurchase.status)}
                </Descriptions.Item>
                <Descriptions.Item label="Total Amount">
                  KES {selectedPurchase.totalAmount?.toFixed(2)}
                </Descriptions.Item>
              </Descriptions>

              <Divider orientation="left">Items</Divider>
              
              <Table
                dataSource={selectedPurchase.items}
                rowKey="id"
                pagination={false}
                columns={[
                  {
                    title: 'Product',
                    dataIndex: ['product', 'name'],
                  },
                  {
                    title: 'Quantity',
                    dataIndex: 'quantity',
                  },
                  {
                    title: 'Unit Price (KES)',
                    dataIndex: 'unitPrice',
                    render: (price) => `KES ${price?.toFixed(2)}`,
                  },
                  {
                    title: 'Total (KES)',
                    render: (_, record) => `KES ${(record.quantity * record.unitPrice)?.toFixed(2)}`,
                  },
                ]}
              />

              {actionType && (
                <>
                  <Divider />
                  <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <Text strong>
                      {actionType === 'receive' 
                        ? 'Are you sure you want to receive this purchase and update inventory?' 
                        : 'Are you sure you want to cancel this purchase?'}
                    </Text>
                  </div>
                  <div style={{ textAlign: 'right', marginTop: 16 }}>
                    <Space>
                      <Button onClick={() => setIsModalVisible(false)}>
                        Cancel
                      </Button>
                      <Button 
                        type={actionType === 'receive' ? 'primary' : 'danger'} 
                        onClick={confirmAction}
                        loading={loading}
                        icon={actionType === 'receive' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                        style={actionType === 'receive' ? { 
                          backgroundColor: '#52c41a',
                          borderColor: '#52c41a',
                          fontWeight: 'bold'
                        } : undefined}
                      >
                        {actionType === 'receive' ? 'CONFIRM RECEIPT' : 'Confirm Cancel'}
                      </Button>
                    </Space>
                  </div>
                </>
              )}
            </>
          )}
        </Modal>
      </Space>
    </div>
  );
};

export default ReceivePurchases;