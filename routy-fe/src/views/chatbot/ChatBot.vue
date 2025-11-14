<template>
  <div class="chat-page">
    <div class="chat-header">
      <h1>Rooting</h1>
      <div class="float-wrapper">
      <img src="../../assets/images/chatbot/chatbot2.png" alt="chatbot" />
      </div>
    </div>

    <div class="chat-box" ref="chatBox">
      <div v-for="(m, i) in messages" :key="i" :class="['msg', m.role]">
        <p>{{ m.text }}</p>
      </div>
    </div>

    <div class="suggestions">
      <button 
        v-for="(q, i) in suggestions" 
        :key="i" 
        class="suggestion-btn"
        @click="handleSuggestion(q)"
      >
        {{ q }}
      </button>
    </div>

    <div class="sub-suggestions" v-if="subSuggestions.length > 0">
      <button
        v-for="(s, i) in subSuggestions"
        :key="i"
        class="sub-btn"
        @click="handleSubSuggestion(s)"
      >
        {{ s }}
      </button>
    </div>

    <div class="input-area">
      <input
        v-model="userInput"
        @keyup.enter="sendMessage"
        placeholder="메시지를 입력하세요..."
      />
      <button @click="sendMessage">보내기</button>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'
import apiClient from '@/utils/axios'

const chatBox = ref(null)
const userInput = ref('')
const messages = ref([
  { role: 'bot', text: '안녕하세요! 무엇을 도와드릴까요?' }
])

//메시지 추가 시 자동 스크롤
watch(messages, async () => {
  await nextTick()
  if (chatBox.value) {
    chatBox.value.scrollTop = chatBox.value.scrollHeight
  }
}, { deep: true })

const suggestions = ref([
  "추천해줄 수 있는 국내 여행지가 있니?",
  "이번주 날씨 어때?",
  "국내 여행 노하우나 팁이 있니?",
  "요즘 인기있는 국내 관광지는 어디니?",
  "여행 초보가 갈만한 국내 관광지는 어디가 있니?",
  "여행 테마별로 국내에서 여행지 추천해줄 수 있니?"
])

const subSuggestions = ref([])

const handleSuggestion = (text) => {
  if (text.includes("국내 여행지")) {
    messages.value.push({ role: 'user', text })
    messages.value.push({ role: 'bot', text: '어떤 지역을 원하시나요?' })
    subSuggestions.value = ["서울", "부산", "제주", "강릉", "경주", "여수", "전주", "속초", "대구", "인천", "대전", "광주"]
  } else if (text.includes("이번주 날씨")) {
    messages.value.push({ role: 'user', text })
    messages.value.push({ role: 'bot', text: '무슨 요일 날씨를 알고 싶으신가요?' })
    subSuggestions.value = ["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"]
  } else if (text.includes("테마")) {
    messages.value.push({ role: 'user', text })
    messages.value.push({ role: 'bot', text: '선호하는 여행스타일이 있나요?' })
    subSuggestions.value = ["식도락", "액티비티", "힐링", "캠핑", "레저", "가족", "우정"]
  } else {
    subSuggestions.value = []
    userInput.value = text
    sendMessage()
  }
}

const handleSubSuggestion = (v) => {
  if(["서울","부산","제주","강릉","경주","여수","전주","속초","대구","인천","대전","광주"].some(p => v.includes(p))){
    subSuggestions.value = []
    const text = `${v} 여행지 추천해줘`
    userInput.value = text
    sendMessage()
  } else if(["월","화","수","목","금","토","일"].some(p => v.includes(p))){
    subSuggestions.value = [] 
    const text = `이번주 ${v} 날씨 좀 알려줘`
    userInput.value = text
    sendMessage()
  } else if(["식도락","액티비티","힐링","캠핑","레저","가족","우정"].some(p => v.includes(p))){
    subSuggestions.value = [] 
    const text = `${v} 여행지 국내에서 좀 알려줘`
    userInput.value = text
    sendMessage()
  }
}

const sendMessage = async () => {
  const text = userInput.value.trim()
  if (!text) return

  messages.value.push({ role: 'user', text })
  userInput.value = ''

  try {
    const res = await apiClient.post('/api/chatbot', { message: text })
    const reply = res.data.reply
    messages.value.push({ role: 'bot', text: reply })
  } catch (err) {
    console.error(err)
    messages.value.push({ role: 'bot', text: '서버 오류가 발생했어요 😢' })
  }
}
</script>

<style scoped>
.chat-page {
  max-width: 500px;
  margin: 40px auto;
  font-family: "Segoe UI", sans-serif;
  background: #f5f8fa;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.1);
}

.chat-box {
  background: white;
  border-radius: 10px;
  padding: 10px;
  height: 400px;
  overflow-y: auto;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
}

.msg {
  display: inline-block; 
  padding: 4px 8px; 
  border-radius: 14px;
  margin: 4px 0; 
  max-width: 80%; 
  word-wrap: break-word;
  white-space: pre-wrap; 
  line-height: 1.2; 
  font-size: 14px; 
}

.msg.user {
  background: #0078ff;
  color: white;
  align-self: flex-end;
  text-align: right;
  margin-left: auto;
}

.msg.bot {
  background: #e1e1e1;
  color: black;
  text-align: left;
  margin-right: auto;
}

p {
  margin-top: 2px;
  margin-bottom: 2px;
}

.input-area {
  display: flex;
  gap: 8px;
}

input {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

button {
  background: #0078ff;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  cursor: pointer;
}

.suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.suggestion-btn {
  background: #f0f4ff;
  color: #0078ff;
  border: 1px solid #0078ff;
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.suggestion-btn:hover {
  background: #0078ff;
  color: white;
}

.sub-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.sub-btn {
  background: #fff6e6;
  color: #e67e22;
  border: 1px solid #e67e22;
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.sub-btn:hover {
  background: #e67e22;
  color: white;
}

.chat-header {
  display: flex;
  align-items: center; /* 세로 가운데 정렬 */
  gap: 10px; /* 텍스트와 이미지 간 간격 */
  margin-bottom: 10px;
}

.chat-header img {
  width: 100px; /* 이미지 크기 조절 */
  height: 100px;
}

.float-wrapper {
  display: inline-block;
  animation: floatUpDown 2.2s ease-in-out infinite alternate;
}

/* 위아래 부드럽게 움직임 */
@keyframes floatUpDown {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-12px); /* 위로 조금 이동 */
  }
}

</style>