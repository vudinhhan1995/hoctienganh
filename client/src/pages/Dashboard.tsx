import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuthStore } from '../store';
import { getProgress, getConversations } from '../services/api';
import type { UserProgress, Conversation } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [progressData, conversationsData] = await Promise.all([
          getProgress(),
          getConversations(),
        ]);
        setProgress(progressData);
        setConversations(conversationsData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const completedLessons = progress.filter((p) => p.completed).length;
  const totalScore = progress.reduce((sum, p) => sum + p.score, 0);
  const avgScore = progress.length > 0 ? Math.round(totalScore / progress.length) : 0;

  const stats = [
    { label: 'Bài học đã hoàn thành', value: completedLessons, icon: '📚', color: 'bg-green-500' },
    { label: 'Tổng điểm', value: totalScore, icon: '⭐', color: 'bg-yellow-500' },
    { label: 'Điểm trung bình', value: avgScore, icon: '📊', color: 'bg-blue-500' },
    { label: 'Cuộc trò chuyện', value: conversations.length, icon: '💬', color: 'bg-purple-500' },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">
            Xin chào, {user?.name}! 👋
          </h1>
          <p className="text-blue-100">
            Chào mừng đến với ứng dụng học tiếng Anh với AI. Hãy bắt đầu luyện nói ngay hôm nay!
          </p>
          <Link
            to="/practice"
            className="inline-block mt-4 px-6 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-blue-50 transition-colors"
          >
            Luyện nói với AI ngay
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-2xl`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Practice Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Luyện nói với AI</h2>
            <p className="text-gray-600 mb-4">
              Thực hành nói tiếng Anh với AI. AI sẽ sửa lỗi ngữ pháp và giúp bạn cải thiện.
            </p>
            <Link
              to="/practice"
              className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
            >
              Bắt đầu ngay →
            </Link>
          </div>

          {/* Lessons Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Bài học</h2>
            <p className="text-gray-600 mb-4">
              Học ngữ pháp và từ vựng theo từng cấp độ từ cơ bản đến nâng cao.
            </p>
            <Link
              to="/lessons"
              className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
            >
              Xem bài học →
            </Link>
          </div>
        </div>

        {/* Recent Conversations */}
        {conversations.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Cuộc trò chuyện gần đây</h2>
            <div className="space-y-3">
              {conversations.slice(0, 5).map((conv) => (
                <Link
                  key={conv.id}
                  to={`/practice?conversation=${conv.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-800">{conv.topic}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(conv.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <span className="text-gray-400">→</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
