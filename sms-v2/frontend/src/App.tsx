import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/useAuthStore';
import Navbar from './components/layout/Navbar';
import LoginPage from './pages/auth/LoginPage';
import StudentListPage from './pages/students/StudentListPage';
import StudentProfilePage from './pages/students/StudentProfilePage';
import ClassListPage from './pages/classes/ClassListPage';
import GradeListPage from './pages/grades/GradeListPage';
import AttendancePage from './pages/attendance/AttendancePage';
import CheckinPage from './pages/attendance/CheckinPage';
import DashboardPage from './pages/dashboard/DashboardPage';

const queryClient = new QueryClient();

// ─── Protected Route: requires authentication ─────────────────────
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// ─── Role Route: requires specific roles ──────────────────────────
const RoleRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}> = ({ children, allowedRoles, redirectTo = '/' }) => {
  const user = useAuthStore((state) => state.user);
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />;
  }
  return <>{children}</>;
};

// ─── Smart Home Route: redirect based on role ─────────────────────
const HomeRoute: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  if (user?.role === 'STUDENT') {
    return <Navigate to="/my-profile" replace />;
  }
  return <DashboardPage />;
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            {/* Home: ADMIN/TEACHER → Dashboard, STUDENT → redirect to profile */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <HomeRoute />
                </ProtectedRoute>
              }
            />

            {/* ── ADMIN & TEACHER only ── */}
            <Route
              path="/students"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['ADMIN', 'TEACHER']} redirectTo="/my-profile">
                    <StudentListPage />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/classes"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['ADMIN', 'TEACHER']} redirectTo="/my-profile">
                    <ClassListPage />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/grades"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['ADMIN', 'TEACHER']} redirectTo="/my-grades">
                    <GradeListPage />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['ADMIN', 'TEACHER']} redirectTo="/my-profile">
                    <AttendancePage />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />

            {/* ── STUDENT only ── */}
            <Route
              path="/my-profile"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['STUDENT']} redirectTo="/">
                    <StudentProfilePage />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-grades"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['STUDENT']} redirectTo="/grades">
                    <StudentProfilePage />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />

            {/* Checkin: all authenticated users */}
            <Route
              path="/checkin"
              element={
                <ProtectedRoute>
                  <CheckinPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
