import { ref, watch } from 'vue';
import restaurantMarker from '@/assets/images/icons/markers/restaurant-marker.svg';
import cafeMarker from '@/assets/images/icons/markers/cafe-marker.svg';
import attractionMarker from '@/assets/images/icons/markers/attraction-marker.svg';
import restaurantSelect from '@/assets/images/icons/markers/restaurant-select.png';
import cafeSelect from '@/assets/images/icons/markers/cafe-select.png';
import attractionSelect from '@/assets/images/icons/markers/attraction-select.png';
import hotelSelect from '@/assets/images/icons/markers/hotel-select.png';

export function useMap() {
  const mapContainer = ref(null);
  let map = null;
  const placeMarkers = ref([]);
  const searchResultMarkers = ref([]);
  let mapInitialized = false;
  const activeMarker = ref(null);
  const activeMarkerAnimation = ref(null);
  
  // 마커 이미지 캐싱
  const markerImageCache = new Map();

  // 검색 결과용 마커 이미지
  const getSearchMarkerImageUrl = (type) => {
    const markerImages = {
      'restaurants': restaurantMarker,
      'cafes': cafeMarker,
      'attractions': attractionMarker,
    };
    return markerImages[type] || markerImages['attractions'];
  };

  // 선택된 장소용 마커 이미지
  const getSelectedMarkerImageUrl = (type) => {
    const markerImages = {
      'restaurants': restaurantSelect,
      'cafes': cafeSelect,
      'attractions': attractionSelect,
      'hotel': hotelSelect
    };
    return markerImages[type] || markerImages['attractions'];
  };

  // 마커 이미지 캐싱
  const getMarkerImage = (imageUrl, size) => {
    const cacheKey = `${imageUrl}_${size.width}_${size.height}`;
    
    if (markerImageCache.has(cacheKey)) {
      return markerImageCache.get(cacheKey);
    }
    
    const markerImage = new kakao.maps.MarkerImage(imageUrl, new kakao.maps.Size(size.width, size.height));
    markerImageCache.set(cacheKey, markerImage);
    
    return markerImage;
  };

  // 검색 결과 마커 생성
  const createSearchMarker = (place, placeType, onMarkerClick) => {
    if (!map) return null;
    
    const position = new kakao.maps.LatLng(place.latitude, place.longitude);
    const markerImageUrl = getSearchMarkerImageUrl(placeType);
    const markerImage = getMarkerImage(markerImageUrl, { width: 40, height: 40 });
    
    const newMarker = new kakao.maps.Marker({
      position: position,
      map: map,
      image: markerImage,
      title: place.title
    });
    
    newMarker._placeType = placeType;
    newMarker._origImage = markerImage;
    newMarker._imageUrl = markerImageUrl;

    kakao.maps.event.addListener(newMarker, 'click', function() {
      onMarkerClick(place, true);
    });
    
    return newMarker;
  };

  // 선택된 장소 마커 생성
  const createSelectedMarker = (place, placeType, onMarkerClick) => {
    if (!map) return null;
    
    const position = new kakao.maps.LatLng(place.latitude, place.longitude);
    const markerImageUrl = getSelectedMarkerImageUrl(placeType);
    const markerImage = getMarkerImage(markerImageUrl, { width: 60, height: 60 });
    
    const newMarker = new kakao.maps.Marker({
      position: position,
      map: map,
      image: markerImage,
      title: place.title,
      zIndex: 100
    });

    newMarker._placeType = placeType;
    newMarker._origImage = markerImage;
    newMarker._imageUrl = markerImageUrl;

    kakao.maps.event.addListener(newMarker, 'click', function() {
      onMarkerClick(place, true);
    });
    
    return newMarker;
  };

  // 마커 애니메이션
  const animateMarkerBounce = (marker, height = 15, speed = 0.004) => {
    if (!marker) return;

    const startPos = marker.getPosition();
    let startTime = null;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;

      const delta = Math.sin(progress * speed) * height;
      marker.setPosition(new kakao.maps.LatLng(startPos.getLat() + delta * 0.00001, startPos.getLng()));

      if (activeMarker.value === marker) {
        activeMarkerAnimation.value = requestAnimationFrame(step);
      } else {
        marker.setPosition(startPos);
      }
    };

    activeMarkerAnimation.value = requestAnimationFrame(step);
  };

  // 마커 제거
  const clearAllMarkers = () => {
    placeMarkers.value.forEach(marker => {
      kakao.maps.event.removeListener(marker, 'click');
      marker.setMap(null);
    });
    placeMarkers.value = [];
  };

  const clearSearchResultMarkers = () => {
    searchResultMarkers.value.forEach(marker => {
      kakao.maps.event.removeListener(marker, 'click');
      marker.setMap(null);
    });
    searchResultMarkers.value = [];
  };

  // 검색 결과 마커 표시
  const displaySearchResultMarkers = (places, currentType, onMarkerClick) => {
    clearSearchResultMarkers();
    
    const newMarkers = places.map(place => {
      let placeType;
      if (currentType === 'restaurants') {
        placeType = 'restaurants';
      } else if (currentType === 'cafes') {
        placeType = 'cafes';
      } else {
        placeType = 'attractions';
      }
      
      return createSearchMarker(place, placeType, onMarkerClick);
    }).filter(Boolean);
    
    searchResultMarkers.value = newMarkers;
    console.log(`검색 결과 마커 ${searchResultMarkers.value.length}개 표시`);
  };

  // 선택된 장소 마커 표시
  const updateMapMarkers = (currentDayPlaces, onMarkerClick) => {
    clearAllMarkers();
    
    const newMarkers = currentDayPlaces.map(place => {
      let placeType;
      if (place.isHotel) {
        placeType = 'hotel';
      } else if (place.categoryCode === 'FD6') {
        placeType = 'restaurants';
      } else if (place.categoryCode === 'CE7') {
        placeType = 'cafes';
      } else {
        placeType = 'attractions';
      }
      
      return createSelectedMarker(place, placeType, onMarkerClick);
    }).filter(Boolean);
    
    placeMarkers.value = newMarkers;
    console.log(`선택된 마커 ${placeMarkers.value.length}개 표시`);
  };

  // 지도 초기화
  const initMap = (location, onMapIdle) => {
    console.log("지도 초기화 시작:", location);
    
    if (!window.kakao || !window.kakao.maps) {
      console.error("Kakao Maps API가 로드되지 않았습니다!");
      return;
    }
    
    window.kakao.maps.load(() => {
      const center = new kakao.maps.LatLng(location.lat, location.lng);
      map = new kakao.maps.Map(mapContainer.value, { 
        center, 
        level: 5 
      });
      
      mapInitialized = true;
      console.log(`지도 초기화 완료: ${location.name} (${location.lat}, ${location.lng})`);
      
      let mapIdleTimeout = null;
      kakao.maps.event.addListener(map, "idle", () => {
        if (mapIdleTimeout) {
          clearTimeout(mapIdleTimeout);
        }
        
        mapIdleTimeout = setTimeout(async () => {
          const center = map.getCenter();
          const lat = center.getLat();
          const lng = center.getLng();
          
          onMapIdle(lat, lng);
        }, 800);
      });
    });
  };

  // 지도 중심 이동
  const moveMapCenter = (lat, lng, level = null) => {
    if (!map) return;
    
    const position = new kakao.maps.LatLng(lat, lng);
    map.setCenter(position);
    
    if (level && map.getLevel() > level) {
      map.setLevel(level);
    }
  };

  // 마커 하이라이트
  const highlightMarker = (place) => {
    
    // 이전 마커 복원
    if (activeMarker.value) {
      try {
        const prev = activeMarker.value;
        prev.setZIndex(100);
      } catch (e) {
        console.warn("prev marker restore failed", e);
      }
      activeMarker.value = null;
    }

    // 새 마커 찾기
    // 선택된 마커(placeMarkers)와 검색 결과 마커(searchResultMarkers) 모두에서 찾기
    const clickedMarker = 
    (placeMarkers.value || []).find(m => m.getTitle() === place.title) ||
    (searchResultMarkers.value || []).find(m => m.getTitle() === place.title);

    if (clickedMarker) {
      clickedMarker.setZIndex(999);
      activeMarker.value = clickedMarker;
      animateMarkerBounce(clickedMarker);
    }
  };

  const getMap = () => map;

  return {
    mapContainer,
    placeMarkers,
    searchResultMarkers,
    activeMarker,
    activeMarkerAnimation,
    initMap,
    createSearchMarker,
    createSelectedMarker,
    clearAllMarkers,
    clearSearchResultMarkers,
    displaySearchResultMarkers,
    updateMapMarkers,
    moveMapCenter,
    highlightMarker,
    getMap
  };
}