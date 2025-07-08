import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  getAllPurchases, 
  deletePurchase,
  getPurchaseById
} from '../../services/purchaseService';
import { 
  Table, 
  Button, 
  Dropdown, 
  Modal, 
  message, 
  Tag, 
  Descriptions, 
  Card,
  Divider
} from 'antd';
import { 
  EyeOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  MoreOutlined,
  PlusOutlined 
} from '@ant-design/icons';

const PurchaseList = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

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
      message.success('Purchase deleted successfully');
      fetchPurchases();
    } catch (error) {
      message.error(error.message);
    } finally {
      setIsDeleteModalVisible(false);
    }
  };

  const showPurchaseDetails = async (purchase) => {
    setDetailLoading(true);
    setIsDetailModalVisible(true);
    try {
      const details = await getPurchaseById(purchase.id);
      setSelectedPurchase(details);
    } catch (error) {
      message.error(error.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      'CANCELLED': { color: 'red' },
      'PENDING': { color: 'orange' },
      'RECEIVED': { color: 'green' },
      default: { color: 'default' }
    };
    const config = statusConfig[status] || statusConfig.default;
    return <Tag color={config.color}>{status}</Tag>;
  };

  const columns = [
    {
      title: 'PO Number',
      dataIndex: 'id',
      key: 'id',
      render: (id) => `PO-${id}`,
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
      render: (date) => date ? new Date(date).toLocaleDateString() : '-',
      sorter: (a, b) => new Date(a.orderDate) - new Date(b.orderDate),
    },
    {
      title: 'Receiving Date',
      dataIndex: 'receivedDate',
      key: 'receivedDate',
      render: (date) => date ? new Date(date).toLocaleDateString() : '-',
      sorter: (a, b) => new Date(a.receivedDate) - new Date(b.receivedDate),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
      filters: [
        { text: 'CANCELLED', value: 'CANCELLED' },
        { text: 'PENDING', value: 'PENDING' },
        { text: 'RECEIVED', value: 'RECEIVED' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Total Amount (KES)',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => `KES ${amount?.toFixed(2) || '0.00'}`,
      sorter: (a, b) => a.totalAmount - b.totalAmount,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                label: (
                  <span onClick={() => showPurchaseDetails(record)}>
                    <EyeOutlined /> View
                  </span>
                ),
              },
              {
                key: 'edit',
                label: (
                  <Link to={`/purchases/edit/${record.id}`}>
                    <EditOutlined /> Edit
                  </Link>
                ),
                disabled: record.status === 'CANCELLED',
              },
              {
                key: 'delete',
                label: (
                  <span onClick={() => {
                    setSelectedPurchase(record);
                    setIsDeleteModalVisible(true);
                  }}>
                    <DeleteOutlined /> Delete
                  </span>
                ),
              },
            ],
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 20 
      }}>
        <h2>Purchase Orders</h2>
        <Link to="/purchases/create">
          {/* Fixed button with explicit primary color */}
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            style={{ 
              background: '#1890ff', // Ant Design's default primary blue
              borderColor: '#1890ff',
            }}
          >
            Create Purchase
          </Button>
        </Link>
      </div>

      <Table
        columns={columns}
        dataSource={purchases}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1200 }} // Increased to accommodate new column
      />

      {/* Purchase Details Modal */}
      <Modal
        title={selectedPurchase ? `Purchase Order - PO-${selectedPurchase.id}` : 'Purchase Details'}
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {detailLoading ? (
          <div style={{ textAlign: 'center', padding: '24px' }}>Loading details...</div>
        ) : selectedPurchase ? (
          <Card loading={detailLoading}>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Supplier">
                {selectedPurchase.supplier?.companyName || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Order Date">
                {selectedPurchase.orderDate ? new Date(selectedPurchase.orderDate).toLocaleString() : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Receiving Date">
                {selectedPurchase.receivedDate ? new Date(selectedPurchase.receivedDate).toLocaleString() : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                {getStatusTag(selectedPurchase.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Total Amount">
                KES {selectedPurchase.totalAmount?.toFixed(2) || '0.00'}
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Items</Divider>
            <Table
              dataSource={selectedPurchase.items || []}
              rowKey="id"
              pagination={false}
              columns={[
                { title: 'Product', dataIndex: ['product', 'name'] },
                { title: 'Quantity', dataIndex: 'quantity' },
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
          </Card>
        ) : (
          <div>No purchase data available</div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Confirm Delete"
        open={isDeleteModalVisible}
        onOk={handleDelete}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        <p>Are you sure you want to delete purchase order PO-{selectedPurchase?.id}?</p>
        {selectedPurchase?.status === 'RECEIVED' && (
          <p style={{ color: 'red' }}>Warning: This order has been received.</p>
        )}
      </Modal>
    </div>
  );
};

export default PurchaseList;