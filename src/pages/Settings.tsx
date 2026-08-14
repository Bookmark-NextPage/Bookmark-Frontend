import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import { useAuthStore } from '../store/authStore';
import { getMyPage, logoutApi, withdrawUser, updateAiUse } from '../api/user';
import { updateNotificationSetting } from '../api/notification';
import './Settings.css';

export default function Settings() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const [aiUse, setAiUse] = useState(true);
  const [notiEnabled, setNotiEnabled] = useState(true);

  const [showLogout, setShowLogout] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawPw, setWithdrawPw] = useState('');
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const pwInputRef = useRef<HTMLInputElement>(null);

  // 현재 설정값 로드 (마이페이지에 aiUse / isInAppNotificationEnabled 있다고 가정)
  useEffect(() => {
    getMyPage()
      .then((res) => {
        const raw = res as unknown as {
          aiUse?: boolean;
          isInAppNotificationEnabled?: boolean;
          profile?: { aiUse?: boolean; isInAppNotificationEnabled?: boolean };
        };
        const ai = raw.aiUse ?? raw.profile?.aiUse;
        const noti = raw.isInAppNotificationEnabled ?? raw.profile?.isInAppNotificationEnabled;
        if (typeof ai === 'boolean') setAiUse(ai);
        if (typeof noti === 'boolean') setNotiEnabled(noti);
      })
      .catch((err) => console.error('설정값 로드 실패:', err));
  }, []);

  const toggleAi = async () => {
    const next = !aiUse;
    setAiUse(next); // 낙관적
    try {
      await updateAiUse(next);
    } catch (err) {
      console.error('AI 설정 변경 실패:', err);
      setAiUse(!next); // 롤백
      alert('AI 설정 변경에 실패했어요.');
    }
  };

  const toggleNoti = async () => {
    const next = !notiEnabled;
    setNotiEnabled(next);
    try {
      await updateNotificationSetting(next);
    } catch (err) {
      console.error('알림 설정 변경 실패:', err);
      setNotiEnabled(!next);
      alert('알림 설정 변경에 실패했어요.');
    }
  };

  const handleLogout = async () => {
    setBusy(true);
    try {
      await logoutApi();
    } catch (err) {
      console.error('로그아웃 API 실패(무시하고 진행):', err);
    } finally {
      logout(); // 토큰 삭제
      navigate('/login');
    }
  };

  // 회원탈퇴 모달 열고 닫을 때 입력 상태 초기화
  const openWithdraw = () => {
    setWithdrawPw('');
    setWithdrawError(null);
    setShowWithdraw(true);
  };

  const closeWithdraw = () => {
    if (busy) return;
    setShowWithdraw(false);
    setWithdrawPw('');
    setWithdrawError(null);
  };

  const handleWithdraw = async () => {
    setWithdrawError(null);

    if (!withdrawPw.trim()) {
      setWithdrawError('비밀번호를 입력해주세요.');
      pwInputRef.current?.focus();
      return;
    }

    setBusy(true);
    try {
      // 서버에서 비밀번호 일치 여부를 검증한 뒤 탈퇴 처리
      await withdrawUser(withdrawPw);
      logout();
      navigate('/login');
    } catch (err) {
      console.error('회원 탈퇴 실패:', err);

      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 400 || status === 401 || status === 403) {
          setWithdrawError('비밀번호가 일치하지 않아요.');
        } else {
          setWithdrawError('탈퇴 처리 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.');
        }
      } else {
        setWithdrawError('탈퇴 처리 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.');
      }

      // 틀린 비밀번호는 다시 입력하도록 비우고 포커스
      setWithdrawPw('');
      pwInputRef.current?.focus();
      setBusy(false);
    }
  };

  return (
    <div className="bm-page">
      <Header />
      <main className="bm-main">
        <div className="page-head">
          <div className="page-title">설정</div>
        </div>

        {/* 알림/기능 설정 */}
        <div className="set-card">
          <div className="set-row">
            <div>
              <div className="set-name">AI 기능</div>
              <div className="set-desc">주간 한마디, 챕터 리포트, 다이어리 이미지 자동 생성을 켜고 끕니다.</div>
            </div>
            <button
              className={`toggle ${aiUse ? 'on' : ''}`}
              onClick={toggleAi}
              aria-label="AI 기능 토글"
            >
              <span className="knob" />
            </button>
          </div>

          <div className="set-row">
            <div>
              <div className="set-name">인앱 알림</div>
              <div className="set-desc">친구 반응·댓글·친구 신청 알림을 받습니다.</div>
            </div>
            <button
              className={`toggle ${notiEnabled ? 'on' : ''}`}
              onClick={toggleNoti}
              aria-label="인앱 알림 토글"
            >
              <span className="knob" />
            </button>
          </div>
        </div>

        {/* 계정 */}
        <div className="set-card">
          <div className="set-row">
            <div>
              <div className="set-name">로그아웃</div>
              <div className="set-desc">이 기기에서 로그아웃합니다.</div>
            </div>
            <button className="set-btn" onClick={() => setShowLogout(true)}>
              로그아웃
            </button>
          </div>

          <div className="set-row">
            <div>
              <div className="set-name">회원탈퇴</div>
              <div className="set-desc">계정과 모든 기록이 삭제됩니다. 되돌릴 수 없어요.</div>
            </div>
            <button className="set-btn danger" onClick={openWithdraw}>
              회원탈퇴
            </button>
          </div>
        </div>
      </main>

      {/* 로그아웃 확인 모달 */}
      {showLogout && (
        <div className="set-backdrop" onClick={() => !busy && setShowLogout(false)}>
          <div className="set-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sm-title">로그아웃 할까요?</div>
            <div className="sm-desc">다시 이용하려면 로그인이 필요해요.</div>
            <div className="sm-actions">
              <button className="sm-cancel" onClick={() => setShowLogout(false)} disabled={busy}>
                취소
              </button>
              <button className="sm-go" onClick={handleLogout} disabled={busy}>
                {busy ? '처리 중...' : '로그아웃'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 회원탈퇴 확인 모달 (비밀번호 재확인) */}
      {showWithdraw && (
        <div className="set-backdrop" onClick={closeWithdraw}>
          <div className="set-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sm-title">정말 탈퇴하시겠어요?</div>
            <div className="sm-desc">
              계정과 모든 기록(콜랙트북·버킷보드)이 삭제되고 되돌릴 수 없어요.
              <br />
              확인을 위해 비밀번호를 입력해주세요.
            </div>
            <input
              ref={pwInputRef}
              className="sm-input"
              type="password"
              placeholder="비밀번호"
              value={withdrawPw}
              autoFocus
              onChange={(e) => {
                setWithdrawPw(e.target.value);
                if (withdrawError) setWithdrawError(null);
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleWithdraw()}
              disabled={busy}
            />
            {withdrawError && <div className="sm-error">{withdrawError}</div>}
            <div className="sm-actions">
              <button className="sm-cancel" onClick={closeWithdraw} disabled={busy}>
                취소
              </button>
              <button
                className="sm-go danger"
                onClick={handleWithdraw}
                disabled={busy || !withdrawPw.trim()}
              >
                {busy ? '처리 중...' : '탈퇴하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
