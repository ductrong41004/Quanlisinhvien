import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User, LayoutDashboard, GraduationCap, BookOpen, ClipboardList, CalendarCheck, Bell, UserCircle } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useNotificationStore } from '../../store/useNotificationStore';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuthStore();
  const { connect, disconnect, unreadCount, notifications, markAsRead } = useNotificationStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = React.useState(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      connect();
    } else {
      disconnect();
    }
  }, [isAuthenticated, connect, disconnect]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  const role = user?.role;
  const isAdmin = role === 'ADMIN';
  const isTeacher = role === 'TEACHER';
  const isStudent = role === 'STUDENT';
  const isStaff = isAdmin || isTeacher; // Admin hoặc Teacher

  // Role badge color
  const roleBadgeColor = isAdmin
    ? 'bg-red-50 text-red-700 border-red-200'
    : isTeacher
    ? 'bg-blue-50 text-blue-700 border-blue-200'
    : 'bg-green-50 text-green-700 border-green-200';

  const roleLabel = isAdmin ? 'ADMIN' : isTeacher ? 'GIÁO VIÊN' : 'SINH VIÊN';

  // Check if current path matches for active link styling
  const isActive = (path: string) => location.pathname === path;
  const linkClass = (path: string) =>
    `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
      isActive(path)
        ? 'border-indigo-500 text-indigo-600'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
    }`;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">SMS Pro</span>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              {/* Dashboard — ADMIN & TEACHER only */}
              {isStaff && (
                <Link to="/" className={linkClass('/')}>
                  <LayoutDashboard className="h-4 w-4 mr-1" /> Dashboard
                </Link>
              )}

              {/* Students — ADMIN & TEACHER only */}
              {isStaff && (
                <Link to="/students" className={linkClass('/students')}>
                  <User className="h-4 w-4 mr-1" /> Students
                </Link>
              )}

              {/* Classes — ADMIN & TEACHER only */}
              {isStaff && (
                <Link to="/classes" className={linkClass('/classes')}>
                  <BookOpen className="h-4 w-4 mr-1" /> Classes
                </Link>
              )}

              {/* Grades — ADMIN & TEACHER */}
              {isStaff && (
                <Link to="/grades" className={linkClass('/grades')}>
                  <ClipboardList className="h-4 w-4 mr-1" /> Grades
                </Link>
              )}

              {/* Attendance — ADMIN & TEACHER only */}
              {isStaff && (
                <Link to="/attendance" className={linkClass('/attendance')}>
                  <CalendarCheck className="h-4 w-4 mr-1" /> Attendance
                </Link>
              )}

              {/* ── STUDENT menu ── */}
              {isStudent && (
                <>
                  <Link to="/my-profile" className={linkClass('/my-profile')}>
                    <UserCircle className="h-4 w-4 mr-1" /> Hồ sơ
                  </Link>
                  <Link to="/my-grades" className={linkClass('/my-grades')}>
                    <ClipboardList className="h-4 w-4 mr-1" /> Điểm số
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            
            {/* Notification bell */}
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-2 text-gray-500 hover:text-indigo-600 transition-colors relative"
              >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] text-white font-bold items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  </span>
                )}
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl py-2 border border-gray-100 z-50 overflow-hidden transform origin-top-right transition-all">
                  <div className="px-4 py-2 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-sm font-bold text-gray-800">Thông báo</h3>
                    <span onClick={() => useNotificationStore.getState().markAllAsRead()} className="text-xs text-indigo-600 cursor-pointer font-semibold hover:underline">Đánh dấu đã đọc</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-sm text-gray-500 px-4 py-6 text-center italic">Không có thông báo nào.</p>
                    ) : (
                      notifications.map(notif => (
                        <div 
                          key={notif._id} 
                          onClick={() => {
                            markAsRead(notif._id);
                            if (notif.link) {
                              navigate(notif.link);
                              setShowDropdown(false);
                            }
                          }}
                          className={`px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-indigo-50/50 transition-colors ${!notif.isRead ? 'bg-blue-50/10 border-l-4 border-l-indigo-500' : ''}`}
                        >
                          <p className={`text-xs ${!notif.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-600'} line-clamp-2`}>{notif.message}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleString('vi-VN')}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User info + role badge */}
            <div className="text-right flex flex-col justify-center mr-2 border-l border-gray-200 pl-4">
              <p className="text-xs font-semibold text-gray-900">{user?.username}</p>
              <span className={`inline-flex items-center justify-center text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border mt-0.5 ${roleBadgeColor}`}>
                {roleLabel}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 inline-flex items-center gap-2 border border-transparent rounded-full font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 focus:outline-none transition-colors"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
