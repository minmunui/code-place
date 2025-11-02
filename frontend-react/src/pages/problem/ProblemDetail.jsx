import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../../api'

/**
 * 문제 상세 페이지
 */
function ProblemDetail() {
  const { t } = useTranslation()
  const { problemID } = useParams()
  const navigate = useNavigate()

  const [problem, setProblem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('problem') // 'problem' | 'submissions'

  // 코드 에디터 상태
  const [language, setLanguage] = useState('C++')
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadProblem()
  }, [problemID])

  /**
   * 문제 상세 정보를 서버에서 불러옵니다.
   * 기본 언어를 설정하고 코드 템플릿이 있으면 에디터에 로드합니다.
   */
  const loadProblem = async () => {
    try {
      setLoading(true)
      const response = await api.getProblem(problemID)
      const problemData = response.data

      setProblem(problemData)

      // 기본 언어 설정
      if (problemData.languages && problemData.languages.length > 0) {
        const defaultLang = problemData.languages[0]
        setLanguage(defaultLang)

        // 템플릿이 있으면 로드
        if (problemData.template && problemData.template[defaultLang]) {
          setCode(problemData.template[defaultLang])
        }
      }
    } catch (error) {
      console.error('Failed to load problem:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 프로그래밍 언어를 변경합니다.
   * 코드가 비어있을 때만 새 언어의 템플릿을 로드합니다.
   * @param {string} newLang - 변경할 언어
   */
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang)

    // 템플릿이 있으면 로드 (코드가 비어있을 때만)
    if (problem.template && problem.template[newLang] && code.trim() === '') {
      setCode(problem.template[newLang])
    }
  }

  /**
   * 작성한 코드를 서버에 제출합니다.
   * 제출 성공 시 제출 상세 페이지로 이동합니다.
   */
  const handleSubmit = async () => {
    if (code.trim() === '') {
      alert(t('Code_can_not_be_empty'))
      return
    }

    try {
      setSubmitting(true)
      const response = await api.submitCode(problem.id, language, code)

      if (response.data && response.data.submission_id) {
        alert(t('Submitted_successfully'))
        // 제출 상세 페이지로 이동
        navigate(`/status/${response.data.submission_id}`)
      }
    } catch (error) {
      console.error('Failed to submit code:', error)
      alert('코드 제출에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  /**
   * 난이도에 따른 배지 색상 클래스를 반환합니다.
   * 다크모드를 지원합니다.
   * @param {string} difficulty - 난이도 (Low, Mid, High)
   * @returns {string} Tailwind CSS 클래스 문자열
   */
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Low':
        return 'text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-950'
      case 'Mid':
        return 'text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-950'
      case 'High':
        return 'text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-950'
      default:
        return 'text-muted-foreground bg-muted'
    }
  }

  /**
   * 샘플 입력 또는 출력을 클립보드에 복사합니다.
   * @param {string} text - 복사할 텍스트
   */
  const handleCopySample = (text) => {
    navigator.clipboard.writeText(text)
    alert('복사되었습니다!')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">{t('Loading')}</div>
      </div>
    )
  }

  if (!problem) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">{t('noProblemList')}</div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-120px)]">
      {/* 왼쪽: 문제 설명 */}
      <div className="flex flex-col bg-card rounded-lg shadow border border-border overflow-hidden">
        {/* 탭 헤더 */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('problem')}
            className={`px-6 py-3 font-medium transition ${
              activeTab === 'problem'
                ? 'bg-background text-foreground border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            문제 설명
          </button>
          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-6 py-3 font-medium transition ${
              activeTab === 'submissions'
                ? 'bg-background text-foreground border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            제출 현황
          </button>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'problem' ? (
            <div className="space-y-6">
              {/* 문제 제목 및 메타 정보 */}
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-4">
                  {problem._id}. {problem.title}
                </h1>
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded ${getDifficultyColor(problem.difficulty)}`}
                  >
                    {problem.difficulty === 'Low'
                      ? t('Low')
                      : problem.difficulty === 'Mid'
                        ? t('Mid')
                        : t('High')}
                  </span>
                  {problem.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-sm bg-accent text-foreground rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* 문제 설명 */}
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">{t('Description')}</h2>
                <div
                  className="text-foreground prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: problem.description }}
                />
              </div>

              {/* 입력 */}
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">{t('Input')}</h2>
                <div
                  className="text-foreground prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: problem.input_description }}
                />
              </div>

              {/* 출력 */}
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">{t('Output')}</h2>
                <div
                  className="text-foreground prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: problem.output_description }}
                />
              </div>

              {/* 샘플 입출력 */}
              {problem.samples?.map((sample, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 샘플 입력 */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-foreground">
                        {t('Sample_Input')} {index + 1}
                      </h3>
                      <button
                        onClick={() => handleCopySample(sample.input)}
                        className="text-sm text-primary hover:text-primary/80"
                      >
                        복사
                      </button>
                    </div>
                    <pre className="p-4 bg-muted text-foreground rounded border border-border overflow-x-auto">
                      {sample.input}
                    </pre>
                  </div>

                  {/* 샘플 출력 */}
                  <div>
                    <h3 className="font-bold text-foreground mb-2">
                      {t('Sample_Output')} {index + 1}
                    </h3>
                    <pre className="p-4 bg-muted text-foreground rounded border border-border overflow-x-auto">
                      {sample.output}
                    </pre>
                  </div>
                </div>
              ))}

              {/* 제약사항 */}
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">제약사항</h2>
                <ul className="list-disc list-inside space-y-1 text-foreground">
                  <li>
                    {t('Time_Limit')}: <code className="text-primary">{problem.time_limit}ms</code>
                  </li>
                  <li>
                    {t('Memory_Limit')}:{' '}
                    <code className="text-primary">{problem.memory_limit}MB</code>
                  </li>
                </ul>
              </div>

              {/* 힌트 */}
              {problem.hint && (
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-2">{t('Hint')}</h2>
                  <div className="p-4 bg-accent rounded border border-border">
                    <div
                      className="text-foreground prose prose-sm max-w-none dark:prose-invert"
                      dangerouslySetInnerHTML={{ __html: problem.hint }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              제출 현황은 추후 구현 예정입니다.
            </div>
          )}
        </div>
      </div>

      {/* 오른쪽: 코드 에디터 */}
      <div className="flex flex-col bg-card rounded-lg shadow border border-border overflow-hidden">
        {/* 에디터 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-foreground">{t('Language')}:</label>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="px-3 py-2 bg-background text-foreground border border-input rounded focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {problem.languages?.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? t('Submitting') : t('Submit')}
          </button>
        </div>

        {/* 코드 에디터 */}
        <div className="flex-1 overflow-hidden">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-full p-4 bg-background text-foreground font-mono text-sm resize-none focus:outline-none"
            placeholder="여기에 코드를 작성하세요..."
            spellCheck={false}
          />
        </div>

        {/* 에디터 푸터 */}
        <div className="px-4 py-2 border-t border-border bg-muted">
          <div className="text-xs text-muted-foreground">
            {code.split('\n').length} 줄, {code.length} 자
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProblemDetail
