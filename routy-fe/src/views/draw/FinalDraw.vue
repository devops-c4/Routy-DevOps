<template>
  <div class="step-container">
    <div class="step-content full-layout">
      <!-- 상단 헤더 -->
      <header class="top-bar">
        <div class="back-btn" @click="goPrev">← 이전</div>
        <div class="arrive-time">{{ startLocation.name }} 출발 ({{ startLocation.type }})</div>
      </header>

      <div class="main-layout" :class="{ 'blurred': showHotelModal }">
        <!-- 왼쪽 패널 -->
        <aside class="left-panel">
          <div class="left-actions">
            <button class="top-btn" @click="endDaySchedule">{{ selectedDay }} 일차 일정 종료</button>
              
              <div class = "middle-btns">
                <button 
                  class="left-btn" 
                  @click="drawRoute"
                  :disabled="isDayCompleted"
                  title="현재 선택한 장소들을 따라 루트를 지도에 그립니다."
                >루트 그리기</button>

                <button 
                  class="left-btn" 
                  @click="drawSort"
                  :disabled="isDayCompleted || isLoading"
                  title="고정된 장소를 제외한 장소의 최소의 이동시간이 되도록 재배치합니다.">            
                  <span v-if="isLoading">정렬 중...</span>
                  <span v-else>루트 정렬</span>
                </button>
              </div>
            <!-- 로딩 스피너 -->
            <div v-if="isLoading" class="loading-overlay">
              <div class="spinner"></div>
              <p>루트의 최소 이동시간을 위해 자동 정렬 중입니다. 잠시만 기다려주세요...</p>
            </div>
          </div>

          <div class="empty-guide" v-if="selectedPlaces.length === 0">
            오른쪽에서 장소를 추가해주세요
          </div>

          <!-- 선택된 리스트 영역 -->
          <div v-else class="selected-list">
            <draggable
              :list="placesByDay[selectedDay] || []"
              item-key="title"
              animation="200"
              ghost-class="drag-ghost"
              handle=".drag-handle"
              :move="onDragMove"
              :disabled="isDayCompleted"
            >
              <template #item="{ element, index }">
                <div class="selected-card" :class="{ fixed: element.fixed, hotel: element.isHotel, completed: isDayCompleted }" @click="highlightPlace(element)">
                  <div class="drag-section">
                    <span class="day-badge-top">루트 {{ index + 1 }}</span>
                    <div class="drag-handle" :class="{ disabled: element.fixed || isDayCompleted }">⋮⋮</div>
                  </div>
                  
                  <div class="card-content">
                    <div class="card-header">
                      <div class="title-section">
                        <span class="card-title">{{ element.title }}</span>
                        <span v-if="element.isHotel" class="hotel-badge">숙소</span>
                      </div>
                      <div class="card-category">{{ getLastCategory(element.description || element.categoryGroupName) }}</div>
                    </div>
                    
                    <!-- 시간 입력 버튼 -->
                    <div class="time-toggle-section">
                      <button 
                        class="time-toggle-btn" 
                        @click.stop="toggleTimeInput(element)"
                        :disabled="isDayCompleted"
                      >
                        <span v-if="!element.showTimeInput">시간 입력</span>
                        <span v-else>접기</span>
                      </button>
                      
                      <!-- 시간 표시 (입력된 경우) -->
                      <div v-if="element.startTime && element.endTime && !element.showTimeInput" class="time-display">
                        {{ element.startTime }} ~ {{ element.endTime }}
                      </div>
                    </div>

                    <!-- 시간 입력 필드 (펼쳤을 때만 표시) -->
                    <div v-if="element.showTimeInput" class="time-input-container">
                      <div class="time-input-row">
                        <label class="time-label">시작</label>
                        <input 
                          type="time" 
                          v-model="element.startTime"
                          class="time-input"
                          :disabled="isDayCompleted"
                          @change="updatePlaceTime(element)"
                        />
                      </div>
                      <div class="time-input-row">
                        <label class="time-label">종료</label>
                        <input 
                          type="time" 
                          v-model="element.endTime"
                          class="time-input"
                          :disabled="isDayCompleted"
                          @change="updatePlaceTime(element)"
                        />
                      </div>
                    </div>
                    
                    <div class="card-actions">
                      <button class="action-btn fix-btn" :class="{ active: element.fixed }" @click="toggleFix(element)" :disabled="isDayCompleted">
                        고정
                      </button>
                      <button class="action-btn remove-btn" @click="removePlace(element)" :disabled="isDayCompleted">빼기</button>
                    </div>
                  </div>
                </div>
              </template>
            </draggable>
          </div>

          <!-- 일차 전환 -->
          <div class="day-control">
            <div class="day-buttons">
              <button class="day-btn gray" :disabled="selectedDay === 1" @click="goPrevDay">이전</button>
              <span class="day-label">{{ selectedDay }}일차</span>
              <button class="day-btn gray" :disabled="selectedDay === durations.length" @click="goNextDay">다음</button>
            </div>

            <div class="day-numbers">
              <button
                v-for="(d, i) in durations"
                :key="d.durationId"
                class="day-number"
                :class="{ active: selectedDay === d.day }"
                @click="selectDay(d.day)"
              >
                {{ d.day }}
              </button>
            </div>
          </div>
        </aside>

        <!-- 중앙 지도 -->
        <section class="map-section">
          <div class="map-box main-map">
            <div class="map-header">
              <div class="map-title">추천 장소 지도</div>
              <div class="map-legend">
                <span><i class="dot purple"></i> 맛집</span>
                <span><i class="dot brown"></i> 카페</span>
                <span><i class="dot green"></i> 관광지</span>
                <span><i class="dot yellow"></i> 숙소</span>
              </div>
            </div>
            <div class="map-canvas" ref="mapContainer"></div>
          </div>
        </section>

        <!-- 오른쪽 패널 -->
        <aside class="right-panel">
         <div class="search-header">
  <div class="search-left">
    <span class="search-title">검색</span>
    <input
      v-model="searchKeyword"
      class="search-input"
      type="text"
      placeholder="장소 이름, 키워드 검색"
      @keyup.enter="searchByKeyword"
    />
    <button
      class="search-btn"
      @click="searchByKeyword"
    >
      검색
    </button>
  </div>

  <button 
    class="hotel-btn"
    :class="{ active: showHotelModal }"
    @click="openHotelModal" 
    :disabled="isDayCompleted"
  >
    숙소 선택
  </button>
