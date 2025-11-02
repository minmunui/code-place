import { http, HttpResponse } from 'msw'

const BASE_URL = 'http://localhost:8000/api'

/**
 * MSW Mock Handlers
 * API 응답을 모킹합니다.
 */
export const handlers = [
  // ===== 홈 페이지 =====

  // 홈 통계
  http.get(`${BASE_URL}/home_statistics`, () => {
    return HttpResponse.json({
      error: null,
      data: {
        problem_count: 150,
        submission_count: 5230,
        user_count: 450,
      },
    })
  }),

  // 홈 랭킹
  http.get(`${BASE_URL}/home_ranking`, () => {
    return HttpResponse.json({
      error: null,
      data: Array.from({ length: 10 }, (_, i) => ({
        user: {
          id: i + 1,
          username: `user${i + 1}`,
        },
        accepted_number: 100 - i * 5,
        submission_number: 200 - i * 10,
      })),
    })
  }),

  // ===== 문제 =====

  // 문제 목록
  http.get(`${BASE_URL}/problem`, ({ request }) => {
    const url = new URL(request.url)
    const problemId = url.searchParams.get('problem_id')

    // 문제 상세 조회
    if (problemId) {
      return HttpResponse.json({
        error: null,
        data: {
          _id: problemId,
          id: problemId,
          title: `문제 ${problemId}`,
          description: '<p>이것은 문제 설명입니다.</p>',
          input_description: '<p>입력 형식</p>',
          output_description: '<p>출력 형식</p>',
          difficulty: ['Low', 'Mid', 'High'][Math.floor(Math.random() * 3)],
          tags: ['DP', '그래프', '구현'].slice(0, Math.floor(Math.random() * 3) + 1),
          time_limit: 1000,
          memory_limit: 256,
          samples: [
            { input: '1 2', output: '3' },
            { input: '5 7', output: '12' },
          ],
          hint: '<p>힌트입니다.</p>',
          languages: ['C', 'C++', 'Java', 'Python3'],
          template: {
            'C++': '#include <iostream>\nusing namespace std;\n\nint main() {\n    // 코드를 작성하세요\n    return 0;\n}',
            'Python3': '# 코드를 작성하세요\n',
          },
          my_status: 0,
        },
      })
    }

    // 문제 목록 조회
    const offset = parseInt(url.searchParams.get('offset') || '0')
    const limit = parseInt(url.searchParams.get('limit') || '20')

    const problems = Array.from({ length: 100 }, (_, i) => ({
      _id: `${1000 + i}`,
      id: 1000 + i,
      title: `문제 ${1000 + i}`,
      difficulty: ['Low', 'Mid', 'High'][i % 3],
      tags: ['DP', '그래프', '구현'].slice(0, (i % 3) + 1),
      submission_number: Math.floor(Math.random() * 1000),
      accepted_number: Math.floor(Math.random() * 500),
      my_status: i % 3 === 0 ? 2 : i % 5 === 0 ? 1 : 0,
    }))

    return HttpResponse.json({
      error: null,
      data: {
        results: problems.slice(offset, offset + limit),
        total: problems.length,
      },
    })
  }),

  // 문제 태그 목록
  http.get(`${BASE_URL}/problem/tags`, () => {
    return HttpResponse.json({
      error: null,
      data: [
        { id: 1, name: 'DP' },
        { id: 2, name: '그래프' },
        { id: 3, name: '구현' },
        { id: 4, name: '문자열' },
        { id: 5, name: '수학' },
      ],
    })
  }),

  // 랜덤 문제
  http.get(`${BASE_URL}/pickone`, () => {
    const randomId = Math.floor(Math.random() * 100) + 1000
    return HttpResponse.json({
      error: null,
      data: { _id: `${randomId}` },
    })
  }),

  // ===== 제출 =====

  // 코드 제출
  http.post(`${BASE_URL}/submission`, async () => {
    return HttpResponse.json({
      error: null,
      data: {
        submission_id: `sub_${Date.now()}`,
      },
    })
  }),

  // 제출 목록
  http.get(`${BASE_URL}/submissions`, ({ request }) => {
    const url = new URL(request.url)
    const offset = parseInt(url.searchParams.get('offset') || '0')
    const limit = parseInt(url.searchParams.get('limit') || '20')

    const submissions = Array.from({ length: 50 }, (_, i) => ({
      id: `sub_${1000 + i}`,
      create_time: new Date(Date.now() - i * 3600000).toISOString(),
      result: ['-2', '-1', '0', '1', '3', '4'][i % 6],
      problem: `${1000 + (i % 20)}`,
      username: `user${(i % 10) + 1}`,
      language: ['C++', 'Python3', 'Java'][i % 3],
      statistic_info: {
        time_cost: Math.floor(Math.random() * 1000),
        memory_cost: Math.floor(Math.random() * 50 * 1024 * 1024),
      },
      show_link: true,
    }))

    return HttpResponse.json({
      error: null,
      data: {
        results: submissions.slice(offset, offset + limit),
        total: submissions.length,
      },
    })
  }),

  // 제출 상세
  http.get(`${BASE_URL}/submission`, ({ request }) => {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    return HttpResponse.json({
      error: null,
      data: {
        id,
        create_time: new Date().toISOString(),
        result: 0,
        problem: '1000',
        username: 'testuser',
        language: 'C++',
        code: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}',
        statistic_info: {
          time_cost: 42,
          memory_cost: 2048000,
        },
        info: {
          data: Array.from({ length: 5 }, (_, i) => ({
            result: 0,
            cpu_time: 40 + i,
            memory: 2000000 + i * 100000,
          })),
        },
        show_link: true,
        can_unshare: true,
        shared: false,
      },
    })
  }),

  // ===== 공지사항 =====

  http.get(`${BASE_URL}/announcement`, ({ request }) => {
    const url = new URL(request.url)
    const offset = parseInt(url.searchParams.get('offset') || '0')
    const limit = parseInt(url.searchParams.get('limit') || '10')

    const announcements = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      title: `공지사항 ${i + 1}`,
      content: '<p>공지사항 내용입니다.</p>',
      create_time: new Date(Date.now() - i * 86400000).toISOString(),
      created_by: {
        username: 'admin',
      },
    }))

    return HttpResponse.json({
      error: null,
      data: {
        results: announcements.slice(offset, offset + limit),
        total: announcements.length,
      },
    })
  }),

  // ===== 랭킹 =====

  // 유저 랭킹
  http.get(`${BASE_URL}/user_rank`, ({ request }) => {
    const url = new URL(request.url)
    const offset = parseInt(url.searchParams.get('offset') || '0')
    const limit = parseInt(url.searchParams.get('limit') || '10')

    const tiers = ['bronze', 'silver', 'gold', 'platinum', 'diamond']
    const majors = ['컴퓨터공학과', '소프트웨어학과', '정보통신공학과', '인공지능학과']

    const users = Array.from({ length: 100 }, (_, i) => ({
      rank: i + 1,
      avatar: `https://i.pravatar.cc/150?img=${(i % 70) + 1}`,
      username: `user${i + 1}`,
      major: majors[i % majors.length],
      tier: tiers[i % tiers.length],
      score: 10000 - i * 80,
      solved: 150 - i,
      accuracy: 0.95 - i * 0.003,
      growth: Math.max(0, 100 - i * 2),
    }))

    return HttpResponse.json({
      error: null,
      data: {
        results: users.slice(offset, offset + limit),
        total: users.length,
      },
    })
  }),

  // 급상승 랭킹
  http.get(`${BASE_URL}/surge_user_rank`, ({ request }) => {
    const url = new URL(request.url)
    const offset = parseInt(url.searchParams.get('offset') || '0')
    const limit = parseInt(url.searchParams.get('limit') || '30')

    const tiers = ['bronze', 'silver', 'gold', 'platinum', 'diamond']
    const majors = ['컴퓨터공학과', '소프트웨어학과', '정보통신공학과', '인공지능학과']

    const users = Array.from({ length: 50 }, (_, i) => ({
      rank: i + 1,
      avatar: `https://i.pravatar.cc/150?img=${(i % 70) + 1}`,
      username: `riser${i + 1}`,
      major: majors[i % majors.length],
      tier: tiers[i % tiers.length],
      score: 5000 - i * 50,
      solved: 80 - i,
      accuracy: 0.90 - i * 0.005,
      growth: 500 - i * 8,
    }))

    return HttpResponse.json({
      error: null,
      data: {
        results: users.slice(offset, offset + limit),
        total: users.length,
      },
    })
  }),

  // 학과별 랭킹
  http.get(`${BASE_URL}/major_rank`, ({ request }) => {
    const url = new URL(request.url)
    const offset = parseInt(url.searchParams.get('offset') || '0')
    const limit = parseInt(url.searchParams.get('limit') || '10')

    const majorData = [
      {
        rank: 1,
        major: '컴퓨터공학과',
        score: 150000,
        population: 45,
        people: Array.from({ length: 5 }, (_, i) => ({
          username: `cs_user${i + 1}`,
          avatar: `https://i.pravatar.cc/150?img=${i + 1}`,
          score: 5000 - i * 100,
        })),
      },
      {
        rank: 2,
        major: '소프트웨어학과',
        score: 135000,
        population: 38,
        people: Array.from({ length: 5 }, (_, i) => ({
          username: `sw_user${i + 1}`,
          avatar: `https://i.pravatar.cc/150?img=${i + 6}`,
          score: 4500 - i * 100,
        })),
      },
      {
        rank: 3,
        major: '인공지능학과',
        score: 120000,
        population: 32,
        people: Array.from({ length: 5 }, (_, i) => ({
          username: `ai_user${i + 1}`,
          avatar: `https://i.pravatar.cc/150?img=${i + 11}`,
          score: 4000 - i * 100,
        })),
      },
      {
        rank: 4,
        major: '정보통신공학과',
        score: 105000,
        population: 28,
        people: Array.from({ length: 5 }, (_, i) => ({
          username: `it_user${i + 1}`,
          avatar: `https://i.pravatar.cc/150?img=${i + 16}`,
          score: 3500 - i * 100,
        })),
      },
      {
        rank: 5,
        major: '전자공학과',
        score: 95000,
        population: 25,
        people: Array.from({ length: 5 }, (_, i) => ({
          username: `ee_user${i + 1}`,
          avatar: `https://i.pravatar.cc/150?img=${i + 21}`,
          score: 3000 - i * 100,
        })),
      },
    ]

    return HttpResponse.json({
      error: null,
      data: {
        results: majorData.slice(offset, offset + limit),
        total: majorData.length,
      },
    })
  }),

  // ===== 사용자 프로필 =====

  http.get(`${BASE_URL}/profile`, ({ request }) => {
    const url = new URL(request.url)
    const username = url.searchParams.get('username') || 'testuser'

    return HttpResponse.json({
      error: null,
      data: {
        user: {
          id: 1,
          username,
          email: `${username}@example.com`,
          real_name: '테스트 사용자',
          admin_type: 'Regular User',
          problem_permission: 'None',
          create_time: new Date('2024-01-01').toISOString(),
          submission_number: 150,
          accepted_number: 75,
        },
      },
    })
  }),
]
