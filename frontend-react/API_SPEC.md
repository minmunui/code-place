# Code Place API 명세서

React 프론트엔드 개발을 위한 API 엔드포인트 및 라우트 구조 문서

## 기본 정보

- **Base URL**: `http://localhost:8000/api`
- **인증 방식**: Session-based (Cookie)
- **응답 형식**: JSON

**기본 응답 형식:**
```json
{
  "error": null,  // 에러가 있으면 에러 메시지, 없으면 null
  "data": {}      // 실제 데이터
}
```

**목록 API 응답 형식:**
```json
{
  "error": null,
  "data": {
    "results": [],    // 실제 데이터 배열
    "total": 0        // 전체 항목 수
  }
}
```

---

## 라우트 구조

### 1. 홈 & 공통
- `/` - 홈페이지
- `/about` - 소개 페이지
- `/faq` - FAQ
- `/logout` - 로그아웃

### 2. 인증
- `/apply-reset-password` - 비밀번호 재설정 신청
- `/reset-password/:token` - 비밀번호 재설정

### 3. 문제
- `/problem` - 문제 목록
- `/problem/:problemID` - 문제 상세

### 4. 제출
- `/status` - 제출 목록
- `/status/:id` - 제출 상세

### 5. 대회
- `/contest` - 대회 목록
- `/contest-history` - 대회 히스토리
- `/contest/:contestID` - 대회 상세
  - `/contest/:contestID/overview` - 대회 개요
  - `/contest/:contestID/problems` - 대회 문제 목록
  - `/contest/:contestID/problem/:problemID` - 대회 문제 상세
  - `/contest/:contestID/announcements` - 대회 공지
  - `/contest/:contestID/rank` - 대회 랭킹

### 6. 랭킹
- `/acm-rank` - ACM 랭킹 (리다이렉트)
  - `/acm-rank/user-rank` - 사용자 랭킹
  - `/acm-rank/surge-rank` - 급상승 랭킹
  - `/acm-rank/major-rank` - 학과별 랭킹
- `/oi-rank` - OI 랭킹

### 7. 사용자 프로필
- `/user-home` - 사용자 홈 (리다이렉트)
  - `/user-home/dashboard/:username?` - 대시보드
  - `/user-home/problems/:username?` - 문제 풀이 현황
  - `/user-home/community/:username?` - 커뮤니티 활동
  - `/user-home/achievements/:username?` - 업적

### 8. 설정 (인증 필요)
- `/user-setting` - 사용자 설정

### 9. 커뮤니티
- `/community` - 커뮤니티 게시글 목록
- `/community/:postId` - 게시글 상세

### 10. 공지사항
- `/notice` - 공지사항 목록
- `/notice/:noticeID` - 공지사항 상세

---

## API 엔드포인트

### 인증 & 사용자

#### 로그인
```
POST /api/login
```
**Request:**
```json
{
  "username": "user1",
  "password": "password123"
}
```
**Response:**
```json
{
  "error": null,
  "data": {
    "id": "user_id",
    "username": "user1",
    "email": "user@example.com",
    "real_name": "홍길동",
    "admin_type": "Regular User"
  }
}
```

#### 회원가입
```
POST /api/register
```
**Request:**
```json
{
  "username": "newuser",
  "password": "password123",
  "email": "newuser@example.com",
  "real_name": "홍길동",
  "student_id": "20231234",
  "college_id": 1,
  "department_id": 1
}
```
**Response:**
```json
{
  "error": null,
  "data": {
    "message": "회원가입이 완료되었습니다."
  }
}
```

#### 로그아웃
```
GET /api/logout
```
**Response:**
```json
{
  "error": null,
  "data": {
    "message": "로그아웃되었습니다."
  }
}
```

#### 사용자 정보 조회
```
GET /api/profile?username={username}
```
**Response:**
```json
{
  "error": null,
  "data": {
    "user": {
      "id": "user_id",
      "username": "user1",
      "email": "user@example.com",
      "real_name": "홍길동",
      "avatar": "/public/avatar/default.png",
      "mood": "열심히 풀자",
      "blog": "https://blog.example.com",
      "github": "https://github.com/user1",
      "school": "한국대학교",
      "major": "컴퓨터공학과",
      "submission_number": 100,
      "accepted_number": 50
    }
  }
}
```

