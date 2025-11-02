# React Admin 페이지 작업 체크리스트

## 작업 방식
1. 기존 Vue 프로젝트에서 admin 페이지 기능 및 API 파악
2. shadcn/ui를 적극 활용하여 React로 구현
3. API 연동 및 테스트
4. i18n 적용

---

## 1. General / 일반 관리

- [x] **Admin Login** (`/admin/login`)
  - Vue: `/frontend/src/pages/admin/views/general/Login.vue`
  - React: `/frontend-react/src/pages/admin/Login.jsx`
  - 기능: 관리자 로그인
  - API: `POST /admin/login`
  - 상태: ✅ 완료

- [x] **Admin Dashboard** (`/admin`)
  - Vue: `/frontend/src/pages/admin/views/general/Dashboard.vue`
  - React: `/frontend-react/src/pages/admin/Dashboard.jsx`
  - 기능: 관리자 대시보드 (통계, 시스템 상태)
  - API: 다양한 통계 API
  - 상태: ✅ 완료

- [x] **User Management** (`/admin/user`)
  - Vue: `/frontend/src/pages/admin/views/general/User.vue`
  - React: `/frontend-react/src/pages/admin/UserManagement.jsx`
  - 기능: 사용자 관리 (목록, 수정, 삭제, 권한 관리)
  - API: `GET /admin/user`, `PUT /admin/user`, `DELETE /admin/user`
  - 상태: ✅ 완료

- [x] **Announcement Management** (`/admin/announcement`)
  - Vue: `/frontend/src/pages/admin/views/general/Announcement.vue`
  - React: `/frontend-react/src/pages/admin/AnnouncementManagement.jsx`
  - 기능: 공지사항 관리 (작성, 수정, 삭제)
  - API: `GET /admin/announcement`, `POST /admin/announcement`, `PUT /admin/announcement`, `DELETE /admin/announcement`
  - 상태: ✅ 완료

- [ ] **System Config** (`/admin/conf`)
  - Vue: `/frontend/src/pages/admin/views/general/Conf.vue`
  - React: `/frontend-react/src/pages/admin/SystemConfig.jsx`
  - 기능: 시스템 설정 (웹사이트 이름, 베이스 URL, 단축 URL 등)
  - API: `GET /admin/website`, `POST /admin/website`, `GET /admin/smtp`, `POST /admin/smtp`
  - 상태: ⏳ 작업 대기

- [ ] **Judge Server Management** (`/admin/judge-server`)
  - Vue: `/frontend/src/pages/admin/views/general/JudgeServer.vue`
  - React: `/frontend-react/src/pages/admin/JudgeServer.jsx`
  - 기능: 채점 서버 관리
  - API: `GET /admin/judge_server`, `DELETE /admin/judge_server`, `PUT /admin/judge_server`
  - 상태: ⏳ 작업 대기

- [ ] **Prune Test Case** (`/admin/prune-test-case`)
  - Vue: `/frontend/src/pages/admin/views/general/PruneTestCase.vue`
  - React: `/frontend-react/src/pages/admin/PruneTestCase.jsx`
  - 기능: 사용하지 않는 테스트 케이스 정리
  - API: `GET /admin/prune_test_case`, `DELETE /admin/prune_test_case`
  - 상태: ⏳ 작업 대기

- [ ] **Home Banner Management** (`/admin/home-banner`)
  - Vue: `/frontend/src/pages/admin/views/general/HomeBannerManagement.vue`
  - React: `/frontend-react/src/pages/admin/HomeBanner.jsx`
  - 기능: 홈 배너 관리
  - API: 배너 관련 API
  - 상태: ⏳ 작업 대기

- [ ] **Popup Management** (`/admin/popup`)
  - Vue: `/frontend/src/pages/admin/views/general/PopupManagement.vue`
  - React: `/frontend-react/src/pages/admin/PopupManagement.jsx`
  - 기능: 팝업 관리
  - API: 팝업 관련 API
  - 상태: ⏳ 작업 대기

---

## 2. Problem / 문제 관리

- [x] **Problem List** (`/admin/problem`)
  - Vue: `/frontend/src/pages/admin/views/problem/ProblemList.vue`
  - React: `/frontend-react/src/pages/admin/ProblemList.jsx`
  - 기능: 문제 목록 관리
  - API: `GET /admin/problem`, `DELETE /admin/problem`
  - 상태: ✅ 완료

- [x] **Create Problem** (`/admin/problem/create`)
  - Vue: `/frontend/src/pages/admin/views/problem/Problem.vue`
  - React: `/frontend-react/src/pages/admin/CreateProblem.jsx`
  - 기능: 새 문제 생성
  - API: `POST /admin/problem`
  - 상태: ✅ 완료

