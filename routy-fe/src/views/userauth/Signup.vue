<template>
  <div class="signup-container">
    <!-- 메인 콘텐츠 -->
    <div class="main-content">
      <div class="welcome-section">
        <h1>환영합니다</h1>
        <p>여행의 시작, Routy과 함께하세요</p>
      </div>

      <!-- 폼 -->
      <div class="form-container">
        <!-- 이름 -->
        <div class="form-group">
          <label>사용자 이름 *</label>
          <input type="text" placeholder="이름을 입력하세요" v-model="username"/>
        </div>

        <!-- 이메일 -->
        <div class="form-group">
          <label>이메일 *</label>
          <div class="email-row">
            <input 
              type="email" 
              placeholder="example@email.com" 
              v-model="email"
              :disabled="isEmailVerified"
            />
            <!-- 이메일 옆 버튼: 인증번호 발송 → 재전송 -->
            <button 
              v-if="!emailSent" 
              class="verify-btn" 
              @click="sendVerificationCode"
            >
              인증번호 발송
            </button>
            <button 
              v-else 
              class="resend-btn" 
              @click="sendVerificationCode"
            >
              재전송
            </button>
          </div>
        </div>

        <!-- 인증번호 -->
        <div class="form-group">
          <label>인증번호</label>
          <div class="verify-row">
            <input 
              type="text" 
              placeholder="인증번호 6자리" 
              v-model="verifyNum"
              :disabled="isEmailVerified"
            />

            <div v-if="timerDisplay && !isEmailVerified" class="timer-display">
              <span :class="{ expired: timer <= 0 }">{{ timerDisplay }}</span>
            </div>

            <!-- 인증번호 옆 버튼: 처음부터 인증확인 버튼 존재 -->
            <button 
              v-if="!isEmailVerified" 
              class="confirm-btn" 
              @click="confirmVerificationCode"
            >
              인증확인
            </button>
            <span v-else class="verified-badge">✓ 인증완료</span>
          </div>
          <small v-if="!isEmailVerified">이메일로 전송된 인증번호를 입력해주세요</small>
          <small v-else class="success-text">이메일 인증이 완료되었습니다!</small>
        </div>

        <!-- 성별 -->
        <div class="form-group">
          <label>성별</label>
          <select class="select-box" v-model="gender">
            <option value="" disabled selected>선택하세요</option>
            <option value="남">남성</option>
            <option value="여">여성</option>
          </select>
        </div>

        <!-- 나이 -->
        <div class="form-group">
          <label>나이</label>
          <input type="number" placeholder="나이" v-model="age"/>
        </div>

        <!-- 전화번호 -->
        <div class="form-group">
          <label>전화번호</label>
          <input type="text" placeholder="전화번호" v-model="phone"/>
        </div>

        <!-- 비밀번호 -->
        <div class="form-group">
          <label>비밀번호 *</label>
          <input type="password" placeholder="8자 이상 입력하세요" v-model="password"/>
        </div>

        <!-- 비밀번호 확인 -->
        <div class="form-group">
          <label>비밀번호 확인 *</label>
          <input type="password" placeholder="비밀번호를 다시 입력하세요" v-model="passwordCheck"/>
        </div>

        <!-- 약관 동의 -->
        <div class="agree-section">
          <input type="checkbox" id="agree" v-model="agreeCheck" />
          <label for="agree">이용약관 및 개인정보처리방침에 동의합니다</label>
          <a class="terms-btn" @click="showTerms = true">이용약관 보기</a>
        </div>

        <!-- 회원가입 버튼 -->
        <button class="signup-btn" @click="register">회원가입</button>

        <!-- 로그인 링크 -->
        <div class="login-link">
          <span>이미 계정이 있으신가요?</span>
          <router-link to="/login">로그인</router-link>
        </div>
      </div>
    </div>

    <!-- 이용약관 모달 -->
    <div v-if="showTerms" class="modal-overlay" @click.self="showTerms = false">
      <div class="modal-box">
        <h2>이용약관 및 개인정보처리방침</h2>
        <div class="modal-content">
          <h1>개인정보처리방침</h1>
          <p>
            Routy(이하 "서비스")는 이용자의 개인정보를 중요하게 생각하며,
            개인정보 보호와 관련된 대한민국의 법령을 준수합니다.
            본 개인정보처리방침은 서비스가 어떤 정보를 수집하고, 어떤 목적으로 이용하며,
            어떻게 보호하는지에 대해 설명합니다.
          </p>

          <h2>1. 수집하는 개인정보 항목</h2>
          <p>서비스는 아래와 같은 개인정보를 수집할 수 있습니다.</p>
          <ul>
            <li><strong>회원가입 시:</strong> 이메일, 비밀번호, 닉네임</li>
            <li><strong>서비스 이용 시:</strong> 사용자가 생성한 여행 일정 정보(여행 제목, 기간, 담긴 장소 등)</li>
            <li><strong>자동으로 생성되는 정보:</strong> 접속 일시, 접속 IP, 기기 정보, 이용 기록 등</li>
          </ul>

          <h2>2. 개인정보의 수집 및 이용 목적</h2>
          <ul>
            <li>회원 식별 및 서비스 이용을 위한 본인 확인</li>
            <li>여행 일정 생성, 저장, 조회 등 서비스 핵심 기능 제공</li>
            <li>서비스 개선을 위한 이용 패턴 분석</li>
            <li>이용 문의 대응 및 공지사항 전달</li>
          </ul>

          <h2>3. 개인정보의 보유 및 이용 기간</h2>
          <ul>
            <li>원칙적으로 회원탈퇴 시 수집된 개인정보는 즉시 파기합니다.</li>
            <li>다만 서비스 운영상 일정 기간 보관이 필요한 정보는 내부 방침에 따라 일정 기간 보관 후 파기할 수 있습니다.</li>
            <li>관계 법령에서 일정 기간 정보 보관을 요구하는 경우 해당 법령에서 정한 기간 동안 보관합니다.</li>
          </ul>

          <h2>4. 개인정보의 제3자 제공</h2>
          <p>
            서비스는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다.
            다만 이용자가 사전에 동의했거나 법령에 따라 요구되는 경우 예외로 제공할 수 있습니다.
          </p>

          <h2>5. 개인정보의 처리 위탁</h2>
          <p>
            현재 서비스는 개인정보 처리를 외부에 위탁하고 있지 않습니다.
            향후 위탁이 필요한 경우 위탁받는 자와 위탁하는 업무 내용을 서비스 내에 공지하겠습니다.
          </p>

          <h2>6. 이용자의 권리</h2>
          <ul>
            <li>이용자는 언제든지 자신의 개인정보를 조회하거나 수정할 수 있습니다.</li>
            <li>회원탈퇴를 통해 개인정보 삭제를 요청할 수 있습니다.</li>
            <li>개인정보와 관련된 문의는 아래 연락처로 요청하실 수 있습니다.</li>
          </ul>

          <h2>7. 개인정보의 안전성 확보 조치</h2>
          <p>
            서비스는 개인정보를 안전하게 관리하기 위해 비밀번호 암호화, 접근 권한 통제 등
            합리적인 보안 조치를 적용하기 위해 노력합니다.
          </p>

          <h2>8. 만 14세 미만 아동의 개인정보</h2>
          <p>
            서비스는 만 14세 미만 아동을 대상으로 하지 않으며, 만 14세 미만 아동의 회원가입을 받지 않습니다.
          </p>

          <h2>9. 개인정보처리방침의 변경</h2>
          <p>
            본 방침은 법령의 개정이나 서비스 정책의 변경에 따라 달라질 수 있습니다.
            중요한 변경 사항이 있는 경우 서비스 내 공지사항을 통해 안내드립니다.
          </p>

          <h2>10. 문의처</h2>
          <p>
            개인정보 보호와 관련된 문의, 열람·정정·삭제 요청은 아래로 연락해 주세요.<br />
            이메일: <a href="#"></a>
          </p>

          <p class="effective-date">시행일자: 2025-11-05</p>
        </div>
        <div class="modal-actions">
          <button class="close-btn" @click="showTerms = false">닫기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue';
