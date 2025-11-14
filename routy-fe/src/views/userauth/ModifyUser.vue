<template>
  <div class="edit-container">
    <div class="edit-box">
      <!-- 제목 -->
      <div class="header-section">
        <div class="main-title">회원 정보 수정</div>
        <div class="sub-title">내 정보를 수정해보세요</div>
      </div>

      <!-- 입력 폼 -->
      <div class="form-section">
        <div class="input-group">
          <label>사용자 이름</label>
          <input 
            v-model="username" 
            type="text" 
            placeholder="이름을 입력하세요" 
          />
        </div>

        <div class="input-group">
          <label>나이</label>
          <input 
            v-model="age" 
            type="number" 
            placeholder="나이를 입력하세요" 
          />
        </div>

        <div class="input-group">
          <label>전화번호</label>
          <input 
            v-model="phone" 
            type="tel" 
            placeholder="010-1234-5678" 
          />
        </div>

        <div class="image-upload">
          <label>프로필 이미지</label>

          <div class="upload-wrapper">
            <div
              class="upload-box"
              :style="previewImage ? { backgroundImage: `url(${previewImage})` } : {}"
              @dragover.prevent
              @drop.prevent="handleDrop"
              @click="triggerFileInput"
            >
              <input
                type="file"
                ref="fileInput"
                accept="image/*"
                @change="handleFileChange"
                style="display: none"
              />

              <!-- 이미지 없을 때만 아이콘+문구 표시 -->
              <div v-if="!previewImage" class="upload-content">
                <div class="upload-icon">
                  <div class="tray-outline"></div>
                </div>
                <div class="upload-text">
                  <p>이미지를 드래그하거나 클릭해서 업로드하세요</p>
                  <span>JPG, PNG 파일 (최대 5MB)</span>
                </div>
              </div>
            </div>

            <button
              v-if="previewImage"
              class="remove-btn"
              @click.stop="removeImage"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- 버튼 -->
        <div class="button-group">
          <button class="cancel-btn" @click="handleCancel">취소하기</button>
          <button class="submit-btn" @click="handleSubmit" :disabled="isSubmitting">
            {{ isSubmitting ? '수정 중...' : '수정하기' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { modifyUserInfo } from "@/api/auth";
import { useRouter } from "vue-router";

const router = useRouter();

// 폼 데이터
const username = ref("");
const age = ref("");
const phone = ref("");

// 파일 관련
const fileInput = ref(null);
const previewImage = ref(null);
const selectedFile = ref(null);  // 실제 File 객체 저장

// 제출 상태
const isSubmitting = ref(false);

// 파일 선택창 열기
const triggerFileInput = () => {
  fileInput.value.click();
};

// 파일 선택 처리
const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file && file.size <= 5 * 1024 * 1024 && ["image/jpeg", "image/png"].includes(file.type)) {
    selectedFile.value = file;  // File 객체 저장
    
    const reader = new FileReader();
    reader.onload = () => {
      previewImage.value = reader.result;
    };
    reader.readAsDataURL(file);
  } else {
    alert("5MB 이하의 JPG 또는 PNG 이미지만 업로드 가능합니다.");
  }
};

// 드래그앤드롭 처리
const handleDrop = (e) => {
  const file = e.dataTransfer.files[0];
  if (file && file.size <= 5 * 1024 * 1024 && ["image/jpeg", "image/png"].includes(file.type)) {
    selectedFile.value = file;  // File 객체 저장
    
    const reader = new FileReader();
    reader.onload = () => {
      previewImage.value = reader.result;
    };
    reader.readAsDataURL(file);
  } else {
    alert("5MB 이하의 JPG 또는 PNG 이미지만 업로드 가능합니다.");
  }
};

// 이미지 제거
const removeImage = () => {
  previewImage.value = null;
  selectedFile.value = null;
  if (fileInput.value) {
    fileInput.value.value = ""; 
  }
};

// 취소 버튼
const handleCancel = () => {
  if (confirm("수정을 취소하시겠습니까?")) {
    router.push("/");  // 또는 이전 페이지로: router.back()
  }
};

