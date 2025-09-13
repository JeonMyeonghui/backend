const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const todoRoutes = require('./routes/todoRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

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
    endpoints: {
      todos: '/api/todos'
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

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`📝 API 문서: http://localhost:${PORT}`);
});

module.exports = app;

