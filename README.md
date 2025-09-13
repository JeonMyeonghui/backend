# backend

# 할 일 관리 백엔드 API

Express.js를 사용한 RESTful API 서버입니다.

## 🚀 시작하기

### 필수 요구사항
- Node.js 16.0.0 이상
- npm 또는 yarn

### 설치 및 실행

1. 의존성 설치
```bash
npm install
```

2. 환경 변수 설정
```bash
# .env 파일을 생성하고 다음 내용을 추가하세요
PORT=3000
NODE_ENV=development
API_VERSION=1.0.0
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=combined
```

3. 서버 실행
```bash
# 개발 모드 (nodemon 사용)
npm run dev

# 프로덕션 모드
npm start
```

서버가 실행되면 `http://localhost:3000`에서 API에 접근할 수 있습니다.

## 📚 API 문서

### 기본 엔드포인트
- `GET /` - API 상태 확인

### 할 일 관리 API

#### 모든 할 일 조회
```
GET /api/todos
```

쿼리 파라미터:
- `completed` (boolean): 완료 상태 필터링
- `search` (string): 제목 또는 설명으로 검색

예시:
```
GET /api/todos?completed=false
GET /api/todos?search=프로젝트
```

#### 특정 할 일 조회
```
GET /api/todos/:id
```

#### 새 할 일 생성
```
POST /api/todos
```

요청 본문:
```json
{
  "title": "할 일 제목",
  "description": "할 일 설명 (선택사항)"
}
```

#### 할 일 수정
```
PUT /api/todos/:id
```

요청 본문:
```json
{
  "title": "수정된 제목",
  "description": "수정된 설명",
  "completed": true
}
```

#### 할 일 삭제
```
DELETE /api/todos/:id
```

#### 모든 할 일 삭제
```
DELETE /api/todos
```

## 📝 응답 형식

모든 API 응답은 다음 형식을 따릅니다:

### 성공 응답
```json
{
  "success": true,
  "data": { ... },
  "message": "성공 메시지"
}
```

### 에러 응답
```json
{
  "success": false,
  "error": "에러 메시지"
}
```

## 🛠️ 개발

### 프로젝트 구조
```
src/
├── app.js          # 메인 애플리케이션 파일
└── routes/
    └── todoRoutes.js  # 할 일 관련 라우트
```

### 사용된 기술
- **Express.js**: 웹 프레임워크
- **CORS**: Cross-Origin Resource Sharing
- **Helmet**: 보안 헤더 설정
- **Morgan**: HTTP 요청 로깅
- **UUID**: 고유 ID 생성
- **dotenv**: 환경 변수 관리

### 스크립트
- `npm start`: 프로덕션 모드로 서버 실행
- `npm run dev`: 개발 모드로 서버 실행 (nodemon 사용)
- `npm test`: 테스트 실행

## 📄 라이선스

MIT License

