<template>
  <div class="step-container">
    <div class="step-content">
      <div class="step-top">
        <div class="step-number">단계 2 / 4</div>
        <button class="cancel-btn" @click="() => router.push('/')">취소</button>
      </div>

      <div class="progress-bar">
        <div class="progress-fill step2"></div>
      </div>

      <div class="card">
        <h3 class="card-title">언제 여행하시나요?</h3>
        <p class="card-subtitle">여행 시작일과 종료일을 선택해주세요</p>

        <div class="date-grid">
          <!-- 시작일 -->
          <div class="date-input">
            <label for="start">시작일</label>
            <input
              id="start"
              type="date"
              v-model="startDate"
              :min="today"
              @change="handleStartChange"
            />
          </div>

          <span class="tilde">~</span>

          <!-- 종료일 -->
          <div class="date-input">
            <label for="end">종료일</label>
            <input
              id="end"
              type="date"
              v-model="endDate"
              :min="startDate || today"
              @change="calculateTotalDays"
            />
          </div>
        </div>

        <div v-if="startDate && endDate && totalDays > 0" class="date-summary">
          <p>{{ formattedPeriod }}</p>
          <p class="days">총 {{ totalDays }}일</p>
        </div>
      </div>

      <div class="button-group">
        <button class="prev-btn" @click="goPrev">이전</button>
        <button
          class="next-btn"
          :disabled="!startDate || !endDate"
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const startDate = ref('')
const endDate = ref('')
const totalDays = ref(0)

// 오늘 날짜 (최소 선택 가능 날짜)
const today = computed(() => {
  return new Date().toISOString().split('T')[0]
})

// 날짜 범위 포맷팅
const formattedPeriod = computed(() => {
  if (!startDate.value || !endDate.value) return ''
  
  const start = new Date(startDate.value)
  const end = new Date(endDate.value)
  
  return `${start.getMonth() + 1}월 ${start.getDate()}일 - ${end.getMonth() + 1}월 ${end.getDate()}일`
})

const handleStartChange = () => {
  // 시작일 변경 시 종료일이 시작일보다 이전이면 초기화
  if (endDate.value && new Date(endDate.value) < new Date(startDate.value)) {
    endDate.value = ''
    totalDays.value = 0
  } else if (endDate.value) {
    calculateTotalDays()
  }
}

const calculateTotalDays = () => {
  if (startDate.value && endDate.value) {
    const start = new Date(startDate.value)
    const end = new Date(endDate.value)
    const diffTime = end - start
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 // +1 for inclusive
    totalDays.value = diffDays
  }
}

const goPrev = () => {
  router.push('/draw/first')
}

const goNext = () => {
  if (!startDate.value || !endDate.value) {
    alert('날짜를 모두 선택해주세요!')
    return
  }

  if (new Date(endDate.value) < new Date(startDate.value)) {
    alert('종료일이 시작일보다 빠릅니다!')
    return
  }

  // 날짜 정보를 localStorage에 저장
  const dateInfo = {
    startDate: startDate.value,
    endDate: endDate.value,
    days: totalDays.value
  }
  
  localStorage.setItem('planDates', JSON.stringify(dateInfo))
  
  console.log('날짜 정보 저장:', dateInfo)
  
  // ThirdDraw로 이동
  router.push('/draw/third')
}
</script>

<style scoped>
.card {
  background: white;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #0A0A0A;
}

.card-subtitle {
  color: #4A5565;
  font-size: 15px;
}

.date-grid {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 16px;
  margin-top: 24px;
}

.date-input {
  display: flex;
  flex-direction: column;
}

.date-input label {
  display: block;
  font-size: 14px;
  margin-bottom: 8px;
  color: #4A5565;
  text-align: left;
  font-weight: 500;
}

.date-input input {
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 15px;
  outline: none;
  transition: 0.2s;
  min-width: 160px;
}

.date-input input:focus {
  border-color: #155DFC;
  box-shadow: 0 0 0 2px rgba(21, 93, 252, 0.1);
}

.tilde {
  font-size: 20px;
  color: #4A5565;
  margin: 0 8px;
  padding-bottom: 8px;
}

.date-summary {
  margin-top: 16px;
  padding: 16px;
  background: #EFF6FF;
  border-radius: 10px;
  text-align: center;
}

.date-summary p {
  margin: 4px 0;
  color: #364153;
  font-size: 15px;
}

.days {
  color: #155DFC;
  font-weight: 600;
  font-size: 16px;
  margin-top: 8px !important;
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
</style>