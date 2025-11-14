<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { jwtDecode } from 'jwt-decode' // 설치 안 돼 있으면: npm i jwt-decode
import BrowseTravelModal from '@/views/browse/BrowseTravelModal.vue'
import TravelReviewModal from '@/views/mypage/TravelReviewModal.vue'
import BookmarkCard from '@/views/mypage/BookmarkCard.vue'
import apiClient from '@/utils/axios'

// 이미지 임포트
import themeRestaurant from '@/assets/images/theme/recommend-restaurant.png';
import themeCafe from '@/assets/images/theme/recommend-cafe.png';
import themeTourist from '@/assets/images/theme/recommend-attraction.png';

import locationIcon from '@/assets/images/icons/location.svg';
import calendarIcon from '@/assets/images/icons/calendar.svg';


// 리뷰 이미지 썸네일 캐시 (planId -> url)
const reviewThumbMap = ref({})

const isHttp = (u) => typeof u === 'string' && /^https?:\/\//i.test(u)

const router = useRouter()

const showBrowseModal = ref(false);
function openBrowseModal(planId) {
  selectedPlanId.value = planId;
  showBrowseModal.value = true;
}

function onReviewSaved() {
  // 닫기는 자식에서 emit('close')로 처리하니 여기선 갱신만
  fetchAllTravelHistory?.(); // 있으면 호출
  fetchAllBookmarks?.();     // 선택
  // 혹은 상세 재조회
  // refreshPlanDetail?.(selectedPlanId.value)
}

// 여행 기록에서 상세 페이지로 넘어갈때 사용되는 함수
function goToPlanDetail(planId) {
  router.push(`/mypage/travel/${planId}`)
}

// 정보수정 버튼 클릭시 정보 수정 페이지로 넘어가는 함수
function goToModifyUser() {
  router.push('/mypage/modify')
}

// 북마크 모달 상태
const showModal = ref(false)
const selectedPlan = ref(null)

// 리뷰 모달 상태
const showReviewModal = ref(false)
const selectedPlanId = ref(null)
const selectedTitle = ref('')

// 여행기록 카드 클릭 시 리뷰 모달 열기
function openReviewModal(planId, title) {
  selectedPlanId.value = planId
  selectedTitle.value = title || ''
  showReviewModal.value = true
}

// 썸네일이 비어 있는 기록들에 대해 첫 리뷰이미지(S3 URL) 가져오기
async function hydrateThumbnails() {
  const list = travelHistoryRaw.value ?? []
  console.log('🔎 hydrate start: records=', list.length)

  const targets = list.filter(t =>
    t?.planId &&
    (!t.thumbnailUrl || !isHttp(t.thumbnailUrl)) &&
    !reviewThumbMap.value[t.planId]
  )
  console.log('🎯 hydrate targets=', targets.map(t => t.planId))

  for (const t of targets) {
    const pid = t.planId
    try {
      const res = await apiClient.get(`/api/plans/${pid}/reviews/form`)
      const f0 = res.data?.files?.[0] || null

      // S3 절대 URL만 채택, 아니면 폐기
      const firstUrl =
        (isHttp(f0?.filePath) ? f0.filePath : null) ??
        (isHttp(f0?.url) ? f0.url : null) ??
        null

      console.log('reviews/form resp:', pid, {
        hasFiles: !!res.data?.files?.length,
        firstUrl,
        raw: f0
      })

      if (firstUrl) {
        reviewThumbMap.value = { ...reviewThumbMap.value, [pid]: firstUrl }
        console.log('썸네일 주입:', pid, firstUrl)
      } else {
        console.log('파일 없음 or 비정상 URL:', pid)
      }
    } catch (e) {
      console.warn('reviews/form 실패:', pid, e?.response?.status, e?.response?.data || e?.message)
    }
  }
}

// 리뷰 저장 후 리스트 갱신 훅 (필요 시)
async function refreshHistory() {
  await fetchAllTravelHistory()
   // 재하이드
  hydrateThumbnails()
}

// 리뷰 모달 닫기
function closeReviewModal() {
  showReviewModal.value = false
  selectedPlanId.value = null
  selectedTitle.value = ''
}