</div>
        <!-- 테마 추천 섹션 -->
<div v-if="selectedTheme && themeRecommendations.length > 0" class="theme-section">
  <div class="section-header" @click="toggleTheme">
    <div class="header-left">
      <h3>{{ startLocation.name }} 추천 TOP {{ themeRecommendations.length }}</h3>
      <span class="badge">{{ themeNames[selectedTheme] }}</span>
    </div>
    <button class="toggle-btn">
      {{ isThemeExpanded ? '▲' : '▼' }}
    </button>
  </div>
  
  <div v-if="isLoadingTheme" class="loading-theme">
    로딩 중...
  </div>
  
  <div v-show="isThemeExpanded && !isLoadingTheme" class="theme-place-list">
    <div 
      v-for="(place, index) in themeRecommendations" 
      :key="index"
      class="theme-place-card"
      @click="highlightPlace(place)"
      :class="{ active: selectedPlace && selectedPlace.title === place.title }"
    >
      <div class="rank-badge">{{ index + 1 }}</div>
      <div class="place-icon">
      <img :src="getThemeIcon(place.categoryCode)" class="theme-img" />
      </div>
      <div class="theme-place-info">
        <h4 class="theme-place-name">{{ place.title }}</h4>
        <p class="theme-category">{{ place.categoryGroupName }}</p>
        <p class="theme-address">{{ place.addressName }}</p>
      </div>
      <button class="add-btn" @click.stop="addPlace(place)" :disabled="isDayCompleted">
        추가
      </button>
    </div>
  </div>
</div>

          <div class="filter-bar">
            <button
              class="filter-btn"
              :class="{ active: currentType === 'restaurants' }"
              @click="loadPlaces('restaurants')"
            >맛집</button>
            <button
              class="filter-btn"
              :class="{ active: currentType === 'cafes' }"
              @click="loadPlaces('cafes')"
            >카페</button>
            <button
              class="filter-btn"
              :class="{ active: currentType === 'attractions' }"
              @click="loadPlaces('attractions')"
            >관광지</button>
          </div>

          <div class="place-list" ref="placeListContainer">
            <div
              v-for="(p, i) in places"
              :key="i"
              :ref="el => { if (el) placeCardRefs[p.title] = el }"
              class="place-card"
              @click="highlightPlace(p)"
              :class="{ active: selectedPlace && selectedPlace.title === p.title }"
            >
              <!-- 이미지 추가 -->
              <div class="place-image-wrapper">
                <img 
                  v-if="p.imageUrl"
                  :src="p.imageUrl"
                  :alt="p.title"
                  class="place-image"
                  @error="handleImageError($event, p)"
                />
                <div v-else class="place-image-placeholder">
                  <span class="placeholder-icon">
                    <img :src="getCategoryIcon(p.categoryCode)" class="category-img" />
                  </span>
                </div>
              </div>

              <div class="place-info">
                <div class="place-name">{{ p.title }}</div>
                <div class="place-address">{{ p.addressName }}</div>
                <div class="place-meta">
                  <span>{{ getLastCategory(p.description) }}</span>
<button class="detail-btn" @click.stop="openKakaoModal(p)">상세보기</button>
                </div>
              </div>
              <button class="add-btn" @click="addPlace(p)" :disabled="isDayCompleted">추가</button>
            </div>
          </div>

          <div class="save-section">
            <button class="save-btn" @click="saveAllDaysPlaces">일정 저장</button>
          </div>
        </aside>
      </div>
    </div>
  </div>

  <!-- 숙소 모달 -->
  <div v-if="showHotelModal" class="hotel-modal-overlay">
    <div class="hotel-modal">
      <div class="hotel-header">
        <h3>숙소 선택</h3>
        <button class="close-btn" @click="closeHotelModal">✕</button>
      </div>

      <div class="hotel-body">
        <div class="hotel-list">
          <div
            v-for="(hotel, i) in hotels"
            :key="i"
            class="hotel-card"
            @click="focusHotelOnMap(hotel)"
          >
            <div class="hotel-info">
              <div class="hotel-name">{{ hotel.title }}</div>
              <div class="hotel-address">{{ hotel.addressName }}</div>
              <a
                :href="hotel.placeUrl"
                target="_blank"
                style="color:#155DFC; text-decoration:none;font-size:13px;"
              >지도보기</a>
            </div>
            <button class="add-btn" @click.stop="addHotel(hotel)">선택</button>
          </div>
        </div>
      </div>
    </div>
  </div>
<!-- 카카오맵 상세보기 모달 추가 -->
<div v-if="showKakaoModal" class="kakao-modal-overlay" @click="closeKakaoModal">
  <div class="kakao-modal" @click.stop>
    <div class="kakao-header">
      <h3>{{ selectedPlaceForKakao?.title || '장소 상세보기' }}</h3>
      <button class="close-btn" @click="closeKakaoModal">✕</button>
    </div>
    <div class="kakao-body">
      <iframe 
        :src="selectedPlaceForKakao?.placeUrl" 
        class="kakao-iframe"
        frameborder="0"
      ></iframe>
    </div>
  </div>
