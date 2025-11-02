# Code Place - React Frontend

Vue.js 기반 프론트엔드를 React로 마이그레이션한 프로젝트입니다.

## 기술 스택

- **React** 18.3
- **Vite** 6.0 - 빌드 도구
- **React Router** 7.1 - 라우팅
- **Zustand** - 상태 관리
- **Tailwind CSS** - 스타일링
- **Axios** - HTTP 클라이언트

## 개발 환경 설정

### 1. 의존성 설치
```bash
npm install
```

### 2. 개발 서버 실행
```bash
npm run dev
```

서버는 `http://localhost:5173`에서 실행됩니다.

### 3. 백엔드 서버 실행
프론트엔드가 작동하려면 백엔드 API 서버가 실행 중이어야 합니다:
```bash
cd ../deployment
docker-compose -f docker-compose.local.yml up -d
```

백엔드 API는 `http://localhost:8000/api`에서 실행됩니다.

## 프로젝트 구조

```
frontend-react/
├── src/
│   ├── components/     # 재사용 가능한 컴포넌트
│   ├── pages/          # 페이지 컴포넌트
│   ├── store/          # Zustand 스토어
│   ├── api/            # API 클라이언트
│   ├── router/         # 라우팅 설정
│   └── utils/          # 유틸리티 함수
├── public/             # 정적 파일
└── API_SPEC.md         # API 명세서
```

## 주요 기능

### 라우트 (Vue와 동일)
- `/` - 홈
- `/problem` - 문제 목록
- `/problem/:problemID` - 문제 상세
- `/status` - 제출 목록
- `/contest` - 대회 목록
- `/acm-rank` - 랭킹
- `/user-home` - 사용자 프로필
- `/community` - 커뮤니티

자세한 라우트 정보는 `API_SPEC.md`를 참조하세요.

## 개발 가이드

### 상태 관리 (Zustand)
```javascript
import { useUserStore } from './store/userStore'

const { user, login, logout } = useUserStore()
```

### API 호출
```javascript
import api from './api'

const response = await api.getProblemList(0, 20, {})
```

### 라우팅
```javascript
import { useNavigate } from 'react-router-dom'

const navigate = useNavigate()
navigate('/problem/1')
```

## 빌드

프로덕션 빌드:
```bash
npm run build
```

빌드된 파일은 `dist/` 디렉토리에 생성됩니다.

## 참고

- [API 명세서](./API_SPEC.md)
- [Vue 프론트엔드](../frontend)
