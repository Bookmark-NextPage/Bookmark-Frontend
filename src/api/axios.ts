import axios from 'axios';

// 백엔드 서버 주소를 여기 한 곳에서만 관리해요.
// 나중에 배포하면 이 주소만 바꾸면 전체 앱에 다 적용돼요!
const api = axios.create({
  baseURL: 'http://localhost:8080/api',  // v1만 빠짐!
});

// 요청 보내기 직전에 항상 실행되는 함수예요.
// localStorage에 저장된 토큰을 자동으로 Authorization 헤더에 붙여줘요.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답이 401(인증 만료)이면 콘솔에 안내만 해줘요.
// 나중에 로그인 페이지 생기면 여기서 자동으로 로그인 화면으로 보내도 좋아요.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('토큰이 없거나 만료됐어요. 다시 로그인이 필요해요.');
    }
    return Promise.reject(error);
  }
);

export default api;