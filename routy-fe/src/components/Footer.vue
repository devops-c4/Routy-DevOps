<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-left">
        <nav class="footer-nav">
          <router-link to="/about">서비스소개</router-link>
          <router-link to="/guide">이용안내</router-link>
          <router-link to="/terms">이용약관</router-link>
          <router-link to="/privacy">개인정보처리방침</router-link>
          <router-link to="/contact">문의하기</router-link>
        </nav>
      </div>

      <div>
        <p class="footer-copy">© 2025 Routy. All rights reserved. Team C4.</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  width: 100%;
  background: #fff;
  border-top: 1px solid #eee;
  padding: 12px 40px;
  display: flex;
  justify-content: center;
}

.footer-container {
  width: 100%;
  max-width: 1280px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.footer-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.footer-nav a,
.footer-nav router-link {
  color: #333;
  font-size: 0.95rem;
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-nav a:hover,
.footer-nav router-link:hover {
  color: #2563eb;
}

.footer-copy {
  color: #777;
  font-size: 0.85rem;
}
</style>
