<template>
  <div class="sound-player">
    <div class="sound-info">
      <h3>{{ sound.title }}</h3>
      <p v-if="sound.description" class="description">{{ sound.description }}</p>
      
      <div v-if="sound.tags && sound.tags.length > 0" class="tags">
        <span 
          v-for="tag in sound.tags" 
          :key="tag" 
          class="tag"
        >
          {{ tag }}
        </span>
      </div>

      <div class="metadata">
        <span v-if="sound.durationSeconds" class="duration">
          長さ: {{ formatDuration(sound.durationSeconds) }}
        </span>
        <span v-if="sound.bitrateKbps" class="bitrate">
          ビットレート: {{ sound.bitrateKbps }} kbps
        </span>
      </div>
    </div>

    <div class="player-controls">
      <audio
        ref="audioElement"
        :src="sound.blobUrl"
        controls
        class="audio-player"
        @loadedmetadata="onAudioLoaded"
        @timeupdate="onTimeUpdate"
        @ended="onAudioEnded"
      >
        お使いのブラウザは音声再生をサポートしていません。
      </audio>

      <div class="progress-info">
        <span v-if="currentTime > 0" class="current-time">
          {{ formatTime(currentTime) }}
        </span>
        <span v-if="duration > 0" class="total-duration">
          / {{ formatTime(duration) }}
        </span>
      </div>
    </div>

    <div class="actions">
      <button 
        @click="handleDownload" 
        class="download-btn"
        :disabled="downloading"
      >
        {{ downloading ? 'ダウンロード中...' : 'ダウンロード' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
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

const props = defineProps<{
  sound: Sound
}>()

const audioElement = ref<HTMLAudioElement>()
const currentTime = ref(0)
const duration = ref(0)
const downloading = ref(false)

const onAudioLoaded = () => {
  if (audioElement.value) {
    duration.value = audioElement.value.duration
  }
}

const onTimeUpdate = () => {
  if (audioElement.value) {
    currentTime.value = audioElement.value.currentTime
  }
}

const onAudioEnded = () => {
  currentTime.value = 0
}

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const handleDownload = async () => {
  try {
    downloading.value = true
    
    const response = await $fetch(`/api/sounds/${props.sound.id}/download`, {
      method: 'GET'
    })

    if (response.success) {
      // ダウンロードリンクを作成
      const link = document.createElement('a')
      link.href = response.downloadUrl
      link.download = response.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  } catch (error: any) {
    console.error('ダウンロードエラー:', error)
    alert('ダウンロードに失敗しました')
  } finally {
    downloading.value = false
  }
}
</script>

<style scoped>
.sound-player {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.sound-info {
  margin-bottom: 2rem;
}

.sound-info h3 {
  margin-bottom: 1rem;
  color: #1f2937;
  font-size: 1.5rem;
}

.description {
  margin-bottom: 1rem;
  color: #6b7280;
  line-height: 1.6;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tag {
  padding: 0.25rem 0.75rem;
  background: #e0f2fe;
  color: #0369a1;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.metadata {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.player-controls {
  margin-bottom: 2rem;
}

.audio-player {
  width: 100%;
  margin-bottom: 1rem;
}

.progress-info {
  text-align: center;
  font-size: 0.875rem;
  color: #6b7280;
}

.current-time,
.total-duration {
  font-family: monospace;
}

.actions {
  display: flex;
  justify-content: center;
}

.download-btn {
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.download-btn:hover:not(:disabled) {
  background: #2563eb;
}

.download-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}
</style>