#### 대시보드 정보
```
GET /api/profile/dashboard?username={username}
```
**Response:**
```json
{
  "error": null,
  "data": {
    "total_score": 1000,
    "accepted_number": 50,
    "submission_number": 100,
    "tier": "gold",
    "recent_submissions": [],
    "solved_problems": []
  }
}
```

#### 사용자 문제 풀이 정보
```
GET /api/profile/problem?username={username}
```
**Response:**
```json
{
  "error": null,
  "data": {
    "solved_problems": [1, 2, 3],
    "attempted_problems": [4, 5],
    "difficulty_distribution": {
      "Low": 10,
      "Mid": 5,
      "High": 2
    }
  }
}
```

#### 프로필 업데이트
```
PUT /api/profile
```
**Request:**
```json
{
  "nickname": "newNickname",
  "mood": "열심히 풀자",
  "blog": "https://blog.example.com",
  "github": "https://github.com/user1",
  "school": "한국대학교",
  "major": "컴퓨터공학과"
}
```
**Response:**
```json
{
  "error": null,
  "data": {
    "message": "프로필이 업데이트되었습니다."
  }
}
```

#### 비밀번호 변경
```
POST /api/change_password
```
**Request:**
```json
{
  "old_password": "oldpass123",
  "new_password": "newpass123"
}
```
**Response:**
```json
{
  "error": null,
  "data": {
    "message": "비밀번호가 변경되었습니다."
  }
}
```

#### 이메일 변경
```
POST /api/change_email
```
**Request:**
```json
{
  "email": "newemail@example.com",
  "code": "123456"
}
```
**Response:**
```json
{
  "error": null,
  "data": {
    "message": "이메일이 변경되었습니다."
  }
}
```

#### 세션 목록
```
GET /api/sessions
```
**Response:**
```json
{
  "error": null,
  "data": {
    "sessions": [
      {
        "session_key": "abc123",
        "ip": "127.0.0.1",
        "user_agent": "Mozilla/5.0...",
        "last_activity": "2025-01-01T00:00:00Z",
        "current_session": true
      }
    ]
  }
}
```

#### 세션 삭제
```
DELETE /api/sessions?session_key={key}
```
**Response:**
```json
{
  "error": null,
  "data": {
    "message": "세션이 삭제되었습니다."
  }
}
```

---

### 문제

#### 문제 목록
```
GET /api/problem
```
**Params:**
- `paging`: true
- `offset`: 0
- `limit`: 20
- `keyword`: "" (검색 키워드)
- `difficulty`: "" (난이도: Low, Mid, High)
- `tag`: "" (태그)
- `rule_type`: "ACM" (ACM or OI)

**Response:**
```json
{
  "error": null,
  "data": {
    "results": [
      {
        "id": 1,
        "_id": "1001",
        "title": "A + B",
        "difficulty": "Low",
        "tags": ["수학", "구현"],
        "accepted_number": 100,
        "submission_number": 500,
        "my_status": 0,
        "created_by": {
          "username": "admin"
        }
      }
    ],
    "total": 100
  }
}
```

#### 문제 상세
```
GET /api/problem?problem_id={problemID}
```
**Response:**
```json
{
  "error": null,
  "data": {
    "id": 1,
    "_id": "1001",
    "title": "A + B",
    "description": "<p>두 정수 A와 B를 입력받은 다음, A+B를 출력하는 프로그램을 작성하시오.</p>",
    "input_description": "<p>첫째 줄에 A와 B가 주어진다.</p>",
    "output_description": "<p>첫째 줄에 A+B를 출력한다.</p>",
    "samples": [
      {
        "input": "1 2",
        "output": "3"
      }
    ],
    "hint": "<p>A와 B는 1,000 이하의 자연수입니다.</p>",
    "languages": ["C", "C++", "Java", "Python3"],
    "template": {
      "C++": "// C++ template\n#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}"
    },
    "difficulty": "Low",
    "time_limit": 1000,
    "memory_limit": 256,
    "tags": ["수학", "구현"],
    "accepted_number": 100,
    "submission_number": 500,
    "my_status": 0
  }
}
```

#### 문제 태그 목록
```
GET /api/problem/tags
```
**Response:**
```json
{
  "error": null,
  "data": [
    {
      "id": 1,
      "name": "DP"
    },
    {
      "id": 2,
      "name": "Graph"
    }
  ]
}
```

