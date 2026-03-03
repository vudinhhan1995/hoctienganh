import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getLessons, completeLesson } from '../services/api';
import type { Lesson } from '../types';

const Lessons: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const data = await getLessons(selectedLevel || undefined, selectedCategory || undefined);
        setLessons(data);
      } catch (error) {
        console.error('Failed to fetch lessons:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLessons();
  }, [selectedLevel, selectedCategory]);

  const handleComplete = async (lessonId: string) => {
    try {
      await completeLesson(lessonId, 100);
      alert('Bài học đã hoàn thành! 🎉');
    } catch (error) {
      console.error('Failed to complete lesson:', error);
    }
  };

  const levels = ['beginner', 'intermediate', 'advanced'];
  const categories = ['grammar', 'vocabulary', 'conversation', 'reading'];

  const levelColors: Record<string, string> = {
    beginner: 'bg-green-100 text-green-700',
    intermediate: 'bg-yellow-100 text-yellow-700',
    advanced: 'bg-red-100 text-red-700',
  };

  const levelLabels: Record<string, string> = {
    beginner: 'Người mới bắt đầu',
    intermediate: 'Trung cấp',
    advanced: 'Nâng cao',
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Bài học</h1>
          <p className="text-gray-600">Học tiếng Anh theo từng cấp độ</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Tất cả cấp độ</option>
            {levels.map((level) => (
              <option key={level} value={level}>
                {levelLabels[level]}
              </option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Tất cả chủ đề</option>
            {categories.map((cat) => (
              <option key={cat} value={cat} className="capitalize">
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Lessons Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        ) : lessons.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Chưa có bài học nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${levelColors[lesson.level]}`}>
                      {levelLabels[lesson.level]}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium capitalize">
                      {lesson.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{lesson.title}</h3>
                  {lesson.description && (
                    <p className="text-gray-600 text-sm mb-4">{lesson.description}</p>
                  )}
                  <button
                    onClick={() => handleComplete(lesson.id)}
                    className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Hoàn thành bài học
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Lessons;
