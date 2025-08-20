<script setup lang="ts">
interface User {
  id: string
  email: string
  displayName?: string
}

interface Sound {
  id: string
  title: string
  description?: string
  tags?: string[]
  durationSeconds?: number
  bitrateKbps?: number
  blobUrl: string
  thumbnailBlobUrl?: string
  isPublic: boolean
  createdAt: string
}

const user = ref<User | null>(null)
const activeTab = ref<'upload' | 'browse'>('upload')
const sounds = ref<Sound[]>([])

// ページ読み込み時にユーザー情報を確認
onMounted(async () => {
  try {
    const response = await $fetch('/api/auth/me') as any
    if (response.success) {
      user.value = response.user
      await loadSounds()
    }
  } catch (error) {
    // ログインしていない場合は何もしない
    console.log('ユーザーはログインしていません')
  }
})

const handleAuthSuccess = async (userData: User) => {
  user.value = userData
  await loadSounds()
}

const handleLogout = () => {
  // Cookieを削除
  document.cookie = 'Authorization=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
  user.value = null
  sounds.value = []
  activeTab.value = 'upload'
}

const loadSounds = async () => {
  try {
    // 実際のAPIが実装されたら、ここで音源一覧を取得
    // 現在はダミーデータを使用
    sounds.value = []
  } catch (error) {
    console.error('音源の読み込みに失敗しました:', error)
  }
}

const handleSoundUploaded = async (sound: Sound) => {
  sounds.value.unshift(sound)
  activeTab.value = 'browse'
}
</script>

<template>
  <div class="container">
    <header class="header">
      <h1>🎵 Pathfinder - 音源共有アプリ</h1>
      <p>あなたの音源を世界と共有しましょう</p>
    </header>

    <main class="main">
      <!-- 未ログイン時は認証フォームを表示 -->
      <div v-if="!user" class="auth-section">
        <AuthForm @success="handleAuthSuccess" />
      </div>

      <!-- ログイン後は音源アップロードと再生を表示 -->
      <div v-else class="user-section">
        <div class="user-info">
          <h2>ようこそ、{{ user.displayName || user.email }}さん！</h2>
          <button @click="handleLogout" class="logout-btn">ログアウト</button>
        </div>

        <div class="content-tabs">
          <button 
            :class="{ active: activeTab === 'upload' }" 
            @click="activeTab = 'upload'"
            class="tab-btn"
          >
            音源アップロード
          </button>
          <button 
            :class="{ active: activeTab === 'browse' }" 
            @click="activeTab = 'browse'"
            class="tab-btn"
          >
            音源を聴く
          </button>
        </div>

        <div v-if="activeTab === 'upload'" class="tab-content">
          <SoundUpload @uploaded="handleSoundUploaded" />
        </div>

        <div v-else-if="activeTab === 'browse'" class="tab-content">
          <div v-if="sounds.length === 0" class="no-sounds">
            <p>まだ音源がアップロードされていません。</p>
            <p>最初の音源をアップロードしてみましょう！</p>
          </div>
          
          <div v-else class="sounds-list">
            <SoundPlayer 
              v-for="sound in sounds" 
              :key="sound.id" 
              :sound="sound" 
            />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.header {
  text-align: center;
  margin-bottom: 3rem;
  color: white;
}

.header h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.header p {
  font-size: 1.25rem;
  opacity: 0.9;
}

.main {
  max-width: 1200px;
  margin: 0 auto;
}

.auth-section {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.user-section {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
  backdrop-filter: blur(10px);
}

.user-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.user-info h2 {
  color: white;
  margin: 0;
}

.logout-btn {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.content-tabs {
  display: flex;
  margin-bottom: 2rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 0.25rem;
}

.tab-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
}

.tab-btn.active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.tab-btn:hover:not(.active) {
  background: rgba(255, 255, 255, 0.1);
}

.tab-content {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  min-height: 400px;
}

.no-sounds {
  text-align: center;
  color: #6b7280;
  padding: 4rem 2rem;
}

.no-sounds p {
  margin-bottom: 0.5rem;
}

.sounds-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }
  
  .header h1 {
    font-size: 2rem;
  }
  
  .user-info {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}
</style>
