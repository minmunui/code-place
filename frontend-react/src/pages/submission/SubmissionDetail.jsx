import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../../api'
import useUserStore from '../../store/userStore'

/**
 * 제출 상태 정보
 * @param {function} t - 번역 함수
 * @returns {object} 제출 상태 객체
 */
const getJudgeStatus = (t) => ({
  '-2': { name: t('Compile_Error'), short: 'CE', color: 'red', type: 'error' },
  '-1': { name: t('Wrong_Answer'), short: 'WA', color: 'red', type: 'error' },
  '0': { name: t('Accepted'), short: 'AC', color: 'green', type: 'success' },
  '1': { name: t('Time_Limit_Exceeded'), short: 'TLE', color: 'orange', type: 'warning' },
  '2': { name: t('Time_Limit_Exceeded'), short: 'TLE', color: 'orange', type: 'warning' },
  '3': { name: t('Memory_Limit_Exceeded'), short: 'MLE', color: 'orange', type: 'warning' },
  '4': { name: t('Runtime_Error'), short: 'RE', color: 'red', type: 'error' },
  '5': { name: t('System_Error'), short: 'SE', color: 'red', type: 'error' },
  '6': { name: t('Pending'), short: 'PD', color: 'yellow', type: 'info' },
  '7': { name: t('Judging'), short: 'JG', color: 'blue', type: 'info' },
  '8': { name: t('Partial_Accepted'), short: 'PC', color: 'yellow', type: 'warning' },
})

/**
 * 제출 상세 페이지
 */
function SubmissionDetail() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useUserStore()

  const JUDGE_STATUS = getJudgeStatus(t)

  const [submission, setSubmission] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSubmission()
  }, [id])

  /**
   * 제출 상세 정보를 서버에서 불러옵니다.
   */
  const loadSubmission = async () => {
    try {
      setLoading(true)
      const response = await api.getSubmission(id)
      setSubmission(response.data)
    } catch (error) {
      console.error('Failed to load submission:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 제출 결과 상태에 따른 색상 클래스를 반환합니다.
   * 배경색, 텍스트 색상, 테두리 색상을 포함하며 다크모드를 지원합니다.
   * @param {string} result - 제출 결과 상태 코드
   * @returns {string} Tailwind CSS 클래스 문자열
   */
  const getStatusColorClass = (result) => {
    const status = JUDGE_STATUS[result]
    if (!status) return 'text-muted-foreground bg-muted'

    switch (status.color) {
      case 'green':
        return 'text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-950 border-green-300 dark:border-green-800'
      case 'red':
        return 'text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-950 border-red-300 dark:border-red-800'
      case 'orange':
        return 'text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-orange-950 border-orange-300 dark:border-orange-800'
      case 'yellow':
        return 'text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-950 border-yellow-300 dark:border-yellow-800'
      case 'blue':
        return 'text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-950 border-blue-300 dark:border-blue-800'
      default:
        return 'text-muted-foreground bg-muted border-border'
    }
  }

  /**
   * 실행 시간을 밀리초 단위로 포맷팅합니다.
   * @param {number} ms - 밀리초 단위의 실행 시간
   * @returns {string} 포맷팅된 시간 문자열
   */
  const formatTime = (ms) => {
    if (!ms && ms !== 0) return '-'
    return `${ms}ms`
  }

  /**
   * 메모리 사용량을 바이트 단위에서 MB 단위로 변환하여 포맷팅합니다.
   * @param {number} bytes - 바이트 단위의 메모리 사용량
   * @returns {string} 포맷팅된 메모리 문자열
   */
  const formatMemory = (bytes) => {
    if (!bytes && bytes !== 0) return '-'
    return `${(bytes / 1024 / 1024).toFixed(2)}MB`
  }

  /**
   * 제출 코드의 공유 상태를 토글합니다.
   * 공유 활성화 시 다른 사용자가 코드를 볼 수 있습니다.
   */
  const handleShareToggle = async () => {
    try {
      await api.updateSubmission({ id: submission.id, shared: !submission.shared })
      alert(submission.shared ? '공유가 해제되었습니다.' : '공유되었습니다.')
      loadSubmission()
    } catch (error) {
      console.error('Failed to update submission:', error)
      alert('공유 상태 변경에 실패했습니다.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    )
  }

  if (!submission) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">제출 정보를 찾을 수 없습니다.</div>
      </div>
    )
  }

  const status = JUDGE_STATUS[submission.result] || {
    name: 'Unknown',
    short: 'UK',
    color: 'gray',
    type: 'info',
  }
  const isCE = submission.result === -2

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 상태 알림 */}
      <div
        className={`p-6 rounded-lg border-2 ${getStatusColorClass(submission.result)}`}
      >
        <div className="flex items-start">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-4">{status.name}</h2>
            {isCE ? (
              <pre className="text-sm whitespace-pre-wrap bg-muted p-4 rounded overflow-x-auto">
                {submission.statistic_info?.err_info || '컴파일 에러 정보 없음'}
              </pre>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm opacity-75">시간</div>
                  <div className="font-medium">
                    {formatTime(submission.statistic_info?.time_cost)}
                  </div>
                </div>
                <div>
                  <div className="text-sm opacity-75">메모리</div>
                  <div className="font-medium">
                    {formatMemory(submission.statistic_info?.memory_cost)}
                  </div>
                </div>
                <div>
                  <div className="text-sm opacity-75">언어</div>
                  <div className="font-medium">{submission.language}</div>
                </div>
                <div>
                  <div className="text-sm opacity-75">작성자</div>
                  <div className="font-medium">
                    <button
                      onClick={() =>
                        navigate(`/user-home/dashboard/${submission.username}`)
                      }
                      className="hover:opacity-80 underline"
                    >
                      {submission.username}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 테스트 케이스 결과 (컴파일 에러가 아닐 때) */}
      {!isCE && submission.info && submission.info.data && (
        <div className="bg-card rounded-lg shadow border border-border overflow-hidden">
          <div className="px-6 py-4 bg-muted border-b border-border">
            <h3 className="font-bold text-foreground">테스트 케이스 결과</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    시간
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    메모리
                  </th>
                  {submission.info.data[0]?.score !== undefined && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      점수
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {submission.info.data.map((testCase, index) => (
                  <tr key={index} className="hover:bg-accent transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${getStatusColorClass(testCase.result).replace(/border-\S+/g, '')}`}
                      >
                        {JUDGE_STATUS[testCase.result]?.short || 'UK'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {formatTime(testCase.cpu_time)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {formatMemory(testCase.memory)}
                    </td>
                    {testCase.score !== undefined && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {testCase.score}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 코드 */}
      <div className="bg-card rounded-lg shadow border-2 border-border overflow-hidden">
        <div className="px-6 py-4 bg-muted border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-foreground">제출 코드</h3>
          <span className="text-sm text-muted-foreground">{submission.language}</span>
        </div>
        <div className="p-6">
          <pre className="text-sm bg-muted text-foreground p-4 rounded overflow-x-auto">
            <code>{submission.code}</code>
          </pre>
        </div>
      </div>

      {/* 공유 버튼 */}
      {submission.can_unshare && (
        <div className="flex justify-center">
          <button
            onClick={handleShareToggle}
            className={`px-6 py-3 rounded font-medium transition ${
              submission.shared
                ? 'bg-orange-600 text-white hover:bg-orange-700'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            {submission.shared ? '공유 해제' : '공유하기'}
          </button>
        </div>
      )}
    </div>
  )
}

export default SubmissionDetail
