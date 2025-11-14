import { ref } from 'vue';
import apiClient from '@/utils/axios';

export function useHotelModal() {
  const showHotelModal = ref(false);
  const hotels = ref([]);
  const hotelMapContainer = ref(null);
  let hotelMap = null;

  const openHotelModal = async (startLocation) => {
    showHotelModal.value = true;
    
    try {
      const res = await apiClient.get(`/api/kakao/hotels`, { 
        params: { 
          lat: startLocation.lat, 
          lng: startLocation.lng 
        } 
      });
      hotels.value = res.data.documents.map((p) => ({
        title: p.place_name,
        latitude: parseFloat(p.y),
        longitude: parseFloat(p.x),
        categoryGroupName: p.category_group_name,
        addressName: p.road_address_name || p.address_name,
        placeUrl: p.place_url,
      }));
    } catch (e) {
      console.error("숙소 로드 실패:", e);
    }
  };

  const closeHotelModal = () => {
    showHotelModal.value = false;
  };

  const addHotel = (hotel, selectedDay, placesByDay, updateMapMarkers) => {
    const day = selectedDay;
    if (!placesByDay[day]) placesByDay[day] = [];
    
    if (!placesByDay[day].find((x) => x.title === hotel.title)) {
      placesByDay[day].push({ 
        ...hotel,
        title: hotel.title,
        placeName: hotel.title,
        isHotel: true,
        startTime: '',
        endTime: ''
      });
    }
    
    alert(`${hotel.title}이(가) ${day}일차 일정에 추가되었습니다!`);
    updateMapMarkers();
    closeHotelModal();
  };

  const focusHotelOnMap = (hotel) => {
    if (!hotelMap) return;
    const pos = new kakao.maps.LatLng(hotel.latitude, hotel.longitude);
    hotelMap.panTo(pos);
  };

  return {
    showHotelModal,
    hotels,
    hotelMapContainer,
    openHotelModal,
    closeHotelModal,
    addHotel,
    focusHotelOnMap
  };
}