// 북마크 모달 열기 함수
const openBookmarkModal = async (planId) => {
  try {
    const res = await apiClient.get(`/api/mypage/bookmark/public/${planId}`)
    selectedPlan.value = res.data
    showModal.value = true
  } catch (err) {
    console.error('모달 데이터 로드 실패:', err)
  }
}

const recordLimit = ref(3)    // 한 페이지당 갯수
const isExpanded = ref(false) // '접기' 기능


/* ====== 달력 상태 ====== */
const now = new Date()
const year  = ref(now.getFullYear())
const month = ref(now.getMonth()) // JS는 0부터라서 11이면 12월

/* ====== 백엔드에서 오는 데이터 담을 곳 ====== */
const profile = ref(null)
const calendarPlans = ref([])        // 백엔드 calendar.plans
const upcomingPlans = ref([])        // 백엔드 upcomingPlans
const travelHistoryRaw = ref([])     // ⬅ 전체 여행기록 여기
const bookmarksRaw = ref([])         // ⬅ 전체 북마크 여기

const loading = ref(false)
const error = ref(null)

/* ====== 유틸 ====== */
const pad2   = n => String(n).padStart(2, '0')
const ymd    = (y,m,d) => `${y}-${pad2(m+1)}-${pad2(d)}`
const daysIn = (y,m) => new Date(y, m+1, 0).getDate()
const startDow = (y,m) => new Date(y, m, 1).getDay()

/* ====== 1. 월별 마이페이지 데이터 호출 (프로필/달력/다가오는 일정) ====== */
const fetchMyPage = async () => {
  loading.value = true
  error.value = null
  try {
    const res = await apiClient.get('/api/mypage', {
      params: {
        year: year.value,
        month: month.value + 1, // 백엔드는 1~12
      },
    })
    console.log('📦 백엔드 응답 데이터:', res.data)

    const data = res.data

    // 1) 프로필
    profile.value = {
      profileImage: data.profile?.profileImage ?? '',
      avatarText: data.profile?.username
        ? data.profile.username[0]
        : '유',
      nickname: data.profile?.username ?? '사용자',
      bio: '',
      reviewCount: data.profile?.totalReviewCount ?? 0,
      likesCount: data.profile?.totalLikeReceived ?? 0,
      bookmarkCount: data.profile?.totalBookmarkCount ?? 0,
      tripCount: data.profile?.totalPlanCount ?? 0,
    }

    // 2) 달력
    calendarPlans.value = data.calendar?.plans ?? []

    // 3) 내 일정 (백엔드 -> 프론트 구조로 변환)
    upcomingPlans.value = (
      Array.isArray(data.upcomingPlans)
        ? data.upcomingPlans
        : (data.upcomingPlans ? [data.upcomingPlans] : [])
    ).map(p => ({
      id: p.planId,
      title: p.title,
      color: 'blue',
      theme: '일정',
      region: p.regionName,
      transportation: '',
      startDate: p.startDate,
      endDate: p.endDate,
      duration: p.durationLabel,
      status: p.status,
    }))

    // 4) 여행 기록 - 이제 이걸 실제로 써먹자
    travelHistoryRaw.value = data.travelHistory ?? []

    // 5) 북마크
    const bookmarkRes = await apiClient.get('/api/mypage/bookmarks')
    bookmarksRaw.value = bookmarkRes.data ?? []

  } catch (e) {
    console.error(e)
    error.value = '데이터를 불러오지 못했어요.'
  } finally {
    loading.value = false
  }
}

/* ====== 2. 여행기록 전체 호출 ====== */
/* 백엔드에서 전체를 주는 엔드포인트로 바꿔줘 */
const fetchAllTravelHistory = async () => {
  try {
    const res = await apiClient.get('/api/mypage/travel-history') 
    console.log('📦 여행기록 API 응답:', res.data)
    travelHistoryRaw.value = res.data ?? []
    // 목록 갱신 후 썸네일 하이드레이션
    await hydrateThumbnails()
  } catch (e) {
    console.warn('전체 여행기록 호출 실패:', e?.response?.status, e?.response?.data || e?.message)
  }
}

