/**
 * API 에러 처리 유틸리티
 *
 * 모든 API 호출에서 일관된 에러 메시지를 추출하고 표시하기 위한 헬퍼 함수들
 */

/**
 * API 에러 응답에서 사용자에게 표시할 메시지 추출
 *
 * @param {Error} error - API 호출 중 발생한 에러 객체
 * @param {string} defaultMessage - 에러 메시지를 찾을 수 없을 때 사용할 기본 메시지
 * @returns {string} 사용자에게 표시할 에러 메시지
 */
export const getErrorMessage = (error, defaultMessage = '오류가 발생했습니다') => {
  // 네트워크 에러 (서버 응답 없음)
  if (!error.response) {
    return '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.'
  }

  // 서버 응답이 있는 경우
  const { status, data } = error.response

  // 백엔드 API의 일반적인 응답 구조
  // { error: "error_type", data: "error_message" }
  if (data) {
    // data 필드에 에러 메시지가 있는 경우 (가장 흔한 경우)
    if (typeof data.data === 'string' && data.data) {
      return data.data
    }

    // error 필드에 에러 타입이 있는 경우
    if (data.error) {
      // 특정 에러 타입에 대한 한국어 메시지 매핑
      const errorMessages = {
        'permission-denied': '권한이 없습니다.',
        'invalid-username-or-password': '아이디 또는 비밀번호가 올바르지 않습니다.',
        'user-not-found': '사용자를 찾을 수 없습니다.',
        'user-disabled': '비활성화된 계정입니다. 관리자에게 문의하세요.',
        'invalid-token': '인증 토큰이 유효하지 않습니다. 다시 로그인해주세요.',
        'token-expired': '세션이 만료되었습니다. 다시 로그인해주세요.',
        'duplicate-username': '이미 사용 중인 아이디입니다.',
        'duplicate-email': '이미 사용 중인 이메일입니다.',
        'invalid-format': '입력 형식이 올바르지 않습니다.',
        'required-field-missing': '필수 항목을 입력해주세요.',
        'invalid-old-password': '기존 비밀번호가 올바르지 않습니다.',
        'problem-not-found': '문제를 찾을 수 없습니다.',
        'contest-not-found': '대회를 찾을 수 없습니다.',
        'announcement-not-found': '공지사항을 찾을 수 없습니다.',
      }

      const errorKey = data.error.toLowerCase()
      if (errorMessages[errorKey]) {
        return errorMessages[errorKey]
      }

      // 매핑되지 않은 에러 타입은 그대로 표시
      return data.error
    }

    // message 필드가 있는 경우
    if (data.message) {
      return data.message
    }

    // data 자체가 문자열인 경우
    if (typeof data === 'string' && data) {
      return data
    }
  }

  // HTTP 상태 코드에 따른 기본 메시지
  const statusMessages = {
    400: '잘못된 요청입니다.',
    401: '인증이 필요합니다. 로그인해주세요.',
    403: '접근 권한이 없습니다.',
    404: '요청한 리소스를 찾을 수 없습니다.',
    409: '충돌이 발생했습니다. (중복된 데이터)',
    422: '입력값을 확인해주세요.',
    429: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
    500: '서버 오류가 발생했습니다.',
    502: '게이트웨이 오류가 발생했습니다.',
    503: '서비스를 일시적으로 사용할 수 없습니다.',
    504: '게이트웨이 시간 초과입니다.',
  }

  if (statusMessages[status]) {
    return statusMessages[status]
  }

  // 그 외의 경우 기본 메시지 반환
  return defaultMessage
}

/**
 * API 에러를 콘솔에 로깅 (개발 환경에서만)
 *
 * @param {string} context - 에러가 발생한 컨텍스트 (예: "Admin Login", "Create Problem")
 * @param {Error} error - 에러 객체
 */
export const logError = (context, error) => {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🔴 Error in ${context}`)
    console.error('Error object:', error)
    if (error.response) {
      console.error('Response status:', error.response.status)
      console.error('Response data:', error.response.data)
      console.error('Response headers:', error.response.headers)
    }
    console.groupEnd()
  }
}

/**
 * API 에러 처리 헬퍼 함수
 * 에러 로깅과 메시지 추출을 한 번에 수행
 *
 * @param {string} context - 에러가 발생한 컨텍스트
 * @param {Error} error - 에러 객체
 * @param {string} defaultMessage - 기본 에러 메시지
 * @returns {string} 사용자에게 표시할 에러 메시지
 */
export const handleApiError = (context, error, defaultMessage) => {
  logError(context, error)
  return getErrorMessage(error, defaultMessage)
}

/**
 * 폼 유효성 검사 에러 추출
 * Django REST Framework의 필드별 에러 메시지 처리
 *
 * @param {Error} error - API 에러 객체
 * @returns {Object} 필드명을 키로 하는 에러 메시지 객체
 */
export const getFieldErrors = (error) => {
  const fieldErrors = {}

  if (error.response?.data) {
    const data = error.response.data

    // DRF 스타일의 필드 에러
    if (typeof data === 'object' && !data.error && !data.data) {
      Object.keys(data).forEach((field) => {
        if (Array.isArray(data[field])) {
          fieldErrors[field] = data[field][0] // 첫 번째 에러 메시지만 사용
        } else if (typeof data[field] === 'string') {
          fieldErrors[field] = data[field]
        }
      })
    }
  }

  return fieldErrors
}

/**
 * 성공 여부 확인
 *
 * @param {Object} response - API 응답 객체
 * @returns {boolean} 성공 여부
 */
export const isSuccess = (response) => {
  return response?.data?.error === null || response?.status >= 200 && response?.status < 300
}
