// composables/useAuth.ts
import { useAuthStore } from '~/stores/auth'
import { navigateTo } from 'nuxt/app'

export const useAuth = () => {
  const authStore = useAuthStore()
  const router = useRouter()
  const API_BASE = 'http://127.0.0.1:8000'
  /**
   * ログイン処理＋ユーザー取得＋ロール別遷移
   */
  const loginAndRedirect = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      await authStore.login(email, password)
      await authStore.fetchUser()

      const user = authStore.user
      if (!user) {
        return { success: false, message: 'ユーザー情報が取得できませんでした。' }
      }

      // ユーザーかつアクティベート未済みなら注意
      if (user.account_type === 'user' && !user.is_activated) {
        authStore.logout()
        return { success: false, message: 'アクティベート後に入力してください。' }
      }

      // ロールに応じた遷移
      if (user.account_type === 'user') {
        navigateTo('/user/dashboard')
      } else if (user.account_type === 'creator') {
        navigateTo('/creator/dashboard')
      } else if (user.account_type === 'admin') {
        navigateTo('/admin/dashboard')
      } else {
        return { success: false, message: '不明なアカウント種別です。' }
      }

      return { success: true }
    } catch (err) {
      return { success: false, message: 'ログインに失敗しました。メールまたはパスワードが誤っている可能性があります。' }
    }
  }

  const deactivateDevice = async () => {
    const uuid = localStorage.getItem('client_uuid')
    if (!uuid) throw new Error('UUIDが見つかりません')

    try {
      await $fetch(`${API_BASE}/api/deactivate/`, {
        method: 'POST',
        body: { uuid },
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      })
      authStore.logout()
      return true
    } catch (e) {
      console.error('ディアクティベートに失敗しました', e)
      throw new Error('ディアクティベートに失敗しました')
    }
  }

  return {
    authStore,
    loginAndRedirect,
    deactivateDevice,
  }
}