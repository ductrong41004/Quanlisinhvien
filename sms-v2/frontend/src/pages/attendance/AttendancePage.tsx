import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';
import { useAuthStore } from '../../store/useAuthStore';
import { Calendar as CalendarIcon, CheckCircle, XCircle, AlertCircle, QrCode, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const AttendancePage: React.FC = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const isAdminOrTeacher = user?.role === 'ADMIN' || user?.role === 'TEACHER';

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showQR, setShowQR] = useState(false);
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [qrExpiresAt, setQrExpiresAt] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Mutation tạo mã QR bảo mật
  const generateQRMutation = useMutation({
    mutationFn: async () => {
      const resp = await axiosInstance.post('/attendance/qr/generate', { 
        classId: selectedClass, 
        date: selectedDate 
      });
      return resp.data;
    },
    onSuccess: (data) => {
      setQrToken(data.token);
      setQrExpiresAt(data.expiresAt);
      setShowQR(true);
    }
  });

  // Effect xử lý đếm ngược cho QR Code
  React.useEffect(() => {
    let timer: any;
    if (showQR && qrExpiresAt) {
      const calculateTime = () => {
        const diff = Math.floor((new Date(qrExpiresAt).getTime() - Date.now()) / 1000);
        if (diff <= 0) {
          setTimeLeft(0);
          setQrToken(null); // Vô hiệu hoá token cũ
        } else {
          setTimeLeft(diff);
        }
      };

      calculateTime();
      timer = setInterval(calculateTime, 1000);
    }
    return () => clearInterval(timer);
  }, [showQR, qrExpiresAt]);

  const handleGenerateQR = () => {
    generateQRMutation.mutate();
  };

  // Lấy danh sách lớp học
  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const resp = await axiosInstance.get('/classes');
      return resp.data;
    }
  });

  // Lấy danh sách sinh viên theo lớp đã chọn
  const { data: studentsData, isLoading: isLoadingStudents } = useQuery({
    queryKey: ['students', selectedClass],
    queryFn: async () => {
      // Dùng limit lớn để lấy tất cả sinh viên trong lớp điểm danh
      const resp = await axiosInstance.get('/students', { params: { class: selectedClass, limit: 100 } });
      return resp.data;
    },
    enabled: !!selectedClass
  });
  
  const students = studentsData?.data || [];

  // Lấy ds điểm danh của lớp trong ngày đã chọn
  const { data: attendanceRecords } = useQuery({
    queryKey: ['attendance', selectedClass, selectedDate],
    queryFn: async () => {
      const resp = await axiosInstance.get('/attendance/by-class', {
        params: { classId: selectedClass, date: selectedDate }
      });
      return resp.data;
    },
    enabled: !!selectedClass && !!selectedDate,
    refetchInterval: 5000 // Tự động refetch mỗi 5 giây để thấy SV điểm danh realtime
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
    if (!attendanceRecords) return 'ABSENT'; // Mặc định là vắng mặt nếu chưa điểm danh
    const record = attendanceRecords.find((r: any) => r.student?._id === studentId);
    return record ? record.status : 'ABSENT';
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
        {isAdminOrTeacher && (
          <button 
            onClick={handleGenerateQR}
            disabled={!selectedClass || !selectedDate || generateQRMutation.isPending}
            className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <QrCode className="h-5 w-5 mr-2" />
            {generateQRMutation.isPending ? 'Đang tạo...' : 'Mã QR Điểm Danh'}
          </button>
        )}
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

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">Quét mã Điểm danh</h3>
              <button 
                onClick={() => setShowQR(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-8 flex flex-col items-center">
              <div className="bg-white p-4 shadow-xl border border-gray-100 rounded-2xl mb-6 relative">
                {qrToken ? (
                  <QRCodeSVG 
                    value={`${window.location.protocol}//${window.location.hostname === 'localhost' ? '192.168.100.160' : window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}/checkin?token=${qrToken}`} 
                    size={220}
                    level="H"
                    includeMargin={true}
                  />
                ) : (
                  <div className="w-[220px] h-[220px] flex items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <p className="text-xs text-red-500 font-bold text-center px-4">Mã đã hết hạn.<br/>Vui lòng đóng và tạo lại.</p>
                  </div>
                )}
              </div>
              
              {qrToken && (
                <div className="mb-4 flex flex-col items-center">
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Mã hết hạn sau</span>
                  <div className={`text-2xl font-mono font-black ${timeLeft < 30 ? 'text-red-500 animate-pulse' : 'text-indigo-600'}`}>
                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                  </div>
                </div>
              )}

              <p className="text-center text-sm text-gray-500 font-medium leading-relaxed">
                Sinh viên quét mã này để tự động ghi nhận điểm danh vào hệ thống.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};


export default AttendancePage;