</div>
  <!-- 변경 모달 -->
  <div v-if="showSortModal" class="sort-modal-overlay">
    <div class="sort-modal">
      <div class="sort-header">
        <h3>정렬 미리보기</h3>
        <button class="close-btn" @click="cancelSortPreview">✕</button>
      </div>

      <!-- 본문 -->
      <div class="sort-body">
        <div class="curr-list">
          <div class="list-title">정렬 전</div>
          <div 
            v-for="(place, i) in placesByDay[selectedDay]" 
            :key="i" 
            class="sort-card"
            :class="{ 'fix-card': place.fixed, 'hovered': hoveredPlaceUrl === place.placeUrl && !place.fixed}"
              @mouseenter="hoveredPlaceUrl = place.placeUrl"
              @mouseleave="hoveredPlaceUrl = null">
            <div class="sort_info">
              <div class="sort-name">{{ place.title }}</div>
              <div class="sort-category">{{ place.description }}</div>
              <a 
                :href="place.placeUrl"
                target="_blank"
                style="color:#155DFC; text-decoration:none;font-size:13px;"
              >지도보기</a>
            </div>
          </div>
        </div>
        <div class="sort-list">
          <div class="list-title">정렬 후</div>
          <div
            v-for="(place, i) in previewSorted"
            :key="i"
            class="sort-card"
            :class="{ 'fix-card': place.fixed, 'hovered': hoveredPlaceUrl === place.placeUrl && !place.fixed}"
              @mouseenter="hoveredPlaceUrl = place.placeUrl"
              @mouseleave="hoveredPlaceUrl = null">
            <div class="sort_info">
              <div class="sort-name">{{ place.title }}</div>
              <div class="sort-category">{{ place.description }}</div>
              <a 
                :href="place.placeUrl"
                target="_blank"
                style="color:#155DFC; text-decoration:none;font-size:13px;"
              >지도보기</a>
            </div>
          </div>
        </div>
      </div>

      <!-- 버튼은 body 아래로 이동 -->
      <div class="sort-footer">
        <button class="sort-cancel-btn" @click="cancelSortPreview">취소</button>
        <button class="sort-btn" @click="applySortedPlaces">정렬 적용</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import apiClient from "@/utils/axios";
import draggable from "vuedraggable";

// Composables
import { useMap } from "@/composables/Usemap";
import { useHotelModal } from "@/composables/Usehotelmodal";
import { useDayControl } from "@/composables/Usedaycontrol";
import { usePlaceHighlight } from "@/composables/Useplacehighlight";
import { usePlaces } from "@/composables/Useplaces";
import { deletePoliLine, direction, sortDirection, isPolyLine } from '@/composables/Usedirection';

const route = useRoute();
const router = useRouter();

// === Composables 초기화 ===
const {
  mapContainer,
  placeMarkers,
  searchResultMarkers,
  activeMarker,
  initMap,
  clearAllMarkers,
  clearSearchResultMarkers,
  displaySearchResultMarkers: displaySearchMarkers,
  updateMapMarkers: updateMarkers,
  moveMapCenter,
  highlightMarker,
  getMap
} = useMap();

const {
  showHotelModal,
  hotels,
  hotelMapContainer,
  openHotelModal: openModal,
  closeHotelModal,
  addHotel: addHotelToDay,
  focusHotelOnMap
} = useHotelModal();

const {
  durations,
  selectedDay,
  completedDays,
  isDayCompleted,
  loadDurations,
  goPrevDay,
  goNextDay,
  selectDay,
  endDaySchedule
} = useDayControl();

const {
  selectedPlace,
  placeListContainer,
  placeCardRefs,
  selectPlace,
  highlightPlace: highlightPlaceFunc,
  scrollToPlace,
} = usePlaceHighlight();

const {
  places,
  currentType,
  placesByDay,
  isSearching,
  lastSearchCoords,
  hasSignificantChange,
  loadPlaces: loadPlacesFunc,
  addPlace: addPlaceToDay,
  removePlace: removePlaceFromDay,
  toggleFix,
  updatePlaceTime,
  toggleTimeInput,
  saveAllDaysPlaces: savePlaces
} = usePlaces();

// === 테마 추천 관련 상태 ===
const selectedTheme = ref('');
const themeRecommendations = ref([]);
const isLoadingTheme = ref(false);
const isThemeExpanded = ref(true);
const searchKeyword = ref('');

const themeNames = {
  restaurant: '맛집',
  cafe: '카페',
  tourist: '관광지'
};

const toggleTheme = () => {
  isThemeExpanded.value = !isThemeExpanded.value;
};

// === 기본 설정 ===
const historyState = window.history.state || {};

let previousData = null;
let targetDay = null;

const sessionData = sessionStorage.getItem('editPlanData');
const sessionTargetDay = sessionStorage.getItem('editTargetDay');

if (sessionData && sessionTargetDay) {
  try {
    previousData = JSON.parse(sessionData);
    targetDay = Number(sessionTargetDay);
    console.log("sessionStorage에서 데이터 로드 성공");
  } catch (e) {
    console.error("sessionStorage 파싱 실패:", e);
  }
}

const showSortModal = ref(false);
const planIdFromQuery = route.query.planId ? Number(route.query.planId) : null;
const targetDayFromQuery = route.query.targetDay ? Number(route.query.targetDay) : null;

const planId = previousData?.planId ? Number(previousData.planId) : planIdFromQuery;
targetDay = targetDay || targetDayFromQuery;

selectedTheme.value = route.query.theme || localStorage.getItem('selectedTheme') || '';

console.log("previousData 최종:", previousData);
console.log("targetDay 최종:", targetDay);
console.log("planId 최종:", planId);
console.log("selectedTheme:", selectedTheme.value);

const hoveredPlaceUrl = ref(null);
const isLoading = ref(false);
const previewSorted = ref([]);

