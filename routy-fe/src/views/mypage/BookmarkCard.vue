<script setup>
const props = defineProps({ item: Object })
const emit = defineEmits(['openModal'])
</script>

<template>
  <div class="card" @click="emit('openModal',props.item.id)">
    <div class="top">
      <div class="flag"></div>
      <span class="count">{{ item.count }}</span>
    </div>
    <div class="title">{{ item.title }}</div>
    <div class="tag">{{ item.type }}</div>
  </div>
</template>

<style scoped>
.card {
  background: linear-gradient(180deg,#fff 0%, #E0F2FE 100%);
  border: .8px solid rgba(96,165,250,.2);
  border-radius: 10px; padding: 20px; display:grid; gap: 12px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.card:hover {
  transform: scale(1.03);
}

.top { display:flex; justify-content:space-between; align-items:center; }
.flag { width: 20px; height:20px; background:#3B82F6; }
.count {
  background:#E0F2FE; color:#155DFC; font-size:12px;
  border-radius:8px; padding:2px 8px;
}
.title { font-size:16px; color:#101828; }
.tag { font-size:14px; color:#6A7282; }
</style>