/* ====== 3. 북마크 전체 호출 ====== */
const fetchAllBookmarks = async () => {
  try {
    const res = await apiClient.get('/api/mypage/bookmarks')
    bookmarksRaw.value = res.data ?? []
  } catch (e) {
    console.warn('전체 북마크 호출 실패:', e)
  }
}

/* 첫 진입 시 호출 */
onMounted(async () => {
  // 1) 기본 마이페이지 (월별)
  await fetchMyPage()
  // 2) 전체 여행기록 + 전체 북마크
  await fetchAllTravelHistory()  // 여기서 목록 로드 + 내부에서 hydrateThumbnails 호출
  await fetchAllBookmarks()
})

/* 달이 바뀔 때마다 다시 호출 (이때는 달력/다가오는 일정만 갱신하면 됨) */
watch([year, month], () => {
  fetchMyPage()
})

/* ====== 여행 횟수 표시 ====== */
const tripCount = computed(() => profile.value?.tripCount ?? 0)

/* ====== 일정 상태 계산 유틸 ====== */
function dday(startStr, endStr) {
  const today = new Date(); today.setHours(0,0,0,0)
  const start = new Date(startStr); start.setHours(0,0,0,0)
  const end = new Date(endStr); end.setHours(0,0,0,0)

  if (today < start) {
    const diff = Math.ceil((start - today) / (1000*60*60*24))
    return { text: `D-${diff}`, cls: 'warn' }
  } else if (today >= start && today <= end) {
    return { text: '진행중', cls: 'ok' }
  } else {
    return { text: '완료', cls: 'done' }
  }
}

/* ====== 전체 일정 상태 매핑 ====== */
const allSchedules = computed(() => {
  return upcomingPlans.value.map(s => {
    const { text, cls } = dday(s.startDate, s.endDate)
    return { ...s, stateText: text, stateClass: cls }
  })
})

/* ====== 내 일정 (현재 + 예정) ====== */
const viewSchedules = computed(() => {
  return allSchedules.value.filter(s => s.stateText !== '완료')
})

/* ====== 여행 기록 (이제는 전체 travelHistoryRaw 기준) ====== */
// const travelRecords = computed(() => {
//   return (travelHistoryRaw.value ?? []).map(t => ({
//     id: t.planId,
//     title: t.planTitle || t.title,
//     desc: `${t.startDate} ~ ${t.endDate}`,
//     thumbnailUrl: t.thumbnailUrl ?? '',
//   }))
// })
const travelRecords = computed(() => {
  return (travelHistoryRaw.value ?? []).map(t => {
    const pid = t?.planId

    // 캐시 → 백엔드 썸네일 → 없으면 ''
    const rawThumb = reviewThumbMap.value[pid] || t.thumbnailUrl || ''
    const thumb = isHttp(rawThumb) ? rawThumb : '' // 절대 URL만 사용

    return {
      id: pid,
      title: t.planTitle || t.title,
      desc: `${t.startDate} ~ ${t.endDate}`,
      thumbnailUrl: thumb,
    }
  })
})

/* "다가오는 여행 n건" 카운트 */
const upcomingCount = computed(() => {
  const today = new Date(); today.setHours(0,0,0,0)
  return upcomingPlans.value.filter(s => {
    const start = new Date(s.startDate); start.setHours(0,0,0,0)
    return start >= today
  }).length
})

/* 달력 라벨 & 날짜 */
const blanks = computed(() => Array.from({ length: startDow(year.value, month.value) }, (_, i) => i))
const days   = computed(() => Array.from({ length: daysIn(year.value, month.value) }, (_, i) => i+1))
const monthLabel = computed(() => `${year.value}년 ${month.value+1}월`)

/* 달력 색칠 */
const dateColorMap = computed(() => {
  const map = {}
  const plans = calendarPlans.value ?? []

  plans.forEach((p, idx) => {
    const colorList = ['blue', 'red', 'green', 'blue', 'red']
    const color = colorList[idx % colorList.length]

    const start = new Date(p.startDate)
    const end = new Date(p.endDate)
    start.setHours(0, 0, 0, 0)
    end.setHours(0, 0, 0, 0)
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
      map[key] = color
    }
  })

  return map
})

