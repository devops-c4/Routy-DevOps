<template>
  <div class="login-container">
    <div class="main-content">
      <div class="welcome-section">
        <h1>로그인</h1>
        <p>Routy에 다시 오신 것을 환영합니다</p>
      </div>
      <div class="form-container">
        
        <!-- 이메일 -->
        <div class="form-group">
          <label>이메일</label>
          <input 
            type="email" 
            placeholder="example@email.com" 
            v-model="email"
            @keyup.enter="handleLogin"
          />
        </div>

        <!-- 비밀번호 -->
        <div class="form-group">
          <label>비밀번호</label>
          <input 
            type="password" 
            placeholder="비밀번호를 입력하세요" 
            v-model="password"
            @keyup.enter="handleLogin"
          />
        </div>

        <!-- 로그인 유지 / 비밀번호 찾기 -->
        <div class="options-row">
          <label class="remember">
            <input type="checkbox" v-model="rememberMe" /> 로그인 유지
          </label>

          <div class="find-links">
            <router-link to="/find-email" class="forgot-email">이메일 찾기</router-link>
            <span class="divider">|</span>
            <router-link to="/find-password" class="forgot-password">비밀번호 찾기</router-link>
          </div>
        </div>

        <!-- 로그인 버튼 -->
        <button class="login-btn" @click="handleLogin" :disabled="isLoading">
          {{ isLoading ? '로그인 중...' : '로그인' }}
        </button>

        <div class="separator">또는</div>

        <!-- 소셜 로그인 -->
        <div class="social-login">
          <button class="google-btn" @click="socialLogin('google')">
            <img src="../../assets/images/icons/google.svg" alt="Google" class="social-icon" />
            구글로 로그인
          </button>
          <button class="naver-btn" @click="socialLogin('naver')">
            <img src="../../assets/images/icons/naver.svg" alt="Naver" class="social-icon" />
            네이버로 로그인
          </button>
          <button class="kakao-btn" @click="socialLogin('kakao')">
            <img src="../../assets/images/icons/kakao.svg" alt="Kakao" class="social-icon" />
            카카오로 로그인
          </button>
        </div>

        <!-- 회원가입 링크 -->
        <div class="signup-link">
          <span>아직 계정이 없으신가요?</span>
          <router-link to="/signup">회원가입</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from "vue-router";
import { login, syncAuthStatus } from '@/api/auth';

const router = useRouter();

// 폼 데이터
const email = ref("");
const password = ref("");
const rememberMe = ref(false);
const isLoading = ref(false);

// 일반 로그인
const handleLogin = async () => {
  // 유효성 검사
  if (!email.value.trim()) {
    alert("이메일을 입력해주세요.");
    return;
  }

  if (!password.value.trim()) {
    alert("비밀번호를 입력해주세요.");
    return;
  }

  isLoading.value = true;

  try {
    console.log("🔵 로그인 요청 시작:", email.value);
    
    // auth.js의 login 함수 사용
    const response = await login(email.value, password.value);

    console.log("🟢 로그인 응답 상태:", response.status);

    // 로그인 성공
    if (response.status === 200) {
      console.log("✅ 로그인 성공!");
      alert("로그인에 성공했습니다!");
      
      // 메인 페이지로 이동 (auth.js에서 이미 이벤트 발생)
      await router.push("/");
      console.log("✅ 라우터 이동 완료");
    } else {
      alert("로그인 처리 중 문제가 발생했습니다.");
    }

  } catch (error) {
    console.error("🔴 로그인 오류:", error);
    
    if (error.response) {
      if (error.response.status === 401) {
        alert("이메일 또는 비밀번호가 일치하지 않습니다.");
      } else if (error.response.status === 403) {
        alert("접근이 거부되었습니다.");
      } else {
        alert("로그인에 실패했습니다. 다시 시도해주세요.");
      }
    } else if (error.request) {
      alert("서버와 연결할 수 없습니다. 네트워크를 확인해주세요.");
    } else {
      alert("로그인 요청 중 오류가 발생했습니다.");
    }
  } finally {
    isLoading.value = false;
  }
};

// ⭐ OAuth2 로그인 후 리다이렉트되었을 때 상태 동기화
onMounted(async () => {
  // URL에서 OAuth2 로그인 성공 여부 확인
  const urlParams = new URLSearchParams(window.location.search);
  
  if (urlParams.get('oauth2Login') === 'success') {
    console.log('🟢 [Login.vue] OAuth2 로그인 성공 감지!');
    
    // 백엔드에서 인증 상태 확인 및 동기화
    await syncAuthStatus();
    
    // URL 정리 (쿼리 파라미터 제거)
    window.history.replaceState({}, document.title, window.location.pathname);
    
    // 홈으로 이동
    await router.push("/");
    console.log('🟢 [Login.vue] 홈으로 리다이렉트 완료');
  }
});

// ⭐ 소셜 로그인 - OAuth2 엔드포인트로 이동
function socialLogin(provider) {
  console.log(`🔵 [Login.vue] ${provider} 소셜 로그인 시작`);
  window.location.href = `http://localhost/api/oauth2/authorization/${provider}`;
}
</script>

<style scoped>
/* 이전과 동일한 스타일... */
.login-container {
  width: 1512px;
  height: 982px;
  background: linear-gradient(148deg, #eff6ff 0%, white 50%, #f0fdf4 100%);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.main-content {
  width: 480px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  gap: 32px;
  align-items: center;
}

.welcome-section {
  text-align: center;
}
.welcome-section h1 {
  font-size: 32px;
  color: #101828;
  font-weight: 400;
}
.welcome-section p {
  font-size: 16px;
  color: #4a5565;
}

.form-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 32px;
  background: white;
  border-radius: 24px;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.form-group label {
  font-size: 14px;
  color: #101828;
}
.form-group input {
  height: 48px;
  padding: 8px 12px;
  font-size: 14px;
  border-radius: 12px;
  border: 0.73px solid #d1d5dc;
  background: #f3f3f5;
  outline: none;
  color: #717182;
  transition: all 0.3s;
}
.form-group input:focus {
  border-color: #155dfc;
  background: white;
}

.options-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  width: 100%;
}
.remember {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #4a5565;
  cursor: pointer;
}

.login-btn {
  height: 48px;
  width: 100%;
  background: #155dfc;
  color: white;
  border-radius: 26px;
  font-size: 16px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: background 0.3s;
  white-space: nowrap;
}
.login-btn:hover:not(:disabled) {
  background: #0d4ad9;
}
.login-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.separator {
  text-align: center;
  color: #4a5565;
  font-size: 14px;
}

.social-login {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.social-login button {
  height: 48px;
  border-radius: 12px;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: opacity 0.3s;
  border: 0.5px solid rgb(231, 220, 220);
}
.social-login button:hover {
  opacity: 0.9;
}

.social-icon {
  width: 20px;
  height: 20px;
  margin-right: 10px;
}

.google-btn {
  background: white;
  color: #101828;
  border: 1px solid #d1d5dc;
}
.naver-btn {
  background: #03c75a;
  color: white;
}
.kakao-btn {
  background: #fee500;
  color: black;
}

.signup-link {
  display: flex;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  color: #4a5565;
}
.signup-link a {
  color: #155dfc;
  text-decoration: none;
}
.signup-link a:hover {
  text-decoration: underline;
}

.find-links {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #155dfc;
  font-size: 14px;
}
.find-links a {
  color: #155dfc;
  text-decoration: none;
}
.find-links a:hover {
  text-decoration: underline;
}

.divider {
  color: #d1d5dc;
}
</style>