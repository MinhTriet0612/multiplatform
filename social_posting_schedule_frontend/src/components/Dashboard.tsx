import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import PostComposer from './PostComposer';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Social Posting Schedule
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 space-y-6">
        <div className="px-4 sm:px-0">
          <div className="rounded-lg bg-indigo-50 p-6">
            <h2 className="text-xl font-semibold text-indigo-900 mb-2">
              Chào mừng, {user?.name || user?.email}!
            </h2>
            <p className="text-indigo-700 text-sm">
              Tạo bài viết một lần để chia sẻ tới Facebook, Instagram và Tiktok cùng lúc.
            </p>
          </div>
        </div>

        <div className="px-4 sm:px-0">
          <PostComposer />
        </div>
      </main>
    </div>
  );
}

