<!-- 문의하기 -->
 <template>
  <section class="contact">
    <div class="contact-container">
      <h1>문의하기</h1>
      <p>
        Routy 서비스 이용 중 불편하신 점이나 개선이 필요하다고 생각되는 부분이 있다면
        아래 연락처로 알려주세요. 서비스 품질 향상을 위해 모든 의견을 확인하고 있습니다.
      </p>

      <h2>1. 문의 가능 내용</h2>
      <ul>
        <li>여행 일정 생성/저장/수정이 되지 않음</li>
        <li>지도나 장소 정보가 표시되지 않음</li>
        <li>특정 브라우저/기기에서 화면이 깨지는 현상</li>
        <li>기능 추가 요청 또는 UI 개선 제안</li>
        <li>계정 관련 문의(로그인 불가, 비밀번호 재설정 등)</li>
      </ul>

      <h2>2. 연락처</h2>
      <p>
        이메일: 
        <a href="#"></a><br />
        가능한 경우 아래 정보를 함께 보내주시면 더 빠르게 확인할 수 있습니다.
      </p>
      <ul>
        <li>사용 중이던 화면 캡처</li>
        <li>접속 기기/브라우저 종류</li>
        <li>발생 일시</li>
        <li>어떤 동작을 했을 때 문제가 발생했는지</li>
      </ul>

      <h2>3. GitHub를 통한 제보</h2>
      <p>
        개발 관련 이슈는 GitHub Issue로 등록하셔도 됩니다.<br />
        동일한 문제가 있는지 확인 후 등록해 주세요.
      </p>
      <p>
        GitHub: 
        <a
          href="https://github.com/devops-c4"
          target="_blank"
          rel="noreferrer"
        >
          https://github.com/devops-c4
        </a>
      </p>

      <h2>4. 응답 안내</h2>
      <ul>
        <li>운영팀: Team C4</li>
        <li>확인 시간: 평일 기준 순차 확인</li>
        <li>교육/포트폴리오용 서비스 특성상 실시간 응답은 어려울 수 있습니다.</li>
      </ul>

      <p class="closing">
        Routy는 사용자 피드백을 기반으로 계속 개선되고 있습니다.<br />
        작은 의견도 서비스에 큰 도움이 됩니다.
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
.contact {
  padding: 60px 20px 100px;
  display: flex;
  justify-content: center;
}

.contact-container {
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

ul {
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

.closing {
  margin-top: 40px;
  text-align: center;
  font-weight: 500;
  color: #065f46;
}
</style>