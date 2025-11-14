// src/utils/axios.js
import axios from 'axios';

// Axios 기본 설정
const apiClient = axios.create({
  baseURL: 'http://localhost',
  withCredentials: true,  // 모든 요청에 쿠키 자동 포함
  // Content-Type 제거: axios가 요청 데이터 타입에 따라 자동 설정
  // - 일반 객체 → application/json
  // - FormData → multipart/form-data
});

// 요청 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    console.log('API 요청:', config.url);
    console.log('Content-Type:', config.headers['Content-Type']);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 401 에러 처리 (토큰 만료 등)
    if (error.response && error.response.status === 401) {
      // 로그인 상태 초기화
      window.localStorage?.removeItem('routy:isLoggedIn');
      window.dispatchEvent(new CustomEvent('login-status-changed', { detail: { loggedIn: false } }));
      
      // 로그인 페이지로 리다이렉트
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;