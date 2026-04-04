import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/useAuthStore';
import Navbar from './components/layout/Navbar';
import LoginPage from './pages/auth/LoginPage';
import StudentListPage from './pages/students/StudentListPage';
import ClassListPage from './pages/classes/ClassListPage';
import GradeListPage from './pages/grades/GradeListPage';

const queryClient = new QueryClient();

// Higher-order component for protected routes
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const DashboardPlaceholder = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <h1 className="text-3xl font-bold text-gray-900">Chào mừng trở lại!</h1>
    <p className="mt-4 text-gray-600">Đây là Dashboard tổng quan của hệ thống quản lý sinh viên.</p>
    <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div className="bg-white overflow-hidden shadow-xl rounded-2xl p-6 border border-gray-100 transform transition-all hover:scale-[1.02]">
        <h3 className="text-sm font-medium text-gray-500 uppercase">Tổng số sinh viên</h3>
        <p className="mt-2 text-3xl font-bold text-indigo-600 tracking-tight">1,248</p>
      </div>
      <div className="bg-white overflow-hidden shadow-xl rounded-2xl p-6 border border-gray-100 transform transition-all hover:scale-[1.02]">
        <h3 className="text-sm font-medium text-gray-500 uppercase">Lớp học hiện tại</h3>
        <p className="mt-2 text-3xl font-bold text-green-600 tracking-tight">42</p>
      </div>
      <div className="bg-white overflow-hidden shadow-xl rounded-2xl p-6 border border-gray-100 transform transition-all hover:scale-[1.02]">
        <h3 className="text-sm font-medium text-gray-500 uppercase">Giảng viên</h3>
        <p className="mt-2 text-3xl font-bold text-orange-600 tracking-tight">56</p>
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <DashboardPlaceholder />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/students" 
              element={
                <ProtectedRoute>
                  <StudentListPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/classes" 
              element={
                <ProtectedRoute>
                  <ClassListPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/grades" 
              element={
                <ProtectedRoute>
                  <GradeListPage />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
