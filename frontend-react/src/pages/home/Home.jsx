import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../../api'
import useUserStore from '../../store/userStore'

/**
 * 홈 페이지
 */
function Home() {
  const { t } = useTranslation()
  const { isAuthenticated, user } = useUserStore()
  const [statistics, setStatistics] = useState(null)
  const [ranking, setRanking] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 홈 페이지 데이터 로드
    const loadHomeData = async () => {
      try {
        setLoading(true)

        // 통계 정보
        const statsRes = await api.getHomeStatistics()
        setStatistics(statsRes.data)

        // 랭킹 정보
        const rankRes = await api.getHomeRanking()
        setRanking(rankRes.data.slice(0, 10)) // 상위 10명

        // 공지사항
        const announcementRes = await api.getAnnouncements(0, 5)
        setAnnouncements(announcementRes.data.results || [])
      } catch (error) {
        console.error('Failed to load home data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadHomeData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">{t('Loading')}</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* 환영 메시지 */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg p-8 shadow-lg">
        <h1 className="text-4xl font-bold mb-4">
          {isAuthenticated ? `${user?.username}${t('Welcome_Message_Auth')}` : t('Welcome_Message_Guest')}
        </h1>
        <p className="text-lg opacity-90">
          {t('Welcome_Description')}
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 왼쪽: 공지사항 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 통계 카드 */}
          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                title={t('Total_Problems')}
                value={statistics.problem_count || 0}
                icon="📝"
                color="blue"
              />
              <StatCard
                title={t('Total_Submissions')}
                value={statistics.submission_count || 0}
                icon="🚀"
                color="green"
              />
              <StatCard
                title={t('Total_Users')}
                value={statistics.user_count || 0}
                icon="👥"
                color="purple"
              />
            </div>
          )}

          {/* 공지사항 */}
          <div className="bg-card rounded-lg shadow border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-foreground">{t('Notice')}</h2>
              <Link
                to="/notice"
                className="text-primary hover:text-primary/80 text-sm"
              >
                {t('See_More')} →
              </Link>
            </div>
            <div className="space-y-3">
              {announcements.length > 0 ? (
                announcements.map((announcement) => (
                  <Link
                    key={announcement.id}
                    to={`/notice/${announcement.id}`}
                    className="block p-3 hover:bg-accent rounded transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-foreground font-medium">
                        {announcement.title}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(announcement.create_time).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  {t('No_Announcements')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 오른쪽: 랭킹 */}
        <div className="bg-card rounded-lg shadow border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground">{t('Title_Home_Ranking')}</h2>
            <Link
              to="/acm-rank/user-rank"
              className="text-primary hover:text-primary/80 text-sm"
            >
              {t('See_More')} →
            </Link>
          </div>
          <div className="space-y-2">
            {ranking.length > 0 ? (
              ranking.map((user, index) => (
                <Link
                  key={user.user?.id || index}
                  to={`/user-home/dashboard/${user.user?.username}`}
                  className="flex items-center justify-between p-2 hover:bg-accent rounded transition"
                >
                  <div className="flex items-center space-x-3">
                    <span className={`font-bold ${getRankColor(index + 1)}`}>
                      #{index + 1}
                    </span>
                    <span className="text-foreground">{user.user?.username}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {user.accepted_number || 0} {t('Problem_Count')}
                  </span>
                </Link>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">
                {t('No_Ranking_Data')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// 통계 카드 컴포넌트
function StatCard({ title, value, icon, color }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
  }

  return (
    <div
      className={`bg-gradient-to-br ${colorClasses[color]} text-white rounded-lg p-6 shadow-lg`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-blue-100 mb-1">{title}</p>
          <p className="text-3xl font-bold">{value.toLocaleString()}</p>
        </div>
        <span className="text-4xl opacity-80">{icon}</span>
      </div>
    </div>
  )
}

// 랭킹 색상
function getRankColor(rank) {
  if (rank === 1) return 'text-yellow-500'
  if (rank === 2) return 'text-gray-400'
  if (rank === 3) return 'text-orange-400'
  return 'text-gray-600'
}

export default Home