import { sendVerificationEmail, confirmVerificationCode as confirmCodeAPI } from '@/api/auth';
import apiClient from '@/utils/axios';
import { useRouter } from 'vue-router';

const router = useRouter();

const email = ref("");
const username = ref("");
const verifyNum = ref("");
const gender = ref("");
const phone = ref("");
const age = ref();
const password = ref("");
const passwordCheck = ref("");
const agreeCheck = ref(false);
const showTerms = ref(false);

// 이메일 인증 상태
const emailSent = ref(false);           // 인증번호 발송 여부
const isEmailVerified = ref(false);     // 인증 완료 여부

// 타이머 관련 변수
const timer = ref(0);              // 남은 시간 (초)
const timerDisplay = ref("");      // "02:59" 형식으로 표시
let timerInterval = null;          // setInterval을 저장할 변수

// 타이머 포맷 함수
const formatTime = (seconds) => {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
};

// 타이머 시작
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

// 인증번호 발송 (이메일 옆 버튼)
const sendVerificationCode = async () => {
  console.log('🔵 [Signup.vue] 인증번호 발송 시작');
  
  if (!email.value.trim()) {
    alert("이메일을 입력해주세요!");
    return;
  }

  try {
    const result = await sendVerificationEmail(email.value);
    
    if (result === 0) {
      alert("이메일이 올바르지 않습니다.");
      return;
    }
    
    console.log('🟢 [Signup.vue] 인증번호 발송 성공');
    emailSent.value = true;  // 버튼을 "재전송"으로 변경
    alert("인증번호가 발송되었습니다.");
    startTimer();
  } catch (error) {
    console.error('❌ [Signup.vue] 인증번호 발송 실패:', error);
    alert("인증번호 발송에 실패했습니다. 다시 시도해주세요.");
  }
};

