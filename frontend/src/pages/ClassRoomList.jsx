import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { ClassRoomService } from '../services';

const ClassRoomList = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const response = await ClassRoomService.getAll();
      setClasses(response.data);
    } catch (error) {
      message.error('Lỗi khi tải danh sách lớp học');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await ClassRoomService.delete(id);
      message.success('Xóa lớp học thành công!');
      fetchClasses();
    } catch (error) {
      message.error('Lỗi khi xóa lớp học');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingId) {
        await ClassRoomService.update(editingId, values);
        message.success('Cập nhật lớp học thành công!');
      } else {
        await ClassRoomService.create(values);
        message.success('Thêm lớp học thành công!');
      }
      setIsModalVisible(false);
      fetchClasses();
    } catch (error) {
      console.log('Validate Failed:', error);
    }
  };

  const columns = [
    {
      title: 'Mã Lớp',
      dataIndex: 'maLop',
      key: 'maLop',
    },
    {
      title: 'Tên Lớp',
      dataIndex: 'tenLop',
      key: 'tenLop',
    },
    {
      title: 'Khoa',
      dataIndex: 'khoa',
      key: 'khoa',
    },
    {
      title: 'Sĩ Số',
      dataIndex: 'siSo',
      key: 'siSo',
    },
    {
      title: 'Năm Học',
      dataIndex: 'namHoc',
      key: 'namHoc',
    },
    {
      title: 'Hành Động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa lớp này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="primary" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Quản Lý Lớp Học</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm Lớp Học
        </Button>
      </div>
      <Table 
        columns={columns} 
        dataSource={classes} 
        rowKey="id" 
        loading={loading}
        bordered
      />

      <Modal
        title={editingId ? 'Sửa Lớp Học' : 'Thêm Lớp Học Mới'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="maLop"
            label="Mã Lớp"
            rules={[{ required: true, message: 'Vui lòng nhập mã lớp!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="tenLop"
            label="Tên Lớp"
            rules={[{ required: true, message: 'Vui lòng nhập tên lớp!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="khoa"
            label="Khoa"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="siSo"
            label="Sĩ Số"
            rules={[{ type: 'number', min: 1, message: 'Sĩ số phải lớn hơn 0' }]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="namHoc"
            label="Năm Học (VD: 2023-2027)"
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ClassRoomList;
