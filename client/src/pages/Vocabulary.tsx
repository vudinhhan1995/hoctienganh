import React, { useState } from 'react';
import Layout from '../components/Layout';

interface VocabularyItem {
  id: number;
  word: string;
  pronunciation: string;
  meaning: string;
  example: string;
}

const vocabularyData: VocabularyItem[] = [
  { id: 1, word: 'Hello', pronunciation: '/həˈloʊ/', meaning: 'Xin chào', example: 'Hello, how are you?' },
  { id: 2, word: 'Goodbye', pronunciation: '/ɡʊdˈbaɪ/', meaning: 'Tạm biệt', example: 'Goodbye, see you tomorrow!' },
  { id: 3, word: 'Thank you', pronunciation: '/θæŋk juː/', meaning: 'Cảm ơn', example: 'Thank you for your help.' },
  { id: 4, word: 'Please', pronunciation: '/pliːz/', meaning: 'Làm ơn', example: 'Please open the door.' },
  { id: 5, word: 'Sorry', pronunciation: '/ˈsɒri/', meaning: 'Xin lỗi', example: 'Sorry, I am late.' },
  { id: 6, word: 'Excuse me', pronunciation: '/ɪkˈskjuːz miː/', meaning: 'Xin lỗi/Cho phép', example: 'Excuse me, where is the station?' },
  { id: 7, word: 'Yes', pronunciation: '/jes/', meaning: 'Vâng/Có', example: 'Yes, I understand.' },
  { id: 8, word: 'No', pronunciation: '/noʊ/', meaning: 'Không', example: 'No, I do not agree.' },
];

const Vocabulary: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [learnedWords, setLearnedWords] = useState<number[]>([]);

  const currentWord = vocabularyData[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < vocabularyData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(vocabularyData.length - 1);
    }
  };

  const handleMarkLearned = () => {
    if (!learnedWords.includes(currentWord.id)) {
      setLearnedWords([...learnedWords, currentWord.id]);
    }
    handleNext();
  };

  const speakWord = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Từ vựng</h1>
          <p className="text-gray-600">Học từ vựng tiếng Anh cơ bản</p>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Đã học: {learnedWords.length}/{vocabularyData.length}</span>
            <span>Thẻ hiện tại: {currentIndex + 1}/{vocabularyData.length}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(learnedWords.length / vocabularyData.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Flashcard */}
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className="bg-white rounded-2xl shadow-lg p-8 min-h-[300px] flex flex-col items-center justify-center cursor-pointer transition-all hover:shadow-xl"
        >
          {!isFlipped ? (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  speakWord(currentWord.word);
                }}
                className="text-4xl mb-4 hover:scale-110 transition-transform"
              >
                🔊
              </button>
              <h2 className="text-4xl font-bold text-gray-800 mb-2">{currentWord.word}</h2>
              <p className="text-xl text-gray-500">{currentWord.pronunciation}</p>
              <p className="mt-4 text-gray-400 text-sm">Nhấn để xem nghĩa</p>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-primary mb-4">{currentWord.word}</h2>
              <p className="text-2xl text-gray-800 mb-4">{currentWord.meaning}</p>
              <div className="bg-gray-50 rounded-lg p-4 w-full">
                <p className="text-gray-600 italic">"{currentWord.example}"</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  speakWord(currentWord.example);
                }}
                className="mt-4 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                🔊 Nghe ví dụ
              </button>
            </>
          )}
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          <button
            onClick={handlePrevious}
            className="px-6 py-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            ← Trước
          </button>
          <button
            onClick={handleMarkLearned}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            ✓ Đã học
          </button>
          <button
            onClick={handleNext}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Sau →
          </button>
        </div>

        {/* Learned Words List */}
        {learnedWords.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Từ đã học</h3>
            <div className="flex flex-wrap gap-2">
              {vocabularyData
                .filter((w) => learnedWords.includes(w.id))
                .map((word) => (
                  <span
                    key={word.id}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                  >
                    {word.word}
                  </span>
                ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Vocabulary;
