<!-- 이용약관 -->
 <template>
  <section class="terms">
    <div class="terms-container">
      <h1>이용약관</h1>
      <p>
        본 약관은 Routy(이하 “서비스”)의 이용과 관련하여 사용자(이하 “회원”)와
        Team C4(이하 “운영팀”) 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
      </p>

      <h2>1. 약관의 효력 및 변경</h2>
      <ul>
        <li>이 약관은 Routy 웹사이트에 게시함으로써 효력이 발생합니다.</li>
        <li>운영팀은 필요 시 관련 법령을 위반하지 않는 범위에서 약관을 변경할 수 있습니다.</li>
        <li>변경된 약관은 서비스 내 공지사항을 통해 사전 고지합니다.</li>
      </ul>

      <h2>2. 회원 가입 및 관리</h2>
      <ul>
        <li>회원은 이메일과 비밀번호를 통해 계정을 생성할 수 있습니다.</li>
        <li>회원은 등록 시 허위 정보를 기재해서는 안 되며, 본인의 정보를 최신 상태로 유지해야 합니다.</li>
        <li>회원이 본 약관을 위반한 경우, 운영팀은 서비스 이용을 제한하거나 계정을 삭제할 수 있습니다.</li>
      </ul>

      <h2>3. 서비스 이용</h2>
      <ul>
        <li>회원은 여행 일정 작성, 수정, 저장, 공유 등의 기능을 이용할 수 있습니다.</li>
        <li>운영팀은 안정적인 서비스 제공을 위해 일부 기능을 사전 공지 없이 수정·중단할 수 있습니다.</li>
        <li>서비스 이용 과정에서 발생하는 데이터 손실에 대해서는 고의 또는 중대한 과실이 없는 한 책임을 지지 않습니다.</li>
      </ul>

      <h2>4. 회원의 의무</h2>
      <ul>
        <li>회원은 관련 법령 및 본 약관을 준수해야 합니다.</li>
        <li>회원은 다음 행위를 해서는 안 됩니다:
          <ul>
            <li>타인의 정보 도용</li>
            <li>서비스의 정상적인 운영을 방해하는 행위</li>
            <li>허위 정보 게시, 불법 광고, 악성 코드 유포</li>
          </ul>
        </li>
      </ul>

      <h2>5. 저작권 및 콘텐츠 이용</h2>
      <ul>
        <li>회원이 작성한 일정, 리뷰 등의 콘텐츠에 대한 저작권은 회원 본인에게 있습니다.</li>
        <li>운영팀은 서비스 홍보 및 개선을 위해 비상업적 범위에서 이를 활용할 수 있습니다.</li>
      </ul>

      <h2>6. 개인정보 보호</h2>
      <p>
        운영팀은 개인정보보호법 등 관련 법령을 준수하며,
        개인정보의 수집·이용·보관에 대한 사항은 별도의
        <router-link to="/privacy">개인정보처리방침</router-link>에 따릅니다.
      </p>

      <h2>7. 면책 조항</h2>
      <ul>
        <li>운영팀은 천재지변, 서버 장애 등 불가항력으로 인한 서비스 중단에 대해 책임을 지지 않습니다.</li>
        <li>회원 간 또는 제3자와의 분쟁은 당사자 간에 해결하며, 운영팀은 개입하지 않습니다.</li>
      </ul>

      <h2>8. 준거법 및 관할</h2>
      <p>
        본 약관은 대한민국 법령에 따르며, 서비스 이용과 관련하여 발생하는 분쟁은
        운영팀의 소재지를 관할하는 법원을 제1심 관할법원으로 합니다.
      </p>

      <p class="closing">
        본 약관은 2025년 11월 5일부터 적용됩니다.
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
.terms {
  padding: 60px 20px 100px;
  display: flex;
  justify-content: center;
}

.terms-container {
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

h2 {
  margin-top: 32px;
  margin-bottom: 10px;
  color: #14532d;
  font-size: 1.25rem;
  border-left: 4px solid #22c55e;
  padding-left: 10px;
}

p, li {
  color: #333;
  line-height: 1.7;
  margin-bottom: 10px;
}

ul {
  margin-left: 20px;
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