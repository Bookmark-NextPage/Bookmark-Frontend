import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useHome } from '../hooks/useHome';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useHome();

  return (
    <div className="bm-page">
      <Header />
      <main className="bm-main">
        {/* 히어로 */}
        <div className="hero">
          <div className="hero-eyebrow">MY LITTLE ACHIEVEMENTS</div>
          <div className="hi">
            안녕하세요, <span className="cur">{data?.userName ?? '···'}님</span>
          </div>
          <div className="hsub">오늘도 작은 성취 하나를 남겨볼까요?</div>
        </div>

        {/* 두 개의 큰 카드 */}
        <div className="home-cards">
          <div className="hcard" onClick={() => navigate('/board')}>
            <div className="ico">📌</div>
            <h3>버킷보드</h3>
            <p>하고 싶은 일을 메모지로 붙여두는 나만의 보드.</p>
            <div className="stat">
              <b>{data?.planMemoCount ?? 0}</b> 개의 하고 싶은 일 · 이번 주{' '}
              <b>{data?.weeklyCompletedMemoCount ?? 0}</b> 개 완료
            </div>
          </div>
          <div className="hcard" onClick={() => navigate('/collect')}>
            <div className="ico">📕</div>
            <h3>콜랙트북</h3>
            <p>이룬 기록이 한 권의 책으로 쌓이는 책장.</p>
            <div className="stat">
              <b>{data?.collectBookCount ?? 0}</b> 권 · <b>{data?.recordCount ?? 0}</b> 개의 기록
            </div>
          </div>
        </div>

        {/* 최근 기록 (최신 생성 3개) */}
        <div className="recent">
          <h4>최근 기록</h4>
          {isLoading ? (
            <div className="recent-empty">불러오는 중...</div>
          ) : isError ? (
            <div className="recent-empty">불러오지 못했어요.</div>
          ) : !data || data.recentRecords.length === 0 ? (
            <div className="recent-empty">아직 남긴 기록이 없어요.</div>
          ) : (
            <div className="recent-row">
              {data.recentRecords.map((r) => (
                <div className="rmini" key={r.recordId} onClick={() => navigate('/collect')}>
                  <div className="rt">{r.title}</div>
                  <div className="rd">{r.createdAt}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}