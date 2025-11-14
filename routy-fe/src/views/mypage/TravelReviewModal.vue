<template>
  <div class="overlay" @click.self="closeModal">
    <div class="review-modal">
      <!-- 헤더 -->
      <div class="modal-header">
        <h2>{{ travelTitle }}</h2>
        <button class="close-btn" @click="closeModal">×</button>
      </div>

      <!-- 공개 설정 (true=공개/false=비공개) -->
      <div class="section visibility-toggle">
        <label>공개 설정</label>
        <div class="toggle-row">
          <span>{{ isPublic ? "🌍 공개" : "🔒 비공개" }}</span>
          <label class="switch">
            <input
              type="checkbox"
              :checked="isPublic"
              @change="onTogglePublic"
              :disabled="isTogglingPublic || isUploading"
            />
            <span class="slider"></span>
          </label>
        </div>
        <small class="desc">공개 시 다른 사용자들이 내 일정을 볼 수 있어요.</small>
      </div>

      <!-- 리뷰 작성 -->
      <div class="section">
        <label>리뷰 작성</label>
        <textarea
          v-model="review"
          placeholder="여행에 대한 간략한 후기를 작성해주세요"
        ></textarea>
      </div>

      <!-- 사진 추가 -->
      <div class="section">
        <div class="photo-header">
          <span>사진 추가 (최대 8장)</span>
          <span>{{ previewImages?.length || 0 }}/8</span>
        </div>
        <input type="file" multiple accept="image/*" @change="onFileChange" :disabled="isUploading" />
        <div class="photo-preview">
          <div v-if="!previewImages?.length" class="photo-placeholder">
            <p>여행 사진을 추가해주세요</p>
            <small>최대 8장까지 업로드 가능합니다</small>
          </div>
          <div v-else class="photo-list">
            <div
              v-for="(img, i) in previewImages"
              :key="i"
              class="photo-item"
            >
              <img :src="img.url" />
              <button class="remove-btn" @click="removeNewFile(i)" :disabled="isUploading">×</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 별점 평가 -->
      <div class="section">
        <label>별점 평가 (10점 만점)</label>
        <div class="stars">
          <img
            v-for="i in 5"
            :key="i"
            class="star-img"
            :src="getStarImage(i)"
            @mousemove="handleStarHover($event, i)"
            @mouseleave="hoverRating = 0"
            @click="confirmRating($event, i)"
          />
          <span class="score">{{ displayRating }}/10점</span>
        </div>
      </div>

   <div
        class="itinerary-section"
        v-if="computedDayList?.length"
      >
        <h3 class="section-title">상세 일정</h3>

        <!-- Day 탭 -->
        <div class="day-tabs">
          <button
            v-for="day in computedDayList"
            :key="day.dayNo"
            class="day-tab"
            :class="{ active: selectedDay === day.dayNo }"
            @click="selectedDay = day.dayNo"
          >
            Day {{ day.dayNo }}
            <span class="place-count">{{ day.activities?.length || 0 }}</span>
          </button>
        </div>

        <!-- 장소 목록 -->
        <div class="places-list" v-if="selectedDayActivities?.length">
          <div
            v-for="(activity, idx) in selectedDayActivities"
            :key="activity.travelId ?? idx"
            class="place-item"
          >
            <div class="place-number">
              <span class="number">{{ idx + 1 }}</span>
              <div
                v-if="idx < selectedDayActivities.length - 1"
                class="connector"
              ></div>
            </div>

            <div class="place-details">
              <div class="place-header">
                <div class="place-name-wrapper">
                  <span class="place-name">{{ activity.placeName }}</span>
                  <span v-if="activity.tag" class="place-tag">{{ activity.tag }}</span>
                </div>
              </div>

              <div class="place-address">
                <span class="address-icon">📍</span>
                {{ activity.addressName }}
              </div>

              <!-- 더 보기 버튼 -->
              <div class="place-footer">
                <a
                  :href="activity.placeUrl"
                  target="_blank"
                  rel="noreferrer"
                  class="btn-more"
                >
                  더 보기 →
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- 선택된 Day에 장소가 없을 때 -->
        <div class="no-places" v-else>
          선택된 Day에 등록된 장소가 없어요.
        </div>
      </div>
      <!-- 버튼 영역 -->
      <div class="modal-footer">
        <button class="btn-cancel" @click="closeModal" :disabled="isUploading || isTogglingPublic">닫기</button>
        <button class="btn-submit" :disabled="!review || isUploading" @click="submitReview">
          {{ isUploading ? "업로드 중..." : "리뷰 등록하기" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import apiClient from "@/utils/axios";
import starFull from "@/assets/images/icons/star.png"
import starHalf from "@/assets/images/icons/star-half.png"
import starEmpty from "@/assets/images/icons/star-empty.png"

const objectUrls = new Set();

/** =========================
 * props & emits
 * ======================= */
const props = defineProps({
  planId: { type: Number, required: true },
  title:  { type: String, default: "" },
  // 부모(상세 페이지)에서 내려줄 수 있는 초기 공개 상태 (true=공개, false=비공개)
   isPublicInitial: { type: Boolean, default: null },
    dayList: { type: Array, default: () => [] }
});
const emit = defineEmits(["close", "saved", "public-changed"]);

/** =========================
 * 기본 상태
 * ======================= */
const travelTitle = ref(props.title || "여행 리뷰");
const review = ref("");
const rating = ref(0);
const hoverRating = ref(0);
const isLocked = ref(false);
const displayRating = computed(() =>
  isLocked.value ? rating.value : (hoverRating.value || rating.value)
);

const previewImages = ref([]); // { url, existing: bool }
const newFiles = ref([]);
const reviewId = ref(null);

const isPublic = ref(false);          // true=공개(0), false=비공개(1)
const isTogglingPublic = ref(false);  // 공유 토글 중 잠금
const isUploading = ref(false);       // 리뷰/이미지 업로드 중 잠금
const selectedDay = ref(null);
const internalDayList = ref([]); // 폴백 조회로 채우는 dayList
const computedDayList = computed(() => {
  return (props.dayList && props.dayList.length) ? props.dayList : internalDayList.value;
});
const selectedDayActivities = computed(() => {
  const day = computedDayList.value?.find(d => d.dayNo === selectedDay.value);
  return day?.activities || [];
});
function initSelectedDay() {
  if (computedDayList.value?.length) {
    selectedDay.value = computedDayList.value[0].dayNo;
  } else {
    selectedDay.value = null;
  }
}
watch(() => props.dayList, () => initSelectedDay(), { immediate: true });

/** =========================
 * 서버에서 기존 리뷰/공개상태 불러오기
 * ======================= */
const fetchReviewForm = async () => {
  try {
    const { data } = await apiClient.get(`/api/plans/${props.planId}/reviews/form`);

    travelTitle.value = props.title || data.planTitle || "여행 리뷰";
    review.value = data.content || "";
    rating.value = data.rating || 0;
    reviewId.value = data.reviewId || null;

    // previewImages.value = (data.files || []).map((f) => ({
    //   url: f.url,
    //   existing: true,
    // }));
    // 리뷰 폼의 파일은 ReviewFileDTO(filePath)에 S3 URL이 있음
   previewImages.value = (data.files || [])
     .filter(f => !!(f?.filePath))
     .map((f) => ({
       url: f.filePath,
       existing: true,
     }));

    // 1순위: 부모에서 내려준 초기값 사용
    if (props.isPublicInitial !== null) {
      isPublic.value = props.isPublicInitial;
      return;
    }

    // 2순위: reviews/form 응답의 공개 필드 사용
    const raw = data.isPublic ?? data.is_public; // 0 or 1
    if (raw === 0 || raw === 1) {
      isPublic.value = Number(raw) === 0;
      return;
    }

    // 3순위: Plan 단건 조회로 보정
    const planRes = await apiClient.get(`/api/plans/${props.planId}`);
    const pRaw = planRes.data?.isPublic ?? planRes.data?.is_public;
    isPublic.value = Number(pRaw) === 0;
  } catch (e) {
    console.error("❌ 리뷰 폼 불러오기 실패:", e);
  }
};

/** =========================
 * 공개/비공개 토글
 * ======================= */
async function onTogglePublic(e) {
  if (isTogglingPublic.value || isUploading.value) return;

  const prev = isPublic.value;
  const next = e.target.checked; // 사용자의 의도

  // 낙관적 업데이트
  isPublic.value = next;
  isTogglingPublic.value = true;

  try {
    await apiClient.patch(`/api/plans/${props.planId}/public`);

     const planRes = await apiClient.get(`/api/plans/${props.planId}`);
    console.log("📦 planRes.data =", planRes.data);
    // 재조회 없이 next로 확정
    isPublic.value = next;
    emit("public-changed", next);
    alert(next ? "✅ 일정이 공개되었습니다." : "🔒 일정이 비공개로 전환되었습니다.");
  } catch (err) {
    console.error("공유 상태 변경 중 오류:", err);
    alert("공유 상태 변경에 실패했습니다.");
    isPublic.value = prev; // 롤백
  } finally {
    isTogglingPublic.value = false;
  }
}

/** =========================
 * 별점
 * ======================= */
function handleStarHover(e, index) {
  if (isLocked.value) return;

  const rect = e.target.getBoundingClientRect();
  const offsetX = e.clientX - rect.left;
  const ratio = offsetX / rect.width;

  // 별 하나당 2점 (왼쪽 절반 = 1점)
  hoverRating.value = (index - 1) * 2 + (ratio <= 0.5 ? 1 : 2);
}

function confirmRating(e, index) {
  const rect = e.target.getBoundingClientRect();
  const offsetX = e.clientX - rect.left;
  const ratio = offsetX / rect.width;

  rating.value = (index - 1) * 2 + (ratio <= 0.5 ? 1 : 2);
  hoverRating.value = 0;
  isLocked.value = true;
}

function getStarStyle(index) {
  const filled = (hoverRating.value || rating.value) / 2; // 별당 2점 기준
  return {
    color: index <= filled ? "#facc15" : "#d1d5db",
    cursor: "pointer",
  };
}

function getStarClass(index) {
  const current = hoverRating.value || rating.value; // 0~10
  const fullCut = index * 2;             // 이 별이 '가득'이 되려면 필요한 점수
  const halfCut = (index - 1) * 2 + 1;   // 이 별이 '반쪽'이 되려면 필요한 점수

  if (current >= fullCut) return 'full';
  if (current >= halfCut) return 'half';
  return 'empty';
}

/** =========================
 * 파일 업로드
 * ======================= */
function onFileChange(e) {
  const files = Array.from(e.target.files || []);
  for (const file of files) {
    if (previewImages.value.length >= 8) break;
    const url = URL.createObjectURL(file);
    objectUrls.add(url);
    previewImages.value.push({ url, existing: false });
    newFiles.value.push(file);
  }
  e.target.value = "";
}

function removeNewFile(idx) {
  const target = previewImages.value[idx];
  previewImages.value.splice(idx, 1);
  if (!target.existing) {
    // 간단히 동일 인덱스로 제거
    newFiles.value.splice(idx, 1);
  }
}

/** =========================
 * 제출
 * ======================= */
async function submitReview() {
  const formData = new FormData();
  if (reviewId.value) formData.append("reviewId", reviewId.value);
  formData.append("planId", String(props.planId));
  formData.append("content", review.value);
  formData.append("rating", String(Math.round((rating.value || 0) * 10) / 10));
 // UI는 0~10(반개=1점) → 서버는 1~5 (정수)
 const ratingForServer = Math.max(1, Math.min(5, Math.round((rating.value || 0) / 2)));
 formData.append("rating", String(ratingForServer));
  
  newFiles.value.forEach((file) => {
    formData.append("files", file);
  });

  try {
    isUploading.value = true;
    // await apiClient.post(`/api/plans/${props.planId}/reviews`, formData, {
    const { data } = await apiClient.post(`/api/plans/${props.planId}/reviews`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    alert("리뷰가 등록되었습니다!");


   // 업로드 응답(PlanReviewResponseDTO.files)에는 S3 URL 배열이 옴 → 화면 즉시 반영하고 닫기
   if (data?.files?.length) {
     previewImages.value = data.files.map(url => ({ url, existing: true }));
   }

    emit("saved");
    emit("close");
  } catch (e) {
    console.error("❌ 리뷰 등록 실패:", e);
    alert("리뷰 등록 중 오류가 발생했습니다.");
  } finally {
    isUploading.value = false;
  }
}


function closeModal() {
  emit("close");
}

onMounted(async () => {
  // 기존 리뷰/공개상태
  await fetchReviewForm();

  // 부모가 dayList 안줬으면 단건 조회해서 dayList 채움
  if (!props.dayList || props.dayList.length === 0) {
    try {
      const res = await apiClient.get(`/api/plans/${props.planId}`);
      internalDayList.value = res.data?.dayList || [];
    } catch (e) {
      console.error("❌ 일정(dayList) 조회 실패:", e);
    }
  }
  initSelectedDay();
});

//  모달이 닫히거나 컴포넌트가 사라질 때 ObjectURL 정리
 onUnmounted(() => {
   objectUrls.forEach((u) => URL.revokeObjectURL(u));
   objectUrls.clear();
 });

function getStarImage(index) {
  const state = getStarClass(index)

  if (state === "full") return starFull
  if (state === "half") return starHalf
  return starEmpty
}
</script>

<style scoped>
/* ====== 전체 레이아웃 ====== */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.review-modal {
  width: 460px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  padding: 20px;
  position: relative;
  max-height: 85vh;
  overflow-y: auto;
}

/* ====== 헤더 ====== */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 12px;
}
.modal-header h2 {
  font-size: 18px;
  font-weight: 700;
}
.close-btn {
  border: none;
  background: none;
  font-size: 20px;
  cursor: pointer;
}

/* ====== 공통 섹션 ====== */
.section {
  margin-top: 20px;
}
.section label {
  font-size: 14px;
  font-weight: 600;
  display: block;
  margin-bottom: 8px;
}

/* ====== 텍스트박스 ====== */
textarea {
  width: 100%;
  height: 100px;
  border-radius: 8px;
  border: 1px solid #ddd;
  padding: 10px;
  resize: none;
  font-family: inherit;
}

/* ====== 사진 업로드 ====== */
.photo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}
input[type="file"] {
  display: block;
  margin-top: 8px;
}
.photo-preview {
  margin-top: 10px;
  border: 1px solid #ccc;
  border-radius: 10px;
  height: 160px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
.photo-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}
.photo-item {
  position: relative;
}
.photo-item img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
}
.remove-btn {
  position: absolute;
  top: -4px;
  right: -4px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 12px;
  cursor: pointer;
}

