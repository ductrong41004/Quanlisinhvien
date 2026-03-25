import api from './api';

export const StudentService = {
  getAll: () => api.get('/students'),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
  search: (keyword) => api.get(`/students/search`, { params: { keyword } }),
  filter: (maLop, gioiTinh) => api.get(`/students/filter`, { params: { maLop, gioiTinh } }),
  exportCSV: () => api.get('/students/export/csv', { responseType: 'blob' }),
  exportExcel: () => api.get('/students/export/excel', { responseType: 'blob' }),
};

export const ClassRoomService = {
  getAll: () => api.get('/classes'),
  getById: (id) => api.get(`/classes/${id}`),
  create: (data) => api.post('/classes', data),
  update: (id, data) => api.put(`/classes/${id}`, data),
  delete: (id) => api.delete(`/classes/${id}`),
};