// 수정하기 제출
const handleSubmit = async () => {
  console.log('🔵 [ModifyUser.vue] 수정하기 버튼 클릭');
  
  // 최소 하나의 필드는 입력되어야 함
  if (!username.value && !age.value && !phone.value && !selectedFile.value) {
    alert("수정할 정보를 입력해주세요.");
    return;
  }
  
  // 전화번호 유효성 검사 (입력된 경우에만)
  if (phone.value && !/^010-\d{4}-\d{4}$/.test(phone.value)) {
    alert("전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)");
    return;
  }
  
  try {
    isSubmitting.value = true;
    
    // 수정할 정보만 객체에 담기
    const userInfo = {};
    if (username.value.trim()) userInfo.username = username.value.trim();
    if (age.value) userInfo.age = parseInt(age.value);
    if (phone.value.trim()) userInfo.phone = phone.value.trim();
    
    console.log('🔵 [ModifyUser.vue] 전송할 데이터:', userInfo);
    console.log('🔵 [ModifyUser.vue] 전송할 파일:', selectedFile.value);
    
    // API 호출
    const response = await modifyUserInfo(
      Object.keys(userInfo).length > 0 ? userInfo : null,
      selectedFile.value
    );
    
    console.log('🟢 [ModifyUser.vue] 수정 성공:', response.data);
    alert('회원정보가 수정되었습니다.');
    
    // 성공 후 메인 페이지로 이동
    router.push("/");
    
  } catch (error) {
    console.error('❌ [ModifyUser.vue] 수정 실패:', error);
    
    if (error.response?.status === 401) {
      alert('로그인이 필요합니다.');
      router.push("/login");
    } else if (error.response?.data?.message) {
      alert(`수정 실패: ${error.response.data.message}`);
    } else {
      alert('회원정보 수정에 실패했습니다. 다시 시도해주세요.');
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.edit-container {
  width: 1522px;
  height: 1150px;
  position: relative;
  background: linear-gradient(149deg, #eff6ff 13%, white 50%, #f0fdf4 87%);
}

.edit-box {
  width: 480px;
  height: 957px;
  position: absolute;
  left: 521px;
  top: 126px;
}

.header-section {
  position: absolute;
  top: 48px;
  width: 480px;
  text-align: center;
}

.main-title {
  font-size: 32px;
  font-family: Inter, sans-serif;
  color: #101828;
  line-height: 40px;
}

.sub-title {
  margin-top: 8px;
  font-size: 16px;
  color: #4a5565;
}

.form-section {
  position: absolute;
  top: 152px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  color: #101828;
  font-size: 14px;
  font-family: Inter, sans-serif;
}

.input-group input {
  width: 480px;
  height: 56px;
  background: #f3f3f5;
  border: 0.73px solid #d1d5dc;
  border-radius: 12px;
  padding: 0 16px;
  font-size: 16px;
  color: #717182;
}

.image-upload label {
  color: #101828;
  font-size: 14px;
  margin-bottom: 8px;
  display: inline-block;
}

.upload-wrapper {
  position: relative;
  display: inline-block;
}

.upload-box {
  width: 510px;
  height: 200px;
  background: #f3f3f5;
  border-radius: 12px;
  border: 0.73px solid #d1d5dc;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transition: 0.3s;
  position: relative;
}

.upload-box:hover {
  background-color: #eef3ff;
}

.upload-content {
  text-align: center;
}

.upload-icon {
  width: 48px;
  height: 48px;
  background: white;
  border-radius: 50%;
  position: relative;
  margin: 0 auto 12px;
}

.tray-outline {
  width: 24px;
  height: 24px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: url("../../assets/images/icons/upload.svg") no-repeat center center;
  background-size: contain;
}

.upload-text p {
  color: #101828;
  font-size: 14px;
  margin: 0;
}

.upload-text span {
  font-size: 12px;
  color: #4a5565;
}

.button-group {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.cancel-btn,
.submit-btn {
  flex: 1;
  height: 52px;
  border-radius: 26px;
  font-size: 16px;
  font-family: Inter, sans-serif;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn {
  background: white;
  border: 0.73px solid #d1d5dc;
  color: #4a5565;
}

.cancel-btn:hover {
  background: #f9fafb;
}

.submit-btn {
  background: #155dfc;
  color: white;
  border: none;
}

.submit-btn:hover:not(:disabled) {
  background: #0d47d1;
}

.submit-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.remove-btn {
  position: absolute;
  top: -10px;
  right: -10px;
  background: #ffffff;
  border: 1px solid #d1d5dc;
  border-radius: 50%;
  width: 26px;
  height: 26px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  transition: all 0.2s ease;
  z-index: 10;
}

.remove-btn:hover {
  background: #f5f5f5;
  transform: scale(1.1);
}
</style>