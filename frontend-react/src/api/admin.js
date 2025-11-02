import axios from 'axios'

// API 기본 URL
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const adminApi = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  withCredentials: true, // 세션 쿠키 전송을 위해 필요
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
adminApi.interceptors.request.use(
  (config) => {
    // Add auth token if exists
    const token = localStorage.getItem('adminToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
adminApi.interceptors.response.use(
  (response) => {
    // API 응답 형식: { error: null, data: {} }
    if (response.data.error) {
      return Promise.reject(new Error(response.data.error))
    }
    return response.data
  },
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login if unauthorized
      localStorage.removeItem('adminToken')
      window.location.href = '/admin/login'
    }
    return Promise.reject(error)
  }
)

// Admin API endpoints
export default {
  // Auth
  login: (username, password) => {
    return adminApi.post('/login', { username, password })
  },

  logout: () => {
    return adminApi.get('/logout')
  },

  getProfile: () => {
    return adminApi.get('/profile')
  },

  // Dashboard
  getDashboardInfo: () => {
    return adminApi.get('/admin/dashboard_info')
  },

  // Users
  getUserList: (params) => {
    return adminApi.get('/admin/user', { params })
  },

  editUser: (data) => {
    return adminApi.put('/admin/user', data)
  },

  deleteUser: (userId) => {
    return adminApi.delete('/admin/user', { params: { id: userId } })
  },

  importUsers: (users) => {
    return adminApi.post('/admin/user/import', { users })
  },

  generateUser: (data) => {
    return adminApi.post('/admin/generate_user', data)
  },

  // Announcements
  getAnnouncementList: (params) => {
    return adminApi.get('/admin/announcement', { params })
  },

  createAnnouncement: (data) => {
    return adminApi.post('/admin/announcement', data)
  },

  updateAnnouncement: (data) => {
    return adminApi.put('/admin/announcement', data)
  },

  deleteAnnouncement: (id) => {
    return adminApi.delete('/admin/announcement', { params: { id } })
  },

  // Problems
  getProblemList: (params) => {
    return adminApi.get('/admin/problem', { params })
  },

  getProblem: (id) => {
    return adminApi.get('/admin/problem', { params: { id } })
  },

  createProblem: (data) => {
    return adminApi.post('/admin/problem', data)
  },

  updateProblem: (data) => {
    return adminApi.put('/admin/problem', data)
  },

  deleteProblem: (id) => {
    return adminApi.delete('/admin/problem', { params: { id } })
  },

  addProblemFromPublic: (problemId) => {
    return adminApi.post('/admin/add_problem_from_public', { problem_id: problemId })
  },

  importProblem: (data) => {
    return adminApi.post('/admin/import_problem', data)
  },

  exportProblem: (problemId) => {
    return adminApi.get('/admin/export_problem', { params: { id: problemId } })
  },

  uploadTestCase: (problemId, file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('problem_id', problemId)
    return adminApi.post('/admin/test_case', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  downloadTestCase: (problemId) => {
    return adminApi.get('/admin/test_case', {
      params: { problem_id: problemId },
      responseType: 'blob'
    })
  },

  // Contests
  getContestList: (params) => {
    return adminApi.get('/admin/contest', { params })
  },

  getContest: (id) => {
    return adminApi.get('/admin/contest', { params: { id } })
  },

  createContest: (data) => {
    return adminApi.post('/admin/contest', data)
  },

  updateContest: (data) => {
    return adminApi.put('/admin/contest', data)
  },

  deleteContest: (id) => {
    return adminApi.delete('/admin/contest', { params: { id } })
  },

  getContestAnnouncement: (contestId) => {
    return adminApi.get('/admin/contest/announcement', { params: { contest_id: contestId } })
  },

  createContestAnnouncement: (data) => {
    return adminApi.post('/admin/contest/announcement', data)
  },

  updateContestAnnouncement: (data) => {
    return adminApi.put('/admin/contest/announcement', data)
  },

  deleteContestAnnouncement: (id) => {
    return adminApi.delete('/admin/contest/announcement', { params: { id } })
  },

  // Judge Server
  getJudgeServerList: () => {
    return adminApi.get('/admin/judge_server')
  },

  deleteJudgeServer: (hostname) => {
    return adminApi.delete('/admin/judge_server', { params: { hostname } })
  },

  updateJudgeServer: (data) => {
    return adminApi.put('/admin/judge_server', data)
  },

  // System Config
  getWebsiteConfig: () => {
    return adminApi.get('/admin/website')
  },

  updateWebsiteConfig: (data) => {
    return adminApi.post('/admin/website', data)
  },

  getSMTPConfig: () => {
    return adminApi.get('/admin/smtp')
  },

  updateSMTPConfig: (data) => {
    return adminApi.post('/admin/smtp', data)
  },

  testSMTPConfig: (email) => {
    return adminApi.post('/admin/smtp_test', { email })
  },

  getJudgeServerToken: () => {
    return adminApi.get('/admin/judge_server_token')
  },

  // Prune Test Case
  getPruneTestCaseList: () => {
    return adminApi.get('/admin/prune_test_case')
  },

  pruneTestCase: (testCaseId) => {
    return adminApi.delete('/admin/prune_test_case', { params: { id: testCaseId } })
  },

  // Release Notes
  getReleaseNotes: () => {
    return adminApi.get('/admin/release_notes')
  },
}
