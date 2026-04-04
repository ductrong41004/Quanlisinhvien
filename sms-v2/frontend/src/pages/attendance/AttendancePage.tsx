import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';
import { Calendar as CalendarIcon, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const AttendancePage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Lấy danh sách lớp học
  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const resp = await axiosInstance.get('/classes');
      return resp.data;
    }
  });

  // Lấy danh sách sinh viên theo lớp đã chọn
  // Lưu ý: api students cần hỗ trợ filter theo class, ta dùng params: { class: selectedClass }
  const { data: students, isLoading: isLoadingStudents } = useQuery({
    queryKey: ['students', selectedClass],
    queryFn: async () => {
      const resp = await axiosInstance.get('/students', { params: { class: selectedClass } });
      return resp.data;
    },
    enabled: !!selectedClass
  });

  // Lấy ds điểm danh của lớp trong ngày đã chọn
  const { data: attendanceRecords } = useQuery({
    queryKey: ['attendance', selectedClass, selectedDate],
    queryFn: async () => {
      const resp = await axiosInstance.get('/attendance/by-class', {
        params: { classId: selectedClass, date: selectedDate }
      });
      return resp.data;
    },
    enabled: !!selectedClass && !!selectedDate
  });

  // Mutation để cập nhật điểm danh
  const upsertMutation = useMutation({
    mutationFn: async (data: { studentId: string, classId: string, date: string, status: string }) => {
      await axiosInstance.post('/attendance', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', selectedClass, selectedDate] });
    }
  });

  const getStatusOfStudent = (studentId: string) => {
    if (!attendanceRecords) return 'PRESENT'; // Mặc định là có mặt nếu chưa điểm danh
    const record = attendanceRecords.find((r: any) => r.student?._id === studentId);
    return record ? record.status : 'PRESENT';
  };

  const handleStatusChange = (studentId: string, status: string) => {
    upsertMutation.mutate({
      studentId,
      classId: selectedClass,
      date: selectedDate,
      status
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Quản Lý Điểm Danh</h1>
          <p className="mt-1 text-sm text-gray-500">Ghi nhận trạng thái có mặt của học sinh theo từng buổi học.</p>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-2xl p-6 mb-8 border border-gray-100 flex flex-col sm:flex-row gap-6">
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Chọn Lớp Học</label>
          <select 
            className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">-- Vui lòng chọn lớp --</option>
            {classes?.map((c: any) => (
              <option key={c._id} value={c._id}>{c.name} ({c.academicYear})</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Chọn Ngày</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
            </span>
            <input 
              type="date" 
              className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {selectedClass ? (
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-indigo-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-widest leading-6">Sinh viên</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-widest leading-6">Trạng thái Điểm Danh</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100 italic-last-row">
                {isLoadingStudents ? (
                   <tr><td colSpan={2} className="px-6 py-10 text-center">Đang tải danh sách...</td></tr>
                ) : students?.length === 0 ? (
                   <tr><td colSpan={2} className="px-6 py-10 text-center text-gray-500">Lớp này chưa có sinh viên nào.</td></tr>
                ) : (
                  students?.map((student: any) => {
                    const currentStatus = getStatusOfStudent(student._id);
                    return (
                      <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-gray-900">{student.fullName}</div>
                          <div className="text-xs text-gray-500 uppercase">{student.studentCode}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleStatusChange(student._id, 'PRESENT')}
                              className={`flex items-center px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                                currentStatus === 'PRESENT' 
                                ? 'bg-green-100 text-green-700 border-green-200 shadow-inner' 
                                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              <CheckCircle className="h-4 w-4 mr-1.5" /> Có mặt
                            </button>
                            <button 
                              onClick={() => handleStatusChange(student._id, 'ABSENT')}
                              className={`flex items-center px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                                currentStatus === 'ABSENT' 
                                ? 'bg-red-100 text-red-700 border-red-200 shadow-inner' 
                                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              <XCircle className="h-4 w-4 mr-1.5" /> Vắng mặt
                            </button>
                            <button 
                              onClick={() => handleStatusChange(student._id, 'EXCUSED')}
                              className={`flex items-center px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                                currentStatus === 'EXCUSED' 
                                ? 'bg-yellow-100 text-yellow-700 border-yellow-200 shadow-inner' 
                                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              <AlertCircle className="h-4 w-4 mr-1.5" /> Có phép
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white shadow rounded-2xl border border-gray-100">
          <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Vui lòng chọn Lớp học ở trên để tiến hành điểm danh.</p>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;
