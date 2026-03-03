import React from 'react';
import Layout from '../components/Layout';
import { useAuthStore } from '../store';

const Profile: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Hồ sơ người dùng</h1>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{user?.name}</h2>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b">
              <span className="text-gray-600">Trình độ</span>
              <span className="font-medium capitalize">{user?.level}</span>
            </div>
            <div className="flex justify-between py-3 border-b">
              <span className="text-gray-600">Email</span>
              <span className="font-medium">{user?.email}</span>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Cài đặt</h3>
            <div className="space-y-3">
              <button className="w-full py-3 px-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-left">
                Chỉnh sửa thông tin cá nhân
              </button>
              <button className="w-full py-3 px-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-left">
                Thay đổi mật khẩu
              </button>
              <button className="w-full py-3 px-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-left">
                Cài đặt giọng nói
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
