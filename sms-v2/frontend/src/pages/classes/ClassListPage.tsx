import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';
import { BookOpen, Users, User, Calendar, ExternalLink, Plus } from 'lucide-react';

const ClassListPage: React.FC = () => {
  const { data: classes, isLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const response = await axiosInstance.get('/classes');
      return response.data;
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Danh sách Lớp học</h1>
          <p className="mt-1 text-sm text-gray-500">Xem và quản lý các lớp học, giáo viên phụ trách và niên khóa.</p>
        </div>
        <button className="inline-flex items-center px-4 py-2.5 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all transform hover:-translate-y-0.5">
          <Plus className="h-5 w-5 mr-2" />
          Tạo Lớp mới
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-500 font-medium">Đang tải danh sách lớp học...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {classes?.map((item: any) => (
            <div key={item._id} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-indigo-50 p-3 rounded-xl group-hover:bg-indigo-600 transition-colors duration-300">
                    <BookOpen className="h-6 w-6 text-indigo-600 group-hover:text-white" />
                  </div>
                  <div className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-700 border border-green-100">
                    Đang hoạt động
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-1">{item.name}</h3>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Niên khóa: {item.academicYear}</span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-700">
                    <User className="h-4 w-4 mr-2 text-indigo-500" />
                    <span className="font-medium">Giáo viên:</span>
                    <span className="ml-2">{item.teacher?.username || 'Chưa gán'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <Users className="h-4 w-4 mr-2 text-indigo-500" />
                    <span className="font-medium">Khoa/Phòng:</span>
                    <span className="ml-2 italic">{item.department || 'N/A'}</span>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                <button className="text-indigo-600 text-xs font-bold hover:text-indigo-800 flex items-center transition-colors">
                  <ExternalLink className="h-3 w-3 mr-1" /> Chi tiết lớp học
                </button>
                <div className="flex -space-x-2">
                  <div className="h-7 w-7 rounded-full bg-gray-200 border-2 border-white"></div>
                  <div className="h-7 w-7 rounded-full bg-indigo-200 border-2 border-white flex items-center justify-center text-[8px] font-bold">+12</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!isLoading && classes?.length === 0 && (
        <div className="bg-white rounded-2xl p-20 text-center border-2 border-dashed border-gray-200">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Chưa có lớp học nào được tạo.</p>
          <button className="mt-4 text-indigo-600 font-bold hover:underline">Tạo lớp học đầu tiên ngay</button>
        </div>
      )}
    </div>
  );
};

export default ClassListPage;
