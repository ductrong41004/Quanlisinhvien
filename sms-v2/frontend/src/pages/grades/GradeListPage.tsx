import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';
import { useAuthStore } from '../../store/useAuthStore';
import { ClipboardList, User, Book, Calculator, Star, MoreVertical } from 'lucide-react';

const GradeListPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const isAdminOrTeacher = user?.role === 'ADMIN' || user?.role === 'TEACHER';

  const { data: grades, isLoading } = useQuery({
    queryKey: ['grades'],
    queryFn: async () => {
      const response = await axiosInstance.get('/grades');
      return response.data;
    },
  });

  const getGradeColor = (letter: string) => {
    switch (letter) {
      case 'A': return 'bg-green-100 text-green-800 border-green-200';
      case 'B': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'C': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'D': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'F': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-right-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Bảng điểm Sinh viên</h1>
          <p className="mt-1 text-sm text-gray-500">Quản lý và cập nhật kết quả học tập cho sinh viên trong các môn học.</p>
        </div>
        {isAdminOrTeacher && (
          <button className="inline-flex items-center px-4 py-2.5 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all transform hover:-translate-y-0.5">
            <Calculator className="h-5 w-5 mr-2" />
            Nhập điểm hàng loạt
          </button>
        )}
      </div>

      <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/80 backdrop-blur-sm">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest leading-6">Sinh viên & Môn học</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest leading-6 text-center">Giữa kỳ (30%)</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest leading-6 text-center">Cuối kỳ (70%)</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest leading-6 text-center">Tổng kết</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest leading-6 text-center">Xếp loại</th>
                {isAdminOrTeacher && (
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest leading-6">Thao tác</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100 italic-last-row">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-32 text-center text-gray-400">
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-600 mb-4"></div>
                        <span className="font-medium">Đang tải bảng điểm...</span>
                    </div>
                  </td>
                </tr>
              ) : grades?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-32 text-center text-gray-400">
                    <ClipboardList className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    Bảng điểm đang trống.
                  </td>
                </tr>
              ) : (
                grades?.map((grade: any) => (
                  <tr key={grade._id} className="hover:bg-indigo-50/30 transition-all group">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-indigo-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <User className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors uppercase">{grade.student?.fullName || 'N/A'}</div>
                          <div className="text-xs text-gray-400 flex items-center mt-0.5">
                            <Book className="h-3 w-3 mr-1" />
                            {grade.subjectName} • {grade.semester}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm font-semibold text-gray-600">{grade.midtermScore.toFixed(1)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm font-semibold text-gray-600">{grade.finalScore.toFixed(1)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-lg font-black text-indigo-700 tracking-tighter">
                        {grade.totalScore.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-4 py-1 rounded-full text-xs font-black border-2 ${getGradeColor(grade.gradeLetter)}`}>
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        {grade.gradeLetter}
                      </span>
                    </td>
                    {isAdminOrTeacher && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="p-2 rounded-lg text-gray-400 hover:bg-white hover:text-indigo-600 transition-all shadow-sm border border-transparent hover:border-gray-100">
                          <MoreVertical className="h-5 w-5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GradeListPage;
