<!-- 개인정보 처리방침 -->
 <template>
  <section class="privacy">
    <div class="privacy-container">
      <h1>개인정보처리방침</h1>
      <p>
        Routy(이하 “서비스”)는 이용자의 개인정보를 중요하게 생각하며,
        개인정보 보호와 관련된 대한민국의 법령을 준수합니다.
        본 개인정보처리방침은 서비스가 어떤 정보를 수집하고, 어떤 목적으로 이용하며,
        어떻게 보호하는지에 대해 설명합니다.
      </p>

      <h2>1. 수집하는 개인정보 항목</h2>
      <p>서비스는 아래와 같은 개인정보를 수집할 수 있습니다.</p>
      <ul>
        <li><strong>회원가입 시:</strong> 이메일, 비밀번호, 닉네임</li>
        <li><strong>서비스 이용 시:</strong> 사용자가 생성한 여행 일정 정보(여행 제목, 기간, 담긴 장소 등)</li>
        <li><strong>자동으로 생성되는 정보:</strong> 접속 일시, 접속 IP, 기기 정보, 이용 기록 등</li>
      </ul>

      <h2>2. 개인정보의 수집 및 이용 목적</h2>
      <ul>
        <li>회원 식별 및 서비스 이용을 위한 본인 확인</li>
        <li>여행 일정 생성, 저장, 조회 등 서비스 핵심 기능 제공</li>
        <li>서비스 개선을 위한 이용 패턴 분석</li>
        <li>이용 문의 대응 및 공지사항 전달</li>
      </ul>

      <h2>3. 개인정보의 보유 및 이용 기간</h2>
      <ul>
        <li>원칙적으로 회원탈퇴 시 수집된 개인정보는 즉시 파기합니다.</li>
        <li>다만 서비스 운영상 일정 기간 보관이 필요한 정보는 내부 방침에 따라 일정 기간 보관 후 파기할 수 있습니다.</li>
        <li>관계 법령에서 일정 기간 정보 보관을 요구하는 경우 해당 법령에서 정한 기간 동안 보관합니다.</li>
      </ul>

      <h2>4. 개인정보의 제3자 제공</h2>
      <p>
        서비스는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다.
        다만 이용자가 사전에 동의했거나 법령에 따라 요구되는 경우 예외로 제공할 수 있습니다.
      </p>

      <h2>5. 개인정보의 처리 위탁</h2>
      <p>
        현재 서비스는 개인정보 처리를 외부에 위탁하고 있지 않습니다.
        향후 위탁이 필요한 경우 위탁받는 자와 위탁하는 업무 내용을 서비스 내에 공지하겠습니다.
      </p>

      <h2>6. 이용자의 권리</h2>
      <ul>
        <li>이용자는 언제든지 자신의 개인정보를 조회하거나 수정할 수 있습니다.</li>
        <li>회원탈퇴를 통해 개인정보 삭제를 요청할 수 있습니다.</li>
        <li>개인정보와 관련된 문의는 아래 연락처로 요청하실 수 있습니다.</li>
      </ul>

      <h2>7. 개인정보의 안전성 확보 조치</h2>
      <p>
        서비스는 개인정보를 안전하게 관리하기 위해 비밀번호 암호화, 접근 권한 통제 등
        합리적인 보안 조치를 적용하기 위해 노력합니다.
      </p>

      <h2>8. 만 14세 미만 아동의 개인정보</h2>
      <p>
        서비스는 만 14세 미만 아동을 대상으로 하지 않으며, 만 14세 미만 아동의 회원가입을 받지 않습니다.
      </p>

      <h2>9. 개인정보처리방침의 변경</h2>
      <p>
        본 방침은 법령의 개정이나 서비스 정책의 변경에 따라 달라질 수 있습니다.
        중요한 변경 사항이 있는 경우 서비스 내 공지사항을 통해 안내드립니다.
      </p>

      <h2>10. 문의처</h2>
      <p>
        개인정보 보호와 관련된 문의, 열람·정정·삭제 요청은 아래로 연락해 주세요.<br />
        이메일: <a href="#"></a>
      </p>

      <p class="effective-date">시행일자: 2025-11-05</p>
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
.privacy {
  padding: 60px 20px 100px;
  display: flex;
  justify-content: center;
}

.privacy-container {
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

p {
  line-height: 1.7;
  color: #333;
  margin-bottom: 14px;
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

.effective-date {
  margin-top: 30px;
  text-align: right;
  color: #555;
  font-size: 0.9rem;
}
</style>