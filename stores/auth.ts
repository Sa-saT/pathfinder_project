import { defineStore } from 'pinia'

// $fetchの型定義
declare global {
  function $fetch<T = any>(request: string, options?: any): Promise<T>
}

interface User {
  id: string
  email: string
  displayName?: string
  createdAt?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => {
    // sessionStorageから初期状態を復元
    if (typeof window !== 'undefined') {
      const savedUser = sessionStorage.getItem('auth_user')
      const savedAuth = sessionStorage.getItem('auth_isAuthenticated')
      
      if (savedUser && savedAuth === 'true') {
        return {
          user: JSON.parse(savedUser),
          isAuthenticated: true,
          loading: false
        }
      }
    }
    
    return {
      user: null,
      isAuthenticated: false,
      loading: false
    }
  },

  getters: {
    currentUser: (state) => state.user,
    isLoggedIn: (state) => state.isAuthenticated
  },

  actions: {
    async login(email: string, password: string) {
      this.loading = true
      try {
        const response = await $fetch('/api/auth/login', {
          method: 'POST',
          body: { email, password }
        }) as any

        if (response.success) {
          this.user = response.user
          this.isAuthenticated = true
          
          // sessionStorageに保存
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('auth_user', JSON.stringify(response.user))
            sessionStorage.setItem('auth_isAuthenticated', 'true')
          }
          
          return { success: true, user: response.user }
        }
        return { success: false, error: 'Login failed' }
      } catch (error: any) {
        return { success: false, error: error.data?.message || 'Login failed' }
      } finally {
        this.loading = false
      }
    },

    async register(email: string, password: string, displayName?: string) {
      this.loading = true
      try {
        const response = await $fetch('/api/auth/register', {
          method: 'POST',
          body: { email, password, displayName }
        }) as any

        if (response.success) {
          this.user = response.user
          this.isAuthenticated = true
          
          // sessionStorageに保存
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('auth_user', JSON.stringify(response.user))
            sessionStorage.setItem('auth_isAuthenticated', 'true')
          }
          
          return { success: true, user: response.user }
        }
        return { success: false, error: 'Registration failed' }
      } catch (error: any) {
        return { success: false, error: error.data?.message || 'Registration failed' }
      } finally {
        this.loading = false
      }
    },

    async checkAuth() {
      try {
        const response = await $fetch('/api/auth/me') as any
        if (response.success) {
          this.user = response.user
          this.isAuthenticated = true
          
          // sessionStorageに保存
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('auth_user', JSON.stringify(response.user))
            sessionStorage.setItem('auth_isAuthenticated', 'true')
          }
          
          return true
        }
        return false
      } catch (error) {
        this.user = null
        this.isAuthenticated = false
        
        // sessionStorageから削除
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('auth_user')
          sessionStorage.removeItem('auth_isAuthenticated')
        }
        
        return false
      }
    },

    logout() {
      // Cookieを削除
      document.cookie = 'Authorization=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      this.user = null
      this.isAuthenticated = false
      
      // sessionStorageから削除
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('auth_user')
        sessionStorage.removeItem('auth_isAuthenticated')
      }
    }
  }
})
