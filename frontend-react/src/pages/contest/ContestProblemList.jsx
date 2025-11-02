import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api'
import useUserStore from '../../store/userStore'

/**
 * 대회 문제 목록 페이지
 * 특정 대회의 문제 목록을 표시합니다.
 */
function ContestProblemList() {
  const { contestID } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useUserStore()

  const [problems, setProblems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProblems()
  }, [contestID])

  /**
   * 대회 문제 목록을 서버에서 불러옵니다.
   */
  const loadProblems = async () => {
    try {
      setLoading(true)
      const response = await api.getContestProblems(contestID)
      setProblems(response.data || [])
    } catch (error) {
      console.error('Failed to load contest problems:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 문제 상세 페이지로 이동합니다.
   * @param {string} problemId - 문제 ID
   */
  const handleProblemClick = (problemId) => {
    navigate(`/contest/${contestID}/problem/${problemId}`)
  }

  /**
   * 난이도에 따른 색상 클래스를 반환합니다.
   * @param {string} difficulty - 문제 난이도
   * @returns {string} Tailwind CSS 클래스 문자열
   */
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'VeryLow':
        return 'text-green-600 dark:text-green-400'
      case 'Low':
        return 'text-blue-600 dark:text-blue-400'
      case 'Mid':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'High':
        return 'text-orange-600 dark:text-orange-400'
      case 'VeryHigh':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-muted-foreground'
    }
  }

  /**
   * 난이도 텍스트를 한글로 변환합니다.
   * @param {string} difficulty - 문제 난이도
   * @returns {string} 한글 난이도
   */
  const getDifficultyText = (difficulty) => {
    switch (difficulty) {
      case 'VeryLow':
        return '매우 쉬움'
      case 'Low':
        return '쉬움'
      case 'Mid':
        return '보통'
      case 'High':
        return '어려움'
      case 'VeryHigh':
        return '매우 어려움'
      default:
        return difficulty
    }
  }

  /**
   * 정답률을 계산합니다.
   * @param {number} acceptedNumber - 정답 제출 수
   * @param {number} submissionNumber - 전체 제출 수
   * @returns {string} 정답률 문자열
   */
  const getAcceptRate = (acceptedNumber, submissionNumber) => {
    if (!submissionNumber) return '0.00%'
    return ((acceptedNumber / submissionNumber) * 100).toFixed(2) + '%'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    )
  }

  if (!problems.length) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">문제가 없습니다</p>
          <button
            onClick={() => navigate(`/contest/${contestID}`)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition"
          >
            대회 페이지로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">문제 목록</h2>
        <button
          onClick={loadProblems}
          className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition"
        >
          새로고침
        </button>
      </div>

      {/* 문제 테이블 */}
      <div className="bg-card rounded-lg shadow border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground w-16">
                #
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                제목
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-foreground w-24">
                난이도
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-foreground w-32">
                정답률
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-foreground w-24">
                제출 수
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {problems.map((problem, index) => (
              <tr
                key={problem.id}
                onClick={() => handleProblemClick(problem._id)}
                className="hover:bg-accent transition cursor-pointer"
              >
                <td className="px-6 py-4 text-sm text-foreground font-medium">
                  {problem._id}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {problem.title}
                    </span>
                    {problem.my_status === 0 && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400">
                        해결
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span
                    className={`text-sm font-medium ${getDifficultyColor(problem.difficulty)}`}
                  >
                    {getDifficultyText(problem.difficulty)}
                  </span>
                </td>
                <td className="px-6 py-4 text-center text-sm text-muted-foreground">
                  {getAcceptRate(problem.accepted_number, problem.submission_number)}
                </td>
                <td className="px-6 py-4 text-center text-sm text-muted-foreground">
                  {problem.submission_number || 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 통계 정보 */}
      <div className="bg-card rounded-lg shadow border border-border p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{problems.length}</div>
            <div className="text-sm text-muted-foreground">전체 문제</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {problems.filter((p) => p.my_status === 0).length}
            </div>
            <div className="text-sm text-muted-foreground">해결한 문제</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {problems.length - problems.filter((p) => p.my_status === 0).length}
            </div>
            <div className="text-sm text-muted-foreground">미해결 문제</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContestProblemList
