<template>
  <div class="find-password-page">
    <div class="container">
      <!-- 제목 -->
      <div class="title-section">
        <h1>비밀번호 찾기</h1>
        <p>이메일 인증 후 비밀번호를 재설정할 수 있습니다</p>
      </div>

      <!-- 이메일 입력 -->
      <div class="form-group">
        <label>이메일</label>
        <div class="input-row">
          <input type="email" placeholder="example@email.com" v-model="email"/>
          <button class="code-btn" @click="validationNum">인증번호</button>
        </div>
      </div>

      <!-- 인증번호 입력 -->
      <div class="form-group">
        <label>인증번호</label>
        <div class="input-row">
          <input type="text" placeholder="인증번호 6자리" v-model="varifyNum"/>

          <div v-if="timerDisplay" class="timer-display">
            <span :class="{ expired: timer <= 0 }">{{ timerDisplay }}</span>
          </div>

          <button class="resend-btn" @click="validationNum">재전송</button>
        </div>
        <!-- <div class="note">이메일로 전송된 인증번호를 입력해주세요</div> -->
      </div>

      <!-- 확인 버튼 -->
      <button class="confirm-btn" @click="checkVarifyNum">확인</button>

      <!-- 로그인 링크 -->
      <router-link to="/login" class="login-link">로그인</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue';
import apiClient from '@/utils/axios';
import { useRouter } from "vue-router";

const router = useRouter();

const email = ref("")
const varifyNum = ref()
const varifyNumCheck = ref()

const timer = ref(0)              
const timerDisplay = ref("")      
let timerInterval = null 


const formatTime = (seconds) => {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
};

const startTimer = () => {
  timer.value = 180; // 3분 = 180초
  timerDisplay.value = formatTime(timer.value);

  if (timerInterval) clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    timer.value--;
    timerDisplay.value = formatTime(timer.value);

    if (timer.value <= 0) {
      clearInterval(timerInterval);
      timerDisplay.value = "00:00";
      varifyNumCheck.value = ""; // 인증번호 무효화
      alert("인증번호가 만료되었습니다. 재전송해주세요.");
    }
  }, 1000);
};


onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
});

const validationNum = async () => {

  if (!email.value.trim()) {
    alert("이메일을 입력해주세요!");
    return;
  }

  const data = new FormData();
  data.append("mail",email.value)

  await apiClient.post('/api/auth/sendmail',data).then(
    (res) => {
      console.log(res.data)
      if(res.data == 0){
        alert("이메일이 올바르지 않습니다.");
        return;
      }
      varifyNumCheck.value = res.data
      alert("인증번호가 발송되었습니다.")
      startTimer();
    }
  )
}

const checkVarifyNum = () => {
  if(varifyNum.value == null || varifyNum.value != varifyNumCheck.value){
    alert("인증번호를 다시 확인해주세요");
    return;
  }
  
  // 이메일을 쿼리 파라미터로 전달
  router.push({
    path: "/change-password",
    query: { email: email.value }
  });
}
</script>

<style scoped>
.find-password-page {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(148deg, #EFF6FF 0%, white 50%, #F0FDF4 100%);
  font-family: 'Inter', sans-serif;
  display: flex;
  flex-direction: column; /* 헤더 위, 나머지 아래 배치 */
}

/* 헤더가 위에 고정되도록 */
.find-password-page > Header {
  flex-shrink: 0;
}

/* 중앙 컨텐츠 */
.container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 24px;
  width: 100%;
}

/* 각 섹션을 고정 폭으로 묶음 */
.form-group,
.confirm-btn,
.login-link {
  width: 400px; /* 모든 입력 영역과 버튼 길이를 동일하게 */
  max-width: 90vw; /* 화면이 좁아질 때 자동 줄이기 */
  text-decoration: none;
}

/* 입력행 */
.input-row {
  display: flex;
  gap: 8px;
  position: relative; /* ✅ timer-display 기준점 지정 */
}

/* input 크기 */
.input-row input {
  flex: 1;
  height: 44px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid #D1D5DC;
  background: #F3F3F5;
  font-size: 14px;
  outline: none;
  color: #717182;
  box-sizing: border-box;
}

/* 버튼 크기 맞춤 */
.code-btn,
.resend-btn {
  width: 110px; /* 이메일/인증번호 입력창 길이 균형 맞추기 */
  height: 44px;
  border-radius: 8px;
  border: none;
  background-color: #155DFC;
  color: white;
  font-size: 14px;
  cursor: pointer;
}

.resend-btn {
  background-color: white;
  border: 1px solid #D1D5DC;
  color: #101828;
}

/* 확인 버튼 */
.confirm-btn {
  height: 44px;
  background-color: #155DFC;
  border-radius: 22px;
  color: white;
  font-size: 16px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  margin-top: 8px;
}

/* 로그인 링크 */
.login-link {
  text-align: center;
  font-size: 14px;
  color: #155DFC;
  cursor: pointer;
  margin-top: 8px;
}

.title-section {
  width: 100%;
  text-align: center;
}

.title-section h1 {
  font-size: 32px;
  color: #101828;
  margin-bottom: 8px;
}

.title-section p {
  font-size: 14px;
  color: #4A5565;
}

.timer-display {
  position: absolute;
  right: 16px; /* 버튼 위치에 맞게 */
  top: -10px; /* 버튼 위로 살짝 띄움 */
  font-size: 13px;
  color: #4a5565;
  transform: translateY(-50%); /* 위치 균형 조정 */
  pointer-events: none; /* 클릭 방지 */
  padding-bottom: 10px;
}

.timer-display .expired {
  color: red;
  font-weight: 600;
}
</style>