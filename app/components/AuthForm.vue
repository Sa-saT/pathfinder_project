<template>
  <div class="auth-form">
    <div class="tabs">
      <button 
        :class="{ active: isLogin }" 
        @click="isLogin = true"
        class="tab-btn"
      >
        ログイン
      </button>
      <button 
        :class="{ active: !isLogin }" 
        @click="isLogin = false"
        class="tab-btn"
      >
        新規登録
      </button>
    </div>

    <form @submit.prevent="handleSubmit" class="form">
      <div class="form-group">
        <label for="email">メールアドレス</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          required
          class="input"
          placeholder="example@example.com"
        />
      </div>

      <div class="form-group">
        <label for="password">パスワード</label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          required
          class="input"
          placeholder="パスワードを入力"
        />
      </div>

      <div v-if="!isLogin" class="form-group">
        <label for="displayName">表示名（任意）</label>
        <input
          id="displayName"
          v-model="form.displayName"
          type="text"
          class="input"
          placeholder="表示名を入力"
        />
      </div>

      <button type="submit" class="submit-btn" :disabled="loading">
        {{ loading ? '処理中...' : (isLogin ? 'ログイン' : '新規登録') }}
      </button>
    </form>

    <div v-if="error" class="error">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
const isLogin = ref(true)
const loading = ref(false)
const error = ref('')

const form = reactive({
  email: '',
  password: '',
  displayName: ''
})

const emit = defineEmits<{
  success: [user: any]
}>()

const handleSubmit = async () => {
  try {
    loading.value = true
    error.value = ''

    const endpoint = isLogin.value ? '/api/auth/login' : '/api/auth/register'
    const payload = isLogin.value 
      ? { email: form.email, password: form.password }
      : { email: form.email, password: form.password, displayName: form.displayName }

    const response = await $fetch(endpoint, {
      method: 'POST',
      body: payload
    })

    if (response.success) {
      emit('success', response.user)
      // フォームをリセット
      form.email = ''
      form.password = ''
      form.displayName = ''
    }
  } catch (err: any) {
    error.value = err.data?.message || 'エラーが発生しました'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.tabs {
  display: flex;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e5e7eb;
}

.tab-btn {
  flex: 1;
  padding: 1rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: #6b7280;
  transition: all 0.2s;
}

.tab-btn.active {
  color: #3b82f6;
  border-bottom: 2px solid #3b82f6;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.submit-btn {
  width: 100%;
  padding: 0.75rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: #2563eb;
}

.submit-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.error {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: 6px;
  text-align: center;
}
</style>