// 카카오맵 모달 관련
const showKakaoModal = ref(false);
const selectedPlaceForKakao = ref(null);

const openKakaoModal = (place) => {
  selectedPlaceForKakao.value = place;
  showKakaoModal.value = true;
};

const closeKakaoModal = () => {
  showKakaoModal.value = false;
  selectedPlaceForKakao.value = null;
};

// 시작 지점
const startLocation = ref({
  lat: 37.5665,
  lng: 126.9780,
  name: "서울",
  type: "출발지"
});

// 선택된 장소 computed
const selectedPlaces = computed(() => placesByDay.value[selectedDay.value] || []);

// === Wrapper 함수들 ===
const displaySearchResultMarkers = async () => {
  await nextTick();
  displaySearchMarkers(places.value, currentType.value, (place) => highlightPlace(place, true));
};

const updateMapMarkers = () => {
  deletePoliLine();
  displaySearchResultMarkers();
  clearAllMarkers();
  
  const currentDayPlaces = placesByDay.value[selectedDay.value] || [];
  updateMarkers(currentDayPlaces, (place) => highlightPlace(place, true));
};

const loadPlaces = async (type, lat = null, lng = null) => {
  await loadPlacesFunc(
    type, 
    lat, 
    lng, 
    startLocation.value, 
    selectedDay.value,
    deletePoliLine,
    displaySearchResultMarkers
  );
};

const searchByKeyword = async () => {
  const keyword = searchKeyword.value.trim();
  if (!keyword) return;

  try {
    isSearching.value = true;

    const { data } = await apiClient.get('/api/kakao/keyword-search', {
      params: {
        query: keyword,
        lat: startLocation.value.lat,
        lng: startLocation.value.lng,
      },
    });

    console.log('🔍 키워드 검색 응답:', data);

    // 🔹 백엔드에서 Map<String, Object> 그대로 넘겼으니
    // data.documents 가 카카오 장소 배열
    const docs = Array.isArray(data.documents) ? data.documents : [];
    console.log('📌 documents 길이:', docs.length);

    // 🔹 Kakao Local API 필드 → 너가 쓰는 place 객체 구조로 매핑
    places.value = docs.map((place, index) => ({
      title: place.place_name,                         // 장소 이름
      latitude: parseFloat(place.y),                   // 위도
      longitude: parseFloat(place.x),                  // 경도
      categoryCode: place.category_group_code || '',   // FD6 / CE7 / AT4 등
      categoryGroupName: place.category_group_name || '',
      addressName: place.road_address_name || place.address_name || '',
      placeUrl: place.place_url || '',
      description: place.category_name || '',          // "음식점 > 한식 > ..."
      imageUrl: null,                                  // 필요하면 나중에 썸네일

      // 네 앱 공통 필드 기본값들
      travelOrder: 0,
      estimatedTravelTime: 0,
      planId,
      startTime: '',
      endTime: '',
      showTimeInput: false,
      fixed: false,
      isHotel: false,
    }));

    console.log('📌 매핑된 places:', places.value);

    // 🔹 첫 번째 결과 기준으로 지도 중심 이동
    if (places.value.length > 0) {
      const first = places.value[0];
      moveMapCenter(first.latitude, first.longitude);
    }

    // 🔹 검색 결과 마커 표시
    await displaySearchResultMarkers();
  } catch (e) {
    console.error('키워드 검색 실패:', e);
  } finally {
    isSearching.value = false;
  }
};

const addPlace = (place) => {
  addPlaceToDay(place, selectedDay.value, updateMapMarkers);
};

const removePlace = (place) => {
  removePlaceFromDay(
    place, 
    selectedDay.value, 
    updateMapMarkers, 
    deletePoliLine, 
    displaySearchResultMarkers
  );
};

const highlightPlace = async (place, fromMarkerClick = false) => {
  await highlightPlaceFunc(
    place,
    placesByDay.value,
    selectedDay.value,
    currentType,
    loadPlaces,
    moveMapCenter,
    highlightMarker
  );
};

const openHotelModal = async () => {
  await openModal(startLocation.value);
};

const addHotel = (hotel) => {
  addHotelToDay(hotel, selectedDay.value, placesByDay.value, updateMapMarkers);
};

const saveAllDaysPlaces = async () => {
  await savePlaces(durations.value, planId, previousData);
};

// === 이전 페이지로 이동 ===
const goPrev = () => {
  router.push({
    path: '/draw/third',
    query: { planId, totalDays: durations.value.length }
  });
};

// === 유틸리티 함수들 ===
const getLastCategory = (categoryString) => {
  if (!categoryString) return '기타';
  const parts = categoryString.split(' > ');
  return parts[parts.length - 1].trim();
};

const handleImageError = (event, place) => {
  event.target.style.display = 'none';
  place.imageUrl = null;
};

// 이미지 import
import restaurantIcon from '@/assets/images/theme/restaurant.png';
import cafeIcon from '@/assets/images/theme/cafe.png';
import touristIcon from '@/assets/images/theme/arrtraction.png';

import themeRestaurant from '@/assets/images/theme/recommend-restaurant.png';
import themeCafe from '@/assets/images/theme/recommend-cafe.png';
import themeTourist from '@/assets/images/theme/recommend-attraction.png';

const getCategoryIcon = (categoryCode) => {
  const icons = {
    'FD6': restaurantIcon,
    'CE7': cafeIcon,
    'AT4': touristIcon,
  };
  return icons[categoryCode] || '📍';
};

const getThemeIcon = (categoryCode) => {
  const icons = {
    'FD6': themeRestaurant,
    'CE7': themeCafe,
    'AT4': themeTourist,
  };
  return icons[categoryCode] || themeTourist;
};

