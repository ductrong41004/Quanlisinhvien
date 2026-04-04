import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';
import { useAuthStore } from '../../store/useAuthStore';
import { BookOpen, Users, User, Calendar, ExternalLink, Plus, Edit2, Trash2, X, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ClassListPage: React.FC = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'ADMIN';

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    academicYear: '',
    department: '',
    teacher: '',
  });

  // Fetch Classes
  const { data: classes, isLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const response = await axiosInstance.get('/classes');
      return response.data;
    },
  });

  // Fetch Teachers
  const { data: teachers = [] } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      const response = await axiosInstance.get('/users/teachers');
      return response.data;
    },
    enabled: isAdmin, // Only load if can create/edit
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => axiosInstance.post('/classes', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      setIsModalOpen(false);
      alert('Tạo Lớp học thành công!');
    },
    onError: (err: any) => alert(`Lỗi: ${err.response?.data?.message || err.message}`)
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => axiosInstance.patch(`/classes/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      setIsModalOpen(false);
      alert('Cập nhật Lớp học thành công!');
    },
    onError: (err: any) => alert(`Lỗi: ${err.response?.data?.message || err.message}`)
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axiosInstance.delete(`/classes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      alert('Đã xóa Lớp học!');
    },
    onError: (err: any) => alert(`Lỗi: ${err.response?.data?.message || err.message}`)
  });

  const handleOpenModal = (cls?: any) => {
    if (cls) {
      setEditingId(cls._id);
      setFormData({
        name: cls.name,
        academicYear: cls.academicYear,
        department: cls.department || '',
        teacher: cls.teacher?._id || '',
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', academicYear: new Date().getFullYear().toString(), department: '', teacher: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData, teacher: formData.teacher || undefined };
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa Lớp ${name} không? Thao tác này không thể hoàn tác.`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Danh sách Lớp học</h1>
          <p className="mt-1 text-sm text-gray-500">Xem và quản lý các lớp học, giáo viên phụ trách và niên khóa.</p>
        </div>
        {isAdmin && (
          <button onClick={() => handleOpenModal()} className="inline-flex items-center px-4 py-2.5 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all transform hover:-translate-y-0.5">
            <Plus className="h-5 w-5 mr-2" />
            Tạo Lớp mới
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-500 font-medium">Đang tải danh sách lớp học...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {classes?.map((item: any) => (
            <div key={item._id} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1 flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-indigo-50 p-3 rounded-xl group-hover:bg-indigo-600 transition-colors duration-300">
                    <BookOpen className="h-6 w-6 text-indigo-600 group-hover:text-white" />
                  </div>
                  <div className="flex gap-2">
                    <div className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-700 border border-green-100">
                      Đang hoạt động
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
                  {isAdmin && (
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenModal(item)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(item._id, item.name)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

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
              
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center mt-auto">
                <Link to={`/classes/${item._id}`} className="text-indigo-600 text-xs font-bold hover:text-indigo-800 flex items-center transition-colors">
                  <ExternalLink className="h-3 w-3 mr-1" /> Xem chi tiết
                </Link>
                <div className="flex items-center">
                  <div className="text-xs text-gray-500 font-medium mr-2">Tổng SV:</div>
                  <div className="flex -space-x-2">
                    <div className="h-7 w-7 rounded-full bg-gray-200 border-2 border-white"></div>
                    <div className="h-7 min-w-[28px] px-1 rounded-full bg-indigo-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-indigo-800">
                      +{item.studentCount || 0}
                    </div>
                  </div>
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
          {isAdmin && (
            <button onClick={() => handleOpenModal()} className="mt-4 text-indigo-600 font-bold hover:underline">Tạo lớp học đầu tiên ngay</button>
          )}
        </div>
      )}

      {/* Modal create/edit class */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 print:hidden animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h3 className="text-lg font-bold text-gray-900">
                {editingId ? 'Sửa thông tin Lớp học' : 'Tạo Lớp học mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tên lớp học *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Ví dụ: Lớp 12A1"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Niên khóa *</label>
                <input
                  type="text"
                  required
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Ví dụ: 2025-2026"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Khoa / Phòng ban</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Ví dụ: Khoa học Xã hội"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Giáo viên chủ nhiệm</label>
                <select
                  value={formData.teacher}
                  onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option value="">-- Chưa gán giáo viên --</option>
                  {teachers.map((t: any) => (
                    <option key={t._id} value={t._id}>{t.username} ({t.email})</option>
                  ))}
                </select>
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
                  {editingId ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassListPage;