#### 보너스 문제
```
GET /api/problem/bonus
```
**Response:**
```json
{
  "error": null,
  "data": [
    {
      "id": 1,
      "_id": "1001",
      "title": "보너스 문제",
      "difficulty": "High"
    }
  ]
}
```

#### 가장 어려운 문제
```
GET /api/problem/most_difficult_problem
```
**Response:**
```json
{
  "error": null,
  "data": {
    "id": 99,
    "_id": "9999",
    "title": "매우 어려운 문제",
    "difficulty": "High"
  }
}
```

#### 개인 추천 문제
```
GET /api/recommend_problem
```
**Response:**
```json
{
  "error": null,
  "data": [
    {
      "id": 10,
      "_id": "1010",
      "title": "추천 문제",
      "difficulty": "Mid"
    }
  ]
}
```

#### 랜덤 문제 (Pick One)
```
GET /api/pickone
```
**Response:**
```json
{
  "error": null,
  "data": {
    "id": 42,
    "_id": "1042",
    "title": "랜덤 문제",
    "difficulty": "Mid"
  }
}
```

---

### 제출

#### 코드 제출
```
POST /api/submission
```
**Request:**
```json
{
  "problem_id": "1001",
  "contest_id": null,
  "language": "C++",
  "code": "#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}"
}
```
**Response:**
```json
{
  "error": null,
  "data": {
    "submission_id": "abc123def456",
    "message": "제출되었습니다."
  }
}
```

#### 제출 목록
```
GET /api/submissions
```
**Params:**
- `offset`: 0
- `limit`: 20
- `problem_id`: (optional)
- `myself`: (optional, boolean)
- `result`: (optional, 상태 코드)
- `username`: (optional)

**Response:**
```json
{
  "error": null,
  "data": {
    "results": [
      {
        "id": "abc123def456",
        "problem": "1001",
        "result": 0,
        "statistic_info": {
          "time_cost": 100,
          "memory_cost": 2048000
        },
        "language": "C++",
        "create_time": "2025-01-01T12:00:00Z",
        "username": "user1",
        "show_link": true
      }
    ],
    "total": 1000
  }
}
```

#### 제출 상세
```
GET /api/submission?id={submissionID}
```
**Response:**
```json
{
  "error": null,
  "data": {
    "id": "abc123def456",
    "problem": {
      "id": 1,
      "_id": "1001",
      "title": "A + B"
    },
    "result": 0,
    "code": "#include <iostream>...",
    "language": "C++",
    "statistic_info": {
      "time_cost": 100,
      "memory_cost": 2048000,
      "err_info": null
    },
    "info": {
      "data": [
        {
          "result": 0,
          "cpu_time": 10,
          "memory": 1024000
        }
      ]
    },
    "create_time": "2025-01-01T12:00:00Z",
    "username": "user1",
    "shared": false,
    "can_unshare": true
  }
}
```

#### 제출 순위
```
GET /api/submission_rank?submission_id={id}
```
**Response:**
```json
{
  "error": null,
  "data": {
    "rank": 10,
    "total": 100
  }
}
```

#### 제출 여부 확인
```
GET /api/submission_exists?problem_id={problemID}
```
**Response:**
```json
{
  "error": null,
  "data": {
    "exists": true
  }
}
```

---

### 대회

#### 대회 목록
```
GET /api/contests
```
**Params:**
- `offset`: 0
- `limit`: 20
- `keyword`: ""
- `rule_type`: "ACM"
- `status`: "" (-1: 종료, 0: 진행중, 1: 시작전)

**Response:**
```json
{
  "error": null,
  "data": {
    "results": [
      {
        "id": 1,
        "title": "2025 신입생 대회",
        "description": "신입생을 위한 프로그래밍 대회",
        "start_time": "2025-03-01T09:00:00Z",
        "end_time": "2025-03-01T13:00:00Z",
        "created_by": {
          "username": "admin"
        },
        "status": -1,
        "contest_type": "Public",
        "rule_type": "ACM"
      }
    ],
    "total": 50
  }
}
```

#### 진행 중인 대회
```
GET /api/contest_underway
```
**Response:**
```json
{
  "error": null,
  "data": [
    {
      "id": 2,
      "title": "진행 중인 대회",
      "start_time": "2025-01-15T09:00:00Z",
      "end_time": "2025-01-15T13:00:00Z"
    }
  ]
}
```

#### 시작 전 대회
```
GET /api/contest_not_started
```
**Response:**
```json
{
  "error": null,
  "data": [
    {
      "id": 3,
      "title": "예정된 대회",
      "start_time": "2025-02-01T09:00:00Z",
      "end_time": "2025-02-01T13:00:00Z"
    }
  ]
}
```

#### 대회 히스토리
```
GET /api/contest_history
```
**Params:**
- `offset`: 0
- `limit`: 20

**Response:**
```json
{
  "error": null,
  "data": {
    "results": [
      {
        "id": 1,
        "title": "종료된 대회",
        "start_time": "2024-12-01T09:00:00Z",
        "end_time": "2024-12-01T13:00:00Z",
        "my_rank": 5
      }
    ],
    "total": 30
  }
}
```

#### 대회 상세
```
GET /api/contest?id={contestID}
```
**Response:**
```json
{
  "error": null,
  "data": {
    "id": 1,
    "title": "2025 신입생 대회",
    "description": "신입생을 위한 프로그래밍 대회",
    "start_time": "2025-03-01T09:00:00Z",
    "end_time": "2025-03-01T13:00:00Z",
    "rule_type": "ACM",
    "contest_type": "Public",
    "status": -1,
    "created_by": {
      "username": "admin"
    }
  }
}
```

#### 대회 접근 권한 확인
```
GET /api/contest/access?contest_id={contestID}
```
**Response:**
```json
{
  "error": null,
  "data": {
    "access": true
  }
}
```

#### 대회 비밀번호 확인
```
POST /api/contest/password
```
**Request:**
```json
{
  "contest_id": 1,
  "password": "contest123"
}
```
**Response:**
```json
{
  "error": null,
  "data": {
    "message": "비밀번호가 확인되었습니다."
  }
}
```

#### 대회 공지사항
```
GET /api/contest/announcement?contest_id={contestID}
```
**Response:**
```json
{
  "error": null,
  "data": [
    {
      "id": 1,
      "title": "대회 공지",
      "content": "대회 공지 내용",
      "create_time": "2025-01-01T00:00:00Z"
    }
  ]
}
```

#### 대회 문제 목록
```
GET /api/contest/problem?contest_id={contestID}
```
**Response:**
```json
{
  "error": null,
  "data": [
    {
      "id": 1,
      "_id": "A",
      "title": "문제 A",
      "accepted_number": 50,
      "submission_number": 100,
      "my_status": 0
    }
  ]
}
```

#### 대회 문제 상세
```
GET /api/contest/problem?contest_id={contestID}&problem_id={problemID}
```
**Response:**
```json
{
  "error": null,
  "data": {
    "id": 1,
    "_id": "A",
    "title": "문제 A",
    "description": "문제 설명",
    "input_description": "입력 설명",
    "output_description": "출력 설명",
    "samples": [
      {
        "input": "1 2",
        "output": "3"
      }
    ],
    "time_limit": 1000,
    "memory_limit": 256
  }
}
```

#### 대회 랭킹
```
GET /api/contest_rank
```
**Params:**
- `contest_id`: (required)
- `offset`: 0
- `limit`: 20
- `force_refresh`: false

**Response:**
```json
{
  "error": null,
  "data": {
    "results": [
      {
        "rank": 1,
        "user": {
          "id": "user_id",
          "username": "user1"
        },
        "total_score": 300,
        "total_time": 3600,
        "submission_info": {
          "A": {
            "is_ac": true,
            "ac_time": 600,
            "error_number": 0
          }
        }
      }
    ],
    "total": 100
  }
}
```

---

### 랭킹

#### 사용자 랭킹
```
GET /api/user_rank
```
**Params:**
- `offset`: 0
- `limit`: 20
- `rule`: "ACM"

**Response:**
```json
{
  "error": null,
  "data": {
    "results": [
      {
        "rank": 1,
        "avatar": "/public/avatar/user1.png",
        "username": "user1",
        "mood": "열심히 풀자",
        "score": 1000,
        "major": "컴퓨터공학과",
        "tier": "gold",
        "solved": 50,
        "growth": 5
      }
    ],
    "total": 200
  }
}
```

#### 급상승 랭킹
```
GET /api/surge_user_rank
```
**Params:**
- `offset`: 0
- `limit`: 30

**Response:**
```json
{
  "error": null,
  "data": {
    "results": [
      {
        "rank": 1,
        "avatar": "/public/avatar/user2.png",
        "username": "riser1",
        "mood": "급성장 중!",
        "score": 800,
        "major": "소프트웨어학과",
        "tier": "silver",
        "solved": 45,
        "growth": 150
      }
    ],
    "total": 100
  }
}
```

#### 학과별 랭킹
```
GET /api/major_rank
```
**Params:**
- `offset`: 0
- `limit`: 7

**Response:**
```json
{
  "error": null,
  "data": {
    "results": [
      {
        "rank": 1,
        "major": "컴퓨터공학과",
        "score": 150000,
        "population": 45,
        "people": [
          {
            "avatar_url": "/public/avatar/user1.png",
            "username": "user1",
            "mood": "열심히 풀자",
            "score": 5000,
            "tier": "gold"
          }
        ]
      }
    ],
    "total": 10
  }
}
```

---

### 공지사항

#### 공지사항 목록
```
GET /api/announcement
```
**Params:**
- `offset`: 0
- `limit`: 20

**Response:**
```json
{
  "error": null,
  "data": {
    "results": [
      {
        "id": 1,
        "title": "시스템 점검 안내",
        "content": "<p>시스템 점검이 예정되어 있습니다.</p>",
        "create_time": "2025-01-01T00:00:00Z",
        "last_update_time": "2025-01-02T00:00:00Z",
        "created_by": {
          "username": "admin"
        },
        "visible": true
      }
    ],
    "total": 10
  }
}
```

#### 공지사항 상세
```
GET /api/announcement?id={announcementID}
```
**Response:**
```json
{
  "error": null,
  "data": {
    "id": 1,
    "title": "시스템 점검 안내",
    "content": "<p>시스템 점검이 예정되어 있습니다.</p>",
    "create_time": "2025-01-01T00:00:00Z",
    "last_update_time": "2025-01-02T00:00:00Z",
    "created_by": {
      "username": "admin"
    },
    "visible": true
  }
}
```

---

### 커뮤니티

#### 게시글 목록
```
GET /api/community/posts
```
**Params:**
- `offset`: 0
- `limit`: 20

**Response:**
```json
{
  "error": null,
  "data": {
    "results": [
      {
        "id": 1,
        "title": "처음 시작하는 분들을 위한 팁",
        "content": "<p>알고리즘 문제를 처음 푸는 분들을 위한 팁입니다.</p>",
        "author": {
          "id": "user_id",
          "username": "user1",
          "avatar": "/public/avatar/user1.png"
        },
        "create_time": "2025-01-01T00:00:00Z",
        "view_count": 100,
        "like_count": 10,
        "comment_count": 5
      }
    ],
    "total": 200
  }
}
```

#### 게시글 상세
```
GET /api/community/posts/{postId}
```
**Response:**
```json
{
  "error": null,
  "data": {
    "id": 1,
    "title": "처음 시작하는 분들을 위한 팁",
    "content": "<p>알고리즘 문제를 처음 푸는 분들을 위한 팁입니다.</p>",
    "author": {
      "id": "user_id",
      "username": "user1",
      "avatar": "/public/avatar/user1.png"
    },
    "create_time": "2025-01-01T00:00:00Z",
    "view_count": 100,
    "like_count": 10,
    "comments": [
      {
        "id": 1,
        "content": "좋은 정보 감사합니다!",
        "author": {
          "username": "user2",
          "avatar": "/public/avatar/user2.png"
        },
        "create_time": "2025-01-01T01:00:00Z"
      }
    ]
  }
}
```

#### 댓글 작성
```
POST /api/community/posts/{postId}/comments
```
**Request:**
```json
{
  "content": "좋은 정보 감사합니다!",
  "parent_comment_id": null
}
```
**Response:**
```json
{
  "error": null,
  "data": {
    "id": 2,
    "message": "댓글이 작성되었습니다."
  }
}
```

---

### 기타

#### 웹사이트 설정
```
GET /api/website
```
**Response:**
```json
{
  "error": null,
  "data": {
    "website_base_url": "http://127.0.0.1",
    "website_name": "Code Place",
    "website_name_shortcut": "CP",
    "website_footer": "© 2025 Code Place. All rights reserved.",
    "allow_register": true,
    "submission_list_show_all": true
  }
}
```

#### 홈 통계
```
GET /api/home_statistics
```
**Response:**
```json
{
  "error": null,
  "data": {
    "problem_count": 100,
    "submission_count": 5000,
    "user_count": 200,
    "total_problem_length": 100,
    "accepted_problem_length": 50,
    "ended_contest_length": 10
  }
}
```

#### 홈 실시간 랭킹
```
GET /api/home_ranking
```
**Response:**
```json
{
  "error": null,
  "data": [
    {
      "user": {
        "id": "user_id",
        "username": "user1"
      },
      "avatar": "/public/avatar/user1.png",
      "tier": "gold",
      "username": "user1",
      "total_score": 1000,
      "fluctuation": 5,
      "accepted_number": 50
    }
  ]
}
```

#### 팝업
```
GET /api/popup
```
**Response:**
```json
{
  "error": null,
  "data": {
    "show": true,
    "title": "공지",
    "content": "새로운 기능이 추가되었습니다!"
  }
}
```

#### 배너
```
GET /api/banner
```
**Response:**
```json
{
  "error": null,
  "data": [
    {
      "id": 1,
      "image_url": "/public/banner/event.png",
      "link": "/contest/1"
    }
  ]
}
```

#### 캡차
```
GET /api/captcha
```
**Response:**
```json
{
  "error": null,
  "data": {
    "captcha_id": "abc123",
    "image_url": "/api/captcha/image/abc123"
  }
}
```

#### 프로그래밍 언어 목록
```
GET /api/languages
```
**Response:**
```json
{
  "error": null,
  "data": [
    {
      "name": "C",
      "config": {}
    },
    {
      "name": "C++",
      "config": {}
    },
    {
      "name": "Java",
      "config": {}
    },
    {
      "name": "Python3",
      "config": {}
    }
  ]
}
```

#### 대학 목록
```
GET /api/college_list
```
**Response:**
```json
{
  "error": null,
  "data": [
    {
      "id": 1,
      "name": "한국대학교"
    },
    {
      "id": 2,
      "name": "서울대학교"
    }
  ]
}
```

#### 학과 목록
```
GET /api/department_list?college_id={collegeID}
```
**Response:**
```json
{
  "error": null,
  "data": [
    {
      "id": 1,
      "name": "컴퓨터공학과",
      "college_id": 1
    },
    {
      "id": 2,
      "name": "소프트웨어학과",
      "college_id": 1
    }
  ]
}
```

#### 닉네임 중복 확인
```
GET /api/nickname_valid_check?nickname={nickname}
```
**Response:**
```json
{
  "error": null,
  "data": {
    "available": true
  }
}
```

#### 이메일 인증 신청
```
POST /api/apply_user_email_valid_check
```
**Request:**
```json
{
  "email": "user@example.com"
}
```
**Response:**
```json
{
  "error": null,
  "data": {
    "message": "인증 코드가 전송되었습니다."
  }
}
```

#### 이메일 인증 확인
```
POST /api/user_email_valid_check
```
**Request:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```
**Response:**
```json
{
  "error": null,
  "data": {
    "verified": true
  }
}
```

---

## 상태 관리 구조 (Zustand)

### User Store
- 사용자 인증 상태
- 사용자 프로필 정보
- 로그인/로그아웃 액션

### Contest Store
- 현재 대회 정보
- 대회 접근 권한

### UI Store
- 모달 상태 (로그인/회원가입)
- 로딩 상태
- 팝업 표시 여부

---

## 주요 기능 구현 노트

### 인증
- Session-based 인증 사용
- 로그인 필요 페이지: `requiresAuth: true` 메타데이터
- 미인증 시 로그인 모달 표시 후 홈으로 리다이렉트

### 라우팅
- History mode 사용
- Scroll restoration 구현 필요

### 에러 처리
- API 응답의 `error` 필드 확인
- "Please login" 메시지 시 로그인 모달 표시

---

## 제출 결과 상태 코드

- `-2`: 컴파일 에러 (CE)
- `-1`: 오답 (WA)
- `0`: 정답 (AC)
- `1`: 시간 초과 (TLE)
- `2`: 시간 초과 (TLE)
- `3`: 메모리 초과 (MLE)
- `4`: 런타임 에러 (RE)
- `5`: 시스템 에러 (SE)
- `6`: 대기 중 (PD)
- `7`: 채점 중 (JG)
- `8`: 부분 점수 (PC)

## 문제 풀이 상태

- `0`: 풀지 않음
- `1`: 시도함
- `2`: 해결함

## 대회 상태

- `-1`: 종료
- `0`: 진행 중
- `1`: 시작 전
