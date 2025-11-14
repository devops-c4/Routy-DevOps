<template>
  <div class="travel-layout">
    <router-view /> <!-- 여기에 Step1~4 단계 컴포넌트가 표시됨 -->
  </div>
</template>

<script setup>
</script>

<style scoped>
.travel-layout {
  width: 100%;
  min-height: 100vh;
  padding: 40px 10%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}
</style>
