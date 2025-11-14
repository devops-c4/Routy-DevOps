<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="calendar-box">
      <h3>여행 날짜 선택</h3>

      <div class="calendar-inputs">
        <label>시작일</label>
        <input type="date" v-model="start" />

        <label>종료일</label>
        <input type="date" v-model="end" />
      </div>

      <div class="btn-row">
        <button class="btn confirm" @click="confirm">확인</button>
        <button class="btn cancel" @click="$emit('close')">취소</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['close', 'confirm'])
const start = ref('')
const end = ref('')

const confirm = () => {
  if (!start.value || !end.value) {
    alert('시작일과 종료일을 모두 선택해주세요.')
    return
  }
  emit('confirm', { startDate: start.value, endDate: end.value })
}
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.calendar-box {
  background: white;
  border-radius: 10px;
  padding: 24px;
  width: 320px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
.calendar-inputs {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}
.btn-row {
  display: flex;
  justify-content: space-between;
}
.btn {
  padding: 8px 14px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}
.btn.confirm {
  background: #155dfc;
  color: #fff;
}
.btn.cancel {
  background: #f3f4f6;
}
</style>
