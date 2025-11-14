import { ref, nextTick } from 'vue';

export function usePlaceHighlight() {
  const selectedPlace = ref(null);
  const placeListContainer = ref(null);
  const placeCardRefs = ref({});

  // 장소 선택
  const selectPlace = (place) => {
    selectedPlace.value = place;
  };

  // 마커 강조 + 오버레이 표시
  const highlightPlace = async (place, placesByDay, selectedDay, currentType, loadPlaces, moveMapCenter, highlightMarker) => {
    selectedPlace.value = place;
    
    // 카테고리 판별 및 자동 전환
    let targetType = 'attractions';
    
    if (place.categoryCode === 'FD6') {
      targetType = 'restaurants';
    } else if (place.categoryCode === 'CE7') {
      targetType = 'cafes';
    } else if (place.categoryCode === 'AT4') {
      targetType = 'attractions';
    }
    
    // 현재 카테고리와 다르면 카테고리 전환
    if (currentType.value !== targetType) {
      currentType.value = targetType;
      await loadPlaces(targetType, place.latitude, place.longitude);
      await nextTick();
    }
  // 선택된 장소(placesByDay)인지 확인
  const currentPlaces = placesByDay[selectedDay];
  const isSelectedPlace = (currentPlaces || []).find(p => p.placeUrl === place.placeUrl);
  
  // 테마 추천인지 확인 (travelOrder가 있으면 테마 추천)
  const isThemePlace = place.travelOrder !== undefined && place.travelOrder > 0;
  
  // 선택된 장소 또는 테마 추천인 경우만 지도 이동
  // 일반 검색 결과는 지도 이동 안함
  if (isSelectedPlace || isThemePlace) {
    if (place.latitude && place.longitude) {
      moveMapCenter(place.latitude, place.longitude, 5);
    }
  }


    // 마커 하이라이트
    highlightMarker(place);

    await nextTick();
    
    // 스크롤
    scrollToPlace(place.title);
  };

  // 스크롤 처리
  const scrollToPlace = (placeTitle) => {
    const element = placeCardRefs.value[placeTitle];
    const container = placeListContainer.value;
    
    if (element && container) {
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();

      const offsetFromContainerTop = elementRect.top - containerRect.top;
      const currentScroll = container.scrollTop;
      const scrollPosition = Math.round(
        currentScroll + offsetFromContainerTop - (container.clientHeight / 2) + (element.clientHeight / 2)
      );

      container.scrollTo({
        top: scrollPosition,
        behavior: 'smooth'
      });
    }
  };

  return {
    selectedPlace,
    placeListContainer,
    placeCardRefs,
    selectPlace,
    highlightPlace,
    scrollToPlace
  };
}