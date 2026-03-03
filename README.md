# Học Tiếng Anh với AI

Ứng dụng học tiếng Anh có AI hỗ trợ nói chuyện trực tiếp.

## Tính năng

- 🤖 **AI Conversation Partner** - Trò chuyện real-time với AI GPT-4
- 🎤 **Voice Features** - Nhận dạng giọng nói & tổng hợp giọng nói
- 📚 **Lesson System** - Bài học theo cấp độ
- 📝 **Vocabulary Flashcards** - Học từ vựng với flashcard
- 👤 **User Authentication** - Đăng nhập/đăng ký bảo mật
- 📊 **Progress Tracking** - Theo dõi tiến độ học tập

## Công nghệ

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + Prisma
- **Database**: PostgreSQL
- **AI**: OpenAI GPT-4 + Whisper
- **Real-time**: WebSocket (Socket.io)

## Cài đặt

### Yêu cầu

- Node.js 18+
- Python 3.11+
- PostgreSQL
- Conda (tùy chọn)

### Cách 1: Sử dụng Conda (khuyến nghị)

```bash
# Tạo môi trường từ file
conda env create -f environment.yml

# Kích hoạt môi trường
conda activate hoctienganh

# Cài đặt dependencies
cd client && npm install && cd ..
cd server && npm install && cd ..
```

### Cách 2: Cài đặt thủ công

```bash
# Frontend
cd client
npm install
npm run dev

# Backend
cd server
npm install
# Cấu hình .env
npx prisma migrate dev
npm run dev
```

## Cấu hình

### Server (.env)

```env
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/hoctienganh
JWT_SECRET=your-secret-key
OPENAI_API_KEY=sk-your-openai-key
CLIENT_URL=http://localhost:5173
```

### Client (.env)

```env
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=http://localhost:5000
```

## Chạy ứng dụng

1. **Database**: Khởi động PostgreSQL và chạy migration
   ```bash
   cd server
   npx prisma migrate dev
   ```

2. **Backend**:
   ```bash
   cd server
   npm run dev
   ```

3. **Frontend**:
   ```bash
   cd client
   npm run dev
   ```

4. Mở trình duyệt: http://localhost:5173

## Cấu trúc thư mục

```
hoctienganh/
├── client/               # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API & WebSocket
│   │   ├── store/       # State management
│   │   └── types/       # TypeScript types
│   └── ...
├── server/              # Node.js backend
│   ├── src/
│   │   ├── routes/      # API routes
│   │   ├── middleware/  # Auth middleware
│   │   └── services/    # Business logic
│   ├── prisma/          # Database schema
│   └── ...
├── environment.yml      # Conda environment
├── setup.bat           # Windows setup script
├── setup.sh            # Linux/Mac setup script
└── SPEC.md             # Technical specification
```

## Giấy phép

ISC
