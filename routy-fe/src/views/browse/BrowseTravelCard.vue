<template>
  <div class="travel-card">
    
    <!-- ===== 썸네일 영역 ===== -->
    <div class="map-image">

      <!-- 리뷰 이미지가 있을 때 -->
      <div class="thumb-img-wrapper" v-if="reviewImages.length > 0">
        <div 
          class="thumb-bg" 
          :style="{
            backgroundImage: `url('${reviewImages[0]}')`
          }"
        ></div>
      </div>

      <!-- 리뷰 이미지가 없을 때 기본 이미지 -->
      <div class="thumb-img-wrapper" v-else>
        <div 
          class="thumb-bg"
          style="background-image: url('https://routy-service.s3.ap-northeast-2.amazonaws.com/default-images/default-plan.png')"
        ></div>
      </div>

    </div>

    <!-- ===== 카드 콘텐츠 ===== -->
    <div class="card-content">

      <!-- 상단 헤더 -->
      <div class="card-header">
        <span class="city-badge">{{ city }}</span>
        <span class="date">{{ date }}</span>
      </div>

      <!-- 제목 -->
      <h3 class="title">{{ title }}</h3>

      <!-- 정보 -->
      <div class="info-row">
        <div class="info-item">
          <span class="info-icon">👤</span>
          <span class="info-text">{{ user }}</span>
        </div>

        <div class="info-item">
          <img src="@/assets/images/icons/calendar.svg" class="icon" />
          <span class="info-text">{{ days }}</span>
        </div>

        <div class="info-item">
          <img src="@/assets/images/icons/location.svg" class="icon" />
          <span class="info-text">
            {{ destination }}
            <span class="sub-info">{{ places }}개 일정</span>
          </span>
        </div>
      </div>

      <!-- 구분선 -->
      <div class="stats-divider"></div>

      <!-- 통계 -->
      <div class="stats-row">
        <div class="stat-group">
          <img src="@/assets/images/icons/heart.svg" class="icon" />
          <span class="stat-value">{{ formatNumber(likes) }}</span>
        </div>

        <div class="stat-group">
          <img src="@/assets/images/icons/view.svg" class="icon" />
          <span class="stat-value">{{ formatNumber(views) }}</span>
        </div>

        <div class="stat-group">
          <img src="@/assets/images/icons/bookmark.svg" class="icon" />
          <span class="stat-value">{{ formatNumber(shares) }}</span>
        </div>
      </div>

    </div>

  </div>
</template>


<script setup>
const props = defineProps({
  city: String,
  date: String,
  title: String,
  user: String,
  days: [String, Number],
  places: Number,
  likes: Number,
  views: Number,
  shares: Number,
  destination: String,
  reviewImages: {
    type: Array,
    default: () => [],
  }
});


const formatNumber = (num) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace('.0', '') + 'k';
  }
  return num.toString();
};
</script>

<style scoped>
.travel-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid #f3f4f6;
}

.travel-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.12);
}

/* ===== 지도 이미지 영역 (배경 레이어) ===== */
.map-image {
  width: 100%;
  height: 180px;
  position: relative;
  overflow: hidden;

  /* 🌈 항상 가장 아래 레이어 */
  background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 50%, #e9d5ff 100%);
  z-index: 0;
}

/* ===== 기본 또는 리뷰 이미지 wrapper (중간 레이어) ===== */
.thumb-img-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  /* 🌟 gradient 위에 올라옴 */
  z-index: 1;
}

/* ===== 실제 이미지 영역 (최상단 레이어) ===== */
.thumb-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  background-size: cover;
  background-position: center;

  /* 🌟 이미지가 가장 앞에 보여야 함 */
  z-index: 2;
}

/* ====== 기본 SVG 아이콘 ===== */
.map-icon {
  width: 80px;
  height: 80px;
  opacity: 0.5;
  z-index: 0;
}

/* ===== 카드 내용 ===== */
.card-content { padding: 20px; }

.card-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.city-badge {
  background: #eff6ff;
  color: #1e40af;
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 13px;
}

.title {
  font-size: 16px;
  font-weight: 600;
  margin: 14px 0;
  color: #111827;
  line-height: 1.4;

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.info-row {
  display: flex;
  gap: 12px;
  margin-bottom: 14px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #6b7280;
}

.stats-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, #e5e7eb 50%, transparent 100%);
  margin: 14px 0;
}

.stats-row {
  display: flex;
  justify-content: space-around;
}

.stat-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.sub-info {
  color: #6b7280;
  font-size: 0.9em;
  margin-left: 4px;
}
</style>
