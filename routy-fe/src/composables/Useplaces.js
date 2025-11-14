import { ref } from 'vue';
import apiClient from '@/utils/axios';
import { useRouter } from 'vue-router';

export function usePlaces() {
  const router = useRouter();
  const places = ref([]);
  const currentType = ref("restaurants");
  const placesByDay = ref({});
  const isSearching = ref(false);
  const lastSearchCoords = ref({ lat: null, lng: null, type: null });

  // 좌표 변경 확인
  const hasSignificantChange = (newLat, newLng, newType) => {
    if (!lastSearchCoords.value.lat || lastSearchCoords.value.type !== newType) {
      return true;
    }
    
    const latDiff = Math.abs(newLat - lastSearchCoords.value.lat);
    const lngDiff = Math.abs(newLng - lastSearchCoords.value.lng);
    
    return latDiff > 0.008 || lngDiff > 0.008;
  };

  // 장소 불러오기
  const loadPlaces = async (type, lat = null, lng = null, startLocation, selectedDay, deletePoliLine, displaySearchResultMarkers) => {
    deletePoliLine();
    
    if (isSearching.value) {
      console.log("⏸ 이미 검색 중...");
      return;
    }
    
    currentType.value = type;
    
    let searchLat = lat;
    let searchLng = lng;
    
    if (!searchLat || !searchLng) {
      const currentDayPlaces = placesByDay.value[selectedDay] || [];
      if (currentDayPlaces.length > 0) {
        const lastPlace = currentDayPlaces[currentDayPlaces.length - 1];
        searchLat = lastPlace.latitude;
        searchLng = lastPlace.longitude;
      } else {
        searchLat = startLocation.lat;  
        searchLng = startLocation.lng;
      }
    }
    
    if (!hasSignificantChange(searchLat, searchLng, type)) {
      console.log("좌표/타입 변경 없음 - 검색 스킵");
      return;
    }
    
    console.log(`${type} 검색: (${searchLat}, ${searchLng})`);
    
    isSearching.value = true;
    
    try {
      const res = await apiClient.get(`/api/kakao/${type}`, { 
        params: { lat: searchLat, lng: searchLng },
        timeout: 10000
      });
      
      const kakaoPlaces = res.data.documents || [];
      places.value = kakaoPlaces.map((place, index) => ({
        travelOrder: index + 1,
        estimatedTravelTime: 0,
        title: place.place_name,
        latitude: parseFloat(place.y),
        longitude: parseFloat(place.x),
        categoryCode: place.category_group_code,
        categoryGroupName: place.category_group_name,
        addressName: place.road_address_name || place.address_name,
        placeUrl: place.place_url,
        description: place.category_name,
        imageUrl: place.image_url || null,
        startTime: '',
        endTime: '',
        showTimeInput: false
      }));
      
      console.log(`${type} ${places.value.length}개 로드 완료`);
      
      lastSearchCoords.value = { lat: searchLat, lng: searchLng, type };
      
      await displaySearchResultMarkers();
      
    } catch (err) {
      console.error("장소 로드 실패:", err);
      places.value = [];
    } finally {
      isSearching.value = false;
    }
  };

  // 장소 추가
  const addPlace = (place, selectedDay, updateMapMarkers) => {
    const day = selectedDay;
    
    if (!placesByDay.value[day]) {
      placesByDay.value[day] = [];
    }
    
    if (placesByDay.value[day].find((x) => x.title === place.title)) {
      console.log(`${place.title}은(는) 이미 추가되어 있습니다.`);
      return;
    }
    
    placesByDay.value[day].push({ 
      ...place, 
      dayNumber: day,
      startTime: place.startTime || '',
      endTime: place.endTime || '',
      showTimeInput: false,
      fixed: false
    });
    
    console.log(`${place.title} 추가 완료 (${day}일차)`);
    updateMapMarkers();
  };

  // 장소 제거
  const removePlace = (place, selectedDay, updateMapMarkers, deletePoliLine, displaySearchResultMarkers) => {
    const day = selectedDay;
    if (placesByDay.value[day]) {
      placesByDay.value[day] = placesByDay.value[day].filter((x) => x.title !== place.title);
      console.log(`${place.title} 제거`);
      updateMapMarkers();
      deletePoliLine();
      displaySearchResultMarkers();
      
      setTimeout(() => {
        lastSearchCoords.value = { lat: null, lng: null, type: null };
        loadPlaces(currentType.value);
      }, 300);
    }
  };

  // 고정 버튼 토글
  const toggleFix = (place) => {
    place.fixed = !place.fixed;
  };

  // 시간 업데이트
  const updatePlaceTime = (place) => {
    console.log(`${place.title} 시간 업데이트:`, {
      startTime: place.startTime,
      endTime: place.endTime
    });
    
    if (place.startTime && place.endTime) {
      if (place.endTime <= place.startTime) {
        alert('종료 시간은 시작 시간보다 늦어야 합니다.');
        place.endTime = '';
      }
    }
  };

  // 시간 입력 토글
  const toggleTimeInput = (place) => {
    place.showTimeInput = !place.showTimeInput;
  };

  // 저장 함수
  const saveAllDaysPlaces = async (durations, planId, previousData) => {
    try {
      let hasNewPlaces = false;
      
      for (const duration of durations) {
        const dayPlaces = placesByDay.value[duration.day] || [];
        const newPlaces = dayPlaces.filter(p => !p.travelId);
        
        if (newPlaces.length === 0) {
          console.log(`${duration.day}일차: 새로 추가된 장소 없음`);
          continue;
        }
        
        hasNewPlaces = true;
        
        // 시간 검증
        for (const place of newPlaces) {
          if (place.startTime && place.endTime) {
            if (place.endTime <= place.startTime) {
              alert(`${place.title}의 종료 시간이 시작 시간보다 이릅니다.`);
              return;
            }
          }
        }
        
        const existingCount = dayPlaces.filter(p => p.travelId).length;
        
        const mappedPlaces = newPlaces.map((p, i) => ({
          durationId: duration.durationId,
          planId,
          travelOrder: existingCount + i + 1,
          estimatedTravelTime: p.estimatedTravelTime || 0,
          placeName: p.title,
          startTime: p.startTime || null,
          endTime: p.endTime || null,
          latitude: p.latitude,
          longitude: p.longitude,
          categoryCode: p.categoryCode,
          categoryGroupName: p.categoryGroupName,
          addressName: p.addressName,
          placeUrl: p.placeUrl,
          description: p.description || '',
          imagePath: p.imagePath || null,
          runTime: p.runTime || null,
        }));
        
        console.log(`${duration.day}일차 새로 추가된 ${newPlaces.length}개 장소:`, mappedPlaces);
        await apiClient.post("/api/places/batch", mappedPlaces);
      }
      
      alert("새로운 장소가 저장되었습니다!");
      
      // sessionStorage 클리어
      sessionStorage.removeItem("editPlanData");
      sessionStorage.removeItem("editTargetDay");
      
      // 일정수정 모드였다면 상세 페이지로
      if (previousData) {
        console.log("일정 상세 페이지로 이동");
        router.push(`/mypage/travel/${planId}`);
      } else {
        // 일반 모드였다면 마이페이지로
        console.log("마이페이지로 이동");
        let count = Number(sessionStorage.getItem("newPlan")) || 0;
        count++;
        sessionStorage.setItem("newPlan", count);
        
        router.push("/mypage").then(() => {
          window.location.reload();
        });
      }
      
    } catch (err) {
      console.error("저장 실패:", err);
      console.error("에러 상세:", err.response?.data);
      alert("저장에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return {
    places,
    currentType,
    placesByDay,
    isSearching,
    lastSearchCoords,
    hasSignificantChange,
    loadPlaces,
    addPlace,
    removePlace,
    toggleFix,
    updatePlaceTime,
    toggleTimeInput,
    saveAllDaysPlaces
  };
}