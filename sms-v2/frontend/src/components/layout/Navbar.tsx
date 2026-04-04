import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, LayoutDashboard, GraduationCap, BookOpen, ClipboardList, CalendarCheck } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

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
              <Link to="/" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                <LayoutDashboard className="h-4 w-4 mr-1" /> Dash
              </Link>
              <Link to="/students" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                <User className="h-4 w-4 mr-1" /> Students
              </Link>
              <Link to="/classes" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                <BookOpen className="h-4 w-4 mr-1" /> Classes
              </Link>
              <Link to="/grades" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                <ClipboardList className="h-4 w-4 mr-1" /> Grades
              </Link>
              <Link to="/attendance" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                <CalendarCheck className="h-4 w-4 mr-1" /> Attendance
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right flex flex-col justify-center mr-2">
              <p className="text-xs font-semibold text-gray-900">{user?.username}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">{user?.role}</p>
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
