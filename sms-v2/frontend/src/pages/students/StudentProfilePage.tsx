import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';
import {
  User, Mail, Hash, BookOpen, Phone, MapPin, Calendar,
  GraduationCap, Award, TrendingUp, Loader2, CalendarCheck, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';

const StudentProfilePage: React.FC = () => {
  // Lấy hồ sơ sinh viên từ /students/me
  const { data: student, isLoading: loadingProfile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: async () => {
      const resp = await axiosInstance.get('/students/me');
      return resp.data;
    },
  });

  // Lấy điểm số từ /grades/my-grades
  const { data: gradeData, isLoading: loadingGrades } = useQuery({
    queryKey: ['my-grades'],
    queryFn: async () => {
      const resp = await axiosInstance.get('/grades/my-grades');
      return resp.data;
    },
  });

  // Lấy thông tin điểm danh
  const { data: attendanceData, isLoading: loadingAttendance } = useQuery({
    queryKey: ['my-attendance', student?._id, student?.class?._id],
    queryFn: async () => {
      const resp = await axiosInstance.get('/attendance/student-stats', {
        params: { studentId: student._id, classId: student.class._id }
      });
      return resp.data;
    },
    enabled: !!student?._id && !!student?.class?._id,
  });

  if (loadingProfile) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
          <span className="text-sm text-gray-500 font-medium">Đang tải hồ sơ...</span>
        </div>
      </div>
    );
  }

  const grades = gradeData?.grades || [];
  const average = gradeData?.average || '0.00';

  // Determine GPA color
  const avgNum = parseFloat(average);
  const avgColor = avgNum >= 8.5 ? 'text-green-600' : avgNum >= 7 ? 'text-blue-600' : avgNum >= 5.5 ? 'text-yellow-600' : 'text-red-600';
  const avgBg = avgNum >= 8.5 ? 'bg-green-50 border-green-200' : avgNum >= 7 ? 'bg-blue-50 border-blue-200' : avgNum >= 5.5 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 rounded-2xl shadow-xl p-8 mb-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative flex items-center gap-6">
          <div className="h-20 w-20 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center flex-shrink-0">
            <User className="h-10 w-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">{student?.fullName}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-indigo-100">
              <span className="inline-flex items-center gap-1 text-sm">
                <Hash className="h-4 w-4" /> {student?.studentCode}
              </span>
              <span className="inline-flex items-center gap-1 text-sm">
                <BookOpen className="h-4 w-4" /> {student?.class?.name || 'Chưa gán lớp'}
              </span>
              <span className="inline-flex items-center gap-1 text-sm">
                <Mail className="h-4 w-4" /> {student?.user?.email || 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Thông tin cá nhân */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <User className="h-5 w-5 text-indigo-600" />
              Thông tin cá nhân
            </h2>
            <div className="space-y-4">
              <InfoItem icon={<Calendar className="h-4 w-4" />} label="Ngày sinh" value={student?.dob ? new Date(student.dob).toLocaleDateString('vi-VN') : 'N/A'} />
              <InfoItem icon={<User className="h-4 w-4" />} label="Giới tính" value={student?.gender === 'MALE' ? 'Nam' : student?.gender === 'FEMALE' ? 'Nữ' : 'Khác'} />
              <InfoItem icon={<Phone className="h-4 w-4" />} label="Số điện thoại" value={student?.phoneNumber || 'Chưa cập nhật'} />
              <InfoItem icon={<MapPin className="h-4 w-4" />} label="Địa chỉ" value={student?.address || 'Chưa cập nhật'} />
              <InfoItem icon={<BookOpen className="h-4 w-4" />} label="Lớp học" value={student?.class?.name || 'Chưa gán'} />
            </div>
          </div>

          {/* GPA Summary */}
          <div className={`mt-6 rounded-2xl shadow-lg border p-6 ${avgBg}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Điểm trung bình</p>
                <p className={`text-4xl font-black ${avgColor}`}>{average}</p>
              </div>
              <div className={`h-14 w-14 rounded-full flex items-center justify-center ${avgColor} bg-white shadow-md`}>
                <TrendingUp className="h-7 w-7" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">{gradeData?.count || 0} môn học đã có điểm</p>
          </div>

          {/* Attendance Summary */}
          <div className="mt-6 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-indigo-600" />
              Tóm tắt điểm danh
            </h2>
            {loadingAttendance ? (
               <div className="flex justify-center p-4">
                 <Loader2 className="h-6 w-6 text-indigo-600 animate-spin" />
               </div>
            ) : attendanceData ? (
              <div className="grid grid-cols-2 gap-3">
                 <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                    <p className="text-[10px] uppercase font-bold text-gray-500">Tổng số buổi</p>
                    <p className="text-xl font-black text-gray-800">{attendanceData.total}</p>
                 </div>
                 <div className="bg-green-50 rounded-xl p-3 text-center border border-green-100">
                    <p className="text-[10px] uppercase font-bold text-green-600 flex items-center justify-center gap-1">
                      <CheckCircle className="h-3 w-3" /> Có mặt
                    </p>
                    <p className="text-xl font-black text-green-700">{attendanceData.present}</p>
                 </div>
                 <div className="bg-red-50 rounded-xl p-3 text-center border border-red-100">
                    <p className="text-[10px] uppercase font-bold text-red-600 flex items-center justify-center gap-1">
                      <XCircle className="h-3 w-3" /> Vắng mặt
                    </p>
                    <p className="text-xl font-black text-red-700">{attendanceData.absent}</p>
                 </div>
                 <div className="bg-yellow-50 rounded-xl p-3 text-center border border-yellow-100">
                    <p className="text-[10px] uppercase font-bold text-yellow-600 flex items-center justify-center gap-1">
                      <AlertCircle className="h-3 w-3" /> Có phép
                    </p>
                    <p className="text-xl font-black text-yellow-700">{attendanceData.excused}</p>
                 </div>
              </div>
            ) : (
                <p className="text-sm text-gray-500 italic text-center py-4 bg-gray-50 rounded-xl">Không có dữ liệu điểm danh</p>
            )}
          </div>
        </div>

        {/* Bảng điểm */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Award className="h-5 w-5 text-indigo-600" />
                Bảng điểm
              </h2>
              <span className="text-xs text-gray-500 font-medium">{grades.length} môn học</span>
            </div>

            {loadingGrades ? (
              <div className="py-16 flex justify-center">
                <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
              </div>
            ) : grades.length === 0 ? (
              <div className="py-16 text-center">
                <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Chưa có điểm nào được ghi nhận.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Môn học</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Học kỳ</th>
                      <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Giữa kỳ</th>
                      <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Cuối kỳ</th>
                      <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Tổng kết</th>
                      <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Xếp loại</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {grades.map((grade: any) => {
                      const letterColor =
                        grade.gradeLetter === 'A' ? 'bg-green-100 text-green-700' :
                        grade.gradeLetter === 'B' ? 'bg-blue-100 text-blue-700' :
                        grade.gradeLetter === 'C' ? 'bg-yellow-100 text-yellow-700' :
                        grade.gradeLetter === 'D' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700';

                      return (
                        <tr key={grade._id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                            {grade.subjectName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {grade.semester}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-700">
                            {grade.midtermScore?.toFixed(1)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-700">
                            {grade.finalScore?.toFixed(1)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-900">
                            {grade.totalScore?.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${letterColor}`}>
                              {grade.gradeLetter}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable info item component
const InfoItem: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
      {icon}
    </div>
    <div>
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value}</p>
    </div>
  </div>
);

export default StudentProfilePage;
