<template>
  <div class="step-container">
    <div class="step-content">
      <!-- 상단 단계 -->
      <div class="step-top">
        <div class="step-number">단계 3 / 4</div>
        <button class="cancel-btn" @click="() => router.push('/')">취소</button>
      </div>

      <!-- 진행바 -->
      <div class="progress-bar">
        <div class="progress-fill step3"></div>
      </div>

      <!-- 카드 -->
      <div class="card">
        <h3 class="card-title">어떤 테마를 원하시나요?</h3>
        <p class="card-subtitle">원하는 테마를 선택해주세요</p>

        <div class="theme-grid">
          <div
            v-for="(theme, i) in themes"
            :key="i"
            class="theme-card"
            :class="{ selected: selectedThemes.includes(theme.name) }"
            @click="toggleTheme(theme.name)"
          >
          <img :src="theme.icon" :alt="theme.name + ' 아이콘'" class="theme-icon"/>
          <div class="label">{{ theme.name }}</div>
          </div>
        </div>
      </div>

      <!-- 하단 버튼 -->
      <div class="button-group">
        <button class="prev-btn" @click="goPrev">이전</button>
        <button
          class="next-btn"
          :disabled="selectedThemes.length === 0"
          @click="goNext"
        >
          다음
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import '@/assets/css/draw.css'
import '@/assets/css/step-common.css'
import { ref, onMounted } from 'vue'
import { useRouter } from "vue-router"
import apiClient from '@/utils/axios'

// 테마 이미지 임포트
import themeRestaurant from '@/assets/images/theme/recommend-restaurant.png';
import themeCafe from '@/assets/images/theme/recommend-cafe.png';
import themeTourist from '@/assets/images/theme/recommend-attraction.png';

const router = useRouter()

// 테마 정의 (이미지 경로로 변경)
const themes = [
  { icon: themeRestaurant, name: '맛집', code: 'restaurant' },
  { icon: themeCafe, name: '카페', code: 'cafe' },             
  { icon: themeTourist, name: '관광지', code: 'tourist' }    
];

const selectedThemes = ref([])

const toggleTheme = (name) => {
  const index = selectedThemes.value.indexOf(name)
  if (index === -1) selectedThemes.value.push(name)
  else selectedThemes.value.splice(index, 1)
}

const goPrev = () => router.push('/draw/second')

// 컴포넌트 마운트 시 localStorage 확인
onMounted(() => {
  console.log('=== ThirdDraw 마운트 시 localStorage 체크 ===')
  console.log('selectedRegion:', localStorage.getItem('selectedRegion'))
  console.log('planDates:', localStorage.getItem('planDates'))
  
  const selectedRegion = JSON.parse(localStorage.getItem('selectedRegion') || '{}')
  const planDates = JSON.parse(localStorage.getItem('planDates') || '{}')
  
  console.log('파싱된 selectedRegion:', selectedRegion)
  console.log('파싱된 planDates:', planDates)
  
  // 누락된 값 확인
  if (!selectedRegion.regionId) {
    console.error('regionId 없음!')
  }
  if (!planDates.startDate) {
    console.error('startDate 없음!')
  }
  if (!planDates.endDate) {
    console.error('endDate 없음!')
  }
})

