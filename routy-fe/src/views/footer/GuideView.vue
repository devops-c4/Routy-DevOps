<!-- 이용안내 -->
<template>
  <section class="guide">
    <div class="guide-container">
      <h1>이용안내</h1>
      <p>
        이 페이지는 Routy를 처음 이용하는 분들이 서비스를 원활하게 이용하실 수 있도록
        이용 절차와 주의사항을 안내합니다.
      </p>

      <h2>1. 회원가입 및 로그인</h2>
      <ul>
        <li>Routy는 회원가입 후 이용하는 것을 기본으로 합니다.</li>
        <li>이메일과 비밀번호를 입력해 회원가입을 완료할 수 있습니다.</li>
        <li>회원가입 후 로그인하면 내 여행 일정이 계정에 저장되어 기기와 관계없이 다시 확인할 수 있습니다.</li>
      </ul>

      <h2>2. 여행 일정 만들기</h2>
      <ol>
        <li><strong>여행 지역 선택:</strong> 여행을 떠날 도시/지역을 선택합니다.</li>
        <li><strong>여행 기간 설정:</strong> 출발일과 종료일을 설정하면 일정이 일자별로 자동 분리됩니다.</li>
        <li><strong>장소 담기:</strong> 지도에서 맛집, 카페, 관광지 등 원하는 장소를 선택해 각 날짜에 담습니다.</li>
        <li><strong>순서 정리:</strong> 당일 이동 동선에 맞게 위아래로 순서를 변경할 수 있습니다.</li>
        <li><strong>저장:</strong> 완성된 일정은 저장하면 “내 일정”에서 다시 확인할 수 있습니다.</li>
      </ol>

      <h2>3. 일정 관리</h2>
      <ul>
        <li>저장된 일정은 언제든지 다시 열어 장소를 추가하거나 삭제할 수 있습니다.</li>
        <li>여행 전에는 장소가 바뀌는 일이 많기 때문에 Routy는 여러 번의 수정이 가능하도록 설계되어 있습니다.</li>
        <li>일부 일정은 공개 설정을 통해 다른 사용자에게도 보여줄 수 있도록 할 예정입니다.</li>
      </ul>

      <h2>4. 계정 및 데이터</h2>
      <ul>
        <li>계정에 저장된 일정은 해당 계정으로만 확인할 수 있습니다.</li>
        <li>로그아웃하거나 브라우저를 바꿔도 계정으로 로그인하면 내 일정이 그대로 표시됩니다.</li>
        <li>서비스 개선이나 테스트를 위해 데이터 구조가 변경되는 경우가 있으며, 이때 일부 테스트 계정의 데이터는 초기화될 수 있습니다.</li>
      </ul>

      <h2>5. 문의 및 장애 신고</h2>
      <p>
        서비스 이용 중 화면이 정상적으로 보이지 않거나, 일정 저장이 되지 않는 등 오류가 발생할 경우
        아래 메일로 문제 상황(화면 캡처, 사용 환경 등)을 알려주시면 확인 후 안내드리겠습니다.
      </p>
      <p>문의: <a href="#"></a></p>

      <h2>6. 유의사항</h2>
      <ul>
        <li>Routy는 여행 계획을 돕는 서비스로, 실제 영업시간/휴무일/현장 상황은 각 장소의 안내를 우선합니다.</li>
        <li>외부 지도/장소 API를 사용하는 경우 해당 제공처의 정책 변경에 따라 일부 기능이 일시적으로 제한될 수 있습니다.</li>
        <li>서비스는 순차적으로 기능이 추가되는 형태로 운영되며, 공지 없이 UI나 동작 방식이 변경될 수 있습니다.</li>
      </ul>
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
.guide {
  padding: 60px 20px 100px;
  display: flex;
  justify-content: center;
}

.guide-container {
  max-width: 900px;
  width: 100%;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(8px);
  border-radius: 20px;
  padding: 40px 50px 50px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

h1 {
  font-size: 2rem;
  color: #2563eb;
  text-align: center;
  margin-bottom: 20px;
  font-weight: 700;
}

p {
  line-height: 1.7;
  color: #333;
  margin-bottom: 14px;
}

h2 {
  margin-top: 32px;
  margin-bottom: 10px;
  color: #14532d;
  font-size: 1.25rem;
  border-left: 4px solid #22c55e;
  padding-left: 10px;
}

ul,
ol {
  margin-left: 20px;
  margin-bottom: 10px;
}

li {
  line-height: 1.6;
  margin-bottom: 6px;
  color: #444;
}

a {
  color: #2563eb;
  text-decoration: none;
}
a:hover {
  text-decoration: underline;
}
</style>