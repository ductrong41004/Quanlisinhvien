import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';
import { ArrowLeft, BookOpen, User, Users, Calendar, GraduationCap } from 'lucide-react';

const ClassDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // Fetch Class info
  const { data: classData, isLoading: classLoading } = useQuery({
    queryKey: ['class', id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/classes/${id}`);
      return response.data;
    },
  });

  // Fetch Students in this class
  const { data: studentsResponse, isLoading: studentsLoading } = useQuery({
    queryKey: ['students-in-class', id],
    queryFn: async () => {
      // Use limit=1000 or similar to fetch all students without complex pagination for dashboard overview
      const response = await axiosInstance.get(`/students`, { params: { class: id, limit: 1000 } });
      return response.data;
    },
  });

  const students = studentsResponse?.data || [];
  const isLoading = classLoading || studentsLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-500 font-medium">Đang tải thông tin lớp học...</p>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center text-red-500 font-bold">
        Lớp học không tồn tại hoặc đã bị xóa.
        <br />
        <Link to="/classes" className="text-indigo-600 mt-4 inline-block hover:underline">Quay lại danh sách</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="mb-8">
        <Link to="/classes" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Quay lại Danh sách
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-100 p-4 rounded-2xl hidden sm:block">
              <BookOpen className="h-8 w-8 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center">
                {classData.name}
              </h1>
              <p className="mt-1 text-sm text-gray-500">Chương trình đào tạo và danh sách lớp.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-3 text-center">
              <div className="text-sm text-gray-500 font-medium mb-1">Sĩ số lớp</div>
              <div className="text-2xl font-black text-indigo-600">{students.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center">
           <div className="flex items-center text-gray-500 mb-2">
             <Calendar className="h-5 w-5 mr-2 text-indigo-400" />
             <span className="font-semibold">Niên khóa</span>
           </div>
           <div className="text-xl font-bold text-gray-900">{classData.academicYear}</div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center">
           <div className="flex items-center text-gray-500 mb-2">
             <User className="h-5 w-5 mr-2 text-indigo-400" />
             <span className="font-semibold">Giáo viên chủ nhiệm</span>
           </div>
           <div className="text-xl font-bold text-gray-900">{classData.teacher?.username || 'Chưa phân công'}</div>
           <div className="text-sm text-gray-400">{classData.teacher?.email}</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center">
           <div className="flex items-center text-gray-500 mb-2">
             <Users className="h-5 w-5 mr-2 text-indigo-400" />
             <span className="font-semibold">Khoa / Phòng</span>
           </div>
           <div className="text-xl font-bold text-gray-900">{classData.department || 'N/A'}</div>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 flex items-center">
            <GraduationCap className="h-5 w-5 mr-2 text-indigo-600" />
            Danh sách Sinh viên đang học ({students.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          {students.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              Chưa có sinh viên nào trong lớp này.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Mã SV</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Họ và Tên</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Giới tính</th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {students.map((student: any) => (
                  <tr key={student._id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {student.studentCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-indigo-700 font-bold text-xs">{student.fullName.charAt(0)}</span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-bold text-gray-900">{student.fullName}</div>
                          <div className="text-xs text-gray-500">{student.user?.email || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.gender === 'MALE' ? 'Nam' : student.gender === 'FEMALE' ? 'Nữ' : 'Khác'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <Link to={`/students`} className="text-indigo-600 font-semibold hover:text-indigo-900 shadow-sm border border-indigo-100 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-all text-xs">
                        Hồ sơ
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassDetailsPage;
