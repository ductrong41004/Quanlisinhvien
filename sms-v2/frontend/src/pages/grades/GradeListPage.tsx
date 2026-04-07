import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';
import { useAuthStore } from '../../store/useAuthStore';
import { ClipboardList, User, Book, Calculator, Star, Edit2, Trash2, Plus, Save, ArrowLeft } from 'lucide-react';

const GradeListPage: React.FC = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const isAdminOrTeacher = user?.role === 'ADMIN' || user?.role === 'TEACHER';

  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [selectedClass, setSelectedClass] = useState<string>('');
  
  // Bulks Entry State
  const [subjectName, setSubjectName] = useState('');
  const [semester, setSemester] = useState('Học kỳ 1 - 2025');
  const [bulkGrades, setBulkGrades] = useState<Record<string, { midtermScore: string, finalScore: string }>>({});

  // Fetch Classes
  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const response = await axiosInstance.get('/classes');
      return response.data;
    },
  });

  // Fetch Grades (View Mode)
  const { data: grades, isLoading } = useQuery({
    queryKey: ['grades', selectedClass, mode],
    queryFn: async () => {
      if (mode !== 'view') return [];
      const params = selectedClass ? { classId: selectedClass } : {};
      const response = await axiosInstance.get('/grades', { params });
      return response.data;
    },
    enabled: mode === 'view'
  });

  // Fetch Students for Class (Edit Mode)
  const { data: students = [] } = useQuery({
    queryKey: ['students-class', selectedClass],
    queryFn: async () => {
      const response = await axiosInstance.get('/students?limit=2000');
      const allStudents = response.data?.data || [];
      return allStudents.filter((s: any) => s.classes && s.classes.some((c: any) => (typeof c === 'object' ? c._id === selectedClass : c === selectedClass)));
    },
    enabled: mode === 'edit' && !!selectedClass
  });

  // Once students are loaded, if we want to preload existing grades, we could fetch them here
  const { data: existingClassGrades = [] } = useQuery({
    queryKey: ['existing-grades', selectedClass, subjectName, semester],
    queryFn: async () => {
      if (!selectedClass || !subjectName || !semester) return [];
      const response = await axiosInstance.get('/grades', { params: { classId: selectedClass, subjectName, semester } });
      return response.data;
    },
    enabled: mode === 'edit' && !!selectedClass && !!subjectName && !!semester
  });

  // Effect to populate bulkGrades when existingClassGrades or students change
  useEffect(() => {
    if (mode === 'edit') {
      const newBulkGrades: any = {};
      const actualGradesList = existingClassGrades?.length ? existingClassGrades : existingClassGrades?.data || []; // Just in case it's paginated
      
      students.forEach((student: any) => {
        const existing = actualGradesList.find((eg: any) => 
          (typeof eg.student === 'object' ? eg.student._id : eg.student) === student._id
        );
        newBulkGrades[student._id] = {
          midtermScore: existing ? existing.midtermScore.toString() : '',
          finalScore: existing ? existing.finalScore.toString() : '',
        };
      });
      setBulkGrades(newBulkGrades);
    }
  }, [students, existingClassGrades, mode]);

  const handleGradeChange = (studentId: string, field: 'midtermScore' | 'finalScore', value: string) => {
    setBulkGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const bulkMutation = useMutation({
    mutationFn: (data: any[]) => axiosInstance.post('/grades/bulk', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades'] });
      alert('Đã lưu bảng điểm thành công!');
      setMode('view'); // back to view after save
    },
    onError: (err: any) => alert(`Lỗi: ${err.response?.data?.message || err.message}`)
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axiosInstance.delete(`/grades/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades'] });
      alert('Đã xóa bảng điểm!');
    },
    onError: (err: any) => alert(`Lỗi: ${err.response?.data?.message || err.message}`)
  });

  const handleBulkSave = () => {
    if (!selectedClass || !subjectName || !semester) {
      alert("Vui lòng nhập đủ Môn học và Học kỳ!");
      return;
    }

    const payload: any[] = [];
    students.forEach((student: any) => {
      const sId = student._id;
      const gradesInput = bulkGrades[sId];
      if (gradesInput && (gradesInput.midtermScore !== '' || gradesInput.finalScore !== '')) {
        payload.push({
          studentId: sId,
          subjectName,
          semester,
          midtermScore: Number(gradesInput.midtermScore),
          finalScore: Number(gradesInput.finalScore)
        });
      }
    });

    if (payload.length === 0) {
      alert("Không có số liệu điểm nào để lưu!");
      return;
    }

    bulkMutation.mutate(payload);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa bản ghi điểm này không?`)) {
      deleteMutation.mutate(id);
    }
  };

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
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {mode === 'view' ? 'Bảng điểm Sinh viên' : 'Nhập điểm Hàng loạt'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {mode === 'view' ? 'Quản lý và cập nhật kết quả học tập tự động.' : 'Nhanh chóng cập nhật điểm cho toàn bộ danh sách lớp.'}
          </p>
        </div>
        {isAdminOrTeacher && (
          <div className="flex gap-3">
            {mode === 'edit' ? (
              <>
                <button onClick={() => setMode('view')} className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-xl shadow-sm text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 transition-all">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Quay lại
                </button>
                <button 
                  onClick={handleBulkSave} 
                  disabled={bulkMutation.isPending}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-green-600 hover:bg-green-700 transition-all disabled:opacity-50"
                  >
                  <Save className="h-4 w-4 mr-2" />
                  {bulkMutation.isPending ? 'Đang lưu...' : 'Lưu tất cả'}
                </button>
              </>
            ) : (
              <button onClick={() => setMode('edit')} className="inline-flex items-center px-4 py-2.5 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all transform hover:-translate-y-0.5">
                <Calculator className="h-5 w-5 mr-2" />
                Nhập điểm Chớp nhoáng
              </button>
            )}
          </div>
        )}
      </div>

      <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100">
        
        {/* Filter / Config Bar */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full flex flex-col md:flex-row gap-4">
            <div className="flex flex-col gap-1 w-full md:w-64">
              <label className="text-sm font-semibold text-gray-700">Lớp học</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 bg-white font-medium text-gray-800 outline-none"
              >
                <option value="">-- {mode === 'edit' ? 'Bắt buộc chọn lớp' : 'Tất cả các lớp'} --</option>
                {Array.isArray(classes) ? classes.map((c: any) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                )) : null}
              </select>
            </div>

            {mode === 'edit' && (
              <>
                <div className="flex flex-col gap-1 w-full md:w-64">
                  <label className="text-sm font-semibold text-gray-700">Môn học *</label>
                  <input
                    type="text"
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    placeholder="VD: Toán học"
                    className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 bg-white outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1 w-full md:w-64">
                  <label className="text-sm font-semibold text-gray-700">Học kỳ *</label>
                  <input
                    type="text"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    placeholder="VD: Học kỳ 1 - 2025"
                    className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 bg-white outline-none"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* VIEW MODE TABLE */}
        {mode === 'view' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/80 backdrop-blur-sm">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest leading-6">Sinh viên & Môn học</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest leading-6">Giữa kỳ (30%)</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest leading-6">Cuối kỳ (70%)</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest leading-6">Tổng kết</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest leading-6">Xếp loại</th>
                  {isAdminOrTeacher && (
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest leading-6">Thao tác</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
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
                      Không có dữ liệu bảng điểm.
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
                            <div className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors uppercase">{grade.student?.fullName || grade.student?.studentCode || 'N/A'}</div>
                            <div className="text-xs text-gray-400 flex items-center mt-0.5">
                              <Book className="h-3 w-3 mr-1" />
                              {grade.subjectName} • {grade.semester}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-semibold text-gray-600">{grade.midtermScore?.toFixed(1)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-semibold text-gray-600">{grade.finalScore?.toFixed(1)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-lg font-black text-indigo-700 tracking-tighter">
                          {grade.totalScore?.toFixed(2)}
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
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleDelete(grade._id)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-transparent hover:border-red-200">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* EDIT MODE (SPREADSHEET) TABLE */}
        {mode === 'edit' && (
          <div className="overflow-x-auto bg-gray-50">
            {!selectedClass ? (
              <div className="py-24 text-center text-gray-500 bg-white">
                <Calculator className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium text-gray-700">Vui lòng chọn một Lớp học để bắt đầu nhập bảng điểm.</p>
                <p className="text-sm mt-1">Danh sách sinh viên của lớp đó sẽ hiển thị tại đây.</p>
              </div>
            ) : students.length === 0 ? (
              <div className="py-24 text-center text-gray-500 bg-white">
                <User className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium text-gray-700">Lớp học này hiện chưa có sinh viên nào.</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 relative">
                <thead className="bg-indigo-50/50 backdrop-blur-sm sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-extrabold text-indigo-900 uppercase tracking-widest leading-6 w-1/3">Họ và Tên Sinh Viên</th>
                    <th className="px-6 py-4 text-center text-xs font-extrabold text-indigo-900 uppercase tracking-widest leading-6">Điểm Giữa Kỳ (30%)</th>
                    <th className="px-6 py-4 text-center text-xs font-extrabold text-indigo-900 uppercase tracking-widest leading-6">Điểm Cuối Kỳ (70%)</th>
                    <th className="px-6 py-4 text-center text-xs font-extrabold text-indigo-900 uppercase tracking-widest leading-6">Tạm tính Tổng</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {students.map((student: any) => {
                    const gradeInput = bulkGrades[student._id] || { midtermScore: '', finalScore: '' };
                    let totalPreview: number | null = null;
                    if (gradeInput.midtermScore !== '' && gradeInput.finalScore !== '') {
                       totalPreview = Number(gradeInput.midtermScore) * 0.3 + Number(gradeInput.finalScore) * 0.7;
                    }

                    return (
                      <tr key={student._id} className="hover:bg-indigo-50/30 transition-colors">
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900 uppercase">{student.fullName}</span>
                            <span className="text-xs font-medium text-gray-500">{student.studentCode}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-center">
                          <input 
                            type="number" step="0.1" min="0" max="10"
                            value={gradeInput.midtermScore}
                            onChange={(e) => handleGradeChange(student._id, 'midtermScore', e.target.value)}
                            className="w-24 text-center rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none mx-auto block font-semibold text-gray-700 bg-white"
                            placeholder="-"
                          />
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-center">
                          <input 
                            type="number" step="0.1" min="0" max="10"
                            value={gradeInput.finalScore}
                            onChange={(e) => handleGradeChange(student._id, 'finalScore', e.target.value)}
                            className="w-24 text-center rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none mx-auto block font-semibold text-gray-700 bg-white"
                            placeholder="-"
                          />
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-center bg-gray-50/30">
                          <span className={`text-lg font-black tracking-tight ${totalPreview !== null ? 'text-indigo-600' : 'text-gray-300'}`}>
                            {totalPreview !== null ? totalPreview.toFixed(2) : '-'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
            
            {selectedClass && students.length > 0 && (
              <div className="bg-indigo-50 p-4 border-t border-indigo-100 flex items-center justify-between sticky bottom-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <p className="text-sm text-indigo-800 flex items-center font-medium">
                  <Calculator className="h-5 w-5 mr-3 flex-shrink-0 text-indigo-600" />
                  Bạn có thể ấn phím <kbd className="font-sans mx-2 px-2 py-0.5 bg-white border border-indigo-200 rounded shadow-sm">Tab</kbd> để nhập liên tục. Các sinh viên bỏ trống sẽ bị bỏ qua.
                </p>
                <button 
                  onClick={handleBulkSave} 
                  disabled={bulkMutation.isPending}
                  className="whitespace-nowrap ml-4 inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-green-600 hover:bg-green-700 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                  <Save className="h-5 w-5 mr-2" />
                  {bulkMutation.isPending ? 'Đang xử lý...' : 'Lưu toàn bộ danh sách'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GradeListPage;
