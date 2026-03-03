import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuthStore, useConversationStore } from '../store';
import { socketService } from '../services/socket';
import { getConversations, createConversation, getConversation } from '../services/api';
import type { Message } from '../types';

const topics = [
  'Daily Life',
  'Shopping',
  'Travel',
  'Restaurant',
  'Business',
  'Health',
  'Education',
  'Entertainment',
];

const Practice: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user, token } = useAuthStore();
  const { messages, setMessages, addMessage, isTyping, setTyping } = useConversationStore();
  
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('Daily Life');
  const [conversations, setConversations] = useState<any[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        
        if (event.results[0].isFinal) {
          setInputText(transcript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }

    // Load conversations
    const loadConversations = async () => {
      try {
        const data = await getConversations();
        setConversations(data);
        
        // Check for conversation ID in URL
        const convId = searchParams.get('conversation');
        if (convId) {
          await loadConversation(convId);
        }
      } catch (error) {
        console.error('Failed to load conversations:', error);
      }
    };

    if (token) {
      loadConversations();
      socketService.connect(token);
      
      socketService.onMessage((message: Message) => {
        addMessage(message);
        // Speak the AI response
        speakText(message.content);
      });
      
      socketService.onTyping((data) => {
        setTyping(data.isTyping);
      });
    }

    return () => {
      socketService.offMessage();
      socketService.offTyping();
      if (currentConversation) {
        socketService.leaveConversation(currentConversation);
      }
    };
  }, [token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversation = async (convId: string) => {
    try {
      const conv = await getConversation(convId);
      setMessages(conv.messages);
      setCurrentConversation(convId);
      socketService.joinConversation(convId);
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  const startNewConversation = async () => {
    try {
      const conv = await createConversation(selectedTopic);
      setConversations([conv, ...conversations]);
      setCurrentConversation(conv.id);
      setMessages([]);
      socketService.joinConversation(conv.id);
      setShowNewChat(false);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const sendMessage = (text?: string) => {
    const content = text || inputText;
    if (!content.trim() || !currentConversation) return;
    
    socketService.sendMessage(currentConversation, content);
    setInputText('');
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
(true);
    }
  };

  const speakText = (text: string) => {
    if (!synthRef.current) return;
    
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    synthRef.current.speak(utterance);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Layout>
      <div className="h-[calc(100vh-8rem)] flex gap-6">
        {/* Sidebar - Conversation History */}
        <div className="w-64 bg-white rounded-xl shadow-sm p-4 flex flex-col">
          <button
            onClick={() => setShowNewChat(true)}
            className="w-full py-3 px-4 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors mb-4"
          >
            + Cuộc trò chuyện mới
          </button>

          <div className="flex-1 overflow-y-auto space-y-2">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => loadConversation(conv.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  currentConversation === conv.id
                    ? 'bg-primary text-white'
                    : 'hover:bg-gray-100'
                }`}
              >
                <p className="font-medium truncate">{conv.topic}</p>
                <p className={`text-xs ${currentConversation === conv.id ? 'text-blue-100' : 'text-gray-500'}`}>
                  {new Date(conv.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 bg-white rounded-xl shadow-sm flex flex-col">
          {!currentConversation ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">💬</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Luyện nói tiếng Anh với AI
                </h2>
                <p className="text-gray-600 mb-6">
                  Chọn hoặc tạo cuộc trò chuyện mới để bắt đầu
                </p>
                <button
                  onClick={() => setShowNewChat(true)}
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Bắt đầu ngay
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <p>Hãy bắt đầu nói tiếng Anh nào!</p>
                    <p className="text-sm">AI sẽ giúp bạn sửa lỗi và cải thiện</p>
                  </div>
                )}
                
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] p-4 rounded-2xl ${
                        msg.role === 'user'
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <div className={`flex gap-2 mt-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        <button
                          onClick={() => speakText(msg.content)}
                          className={`text-xs px-2 py-1 rounded ${
                            msg.role === 'user' ? 'bg-blue-600' : 'bg-gray-200'
                          } hover:opacity-80`}
                        >
                          🔊 Nghe
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-4 rounded-2xl">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t">
                <div className="flex gap-3">
                  <button
                    onClick={toggleRecording}
                    className={`p-3 rounded-full transition-colors ${
                      isRecording
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    🎤
                  </button>
                  
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Nhập tin nhắn hoặc nói để nhập liệu..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  
                  <button
                    onClick={() => sendMessage()}
                    disabled={!inputText.trim()}
                    className="px-6 py-3 bg-primary text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ➤
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* New Chat Modal */}
        {showNewChat && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Cuộc trò chuyện mới</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn chủ đề
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {topics.map((topic) => (
                    <button
                      key={topic}
                      onClick={() => setSelectedTopic(topic)}
                      className={`p-3 rounded-lg text-sm transition-colors ${
                        selectedTopic === topic
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowNewChat(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={startNewConversation}
                  className="flex-1 py-3 px-4 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Bắt đầu
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Practice;