// 인증번호 확인 (인증번호 옆 버튼)
const confirmVerificationCode = async () => {
  console.log('🔵 [Signup.vue] 인증번호 확인 시작');
  
  if (!emailSent.value) {
    alert("먼저 인증번호를 발송해주세요!");
    return;
  }
  
  if (!verifyNum.value) {
    alert("인증번호를 입력해주세요!");
    return;
  }

  if (timer.value <= 0) {
    alert("인증번호가 만료되었습니다. 재전송해주세요.");
    return;
  }

  try {
    const result = await confirmCodeAPI(email.value, verifyNum.value);
    
    console.log('🟢 [Signup.vue] 백엔드 응답:', result);
    
    // 백엔드 응답: "인증되었습니다." 또는 "인증 성공"
    if (result === "인증되었습니다." || result === "인증 성공" || result.includes("성공") || result.includes("인증")) {
      isEmailVerified.value = true;
      clearInterval(timerInterval);
      timerDisplay.value = "";
      alert("이메일 인증이 완료되었습니다!");
    } else {
      alert("인증번호가 일치하지 않습니다. 다시 확인해주세요.");
    }
  } catch (error) {
    console.error('❌ [Signup.vue] 인증번호 확인 실패:', error);
    alert("인증 확인에 실패했습니다. 다시 시도해주세요.");
  }
};