.stars {
  display: flex;
  align-items: center;
  gap: 1;
}

.star-img {
  width: 40px;
  height: 40px;
  cursor: pointer;
  user-select: none;
  transition: transform 0.15s ease;
}

.star-img:hover {
  transform: scale(1.1);
}

/* .star {
  position: relative;
  display: inline-block;
  line-height: 1;
  color: #d1d5db; 
  transition: transform 0.15s ease;
} */

/* .star:hover {
  transform: scale(1.1);
} */

/* 가득 채워진 별 */
/* .star.full {
  color: #facc15; 
} */

/* 반쪽 채워진 별 (왼쪽 절반만) */
/* .star.half::before {
  content: '★';
  position: absolute;
  left: 0;
  top: 0;
  width: 50%;
  overflow: hidden;
  color: #facc15;
} */

/* 점수 텍스트 */
.score {
  margin-left: 8px;
  font-size: 14px;
  color: #555;
  font-weight: 500;
}

/* ====== 버튼 ====== */
.modal-footer {
  display: flex;
  gap: 10px;
  margin-top: 24px;
}
.btn-cancel,
.btn-submit {
  flex: 1;
  height: 36px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}
.btn-cancel {
  background: #fff;
  border: 1px solid #ccc;
}
.btn-submit {
  background: #3b82f6;
  color: white;
  border: none;
}
.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ====== 공개 토글 스위치 ====== */
.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: #e5e7eb;
  transition: .2s;
  border-radius: 9999px;
}
.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  top: 3px;
  background-color: white;
  transition: .2s;
  border-radius: 50%;
  box-shadow: 0 1px 2px rgba(0,0,0,.15);
}
input:checked + .slider {
  background: #22c55e;
}
input:checked + .slider:before {
  transform: translateX(20px);
}

