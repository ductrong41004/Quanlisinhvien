import React from 'react';
import { Layout, Menu, theme } from 'antd';
import { UserOutlined, TeamOutlined } from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const { Header, Content, Footer, Sider } = Layout;

const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const items = [
    {
      key: '/students',
      icon: <UserOutlined />,
      label: 'Sinh Viên',
    },
    {
      key: '/classes',
      icon: <TeamOutlined />,
      label: 'Lớp Học',
    },
  ];

  const handleMenuClick = (e) => {
    navigate(e.key);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth="0">
        <div style={{ padding: '16px', color: 'white', fontSize: '18px', fontWeight: 'bold', textAlign: 'center' }}>
          Quản Lý SV
        </div>
        <Menu 
          theme="dark" 
          mode="inline" 
          selectedKeys={[location.pathname]} 
          items={items} 
          onClick={handleMenuClick} 
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }} />
        <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Quản Lý Sinh Viên ©{new Date().getFullYear()}
        </Footer>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