function prevMonth(){ 
  month.value === 0  ? (year.value--, month.value = 11) : month.value-- 
}
function nextMonth(){ 
  month.value === 11 ? (year.value++, month.value = 0 ) : month.value++ 
}

/* 북마크 카드용 변환 (이제는 전체 bookmarksRaw 기준) */
const bookmarks = computed(() =>
  (bookmarksRaw.value ?? []).map(b => ({
    id: b.planId, //  이 부분을 bookmarkId → planId 로 수정
    title: b.planTitle,
    type: '여행일정',
    count: b.bookmarkCount ?? 0,
  }))
)


/* 날짜 포맷 */
function formatDateRange(start, end) {
  const s = new Date(start), e = new Date(end)
  return `${s.getFullYear()}.${pad2(s.getMonth()+1)}.${pad2(s.getDate())} - ${pad2(e.getMonth()+1)}.${pad2(e.getDate())}`
}

// === 내 일정 페이지네이션 ===
const page = ref(1)
const perPage = 3

const pagedSchedules = computed(() => {
  const start = (page.value - 1) * perPage
  return viewSchedules.value.slice(start, start + perPage)
})

const totalPages = computed(() => Math.ceil(viewSchedules.value.length / perPage))

function nextPage() {
  if (page.value < totalPages.value) page.value++
}

function prevPage() {
  if (page.value > 1) page.value--
}

// 여행 기록 '더 보기' 기능 (기존 로직은 남겨둠 - 필요없으면 템플릿에서만 안 쓰면 됨)
const limitedTravelRecords = computed(() => {
  return isExpanded.value
    ? travelRecords.value // 전체 보기
    : travelRecords.value.slice(0, recordLimit.value)
})
function toggleRecords() {
  isExpanded.value = !isExpanded.value
}

// 북마크 전체/축약 토글 (기존 로직은 남겨둠 - 필요없으면 템플릿에서만 안 쓰면 됨)
const bookmarkExpanded = ref(false)
const limitedBookmarks = computed(() => {
  return bookmarkExpanded.value
    ? bookmarks.value
    : bookmarks.value.slice(0, 4)
})
function toggleBookmarks() {
  bookmarkExpanded.value = !bookmarkExpanded.value
}
</script>


