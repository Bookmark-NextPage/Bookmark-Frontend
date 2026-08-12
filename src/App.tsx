import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RequireAuth from './components/RequireAuth';
import Auth from './pages/Auth';
import Home from './pages/Home';
import CollectBook from './pages/CollectBook';
import MyPage from './pages/MyPage';
import FriendProfile from './pages/FriendProfile';
import BucketBoard from './pages/BucketBoard';
import MemoEdit from './pages/MemoEdit';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 로그인 없이 접근 가능 */}
        <Route path="/login" element={<Auth />} />

        {/* 로그인 필요 */}
        <Route element={<RequireAuth />}>
          <Route path="/" element={<Home />} />
          <Route path="/board" element={<BucketBoard />} />
          <Route path="/board/edit/:memoId" element={<MemoEdit />} />
          <Route path="/collect" element={<CollectBook />} />
          <Route path="/collect/:id" element={<div>콜랙트북 상세 (작업 예정)</div>} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/friend/:id" element={<FriendProfile />} />
          <Route path="/settings" element={<div>설정</div>} />
          <Route path="/noti" element={<div>알림</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;