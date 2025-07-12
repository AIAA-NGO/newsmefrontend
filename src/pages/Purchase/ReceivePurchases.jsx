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
  Divider,
  Image,
  Tooltip
} from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  EyeOutlined,
  ArrowLeftOutlined,
  InfoCircleOutlined
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
  const [confirmLoading, setConfirmLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPendingPurchases();
  }, []);

  const fetchPendingPurchases = async () => {
    setLoading(true);
    try {
      const data = await getPendingPurchases();
      setPurchases(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching purchases:', error);
      message.error(error.response?.data?.message || error.message || 'Failed to fetch purchases');
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
      setConfirmLoading(true);
      if (actionType === 'receive') {
        await receivePurchase(selectedPurchase.id);
        message.success('Purchase received successfully and inventory updated!');
      } else {
        await cancelPurchase(selectedPurchase.id);
        message.success('Purchase cancelled successfully!');
      }
      await fetchPendingPurchases();
      setIsModalVisible(false);
    } catch (error) {
      console.error('Error processing purchase:', error);
      message.error(error.response?.data?.message || error.message || 'Failed to process purchase');
    } finally {
      setConfirmLoading(false);
    }
  };

  const getStatusTag = (status) => {
    const statusMap = {
      'PENDING': { color: 'orange', text: 'Pending', icon: <InfoCircleOutlined /> },
      'RECEIVED': { color: 'green', text: 'Received', icon: <CheckCircleOutlined /> },
      'CANCELLED': { color: 'red', text: 'Cancelled', icon: <CloseCircleOutlined /> },
      'PARTIALLY_RECEIVED': { color: 'blue', text: 'Partially Received', icon: <InfoCircleOutlined /> }
    };
    const statusConfig = statusMap[status] || { color: 'default', text: status, icon: null };
    return (
      <Tag icon={statusConfig.icon} color={statusConfig.color}>
        {statusConfig.text}
      </Tag>
    );
  };

  const columns = [
    {
      title: 'PO Number',
      dataIndex: 'id',
      key: 'id',
      render: (id) => `PO-${id.toString().padStart(5, '0')}`,
      sorter: (a, b) => a.id - b.id,
      width: 120,
    },
    {
      title: 'Supplier',
      dataIndex: ['supplier', 'companyName'],
      key: 'supplier',
      render: (text, record) => (
        <Tooltip title={`ID: ${record.supplier?.id}`}>
          <span>{text || 'N/A'}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Order Date',
      dataIndex: 'orderDate',
      key: 'orderDate',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
      sorter: (a, b) => new Date(a.orderDate) - new Date(b.orderDate),
      width: 150,
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: (items) => items?.length || 0,
      align: 'center',
      width: 100,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
      width: 150,
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => (
        <Text strong>KES {amount?.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
      ),
      sorter: (a, b) => a.totalAmount - b.totalAmount,
      align: 'right',
      width: 150,
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => handleViewDetails(record)}
          >
            Details
          </Button>
          {record.status === 'PENDING' && (
            <>
              <Button 
                type="primary" 
                icon={<CheckCircleOutlined />}
                onClick={() => handleAction('receive', record)}
                style={{
                  backgroundColor: '#52c41a',
                  borderColor: '#52c41a',
                  fontWeight: 'bold',
                }}
              >
                Receive
              </Button>
              <Button 
                danger 
                icon={<CloseCircleOutlined />}
                onClick={() => handleAction('cancel', record)}
              >
                Cancel
              </Button>
            </>
          )}
        </Space>
      ),
      width: 250,
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate(-1)}
          style={{ marginBottom: 16 }}
        >
          Back
        </Button>

        <Title level={3}>Receive Purchases</Title>
        
        <Card>
          <Badge.Ribbon 
            text={`${purchases.length} Pending`} 
            color="orange"
            style={{ top: -1, right: -1 }}
          >
            <Table
              columns={columns}
              dataSource={purchases}
              rowKey="id"
              loading={loading}
              pagination={{ 
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50', '100']
              }}
              scroll={{ x: 1300 }}
              bordered
            />
          </Badge.Ribbon>
        </Card>

        {/* Purchase Details Modal */}
        <Modal
          title={
            <span>
              Purchase Order - PO-{selectedPurchase?.id?.toString().padStart(5, '0')}
              {selectedPurchase?.status && (
                <span style={{ marginLeft: 8 }}>
                  {getStatusTag(selectedPurchase.status)}
                </span>
              )}
            </span>
          }
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          width={900}
          centered
          destroyOnClose
        >
          {selectedPurchase && (
            <>
              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="Supplier" span={2}>
                  <Text strong>
                    {selectedPurchase.supplier?.companyName || 'N/A'}
                    {selectedPurchase.supplier?.contactNumber && (
                      <Text type="secondary" style={{ marginLeft: 8 }}>
                        ({selectedPurchase.supplier.contactNumber})
                      </Text>
                    )}
                  </Text>
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
                <Descriptions.Item label="Total Items">
                  {selectedPurchase.items?.length || 0}
                </Descriptions.Item>
                <Descriptions.Item label="Total Amount" span={2}>
                  <Text strong type="success" style={{ fontSize: '1.1em' }}>
                    KES {selectedPurchase.totalAmount?.toLocaleString('en-KE', { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })}
                  </Text>
                </Descriptions.Item>
              </Descriptions>

              <Divider orientation="left">Purchased Items</Divider>
              
              <Table
                dataSource={selectedPurchase.items || []}
                rowKey="id"
                pagination={false}
                scroll={{ y: 300 }}
                columns={[
                  {
                    title: 'Product',
                    dataIndex: ['product', 'name'],
                    render: (text, record) => (
                      <Space>
                        {record.product?.imageUrl && (
                          <Image
                            src={record.product.imageUrl}
                            width={40}
                            height={40}
                            style={{ objectFit: 'cover' }}
                            preview={false}
                            fallback="https://via.placeholder.com/40"
                          />
                        )}
                        <div>
                          <div>{text || 'N/A'}</div>
                          {record.product?.sku && (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              SKU: {record.product.sku}
                            </Text>
                          )}
                        </div>
                      </Space>
                    ),
                    width: 250,
                  },
                  {
                    title: 'Quantity',
                    dataIndex: 'quantity',
                    align: 'center',
                    width: 100,
                  },
                  {
                    title: 'Unit Price (KES)',
                    dataIndex: 'unitPrice',
                    render: (price) => (
                      <Text strong>
                        {price?.toLocaleString('en-KE', { 
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: 2 
                        })}
                      </Text>
                    ),
                    align: 'right',
                    width: 150,
                  },
                  {
                    title: 'Total (KES)',
                    render: (_, record) => (
                      <Text strong type="primary">
                        {(record.quantity * record.unitPrice)?.toLocaleString('en-KE', { 
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: 2 
                        })}
                      </Text>
                    ),
                    align: 'right',
                    width: 150,
                  },
                ]}
              />

              {actionType && (
                <>
                  <Divider />
                  <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <Text strong style={{ fontSize: '1.1em' }}>
                      {actionType === 'receive' 
                        ? 'Are you sure you want to receive this purchase and update inventory?' 
                        : 'Are you sure you want to cancel this purchase?'}
                    </Text>
                    {actionType === 'receive' && (
                      <div style={{ marginTop: 8 }}>
                        <Text type="warning">
                          This action cannot be undone. Inventory levels will be updated.
                        </Text>
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', marginTop: 24 }}>
                    <Space>
                      <Button 
                        onClick={() => setIsModalVisible(false)}
                        disabled={confirmLoading}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type={actionType === 'receive' ? 'primary' : 'danger'} 
                        onClick={confirmAction}
                        loading={confirmLoading}
                        icon={actionType === 'receive' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                        style={actionType === 'receive' ? { 
                          backgroundColor: '#52c41a',
                          borderColor: '#52c41a',
                          fontWeight: 'bold'
                        } : undefined}
                      >
                        {actionType === 'receive' ? 'Confirm Receipt' : 'Confirm Cancellation'}
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