// 회원가입
const register = async () => {
  console.log('🔵 [Signup.vue] 회원가입 시작');
  
  if (username.value === "") {
    alert("사용자 이름을 입력해주세요");
    return;
  }

  if (!isEmailVerified.value) {
    alert("이메일 인증을 완료해주세요");
    return;
  }

  if (password.value === "" || password.value !== passwordCheck.value) {
    alert("비밀번호를 확인해주세요");
    return;
  }
  
  if (!agreeCheck.value) {
    alert("이용약관을 확인해주세요");
    return;
  }

  const data = {
    username: username.value,
    email: email.value,
    password: password.value,
    age: age.value,
    phone: phone.value,
    gender: gender.value,
    role: "ROLE_USER",
    isDeleted: 0
  };

  try {
    const res = await apiClient.post('/api/auth/register', data);
    
    console.log('🟢 [Signup.vue] 회원가입 성공:', res.data);
    alert(res.data.message);
    router.push('/login');
  } catch (error) {
    console.error('❌ [Signup.vue] 회원가입 실패:', error);
    if (error.response) {
      alert(error.response.data.message || "회원가입에 실패했습니다.");
    } else {
      alert("서버와 연결할 수 없습니다.");
    }
  }
};
</script>

<style scoped>
.signup-container {
  width: 1512px;
  height: 1164px;
  background: linear-gradient(146deg, #eff6ff 7%, white 50%, #f0fdf4 93%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 50px;
}

/* 메인 섹션 */
.main-content {
  width: 480px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
}

.welcome-section {
  text-align: center;
}

.welcome-section h1 {
  font-size: 32px;
  color: #101828;
  font-weight: 400;
  margin-bottom: 8px;
}

.welcome-section p {
  font-size: 16px;
  color: #4a5565;
}

/* 폼 */
.form-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
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
  padding: 10px 12px;
  border: 1px solid #d1d5dc;
  border-radius: 12px;
  background: #f3f3f5;
  font-size: 14px;
  color: #717182;
  outline: none;
}

.form-group input:disabled {
  background: #e5e7eb;
  cursor: not-allowed;
}

.email-row,
.verify-row {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.email-row input,
.verify-row input {
  flex: 1; 
}

.verify-btn {
  background: #155dfc;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
}

.resend-btn {
  background: white;
  border: 1px solid #d1d5dc;
  border-radius: 12px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  color: #101828;
  white-space: nowrap;
}

.confirm-btn {
  background: #155dfc;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
}

.verified-badge {
  background: #10b981;
  color: white;
  border-radius: 12px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
}

small {
  font-size: 12px;
  color: #4a5565;
}

.success-text {
  color: #10b981;
  font-weight: 500;
}

.select-box {
  width: 100%;
  background: #f3f3f5;
  border: 1px solid #d1d5dc;
  border-radius: 12px;
  padding: 12px;
  color: #717182;
  font-size: 14px;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  position: relative;
}

/* 약관 동의 */
.agree-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.agree-section input {
  width: 16px;
  height: 16px;
}

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(16, 24, 40, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-box {
  background: white;
  width: 800px;
  max-height: 80vh;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 24px;
}

.modal-box h2 {
  font-size: 20px;
  color: #101828;
  margin-bottom: 16px;
}

.modal-content {
  font-size: 14px;
  color: #4a5565;
  line-height: 1.6;
  margin-bottom: 24px;
  overflow-y: auto; 
  max-height: 60vh; 
  padding-right: 8px; 
}

.modal-actions {
  text-align: right;
}

.close-btn {
  background: #155dfc;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  cursor: pointer;
}

/* 버튼 */
.signup-btn {
  width: 100%;
  background: #155dfc;
  color: white;
  border: none;
  border-radius: 26px;
  padding: 12px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
}

/* 로그인 링크 */
.login-link {
  text-align: center;
  font-size: 14px;
  color: #4a5565;
}

.login-link a {
  color: #155dfc;
  text-decoration: none;
  margin-left: 4px;
}

.timer-display {
  position: absolute;
  right: 106px;
  top: 50%;
  font-size: 13px;
  color: #4a5565;
  transform: translateY(-50%);
  pointer-events: none;
  font-weight: 500;
}

.timer-display .expired {
  color: red;
  font-weight: 600;
}

.terms-btn {
  cursor: pointer;
  text-decoration: underline;
}
</style>