<template>
  <div class="sound-upload">
    <h3>音源をアップロード</h3>
    
    <!-- 環境選択タブ -->
    <div class="environment-tabs">
      <button 
        :class="{ active: useLocalStorage }" 
        @click="useLocalStorage = true"
        class="env-tab-btn"
      >
        ローカル開発
      </button>
      <button 
        :class="{ active: !useLocalStorage }" 
        @click="useLocalStorage = false"
        class="env-tab-btn"
      >
        Vercel Blob
      </button>
    </div>
    
    <form @submit.prevent="handleUpload" class="upload-form">
      <div class="form-group">
        <label for="title">タイトル *</label>
        <input
          id="title"
          v-model="form.title"
          type="text"
          required
          class="input"
          placeholder="音源のタイトルを入力"
        />
      </div>

      <div class="form-group">
        <label for="description">説明</label>
        <textarea
          id="description"
          v-model="form.description"
          class="textarea"
          placeholder="音源の説明を入力"
          rows="3"
        ></textarea>
      </div>

      <div class="form-group">
        <label for="tags">タグ（カンマ区切り）</label>
        <input
          id="tags"
          v-model="form.tags"
          type="text"
          class="input"
          placeholder="タグ1, タグ2, タグ3"
        />
      </div>

      <div class="form-group">
        <label for="audioFile">音源ファイル *</label>
        <input
          id="audioFile"
          ref="fileInput"
          type="file"
          accept="audio/*"
          required
          class="file-input"
          @change="handleFileSelect"
        />
        <div v-if="selectedFile" class="file-info">
          選択されたファイル: {{ selectedFile.name }}
          <br>
          <small>サイズ: {{ formatFileSize(selectedFile.size) }}</small>
        </div>
      </div>

      <div class="form-group">
        <label>
          <input
            v-model="form.isPublic"
            type="checkbox"
            class="checkbox"
          />
          公開する
        </label>
      </div>

      <button type="submit" class="upload-btn" :disabled="uploading">
        {{ uploading ? 'アップロード中...' : 'アップロード' }}
      </button>
    </form>

    <div v-if="error" class="error">
      {{ error }}
    </div>

    <div v-if="success" class="success">
      音源のアップロードが完了しました！
    </div>

    <!-- 環境情報 -->
    <div class="environment-info">
      <p><strong>現在の環境:</strong> {{ useLocalStorage ? 'ローカル開発' : 'Vercel Blob' }}</p>
      <p v-if="useLocalStorage" class="local-info">
        📁 ファイルは <code>storage/uploads/</code> に保存されます
      </p>
      <p v-else class="blob-info">
        ☁️ ファイルは Vercel Blob に保存されます
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const fileInput = ref<HTMLInputElement>()
const selectedFile = ref<File | null>(null)
const uploading = ref(false)
const error = ref('')
const success = ref('')
const useLocalStorage = ref(true) // デフォルトでローカル開発

const form = reactive({
  title: '',
  description: '',
  tags: '',
  isPublic: true
})

const emit = defineEmits<{
  uploaded: [sound: any]
}>()

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0]
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const handleUpload = async () => {
  if (!selectedFile.value) {
    error.value = 'ファイルを選択してください'
    return
  }

  try {
    uploading.value = true
    error.value = ''
    success.value = ''

    if (useLocalStorage.value) {
      // ローカル開発環境用のアップロード
      await handleLocalUpload()
    } else {
      // Vercel Blob用のアップロード
      await handleBlobUpload()
    }
  } catch (err: any) {
    error.value = err.data?.message || 'アップロードに失敗しました'
  } finally {
    uploading.value = false
  }
}

const handleLocalUpload = async () => {
  // FormDataを作成
  const formData = new FormData()
  formData.append('title', form.title)
  formData.append('description', form.description)
  formData.append('tags', form.tags)
  formData.append('audioFile', selectedFile.value!)
  formData.append('isPublic', form.isPublic.toString())

  const response = await $fetch('/api/sounds/upload-local', {
    method: 'POST',
    body: formData
  }) as any

  if (response.success) {
    success.value = '音源のアップロードが完了しました！'
    emit('uploaded', response.sound)
    resetForm()
  }
}

const handleBlobUpload = async () => {
  // 1. アップロードURLを取得
  const uploadUrlResponse = await $fetch('/api/sounds/upload-url', {
    method: 'POST',
    body: {
      filename: selectedFile.value!.name,
      contentType: selectedFile.value!.type
    }
  }) as any

  if (!uploadUrlResponse.success) {
    throw new Error('アップロードURLの取得に失敗しました')
  }

  // 2. ファイルをVercel Blobにアップロード
  await fetch(uploadUrlResponse.uploadUrl, {
    method: 'PUT',
    body: selectedFile.value
  })

  // 3. メタデータを保存
  const tags = form.tags ? form.tags.split(',').map(tag => tag.trim()) : []
  
  const metadataResponse = await $fetch('/api/sounds/metadata', {
    method: 'POST',
    body: {
      title: form.title,
      description: form.description,
      tags,
      blobUrl: uploadUrlResponse.url,
      isPublic: form.isPublic
    }
  }) as any

  if (metadataResponse.success) {
    success.value = '音源のアップロードが完了しました！'
    emit('uploaded', metadataResponse.sound)
    resetForm()
  }
}

const resetForm = () => {
  form.title = ''
  form.description = ''
  form.tags = ''
  form.isPublic = true
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>

<style scoped>
.sound-upload {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.sound-upload h3 {
  margin-bottom: 2rem;
  color: #1f2937;
  text-align: center;
}

.environment-tabs {
  display: flex;
  margin-bottom: 2rem;
  background: #f3f4f6;
  border-radius: 8px;
  padding: 0.25rem;
}

.env-tab-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.env-tab-btn.active {
  background: #3b82f6;
  color: white;
}

.env-tab-btn:hover:not(.active) {
  background: #e5e7eb;
}

.upload-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #374151;
}

.input,
.textarea {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.input:focus,
.textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.textarea {
  resize: vertical;
  min-height: 80px;
}

.file-input {
  padding: 0.5rem;
  border: 2px dashed #d1d5db;
  border-radius: 6px;
  background: #f9fafb;
  cursor: pointer;
  transition: border-color 0.2s;
}

.file-input:hover {
  border-color: #3b82f6;
}

.file-info {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #f0f9ff;
  color: #0369a1;
  border-radius: 4px;
  font-size: 0.875rem;
}

.checkbox {
  margin-right: 0.5rem;
}

.upload-btn {
  padding: 0.75rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.upload-btn:hover:not(:disabled) {
  background: #059669;
}

.upload-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.error {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: 6px;
  text-align: center;
}

.success {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
  border-radius: 6px;
  text-align: center;
}

.environment-info {
  padding: 1rem;
  background: #f8fafc;
  border-radius: 6px;
  border-left: 4px solid #3b82f6;
}

.environment-info p {
  margin: 0.5rem 0;
  font-size: 0.875rem;
  color: #374151;
}

.environment-info code {
  background: #e5e7eb;
  padding: 0.125rem 0.25rem;
  border-radius: 4px;
  font-family: monospace;
}

.local-info {
  color: #059669;
}

.blob-info {
  color: #7c3aed;
}
</style>
