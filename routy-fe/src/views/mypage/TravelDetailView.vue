<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import apiClient from '@/utils/axios'
import TravelReviewModal from '@/views/mypage/TravelReviewModal.vue'

const route = useRoute()
const router = useRouter()
const showReviewModal = ref(false)


// 현재 여행 ID
const planId = Number(route.params.id)

// 여행 상세 데이터
const travel = ref(null)

// Day별 확장 상태
const expandedDays = ref([])
const showAll = ref(false)
const visibleCount = ref(3)

// 테마 매핑 함수
const getThemeLabel = (themeCode) => {
  const themeMap = {
    'restaurant': '맛집탐방',
    'cafe': '카페탐방',
    'tourist': '관광지탐방',
  };
  return themeMap[themeCode] || '여행';
};

import themeRestaurant from '@/assets/images/theme/recommend-restaurant.png';
import themeCafe from '@/assets/images/theme/recommend-cafe.png';
import themeTourist from '@/assets/images/theme/recommend-attraction.png';

const getThemeEmoji = (themeCode) => {
  const emojiMap = {
    'restaurant': themeRestaurant,
    'cafe': themeCafe,
    'tourist': themeTourist,
  };
  return emojiMap[themeCode] || '✈️';
};

const getThemeColor = (themeCode) => {
  const colorMap = {
    'restaurant': '#EF44444D', // 기존 빨간색 연하게
    'cafe': '#D977064D',     // 기존 주황색 연하게
    'tourist': '#10B9814D',    // 기존 녹색 연하게
  };
  return colorMap[themeCode] || '#3b82f64D'; // 기본값도 연하게
};

// computed 속성
const themeLabel = computed(() => getThemeLabel(travel.value?.theme));
const themeEmoji = computed(() => getThemeEmoji(travel.value?.theme));
const themeColor = computed(() => getThemeColor(travel.value?.theme));
const loading = ref(true)


// 삭제 버튼 클릭 할 경우
const deletePlan = async () => {
  if (!confirm('정말 삭제하시겠습니까?')) return

  try {
    await apiClient.patch(`/api/plans/${planId}/delete`)
    alert('삭제되었습니다.')
    router.push('/mypage')  
  } catch (err) {
    console.error(err)
    alert('삭제 중 오류가 발생했습니다.')
  }
}

// 백엔드 연동
onMounted(async () => {
  try {
    const res = await apiClient.get(`/api/plans/${planId}`)
    travel.value = res.data || {}
    console.log('여행 데이터:', travel.value)
    console.log('테마:', travel.value.theme)
    const dayList = travel.value.dayList || []
    expandedDays.value = dayList.map(() => false)
  } catch (err) {
    console.error('여행 데이터를 불러오는 중 오류 발생:', err)
  } finally {
    loading.value = false
  }
})

// 페이지 이동
function goToEditPage() {
  router.push(`/mypage/travel/${planId}/edit`)
}

// 일정 접기/펼치기
function toggleDayPlans(index) {
  expandedDays.value[index] = !expandedDays.value[index]
}

// 표시할 일자
function shownPlans(day, index) {
  const acts = day?.activities || []
  if (expandedDays.value[index]) return acts
  return acts.slice(0, 3)
}

// 전체 보기
function toggleMore() {
  const dayList = travel.value?.dayList || []
  showAll.value = !showAll.value
  visibleCount.value = showAll.value ? dayList.length : 3
}

async function handleDelete() {
  const ok = confirm('이 일정을 정말 삭제할까요?')
  if (!ok) return

  try {
    await apiClient.delete(`/api/plans/${planId}`)
    router.push('/mypage')
  } catch (err) {
    console.error('일정 삭제 중 오류 발생:', err)
    alert('삭제에 실패했어요. 잠시 후 다시 시도해주세요.')
  }
}
</script>

