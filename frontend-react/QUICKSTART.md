# Quick Start Guide

## 개발 환경 설정

### 필수 요구사항
- Node.js 18+
- npm 9+
- Docker & Docker Compose (백엔드 실행용)

### 1. 프로젝트 클론
```bash
git clone <repository-url>
cd code-place/frontend-react
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
`.env` 파일을 생성하고 다음 내용을 추가합니다:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### 4. 백엔드 서버 실행 (Docker)
```bash
cd ../deployment
docker-compose -f docker-compose.local.yml up -d
```

백엔드 서버가 `http://localhost:8000`에서 실행됩니다.

### 5. 개발 서버 실행
```bash
cd ../frontend-react
npm run dev
```

프론트엔드가 `http://localhost:5173`에서 실행됩니다.

## 프로젝트 구조

```
src/
├── api/              # API 클라이언트
│   └── index.js     # Axios 설정 및 모든 API 메서드
├── components/       # 공통 컴포넌트
│   ├── Layout.jsx   # 메인 레이아웃
│   ├── Navbar.jsx   # 네비게이션 바
│   └── Footer.jsx   # 푸터
├── pages/           # 페이지 컴포넌트 (기능별로 폴더 구분)
├── router/          # 라우팅 설정
├── store/           # Zustand 상태 관리
└── App.jsx          # 앱 루트
```

## 주요 명령어

### 개발
```bash
npm run dev          # 개발 서버 시작
npm run build        # 프로덕션 빌드
npm run preview      # 빌드 결과 미리보기
```

### 코드 품질
```bash
npm run lint         # ESLint 실행
npm run format       # Prettier 포맷팅
```

## 새 페이지 추가하기

### 1. 페이지 컴포넌트 생성
```jsx
// src/pages/example/Example.jsx
function Example() {
  return (
    <div>
      <h1>Example Page</h1>
    </div>
  )
}

export default Example
```

### 2. 라우터에 등록
```jsx
// src/router/index.jsx
import { lazy } from 'react'

const Example = lazy(() => import('../pages/example/Example'))

// routes 배열에 추가
{ path: 'example', element: <Example /> }
```

## API 호출하기

### 1. API 메서드 추가 (필요시)
```javascript
// src/api/index.js
export default {
  // 기존 메서드들...

  // 새 메서드 추가
  getExample(id) {
    return apiClient.get(`/example/${id}`)
  },
}
```

### 2. 컴포넌트에서 사용
```jsx
import { useEffect, useState } from 'react'
import api from '../../api'

function Example() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await api.getExample(123)
        setData(response.data)
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return <div>로딩 중...</div>
  }

  return <div>{/* 데이터 표시 */}</div>
}
```

## 상태 관리 (Zustand)

### 현재 스토어
- `authStore.js` - 사용자 인증 상태 관리

### 사용 예시
```jsx
import { useAuthStore } from '../../store/authStore'

function MyComponent() {
  // 상태 읽기
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  // 액션 호출
  const login = useAuthStore((state) => state.login)
  const logout = useAuthStore((state) => state.logout)

  return (
    <div>
      {isAuthenticated ? (
        <p>안녕하세요, {user.username}님!</p>
      ) : (
        <p>로그인이 필요합니다</p>
      )}
    </div>
  )
}
```

## 스타일링 (Tailwind CSS)

### 다크모드 지원
```jsx
<div className="bg-card text-foreground">
  {/* card 배경색과 foreground 텍스트 색상은 자동으로 다크모드 적용 */}
</div>
```

### 주요 CSS 변수
- `background` - 배경색
- `foreground` - 텍스트 색상
- `card` - 카드 배경색
- `primary` - 주요 색상
- `border` - 테두리 색상
- `muted` - 흐린 색상

### 커스텀 애니메이션
```jsx
<div className="animate-spin-slow">
  {/* 느리게 회전하는 애니메이션 */}
</div>
```

## 디버깅

### API 요청 확인
Axios 인터셉터가 모든 요청/응답을 로깅합니다.
브라우저 콘솔에서 확인 가능합니다.

### React DevTools
React 개발자 도구를 사용하여 컴포넌트 계층 구조와 상태를 확인할 수 있습니다.

### Network 탭
브라우저 개발자 도구의 Network 탭에서 API 요청을 확인할 수 있습니다.

## 배포

### 프로덕션 빌드
```bash
npm run build
```

빌드 결과물은 `dist/` 폴더에 생성됩니다.

### 빌드 미리보기
```bash
npm run preview
```

## 문제 해결

### 포트 충돌
프론트엔드 기본 포트(5173)가 이미 사용 중인 경우:
```bash
npm run dev -- --port 3000
```

### 백엔드 연결 실패
1. 백엔드 서버가 실행 중인지 확인
2. `.env` 파일의 `VITE_API_BASE_URL` 확인
3. CORS 설정 확인

### 빌드 실패
1. 의존성 재설치: `rm -rf node_modules && npm install`
2. 캐시 삭제: `rm -rf .vite`

## 참고 자료

- [React 공식 문서](https://react.dev/)
- [Vite 공식 문서](https://vitejs.dev/)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [React Router 문서](https://reactrouter.com/)
- [Zustand 문서](https://zustand-demo.pmnd.rs/)

## 도움이 필요하신가요?

- 이슈 트래커: [GitHub Issues]
- 문서: `PAGES_CHECKLIST.md`, `MIGRATION_SUMMARY.md`
- API 명세: 백엔드 프로젝트의 API 문서 참조

---

**Happy Coding!** 🚀
