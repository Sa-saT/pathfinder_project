import { defineStore } from 'pinia'

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
  author?: {
    email: string
    displayName?: string
  }
}

interface SoundsState {
  sounds: Sound[]
  loading: boolean
  error: string | null
}

export const useSoundsStore = defineStore('sounds', {
  state: (): SoundsState => {
    // sessionStorageから初期状態を復元
    if (typeof window !== 'undefined') {
      const savedSounds = sessionStorage.getItem('sounds_list')
      if (savedSounds) {
        try {
          return {
            sounds: JSON.parse(savedSounds),
            loading: false,
            error: null
          }
        } catch (e) {
          console.warn('Failed to parse saved sounds from sessionStorage')
        }
      }
    }
    
    return {
      sounds: [],
      loading: false,
      error: null
    }
  },

  getters: {
    publicSounds: (state) => state.sounds.filter(sound => sound.isPublic),
    soundsByTag: (state) => (tag: string) => 
      state.sounds.filter(sound => sound.tags?.includes(tag))
  },

  actions: {
    async fetchSounds() {
      this.loading = true
      this.error = null
      try {
        const response = await $fetch('/api/sounds/list') as any
        if (response.success) {
          this.sounds = response.sounds
          
          // sessionStorageに保存
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('sounds_list', JSON.stringify(response.sounds))
          }
        }
      } catch (error: any) {
        this.error = error.data?.message || 'Failed to fetch sounds'
        console.error('Error fetching sounds:', error)
      } finally {
        this.loading = false
      }
    },

    async uploadSound(soundData: FormData) {
      this.loading = true
      this.error = null
      try {
        const response = await $fetch('/api/sounds/upload-local', {
          method: 'POST',
          body: soundData
        }) as any

        if (response.success) {
          // 新しくアップロードされた音源を一覧の先頭に追加
          this.sounds.unshift(response.sound)
          return { success: true, sound: response.sound }
        }
        return { success: false, error: 'Upload failed' }
      } catch (error: any) {
        this.error = error.data?.message || 'Upload failed'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    addSound(sound: Sound) {
      this.sounds.unshift(sound)
    },

    removeSound(soundId: string) {
      const index = this.sounds.findIndex(sound => sound.id === soundId)
      if (index !== -1) {
        this.sounds.splice(index, 1)
      }
    },

    clearError() {
      this.error = null
    }
  }
})