<template>
  <div class="travel-detail-wrapper">
    <div v-if="travel" class="travel-detail">
      <div class="content-wrapper">
        <!-- 상단 헤더 -->
        <header class="header">
          <div class="header-left">
            <button class="back-btn" @click="router.push('/mypage')">←</button>
            <div class="title-block">
              <h1>{{ travel.title }}</h1>
              <p>{{ travel.startDate }} - {{ travel.endDate }}</p>
            </div>
          </div>
          <div class="header-right">
            <button class="btn btn-outline-blue" @click="goToEditPage">수정</button>
            <button class="btn delete" @click="deletePlan">삭제</button>
          </div>
        </header>

        <!-- 여행 정보 카드 -->
        <section class="info-card">
          <div class="info-header">
            <!-- 테마 뱃지 수정 -->
            <div class="tag theme" :style="{ background: themeColor }">
              <span>
                <img 
                  :src="themeEmoji" 
                  :alt="themeLabel + ' 아이콘'" 
                  class="theme-icon-badge"/>         
              </span>
              <span>{{ themeLabel }}</span>
            </div>
            <div class="tag status">{{ travel.status }}</div>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <div class="icon-wrap"><i class="fa fa-map-marker-alt"></i></div>
              <div class="text">
                <p class="label">여행지</p>
                <p class="value">{{ travel.destination }}</p>
              </div>
            </div>
            <div class="info-item">
              <!-- 아이콘 색상도 테마 색상 적용 -->
                <div 
                  class="icon-wrap" 
                  :class="`theme-icon-${travel.theme}`"
                  :style="{ background: `${themeColor}20` }"
                >
                <i class="fa fa-leaf" :style="{ color: themeColor }"></i>
              </div>
              <div class="text">
                <p class="label">테마</p>
                <!-- 테마 텍스트 수정 -->
                <p class="value">{{ themeLabel }}</p>
              </div>
            </div>
            <div class="info-item">
              <div class="icon-wrap"><i class="fa fa-calendar-alt"></i></div>
              <div class="text">
                <p class="label">기간</p>
                <p class="value">{{ travel.days }}일 ({{ travel.nights }}박)</p>
              </div>
            </div>
          </div>
        </section>

        <!-- 일정 카드 리스트 -->
        <section class="days-wrap">
          <div
            v-for="(day, index) in travel.dayList.slice(0, visibleCount)"
            :key="day.dayId"
            class="day-card"
          >
            <div class="day-header">
              <div class="circle">{{ day.dayNo }}</div>
              <div class="day-title">
                <h3>Day {{ day.dayNo }}</h3>
                <p>{{ day.date }}</p>
              </div>
            </div>

            <div class="plans">
              <div
                v-for="(plan, i) in shownPlans(day, index)"
                :key="i"
                class="plan"
              >
                <!-- 시간 정보 -->
                <div class="plan-time-row">
                  <span class="plan-order-badge">{{ i + 1 }}</span>
                  <div class="plan-time" v-if="plan.startTime || plan.endTime">
                    <i class="fa fa-clock"></i>
                    <span v-if="plan.startTime && plan.endTime">
                      {{ plan.startTime }} - {{ plan.endTime }}
                    </span>
                    <span v-else-if="plan.startTime">
                      {{ plan.startTime }} ~
                    </span>
                    <span v-else>
                      ~ {{ plan.endTime }}
                    </span>
                  </div>
                </div>

                <!-- 장소명과 카테고리 -->
                <div class="plan-header">
                  <div class="plan-title">{{ plan.placeName }}</div>
                  <div class="plan-category-badge" v-if="plan.tag || plan.categoryGroupName">
                    {{ plan.tag || plan.categoryGroupName }}
                  </div>
                </div>

                <!-- 주소와 상세보기 -->
                <div class="plan-address-row" v-if="plan.addressName || plan.placeUrl">
                  <div class="plan-address" v-if="plan.addressName">
                    <i class="fa fa-map-marker-alt"></i>
                    {{ plan.addressName }}
                  </div>
                  <div class="plan-link" v-if="plan.placeUrl">
                    <a :href="plan.placeUrl" target="_blank">상세 보기</a>
                  </div>
                </div>
              </div>

              <div
                v-if="day.activities.length > 3"
                class="more-activities"
                @click="toggleDayPlans(index)"
              >
                <span v-if="!expandedDays[index]">+{{ day.activities.length - 3 }}개 활동 더 보기</span>
                <span v-else>접기</span>
              </div>
            </div>
          </div>

          <div class="load-more" v-if="travel.dayList.length > 3">
            <button
              class="btn btn-outline-blue"
              @click="toggleMore"
            >
              {{ showAll ? '접기' : `더 보기 (${travel.dayList.length - visibleCount}일 남음)` }}
            </button>
          </div>
        </section>
      </div>
    </div>

    <!-- Teleport 사용하여 모달을 body로 이동 -->
    <Teleport to="body">
      <TravelReviewModal
        v-if="showReviewModal"
        :plan-id="planId"
        :title="travel?.title"
        @close="showReviewModal = false"
        @saved="() => { showReviewModal = false; }"
      />
    </Teleport>
  </div>
