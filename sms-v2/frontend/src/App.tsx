import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/useAuthStore';
import Navbar from './components/layout/Navbar';
import LoginPage from './pages/auth/LoginPage';
import StudentListPage from './pages/students/StudentListPage';
import ClassListPage from './pages/classes/ClassListPage';
import GradeListPage from './pages/grades/GradeListPage';
import AttendancePage from './pages/attendance/AttendancePage';
import CheckinPage from './pages/attendance/CheckinPage';
import DashboardPage from './pages/dashboard/DashboardPage';

const queryClient = new QueryClient();

// Higher-order component for protected routes
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};


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
                  <DashboardPage />
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
            <Route 
              path="/attendance" 
              element={
                <ProtectedRoute>
                  <AttendancePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/checkin" 
              element={
                <ProtectedRoute>
                  <CheckinPage />
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