<template>
   <!-- 페이지 래퍼 -->
  <div class="page-wrap">
    <div class="content-wrapper">
      <!-- 프로필 바 -->
      <section class="card profile-card" v-if="profile">
        <div class="avatar">
          <img
            v-if="profile && profile.profileImage"
            :src="profile.profileImage"
            alt="프로필 이미지"
            class="profile-img"
          />
          <span v-else>{{ profile.avatarText }}</span>
        </div>

        <div class="pinfo">
          <div class="nickname">{{ profile.nickname }}</div>
          <div class="bio">{{ profile.bio }}</div>

          <div class="stats">
            <div class="stat">
              <span class="label">여행 횟수</span>
              <a class="value linkish">{{ tripCount }}회</a>
            </div>
            <div class="stat">
              <span class="label">작성 리뷰</span>
              <a class="value linkish">{{ profile.reviewCount }}개</a>
            </div>
            <div class="stat">
              <span class="label">좋아요 받은 수</span>
              <a class="value linkish">{{ profile.likesCount }}개</a>
            </div>
            <div class="stat">
              <span class="label">북마크 한 일정 수</span>
              <a class="value linkish">{{ profile.bookmarkCount }}개</a>
            </div>
          </div>
        </div>

        <button class="btn ghost edit" type="button" @click="goToModifyUser">
          정보 수정
        </button>
      </section>

      <!-- 2열: 달력 + 내 일정 -->
      <section class="grid-2">
        <!-- 달력 카드 -->
        <article class="card calendar">
          <header class="card__title">여행 달력</header>

          <div class="calendar__head">
            <button class="btn mini" type="button" @click="prevMonth" aria-label="이전 달">◀</button>
            <strong>{{ monthLabel }}</strong>
            <button class="btn mini" type="button" @click="nextMonth" aria-label="다음 달">▶</button>
          </div>

          <div class="calendar__grid">
            <span class="dow">S</span><span class="dow">M</span><span class="dow">T</span>
            <span class="dow">W</span><span class="dow">T</span><span class="dow">F</span><span class="dow">S</span>

            <span v-for="i in blanks" :key="'b'+i"></span>

            <span
              v-for="d in days"
              :key="d"
              class="day"
              :class="dateColorMap[ymd(year, month, d)] ? ['event', dateColorMap[ymd(year, month, d)]] : ''"
            >
              {{ d }}
            </span>
          </div>
        </article>

        <!-- 내 일정 카드 -->
        <article class="card schedule">
          <header class="card__title">나의 루트</header>

                <ul class="todo">
                  <li
        v-for="s in pagedSchedules"
        :key="s.id"
        class="todo__item"
        :data-color="s.color"
        @click="goToPlanDetail(s.id)"
        style="cursor: pointer;"
      >
        <div class="left">
          <div class="pill" :class="s.color">
            <img 
              v-if="s.theme==='카페탐방'" 
              :src="themeCafe" 
              class="theme-icon"
              alt="카페"
            />
            <img 
              v-else-if="s.theme==='맛집탐방'" 
              :src="themeRestaurant" 
              class="theme-icon"
              alt="맛집"
            />
            <img 
              v-else 
              :src="themeTourist" 
              class="theme-icon"a
              alt="관광"
            />
            {{ s.theme }}
          </div>

          <div class="tt">{{ s.title }}</div>

          <div class="meta-row">
            <div class="meta">
              <img :src="locationIcon" class="meta-icon" alt="위치" />
              {{ s.region }}
            </div>
            <div class="meta" v-if="s.transportation">
              {{ s.transportation }}
            </div>
            <div class="meta">
              <img :src="calendarIcon" class="meta-icon" alt="날짜" />
              {{ formatDateRange(s.startDate, s.endDate) }}
            </div>
          </div>
        </div>

        <div class="right">
          <span class="state" :class="s.stateClass">{{ s.stateText }}</span>
        </div>
      </li>
          </ul>

          <div class="pagination">
            <button class="btn mini" type="button" @click="prevPage" :disabled="page===1">이전</button>
            <span class="page-info">{{ page }} / {{ totalPages }}</span>
            <button class="btn mini" type="button" @click="nextPage" :disabled="page===totalPages">다음</button>
          </div>
        </article>
      </section>

      <!-- 여행 기록 -->
      <section class="card block">
        <header class="block__title">여행 기록</header>

        <!-- 원페이지-->
        <div class="thumb-row scroll-box">
          <div
            v-for="r in travelRecords"
            :key="r.id"
            class="thumb bluegrad cursor-pointer hover:opacity-90 transition"
            @click="openReviewModal(r.id, r.title)"
            tabindex="0"
            
          >

            <!-- 배경 이미지 레이어 (있을 때만) -->
             <div class="thumb-img-wrapper">
          <div
            v-if="r.thumbnailUrl"
            class="thumb-bg"
            :style="{ backgroundImage: `url(${r.thumbnailUrl})` }"
            ></div>
            <img :src="locationIcon" class="pin-icon" alt="위치" />
            </div>
            <div class="thumb-info">
            <b>{{ r.title }}</b>
            <small>{{ r.desc }}</small>
            </div>
          </div>
        </div>

      </section>

      <!-- 북마크 -->
      <section class="card bookmarks section">
        <header class="block__title">북마크</header>

        <div class="bm-grid">
          <!-- BookmarkCard 컴포넌트로 교체 -->
          <BookmarkCard
            v-for="b in bookmarks"
            :key="b.id"
            :item="b"
            @openModal="openBookmarkModal"
          />
        </div>
      </section>

    </div>
    <!-- 모달 컴포넌트 (페이지 하단) -->
     <!-- BrowseTravelModal 읽기 전용 모드(좋아요, 조회 수, 북마크 기능 사용 불가)-->
      </div>
      <BrowseTravelModal
          v-if="showModal"
          :route="selectedPlan"
          :readOnly="true"   
          @close="showModal = false"
      />
       <!-- 리뷰 작성 모달 -->

      <TravelReviewModal
        v-if="showReviewModal"
        :plan-id="selectedPlanId"
        :title="selectedTitle"
        @close="showReviewModal = false"
          @saved="onReviewSaved"
          @openBrowse="openBrowseModal"
      />

