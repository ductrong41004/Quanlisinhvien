import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';
import { useAuthStore } from '../../store/useAuthStore';
import { ClipboardList, User, Book, Calculator, Star, Edit2, Trash2, X, Plus } from 'lucide-react';

const GradeListPage: React.FC = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const isAdminOrTeacher = user?.role === 'ADMIN' || user?.role === 'TEACHER';

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    student: '',
    subjectName: '',
    semester: '',
    midtermScore: '',
    finalScore: '',
  });

  // Fetch Grades
  const { data: grades, isLoading } = useQuery({
    queryKey: ['grades'],
    queryFn: async () => {
      const response = await axiosInstance.get('/grades');
      return response.data;
    },
  });

  // Fetch Students for Dropdown (only load if admin/teacher)
  const { data: students = [] } = useQuery({
    queryKey: ['students-basic'],
    queryFn: async () => {
      // Just fetch an unpaginated list to select from
      const response = await axiosInstance.get('/students?limit=2000');
      return response.data?.data || [];
    },
    enabled: isAdminOrTeacher,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => axiosInstance.post('/grades', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades'] });
      setIsModalOpen(false);
      alert('Đã nhập điểm thành công!');
    },
    onError: (err: any) => alert(`Lỗi: ${err.response?.data?.message || err.message}`)
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => axiosInstance.patch(`/grades/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades'] });
      setIsModalOpen(false);
      alert('Đã cập nhật điểm thành công!');
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

  const handleOpenModal = (g?: any) => {
    if (g) {
      setEditingId(g._id);
      setFormData({
        student: typeof g.student === 'object' ? g.student?._id : g.student || '',
        subjectName: g.subjectName,
        semester: g.semester,
        midtermScore: g.midtermScore.toString(),
        finalScore: g.finalScore.toString(),
      });
    } else {
      setEditingId(null);
      setFormData({ student: '', subjectName: '', semester: 'Học kỳ 1 - 2025', midtermScore: '', finalScore: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      student: formData.student,
      subjectName: formData.subjectName,
      semester: formData.semester,
      midtermScore: Number(formData.midtermScore),
      finalScore: Number(formData.finalScore),
    };
    
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
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
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Bảng điểm Sinh viên</h1>
          <p className="mt-1 text-sm text-gray-500">Quản lý và cập nhật kết quả học tập tự động.</p>
        </div>
        {isAdminOrTeacher && (
          <button onClick={() => handleOpenModal()} className="inline-flex items-center px-4 py-2.5 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all transform hover:-translate-y-0.5">
            <Plus className="h-5 w-5 mr-2" />
            Nhập điểm mới
          </button>
        )}
      </div>

      <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100">
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
                          <button onClick={() => handleOpenModal(grade)} className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors border border-transparent hover:border-indigo-200">
                            <Edit2 className="h-4 w-4" />
                          </button>
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
      </div>

      {/* Modal create/edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Calculator className="h-5 w-5 text-indigo-600" />
                {editingId ? 'Cập nhật điểm thi' : 'Nhập điểm mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Sinh viên *</label>
                <select
                  required
                  value={formData.student}
                  onChange={(e) => setFormData({ ...formData, student: e.target.value })}
                  disabled={false} // Cho phép sửa nếu lỡ nhập sai sinh viên
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none bg-white disabled:bg-gray-100"
                >
                  <option value="">-- Chọn sinh viên --</option>
                  {students.map((st: any) => (
                    <option key={st._id} value={st._id}>{st.studentCode} - {st.fullName}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Môn học *</label>
                  <input
                    type="text"
                    required
                    value={formData.subjectName}
                    onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="VD: Nhập môn C++"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Học kỳ *</label>
                  <input
                    type="text"
                    required
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="VD: HK1 2025-2026"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Điểm Giữa kỳ *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    required
                    value={formData.midtermScore}
                    onChange={(e) => setFormData({ ...formData, midtermScore: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="0.0 - 10.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Điểm Cuối kỳ *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    required
                    value={formData.finalScore}
                    onChange={(e) => setFormData({ ...formData, finalScore: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="0.0 - 10.0"
                  />
                </div>
              </div>

              <div className="bg-indigo-50 p-3 rounded-xl mt-2 border border-indigo-100 flex items-start gap-2">
                <Calculator className="h-5 w-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-indigo-800 leading-relaxed">
                  <strong>Hệ thống tự động tính:</strong> Tổng kết (30% Giữa kỳ + 70% Cuối kỳ) và tự động xếp loại Điểm Chữ (A,B,C,D,F). 
                  <br/>Hệ thống sẽ gửi thông báo (Notification) trực tiếp qua Web App cho sinh viên ngay sau khi lưu.
                </p>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
                >
                  {editingId ? 'Cập nhật điểm' : 'Lưu điểm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradeListPage;
