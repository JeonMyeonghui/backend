# Todo Backend API

완전한 기능을 갖춘 할 일 관리 백엔드 API 서버입니다.

## ✨ 주요 기능

- **완전한 CRUD 작업** - 할 일 생성, 조회, 수정, 삭제
- **고급 필터링** - 완료상태, 우선순위, 마감일별 필터링
- **텍스트 검색** - 제목과 설명에서 검색
- **페이지네이션** - 대용량 데이터 효율적 처리
- **통계 분석** - 완료율, 우선순위별 통계
- **MongoDB 연동** - 안정적인 데이터 저장
- **보안 강화** - Helmet, CORS 설정
- **로깅 시스템** - Morgan을 통한 요청 로깅

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
PORT=5000
NODE_ENV=development
MONGO_URL=mongodb://localhost:27017/todo-backend
```

3. 서버 실행
```bash
# 개발 모드 (nodemon 사용)
npm run dev

# 프로덕션 모드
npm start
```

서버가 실행되면 `http://localhost:5000`에서 API에 접근할 수 있습니다.

## 📚 API 문서

### 기본 엔드포인트
- `GET /` - API 상태 확인 및 서버 정보

### 할 일 관리 API

#### 모든 할 일 조회 (고급 필터링 지원)
```
GET /api/todos
```

쿼리 파라미터:
- `page` (number): 페이지 번호 (기본값: 1)
- `limit` (number): 페이지당 항목 수 (기본값: 10)
- `completed` (boolean): 완료 상태 필터링
- `priority` (string): 우선순위 필터링 (low/medium/high)
- `search` (string): 제목 또는 설명으로 검색
- `sortBy` (string): 정렬 기준 (기본값: createdAt)
- `sortOrder` (string): 정렬 순서 (asc/desc, 기본값: desc)
- `dueSoon` (boolean): 마감일 임박 필터링 (3일 이내)

예시:
```
GET /api/todos?completed=false&priority=high&page=1&limit=5
GET /api/todos?search=프로젝트&sortBy=dueDate&sortOrder=asc
GET /api/todos?dueSoon=true
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
  "description": "할 일 설명 (선택사항)",
  "priority": "high",
  "dueDate": "2024-12-31T23:59:59.000Z",
  "tags": ["중요", "업무"]
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
  "completed": true,
  "priority": "medium",
  "dueDate": "2024-12-25T00:00:00.000Z",
  "tags": ["완료", "검토"]
}
```

#### 할 일 완료/미완료 토글
```
PATCH /api/todos/:id/toggle
```

#### 할 일 삭제
```
DELETE /api/todos/:id
```

#### 모든 할 일 삭제
```
DELETE /api/todos
```

#### 통계 정보 조회
```
GET /api/todos/stats/overview
```

응답 예시:
```json
{
  "success": true,
  "data": {
    "total": 10,
    "completed": 6,
    "pending": 4,
    "highPriority": 3,
    "mediumPriority": 4,
    "lowPriority": 3,
    "overdue": 1,
    "completionRate": 60
  }
}
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
todo-backend/
├── index.js              # 메인 서버 파일
├── package.json          # 프로젝트 설정
├── README.md             # 프로젝트 문서
├── .gitignore            # Git 무시 파일
├── routers/
│   └── todoRoutes.js     # 할 일 관련 라우트
└── src/
    └── models/
        └── Todo.js       # MongoDB Todo 모델
```

### 사용된 기술
- **Express.js**: 웹 프레임워크
- **MongoDB**: NoSQL 데이터베이스
- **Mongoose**: MongoDB ODM
- **CORS**: Cross-Origin Resource Sharing
- **Helmet**: 보안 헤더 설정
- **Morgan**: HTTP 요청 로깅
- **dotenv**: 환경 변수 관리

### 스크립트
- `npm start`: 프로덕션 모드로 서버 실행
- `npm run dev`: 개발 모드로 서버 실행 (nodemon 사용)
- `npm test`: 테스트 실행

## 📄 라이선스

MIT License

