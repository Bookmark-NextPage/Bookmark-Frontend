import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div>홈</div>} />
        <Route path="/board" element={<div>버킷보드</div>} />
        <Route path="/collect" element={<div>콜랙트북</div>} />
        <Route path="/settings" element={<div>설정</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;