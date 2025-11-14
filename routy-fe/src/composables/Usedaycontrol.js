import { ref, computed } from 'vue';
import apiClient from '@/utils/axios';

export function useDayControl() {
  const durations = ref([]);
  const selectedDay = ref(1);
  const completedDays = ref(new Set());

  // Duration 불러오기
  const loadDurations = async (planId, totalDays) => {
    try {
      durations.value = [];
      const res = await apiClient.get(`/api/plans/${planId}/durations`);
      const uniqueDays = new Set();
      let fetched = [];
      
      if (res.data && res.data.length > 0) {
        fetched = res.data
          .filter((d) => {
            if (uniqueDays.has(d.day)) return false;
            uniqueDays.add(d.day);
            return true;
          })
          .map((d) => ({
            durationId: d.durationId,
            planId: d.planId,
            day: d.day,
          }));
      } else {
        fetched = Array.from({ length: totalDays }, (_, i) => ({
          durationId: i + 1,
          planId,
          day: i + 1,
        }));
      }
      
      durations.value = fetched.sort((a, b) => a.day - b.day);
      console.log("Duration 로드 완료:", durations.value);
    } catch (err) {
      console.error("Duration 로드 실패:", err);
    }
  };

  // 일차 이동
  const goPrevDay = () => {
    if (selectedDay.value > 1) {
      selectedDay.value--;
    }
  };

  const goNextDay = () => {
    if (selectedDay.value < durations.value.length) {
      selectedDay.value++;
    }
  };

  const selectDay = (day) => {
    selectedDay.value = day;
  };

  // 일정 종료
  const endDaySchedule = () => {
    const day = selectedDay.value;
    if (completedDays.value.has(day)) {
      alert("이미 종료된 일정입니다.");
      return;
    }
    
    if (confirm(`${day}일차 일정을 종료하시겠습니까?\n종료 후에는 수정할 수 없습니다.`)) {
      completedDays.value.add(day);
      alert(`${day}일차 일정이 종료되었습니다.`);
    }
  };

  // 현재 일차가 종료되었는지 확인
  const isDayCompleted = computed(() => completedDays.value.has(selectedDay.value));

  return {
    durations,
    selectedDay,
    completedDays,
    isDayCompleted,
    loadDurations,
    goPrevDay,
    goNextDay,
    selectDay,
    endDaySchedule
  };
}