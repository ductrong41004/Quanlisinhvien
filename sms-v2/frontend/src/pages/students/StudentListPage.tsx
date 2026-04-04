import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';
import {
  UserPlus, Search, Filter, MoreHorizontal, User, Mail, Hash,
  BookOpen, Download, X, Pencil, Trash2, ChevronLeft, ChevronRight,
  AlertTriangle, Check, Loader2,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────
interface StudentData {
  _id: string;
  studentCode: string;
  fullName: string;
  dob: string;
  gender: string;
  address?: string;
  phoneNumber?: string;
  user?: { email: string };
  class?: { _id: string; name: string };
}

interface PaginatedResponse {
  data: StudentData[];
  total: number;
  page: number;
  totalPages: number;
}

interface ClassData {
  _id: string;
  name: string;
}

// ─── Debounce Hook ────────────────────────────────────────────────
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// ─── Student Modal (Add / Edit) ───────────────────────────────────
const StudentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  student?: StudentData | null;
  classes: ClassData[];
  onSuccess: () => void;
}> = ({ isOpen, onClose, student, classes, onSuccess }) => {
  const isEditing = !!student;
  const [form, setForm] = useState({
    fullName: '',
    studentCode: '',
    dob: '',
    gender: 'MALE',
    class: '',
    phoneNumber: '',
    address: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (student) {
      setForm({
        fullName: student.fullName || '',
        studentCode: student.studentCode || '',
        dob: student.dob ? new Date(student.dob).toISOString().split('T')[0] : '',
        gender: student.gender || 'MALE',
        class: student.class?._id || '',
        phoneNumber: student.phoneNumber || '',
        address: student.address || '',
        email: student.user?.email || '',
      });
    } else {
      setForm({
        fullName: '',
        studentCode: '',
        dob: '',
        gender: 'MALE',
        class: '',
        phoneNumber: '',
        address: '',
        email: '',
      });
    }
    setError('');
  }, [student, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isEditing) {
        await axiosInstance.patch(`/students/${student!._id}`, {
          fullName: form.fullName,
          dob: form.dob,
          gender: form.gender,
          class: form.class || undefined,
          phoneNumber: form.phoneNumber,
          address: form.address,
        });
      } else {
        await axiosInstance.post('/students/with-user', {
          fullName: form.fullName,
          studentCode: form.studentCode,
          dob: form.dob,
          gender: form.gender,
          class: form.class || undefined,
          phoneNumber: form.phoneNumber,
          address: form.address,
          email: form.email || undefined,
        });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg transform rounded-2xl bg-white shadow-2xl transition-all"
          onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h3 className="text-lg font-bold text-gray-900">
              {isEditing ? 'Chỉnh sửa Sinh viên' : 'Thêm Sinh viên mới'}
            </h3>
            <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Họ và tên *</label>
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Nguyễn Văn A"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Mã sinh viên *</label>
                <input
                  type="text"
                  required
                  disabled={isEditing}
                  value={form.studentCode}
                  onChange={(e) => setForm({ ...form, studentCode: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="SV2026001"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Ngày sinh *</label>
                <input
                  type="date"
                  required
                  value={form.dob}
                  onChange={(e) => setForm({ ...form, dob: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Giới tính *</label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                >
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Lớp</label>
                <select
                  value={form.class}
                  onChange={(e) => setForm({ ...form, class: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                >
                  <option value="">-- Chọn lớp --</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>{cls.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Số điện thoại</label>
                <input
                  type="text"
                  value={form.phoneNumber}
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="0912345678"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {isEditing ? 'Email' : 'Email (tùy chọn)'}
                </label>
                <input
                  type="email"
                  disabled={isEditing}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="sv@student.school.com"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Địa chỉ</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="123 Đường ABC, Quận 1, TP.HCM"
                />
              </div>
            </div>

            {!isEditing && (
              <div className="rounded-xl bg-indigo-50 p-3 text-xs text-indigo-700 border border-indigo-100">
                <strong>Lưu ý:</strong> Hệ thống sẽ tự động tạo tài khoản đăng nhập cho sinh viên.<br />
                Username: <strong>Mã sinh viên</strong> | Password mặc định: <strong>Student@123</strong>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center rounded-xl border border-transparent bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-indigo-700 disabled:opacity-50 transition-all transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                {isEditing ? 'Cập nhật' : 'Thêm sinh viên'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ─── Delete Confirmation Modal ────────────────────────────────────
const DeleteConfirmModal: React.FC<{
  isOpen: boolean;
  student: StudentData | null;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}> = ({ isOpen, student, onClose, onConfirm, loading }) => {
  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-sm transform rounded-2xl bg-white p-6 shadow-2xl text-center"
          onClick={(e) => e.stopPropagation()}>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-7 w-7 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Xóa sinh viên?</h3>
          <p className="text-sm text-gray-500 mb-6">
            Bạn có chắc chắn muốn xóa sinh viên <strong>{student.fullName}</strong> ({student.studentCode})?
            Hành động này không thể hoàn tác.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={onClose}
              className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="inline-flex items-center rounded-xl border border-transparent bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-red-700 disabled:opacity-50 transition-all"
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Action Dropdown ──────────────────────────────────────────────
const ActionDropdown: React.FC<{
  student: StudentData;
  onEdit: (s: StudentData) => void;
  onDelete: (s: StudentData) => void;
}> = ({ student, onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-40 rounded-xl bg-white shadow-xl border border-gray-100 py-1 z-20 animate-in fade-in zoom-in-95 duration-200">
          <button
            onClick={() => { onEdit(student); setOpen(false); }}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
          >
            <Pencil className="h-4 w-4" />
            Chỉnh sửa
          </button>
          <button
            onClick={() => { onDelete(student); setOpen(false); }}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Xóa
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Main Page Component ──────────────────────────────────────────
const StudentListPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Search & filter state
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 300);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterGender, setFilterGender] = useState('');
  const [filterClass, setFilterClass] = useState('');

  // Pagination state
  const [page, setPage] = useState(1);
  const limit = 10;

  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<StudentData | null>(null);
  const [deleteStudent, setDeleteStudent] = useState<StudentData | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [debouncedSearch, filterGender, filterClass]);

  // Fetch students
  const { data: studentsResponse, isLoading } = useQuery<PaginatedResponse>({
    queryKey: ['students', debouncedSearch, filterGender, filterClass, page],
    queryFn: async () => {
      const params: any = { page, limit };
      if (debouncedSearch) params.search = debouncedSearch;
      if (filterGender) params.gender = filterGender;
      if (filterClass) params.class = filterClass;
      const response = await axiosInstance.get('/students', { params });
      return response.data;
    },
  });

  // Fetch classes for filter & form
  const { data: classes = [] } = useQuery<ClassData[]>({
    queryKey: ['classes'],
    queryFn: async () => {
      const response = await axiosInstance.get('/classes');
      return response.data;
    },
  });

  const students = studentsResponse?.data || [];
  const totalStudents = studentsResponse?.total || 0;
  const totalPages = studentsResponse?.totalPages || 1;

  // Handlers
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['students'] });
  };

  const handleDelete = async () => {
    if (!deleteStudent) return;
    setDeleteLoading(true);
    try {
      await axiosInstance.delete(`/students/${deleteStudent._id}`);
      handleRefresh();
      setDeleteStudent(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể xóa sinh viên.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const params: any = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (filterGender) params.gender = filterGender;
      if (filterClass) params.class = filterClass;

      const response = await axiosInstance.get('/students/export/excel', {
        params,
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'DanhSachSinhVien.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting excel:', error);
      alert('Không thể xuất file Excel. Vui lòng thử lại.');
    }
  };

  const clearFilters = () => {
    setFilterGender('');
    setFilterClass('');
  };

  const hasActiveFilters = filterGender || filterClass;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Danh sách Sinh viên</h1>
          <p className="mt-1 text-sm text-gray-500">Quản lý và theo dõi thông tin chi tiết từng sinh viên trong hệ thống.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center px-4 py-2.5 border border-indigo-200 rounded-xl shadow-sm text-sm font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-all transform hover:-translate-y-0.5"
          >
            <Download className="h-5 w-5 mr-2" />
            Xuất Excel
          </button>
          <button
            onClick={() => setAddModalOpen(true)}
            className="inline-flex items-center px-4 py-2.5 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all transform hover:-translate-y-0.5"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            Thêm Sinh viên
          </button>
        </div>
      </div>

      <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </span>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                placeholder="Tìm kiếm theo tên hoặc mã sinh viên..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={`inline-flex items-center px-4 py-2 border rounded-xl shadow-sm text-sm font-medium transition-colors ${
                hasActiveFilters
                  ? 'border-indigo-300 text-indigo-700 bg-indigo-50 hover:bg-indigo-100'
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              <Filter className={`h-5 w-5 mr-2 ${hasActiveFilters ? 'text-indigo-500' : 'text-gray-400'}`} />
              Bộ lọc
              {hasActiveFilters && (
                <span className="ml-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-indigo-600 text-white text-xs font-bold">
                  {(filterGender ? 1 : 0) + (filterClass ? 1 : 0)}
                </span>
              )}
            </button>
          </div>

          {/* Filter Panel */}
          {filterOpen && (
            <div className="flex flex-wrap items-end gap-4 p-4 bg-white rounded-xl border border-gray-200 animate-in slide-in-from-top-2 duration-200">
              <div className="min-w-[160px]">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Giới tính</label>
                <select
                  value={filterGender}
                  onChange={(e) => setFilterGender(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                >
                  <option value="">Tất cả</option>
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>
              <div className="min-w-[200px]">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Lớp</label>
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                >
                  <option value="">Tất cả</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>{cls.name}</option>
                  ))}
                </select>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4 mr-1" />
                  Xóa bộ lọc
                </button>
              )}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Sinh viên</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Mã SV</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Lớp</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Giới tính</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Ngày sinh</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                      <span>Đang tải dữ liệu...</span>
                    </div>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <User className="h-10 w-10 text-gray-300" />
                      <span className="text-base font-medium">Không tìm thấy sinh viên nào.</span>
                      <span className="text-xs">Hãy thử thay đổi bộ lọc hoặc thêm sinh viên mới.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-indigo-100 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900">{student.fullName}</div>
                          <div className="text-xs text-gray-500 flex items-center">
                            <Mail className="h-3 w-3 mr-1" /> {student.user?.email || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
                        <Hash className="h-3 w-3 mr-1" /> {student.studentCode}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium flex items-center">
                        <BookOpen className="h-4 w-4 mr-2 text-gray-400" />
                        {student.class?.name || 'Chưa gán'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        student.gender === 'MALE' ? 'bg-blue-50 text-blue-700' :
                        student.gender === 'FEMALE' ? 'bg-pink-50 text-pink-700' : 'bg-gray-50 text-gray-700'
                      }`}>
                        {student.gender === 'MALE' ? 'Nam' : student.gender === 'FEMALE' ? 'Nữ' : 'Khác'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(student.dob).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <ActionDropdown
                        student={student}
                        onEdit={(s) => setEditStudent(s)}
                        onDelete={(s) => setDeleteStudent(s)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <div className="text-xs text-gray-500 font-medium tracking-tight">
            Hiển thị <span className="font-bold">{students.length}</span> / <span className="font-bold">{totalStudents}</span> sinh viên
            {totalPages > 1 && (
              <span> — Trang <span className="font-bold">{page}</span> / <span className="font-bold">{totalPages}</span></span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-bold text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Trước
            </button>
            <button
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-bold text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Sau
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <StudentModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        classes={classes}
        onSuccess={handleRefresh}
      />
      <StudentModal
        isOpen={!!editStudent}
        onClose={() => setEditStudent(null)}
        student={editStudent}
        classes={classes}
        onSuccess={handleRefresh}
      />
      <DeleteConfirmModal
        isOpen={!!deleteStudent}
        student={deleteStudent}
        onClose={() => setDeleteStudent(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </div>
  );
};

export default StudentListPage;