.visibility-toggle .toggle-row {
  display: flex; justify-content: space-between; align-items: center;
  margin-top: 6px;
}
.desc { color: #777; font-size: 12px; }

/* 비활성화 시 버튼 기본 스타일 유지 */
.remove-btn:disabled { opacity: .6; cursor: not-allowed; }
.review-modal .itinerary-section {
  margin-top: 24px;
  margin-bottom: 24px;
}

.review-modal .section-title {
  font-size: 16px;
  color: #101828;
  margin: 0 0 16px 0;
}

.review-modal .day-tabs {
  display: flex;
  gap: 0;
  background: #ececf0;
  border-radius: 14px;
  padding: 3px;
  margin-bottom: 24px;
}

.review-modal .day-tab {
  flex: 1;
  padding: 8px 12px;
  background: transparent;
  border: none;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 500;
  color: #0a0a0a;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.review-modal .day-tab.active {
  background: white;
}

.review-modal .place-count {
  background: #155dfc;
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 500;
}

.review-modal .places-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-modal .place-item {
  display: flex;
  gap: 16px;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 14px;
  padding: 20px;
}

.review-modal .place-number {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.review-modal .number {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #2b7fff 0%, #155dfc 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  box-shadow: 0 2px 4px -2px rgba(0, 0, 0, 0.1);
}

.review-modal .connector {
  width: 2px;
  flex: 1;
  background: linear-gradient(180deg, #8ec5ff 0%, #dbeafe 100%);
}

.review-modal .place-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.review-modal .place-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.review-modal .place-name-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.review-modal .place-name {
  font-size: 18px;
  color: #0a0a0a;
}

.review-modal .place-address {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #4a5565;
}

.review-modal .address-icon {
  font-size: 16px;
  color: #2b7fff;
}

.review-modal .place-footer {
  text-align: right;
  margin-top: 6px;
}

.review-modal .btn-more {
  display: inline-block;
  font-size: 14px;
  color: #0066ff;
  text-decoration: none;
  border: 1px solid #0066ff;
  border-radius: 6px;
  padding: 4px 10px;
  transition: all 0.2s;
}

.review-modal .btn-more:hover {
  background-color: #0066ff;
  color: #fff;
}

.review-modal .place-tag {
  display: inline-block;
  background-color: #2563eb;
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  border-radius: 20px;
  padding: 4px 10px;
  margin-left: 8px;
  vertical-align: middle;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.review-modal .no-places {
  padding: 12px;
  border: 1px dashed rgba(0,0,0,0.15);
  border-radius: 8px;
  text-align: center;
  font-size: 13px;
  color: #666;
}
</style>