// Plan 생성 (지역, 날짜, 테마 포함)
const goNext = async () => {
  if (selectedThemes.value.length === 0) {
    alert('테마를 하나 이상 선택해주세요!')
    return
  }
  
  // 선택된 테마의 코드 추출
  const selectedCodes = selectedThemes.value.map(themeName => {
    const theme = themes.find(t => t.name === themeName)
    return theme ? theme.code : null
  }).filter(Boolean)
  
  // 첫 번째 테마를 기본으로 사용
  const primaryTheme = selectedCodes[0]
  
  console.log('선택된 테마:', selectedThemes.value)
  console.log('테마 코드:', primaryTheme)
  
  // localStorage에서 지역과 날짜 정보 가져오기
  const selectedRegionStr = localStorage.getItem('selectedRegion')
  const planDatesStr = localStorage.getItem('planDates')
  
  if (!selectedRegionStr || !planDatesStr) {
    console.error('localStorage가 비어있습니다!')
    alert('지역 또는 날짜 정보가 없습니다. 처음부터 다시 시작해주세요.')
    router.push('/draw/first')
    return
  }
  
  const selectedRegion = JSON.parse(selectedRegionStr)
  const planDates = JSON.parse(planDatesStr)
  
  console.log('파싱된 selectedRegion:', selectedRegion)
  console.log('파싱된 planDates:', planDates)
  
  if (!selectedRegion.regionId || !planDates.startDate || !planDates.endDate) {
    console.error('필수 값 누락:', {
      regionId: selectedRegion.regionId,
      startDate: planDates.startDate,
      endDate: planDates.endDate
    })
    alert('지역 또는 날짜 정보가 없습니다. 처음부터 다시 시작해주세요.')
    router.push('/draw/first')
    return
  }
  
  // Plan 생성 요청
  try {
    // 1. Plan 생성
    const planPayload = {
      planTitle: `${selectedRegion.regionName} 여행`,
      startDate: planDates.startDate,
      endDate: planDates.endDate,
      theme: primaryTheme,
      regionId: selectedRegion.regionId
    }
    
    console.log('Plan 생성 payload:', planPayload)
    
    const planResponse = await apiClient.post('/api/plans', planPayload)
    const planId = planResponse.data.planId
    
    console.log('Plan 생성 완료! planId:', planId)
    
    // 2. Duration 생성 (일차 자동 생성)
    const durationPayload = {
      totalDays: planDates.days
    }
    
    console.log('Duration 생성 payload:', durationPayload)
    
    const durationResponse = await apiClient.post(
      `/api/plans/${planId}/durations`,
      durationPayload
    )
    
    console.log('Duration 생성 완료!', durationResponse.data)
    
    // localStorage 정리
    localStorage.removeItem('selectedRegion')
    localStorage.removeItem('planDates')
    localStorage.setItem('selectedTheme', primaryTheme)
    localStorage.setItem('selectedThemes', JSON.stringify(selectedCodes))
    
    // FinalDraw로 이동
    router.push({
      path: '/draw/final',
      query: { 
        planId: planId,
        totalDays: planDates.days,
        theme: primaryTheme
      }
    })
    
  } catch (error) {
    console.error('생성 실패:', error)
    console.error('에러 상세:', error.response?.data)
    
    if (error.response?.status === 400) {
      alert('요청 데이터가 올바르지 않습니다.')
    } else if (error.response?.status === 404) {
      alert('Plan을 찾을 수 없습니다.')
    } else {
      alert('일정 생성에 실패했습니다. 다시 시도해주세요.')
    }
  }
}
</script>

<style scoped>
.card {
  align-items: center;
  text-align: center;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #0a0a0a;
}

.card-subtitle {
  color: #4a5565;
  font-size: 15px;
  margin-bottom: 16px;
}

/* 테마 버튼 영역 */
.theme-grid {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 24px;
  margin-top: 16px;
}

.theme-card {
  width: 140px;
  height: 140px;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: 0.2s;
  font-size: 16px;
}

.theme-card .emoji {
  font-size: 28px;
  margin-bottom: 8px;
}

.theme-card.selected {
  background: #eff6ff;
  border: 2px solid #155dfc;
  box-shadow: 0 0 0 2px #155dfc;
}
/* 진행바 애니메이션 */
.progress-fill {
  position: relative;
  overflow: hidden;
}

/* 반짝이는 효과 추가 */
.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

/* 또는 펄스 효과 (선택) */
.progress-fill {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.theme-icon {
  width: 64px;
  height: 64px;
  margin-bottom: 12px;
}
</style>