</template>
<style scoped>
.travel-detail {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(148deg, #eff6ff 0%, white 50%, #f0fdf4 100%);
  display: flex;
  justify-content: center;
  padding: 60px 0 100px;
}

.travel-detail > .content-wrapper {
  width: 1120px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.header {
  height: 72px;
  background: rgba(255, 255, 255, 0.8);
  border-bottom: 0.8px solid rgba(229, 231, 235, 0.5);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 32px;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  margin-bottom: 12px;
}

.header-left { 
  display: flex; 
  align-items: center; 
}

.header-right { 
  display: flex; 
  gap: 10px; 
}

.btn {
  border-radius: 8px;
  padding: 8px 18px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-outline-blue { 
  border: 1.5px solid #3b82f6; 
  color: #3b82f6; 
  background: white; 
}

.btn-outline-blue:hover {
  background: #3b82f6;
  color: white;
}

.btn.delete {
  color: #ff4d4f; 
  border: 1.5px solid #ff4d4f; 
  background: white;
}

.btn.delete:hover {
  background: #ff4d4f;
  color: white;
}
/* 정보 카드 - 전체 레이아웃 조정 */
.info-card {
  background: #fff;
  box-shadow: 0 4px 6px -4px rgba(0,0,0,0.05);
  border-radius: 16px;
  padding: 24px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border: 1px solid rgba(229, 231, 235, 0.5);
}

/* 헤더 영역 - 테마 뱃지 크기 유지 */
.info-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tag.theme {
  background: #3b82f6;
  color: rgb(0, 0, 0);
  border-radius: 9999px;
  padding: 10px 18px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
}

.theme-icon-badge {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.tag.status {
  background: #10b981;
  color: white;
  font-size: 12px;
  font-weight: 500;
  padding: 5px 12px;
  border-radius: 8px;
}

/* 정보 그리드 - 작게 조정 */
/* 정보 그리드 - 균등 간격 */
.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3등분 */
  gap: 32px; /* 균등한 간격 */
  padding: 20px 40px;
  border-radius: 12px;
  background: #f9fafb;
  border: 1px solid #f0f0f0;
  align-items: center;
}

.info-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  text-align: left;
  justify-content: flex-start; /* 왼쪽 정렬 */
}


/* 아이콘 래퍼 - 작게 조정 */
.icon-wrap {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #e0f2fe;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.icon-wrap i {
  color: #3b82f6;
  font-size: 18px;
  position: relative;
  z-index: 1;
}

/* 아이콘 이미지 추가 */
.icon-wrap::before {
  content: '';
  position: absolute;
  width: 24px;
  height: 24px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  z-index: 2;
}

/* 여행지 아이콘 */
.info-item:nth-child(1) .icon-wrap::before {
  background-image: url('@/assets/images/icons/location.svg');
}

/* 테마 아이콘 - 동적으로 변경 필요 (아래 template 수정) */
.info-item:nth-child(2) .icon-wrap.theme-icon-restaurant::before {
  background-image: url('@/assets/images/theme/restaurant.png');
}

.info-item:nth-child(2) .icon-wrap.theme-icon-cafe::before {
  background-image: url('@/assets/images/theme/cafe.png');
}

.info-item:nth-child(2) .icon-wrap.theme-icon-tourist::before {
  background-image: url('@/assets/images/theme/arrtraction.png');
}

/* 기간 아이콘 */
.info-item:nth-child(3) .icon-wrap::before {
  background-image: url('@/assets/images/icons/calendar.svg');
}

/* 아이콘이 있을 때 Font Awesome 숨기기 */
.icon-wrap::before + i {
  display: none;
}

/* 텍스트 영역 - 크기 조정 */
.text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
}

.text .label {
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
  font-weight: 500;
}

.text .value {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.days-wrap {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px 28px;
}

.day-card {
  background: rgba(255,255,255,0.9);
  border-radius: 14px;
  box-shadow: 0 4px 6px -4px rgba(0,0,0,0.1);
  border: 0.8px solid rgba(96,165,250,0.2);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
}

.day-header {
  background: #3b82f6;
  color: white;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.circle {
  width: 42px;
  height: 42px;
  background: rgba(255,255,255,0.25);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
  color: white;
  margin-right: 4px;
}

.day-header h3 { 
  font-size: 16px; 
  margin: 0; 
}

.day-header p { 
  font-size: 14px; 
  color: rgba(255,255,255,0.8); 
  margin: 0; 
}

.plans {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: all 0.3s ease-in-out;
}

.plan {
  background: #f9fafb;
  border-radius: 10px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}

.plan:hover { 
  background: #f1f5f9; 
}

/* 시간 표시 스타일 */
/* ✅ 일정 번호와 시간을 한 줄에 */
.plan-time-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* ✅ 일정 번호 뱃지 */
.plan-order-badge {
  color: #6b7280;
  font-weight: 600;
  font-size: 12px;
  padding: 5px 10px;
  background: #f3f4f6;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  white-space: nowrap;
  flex-shrink: 0;
}

/* 시간 박스 (별도 테두리) */
.plan-time {
  color: #3b82f6;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  background: rgba(59, 130, 246, 0.08);
  border-radius: 6px;
  border: 1px solid rgba(59, 130, 246, 0.2);
  flex-shrink: 0;
}
/* 일정 번호 스타일 */
.plan-order {
  color: #6b7280;
  font-weight: 600;
  font-size: 11px;
  margin-right: 4px;
  padding-right: 8px;
  border-right: 1px solid rgba(107, 114, 128, 0.2);
}

/* 장소명과 카테고리 한 줄 배치 */
.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 2px;
   padding-left: 6px; /* 아이콘 너비만큼 들여쓰기 */
}

.plan-title {
  color: #101828;
  font-size: 15px;
  font-weight: 700;
  flex: 1;
  min-width: 0;
}

/* 카테고리 뱃지 스타일 */
.plan-category-badge {
  background: #f3f4f6;
  color: #6b7280;
  font-size: 11px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 12px;
  white-space: nowrap;
  flex-shrink: 0;
}

/* 주소와 상세보기 한 줄 배치 */
.plan-address-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.plan-address {
  color: #6a7282;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.plan-link { 
  flex-shrink: 0;
}

.plan-link a {
  font-size: 12px;
  color: #3b82f6;
  text-decoration: none;
  white-space: nowrap;
}

.plan-link a:hover { 
  text-decoration: underline; 
}

.more-activities {
  margin-top: 10px;
  text-align: center;
  color: #3b82f6;
  font-size: 13px;
  padding: 10px 0;
  border-top: 1px solid rgba(59,130,246,0.15);
  background: rgba(59,130,246,0.05);
  cursor: pointer;
  border-bottom-left-radius: 14px;
  border-bottom-right-radius: 14px;
  transition: background 0.2s, color 0.2s;
}

.more-activities:hover {
  background: rgba(59,130,246,0.1);
  color: #2563eb;
}

.more-activities span {
  display: inline-block;
  font-weight: 500;
  letter-spacing: 0.2px;
}

.load-more {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.load-more button {
  border-radius: 8px;
  padding: 8px 16px;
  border: 1px solid #3b82f6;
  background: white;
  color: #3b82f6;
  cursor: pointer;
  font-size: 14px;
}

.load-more button:hover { 
  background: #eff6ff; 
}

.back-btn {
  border: none;
  background: none;
  font-size: 20px;
  color: #3b82f6;
  cursor: pointer;
  flex-shrink: 0;
  transition: color 0.2s;
}

.back-btn:hover { 
  color: #2563eb; 
}

.title-block {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: 10px;
}

.title-block h1 {
  font-size: 18px;
  font-weight: 700;
  color: #101828;
  margin: 0;
}

.title-block p {
  font-size: 14px;
  color: #6a7282;
  margin: 2px 0 0;
}
</style>