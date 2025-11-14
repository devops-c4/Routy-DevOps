<script setup>
import { computed } from 'vue'

const props = defineProps({
  year: Number,
  month: Number, // 1~12
  events: { type: Array, default: () => [] } // [{date:'YYYY-MM-DD', title, color}]
})
const emit = defineEmits(['prev','next'])

const title = computed(() => {
  const m = new Date(props.year, props.month - 1, 1)
  return m.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long'})
})

const weeks = computed(() => {
  const y = props.year, m = props.month - 1
  const first = new Date(y, m, 1)
  const last = new Date(y, m + 1, 0)
  const start = new Date(first)
  start.setDate(first.getDate() - first.getDay()) // Sunday start
  const end = new Date(last)
  end.setDate(last.getDate() + (6 - last.getDay()))

  const days = []
  for (let d = new Date(start); d <= end; d.setDate(d.getDate()+1)) {
    const inMonth = d.getMonth() === m
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth()+1).padStart(2,'0')
    const dd = String(d.getDate()).padStart(2,'0')
    const key = `${yyyy}-${mm}-${dd}`

    const evt = props.events.filter(e => e.date === key)
    days.push({ date: new Date(d), inMonth, events: evt })
  }
  // 6 rows x 7 cols
  const out = []
  for (let i=0;i<42;i+=7) out.push(days.slice(i,i+7))
  return out
})
</script>

<template>
  <div class="mini">
    <div class="head">
      <button class="nav" @click="emit('prev')">‹</button>
      <div class="title">{{ title }}</div>
      <button class="nav" @click="emit('next')">›</button>
    </div>
    <div class="grid">
      <div class="dow" v-for="d in ['Su','Mo','Tu','We','Th','Fr','Sa']" :key="d">{{ d }}</div>
      <template v-for="(row, ri) in weeks" :key="ri">
        <div
          v-for="(cell, ci) in row" :key="ci"
          class="cell" :class="{ dim: !cell.inMonth }"
        >
          <div class="num">{{ cell.date.getDate() }}</div>
          <div class="dots">
            <span v-for="(e,i) in cell.events" :key="i" class="dot" :style="{ background: e.color }"></span>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.mini { width: 100%; max-width: 420px; margin: 0 auto; }
.head { display:flex; align-items:center; justify-content:center; gap: 12px; margin-bottom: 8px; }
.title { font-size:14px; color:#0A0A0A; }
.nav { width:28px; height:28px; border-radius:8px; border:1px solid rgba(0,0,0,0.1); opacity:.6; background:#fff; }
.grid {
  display:grid; grid-template-columns: repeat(7, 1fr);
  gap: 6px; align-items:start;
}
.dow { text-align:center; font-size:12.8px; color:#717182; padding:2px 0; }
.cell {
  aspect-ratio: 1.1 / 1; border-radius:8px; display:flex; flex-direction:column; align-items:center; padding-top:4px;
}
.cell.dim { opacity: .35; }
.num { font-size:14px; color:#0A0A0A; }
.dots { display:flex; gap:4px; margin-top:3px; }
.dot { width:10px; height:10px; border-radius:9999px; }
</style>