// === 드래그 이동 제한 ===
const onDragMove = (evt) => {
  const draggedItem = evt.draggedContext.element;
  const relatedItem = evt.relatedContext.element;
  const list = placesByDay.value[selectedDay.value] || [];
  
  if (draggedItem.fixed) return false;
  if (relatedItem?.fixed) return false;
  
  const fixedIndexes = list
    .map((p, i) => (p.fixed ? i : -1))
    .filter((i) => i !== -1);
  
  if (fixedIndexes.length === 0) return true;
  
  const draggedIndex = evt.draggedContext.index;
  const targetIndex = evt.relatedContext.index;
  
  const inSameBlock = fixedIndexes.every((fi) => {
    return (
      (draggedIndex < fi && targetIndex < fi) ||
      (draggedIndex > fi && targetIndex > fi)
    );
  });
  
  return inSameBlock;
};

// === Plan 정보 가져오기 ===
const loadPlanInfo = async () => {
  try {
    const res = await apiClient.get(`/api/plans/select/${planId}`);
    const plan = res.data;
    
    const regionId = plan.regionId || plan.region_id;
    
    if (regionId) {
      const regionRes = await apiClient.get(`/api/regions/${regionId}`);
      const region = regionRes.data;
      
      if (region.startLat && region.startLng) {
        startLocation.value = {
          lat: parseFloat(region.startLat),
          lng: parseFloat(region.startLng),
          name: region.regionName,
          type: "출발지"
        };
        console.log(`시작 지점: ${startLocation.value.name} (${startLocation.value.lat}, ${startLocation.value.lng})`);
      }
    }
  } catch (err) {
    console.error("Plan/Region 정보 로드 실패:", err);
  }
};

// === 테마별 추천 장소 로드 ===
const loadThemeRecommendations = async () => {
  if (!selectedTheme.value) {
    console.log("선택된 테마 없음");
    return;
  }
  
  isLoadingTheme.value = true;
  
  try {
    const response = await apiClient.get('/api/kakao/theme-search', {
      params: {
        query: startLocation.value.name,
        theme: selectedTheme.value
      }
    });
    
    let forcedCategoryCode = 'AT4';
    
    if (selectedTheme.value === 'restaurant') {
      forcedCategoryCode = 'FD6';
    } else if (selectedTheme.value === 'cafe') {
      forcedCategoryCode = 'CE7';
    } else if (selectedTheme.value === 'tourist') {
      forcedCategoryCode = 'AT4';
    }
    
    const kakaoPlaces = response.data.documents || [];
    themeRecommendations.value = kakaoPlaces.map((place, index) => ({
      travelOrder: index + 1,
      estimatedTravelTime: 0,
      title: place.place_name,
      latitude: parseFloat(place.y),
      longitude: parseFloat(place.x),
      categoryCode: forcedCategoryCode,
      categoryGroupName: place.category_group_name || themeNames[selectedTheme.value],
      addressName: place.road_address_name || place.address_name,
      placeUrl: place.place_url,
      description: place.category_name,
      imageUrl: null,
      planId,
      startTime: '',
      endTime: '',
      showTimeInput: false
    }));
    
    console.log(`테마 추천 ${themeRecommendations.value.length}개 로드 완료`);
    
  } catch (error) {
    console.error('테마 추천 로딩 실패:', error);
    themeRecommendations.value = [];
  } finally {
    isLoadingTheme.value = false;
  }
};

// === 경로 그리기 ===
const drawRoute = async () => {
  const map = getMap();
  await direction(map, placesByDay.value[selectedDay.value]);
  selectedPlace.value = null;
  if (isPolyLine()) clearSearchResultMarkers();
};

// === 자동 정렬 ===
const drawSort = async () => {
  selectedPlace.value = null;
  const currentPlaces = placesByDay.value[selectedDay.value];
  
  const map = getMap();
  isLoading.value = true;
  const newLocations = await sortDirection(map, currentPlaces);
  isLoading.value = false;
  
  if (!newLocations || newLocations.length === 0) {
    console.warn("정렬된 경로가 없습니다.");
    return;
  }
  
  const reorderedPlaces = newLocations.map((nLoc, index) => {
    const matched = currentPlaces.find(p =>
      p.title === nLoc.name ||
      (Math.abs(p.latitude - nLoc.y) < 1e-6 &&
        Math.abs(p.longitude - nLoc.x) < 1e-6)
    );
    
    if (!matched) return null;
    
    return {
      ...matched,
      travelOrder: index + 1
    };
  }).filter(Boolean);
  
  previewSorted.value = reorderedPlaces;
  console.log("정렬 완료:", reorderedPlaces);

  showSortModal.value = true;
};

const applySortedPlaces = () => {
  placesByDay.value[selectedDay.value] = [...previewSorted.value];
  console.log("정렬 완료");
  showSortModal.value = false;
  if (isPolyLine) clearSearchResultMarkers();
};

const cancelSortPreview = () => {
  console.log("정렬 취소");
  showSortModal.value = false;
};

// === Watch ===
watch(selectedDay, () => {
  updateMapMarkers();
  lastSearchCoords.value = { lat: null, lng: null, type: null };
});

watch(selectedPlace, async (newPlace) => {
  if (activeMarker.value) {
    try {
      const prev = activeMarker.value;
      prev.setZIndex(100);
    } catch (e) {
      console.warn("prev marker restore failed", e);
    }
    activeMarker.value = null;
  }

  const clickedMarker = (placeMarkers.value || []).find(m => m.getTitle() === newPlace?.title)
                      || (searchResultMarkers.value || []).find(m => m.getTitle() === newPlace?.title);

  if (clickedMarker) {
    clickedMarker.setZIndex(999);
    activeMarker.value = clickedMarker;
  }

  await nextTick();
  if (!newPlace) return;

  scrollToPlace(newPlace.title);
});

