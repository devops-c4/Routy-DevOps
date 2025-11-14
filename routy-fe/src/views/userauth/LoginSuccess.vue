<script setup>
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

const token = route.query.token;
if (token) {
  sessionStorage.setItem("token", token);
  router.push("/"); // 메인 페이지로 이동
}
</script>