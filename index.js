const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// 라우트 import
const todoRoutes = require('./routers/todoRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB 연결 설정 - .env 파일의 MONGO_URL 사용
const MONGODB_URI = process.env.MONGO_URL || 'mongodb://localhost:27017/todo-backend';

// 미들웨어 설정
app.use(helmet()); // 보안 헤더 설정
app.use(cors()); // CORS 설정
app.use(morgan('combined')); // 로깅
app.use(express.json()); // JSON 파싱
app.use(express.urlencoded({ extended: true })); // URL 인코딩 파싱

// 라우트 설정
app.use('/api/todos', todoRoutes);

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    message: '할 일 관리 API 서버가 실행 중입니다!',
    version: '1.0.0',
    database: 'MongoDB 연결됨',
    port: PORT,
    endpoints: {
      todos: '/api/todos',
      stats: '/api/todos/stats/overview'
    }
  });
});

// 404 핸들러
app.use('*', (req, res) => {
  res.status(404).json({
    error: '요청한 엔드포인트를 찾을 수 없습니다.',
    path: req.originalUrl
  });
});

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: '서버 내부 오류가 발생했습니다.',
    message: process.env.NODE_ENV === 'development' ? err.message : '서버 오류'
  });
});

// MongoDB 연결 및 서버 시작
async function startServer() {
  try {
    // MongoDB 연결
    await mongoose.connect(MONGODB_URI);
    
    console.log('✅ MongoDB 연결성공!');
    console.log(`📊 데이터베이스: ${mongoose.connection.name}`);
    console.log(`🔗 연결 URI: ${MONGODB_URI}`);
    
    // 서버 시작
    app.listen(PORT, () => {
      console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다.`);
      console.log(`📝 API 문서: http://localhost:${PORT}`);
      console.log(`🌐 환경: ${process.env.NODE_ENV || 'development'}`);
    });
    
  } catch (error) {
    console.error('❌ MongoDB 연결 실패:', error.message);
    console.error('💡 MongoDB가 실행 중인지 확인해주세요.');
    process.exit(1);
  }
}

// MongoDB 연결 상태 모니터링
mongoose.connection.on('connected', () => {
  console.log('🔄 MongoDB 연결됨');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB 연결 오류:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB 연결 끊어짐');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 서버를 종료합니다...');
  await mongoose.connection.close();
  console.log('✅ MongoDB 연결이 종료되었습니다.');
  process.exit(0);
});

// 서버 시작
startServer();

module.exports = app;
