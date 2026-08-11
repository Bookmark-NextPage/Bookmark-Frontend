import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, signup } from '../api/user';
import { useAuthStore } from '../store/authStore';
import './Auth.css';

type Mode = 'login' | 'signup';

export default function Auth() {
  const navigate = useNavigate();
  const setToken = useAuthStore((s) => s.setToken);

  const [mode, setMode] = useState<Mode>('login');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 로그인 폼
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');

  // 회원가입 폼
  const [name, setName] = useState('');
  const [signupId, setSignupId] = useState('');
  const [email, setEmail] = useState('');
  const [signupPw, setSignupPw] = useState('');
  const [signupPwConfirm, setSignupPwConfirm] = useState('');

  const handleLogin = async () => {
    setError(null);
    if (!loginId.trim() || !password) {
      setError('아이디와 비밀번호를 입력해주세요.');
      return;
    }
    setSubmitting(true);
    try {
      const { accessToken } = await login(loginId, password);
      setToken(accessToken);
      navigate('/');
    } catch (err) {
      console.error('로그인 실패:', err);
      setError('로그인에 실패했어요. 아이디와 비밀번호를 확인해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignup = async () => {
    setError(null);
    if (!name.trim() || !signupId.trim() || !email.trim() || !signupPw) {
      setError('모든 항목을 입력해주세요.');
      return;
    }
    if (signupPw !== signupPwConfirm) {
      setError('비밀번호가 일치하지 않아요.');
      return;
    }
    setSubmitting(true);
    try {
      await signup({
        name,
        loginId: signupId,
        email,
        password: signupPw,
        passwordConfirm: signupPwConfirm,
      });
      
      // 가입 후 자동 로그인
      const { accessToken } = await login(signupId, signupPw);
      setToken(accessToken);
      navigate('/');
    } catch (err) {
      console.error('회원가입 실패:', err);
      setError('회원가입에 실패했어요. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-view">
      <div className="auth-card">
        <div className="brand">
          Book<span>Mark</span>
        </div>
        <div className="slogan">사소한 것에도 성취감이 있도록</div>

        {mode === 'login' ? (
          <div>
            <input
              className="box"
              placeholder="아이디 또는 이메일"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
            <input
              className="box"
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
            {error && <div className="auth-error">{error}</div>}
            <button className="btn-fill auth-submit" onClick={handleLogin} disabled={submitting}>
              {submitting ? '로그인 중...' : '로그인'}
            </button>
            <div className="auth-switch">
              계정이 없으신가요?{' '}
              <a onClick={() => { setMode('signup'); setError(null); }}>회원가입</a>
            </div>
          </div>
        ) : (
          <div>
            <input
              className="box"
              placeholder="이름"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="box"
              placeholder="아이디"
              value={signupId}
              onChange={(e) => setSignupId(e.target.value)}
            />
            <input
              className="box"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="box"
              type="password"
              placeholder="비밀번호"
              value={signupPw}
              onChange={(e) => setSignupPw(e.target.value)}
            />
            <input
              className="box"
              type="password"
              placeholder="비밀번호 확인"
              value={signupPwConfirm}
              onChange={(e) => setSignupPwConfirm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSignup()}
            />
            {error && <div className="auth-error">{error}</div>}
            <button className="btn-fill auth-submit" onClick={handleSignup} disabled={submitting}>
              {submitting ? '가입 중...' : '가입하기'}
            </button>
            <div className="auth-switch">
              이미 계정이 있으신가요?{' '}
              <a onClick={() => { setMode('login'); setError(null); }}>로그인</a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}