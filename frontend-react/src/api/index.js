import axios from 'axios'

// API 기본 URL
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  withCredentials: true, // 세션 쿠키 전송을 위해 필요
  headers: {
    'Content-Type': 'application/json',
  },
})

// 응답 인터셉터 - 에러 처리
apiClient.interceptors.response.use(
  (response) => {
    // API 응답 형식: { error: null, data: {} }
    if (response.data.error) {
      return Promise.reject(new Error(response.data.error))
    }
    return response.data
  },
  (error) => {
    // 네트워크 에러 또는 서버 에러
    if (error.response) {
      console.error('API Error:', error.response.data)
      return Promise.reject(error.response.data)
    }
    return Promise.reject(error)
  }
)

// API 함수들
const api = {
  // ===== 인증 & 사용자 =====

  // 로그인
  login(username, password) {
    return apiClient.post('/login', { username, password })
  },

  // 회원가입
  register(userData) {
    return apiClient.post('/register', userData)
  },

  // 로그아웃
  logout() {
    return apiClient.get('/logout')
  },

  // 비밀번호 재설정 신청
  applyResetPassword(data) {
    return apiClient.post('/apply_reset_password', data)
  },

  // 비밀번호 재설정
  resetPassword(data) {
    return apiClient.post('/reset_password', data)
  },

  // 사용자 프로필 조회
  getUserProfile(username) {
    const params = username ? { username } : {}
    return apiClient.get('/profile', { params })
  },

  // 대시보드 정보
  getDashboard(username) {
    return apiClient.get('/profile/dashboard', { params: { username } })
  },

  // 사용자 문제 풀이 정보
  getUserProblems(username) {
    return apiClient.get('/profile/problem', { params: { username } })
  },

  // 프로필 업데이트
  updateProfile(data) {
    return apiClient.put('/profile', data)
  },

  // 아바타 업로드
  uploadAvatar(file) {
    const formData = new FormData()
    formData.append('image', file)
    return apiClient.post('/profile/upload_avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // 비밀번호 변경
  changePassword(oldPassword, newPassword) {
    return apiClient.post('/change_password', {
      old_password: oldPassword,
      new_password: newPassword,
    })
  },

  // 이메일 변경
  changeEmail(email, code) {
    return apiClient.post('/change_email', { email, code })
  },

  // 세션 목록
  getSessions() {
    return apiClient.get('/sessions')
  },

  // 세션 삭제
  deleteSession(sessionKey) {
    return apiClient.delete('/sessions', { params: { session_key: sessionKey } })
  },

  // ===== 문제 =====

  // 문제 목록
  getProblemList(offset, limit, filters = {}) {
    return apiClient.get('/problem', {
      params: {
        paging: true,
        offset,
        limit,
        ...filters,
      },
    })
  },

  // 문제 상세
  getProblem(problemId) {
    return apiClient.get('/problem', { params: { problem_id: problemId } })
  },

  // 문제 태그 목록
  getProblemTags() {
    return apiClient.get('/problem/tags')
  },

  // 보너스 문제
  getBonusProblems() {
    return apiClient.get('/problem/bonus')
  },

  // 가장 어려운 문제
  getMostDifficultProblem() {
    return apiClient.get('/problem/most_difficult_problem')
  },

  // 개인 추천 문제
  getRecommendedProblems() {
    return apiClient.get('/recommend_problem')
  },

  // 랜덤 문제 (Pick One)
  getRandomProblem() {
    return apiClient.get('/pickone')
  },

  // ===== 제출 =====

  // 코드 제출
  submitCode(problemId, language, code, contestId = null) {
    return apiClient.post('/submission', {
      problem_id: problemId,
      contest_id: contestId,
      language,
      code,
    })
  },

  // 제출 목록
  getSubmissions(params) {
    return apiClient.get('/submissions', { params })
  },

  // 제출 상세
  getSubmission(submissionId) {
    return apiClient.get('/submission', { params: { id: submissionId } })
  },

  // 제출 순위
  getSubmissionRank(submissionId) {
    return apiClient.get('/submission_rank', {
      params: { submission_id: submissionId },
    })
  },

  // 제출 여부 확인
  checkSubmissionExists(problemId) {
    return apiClient.get('/submission_exists', {
      params: { problem_id: problemId },
    })
  },

  // 제출 공유 상태 업데이트
  updateSubmission(data) {
    return apiClient.put('/submission', data)
  },

  // ===== 대회 =====

  // 대회 목록
  getContestList(params) {
    return apiClient.get('/contests', { params })
  },

  // 대회 목록 (별칭)
  getContests(params) {
    return apiClient.get('/contests', { params })
  },

  // 진행 중인 대회
  getContestsUnderway() {
    return apiClient.get('/contest_underway')
  },

  // 시작 전 대회
  getContestsNotStarted() {
    return apiClient.get('/contest_not_started')
  },

  // 대회 히스토리
  getContestHistory(offset, limit) {
    return apiClient.get('/contest_history', { params: { offset, limit } })
  },

  // 대회 상세
  getContest(contestId) {
    return apiClient.get('/contest', { params: { id: contestId } })
  },

  // 대회 접근 권한 확인
  checkContestAccess(contestId) {
    return apiClient.get('/contest/access', {
      params: { contest_id: contestId },
    })
  },

  // 대회 참가
  joinContest(contestId, data) {
    return apiClient.post('/contest/join', {
      contest_id: contestId,
      ...data,
    })
  },

  // 대회 비밀번호 확인
  verifyContestPassword(contestId, password) {
    return apiClient.post('/contest/password', {
      contest_id: contestId,
      password,
    })
  },

  // 대회 공지사항
  getContestAnnouncements(contestId) {
    return apiClient.get('/contest/announcement', {
      params: { contest_id: contestId },
    })
  },

  // 대회 문제 목록
  getContestProblems(contestId) {
    return apiClient.get('/contest/problem', {
      params: { contest_id: contestId },
    })
  },

  // 대회 문제 상세
  getContestProblem(contestId, problemId) {
    return apiClient.get('/contest/problem', {
      params: { contest_id: contestId, problem_id: problemId },
    })
  },

  // 대회 랭킹
  getContestRank(contestId, offset, limit, forceRefresh = false) {
    return apiClient.get('/contest_rank', {
      params: {
        contest_id: contestId,
        offset,
        limit,
        force_refresh: forceRefresh,
      },
    })
  },

  // ===== 랭킹 =====

  // 사용자 랭킹
  getUserRank(offset, limit, rule = 'ACM') {
    return apiClient.get('/user_rank', {
      params: { offset, limit, rule },
    })
  },

  // 급상승 랭킹
  getSurgeRank(offset, limit) {
    return apiClient.get('/surge_user_rank', { params: { offset, limit } })
  },

  // 학과별 랭킹
  getMajorRank(offset, limit) {
    return apiClient.get('/major_rank', { params: { offset, limit } })
  },

  // ===== 공지사항 =====

  // 공지사항 목록
  getAnnouncements(offset, limit) {
    return apiClient.get('/announcement', { params: { offset, limit } })
  },

  // 공지사항 상세
  getAnnouncement(announcementId) {
    return apiClient.get('/announcement', { params: { id: announcementId } })
  },

  // ===== 커뮤니티 =====

  // 게시글 목록
  getCommunityPosts(params) {
    return apiClient.get('/community/posts', { params })
  },

  // 게시글 상세
  getCommunityPost(postId) {
    return apiClient.get(`/community/posts/${postId}`)
  },

  // 댓글 작성
  createComment(postId, content, parentCommentId = null) {
    return apiClient.post(`/community/posts/${postId}/comments`, {
      content,
      parent_comment_id: parentCommentId,
    })
  },

  // ===== 기타 =====

  // 웹사이트 설정
  getWebsiteConfig() {
    return apiClient.get('/website')
  },

  // 홈 통계
  getHomeStatistics() {
    return apiClient.get('/home_statistics')
  },

  // 홈 실시간 랭킹
  getHomeRanking() {
    return apiClient.get('/home_ranking')
  },

  // 팝업
  getPopup() {
    return apiClient.get('/popup')
  },

  // 배너
  getBanner() {
    return apiClient.get('/banner')
  },

  // 캡차
  getCaptcha() {
    return apiClient.get('/captcha')
  },

  // 프로그래밍 언어 목록
  getLanguages() {
    return apiClient.get('/languages')
  },

  // 대학 목록
  getCollegeList() {
    return apiClient.get('/college_list')
  },

  // 학과 목록
  getDepartmentList(collegeId) {
    return apiClient.get('/department_list', {
      params: { college_id: collegeId },
    })
  },

  // 닉네임 중복 확인
  checkNicknameValid(nickname) {
    return apiClient.get('/nickname_valid_check', {
      params: { nickname },
    })
  },

  // 이메일 인증 신청
  applyEmailValidation(email) {
    return apiClient.post('/apply_user_email_valid_check', { email })
  },

  // 이메일 인증 확인
  verifyEmail(email, code) {
    return apiClient.post('/user_email_valid_check', { email, code })
  },
}

export default api