</template>

<style>
:root{
  --gap-section: 40px;
  --main-gap: 32px;
  --gap-card: 24px;
}
.page-wrap > section + section{
  margin-top: var(--gap-section);
}
</style>

<style scoped>
/* 전체 배경 */
.page-wrap {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(148deg, #eff6ff 0%, white 50%, #f0fdf4 100%);
  display: flex;
  justify-content: center;
  padding: 60px 0 100px;
}
.page-wrap > .content-wrapper {
  width: 1120px;
  display: flex;
  flex-direction: column;
  gap: var(--gap-section);
}

/* 카드 공통 */
.card{
  width:100%;
  background:#fff;
  border:1px solid #E5E7EB;
  border-radius:16px;
  box-shadow:0 10px 30px rgba(16,24,40,.08);
  overflow:hidden;
  box-sizing:border-box;
}
.card__title{ padding:16px 16px 0; font-weight:600; }

/* 프로필 바 */
.profile-card{
  display:flex; align-items:center; gap:20px; padding:16px;
  background:linear-gradient(90deg,#ffffff 30%,#f7fbff 100%);
}

.avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: white;
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.profile-img {
  width: 100px;
  height: 100px;
  border-radius: 50%;       /* 원형 유지 */
  object-fit: cover;        /* 비율 유지하면서 꽉 채우기 */
  object-position: center;  /* 중앙 정렬 */
  background-color: #f3f3f3; /* 이미지 없을 때 배경 */
}

.pinfo{ display:flex; flex-direction:column; gap:6px; }
.nickname{ font-size:18px; font-weight:700; }
.bio{ color:#667085; font-size:13px; }
.stats{ display:flex; gap:24px; margin-top:4px; }
.stat{ display:flex; gap:8px; align-items:center; font-size:14px; }
.stat .label{ color:#667085; }
.linkish{ color:#2563eb; cursor:pointer; text-decoration:none; }
.edit{ margin-left:auto; }

/* 2열 그리드 */
.grid-2{
  display:grid;
  grid-template-columns: 1.15fr 1fr;
  gap: var(--main-gap);
  align-items:stretch;
  grid-auto-rows: 1fr;
}

.calendar, .schedule{
  min-height: 420px;
  display:flex;
  flex-direction:column;
  width:100%;
  max-width:100%;
}

/* 달력 */
.calendar{ padding:12px 16px 16px; }
.calendar__head{ display:flex; align-items:center; gap:8px; justify-content:center; margin:10px 0; }
.calendar__grid{ display:grid; grid-template-columns:repeat(7,1fr); gap:6px; padding:8px 0; }
.dow{ color:#667085; font-size:12px; text-align:center; }
.day{
  height:34px; border-radius:10px; display:grid; place-items:center;
  background:#F8FAFC; border:1px solid transparent;
}
.day.event.blue  { background:rgba(59,130,246,.16);  border-color:rgba(59,130,246,.35); }
.day.event.red   { background:rgba(239,68,68,.16);    border-color:rgba(239,68,68,.35); }
.day.event.green { background:rgba(16,185,129,.16);   border-color:rgba(16,185,129,.35); }

/* 내 일정 */
.schedule{ padding:12px 16px 18px; }
.todo{
  list-style:none; padding:8px 4px 8px; margin:0;
  display:flex; flex-direction:column;
  gap: var(--gap-card);
}
.todo__item{
  display:flex; justify-content:space-between; align-items:flex-start; gap:12px;
  padding:14px; border:1px solid #E5E7EB; border-radius:14px;
  background:linear-gradient(90deg, #eef7ff 0%, #ffffff 100%);
}
.todo__item[data-color="red"]   { background:linear-gradient(90deg, rgba(255,240,240,.9) 0%, #ffffff 100%); }
.todo__item[data-color="green"] { background:linear-gradient(90deg, rgba(237,249,245,.9) 0%, #ffffff 100%); }
.left{ display:flex; flex-direction:column; gap:8px; }
.tt{ font-weight:700; font-size:16px; }
.meta-row{ display:flex; flex-wrap:wrap; gap:14px; color:#475569; font-size:13px; }
.meta i{ margin-right:4px; }

/* 테마 배지 */
.pill{
  display:inline-flex; gap:6px; align-items:center;
  padding:6px 10px; border-radius:999px; font-size:12px; font-weight:700; color:#000000; width:max-content;
}
.pill.blue{ background:#d4ede4; } .pill.red{ background:#EF4444; } .pill.green{ background:#10B981; }

/* 상태 */
.right{ display:flex; align-items:center; }
.state{ padding:6px 10px; border-radius:999px; font-size:12px; font-weight:700; }
.state.ok{   background:#E0F2FE; color:#0369A1; }
.state.warn{ background:#FEF3C7; color:#B45309; }
.state.plan{ background:#E4E7EC; color:#344054; }
.state.done{ background:#F1F5F9; color:#475569; }

/* 여행 기록 */
.block{ padding:12px 12px 14px; }
.block__title{ padding:4px 4px 8px 6px; font-weight:700; }
.thumb-row{
  display:grid;   grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}
.thumb{
  height:200px; border-radius:14px; padding:0; color:#fff;
  display:flex; flex-direction:column; justify-content:flex-end; gap:2px;
  box-shadow:inset 0 0 1px rgba(255,255,255,.25); position:relative;
  overflow: hidden;
}
/* 배경 이미지 레이어 */
.thumb-bg{
  position:absolute; inset:0;
  background-size: cover; background-position: center;
  filter: brightness(0.7);
  border-radius: 14px;
}
.bluegrad{ background:linear-gradient(180deg, #60A5FA 0%, #3B82F6 100%); }
/* 테마 아이콘 */
.theme-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
}

/* 메타 아이콘 */
.meta-icon {
  width: 14px;
  height: 14px;
  object-fit: contain;
  margin-right: 4px;
  vertical-align: middle;
}

/* 핀 아이콘 */
.pin-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
  position: absolute;
  left: 12px;
  top: 10px;
  filter: brightness(0) invert(1); /* 흰색으로 변경 */
}

.thumb b{ font-weight:700; } .thumb small{ opacity:.95; }

/* 내부 스크롤 공통 */
/* .scroll-box {
  max-height: 250px; 
  overflow-y: auto;
  padding-right: 4px;
} */

/* 버튼 */
.btn{ border:1px solid #E5E7EB; background:#fff; padding:8px 12px; border-radius:10px; cursor:pointer; }
.btn.mini{ padding:6px 10px; font-size:12px; }
.btn.ghost{ background:#F8FAFC; }

/* 북마크 */
.bookmarks{ padding:16px; }
.bm-grid{
  display:grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--gap-card);
}
.bm-card{
  position:relative;
  border:1px solid #E6EEF9;
  border-radius:14px;
  padding:16px;
  background: linear-gradient(180deg,#F8FBFF 0%, #E7F1FF 100%);
  box-shadow: 0 6px 18px rgba(16,24,40,.06);
}
.bm-icon{ font-size:18px; line-height:1; margin-bottom:8px; }
.bm-count{
  position:absolute; top:10px; right:10px;
  font-size:12px; padding:2px 8px; border-radius:999px;
  background:#EAF2FF; color:#155DFC;
}
.bm-title{ font-weight:700; color:#0F172A; margin:4px 0 4px; }
.bm-type{ font-size:12px; color:#6B7280; }

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
}
.page-info {
  font-size: 14px;
  color: #555;
}

.thumb {
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.thumb:hover {
  transform: translateY(-2px);
  opacity: 0.9;
}

/* 반응형 */
@media (max-width: 900px){
  .grid-2{ grid-template-columns:1fr; }
  .thumb-row{ grid-template-columns:repeat(2,1fr); }
  .bm-grid{   grid-template-columns:repeat(2,1fr); }
}
@media (max-width: 600px){
  .calendar, .schedule{ min-height: 360px; }
  .thumb-row, .bm-grid{ grid-template-columns:1fr; }
}

.thumb-img-wrapper {
  position: relative;
  flex: 0 0 70%;
  overflow: hidden;
}
.thumb-info {
  flex: 1;
  padding: 10px 12px 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: #fff;
}
</style>
