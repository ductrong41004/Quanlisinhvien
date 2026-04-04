import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';
import { CheckCircle, XCircle, Loader2, Home } from 'lucide-react';

const CheckinPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [studentName, setStudentName] = useState('');

  const checkinMutation = useMutation({
    mutationFn: async (token: string) => {
      const resp = await axiosInstance.post('/attendance/qr/checkin', { token });
      return resp.data;
    },
    onSuccess: (data) => {
      setStatus('success');
      setStudentName(data.studentName);
      setMessage(data.message);
    },
    onError: (error: any) => {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Có lỗi xảy ra khi điểm danh.');
    }
  });

  useEffect(() => {
    if (token) {
      setStatus('loading');
      checkinMutation.mutate(token);
    } else {
      setStatus('error');
      setMessage('Không tìm thấy mã token điểm danh.');
    }
  }, [token]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md text-center border border-gray-100 animate-in zoom-in-95 duration-300">
        {status === 'loading' && (
          <div className="py-12 flex flex-col items-center">
            <Loader2 className="h-16 w-16 text-indigo-600 animate-spin mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Đang xử lý...</h2>
            <p className="text-gray-500">Hệ thống đang ghi nhận điểm danh của bạn.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="py-8">
            <div className="bg-green-100 p-4 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-2">Thành công!</h2>
            <p className="text-green-600 font-bold mb-6 italic">{message}</p>
            
            <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
              <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Sinh viên</p>
              <p className="text-lg font-bold text-gray-800">{studentName}</p>
            </div>

            <button 
              onClick={() => navigate('/')}
              className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
            >
              <Home className="h-5 w-5" /> Quay về trang chủ
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="py-8">
            <div className="bg-red-100 p-4 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <XCircle className="h-12 w-12 text-red-600" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-2">Thất bại</h2>
            <p className="text-red-500 font-bold mb-8 leading-relaxed px-4">{message}</p>
            
            <button 
              onClick={() => navigate('/')}
              className="w-full py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
            >
              Quay về trang chủ
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckinPage;
