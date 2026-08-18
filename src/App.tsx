import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RequireAuth from './components/RequireAuth';
import Auth from './pages/Auth';
import Home from './pages/Home';
import CollectBook from './pages/CollectBook';
import MyPage from './pages/MyPage';
import FriendProfile from './pages/FriendProfile';
import BucketBoard from './pages/BucketBoard';
import MemoEdit from './pages/MemoEdit';
import RecordCreate from './pages/RecordCreate';
import CollectBookDetail from './pages/CollectBookDetail';
import RecordReader from './pages/RecordReader';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';

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
          <Route path="/collect/record/new" element={<RecordCreate />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/friend/:id" element={<FriendProfile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/noti" element={<Notifications />} />
          <Route path="/collect" element={<CollectBook />} />
          <Route path="/collect/:id" element={<CollectBookDetail />} />
          <Route path="/record/:recordId" element={<RecordReader />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;