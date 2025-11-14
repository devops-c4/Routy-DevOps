<template>
  <div class="navbar">
    <div class="nav-content">
      <div class="left-section">
        <div class="logo-section">
          <img class="logo-img" src="@/assets/images/icons/logo.png" alt="logo" @click="moveToHome"/>
        </div>

        <div class="route-section">
          <span class="route-item" :class="{ active: currentRoute === 'draw' }" @click="moveToDraw">여행 루트 그리기</span>
          <span class="route-item" :class="{ active: currentRoute === 'browse' }" @click="moveToBrowse">여행 루트 둘러보기</span>
          <span class="route-item chatbot-wrapper" 
            @click="moveToChatBot"
            @mouseover="handleChatbotHover(true)"
            @mouseleave="handleChatbotHover(false)"
          >
            <img class="chatbot-icon" :src="chatbotIconSrc" alt="chatbot"/>
            <div v-if="showChatTooltip" class="chat-tooltip">
              Rooting에게 물어봐!
            </div>
          </span>
        </div>
      </div>

      <div class="menu-section">
        <template v-if="!isLoggedIn">
          <span class="menu-item" @click="moveToRegister">회원가입</span>
          <span class="menu-item" @click="moveToLogin">로그인</span>
        </template>
        
        <template v-else>
          <div class="tooltip-wrapper">
            <img
              class="newPlanCountImage"
              @click="moveToMyPage2"
              v-if="newPlanCount != 0"
              src="../assets/images/icons/planCalling2.png"
              @mouseover="showTooltip = true"
              @mouseleave="showTooltip = false"
            />
            <div v-if="showTooltip" class="tooltip-msg">
              새로운 여행 루트가 {{newPlanCount}}개 있어요!
            </div>
          </div>
          <span class="menu-item" @click="moveToMyPage">마이페이지</span>
          <span class="menu-item" @click="showLogoutConfirm">로그아웃</span>
          
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'; // computed 추가
import { useRouter } from "vue-router";
import { logout, getLocalAuthStatus } from '@/api/auth';
import { useRoute } from "vue-router";
const route = useRoute();

const currentRoute = computed(() => {
  if (route.path.startsWith('/draw')) return 'draw';
  if (route.path.startsWith('/browse')) return 'browse';
  return '';
});

// 챗봇 이미지 임포트
import defaultChatbotIcon from '@/assets/images/chatbot/chatbot1.png';
import hoverChatbotIcon from '@/assets/images/chatbot/chatbot1-hover.png';

const router = useRouter();
const props = defineProps({ id: [String, Number] })
const isLoggedIn = ref(false);
const LOGIN_STATUS_KEY = 'routy:isLoggedIn';
const newPlanCount = ref(Number(sessionStorage.getItem("newPlan")) || 0);
const showTooltip = ref(false)
const showChatTooltip = ref(false)

// 챗봇 이미지 호버 상태 관리용 ref
const isChatbotHovered = ref(false); 

// 챗봇 이미지 경로를 동적으로 반환하는 computed 속성
const chatbotIconSrc = computed(() => {
  if (isChatbotHovered.value) {
    // import한 변수를 반환합니다.
    return hoverChatbotIcon; 
  } else {
    // import한 변수를 반환합니다.
    return defaultChatbotIcon;
  }
});

// 챗봇 호버 이벤트 핸들러
const handleChatbotHover = (isHovering) => {
  isChatbotHovered.value = isHovering;
  showChatTooltip.value = isHovering; // 툴팁도 같이 보이게
};


// 로그인 상태 확인 (localStorage 기반)
const checkAuthStatus = () => {
  isLoggedIn.value = getLocalAuthStatus();
  console.log('🔍 [Header] 현재 로그인 상태:', isLoggedIn.value);
};

// CustomEvent 리스너
const handleLoginStatusChange = (event) => {
  console.log('🔔 [Header] login-status-changed 이벤트 수신:', event.detail);
  isLoggedIn.value = event.detail.loggedIn;
  console.log('🔔 [Header] 로그인 상태 업데이트됨:', isLoggedIn.value);
};

// 컴포넌트 마운트 시 로그인 상태 확인 및 이벤트 리스너 등록
onMounted(() => {
  console.log('🟢 [Header] 컴포넌트 마운트됨');
  checkAuthStatus();
  window.addEventListener('login-status-changed', handleLoginStatusChange);

  const newCount = Number(sessionStorage.getItem("newPlan")) || 0;
  newPlanCount.value = newCount;
  
});

// 컴포넌트 언마운트 시 이벤트 리스너 제거
onUnmounted(() => {
  console.log('🔴 [Header] 컴포넌트 언마운트됨');
  window.removeEventListener('login-status-changed', handleLoginStatusChange);
});

