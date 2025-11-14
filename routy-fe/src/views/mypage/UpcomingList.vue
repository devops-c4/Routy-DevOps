<script setup>
defineProps({ items: Array }) // [{title, color}]
</script>

<template>
  <div class="list">
    <div v-for="(it,i) in items" :key="i" class="row">
      <span class="dot" :style="{ background: it.color }"></span>
      <span class="title">{{ it.title }}</span>
    </div>
    <div class="more">+{{ Math.max(0, items.length - 3) }}개 더 보기</div>
  </div>
</template>

<style scoped>
.list { display:grid; gap: 10px; }
.row { display:flex; align-items:center; gap:8px; }
.dot { width:12px; height:12px; border-radius:9999px; }
.title { font-size:12px; color:#4A5565; }
.more { margin-top:6px; font-size:12px; color:#3B82F6; }
</style>
