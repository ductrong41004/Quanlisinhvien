import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';
import { useAuthStore } from '../../store/useAuthStore';
import { User, Mail, UserPlus, Edit2, Trash2, X, ShieldAlert } from 'lucide-react';

const TeacherListPage: React.FC = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'ADMIN';

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  // Fetch Teachers
  const { data: teachers, isLoading } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      const response = await axiosInstance.get('/users/teachers');
      return response.data;
    },
    enabled: isAdmin,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => axiosInstance.post('/users/teachers', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      setIsModalOpen(false);
      alert('Tạo Giảng viên thành công!');
    },
    onError: (err: any) => alert(`Lỗi: ${err.response?.data?.message || err.message}`)
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => axiosInstance.patch(`/users/teachers/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      setIsModalOpen(false);
      alert('Cập nhật tài khoản thành công!');
    },
    onError: (err: any) => alert(`Lỗi: ${err.response?.data?.message || err.message}`)
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axiosInstance.delete(`/users/teachers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      alert('Đã xóa tài khoản Giảng viên!');
    },
    onError: (err: any) => alert(`Lỗi: ${err.response?.data?.message || err.message}`)
  });

  const handleOpenModal = (t?: any) => {
    if (t) {
      setEditingId(t._id);
      setFormData({
        username: t.username,
        email: t.email,
        password: '', // Leave empty when editing unless changing
      });
    } else {
      setEditingId(null);
      setFormData({ username: '', email: '', password: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData };
    if (editingId && !payload.password) {
      delete (payload as any).password; // do not update password if empty
    }
    
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      if (!payload.password) return alert('Mật khẩu không được để trống khi tạo mới');
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa Giảng viên ${name} không? Thao tác này không thể hoàn tác.`)) {
      deleteMutation.mutate(id);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-red-500">
        <ShieldAlert className="h-16 w-16 mb-4" />
        <h2 className="text-xl font-bold">Bạn không có quyền truy cập trang này</h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Danh sách Giảng viên</h1>
          <p className="mt-1 text-sm text-gray-500">Quản lý tài khoản và phân quyền cho lực lượng sư phạm.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="inline-flex items-center px-4 py-2.5 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all transform hover:-translate-y-0.5">
          <UserPlus className="h-5 w-5 mr-2" />
          Thêm Giảng viên
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-500 font-medium">Đang tải danh sách...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {teachers?.map((item: any) => (
            <div key={item._id} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1 flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                    <span className="text-indigo-700 font-bold text-lg uppercase">{item.username.charAt(0)}</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100">
                      GIÁO VIÊN
                    </div>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-1">{item.username}</h3>
                
                <div className="space-y-3 mt-4">
                  <div className="flex items-center text-sm text-gray-700">
                    <Mail className="h-4 w-4 mr-2 text-indigo-500" />
                    <span className="text-gray-500">{item.email}</span>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end items-center mt-auto gap-2">
                <button onClick={() => handleOpenModal(item)} className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors border border-transparent hover:border-indigo-200">
                  <Edit2 className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(item._id, item.username)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-transparent hover:border-red-200">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!isLoading && teachers?.length === 0 && (
        <div className="bg-white rounded-2xl p-20 text-center border-2 border-dashed border-gray-200">
          <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Chưa có tài khoản Giảng viên nào.</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h3 className="text-lg font-bold text-gray-900">
                {editingId ? 'Sửa thông tin Giảng viên' : 'Thêm Giảng viên mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tên đăng nhập (Username) *</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="teacher_xyz"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="xyz@school.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Mật khẩu {editingId ? '(Bỏ trống nếu không đổi)' : '*'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="••••••••"
                />
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

export default TeacherListPage;
