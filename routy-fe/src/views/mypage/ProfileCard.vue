<!-- src/components/mypage/ProfileCard.vue -->
<script setup>
const props = defineProps({
  imageUrl: { type: String, default: '' },
  initials: { type: String, default: '여' },
  name: { type: String, default: '' },
  tagline: { type: String, default: '' },
  stats: {
    type: Object,
    default: () => ({ trips: 0, cities: 0, reviews: 0 })
  }
})
const emit = defineEmits(['edit'])
</script>

<template>
<div
  class="relative overflow-hidden rounded-2xl border border-[#60A5FA]/20 bg-white p-6 md:p-8 shadow-lg"
>
    <!-- 은은한 대각 그라데이션 하이라이트 -->
    <div class="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#E0F2FE]/40 via-transparent to-transparent"></div>

    <div class="relative flex items-center gap-6">
      <div class="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-white">
        <img
          v-if="imageUrl"
          :src="imageUrl"
          alt="프로필 이미지"
          class="w-full h-full object-cover"
        />
      </div>

      <!-- 텍스트/통계 -->
      <div class="flex-1 min-w-0">
        <h2 class="text-lg md:text-xl font-semibold text-gray-900 truncate">{{ name }}</h2>
        <p class="mt-1 text-sm text-gray-600 truncate">{{ tagline }}</p>

        <div class="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <div class="shrink-0">
            <span class="text-gray-500">여행 횟수</span>
            <span class="ml-2 font-medium text-[#3B82F6]">{{ stats.trips }}회</span>
          </div>
          <div class="shrink-0">
            <span class="text-gray-500">방문 도시</span>
            <span class="ml-2 font-medium text-[#3B82F6]">{{ stats.cities }}개</span>
          </div>
          <div class="shrink-0">
            <span class="text-gray-500">작성 리뷰</span>
            <span class="ml-2 font-medium text-[#3B82F6]">{{ stats.reviews }}개</span>
          </div>
        </div>
      </div>

      <!-- 정보 수정 버튼 -->
      <button
        type="button"
        class="hidden sm:inline-flex items-center justify-center rounded-lg border border-[#3B82F6]
               px-3 py-1.5 text-sm text-[#3B82F6] transition-colors hover:bg-[#3B82F6] hover:text-white"
        @click="emit('edit')"
      >
        정보 수정
      </button>
    </div>
  </div>
</template>