// === onMounted ===
onMounted(async () => {
  console.log("🚀 컴포넌트 초기화 시작");
  
  await loadPlanInfo();
  await loadDurations(planId, durations.value.length);
  
  if (selectedTheme.value) {
    await loadThemeRecommendations();
  }
  
  if (previousData && targetDay) {
    console.log("일정수정 모드!");
    console.log("previousData.dayList:", previousData.dayList);
    
    if (previousData.dayList && previousData.dayList.length > 0) {
      previousData.dayList.forEach((dayData) => {
        if (dayData.activities && dayData.activities.length > 0) {
          const dayNo = dayData.dayNo;
          
          placesByDay.value[dayNo] = dayData.activities.map((act, index) => {
            console.log(`${dayNo}일차 - ${act.placeName}`);
            
            return {
              travelId: act.travelId,
              travelOrder: index + 1,
              estimatedTravelTime: 0,
              title: act.placeName || "",
              placeName: act.placeName || "",
              latitude: act.latitude || 0,
              longitude: act.longitude || 0,
              categoryCode: act.categoryCode || "",
              categoryGroupName: act.categoryGroupName || "",
              addressName: act.addressName || "",
              placeUrl: act.placeUrl || "",
              description: act.categoryGroupName || "",
              imageUrl: null,
              planId: previousData.planId,
              dayNumber: dayNo,
              startTime: act.startTime || '',
              endTime: act.endTime || '',
              showTimeInput: false,
              fixed: false,
              isHotel: act.tag === '숙소'
            };
          });
          
          console.log(`${dayNo}일차 장소 ${placesByDay.value[dayNo].length}개 로드됨`);
        }
      });
      
      selectedDay.value = targetDay;
      console.log(`${targetDay}일차로 이동`);
      
      sessionStorage.removeItem('editPlanData');
      sessionStorage.removeItem('editTargetDay');
    }
  } else {
    console.log("일반 모드 (일정수정 아님)");
  }
  
  initMap(startLocation.value, (lat, lng) => {
    if (hasSignificantChange(lat, lng, currentType.value) && !isSearching.value) {
      console.log("지도 이동 - 새 검색:", lat, lng);
      loadPlaces(currentType.value, lat, lng);
    }
  });
  
  await nextTick();
  updateMapMarkers();
  await loadPlaces("restaurants");
  
  console.log("초기화 완료");
  console.log("최종 placesByDay:", placesByDay.value);
  console.log("selectedDay:", selectedDay.value);
});

const focusSearchPlace = (place, index) => {
  // 🔹 1) Kakao 검색 결과는 기본적으로 x(경도), y(위도) 문자열로 옴
  // ex) { x: "129.1234", y: "35.1234", place_name: "..." }
  const lat = Number(place.y ?? place.lat ?? place.latitude)
  const lng = Number(place.x ?? place.lng ?? place.longitude)

  if (!isNaN(lat) && !isNaN(lng)) {
    // ✅ 좌표로 지도 중심 이동
    moveMapCenter(lat, lng)
  }

  // 🔹 2) 마커가 이미 찍혀 있다면 그 마커 기준으로 이동 + 하이라이트
  const marker = searchResultMarkers.value?.[index]
  const map = getMap && getMap()

  if (marker && map) {
    // 지도 중심을 해당 마커 위치로 이동
    map.panTo(marker.getPosition())

    // 선택된 마커 강조(만약 이런 함수 구현해놨다면)
    try {
      highlightMarker(marker)
    } catch (e) {
      // highlightMarker가 다른 시그니처면(예: 인덱스/타입 받는 구조) 여기서 맞춰 쓰면 됨
      console.debug('highlightMarker 호출 실패(시그니처 확인 필요):', e)
    }
  }
}
</script>

<style scoped>
.final-draw-page {
  zoom: 0.8;
}
.step-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.step-content {
  width: 100%;
}

.full-layout {
  width: 95vw;
  max-width: 1800px;
  margin: 0 auto;
  border-radius: 14px;
  overflow: hidden;
}

.dot.purple { background: #d877e1; }
.dot.brown { background: #d0a473; }

.top-bar {
  border-bottom: 1px solid rgba(0,0,0,0.1);
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
}

.back-btn { cursor: pointer; font-weight: 500; }
.arrive-time { color: #4A5565; font-size: 14px; }

.main-layout {
  display: flex;
  height: calc(100vh - 60px);
  min-height: 800px;
}

.left-panel {
  width: 22%;
  min-width: 300px;
  max-width: 380px;
  border-right: 1px solid rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.left-actions { 
  padding: 16px; 
  border-bottom: 1px solid rgba(0,0,0,0.1); 
  display: flex;
  flex-direction: column;
  height: 115px;
  gap: 16px;
}

.action-row { display: flex; gap: 8px; margin-bottom: 12px; }

.left-btn {
  flex: 1;
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 8px;
  height: 32px;
  cursor: pointer;
  background: white;
  color: #4A5565;
  transition: 0.2s;
}

.left-actions-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 8px;
  padding: 16px;
}

.left-actions-grid .left-btn {
  width: 100%;
  height: 40px;
  width: 48%;
}

.left-btn:hover:not(:disabled) {
  background: #F3F4F6;
}

.left-btn.active {
  background: #155DFC;
  color: white;
  border-color: #155DFC;
  font-weight: 600;
}

.left-btn.active:hover:not(:disabled) {
  background: #1348d4;
}

.left-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.middle-btns {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.top-btn {
  width: 100%;
  height: 32px;
  border-radius: 8px;
  background: #F54900;
  color: white;
  border: none;
  cursor: pointer;
}

.hotel-btn {
  margin-left: 12px;
  border-radius: 4px;
  border: 1px solid #D1D5DC;
  background: white;
  height: 40px;
  width: 80px;
}

.info-box {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0,0,0,0.1);
}

.empty-guide {
  padding: 32px;
  color: #6A7282;
  text-align: center;
}

.selected-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.selected-card {
  display: flex;
  align-items: stretch;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 16px;
  transition: 0.2s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  gap: 12px;
  cursor: pointer;
}

.selected-card:hover {
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  border-color: #155DFC;
}

.selected-card.fixed {
  background: #F3F4F6;
  opacity: 0.85;
}

.selected-card.completed {
  background: #F9FAFB;
  border-color: #D1D5DB;
  opacity: 0.7;
  pointer-events: none;
}

.selected-card.hotel {
  border-left: 3px solid #10B981;
}

.drag-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 48px;
}

.day-badge-top {
  background: #F3F4F6;
  color: #6B7280;
  font-size: 11px;
  font-weight: 500;
  padding: 3px 6px;
  border-radius: 4px;
  white-space: nowrap;
}

.drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #9CA3AF;
  cursor: grab;
  user-select: none;
  flex: 1;
}

.drag-handle.disabled {
  cursor: not-allowed;
  opacity: 0.3;
}

.selected-card.fixed .drag-handle {
  cursor: not-allowed;
  opacity: 0.4;
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #1F2937;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hotel-badge {
  background: #D1FAE5;
  color: #065F46;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 6px;
  flex-shrink: 0;
}

.card-category {
  font-size: 12px;
  color: #6B7280;
  flex-shrink: 0;
}

.time-toggle-section {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 6px 0;
}

.time-toggle-btn {
  padding: 6px 12px;
  background: #F3F4F6;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  color: #6B7280;
  cursor: pointer;
  transition: all 0.2s;
}

.time-toggle-btn:hover:not(:disabled) {
  background: #E5E7EB;
  border-color: #9CA3AF;
}

.time-toggle-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.time-display {
  font-size: 10px;
  color: #155DFC;
  font-weight: 500;
  background: #EEF4FF;
  padding: 4px 8px;
  border-radius: 4px;
}

.time-input-container {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 6px 0;
}

.time-input-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: #F9FAFB;
  border-radius: 6px;
}