- [x] **Edit Problem** (`/admin/problem/edit/:problemId`)
  - Vue: `/frontend/src/pages/admin/views/problem/Problem.vue`
  - React: `/frontend-react/src/pages/admin/EditProblem.jsx`
  - 기능: 기존 문제 수정
  - API: `GET /admin/problem`, `PUT /admin/problem`
  - 상태: ✅ 완료

- [ ] **Add Public Problem** (`/admin/problem/add-public`)
  - Vue: `/frontend/src/pages/admin/views/problem/AddPublicProblem.vue`
  - React: `/frontend-react/src/pages/admin/AddPublicProblem.jsx`
  - 기능: 공개 문제 추가
  - API: 문제 추가 API
  - 상태: ⏳ 작업 대기

- [ ] **Import/Export Problems** (`/admin/problem/import-export`)
  - Vue: `/frontend/src/pages/admin/views/problem/ImportAndExport.vue`
  - React: `/frontend-react/src/pages/admin/ImportExportProblem.jsx`
  - 기능: 문제 가져오기/내보내기
  - API: `POST /admin/problem/import`, `GET /admin/problem/export`
  - 상태: ⏳ 작업 대기

- [ ] **Import From Contest** (`/admin/problem/import-from-contest`)
  - Vue: `/frontend/src/pages/admin/views/problem/ImportFromContest.vue`
  - React: `/frontend-react/src/pages/admin/ImportFromContest.jsx`
  - 기능: 대회에서 문제 가져오기
  - API: 문제 가져오기 API
  - 상태: ⏳ 작업 대기

---

## 3. Contest / 대회 관리

- [x] **Contest List** (`/admin/contest`)
  - Vue: `/frontend/src/pages/admin/views/contest/ContestList.vue`
  - React: `/frontend-react/src/pages/admin/ContestList.jsx`
  - 기능: 대회 목록 관리
  - API: `GET /admin/contest`, `DELETE /admin/contest`
  - 상태: ✅ 완료

- [ ] **Create Contest** (`/admin/contest/create`)
  - Vue: `/frontend/src/pages/admin/views/contest/Contest.vue`
  - React: `/frontend-react/src/pages/admin/CreateContest.jsx`
  - 기능: 새 대회 생성
  - API: `POST /admin/contest`
  - 상태: ⏳ 작업 대기

- [ ] **Edit Contest** (`/admin/contest/edit/:contestId`)
  - Vue: `/frontend/src/pages/admin/views/contest/Contest.vue`
  - React: `/frontend-react/src/pages/admin/EditContest.jsx`
  - 기능: 기존 대회 수정
  - API: `GET /admin/contest`, `PUT /admin/contest`
  - 상태: ⏳ 작업 대기

- [ ] **Contest Submission** (`/admin/contest/:contestId/submission`)
  - Vue: `/frontend/src/pages/admin/views/contest/ContestSubmission.vue`
  - React: `/frontend-react/src/pages/admin/ContestSubmission.jsx`
  - 기능: 대회 제출 관리
  - API: `GET /admin/submission`
  - 상태: ⏳ 작업 대기

---

## 작업 우선순위

### 높음 (핵심 기능)
1. Admin Login - 관리자 인증
2. Admin Dashboard - 대시보드
3. Problem Management (List, Create, Edit) - 문제 관리
4. Contest Management (List, Create, Edit) - 대회 관리
5. User Management - 사용자 관리

### 중간
6. Announcement Management - 공지사항 관리
7. Judge Server Management - 채점 서버 관리
8. System Config - 시스템 설정

### 낮음
9. Home Banner / Popup Management
10. Import/Export 기능
11. Prune Test Case

---

## 현재 진행 상황
- **완료:** 8/19 페이지 (42.1%)
- **완료 페이지:**
  1. ✅ Admin Login - 관리자 로그인
  2. ✅ Admin Dashboard - 대시보드
  3. ✅ User Management - 사용자 관리
  4. ✅ Announcement Management - 공지사항 관리
  5. ✅ Problem List - 문제 목록
  6. ✅ Create Problem - 문제 생성
  7. ✅ Edit Problem - 문제 수정
  8. ✅ Contest List - 대회 목록
- **다음 작업:**
  1. Create/Edit Contest - 대회 생성/수정
  2. System Config - 시스템 설정
  3. Judge Server Management - 채점 서버 관리
  4. Import/Export Problems - 문제 가져오기/내보내기

---

## 기술 스택
- **UI 라이브러리:** shadcn/ui (적극 활용)
- **폼 관리:** React Hook Form
- **상태 관리:** Zustand
- **라우팅:** React Router v6
- **스타일링:** Tailwind CSS
- **에디터:** Monaco Editor 또는 CodeMirror (코드 작성용)
- **마크다운 에디터:** React Markdown Editor
