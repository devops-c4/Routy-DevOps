<template>
  <div id="app">
      <Header /> 
    <router-view />

    <Footer />
  </div>
</template>

<script setup>
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { onMounted } from 'vue';
import { syncAuthStatus } from '@/api/auth';

onMounted(async () => {     // 새로고침 시에도 로그인(인증) 상태를 유지.
  await syncAuthStatus(); 
});
</script>

<style>
#app {
  font-family: 'Noto Sans KR', sans-serif;
  background: linear-gradient(135deg, #EFF6FF 0%, white 50%, #F0FDF4 100%);
}
</style>
