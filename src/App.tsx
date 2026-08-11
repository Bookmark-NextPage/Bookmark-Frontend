import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MyPage from './pages/MyPage';
import FriendProfile from './pages/FriendProfile';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div>홈</div>} />
        <Route path="/board" element={<div>버킷보드</div>} />
        <Route path="/collect" element={<div>콜랙트북</div>} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/settings" element={<div>설정</div>} />
        <Route path="/friend/:id" element={<FriendProfile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;