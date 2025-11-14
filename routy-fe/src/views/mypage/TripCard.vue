<script setup>
defineProps({
  trip: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <article class="card" :style="{ borderLeftColor: trip.statusColor }">
    <header class="head">
      <h4>{{ trip.title }}</h4>
      <span class="pill" :style="{ background: trip.statusColor }">예정</span>
    </header>

    <div class="tags">
      <span class="chip" :style="{ background: trip.statusColor }">{{ trip.tag }}</span>
    </div>

    <div class="meta">
      <div class="row"><span class="label">도시</span><span class="val">{{ trip.city }}</span></div>
      <div class="row"><span class="label">이동</span><span class="val">{{ trip.transport }}</span></div>
      <div class="row"><span class="label">기간</span><span class="val">{{ trip.days }}</span></div>
      <div class="row" v-if="trip.period"><span class="label">일정</span><span class="val muted">{{ trip.period }}</span></div>
    </div>
  </article>
</template>

<style scoped>
.card {
  background: linear-gradient(180deg,#E0F2FE 0%, #fff 100%);
  border-radius: 14px; border-left: 4px solid #3B82F6;
  padding: 20px 20px 16px 24px;
}
.head { display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px; }
h4 { font-size:16px; color:#101828; font-weight:600; }
.pill { color:#fff; font-size:12px; border-radius:8px; padding:2px 8px; }
.tags { margin-bottom: 12px; }
.chip {
  color: #fff;
  border-radius: 9999px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  box-shadow: 
    0 4px 6px -1px rgba(59, 130, 246, 0.3),
    0 2px 4px -1px rgba(59, 130, 246, 0.2);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}
.meta {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px 20px;
}
.row { display:flex; align-items:center; gap:8px; }
.label { font-size:14px; color:#4A5565; min-width:36px; }
.val { font-size:14px; color:#4A5565; }
.muted { color:#6A7282; }
</style>
