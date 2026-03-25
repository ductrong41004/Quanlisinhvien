import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, message, Popconfirm, DatePicker, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import { StudentService, ClassRoomService } from '../services';
import dayjs from 'dayjs';

const { Option } = Select;

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  // Search/Filter states
  const [searchText, setSearchText] = useState('');
  const [filterClass, setFilterClass] = useState(null);
  const [filterGender, setFilterGender] = useState(null);

  const fetchClasses = async () => {
    try {
      const response = await ClassRoomService.getAll();
      setClasses(response.data);
    } catch (error) {
      console.error('Failed to load classes', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      let response;
      if (filterClass || filterGender) {
        response = await StudentService.filter(filterClass, filterGender);
      } else if (searchText) {
        response = await StudentService.search(searchText);
      } else {
        response = await StudentService.getAll();
      }
      setStudents(response.data);
    } catch (error) {
      message.error('Lỗi khi tải danh sách sinh viên');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterClass, filterGender]);

  const handleSearch = () => {
    setFilterClass(null);
    setFilterGender(null);
    loadData();
  };

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingId(record.id);
    form.setFieldsValue({
      ...record,
      ngaySinh: record.ngaySinh ? dayjs(record.ngaySinh) : null
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await StudentService.delete(id);
      message.success('Xóa sinh viên thành công!');
      loadData();
    } catch (error) {
      message.error('Lỗi khi xóa sinh viên');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (values.ngaySinh) {
        values.ngaySinh = values.ngaySinh.format('YYYY-MM-DD');
      }
      
      if (editingId) {
        await StudentService.update(editingId, values);
        message.success('Cập nhật thành công!');
      } else {
        await StudentService.create(values);
        message.success('Thêm sinh viên thành công!');
      }
      setIsModalVisible(false);
      loadData();
    } catch (error) {
      console.log('Validate Failed:', error);
    }
  };

  const handleExportCSV = async () => {
    try {
      const blob = await StudentService.exportCSV();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'danh-sach-sinh-vien.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success('Xuất CSV thành công!');
    } catch (error) {
      message.error('Lỗi khi xuất CSV');
    }
  };

  const handleExportExcel = async () => {
    try {
      const blob = await StudentService.exportExcel();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'danh-sach-sinh-vien.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success('Xuất Excel thành công!');
    } catch (error) {
      message.error('Lỗi khi xuất Excel');
    }
  };

  const columns = [
    { title: 'Mã SV', dataIndex: 'maSv', key: 'maSv' },
    { title: 'Họ Tên', dataIndex: 'hoTen', key: 'hoTen' },
    { title: 'Lớp', dataIndex: 'maLop', key: 'maLop' },
    { title: 'Giới Tính', dataIndex: 'gioiTinh', key: 'gioiTinh' },
    { title: 'Ngày Sinh', dataIndex: 'ngaySinh', key: 'ngaySinh' },
    { title: 'SĐT', dataIndex: 'soDienThoai', key: 'soDienThoai' },
    {
      title: 'Hành Động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm
            title="Xóa sinh viên?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="primary" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Quản Lý Sinh Viên</h2>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={handleExportCSV}>Xuất CSV</Button>
          <Button icon={<DownloadOutlined />} onClick={handleExportExcel} style={{ background: '#107c41', color: 'white' }}>Xuất Excel</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Thêm Mới</Button>
        </Space>
      </div>

      <div style={{ padding: '16px', background: '#fafafa', marginBottom: 16, borderRadius: '8px' }}>
        <Row gutter={16}>
          <Col span={8}>
            <Input 
              placeholder="Tìm theo mã hoặc tên SV..." 
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col span={4}>
            <Button type="primary" onClick={handleSearch}>Tìm Kiếm</Button>
          </Col>
          <Col span={6}>
            <Select 
              placeholder="Lọc theo Lớp" 
              style={{ width: '100%' }} 
              value={filterClass}
              onChange={setFilterClass}
              allowClear
            >
              {classes.map(c => (
                <Option key={c.maLop} value={c.maLop}>{c.maLop} - {c.tenLop}</Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <Select 
              placeholder="Lọc theo Giới tính" 
              style={{ width: '100%' }}
              value={filterGender}
              onChange={setFilterGender}
              allowClear
            >
              <Option value="Nam">Nam</Option>
              <Option value="Nữ">Nữ</Option>
            </Select>
          </Col>
        </Row>
      </div>

      <Table 
        columns={columns} 
        dataSource={students} 
        rowKey="id" 
        loading={loading}
        bordered
      />

      <Modal
        title={editingId ? 'Sửa Sinh Viên' : 'Thêm Sinh Viên Mới'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        okText="Lưu"
        cancelText="Hủy"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="maSv" label="Mã Sinh Viên" rules={[{ required: true, message: 'Bắt buộc!' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="hoTen" label="Họ Tên" rules={[{ required: true, message: 'Bắt buộc!' }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="ngaySinh" label="Ngày Sinh">
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="gioiTinh" label="Giới Tính" rules={[{ required: true, message: 'Bắt buộc!' }]}>
                <Select>
                  <Option value="Nam">Nam</Option>
                  <Option value="Nữ">Nữ</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="maLop" label="Lớp Học" rules={[{ required: true, message: 'Bắt buộc!' }]}>
                <Select>
                  {classes.map(c => (
                    <Option key={c.maLop} value={c.maLop}>{c.tenLop}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="soDienThoai" label="Số Điện Thoại">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Email không hợp lệ!' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="diaChi" label="Địa Chỉ">
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default StudentList;
