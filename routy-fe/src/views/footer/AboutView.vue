<!-- 서비스소개 -->
<template>
  <section class="about">
    <div class="about-container">
      <h1>Routy 서비스 소개</h1>
      <p>
        Routy는 국내 여행을 준비하는 사용자가 여행 지역을 고르고, 가고 싶은 장소를 모아서,
        보기 좋은 일정으로 정리할 수 있도록 도와주는 여행 일정 관리 서비스입니다.
        “어디를 먼저 가야 하지?”, “하루에 몇 군데 넣어야 하지?”, “이거 지도에서 보면 어떤 동선이지?”
        같은 고민을 한 화면에서 해결할 수 있도록 설계되었습니다.
      </p>

      <h2>왜 Routy인가요?</h2>
      <p>
        대부분의 여행 일정은 메모앱, 지도앱, 블로그 스크랩, 캘린더 등 여러 도구에 흩어져 있습니다.
        Routy는 이 과정을 한 곳으로 모아 여행 계획 → 장소 선택 → 일정 구성 → 다시 수정까지
        한 번에 끝낼 수 있게 하는 것을 목표로 합니다.
      </p>

      <h2>Routy가 제공하는 것</h2>

      <div class="feature">
        <h3>1) 지도 기반 일정 구성</h3>
        <p>
          여행 지역을 선택하면 해당 지역의 장소를 지도에서 확인하면서 일정에 담을 수 있습니다.
          지도로 보기 때문에 실제 이동 동선이 어떤지 쉽게 파악할 수 있습니다.
        </p>
      </div>

      <div class="feature">
        <h3>2) 날짜별 여행 카드</h3>
        <p>
          여행 기간이 2박 3일이라면 1일차, 2일차, 3일차로 자동으로 일자 구간이 만들어집니다.
          사용자는 각 날짜 카드 안에 방문할 장소를 순서대로 담기만 하면 됩니다.
        </p>
      </div>

      <div class="feature">
        <h3>3) 선호 테마 반영</h3>
        <p>
          맛집 위주, 카페 위주, 관광지 위주 여행 스타일에 맞춰 일정을 구성할 수 있도록
          태그 기반 구성이 가능하도록 설계되어 있습니다.
        </p>
      </div>

      <div class="feature">
        <h3>4) 일정 보관 및 재사용</h3>
        <p>
          한 번 만든 일정은 ‘내 일정’에서 다시 열람하고 수정할 수 있습니다.
          지난 여행 일정을 복사해서 다음 여행을 준비할 수도 있습니다.
        </p>
      </div>

      <h2>서비스 운영 정보</h2>
      <ul>
        <li>서비스명: Routy</li>
        <li>운영팀: Team C4</li>
        <li>서비스 목적: 국내 여행 일정 구성 편의 제공 및 일정 공유 기능 제공</li>
        <li>서비스 형태: 웹 기반 서비스</li>
      </ul>

      <p class="closing">
        Routy는 여행을 ‘기록’하는 것보다 ‘준비’하는 과정이 더 즐겁도록 만드는 데 집중하고 있습니다.
        앞으로도 장소 추천, 일정 공유, 동행 모집 등 여행과 어울리는 기능을 순차적으로 확장해 나갈 예정입니다.
      </p>
    </div>
  </section>
</template>

<style>
body {
  background: linear-gradient(135deg, #eff6ff 0%, white 50%, #f0fdf4 100%);
  background-attachment: fixed;
  background-repeat: no-repeat;
  background-size: cover;
}
</style>

<style scoped>
.about {
  padding: 60px 20px 100px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.about-container {
  max-width: 900px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  border-radius: 20px;
  padding: 40px 60px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

h1 {
  font-size: 2rem;
  color: #2563eb;
  text-align: center;
  margin-bottom: 24px;
  font-weight: 700;
}

h2 {
  margin-top: 36px;
  color: #14532d;
  font-size: 1.4rem;
  border-left: 4px solid #22c55e;
  padding-left: 10px;
}

h3 {
  margin-top: 20px;
  color: #1e3a8a;
  font-size: 1.1rem;
}

p, li {
  line-height: 1.8;
  color: #333;
  font-size: 1rem;
}

ul {
  margin-top: 10px;
  padding-left: 24px;
}

li {
  margin-bottom: 6px;
}

.closing {
  margin-top: 40px;
  font-weight: 500;
  color: #065f46;
  text-align: center;
}
</style>
