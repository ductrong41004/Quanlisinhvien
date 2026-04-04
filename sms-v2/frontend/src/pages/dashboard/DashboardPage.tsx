import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { Users, GraduationCap, Building2, BookX } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a855f7', '#ef4444'];
const GENDER_COLORS = { MALE: '#3b82f6', FEMALE: '#ec4899', OTHER: '#8b5cf6' };

const DashboardPage: React.FC = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const resp = await axiosInstance.get('/dashboard/stats');
      return resp.data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[500px]">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex justify-center items-center h-full min-h-[500px]">
        <div className="text-red-500 font-bold bg-red-50 p-6 rounded-2xl border border-red-200">
          <BookX className="h-10 w-10 mx-auto mb-2 opacity-50" />
          Có lỗi xảy ra khi tải dữ liệu thống kê. Cấu hình Backend chưa chuẩn?
        </div>
      </div>
    );
  }

  const { overview, charts } = stats;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Tổng Quan Hệ Thống</h1>
      <p className="text-gray-500 mb-8">Báo cáo real-time về hoạt động của nhà trường.</p>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-10">
        <div className="bg-white overflow-hidden shadow-xl rounded-2xl p-6 border border-gray-100 flex items-center justify-between group">
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Tổng Sinh Viên</h3>
            <p className="mt-2 text-4xl font-black text-indigo-600">{overview.totalStudents}</p>
          </div>
          <div className="h-16 w-16 bg-indigo-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <Users className="h-8 w-8 text-indigo-600" />
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow-xl rounded-2xl p-6 border border-gray-100 flex items-center justify-between group">
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Lớp Học</h3>
            <p className="mt-2 text-4xl font-black text-green-600">{overview.totalClasses}</p>
          </div>
          <div className="h-16 w-16 bg-green-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <Building2 className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow-xl rounded-2xl p-6 border border-gray-100 flex items-center justify-between group">
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Giảng Viên</h3>
            <p className="mt-2 text-4xl font-black text-orange-500">{overview.totalTeachers}</p>
          </div>
          <div className="h-16 w-16 bg-orange-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <GraduationCap className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Biểu đồ Sinh viên theo Lớp */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
            <span className="w-2 h-6 bg-indigo-500 rounded mr-2"></span> Sĩ số Sinh Viên Theo Lớp
          </h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.studentsByClass}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} name="Số lượng sinh viên" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Biểu đồ Tỉ lệ Giới Tính */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
            <span className="w-2 h-6 bg-pink-500 rounded mr-2"></span> Cơ Cấu Giới Tính
          </h2>
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.genderStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {charts.genderStats.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={(GENDER_COLORS as any)[entry.name] || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Biểu đồ Điểm số trung bình theo Môn */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
            <span className="w-2 h-6 bg-green-500 rounded mr-2"></span> Điểm Trung Bình Theo Môn Học
          </h2>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.avgGradeBySubject}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} />
                <XAxis dataKey="subject" tick={{ fontSize: 13, fill: '#4b5563' }} axisLine={false} tickLine={false} dy={10} />
                <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} tick={{ fontSize: 13, fill: '#4b5563' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                  cursor={{ stroke: '#cbd5e1', strokeWidth: 2, strokeDasharray: '4 4' }} 
                />
                <Line type="monotone" dataKey="average" name="Điểm Trung Bình" stroke="#10b981" strokeWidth={4} dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8, fill: '#059669', strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;
