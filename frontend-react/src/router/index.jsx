import { createBrowserRouter, Navigate } from 'react-router-dom'
import Layout from '../components/Layout'

// 페이지 컴포넌트들 (lazy loading)
import { lazy } from 'react'

// Home
const Home = lazy(() => import('../pages/home/Home'))

// Problem
const ProblemList = lazy(() => import('../pages/problem/ProblemList'))
const ProblemDetail = lazy(() => import('../pages/problem/ProblemDetail'))

// Submission
const SubmissionList = lazy(() => import('../pages/submission/SubmissionList'))
const SubmissionDetail = lazy(() => import('../pages/submission/SubmissionDetail'))

// Contest
const ContestList = lazy(() => import('../pages/contest/ContestList'))
const ContestDetail = lazy(() => import('../pages/contest/ContestDetail'))
const ContestProblemList = lazy(() => import('../pages/contest/ContestProblemList'))
const ContestProblemDetail = lazy(() => import('../pages/contest/ContestProblemDetail'))
const ContestAnnouncements = lazy(() => import('../pages/contest/ContestAnnouncements'))
const ContestRank = lazy(() => import('../pages/contest/ContestRank'))
const ContestHistory = lazy(() => import('../pages/contest/ContestHistory'))

// Rank
const UserRank = lazy(() => import('../pages/rank/UserRank'))
const SurgeRank = lazy(() => import('../pages/rank/SurgeRank'))
const MajorRank = lazy(() => import('../pages/rank/MajorRank'))
const OIRank = lazy(() => import('../pages/rank/OIRank'))

// User
const UserHome = lazy(() => import('../pages/user/UserHome'))
const UserDashboard = lazy(() => import('../pages/user/UserDashboard'))
const UserProblems = lazy(() => import('../pages/user/UserProblems'))
const UserCommunity = lazy(() => import('../pages/user/UserCommunity'))
const UserAchievements = lazy(() => import('../pages/user/UserAchievements'))
const UserSettings = lazy(() => import('../pages/user/UserSettings'))

// Community
const Community = lazy(() => import('../pages/community/Community'))
const CommunityPost = lazy(() => import('../pages/community/CommunityPost'))

// Notice
const Notice = lazy(() => import('../pages/notice/Notice'))
const NoticeDetail = lazy(() => import('../pages/notice/NoticeDetail'))

// General
const About = lazy(() => import('../pages/general/About'))
const FAQ = lazy(() => import('../pages/general/FAQ'))
const NotFound = lazy(() => import('../pages/general/NotFound'))

// Auth
const Logout = lazy(() => import('../pages/auth/Logout'))
const ApplyResetPassword = lazy(() => import('../pages/auth/ApplyResetPassword'))
const ResetPassword = lazy(() => import('../pages/auth/ResetPassword'))

// Admin
const AdminLogin = lazy(() => import('../pages/admin/Login'))
const AdminLayout = lazy(() => import('../pages/admin/components/AdminLayout'))
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'))
const UserManagement = lazy(() => import('../pages/admin/UserManagement'))
const AdminProblemList = lazy(() => import('../pages/admin/ProblemList'))
const CreateProblem = lazy(() => import('../pages/admin/CreateProblem'))
const EditProblem = lazy(() => import('../pages/admin/EditProblem'))
const AdminContestList = lazy(() => import('../pages/admin/ContestList'))
const CreateContest = lazy(() => import('../pages/admin/CreateContest'))
const EditContest = lazy(() => import('../pages/admin/EditContest'))
const AnnouncementManagement = lazy(() => import('../pages/admin/AnnouncementManagement'))

/**
 * 라우터 설정
 * API_SPEC.md의 라우트 구조를 따름
 *
 * 폴더 구조:
 * - home/: 홈 페이지
 * - problem/: 문제 관련 페이지
 * - submission/: 제출 관련 페이지
 * - contest/: 대회 관련 페이지
 * - rank/: 랭킹 관련 페이지
 * - user/: 사용자 프로필 관련 페이지
 * - community/: 커뮤니티 관련 페이지
 * - notice/: 공지사항 관련 페이지
 * - general/: 일반 페이지 (About, FAQ 등)
 */
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      // 홈 & 공통
      { index: true, element: <Home /> },
      { path: 'about', element: <About /> },
      { path: 'faq', element: <FAQ /> },

      // 문제
      { path: 'problem', element: <ProblemList /> },
      { path: 'problem/:problemID', element: <ProblemDetail /> },

      // 제출
      { path: 'status', element: <SubmissionList /> },
      { path: 'status/:id', element: <SubmissionDetail /> },

      // 대회
      { path: 'contest', element: <ContestList /> },
      { path: 'contest-history', element: <ContestHistory /> },
      {
        path: 'contest/:contestID',
        element: <ContestDetail />,
      },
      {
        path: 'contest/:contestID/problems',
        element: <ContestProblemList />,
      },
      {
        path: 'contest/:contestID/problem/:problemID',
        element: <ContestProblemDetail />,
      },
      {
        path: 'contest/:contestID/announcements',
        element: <ContestAnnouncements />,
      },
      {
        path: 'contest/:contestID/rank',
        element: <ContestRank />,
      },

      // 랭킹
      {
        path: 'acm-rank',
        element: <Navigate to="/acm-rank/user-rank" replace />,
      },
      { path: 'acm-rank/user-rank', element: <UserRank /> },
      { path: 'acm-rank/surge-rank', element: <SurgeRank /> },
      { path: 'acm-rank/major-rank', element: <MajorRank /> },
      { path: 'oi-rank', element: <OIRank /> },

      // 사용자 프로필
      {
        path: 'user-home',
        element: <Navigate to="/user-home/dashboard" replace />,
      },
      {
        path: 'user-home',
        element: <UserHome />,
        children: [
          { path: 'dashboard/:username?', element: <UserDashboard /> },
          { path: 'problems/:username?', element: <UserProblems /> },
          { path: 'community/:username?', element: <UserCommunity /> },
          { path: 'achievements/:username?', element: <UserAchievements /> },
        ],
      },

      // 커뮤니티
      { path: 'community', element: <Community /> },
      { path: 'community/:postId', element: <CommunityPost /> },

      // 설정
      { path: 'user-setting', element: <UserSettings /> },

      // 공지사항
      { path: 'notice', element: <Notice /> },
      { path: 'notice/:noticeID', element: <NoticeDetail /> },

      // 인증
      { path: 'logout', element: <Logout /> },
      { path: 'apply-reset-password', element: <ApplyResetPassword /> },
      { path: 'reset-password/:token', element: <ResetPassword /> },

      // 404 페이지 (모든 다른 경로와 매치되지 않을 때)
      { path: '*', element: <NotFound /> },
    ],
  },
  // Admin routes
  {
    path: '/admin/login',
    element: <AdminLogin />,
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard', element: <AdminDashboard /> },
      { path: 'users', element: <UserManagement /> },
      { path: 'announcements', element: <AnnouncementManagement /> },
      { path: 'problems', element: <AdminProblemList /> },
      { path: 'problem/create', element: <CreateProblem /> },
      { path: 'problem/edit/:problemId', element: <EditProblem /> },
      { path: 'contests', element: <AdminContestList /> },
      { path: 'contest/create', element: <CreateContest /> },
      { path: 'contest/edit/:contestId', element: <EditContest /> },
    ],
  },
])

export default router
