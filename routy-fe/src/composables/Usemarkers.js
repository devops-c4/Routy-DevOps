import { ref } from 'vue';

// 마커 이미지 import
import restaurantMarker from '@/assets/images/icons/markers/restaurant-marker.svg';
import cafeMarker from '@/assets/images/icons/markers/cafe-marker.svg';
import attractionMarker from '@/assets/images/icons/markers/attraction-marker.svg';
import restaurantSelect from '@/assets/images/icons/markers/restaurant-select.png';
import cafeSelect from '@/assets/images/icons/markers/cafe-select.png';
import attractionSelect from '@/assets/images/icons/markers/attraction-select.png';
import hotelSelect from '@/assets/images/icons/markers/hotel-select.png';

export function useMarkers() {
  const placeMarkers = ref([]);
  const searchResultMarkers = ref([]);
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
  const createSearchMarker = (map, place, placeType, onClickCallback) => {
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
    
    if (onClickCallback) {
      kakao.maps.event.addListener(newMarker, 'click', () => onClickCallback(place));
    }
    
    return newMarker;
  };

  // 선택된 장소 마커 생성
  const createSelectedMarker = (map, place, placeType, onClickCallback) => {
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
    
    if (onClickCallback) {
      kakao.maps.event.addListener(newMarker, 'click', () => onClickCallback(place));
    }
    
    return newMarker;
  };

  // 마커 제거
  const clearMarkers = (markers) => {
    markers.forEach(marker => {
      kakao.maps.event.removeListener(marker, 'click');
      marker.setMap(null);
    });
    return [];
  };

  // 검색 결과 마커 표시
  const displaySearchResultMarkers = (map, places, currentType, onClickCallback) => {
    searchResultMarkers.value = clearMarkers(searchResultMarkers.value);
    
    const newMarkers = places.map(place => {
      let placeType;
      if (currentType === 'restaurants') {
        placeType = 'restaurants';
      } else if (currentType === 'cafes') {
        placeType = 'cafes';
      } else {
        placeType = 'attractions';
      }
      
      return createSearchMarker(map, place, placeType, onClickCallback);
    }).filter(Boolean);
    
    searchResultMarkers.value = newMarkers;
    console.log(`검색 결과 마커 ${searchResultMarkers.value.length}개 표시`);
  };

  // 선택된 장소 마커 표시
  const displaySelectedMarkers = (map, places, onClickCallback) => {
    placeMarkers.value = clearMarkers(placeMarkers.value);
    
    const newMarkers = places.map(place => {
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
      
      return createSelectedMarker(map, place, placeType, onClickCallback);
    }).filter(Boolean);
    
    placeMarkers.value = newMarkers;
    console.log(`선택된 마커 ${placeMarkers.value.length}개 표시`);
  };

  // 모든 마커 제거
  const clearAllMarkers = () => {
    placeMarkers.value = clearMarkers(placeMarkers.value);
    searchResultMarkers.value = clearMarkers(searchResultMarkers.value);
  };

  return {
    placeMarkers,
    searchResultMarkers,
    displaySearchResultMarkers,
    displaySelectedMarkers,
    clearAllMarkers
  };
}