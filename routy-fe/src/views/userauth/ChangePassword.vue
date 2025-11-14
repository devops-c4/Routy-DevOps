<template>
  <div class="password-change-page">
    <main class="main-container">
      <div class="title-section">
        <h1>비밀번호 변경</h1>
        <p>새로운 비밀번호를 입력해주세요</p>
      </div>

      <!-- 계정 이메일 - 전달받은 이메일 표시 -->
      <div class="email-box">
        <label>계정 이메일</label>
        <div class="email-value">{{ userEmail }}</div>
      </div>

      <!-- 새 비밀번호 -->
      <div class="form-group">
        <label>새 비밀번호</label>
        <div class="input-row">
          <input 
            type="password" 
            placeholder="새 비밀번호를 입력하세요 (8자 이상)" 
            v-model="newPassword" 
          />
          <i class="eye-icon"></i>
        </div>
        <p class="note">영문, 숫자, 특수문자를 조합하여 8자 이상 입력해주세요</p>
      </div>

      <!-- 비밀번호 확인 -->
      <div class="form-group">
        <label>비밀번호 확인</label>
        <div class="input-row">
          <input 
            type="password" 
            placeholder="비밀번호를 다시 입력하세요" 
            v-model="confirmPassword" 
          />
          <i class="eye-icon"></i>
        </div>
      </div>

      <button class="change-btn" @click="handleChangePassword">비밀번호 변경</button>

      <hr class="divider" />
      <router-link to="/login" class="back-to-login">로그인</router-link>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { changePassword } from '@/api/auth';

const route = useRoute();
const router = useRouter();

const userEmail = ref('');
const newPassword = ref('');
const confirmPassword = ref('');

// 컴포넌트 마운트 시 쿼리 파라미터에서 이메일 가져오기
onMounted(() => {
  userEmail.value = route.query.email || '';
  
  // 이메일이 없으면 비밀번호 찾기 페이지로 리다이렉트
  if (!userEmail.value) {
    alert('잘못된 접근입니다.');
    router.push('/find-password');
  }
});

const handleChangePassword = async () => {
  console.log('🔵 [ChangePassword.vue] 비밀번호 변경 시작');
  
  // 유효성 검사
  if (!newPassword.value || newPassword.value.length < 8) {
    alert('비밀번호는 8자 이상이어야 합니다.');
    return;
  }
  
  if (newPassword.value !== confirmPassword.value) {
    alert('비밀번호가 일치하지 않습니다.');
    return;
  }
  
  try {
    console.log('🔵 [ChangePassword.vue] API 호출 중...');
    const response = await changePassword(userEmail.value, newPassword.value);
    
    console.log('🟢 [ChangePassword.vue] 비밀번호 변경 성공:', response);
    
    // 성공 시 로그인 페이지로 이동
    if (response.status === 200) {
      alert('비밀번호가 성공적으로 변경되었습니다.\n로그인 페이지로 이동합니다.');
      router.push('/login');
    }
  } catch (error) {
    console.error('❌ [ChangePassword.vue] 비밀번호 변경 실패:', error);
    
    // 에러 메시지 처리
    if (error.response) {
      const errorMessage = error.response.data?.message || error.response.data?.error || '비밀번호 변경에 실패했습니다.';
      alert(errorMessage);
    } else {
      alert('서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
    }
  }
};
</script>

<style scoped>
.password-change-page {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(148deg, #EFF6FF 0%, white 50%, #F0FDF4 100%);
  font-family: 'Inter', sans-serif;
  display: flex;
  flex-direction: column;
}

/* 헤더 */
.header {
  background: rgba(255, 255, 255, 0.8);
  height: 79px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.header-inner {
  width: 1167px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  width: 60px;
  height: 60px;
  object-fit: cover;
}

.nav-links span {
  margin-right: 24px;
  font-size: 16px;
  color: #4A5565;
  cursor: pointer;
}

.auth-links span {
  margin-left: 16px;
  font-size: 16px;
  color: #4A5565;
  cursor: pointer;
}

/* 메인 콘텐츠 */
.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.title-section {
  text-align: center;
}

.title-section h1 {
  font-size: 32px;
  color: #101828;
  margin-bottom: 8px;
}

.title-section p {
  color: #4A5565;
  font-size: 16px;
}

/* 이메일 정보 */
.email-box {
  width: 416px;
  padding: 16px;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  background: #F9FAFB;
}

.email-box label {
  font-size: 14px;
  color: #4A5565;
}

.email-value {
  font-size: 16px;
  color: #101828;
  font-weight: 500;
}

/* 입력 그룹 */
.form-group {
  width: 416px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  color: #101828;
}

.input-row {
  position: relative;
}

.input-row input {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  border: 1px solid #D1D5DC;
  background: #F3F3F5;
  padding: 0 48px 0 12px;
  font-size: 14px;
  color: #717182;
  outline: none;
  box-sizing: border-box; /* ✅ 추가됨 */
}

.eye-icon {
  position: absolute;
  right: 14px;
  top: 14px;
  width: 20px;
  height: 20px;
  background-image: url('../../assets/images/icons/eye.svg'); /* 👈 이미지 경로 */
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  cursor: pointer;
}

.note {
  font-size: 12px;
  color: #4A5565;
}

/* 버튼 */
.change-btn {
  width: 416px;
  height: 52px;
  background-color: #155DFC;
  border: none;
  border-radius: 26px;
  color: white;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
}

.change-btn:hover {
  background-color: #1249d6;
}

/* 구분선 */
.divider {
  width: 416px;
  height: 1px;
  background-color: #E5E7EB;
  border: none;
}

/* 로그인으로 돌아가기 */
.back-to-login {
  font-size: 14px;
  color: #4A5565;
  cursor: pointer;
  text-decoration: none;
}

.back-to-login:hover {
  color: #155DFC;
}
</style>