.time-label {
  font-size: 12px;
  font-weight: 500;
  color: #6B7280;
  white-space: nowrap;
  min-width: 32px;
}

.time-input {
  flex: 1;
  height: 28px;
  padding: 4px 6px;
  border: 1px solid #D1D5DB;
  border-radius: 4px;
  font-size: 12px;
  background: white;
  transition: border-color 0.2s;
}

.time-input:focus {
  outline: none;
  border-color: #155DFC;
}

.time-input:disabled {
  background: #F3F4F6;
  cursor: not-allowed;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 4px;
}

.action-btn {
  border: 1px solid #D1D5DB;
  background: white;
  border-radius: 8px;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: 0.2s ease;
}

.action-btn:hover {
  background: #F9FAFB;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.fix-btn.active {
  background: #155DFC;
  color: white;
  border-color: #155DFC;
}

.remove-btn {
  color: #F54900;
  border-color: #F54900;
}

.remove-btn:hover {
  background: rgba(245, 73, 0, 0.05);
}

.day-control {
  border-top: 1px solid rgba(0,0,0,0.1);
  padding: 16px;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.day-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.day-btn {
  width: 60px;
  height: 36px;
  border-radius: 6px;
  border: 1px solid rgba(0,0,0,0.1);
  background: #f9fafb;
  color: #4a5565;
  font-size: 14px;
  cursor: pointer;
  transition: 0.2s;
}

.day-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.day-label {
  font-weight: 600;
  font-size: 15px;
}

.day-numbers {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.day-number {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background: #f3f4f6;
  color: #4a5565;
  cursor: pointer;
  transition: 0.2s;
}

.day-number.active {
  background: #155dfc;
  color: white;
  font-weight: 600;
}

.map-section { flex: 1; padding: 24px; }

.map-box {
  position: relative;
  background: linear-gradient(135deg, #EFF6FF 0%, #F0FDF4 100%);
  border-radius: 10px;
  height: 100%;
  overflow: hidden;
}

.map-header {
  position: absolute;
  top: 16px; 
  left: 16px;
  background: white;
  border-radius: 10px;
  padding: 8px 16px;
  box-shadow: 0 4px 6px -4px rgba(0,0,0,0.1);
  display: flex; 
  justify-content: space-between; 
  align-items: center;
  width: calc(100% - 32px);
  z-index: 10;
}

.map-legend { 
  display: flex; 
  gap: 12px; 
  font-size: 14px; 
}

.dot {
  display: inline-block; 
  width: 12px; 
  height: 12px; 
  border-radius: 50%;
}

.dot.orange { background: #FF6900; }
.dot.yellow { background: #FE9A00; }
.dot.blue { background: #2B7FFF; }
.dot.green { background: #10B981; }

.map-canvas {
  width: 100%; 
  height: 100%; 
  position: relative;
}

.right-panel {
  width: 26%;
  min-width: 350px;
  max-width: 420px;
  border-left: 1px solid rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
}

.search-header {
  padding: 16px;
  border-bottom: 1px solid rgba(0,0,0,0.1);
  font-size: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.theme-section {
  border-bottom: 1px solid rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: rgb(0, 0, 0);
  padding: 16px;
  cursor: pointer;
  user-select: none;
}

.section-header:hover {
  background: rgba(255, 255, 255, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.section-header h3 {
  font-size: 15px;
  font-weight: bold;
  margin: 0;
}

.badge {
  background: rgba(255, 255, 255, 0.25);
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.toggle-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.toggle-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.loading-theme {
  color: white;
  text-align: center;
  padding: 20px;
}

.theme-place-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 320px;
  overflow-y: auto;
  padding: 0 16px 16px;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 320px;
  }
}

.theme-place-card {
  background: white;
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 8px;
  gap: 10px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.theme-place-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.theme-place-card.active {
  border: 2px solid #155dfc;
  background: #eef4ff;
}

.rank-badge {
  background: linear-gradient(135deg, #c4e3a6);
  color: #fff;
  font-weight: bold;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(255, 215, 0, 0.3);
}

.place-icon {
  font-size: 28px;
  flex-shrink: 0;
}

.theme-place-info {
  flex: 1;
  min-width: 0;
}

.theme-place-name {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #1F2937;
}

.theme-category {
  font-size: 11px;
  color: #6B7280;
  margin: 2px 0;
}

.theme-address {
  font-size: 11px;
  color: #9CA3AF;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.filter-bar {
  display: flex;
  background: #F9FAFB;
  border-bottom: 1px solid rgba(0,0,0,0.1);
  padding: 12px 16px;
  gap: 8px;
}

.filter-btn {
  flex: 1;
  border-radius: 4px;
  border: 1px solid #D1D5DC;
  background: white;
  height: 40px;
}

.filter-btn.active {
  border-color: #155DFC;
  color: #155DFC;
  font-weight: 500;
}

.place-list {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.place-card {
  background: #F9FAFB;
  border-radius: 10px;
  border: 1px solid #E5E7EB;
  padding: 12px 16px;
  display: flex;
  gap: 12px;
  align-items: center;
  cursor: pointer;
}

.place-card.active {
  border: 2px solid #155dfc;
  background: #eef4ff;
}

.place-image-wrapper {
  width: 70px;
  height: 70px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: #f3f4f6;
}

.place-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.place-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  /* background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); */
}

.placeholder-icon {
  font-size: 32px;
}

.place-info {
  flex: 1;
  min-width: 0;
}

.place-name { font-weight: 500; }
.place-address { 
  font-size: 12px; 
  color: #6A7282; 
  margin-bottom: 4px; 
}
.place-meta { 
  font-size: 12px; 
  color: #4A5565; 
  display: flex; 
  gap: 12px; 
}

.add-btn {
  background: #155DFC;
  color: white;
  border-radius: 8px;
  border: none;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
}

.add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.save-section {
  border-top: 1px solid rgba(0,0,0,0.1);
  padding: 16px;
}

.save-btn {
  width: 100%;
  height: 36px;
  background: #155DFC;
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 500;
}

.hotel-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.hotel-modal {
  width: 640px;
  max-height: 80vh;
  overflow-y: auto;
  background: white;
  border-radius: 12px;
  padding: 24px;
}

.hotel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

.hotel-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hotel-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.hotel-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  cursor: pointer;
}

.hotel-card:hover {
  border-color: #155dfc;
  background: #eef4ff;
}

.hotel-name {
  font-weight: 500;
}

.hotel-address {
  font-size: 12px;
  color: #6a7282;
}

.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #155DFC;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.main-layout.blurred {
  filter: blur(3px);
  pointer-events: none;
}

.sort-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
}

.sort-modal {
  background: #fff;
  border-radius: 12px;
  width: 720px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.25s ease;
}

.sort-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.sort-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.sort-body {
  display: flex;
  gap: 20px;
  justify-content: space-between;
  padding: 16px;
  max-height: 60vh;
  overflow-y: auto;
}

.curr-list,
.sort-list {
  flex: 1;
}

.list-title {
  text-align: center;
  font-weight: 600;
  margin-top: 8px;
  margin-bottom: 8px;
}

.sort-body > .sort-list > .list-title {
  color: #155dfc;
}

.sort-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  transition: 0.2s ease;
}

.sort-card.hovered {
  border-color: #155dfc;
  background-color: #eef4ff;
  transform: translateY(-2px);
}

.fix-card {
  background-color: #4A5565;
}

.sort_info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sort-name {
  font-weight: 500;
  color: #111827;
}

.sort-index {
  font-size: 12px;
  color: #6b7280;
}

.sort-category {
  font-size: 13px;
  color: #4b5563;
}

.sort-btn,
.sort-cancel-btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: 0.2s ease;
}

.sort-btn {
  background-color: #155dfc;
  color: white;
}

.sort-btn:hover {
  background-color: #0f47c9;
}

.sort-cancel-btn {
  background-color: #f3f4f6;
  color: #374151;
}

.sort-cancel-btn:hover {
  background-color: #e5e7eb;
}

.sort-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  padding: 20px 0 28px;
  margin-top: 8px;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

.top-count {
  color: #3C8BEA;
}

.badge {
  background-color: #E3F2FF;
  color: #1A73E8;
}

.toggle-btn {
  background-color: #E3F2FF;
  color: #1A73E8;
}

.category-img {
  margin-top: 10px;
  width: 80px;
  height: 80px;
  object-fit: contain;
}

.theme-img{
  margin-top: 10px;
  width: 40px;
  height: 40px;
  object-fit: contain;
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
/* 카카오맵 모달 */
.kakao-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.kakao-modal {
  width: 90vw;
  max-width: 1000px;
  height: 85vh;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
}

.kakao-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.kakao-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.kakao-body {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.kakao-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

/* 상세보기 버튼 스타일 */
.detail-btn {
  background: transparent;
  border: none;
  color: #155DFC;
  font-size: 12px;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
  transition: color 0.2s;
  text-decoration:none;
}

.detail-btn:hover {
  color: #0f47c9;
}

.search-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.search-title {
  font-size: 16px;
  font-weight: 500;
}

.search-input {
  flex: 1;
  height: 32px;
  padding: 0 8px;
  border-radius: 6px;
  border: 1px solid #D1D5DC;
  font-size: 13px;
}

.search-input:focus {
  outline: none;
  border-color: #155DFC;
}

.search-btn {
  height: 32px;
  padding: 0 12px;
  border-radius: 6px;
  border: none;
  background: #155DFC;
  color: white;
  font-size: 12px;
  cursor: pointer;
}

.search-btn:hover {
  background: #0f47c9;
}
</style>