// 네비게이션 함수들
const moveToHome = () => router.push("/");
const moveToDraw = () => router.push('/draw/first');
const moveToBrowse = () => router.push("/browse");
const moveToRegister = () => router.push('/signup');
const moveToLogin = () => router.push('/login');
const moveToMyPage = () => router.push('/mypage');
const moveToMyPage2 = () => {
  newPlanCount.value = 0;
  sessionStorage.setItem('newPlan',0);
  showTooltip.value = false
  router.push("/mypage").then(() => {
    window.location.reload();
  });
}

// 로그아웃 확인창 표시
const showLogoutConfirm = () => {
  if (confirm('로그아웃 하시겠습니까?')) {
    handleLogout();
  }
};

// 로그아웃 처리
const handleLogout = async () => {
  console.log('🔴 [Header] 로그아웃 버튼 클릭됨!');
  console.log('🔴 [Header] logout 함수 타입:', typeof logout);
  console.log('🔴 [Header] logout 함수:', logout);
  
  try {
    console.log('🔵 [Header] logout() 함수 호출 시작');
    
    // API 호출하여 백엔드 쿠키 삭제
    await logout();
    
    console.log('🟢 [Header] logout() 함수 호출 성공!');
    console.log('🟢 [Header] 홈으로 이동 중...');
    
    // 홈으로 이동
    router.push('/');
    
    console.log('🟢 [Header] 홈 이동 완료');
  } catch (error) {
    console.error('❌ [Header] 로그아웃 처리 중 오류:', error);
    console.error('❌ [Header] 에러 상세:', error.message);
    console.error('❌ [Header] 에러 스택:', error.stack);
    
    // 에러가 발생해도 홈으로 이동
    router.push('/');
  }
};
const moveToChatBot = () => router.push('/chatbot');
</script>

<style scoped>
.navbar {
  width: 100%;
  height: 50px;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  z-index: 1000;
}

.nav-content {
  width: 1167px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 왼쪽 섹션 (로고 + 메뉴) */
.left-section {
  display: flex;
  align-items: center;
  gap: 32px;
}

/* 로고 */
.logo-img {
  width: 95px;
  height: 90px;
  cursor: pointer;
}

/* 로고 옆 메뉴 (텍스트) */
.route-section {
  display: flex;
  align-items: center;
  gap: 24px;
}

.route-item {
  color: #4a5565;
  font-size: 16px;
  font-family: "Inter", sans-serif;
  font-weight: 400;
  line-height: 1.5;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.2s;
}

.route-item:hover {
  color: #155dfc;
}

/* 오른쪽 메뉴 */
.menu-section {
  display: flex;
  align-items: center;
  gap: 24px;
}

.menu-item {
  color: #4a5565;
  font-size: 16px;
  font-family: "Inter", sans-serif;
  font-weight: 400;
  line-height: 1.5;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.2s;
}

.menu-item:hover {
  color: #155dfc;
}

.chatbot-icon {
  width: 70px; 
  height: 70px;
  object-fit: contain; 
  vertical-align: middle; 
  cursor: pointer;
  /* transition은 JavaScript로 src 변경하므로 제거 */
  /* transition: transform 0.2s ease; */
}

/* 호버 시 transform 효과는 CSS로 유지 */
.chatbot-wrapper:hover .chatbot-icon {
  transform: scale(1.1); 
}

.tooltip-wrapper {
  position: relative;
  display: inline-block;
}

.tooltip-msg {
  position: absolute;
  bottom: -35px; 
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.75);
  color: white;
  font-size: 13px;
  padding: 6px 10px;
  border-radius: 6px;
  white-space: nowrap;
  animation: fadeIn 0.2s ease-in;
  z-index: 2000;
}

.chatbot-wrapper {
  position: relative;
  display: inline-block;
}

.chat-tooltip {
  position: absolute;
  bottom: -20px; /* 아이콘 아래에 표시 */
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.75);
  color: white;
  font-size: 13px;
  padding: 6px 10px;
  border-radius: 6px;
  white-space: nowrap;
  animation: fadeIn 0.2s ease-in;
  z-index: 2000;
}


@keyframes fadeIn {
  from { opacity: 0; transform: translateX(-50%) translateY(-5px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

.newPlanCountImage {
  width: 30px;
  height: 30px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.newPlanCountImage:hover {
  transform: scale(1.1);
}


.route-item:hover {
  color: #155dfc;
  font-weight: 500;
}

/* 현재 페이지에 적용되는 active 상태 */
.route-item.active {
  color: #155dfc;
  font-weight: 600;
}

.logo-img {
  width: 95px;
  height: 90px;
  cursor: pointer;
  transition: transform 0.25s ease, filter 0.25s ease;
}

.logo-img:hover {
  transform: scale(1.07);
  filter: brightness(1.15) saturate(1.2);
}
</style>