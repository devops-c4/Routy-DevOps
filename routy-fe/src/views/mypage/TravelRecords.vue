<script setup>
defineProps({ items: Array })
</script>

<template>
  <div class="grid">
    <div v-for="it in items" :key="it.id" class="item">
      <div class="thumb">
        <!-- 이미지가 없으니 그라데이션+아이콘 대체 -->
        <div class="icon"></div>
      </div>
      <div class="title">{{ it.title }}</div>
      <div class="date">{{ it.date }}</div>
      <div class="desc">{{ it.desc }}</div>
    </div>
  </div>
</template>

<style scoped>
.grid { display:grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.item { display:grid; gap: 6px; }
.thumb {
  height: 184px; border-radius: 10px;
  background: linear-gradient(180deg,#60A5FA 0%, #3B82F6 100%);
  display:flex; align-items:center; justify-content:center;
}
.icon {
  width: 48px; height:48px; border:4px solid rgba(255,255,255,.3);
}
.title { font-size:16px; color:#101828; margin-top: 8px; }
.date { font-size:14px; color:#6A7282; }
.desc { font-size:14px; color:#4A5565; }
@media (max-width: 900px) {
  .grid { grid-template-columns: 1fr; }
}
</style>
